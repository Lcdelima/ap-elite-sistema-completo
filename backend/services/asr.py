"""ASR (Automatic Speech Recognition) Service - Elite Athena"""
import os
import subprocess
import tempfile


def transcribe_audio(audio_path: str, model_size: str = "medium") -> dict:
    """Transcreve áudio usando Whisper"""
    
    # Normalizar áudio para 16kHz mono
    normalized = tempfile.mktemp(suffix=".wav")
    
    try:
        # FFmpeg para normalização
        subprocess.check_call([
            'ffmpeg', '-y', '-i', audio_path,
            '-ac', '1',  # mono
            '-ar', '16000',  # 16kHz
            normalized
        ], stderr=subprocess.DEVNULL)
        
        # TODO: Usar Whisper quando instalado
        # import whisper
        # model = whisper.load_model(model_size)
        # result = model.transcribe(normalized, language="pt")
        
        # Mock por enquanto
        result = {
            "text": "Transcrição de exemplo",
            "segments": [
                {
                    "start": 0.0,
                    "end": 5.0,
                    "text": "Transcrição de exemplo"
                }
            ],
            "language": "pt"
        }
        
        return result
        
    finally:
        if os.path.exists(normalized):
            os.remove(normalized)


def normalize_audio_for_diarization(audio_path: str) -> str:
    """Normaliza áudio para diarização"""
    
    output = tempfile.mktemp(suffix=".wav")
    
    subprocess.check_call([
        'ffmpeg', '-y', '-i', audio_path,
        '-ac', '1',
        '-ar', '16000',
        output
    ], stderr=subprocess.DEVNULL)
    
    return output
