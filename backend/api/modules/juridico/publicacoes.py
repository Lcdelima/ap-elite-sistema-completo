"""Módulo de Publicações Judiciais - Superior ao Astrea - Elite Athena"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/publicacoes", tags=["publicacoes"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class Publicacao(BaseModel):
    id: str
    processo_id: Optional[str]
    tribunal: str
    tipo: str  # prazo, andamento, intimacao, sentenca
    conteudo: str
    data_publicacao: str
    status: str  # nao_tratada, tratada, descartada
    prioridade: str  # alta, media, baixa
    responsavel: Optional[str]
    prazo_fatal: Optional[str]
    tags: List[str]
    created_at: str
    tratada_em: Optional[str]
    tratada_por: Optional[str]
    observacoes: Optional[str]


class PublicacaoCreate(BaseModel):
    processo_id: Optional[str] = None
    tribunal: str
    tipo: str
    conteudo: str
    data_publicacao: str
    prioridade: str = "media"
    prazo_fatal: Optional[str] = None
    tags: List[str] = []


@router.post("/", response_model=Publicacao)
async def criar_publicacao(data: PublicacaoCreate):
    """Registra nova publicação judicial"""
    
    publicacao = Publicacao(
        id=str(uuid.uuid4()),
        processo_id=data.processo_id,
        tribunal=data.tribunal,
        tipo=data.tipo,
        conteudo=data.conteudo,
        data_publicacao=data.data_publicacao,
        status="nao_tratada",
        prioridade=data.prioridade,
        responsavel=None,
        prazo_fatal=data.prazo_fatal,
        tags=data.tags,
        created_at=datetime.now(timezone.utc).isoformat(),
        tratada_em=None,
        tratada_por=None,
        observacoes=None
    )
    
    await db.publicacoes.insert_one(publicacao.model_dump())
    return publicacao


@router.get("/dashboard")
async def dashboard_publicacoes():
    """Dashboard de triagem diária"""
    
    # Contar por status
    nao_tratadas = await db.publicacoes.count_documents({"status": "nao_tratada"})
    tratadas = await db.publicacoes.count_documents({"status": "tratada"})
    descartadas = await db.publicacoes.count_documents({"status": "descartada"})
    
    # Contar por prioridade (não tratadas)
    alta_prioridade = await db.publicacoes.count_documents({
        "status": "nao_tratada",
        "prioridade": "alta"
    })
    
    # Contar por tipo
    tipos_count = {}
    for tipo in ["prazo", "andamento", "intimacao", "sentenca"]:
        count = await db.publicacoes.count_documents({"tipo": tipo, "status": "nao_tratada"})
        tipos_count[tipo] = count
    
    # Próximos prazos fatais
    proximos_prazos = await db.publicacoes.find({
        "status": "nao_tratada",
        "prazo_fatal": {"$ne": None}
    }).sort("prazo_fatal", 1).limit(10).to_list(length=10)
    
    return {
        "totais": {
            "nao_tratadas": nao_tratadas,
            "tratadas": tratadas,
            "descartadas": descartadas,
            "alta_prioridade": alta_prioridade
        },
        "por_tipo": tipos_count,
        "proximos_prazos": proximos_prazos
    }


@router.get("/")
async def listar_publicacoes(
    status: Optional[str] = None,
    tribunal: Optional[str] = None,
    tipo: Optional[str] = None,
    prioridade: Optional[str] = None,
    limit: int = 50
):
    """Lista publicações com filtros avançados"""
    
    query = {}
    if status:
        query["status"] = status
    if tribunal:
        query["tribunal"] = tribunal
    if tipo:
        query["tipo"] = tipo
    if prioridade:
        query["prioridade"] = prioridade
    
    publicacoes = await db.publicacoes.find(query).sort(
        "data_publicacao", -1
    ).limit(limit).to_list(length=limit)
    
    return {
        "publicacoes": publicacoes,
        "count": len(publicacoes),
        "filters_applied": query
    }


@router.post("/{publicacao_id}/tratar")
async def marcar_como_tratada(
    publicacao_id: str,
    responsavel: str,
    observacoes: Optional[str] = None
):
    """Marca publicação como tratada"""
    
    result = await db.publicacoes.update_one(
        {"id": publicacao_id},
        {
            "$set": {
                "status": "tratada",
                "tratada_em": datetime.now(timezone.utc).isoformat(),
                "tratada_por": responsavel,
                "observacoes": observacoes
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Publicação não encontrada")
    
    return {"message": "Publicação marcada como tratada"}


@router.post("/{publicacao_id}/descartar")
async def descartar_publicacao(
    publicacao_id: str,
    motivo: Optional[str] = None
):
    """Descarta publicação irrelevante"""
    
    result = await db.publicacoes.update_one(
        {"id": publicacao_id},
        {
            "$set": {
                "status": "descartada",
                "tratada_em": datetime.now(timezone.utc).isoformat(),
                "observacoes": motivo
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Publicação não encontrada")
    
    return {"message": "Publicação descartada"}


@router.post("/{publicacao_id}/delegar")
async def delegar_publicacao(
    publicacao_id: str,
    responsavel: str
):
    """Delega publicação para responsável"""
    
    result = await db.publicacoes.update_one(
        {"id": publicacao_id},
        {"$set": {"responsavel": responsavel}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Publicação não encontrada")
    
    return {"message": f"Publicação delegada para {responsavel}"}
