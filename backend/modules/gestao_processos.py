"""
Módulo: Gestão de Processos Jurídicos
Sistema completo de controle de processos judiciais
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

# MongoDB connection
from server import db

router = APIRouter(prefix="/api/athena", tags=["Gestão de Processos"])

# ==================== MODELS ====================

class ProcessCreate(BaseModel):
    """Modelo para criação de processo"""
    numero_processo: str
    titulo: str
    comarca: str
    vara: str
    tipo: str  # civel, criminal, trabalhista, tributario
    cliente: str
    parte_contraria: str
    advogado_responsavel: str
    valor_causa: Optional[float] = None
    data_distribuicao: Optional[str] = None
    status: str = "em_andamento"  # em_andamento, suspenso, arquivado, concluido
    prioridade: str = "normal"  # baixa, normal, alta, urgente
    observacoes: Optional[str] = None

# ==================== ROTAS ====================

@router.get("/processes")
async def list_processes(
    status: Optional[str] = None,
    tipo: Optional[str] = None,
    prioridade: Optional[str] = None
):
    """Lista todos os processos jurídicos"""
    try:
        query = {}
        
        if status:
            query["status"] = status
        if tipo:
            query["tipo"] = tipo
        if prioridade:
            query["prioridade"] = prioridade
        
        processes = await db.processes.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
        
        return {
            "processes": processes,
            "total": len(processes)
        }
    except Exception as e:
        print(f"Error listing processes: {e}")
        return {
            "processes": [],
            "total": 0
        }

@router.post("/processes")
async def create_process(data: ProcessCreate):
    """Cria novo processo jurídico"""
    process_id = str(uuid.uuid4())
    
    process = {
        "id": process_id,
        "numero_processo": data.numero_processo,
        "titulo": data.titulo,
        "comarca": data.comarca,
        "vara": data.vara,
        "tipo": data.tipo,
        "cliente": data.cliente,
        "parte_contraria": data.parte_contraria,
        "advogado_responsavel": data.advogado_responsavel,
        "valor_causa": data.valor_causa,
        "data_distribuicao": data.data_distribuicao,
        "status": data.status,
        "prioridade": data.prioridade,
        "observacoes": data.observacoes,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "andamentos": [],
        "documentos": [],
        "prazos": []
    }
    
    await db.processes.insert_one(process)
    
    return {
        "id": process_id,
        "message": "Processo criado com sucesso",
        "numero_processo": data.numero_processo
    }

@router.get("/processes/{process_id}")
async def get_process(process_id: str):
    """Obtém detalhes de um processo específico"""
    process = await db.processes.find_one({"id": process_id}, {"_id": 0})
    if not process:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    return process

@router.put("/processes/{process_id}")
async def update_process(process_id: str, data: dict):
    """Atualiza um processo"""
    process = await db.processes.find_one({"id": process_id})
    if not process:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    update_data = {k: v for k, v in data.items() if k != "id"}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.processes.update_one(
        {"id": process_id},
        {"$set": update_data}
    )
    
    return {"message": "Processo atualizado com sucesso"}

@router.delete("/processes/{process_id}")
async def delete_process(process_id: str):
    """Exclui um processo"""
    result = await db.processes.delete_one({"id": process_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    return {"message": "Processo excluído com sucesso"}

@router.post("/processes/{process_id}/andamento")
async def add_andamento(process_id: str, andamento: dict):
    """Adiciona andamento ao processo"""
    process = await db.processes.find_one({"id": process_id})
    if not process:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    andamento_data = {
        "id": str(uuid.uuid4()),
        "data": andamento.get("data", datetime.now(timezone.utc).isoformat()),
        "tipo": andamento.get("tipo", "movimentacao"),
        "descricao": andamento.get("descricao", ""),
        "responsavel": andamento.get("responsavel", "")
    }
    
    await db.processes.update_one(
        {"id": process_id},
        {
            "$push": {"andamentos": andamento_data},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return {"message": "Andamento adicionado com sucesso"}

@router.get("/processes/stats")
async def get_process_stats():
    """Estatísticas de processos"""
    total = await db.processes.count_documents({})
    em_andamento = await db.processes.count_documents({"status": "em_andamento"})
    concluidos = await db.processes.count_documents({"status": "concluido"})
    suspensos = await db.processes.count_documents({"status": "suspenso"})
    arquivados = await db.processes.count_documents({"status": "arquivado"})
    
    # Contar por tipo
    civeis = await db.processes.count_documents({"tipo": "civel"})
    criminais = await db.processes.count_documents({"tipo": "criminal"})
    trabalhistas = await db.processes.count_documents({"tipo": "trabalhista"})
    
    return {
        "total": total,
        "em_andamento": em_andamento,
        "concluidos": concluidos,
        "suspensos": suspensos,
        "arquivados": arquivados,
        "por_tipo": {
            "civel": civeis,
            "criminal": criminais,
            "trabalhista": trabalhistas
        }
    }
