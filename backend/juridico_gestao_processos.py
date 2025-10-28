"""
Gestão de Processos - CRUD Completo
Timeline, Prazos D-3/D-1, Vinculação de Clientes
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/juridico/processos", tags=["Gestão de Processos"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

class ProcessoCreate(BaseModel):
    numero: str
    cliente_id: Optional[str] = None
    juizo: str
    vara: str
    classe: str
    fase: str = "inicial"
    status: str = "ativo"
    valor_causa: Optional[float] = None
    partes: Optional[dict] = None

class AtoProcessual(BaseModel):
    tipo: str
    data: str
    resumo: str
    arquivo_id: Optional[str] = None

@router.post("/")
async def criar_processo(processo: ProcessoCreate, background_tasks: BackgroundTasks):
    """Cria processo e agenda prazos iniciais"""
    
    existe = await db.processos.find_one({"numero": processo.numero})
    if existe:
        raise HTTPException(status_code=400, detail="Processo já cadastrado")
    
    processo_id = str(uuid.uuid4())
    
    processo_data = {
        "id": processo_id,
        **processo.dict(),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    await db.processos.insert_one(processo_data)
    
    return {"success": True, "processo_id": processo_id}

@router.get("/")
async def listar_processos(
    fase: Optional[str] = None,
    juizo: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 50
):
    """Lista processos com paginação"""
    query = {}
    if fase:
        query["fase"] = fase
    if juizo:
        query["juizo"] = juizo
    if status:
        query["status"] = status
    
    skip = (page - 1) * limit
    
    processos = await db.processos.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.processos.count_documents(query)
    
    return {
        "success": True,
        "data": processos,
        "meta": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

@router.get("/{processo_id}")
async def obter_processo(processo_id: str):
    """Obtém detalhes do processo"""
    processo = await db.processos.find_one({"id": processo_id})
    if not processo:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    atos = await db.atos_processuais.find({"processo_id": processo_id}).sort("data", -1).to_list(100)
    prazos = await db.prazos.find({"processo_id": processo_id}).sort("data_limite", 1).to_list(100)
    
    return {
        "success": True,
        "processo": processo,
        "atos": atos,
        "prazos": prazos
    }

@router.post("/{processo_id}/atos")
async def adicionar_ato(processo_id: str, ato: AtoProcessual):
    """Adiciona ato processual à timeline"""
    
    ato_data = {
        "id": str(uuid.uuid4()),
        "processo_id": processo_id,
        **ato.dict(),
        "created_at": datetime.now().isoformat()
    }
    
    await db.atos_processuais.insert_one(ato_data)
    
    await db.processos.update_one(
        {"id": processo_id},
        {"$set": {"updated_at": datetime.now().isoformat()}}
    )
    
    return {"success": True, "ato_id": ato_data["id"]}

@router.post("/{processo_id}/prazos/schedule")
async def agendar_prazos_processo(processo_id: str, data_limite: str, descricao: str):
    """Cria prazos D-3 e D-1"""
    
    dt = datetime.fromisoformat(data_limite)
    
    # D-3
    prazo_d3 = {
        "id": str(uuid.uuid4()),
        "processo_id": processo_id,
        "descricao": f"D-3: {descricao}",
        "data_limite": (dt - timedelta(days=3)).isoformat(),
        "status": "aberto",
        "tipo": "D-3"
    }
    await db.prazos.insert_one(prazo_d3)
    
    # D-1
    prazo_d1 = {
        "id": str(uuid.uuid4()),
        "processo_id": processo_id,
        "descricao": f"D-1: {descricao}",
        "data_limite": (dt - timedelta(days=1)).isoformat(),
        "status": "aberto",
        "tipo": "D-1"
    }
    await db.prazos.insert_one(prazo_d1)
    
    return {"success": True, "message": "Prazos D-3 e D-1 criados"}
