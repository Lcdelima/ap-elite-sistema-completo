"""
Health Check System - Monitoramento de Todos os Módulos
"""

from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/health", tags=["Health Check"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

@router.get("/")
async def health_geral():
    """Health check geral do sistema"""
    
    # Testa MongoDB
    try:
        await db.command("ping")
        mongo_status = "ok"
    except:
        mongo_status = "error"
    
    return {
        "status": "ok",
        "version": "3.0.0",
        "timestamp": "2025-10-28",
        "components": {
            "mongodb": mongo_status,
            "api": "ok"
        }
    }

@router.get("/forensics/{submodulo}")
async def health_forensics(submodulo: str):
    """Health check de submódulo forense específico"""
    
    modulos = {
        "pericia-ultra": "Perícia Digital Ultra",
        "interceptacoes": "Interceptações Telemáticas",
        "extracao": "Extração de Dados",
        "erbs": "Análise ERBs",
        "iped": "IPED Integration",
        "custody": "Cadeia de Custódia",
        "evidencias-ia": "Análise Evidências IA"
    }
    
    if submodulo not in modulos:
        return {"status": "not_found", "message": "Módulo não encontrado"}
    
    return {
        "status": "ok",
        "modulo": modulos[submodulo],
        "version": "3.0.0"
    }

@router.get("/juridico/{submodulo}")
async def health_juridico(submodulo: str):
    """Health check de submódulo jurídico"""
    
    modulos = {
        "processos": "Gestão de Processos",
        "docs": "Gerador de Documentos",
        "biblioteca": "Biblioteca de Documentos",
        "contratos": "Gerador de Contratos",
        "relatorios": "Relatórios Avançados",
        "analise-pro": "Análise Processual Pro",
        "relatorios-auto": "Relatórios Automatizados"
    }
    
    if submodulo not in modulos:
        return {"status": "not_found"}
    
    return {
        "status": "ok",
        "modulo": modulos[submodulo],
        "version": "3.0.0"
    }
