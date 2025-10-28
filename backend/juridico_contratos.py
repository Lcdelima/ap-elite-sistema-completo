"""
Gerador de Contratos
Modelos advocacia/perícia, Cálculo de honorários, Assinatura digital
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/juridico/contratos", tags=["Gerador de Contratos"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

class ContratoCreate(BaseModel):
    tipo: str  # advocacia|pericia
    cliente_id: str
    processo_id: Optional[str] = None
    valor_honorarios: float
    forma_pagamento: str
    prazo_vigencia: Optional[str] = None
    clausulas_especiais: Optional[str] = None

@router.post("/")
async def criar_contrato(contrato: ContratoCreate):
    """Cria contrato com cálculo automático"""
    
    contrato_id = str(uuid.uuid4())
    numero = f"CONT-{datetime.now().year}-{contrato_id[:8].upper()}"
    
    contrato_data = {
        "id": contrato_id,
        "numero": numero,
        **contrato.dict(),
        "status": "pendente_assinatura",
        "assinaturas": [],
        "created_at": datetime.now().isoformat()
    }
    
    await db.contratos.insert_one(contrato_data)
    
    return {
        "success": True,
        "contrato_id": contrato_id,
        "numero": numero
    }

@router.get("/")
async def listar_contratos(
    status: Optional[str] = None,
    tipo: Optional[str] = None
):
    """Lista contratos"""
    query = {}
    if status:
        query["status"] = status
    if tipo:
        query["tipo"] = tipo
    
    contratos = await db.contratos.find(query).sort("created_at", -1).to_list(100)
    
    return {"success": True, "contratos": contratos}

@router.post("/{contrato_id}/assinar")
async def assinar_contrato(contrato_id: str, assinante: str):
    """Registra assinatura"""
    
    assinatura = {
        "assinante": assinante,
        "data": datetime.now().isoformat(),
        "hash": str(uuid.uuid4())
    }
    
    await db.contratos.update_one(
        {"id": contrato_id},
        {"$push": {"assinaturas": assinatura}, "$set": {"status": "assinado"}}
    )
    
    return {"success": True}
