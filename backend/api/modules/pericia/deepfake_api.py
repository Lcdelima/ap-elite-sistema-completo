"""Deepfake Detection API - Elite Athena"""
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks
from services.deepfake_detection import DeepfakeDetector
import os
import uuid

router = APIRouter(prefix="/api/deepfake", tags=["deepfake"])

detector = DeepfakeDetector()
TEMP_DIR = "/app/backend/temp_deepfake"
os.makedirs(TEMP_DIR, exist_ok=True)


@router.post("/analyze")
async def analyze_media(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    media_type: str = Form(...)
):
    """Analisa mídia para detectar deepfake"""
    
    # Salvar arquivo
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    temp_path = os.path.join(TEMP_DIR, f"{file_id}{file_ext}")
    
    with open(temp_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Analisar
    if media_type == 'video':
        result = await detector.analyze_video(temp_path)
    else:
        result = await detector.analyze_audio(temp_path)
    
    # Gerar laudo
    report = await detector.generate_report(result)
    result['laudo_tecnico'] = report
    
    # Limpar arquivo em background
    background_tasks.add_task(os.remove, temp_path)
    
    return result
