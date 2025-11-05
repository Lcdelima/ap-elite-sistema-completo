"""Health Check e Validação de Dependências - Elite Athena"""
from fastapi import APIRouter
import os
from typing import Dict, Any

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("/")
async def health_check():
    """Health check básico"""
    return {
        "status": "healthy",
        "service": "Elite Athena API",
        "version": "2.0"
    }


@router.get("/dependencies")
async def check_dependencies() -> Dict[str, Any]:
    """Verifica status de todas as dependências externas"""
    
    dependencies = {
        "core": {},
        "optional": {},
        "integrations": {}
    }
    
    # Core (obrigatórias)
    dependencies["core"]["mongodb"] = {
        "required": True,
        "configured": bool(os.getenv('MONGO_URL')),
        "status": "ok" if os.getenv('MONGO_URL') else "missing"
    }
    
    dependencies["core"]["database_name"] = {
        "required": True,
        "configured": bool(os.getenv('DB_NAME')),
        "status": "ok" if os.getenv('DB_NAME') else "missing"
    }
    
    dependencies["core"]["emergent_llm_key"] = {
        "required": True,
        "configured": bool(os.getenv('EMERGENT_LLM_KEY')),
        "status": "ok" if os.getenv('EMERGENT_LLM_KEY') else "missing"
    }
    
    # Optional (features específicas)
    dependencies["optional"]["postgresql"] = {
        "required": False,
        "configured": bool(os.getenv('POSTGRES_URL')),
        "status": "ok" if os.getenv('POSTGRES_URL') else "not_configured",
        "enables": ["ERBs analysis", "Advanced geolocation"]
    }
    
    dependencies["optional"]["redis"] = {
        "required": False,
        "configured": bool(os.getenv('REDIS_URL')),
        "status": "ok" if os.getenv('REDIS_URL') else "not_configured",
        "enables": ["Session caching", "Rate limiting"]
    }
    
    dependencies["optional"]["tesseract"] = {
        "required": False,
        "configured": bool(os.getenv('TESSERACT_PATH')),
        "status": "ok" if os.getenv('TESSERACT_PATH') else "not_configured",
        "enables": ["Advanced OCR"]
    }
    
    dependencies["optional"]["ffmpeg"] = {
        "required": False,
        "configured": bool(os.getenv('FFMPEG_PATH')),
        "status": "ok" if os.getenv('FFMPEG_PATH') else "not_configured",
        "enables": ["Video analysis", "Audio extraction"]
    }
    
    # Integrations (third-party)
    dependencies["integrations"]["google_maps"] = {
        "required": False,
        "configured": bool(os.getenv('GOOGLE_MAPS_API_KEY')),
        "status": "ok" if os.getenv('GOOGLE_MAPS_API_KEY') else "not_configured",
        "enables": ["Maps visualization", "Geolocation"]
    }
    
    dependencies["integrations"]["stripe"] = {
        "required": False,
        "configured": bool(os.getenv('STRIPE_SECRET_KEY')),
        "status": "ok" if os.getenv('STRIPE_SECRET_KEY') else "not_configured",
        "enables": ["Payment processing"]
    }
    
    dependencies["integrations"]["aws_s3"] = {
        "required": False,
        "configured": bool(os.getenv('AWS_ACCESS_KEY_ID') and os.getenv('AWS_SECRET_ACCESS_KEY')),
        "status": "ok" if (os.getenv('AWS_ACCESS_KEY_ID') and os.getenv('AWS_SECRET_ACCESS_KEY')) else "not_configured",
        "enables": ["Cloud storage"]
    }
    
    # Summary
    core_ok = all(d["status"] == "ok" for d in dependencies["core"].values())
    
    return {
        "overall_status": "healthy" if core_ok else "degraded",
        "core_dependencies": dependencies["core"],
        "optional_dependencies": dependencies["optional"],
        "integrations": dependencies["integrations"],
        "message": "Todas as dependências core estão OK" if core_ok else "Dependências core faltando"
    }
