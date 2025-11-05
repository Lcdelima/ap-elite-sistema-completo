"""Evidence Vault - Cofre de Evidências com Cadeia de Custódia - Elite Athena"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
import hashlib
import uuid
import os
import json
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/evidence-vault", tags=["evidence-vault"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class EvidenceMetadata(BaseModel):
    case_id: str
    evidence_type: str  # file, image, audio, video, document
    description: str
    collected_by: str
    location: Optional[str] = None
    tags: List[str] = []


class EvidenceRecord(BaseModel):
    id: str
    case_id: str
    filename: str
    evidence_type: str
    description: str
    file_size: int
    mime_type: str
    hash_md5: str
    hash_sha256: str
    hash_sha512: str
    collected_by: str
    collected_at: str
    location: Optional[str]
    tags: List[str]
    custody_chain: List[dict]
    storage_path: str
    is_sealed: bool = False


def calculate_hashes(file_content: bytes) -> dict:
    """Calcula múltiplos hashes do arquivo"""
    return {
        "md5": hashlib.md5(file_content).hexdigest(),
        "sha256": hashlib.sha256(file_content).hexdigest(),
        "sha512": hashlib.sha512(file_content).hexdigest()
    }


@router.post("/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    case_id: str = Form(...),
    evidence_type: str = Form(...),
    description: str = Form(...),
    collected_by: str = Form(...),
    location: Optional[str] = Form(None),
    tags: str = Form("")
):
    """Upload de evidência com geração automática de hashes"""
    
    # Ler conteúdo do arquivo
    file_content = await file.read()
    
    # Calcular hashes
    hashes = calculate_hashes(file_content)
    
    # Gerar ID único
    evidence_id = str(uuid.uuid4())
    
    # Salvar arquivo
    upload_dir = "/app/backend/evidence_vault"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    storage_filename = f"{evidence_id}{file_extension}"
    storage_path = os.path.join(upload_dir, storage_filename)
    
    with open(storage_path, "wb") as f:
        f.write(file_content)
    
    # Parse tags
    tags_list = [tag.strip() for tag in tags.split(",") if tag.strip()]
    
    # Criar registro de evidência
    evidence = EvidenceRecord(
        id=evidence_id,
        case_id=case_id,
        filename=file.filename,
        evidence_type=evidence_type,
        description=description,
        file_size=len(file_content),
        mime_type=file.content_type or "application/octet-stream",
        hash_md5=hashes["md5"],
        hash_sha256=hashes["sha256"],
        hash_sha512=hashes["sha512"],
        collected_by=collected_by,
        collected_at=datetime.now(timezone.utc).isoformat(),
        location=location,
        tags=tags_list,
        custody_chain=[
            {
                "action": "collected",
                "by": collected_by,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "location": location,
                "notes": "Initial collection"
            }
        ],
        storage_path=storage_path,
        is_sealed=False
    )
    
    # Salvar no banco
    await db.evidence_vault.insert_one(evidence.model_dump())
    
    return {
        "evidence_id": evidence_id,
        "hashes": hashes,
        "message": "Evidência registrada com sucesso"
    }


@router.get("/case/{case_id}")
async def list_case_evidence(case_id: str):
    """Lista todas as evidências de um caso"""
    evidence_list = await db.evidence_vault.find(
        {"case_id": case_id}
    ).sort("collected_at", -1).to_list(length=None)
    
    return {"case_id": case_id, "evidence": evidence_list}


@router.get("/{evidence_id}")
async def get_evidence(evidence_id: str):
    """Obtém detalhes de uma evidência"""
    evidence = await db.evidence_vault.find_one({"id": evidence_id})
    
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    return evidence


@router.post("/{evidence_id}/custody")
async def add_custody_event(
    evidence_id: str,
    action: str,
    performed_by: str,
    notes: Optional[str] = None
):
    """Adiciona evento na cadeia de custódia"""
    evidence = await db.evidence_vault.find_one({"id": evidence_id})
    
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    custody_event = {
        "action": action,
        "by": performed_by,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "notes": notes
    }
    
    await db.evidence_vault.update_one(
        {"id": evidence_id},
        {"$push": {"custody_chain": custody_event}}
    )
    
    return {"message": "Evento adicionado à cadeia de custódia", "event": custody_event}


@router.post("/{evidence_id}/seal")
async def seal_evidence(evidence_id: str, sealed_by: str):
    """Sela evidência (impede modificações)"""
    evidence = await db.evidence_vault.find_one({"id": evidence_id})
    
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    if evidence.get("is_sealed"):
        raise HTTPException(status_code=400, detail="Evidência já está selada")
    
    # Selar
    await db.evidence_vault.update_one(
        {"id": evidence_id},
        {
            "$set": {
                "is_sealed": True,
                "sealed_by": sealed_by,
                "sealed_at": datetime.now(timezone.utc).isoformat()
            },
            "$push": {
                "custody_chain": {
                    "action": "sealed",
                    "by": sealed_by,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "notes": "Evidence sealed - no further modifications allowed"
                }
            }
        }
    )
    
    return {"message": "Evidência selada com sucesso"}


@router.get("/{evidence_id}/verify")
async def verify_integrity(evidence_id: str):
    """Verifica integridade da evidência recalculando hashes"""
    evidence = await db.evidence_vault.find_one({"id": evidence_id})
    
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    # Ler arquivo
    storage_path = evidence["storage_path"]
    
    if not os.path.exists(storage_path):
        raise HTTPException(status_code=404, detail="Arquivo físico não encontrado")
    
    with open(storage_path, "rb") as f:
        file_content = f.read()
    
    # Recalcular hashes
    current_hashes = calculate_hashes(file_content)
    
    # Comparar
    integrity_check = {
        "md5_match": current_hashes["md5"] == evidence["hash_md5"],
        "sha256_match": current_hashes["sha256"] == evidence["hash_sha256"],
        "sha512_match": current_hashes["sha512"] == evidence["hash_sha512"]
    }
    
    all_match = all(integrity_check.values())
    
    return {
        "evidence_id": evidence_id,
        "integrity_verified": all_match,
        "details": integrity_check,
        "original_hashes": {
            "md5": evidence["hash_md5"],
            "sha256": evidence["hash_sha256"],
            "sha512": evidence["hash_sha512"]
        },
        "current_hashes": current_hashes
    }
