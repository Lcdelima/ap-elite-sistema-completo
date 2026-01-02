"""Aegis - API Principal de Ingestão de Evidências"""
from __future__ import annotations

import hashlib
import uuid
import os
import asyncio
from datetime import datetime, timezone
from typing import Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.db import engine, get_db
from app.models import (
    Base,
    Case,
    CaseStatus,
    CustodyAction,
    CustodyEvent,
    Evidence,
    EvidenceStatus,
    EvidenceType,
    JudicialOrder,
    AuditLog,
    Target,
)
from app.schemas import CaseCreate, CaseOut, EvidenceOut, JudicialOrderOut, TargetCreate, TargetOut
from app.security import get_actor_id
from app.storage import build_evidence_key, build_order_key, get_storage

load_dotenv()

app = FastAPI(title="Aegis - Interceptação Legal & Evidências", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    print("✅ Aegis: Banco de dados inicializado")

def _now_utc() -> datetime:
    return datetime.now(timezone.utc)

def _sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def _log_audit(
    *,
    db: Session,
    request: Request,
    actor_id: str,
    action: str,
    entity_type: str,
    entity_id: str,
    details: dict,
) -> None:
    db.add(
        AuditLog(
            actor_id=actor_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            details=details,
        )
    )

def _ensure_case_active(db: Session, case_id: uuid.UUID) -> Case:
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Caso não encontrado.")
    if case.status != CaseStatus.ACTIVE:
        raise HTTPException(status_code=409, detail=f"Caso não está ativo (status={case.status}).")
    return case

def _get_active_order_for_case(db: Session, case_id: uuid.UUID, at: datetime) -> JudicialOrder:
    stmt = (
        select(JudicialOrder)
        .where(JudicialOrder.case_id == case_id)
        .where(JudicialOrder.valid_from <= at)
        .where(JudicialOrder.valid_until >= at)
        .order_by(JudicialOrder.valid_until.desc())
        .limit(1)
    )
    order = db.execute(stmt).scalars().first()
    if not order:
        raise HTTPException(status_code=409, detail="Não há ordem judicial vigente para este caso no momento.")
    return order

def _append_custody_event(
    *,
    db: Session,
    evidence: Evidence,
    actor_id: str,
    action: CustodyAction,
    metadata: dict,
) -> CustodyEvent:
    last_evt = (
        db.execute(
            select(CustodyEvent)
            .where(CustodyEvent.evidence_id == evidence.id)
            .order_by(CustodyEvent.timestamp.desc())
            .limit(1)
        )
        .scalars()
        .first()
    )
    prev_hash = last_evt.event_hash if last_evt else None
    ts = _now_utc()
    evt_hash = CustodyEvent.compute_event_hash(
        evidence_id=evidence.id,
        actor_id=actor_id,
        action=action,
        timestamp=ts,
        prev_event_hash=prev_hash,
        metadata=metadata,
    )
    evt = CustodyEvent(
        evidence_id=evidence.id,
        actor_id=actor_id,
        action=action,
        timestamp=ts,
        prev_event_hash=prev_hash,
        event_hash=evt_hash,
        metadata=metadata,
    )
    db.add(evt)
    return evt


async def transcribe_audio_background(evidence_id: str, file_path: str):
    """Transcreve áudio em background usando Whisper"""
    try:
        from emergentintegrations.llm.openai import OpenAISpeechToText
        
        stt = OpenAISpeechToText(api_key=os.getenv("EMERGENT_LLM_KEY"))
        
        with open(file_path, "rb") as audio_file:
            response = await stt.transcribe(
                file=audio_file,
                model="whisper-1",
                response_format="verbose_json",
                language="pt",
                timestamp_granularities=["segment"]
            )
        
        # Salvar transcrição no banco
        from app.db import SessionLocal
        db = SessionLocal()
        try:
            evidence = db.query(Evidence).filter(Evidence.id == uuid.UUID(evidence_id)).first()
            if evidence:
                evidence.transcription = response.text
                evidence.status = EvidenceStatus.PROCESSED
                
                # Adicionar evento de custódia
                _append_custody_event(
                    db=db,
                    evidence=evidence,
                    actor_id="SYSTEM",
                    action=CustodyAction.TRANSCRIBED,
                    metadata={
                        "segments": len(response.segments) if hasattr(response, 'segments') else 0,
                        "language": "pt"
                    }
                )
                
                db.commit()
                print(f"✅ Transcrição concluída para evidência {evidence_id}")
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Erro na transcrição: {str(e)}")
        # Marcar como falha
        from app.db import SessionLocal
        db = SessionLocal()
        try:
            evidence = db.query(Evidence).filter(Evidence.id == uuid.UUID(evidence_id)).first()
            if evidence:
                evidence.status = EvidenceStatus.FAILED
                db.commit()
        finally:
            db.close()


# ========================================
# ENDPOINTS
# ========================================

@app.get("/")
async def root():
    return {
        "service": "Aegis - Interceptação Legal & Evidências Forenses",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/cases", response_model=CaseOut)
def create_case(
    payload: CaseCreate,
    request: Request,
    db: Session = Depends(get_db),
    actor_id: str = Depends(get_actor_id),
):
    """Criar novo caso de investigação"""
    case = Case(name=payload.name)
    db.add(case)
    db.flush()

    _log_audit(
        db=db,
        request=request,
        actor_id=actor_id,
        action="CASE_CREATED",
        entity_type="Case",
        entity_id=str(case.id),
        details={"name": case.name},
    )

    db.commit()
    db.refresh(case)
    return CaseOut.model_validate(case.__dict__)

@app.get("/cases", response_model=list[CaseOut])
def list_cases(
    db: Session = Depends(get_db),
    actor_id: str = Depends(get_actor_id),
):
    """Listar todos os casos"""
    cases = db.execute(select(Case)).scalars().all()
    return [CaseOut.model_validate(c.__dict__) for c in cases]

@app.get("/cases/{case_id}", response_model=CaseOut)
def get_case(
    case_id: uuid.UUID,
    db: Session = Depends(get_db),
    actor_id: str = Depends(get_actor_id),
):
    """Obter detalhes de um caso"""
    case = db.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Caso não encontrado")
    return CaseOut.model_validate(case.__dict__)

@app.post("/cases/{case_id}/targets", response_model=TargetOut)
def create_target(
    case_id: uuid.UUID,
    payload: TargetCreate,
    request: Request,
    db: Session = Depends(get_db),
    actor_id: str = Depends(get_actor_id),
):
    """Adicionar alvo a um caso"""
    _ensure_case_active(db, case_id)
    
    target = Target(
        case_id=case_id,
        type=payload.type,
        value=payload.value,
        label=payload.label
    )
    db.add(target)
    db.flush()
    
    _log_audit(
        db=db,
        request=request,
        actor_id=actor_id,
        action="TARGET_CREATED",
        entity_type="Target",
        entity_id=str(target.id),
        details={"case_id": str(case_id), "type": payload.type, "value": payload.value},
    )
    
    db.commit()
    db.refresh(target)
    return TargetOut.model_validate(target.__dict__)

@app.post("/cases/{case_id}/judicial-orders", response_model=JudicialOrderOut)
async def upload_judicial_order(
    case_id: uuid.UUID,
    request: Request,
    process_number: str = Form(...),
    court: str = Form(...),
    judge: str = Form(...),
    valid_from: datetime = Form(...),
    valid_until: datetime = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    actor_id: str = Depends(get_actor_id),
):
    """Upload de ordem judicial"""
    _ensure_case_active(db, case_id)

    if valid_until <= valid_from:
        raise HTTPException(status_code=422, detail="valid_until deve ser maior que valid_from.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=422, detail="Arquivo vazio.")
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Ordem judicial excede 50MB.")

    order_id = uuid.uuid4()
    sha = _sha256_bytes(content)

    storage = get_storage()
    key = build_order_key(case_id=case_id, order_id=order_id, filename=file.filename or "ordem.pdf")
    stored = storage.put_bytes(key=key, content=content, content_type=file.content_type or "application/pdf")

    order = JudicialOrder(
        id=order_id,
        case_id=case_id,
        process_number=process_number,
        court=court,
        judge=judge,
        valid_from=valid_from,
        valid_until=valid_until,
        document_sha256=sha,
        document_uri=stored.uri,
    )
    db.add(order)

    _log_audit(
        db=db,
        request=request,
        actor_id=actor_id,
        action="JUDICIAL_ORDER_UPLOADED",
        entity_type="JudicialOrder",
        entity_id=str(order.id),
        details={
            "case_id": str(case_id),
            "process_number": process_number,
            "valid_from": valid_from.isoformat(),
            "valid_until": valid_until.isoformat(),
            "sha256": sha,
            "uri": stored.uri,
        },
    )

    db.commit()
    db.refresh(order)
    return JudicialOrderOut.model_validate(order.__dict__)

@app.post("/cases/{case_id}/evidences/audio", response_model=EvidenceOut)
async def ingest_audio_evidence(
    case_id: uuid.UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_id: Optional[uuid.UUID] = Form(default=None),
    collected_at: Optional[datetime] = Form(default=None),
    judicial_order_id: Optional[uuid.UUID] = Form(default=None),
    db: Session = Depends(get_db),
    actor_id: str = Depends(get_actor_id),
):
    """Ingestão de evidência de áudio com transcrição automática"""
    _ensure_case_active(db, case_id)

    now = _now_utc()
    if judicial_order_id:
        order = db.get(JudicialOrder, judicial_order_id)
        if not order or order.case_id != case_id:
            raise HTTPException(status_code=422, detail="judicial_order_id inválido para este caso.")
        if not (order.valid_from <= now <= order.valid_until):
            raise HTTPException(status_code=409, detail="Ordem judicial informada não está vigente.")
    else:
        order = _get_active_order_for_case(db, case_id, now)

    if target_id:
        target = db.get(Target, target_id)
        if not target or target.case_id != case_id:
            raise HTTPException(status_code=422, detail="target_id inválido para este caso.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=422, detail="Arquivo vazio.")
    if len(content) > 500 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Evidência excede 500MB.")

    mime = file.content_type or "application/octet-stream"
    if not mime.startswith("audio/"):
        raise HTTPException(status_code=415, detail=f"Content-Type inválido para áudio: {mime}")

    evidence_id = uuid.uuid4()
    sha = _sha256_bytes(content)

    storage = get_storage()
    key = build_evidence_key(case_id=case_id, evidence_id=evidence_id, filename=file.filename or "audio.bin")
    stored = storage.put_bytes(key=key, content=content, content_type=mime)

    evidence = Evidence(
        id=evidence_id,
        case_id=case_id,
        target_id=target_id,
        judicial_order_id=order.id,
        type=EvidenceType.AUDIO,
        status=EvidenceStatus.PROCESSING,
        mime_type=mime,
        original_filename=file.filename or "unknown",
        size_bytes=stored.size_bytes,
        sha256=sha,
        storage_uri=stored.uri,
        collected_at=collected_at,
    )
    db.add(evidence)
    db.flush()

    _append_custody_event(
        db=db,
        evidence=evidence,
        actor_id=actor_id,
        action=CustodyAction.INGESTED,
        metadata={
            "sha256": sha,
            "size_bytes": stored.size_bytes,
            "mime_type": mime,
            "storage_uri": stored.uri,
            "judicial_order_id": str(order.id),
        },
    )

    _log_audit(
        db=db,
        request=request,
        actor_id=actor_id,
        action="EVIDENCE_AUDIO_INGESTED",
        entity_type="Evidence",
        entity_id=str(evidence.id),
        details={
            "case_id": str(case_id),
            "target_id": str(target_id) if target_id else None,
            "judicial_order_id": str(order.id),
            "sha256": sha,
            "size_bytes": stored.size_bytes,
            "uri": stored.uri,
        },
    )

    db.commit()
    db.refresh(evidence)
    
    # Agendar transcrição em background
    file_path = stored.uri.replace("file://", "")
    background_tasks.add_task(transcribe_audio_background, str(evidence.id), file_path)

    return EvidenceOut.model_validate(evidence.__dict__)

@app.get("/cases/{case_id}/evidences", response_model=list[EvidenceOut])
def list_evidences(
    case_id: uuid.UUID,
    db: Session = Depends(get_db),
    actor_id: str = Depends(get_actor_id),
):
    """Listar evidências de um caso"""
    evidences = db.execute(
        select(Evidence).where(Evidence.case_id == case_id)
    ).scalars().all()
    return [EvidenceOut.model_validate(e.__dict__) for e in evidences]

@app.get("/evidences/{evidence_id}", response_model=EvidenceOut)
def get_evidence(
    evidence_id: uuid.UUID,
    db: Session = Depends(get_db),
    actor_id: str = Depends(get_actor_id),
):
    """Obter detalhes de uma evidência"""
    evidence = db.get(Evidence, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    return EvidenceOut.model_validate(evidence.__dict__)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
