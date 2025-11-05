"""Transcrição Completa com Diarização - Elite Athena"""
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks
from services.diarization_service import DiarizationService
import os
import uuid
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/transcription-advanced", tags=["transcription-advanced"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

TEMP_DIR = "/app/backend/temp_transcription"
os.makedirs(TEMP_DIR, exist_ok=True)

diarization_service = DiarizationService()


@router.post("/with-diarization")
async def transcribe_with_diarization(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    num_speakers: int = Form(2),
    enable_keywords: bool = Form(True),
    enable_pseudonymization: bool = Form(False)
):
    """Transcrição avançada com diarização"""
    
    # Salvar arquivo
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    temp_path = os.path.join(TEMP_DIR, f"{file_id}{file_ext}")
    
    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Processar com diarização
    result = await diarization_service.transcribe_with_diarization(
        audio_path=temp_path,
        language="pt",
        num_speakers=num_speakers
    )
    
    # Detectar palavras-chave jurídicas
    if enable_keywords:
        keywords = ['autor', 'réu', 'juiz', 'advogado', 'processo', 'sentença', 'recurso']
        keywords_result = await diarization_service.identify_keywords(
            transcription_text=result['full_text'],
            keywords=keywords
        )
        result['keywords_analysis'] = keywords_result
    
    # Pseudonimização
    if enable_pseudonymization:
        pseudo_result = await diarization_service.pseudonymize(
            transcription_text=result['full_text']
        )
        result['pseudonymized'] = pseudo_result
    
    # Salvar resultado
    transcription_record = {
        'transcription_id': file_id,
        'original_filename': file.filename,
        'result': result,
        'options': {
            'num_speakers': num_speakers,
            'keywords_enabled': enable_keywords,
            'pseudonymization_enabled': enable_pseudonymization
        }
    }
    
    await db.transcriptions_advanced.insert_one(transcription_record)
    
    # Limpar em background
    background_tasks.add_task(os.remove, temp_path)
    
    return {
        'transcription_id': file_id,
        'result': result,
        'message': 'Transcrição com diarização concluída'
    }


@router.get("/{transcription_id}")
async def get_advanced_transcription(transcription_id: str):
    """Obtém transcrição avançada"""
    
    transcription = await db.transcriptions_advanced.find_one(
        {'transcription_id': transcription_id}
    )
    
    if not transcription:
        raise HTTPException(status_code=404, detail="Transcrição não encontrada")
    
    return transcription
