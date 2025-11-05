"""Transcrição Forense VFT Pack™ - Elite Athena"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
import hashlib
from datetime import datetime, timezone
import json
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/transcription", tags=["transcription"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Diretório para arquivos temporários
TEMP_DIR = "/app/backend/temp_transcription"
os.makedirs(TEMP_DIR, exist_ok=True)


class TranscriptionRequest(BaseModel):
    case_id: Optional[str] = None
    audio_type: str  # audio, video, url, interception
    language: str = "pt-BR"
    provider: str = "whisper"  # whisper, google, assemblyai, custom
    enable_diarization: bool = True
    enable_legal_annotations: bool = True
    requester: str


class TranscriptionSegment(BaseModel):
    start: float
    end: float
    text: str
    speaker: Optional[str] = None
    confidence: float


class TranscriptionResult(BaseModel):
    transcription_id: str
    case_id: Optional[str]
    original_file: str
    file_hash_sha256: str
    segments: List[dict]
    full_text: str
    language: str
    provider: str
    duration_seconds: float
    created_at: str
    created_by: str
    quality_score: float


@router.post("/upload")
async def upload_for_transcription(
    file: UploadFile = File(...),
    case_id: Optional[str] = Form(None),
    audio_type: str = Form(...),
    language: str = Form("pt-BR"),
    provider: str = Form("whisper"),
    enable_diarization: bool = Form(True),
    requester: str = Form(...)
):
    """Upload de arquivo para transcrição"""
    
    # Validar tipo de arquivo
    allowed_extensions = [
        '.mp3', '.wav', '.ogg', '.flac', '.aac',  # Audio
        '.mp4', '.mov', '.mkv', '.avi', '.webm'   # Video
    ]
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Formato não suportado. Permitidos: {', '.join(allowed_extensions)}"
        )
    
    # Verificação especial para interceptações
    if audio_type == "interception":
        # TODO: Verificar autorização judicial
        # Por enquanto apenas log de aviso
        pass
    
    # Ler arquivo
    file_content = await file.read()
    
    # Calcular hash
    file_hash = hashlib.sha256(file_content).hexdigest()
    
    # Gerar ID único
    transcription_id = str(uuid.uuid4())
    
    # Salvar arquivo temporariamente
    temp_filename = f"{transcription_id}{file_ext}"
    temp_path = os.path.join(TEMP_DIR, temp_filename)
    
    with open(temp_path, "wb") as f:
        f.write(file_content)
    
    # Criar registro
    transcription_record = {
        "transcription_id": transcription_id,
        "case_id": case_id,
        "original_filename": file.filename,
        "file_hash_sha256": file_hash,
        "file_size": len(file_content),
        "audio_type": audio_type,
        "language": language,
        "provider": provider,
        "enable_diarization": enable_diarization,
        "status": "pending",  # pending, processing, completed, failed
        "temp_path": temp_path,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": requester,
        "result": None
    }
    
    await db.transcriptions.insert_one(transcription_record)
    
    # TODO: Iniciar processo de transcrição em background
    # Por enquanto, retornar sucesso
    
    return {
        "transcription_id": transcription_id,
        "status": "pending",
        "message": "Arquivo recebido. Transcrição será processada em breve."
    }


@router.get("/{transcription_id}")
async def get_transcription(transcription_id: str):
    """Obtém resultado da transcrição"""
    transcription = await db.transcriptions.find_one(
        {"transcription_id": transcription_id}
    )
    
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcrição não encontrada")
    
    return transcription


@router.post("/{transcription_id}/process")
async def process_transcription(transcription_id: str):
    """Processa transcrição usando serviço real"""
    
    transcription = await db.transcriptions.find_one(
        {"transcription_id": transcription_id}
    )
    
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcrição não encontrada")
    
    # Atualizar status
    await db.transcriptions.update_one(
        {"transcription_id": transcription_id},
        {"$set": {"status": "processing"}}
    )
    
    try:
        # Importar serviço de transcrição
        from services.transcription_service import TranscriptionOrchestrator
        
        orchestrator = TranscriptionOrchestrator()
        
        # Processar transcrição
        result = await orchestrator.transcribe(
            audio_path=transcription['temp_path'],
            provider=transcription['provider'],
            language=transcription['language'],
            enable_timestamps=True,
            prompt="Transcrição forense para uso judicial"
        )
        
        # Atualizar com resultado real
        await db.transcriptions.update_one(
            {"transcription_id": transcription_id},
            {
                "$set": {
                    "status": "completed",
                    "result": result,
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {
            "transcription_id": transcription_id,
            "status": "completed",
            "result": result
        }
        
    except Exception as e:
        # Erro no processamento
        await db.transcriptions.update_one(
            {"transcription_id": transcription_id},
            {
                "$set": {
                    "status": "failed",
                    "error": str(e),
                    "failed_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        raise HTTPException(status_code=500, detail=f"Erro na transcrição: {str(e)}")


@router.get("/{transcription_id}/export-vft")
async def export_vft_pack(transcription_id: str):
    """Exporta VFT Pack™ - Verified Forensic Transcript"""
    
    transcription = await db.transcriptions.find_one(
        {"transcription_id": transcription_id}
    )
    
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcrição não encontrada")
    
    if transcription['status'] != 'completed':
        raise HTTPException(status_code=400, detail="Transcrição ainda não completa")
    
    # Criar manifesto VFT Pack
    vft_manifest = {
        "version": "1.0",
        "transcription_id": transcription_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "original_file": {
            "filename": transcription['original_filename'],
            "hash_sha256": transcription['file_hash_sha256'],
            "size_bytes": transcription['file_size']
        },
        "transcription": {
            "provider": transcription['provider'],
            "language": transcription['language'],
            "diarization": transcription['enable_diarization'],
            "full_text": transcription['result']['full_text'],
            "segments": transcription['result']['segments'],
            "quality_score": transcription['result']['quality_score']
        },
        "metadata": {
            "case_id": transcription['case_id'],
            "created_at": transcription['created_at'],
            "created_by": transcription['created_by']
        },
        "forensic_standards": [
            "ISO/IEC 27037",
            "ABNT NBR"
        ],
        "custody_chain": [
            {
                "action": "file_upload",
                "timestamp": transcription['created_at'],
                "by": transcription['created_by']
            },
            {
                "action": "transcription_completed",
                "timestamp": transcription.get('completed_at'),
                "provider": transcription['provider']
            }
        ]
    }
    
    return {
        "vft_pack": vft_manifest,
        "export_format": "json",
        "message": "VFT Pack™ gerado com sucesso"
    }


@router.get("/case/{case_id}")
async def list_case_transcriptions(case_id: str):
    """Lista transcrições de um caso"""
    transcriptions = await db.transcriptions.find(
        {"case_id": case_id}
    ).sort("created_at", -1).to_list(length=None)
    
    return {
        "case_id": case_id,
        "transcriptions": transcriptions,
        "count": len(transcriptions)
    }
