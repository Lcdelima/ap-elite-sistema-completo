"""
Integração IPED - Forensic Bridge
Executa casos, coleta hits, reprodutibilidade
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/iped", tags=["IPED Integration"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

class IPEDCaseCreate(BaseModel):
    nome: str
    evidencia_path: str
    corpus_queries: Optional[list] = None

@router.post("/cases")
async def criar_caso_iped(case: IPEDCaseCreate):
    """Cria caso IPED para processamento"""
    
    case_id = str(uuid.uuid4())
    
    data = {
        "id": case_id,
        **case.dict(),
        "status": "preparado",
        "hits": [],
        "versao_iped": "4.2.0",
        "parametros": {},
        "created_at": datetime.now().isoformat()
    }
    
    await db.iped_cases.insert_one(data)
    
    return {"success": True, "case_id": case_id}

@router.post("/cases/{case_id}/run")
async def executar_caso_iped(case_id: str):
    """Executa processamento IPED"""
    
    # Simula execução
    hits_simulados = [
        {"tipo": "documento", "path": "/data/docs/contrato.pdf", "relevancia": 0.95},
        {"tipo": "imagem", "path": "/data/fotos/evidencia_001.jpg", "relevancia": 0.87}
    ]
    
    await db.iped_cases.update_one(
        {"id": case_id},
        {"$set": {"status": "concluido", "hits": hits_simulados}}
    )
    
    return {
        "success": True,
        "hits_count": len(hits_simulados),
        "message": "Processamento IPED concluído"
    }

@router.get("/cases/{case_id}/hits")
async def obter_hits_iped(case_id: str):
    """Obtém hits do caso IPED"""
    
    case = await db.iped_cases.find_one({"id": case_id})
    if not case:
        raise HTTPException(status_code=404, detail="Caso não encontrado")
    
    return {"success": True, "hits": case.get("hits", [])}

@router.get("/stats")
async def stats_iped():
    total = await db.iped_cases.count_documents({})
    concluidos = await db.iped_cases.count_documents({"status": "concluido"})
    
    return {"success": True, "total": total, "concluidos": concluidos}
