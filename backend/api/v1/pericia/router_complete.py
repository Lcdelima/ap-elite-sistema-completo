"""API Completa de Perícia - Elite Athena"""
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from jobs.tasks_pericia import (
    calculate_hashes_task,
    transcribe_diarize_task,
    deepfake_scan_task,
    parse_ufdr_task,
    create_disk_image_task
)

router = APIRouter(prefix="/api/pericia", tags=["pericia-completa"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

EVIDENCE_DIR = "/app/backend/evidence"
os.makedirs(EVIDENCE_DIR, exist_ok=True)


class EvidenceUploadRequest(BaseModel):
    case_id: str
    description: str
    collector: str


@router.post("/upload-evidence")
async def upload_evidence(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    case_id: str = "",
    description: str = "",
    collector: str = ""
):
    """Upload de evidência com hash automático em background"""
    
    # Gerar ID
    evidence_id = str(uuid.uuid4())
    
    # Salvar arquivo
    file_ext = os.path.splitext(file.filename)[1]
    evidence_path = os.path.join(EVIDENCE_DIR, f"{evidence_id}{file_ext}")
    
    with open(evidence_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Criar registro inicial
    evidence_record = {
        "id": evidence_id,
        "case_id": case_id,
        "original_filename": file.filename,
        "path": evidence_path,
        "size_bytes": len(content),
        "description": description,
        "collector": collector,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "hash_status": "calculating",
        "hashes": {}
    }
    
    await db.evidence.insert_one(evidence_record)
    
    # Iniciar cálculo de hash em background
    task = calculate_hashes_task.delay(evidence_path, evidence_id)
    
    return {
        "evidence_id": evidence_id,
        "filename": file.filename,
        "size_mb": round(len(content) / 1024 / 1024, 2),
        "hash_task_id": task.id,
        "message": "Evidência registrada. Hashes sendo calculados em background."
    }


@router.post("/import/cellebrite")
async def import_cellebrite_ufdr(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Importa relatório UFDR do Cellebrite"""
    
    # Salvar UFDR
    ufdr_id = str(uuid.uuid4())
    ufdr_path = os.path.join(EVIDENCE_DIR, f"ufdr_{ufdr_id}.zip")
    
    with open(ufdr_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Parse em background
    task = parse_ufdr_task.delay(ufdr_path)
    
    return {
        "ufdr_id": ufdr_id,
        "parse_task_id": task.id,
        "message": "UFDR sendo processado"
    }


@router.post("/import/ftk")
async def import_ftk_export(file: UploadFile = File(...)):
    """Importa exportação FTK"""
    
    from api.v1.pericia.adapters.ftk import parse_ftk_export
    
    # Salvar temporariamente
    import tempfile
    temp_path = tempfile.mktemp(suffix=".csv")
    
    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Parse
    result = parse_ftk_export(temp_path)
    
    os.remove(temp_path)
    
    return {
        "total_files": result.get('total_files', 0),
        "total_size_bytes": result.get('total_size', 0),
        "rows_sample": result.get('rows', [])[:10],
        "message": "FTK export parsed successfully"
    }


@router.post("/transcription/diarization")
async def transcribe_with_diarization(
    evidence_id: str,
    num_speakers: int = 2
):
    """Inicia transcrição com diarização"""
    
    evidence = await db.evidence.find_one({"id": evidence_id})
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    # Iniciar task
    task = transcribe_diarize_task.delay(
        audio_path=evidence['path'],
        num_speakers=num_speakers
    )
    
    return {
        "task_id": task.id,
        "evidence_id": evidence_id,
        "message": "Transcrição iniciada"
    }


@router.post("/deepfake/analyze")
async def analyze_deepfake(evidence_id: str):
    """Analisa vídeo para deepfake"""
    
    evidence = await db.evidence.find_one({"id": evidence_id})
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    task = deepfake_scan_task.delay(evidence['path'])
    
    return {
        "task_id": task.id,
        "evidence_id": evidence_id,
        "message": "Análise de deepfake iniciada"
    }


@router.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
    """Verifica status de task Celery"""
    
    from celery.result import AsyncResult
    from jobs.celery_app import app as celery_app
    
    task = AsyncResult(task_id, app=celery_app)
    
    return {
        "task_id": task_id,
        "state": task.state,
        "result": task.result if task.state == 'SUCCESS' else None,
        "info": task.info if task.state == 'PROGRESS' else None
    }


@router.post("/disk-image/create")
async def create_disk_image(
    source_drive: str,
    image_name: str,
    format: str = "E01"
):
    """Cria imagem forense de disco"""
    
    output_path = os.path.join(EVIDENCE_DIR, f"{image_name}.{format.lower()}")
    
    task = create_disk_image_task.delay(
        source_drive=source_drive,
        output_path=output_path,
        format=format
    )
    
    return {
        "task_id": task.id,
        "output_path": output_path,
        "message": "Imaging iniciado"
    }
