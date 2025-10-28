"""
Processamento de Evidências - Custody Pro
Cadeia de custódia automatizada e imutável
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime
import uuid
import hashlib
import json
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/custody", tags=["Processamento Evidências"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

class AtoCreate(BaseModel):
    exam_id: str
    tipo: str  # recebimento|aquisicao|transferencia|guarda|analise|encerramento
    descricao: str
    local: Optional[str] = None
    lacre: Optional[str] = None
    hashes: Optional[Dict] = None
    fotos: Optional[list] = None

def calcular_hash_blockchain(hash_prev: Optional[str], dados: dict) -> str:
    dados_str = json.dumps(dados, sort_keys=True)
    if hash_prev:
        dados_str = hash_prev + dados_str
    return hashlib.sha256(dados_str.encode()).hexdigest()

@router.post("/atos")
async def adicionar_ato_custodia(ato: AtoCreate):
    """Adiciona ato à cadeia de custódia com hash encadeado"""
    
    # Busca último ato
    ultimo = await db.custody_chain.find_one(
        {"exam_id": ato.exam_id},
        sort=[("timestamp", -1)]
    )
    
    hash_prev = ultimo.get("hash_curr") if ultimo else None
    
    # Calcula hash atual
    ato_data = {
        **ato.dict(),
        "timestamp": datetime.now().isoformat(),
        "user": "system"
    }
    
    hash_curr = calcular_hash_blockchain(hash_prev, ato_data)
    
    ato_completo = {
        "id": str(uuid.uuid4()),
        **ato_data,
        "hash_prev": hash_prev,
        "hash_curr": hash_curr
    }
    
    await db.custody_chain.insert_one(ato_completo)
    
    return {
        "success": True,
        "ato_id": ato_completo["id"],
        "hash_curr": hash_curr,
        "message": f"Ato '{ato.tipo}' registrado na cadeia"
    }

@router.get("/chain/{exam_id}")
async def obter_cadeia(exam_id: str):
    """Obtém cadeia de custódia completa"""
    
    atos = await db.custody_chain.find({"exam_id": exam_id}).sort("timestamp", 1).to_list(100)
    
    # Verifica integridade
    integridade_ok = True
    for i in range(1, len(atos)):
        if atos[i].get("hash_prev") != atos[i-1].get("hash_curr"):
            integridade_ok = False
            break
    
    return {
        "success": True,
        "atos": atos,
        "total_atos": len(atos),
        "integridade": "OK" if integridade_ok else "FALHA"
    }

@router.get("/stats")
async def stats_custody():
    total_atos = await db.custody_chain.count_documents({})
    
    return {"success": True, "total_atos": total_atos}
