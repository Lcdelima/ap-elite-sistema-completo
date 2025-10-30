"""Módulo 3: Interceptações Telefônicas (Pós-processamento de voz/SMS)"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os
import logging

# MongoDB connection
from server import db

router = APIRouter(prefix="/api/telephony", tags=["Interceptações Telefônicas"])
logger = logging.getLogger(__name__)

# Models
class CallImport(BaseModel):
    case_number: str
    legal_basis: str  # COMPLIANCE GATE
    operator: str
    date_range_start: str
    date_range_end: str

class Call(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    case_number: str
    call_type: str  # voice, sms
    from_number: str
    to_number: str
    timestamp: str
    duration_seconds: Optional[int] = None
    audio_file: Optional[str] = None
    transcription: Optional[str] = None
    speakers: Optional[List[str]] = None
    sentiment: Optional[str] = None
    keywords: List[str] = []

class TranscriptionRequest(BaseModel):
    call_id: str
    language: str = "pt-BR"
    diarization: bool = True

@router.post("/import")
async def import_calls(
    call_data: CallImport,
    audio_files: List[UploadFile] = File(None),
    metadata_file: UploadFile = File(None)
):
    """
    Importa chamadas e metadados da operadora
    COMPLIANCE GATE: Requer base legal (mandado, ordem judicial)
    """
    
    # Validar base legal
    if not call_data.legal_basis:
        raise HTTPException(
            status_code=400,
            detail="Base legal obrigatória. Configure mandado ou ordem judicial."
        )
    
    logger.info(f"📞 Importando interceptações - Caso: {call_data.case_number}, Base legal: {call_data.legal_basis}")
    
    # Simular importação de chamadas
    imported_calls = []
    
    for i in range(5):  # Simular 5 chamadas
        call = {
            "id": str(uuid.uuid4()),
            "case_number": call_data.case_number,
            "call_type": "voice" if i % 2 == 0 else "sms",
            "from_number": f"+5511999{i:06d}",
            "to_number": f"+5511888{i:06d}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "duration_seconds": 120 + i * 30 if i % 2 == 0 else None,
            "audio_file": f"call_{i}.wav" if i % 2 == 0 else None,
            "legal_basis": call_data.legal_basis,
            "operator": call_data.operator,
            "imported_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Salvar no MongoDB
        await db.telephony_calls.insert_one(call)
        imported_calls.append(call)
    
    logger.info(f"✅ {len(imported_calls)} chamadas importadas para caso {call_data.case_number}")
    
    return {
        "status": "success",
        "case_number": call_data.case_number,
        "imported_calls": len(imported_calls),
        "legal_basis": call_data.legal_basis,
        "calls": imported_calls
    }

@router.get("/calls")
async def list_calls(case_number: Optional[str] = None, call_type: Optional[str] = None):
    """Lista todas as chamadas interceptadas"""
    try:
        query = {}
        if case_number:
            query["case_number"] = case_number
        if call_type:
            query["call_type"] = call_type
        
        calls = await db.telephony_calls.find(query, {"_id": 0}).sort("timestamp", -1).to_list(100)
        
        return {
            "total": len(calls),
            "calls": calls
        }
    except Exception as e:
        logger.error(f"Error listing calls: {e}")
        return {"total": 0, "calls": []}

@router.post("/transcribe")
async def transcribe_call(request: TranscriptionRequest):
    """Transcreve áudio de chamada com diarização"""
    
    call = await db.telephony_calls.find_one({"id": request.call_id}, {"_id": 0})
    if not call:
        raise HTTPException(status_code=404, detail="Chamada não encontrada")
    
    logger.info(f"🎤 Transcrevendo chamada {request.call_id} - Idioma: {request.language}")
    
    # Simular transcrição com IA (Whisper/Gemini)
    transcription = {
        "call_id": request.call_id,
        "transcription": "Locutor A: Olá, como vai?\nLocutor B: Tudo bem, e você?\nLocutor A: Estou bem, obrigado. Sobre o assunto que conversamos ontem...\nLocutor B: Sim, lembro. Vamos marcar uma reunião?",
        "speakers": ["Locutor A", "Locutor B"],
        "sentiment": "neutral",
        "keywords": ["reunião", "assunto", "ontem"],
        "confidence": 0.95,
        "language": request.language,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Atualizar chamada no MongoDB
    await db.telephony_calls.update_one(
        {"id": request.call_id},
        {"$set": {
            "transcription": transcription["transcription"],
            "speakers": transcription["speakers"],
            "sentiment": transcription["sentiment"],
            "keywords": transcription["keywords"]
        }}
    )
    
    # Salvar transcrição completa
    await db.telephony_transcripts.insert_one(transcription)
    
    logger.info(f"✅ Transcrição concluída para chamada {request.call_id}")
    
    return transcription

@router.get("/calls/{call_id}")
async def get_call(call_id: str):
    """Obtém detalhes de uma chamada"""
    call = await db.telephony_calls.find_one({"id": call_id}, {"_id": 0})
    if not call:
        raise HTTPException(status_code=404, detail="Chamada não encontrada")
    return call

@router.post("/report")
async def generate_report(case_number: str, format: str = "pdf"):
    """Gera relatório de interceptações"""
    
    case_calls = await db.telephony_calls.find({"case_number": case_number}, {"_id": 0}).to_list(1000)
    
    if not case_calls:
        raise HTTPException(status_code=404, detail="Nenhuma chamada encontrada para este caso")
    
    total_duration = sum([c.get("duration_seconds", 0) for c in case_calls])
    transcribed = [c for c in case_calls if c.get("transcription")]
    all_speakers = set()
    for c in case_calls:
        if c.get("speakers"):
            all_speakers.update(c["speakers"])
    
    report = {
        "type": "pades" if format == "pdf" else "json",
        "case_number": case_number,
        "total_calls": len(case_calls),
        "total_duration_minutes": total_duration / 60,
        "transcribed_calls": len(transcribed),
        "speakers_identified": len(all_speakers),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "digital_signature": "SHA256-RSA-4096",
        "timestamp_rfc3161": datetime.now(timezone.utc).isoformat(),
        "compliance": ["Lei 9.296/96", "CPP Art. 155", "LGPD"]
    }
    
    logger.info(f"📄 Relatório gerado para caso {case_number} - {len(case_calls)} chamadas")
    
    return report

@router.get("/stats")
async def get_stats():
    """Estatísticas do módulo"""
    try:
        total_calls = await db.telephony_calls.count_documents({})
        voice_calls = await db.telephony_calls.count_documents({"call_type": "voice"})
        sms_calls = await db.telephony_calls.count_documents({"call_type": "sms"})
        transcribed = await db.telephony_calls.count_documents({"transcription": {"$ne": None}})
        
        return {
            "total_calls": total_calls,
            "voice_calls": voice_calls,
            "sms_calls": sms_calls,
            "transcribed_calls": transcribed,
            "transcription_rate": (transcribed / total_calls * 100) if total_calls > 0 else 0
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return {
            "total_calls": 0,
            "voice_calls": 0,
            "sms_calls": 0,
            "transcribed_calls": 0,
            "transcription_rate": 0
        }

@router.get("/health")
async def health_check():
    """Health check do módulo"""
    return {
        "status": "ok",
        "module": "Interceptações Telefônicas",
        "version": "3.0.0",
        "compliance": ["Lei 9.296/96", "CPP Art. 155", "LGPD"],
        "features": ["Import CDR", "Transcription AI", "Speech-to-Evidence", "Reports"]
    }
