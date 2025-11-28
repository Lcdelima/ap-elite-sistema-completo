"""
AP ELITE ATHENA - Sistema de Gestão de Jobs (Elite Gravitas™)
Gerenciamento de trabalhos/engajamentos por cliente

Arquitetura:
- Job = engajamento/trabalho (processo judicial, perícia, contrato, consultoria)
- Um cliente pode ter múltiplos jobs
- Cada job tem tipo, status, equipe, documentos, prazos, financeiro
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
import os
import uuid
import json

router = APIRouter(prefix="/api/jobs", tags=["Jobs Management - Elite Gravitas"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "apelite_db")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Security
security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        token_parts = credentials.credentials.split('_')
        user_id = token_parts[1]
        user = await db.users.find_one({"id": user_id, "active": True}, {"_id": 0, "password": 0})
        return user
    except:
        return None

# ==================== MODELS ====================

class JobCreate(BaseModel):
    client_id: str
    type: str  # 'judicial_process', 'pericia', 'contrato', 'consultoria', 'investigacao', 'comunicacao'
    title: str
    description: Optional[str] = None
    risk_level: Optional[str] = "medio"  # 'baixo', 'medio', 'alto', 'critico'
    priority: Optional[str] = "normal"  # 'baixa', 'normal', 'alta', 'urgente'
    responsible_user_id: Optional[str] = None
    team_members: Optional[List[str]] = []
    estimated_hours: Optional[float] = None
    hourly_rate: Optional[float] = None
    fixed_fee: Optional[float] = None
    metadata: Optional[dict] = {}  # Campos específicos por tipo

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    risk_level: Optional[str] = None
    priority: Optional[str] = None
    responsible_user_id: Optional[str] = None
    team_members: Optional[List[str]] = None
    estimated_hours: Optional[float] = None
    hourly_rate: Optional[float] = None
    fixed_fee: Optional[float] = None
    metadata: Optional[dict] = None

# ==================== ENDPOINTS ====================

@router.post("/")
async def create_job(
    job_data: JobCreate,
    current_user: dict = Depends(get_current_user)
):
    """Cria novo job/trabalho para um cliente"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Verifica se cliente existe
    client = await db.clients.find_one({"id": job_data.client_id}, {"_id": 0})
    if not client:
        # Tenta buscar em users com role='client'
        client = await db.users.find_one({"id": job_data.client_id, "role": "client"}, {"_id": 0})
        if not client:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    job_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Gera número do job (formato: JOB-YYYYMMDD-XXXXX)
    date_str = datetime.now().strftime("%Y%m%d")
    job_number = f"JOB-{date_str}-{job_id[:8].upper()}"
    
    job = {
        "id": job_id,
        "job_number": job_number,
        "client_id": job_data.client_id,
        "client_name": client.get("name", client.get("full_name", "")),
        "type": job_data.type,
        "title": job_data.title,
        "description": job_data.description or "",
        "status": "novo",  # novo, em_andamento, pausado, concluido, cancelado
        "risk_level": job_data.risk_level,
        "priority": job_data.priority,
        "responsible_user_id": job_data.responsible_user_id or current_user.get("id"),
        "team_members": job_data.team_members or [],
        "created_by": current_user.get("id"),
        "created_at": now,
        "updated_at": now,
        "opened_at": now,
        "closed_at": None,
        
        # Financeiro
        "estimated_hours": job_data.estimated_hours,
        "hours_worked": 0,
        "hourly_rate": job_data.hourly_rate,
        "fixed_fee": job_data.fixed_fee,
        "total_billed": 0,
        "total_paid": 0,
        
        # Contadores
        "files_count": 0,
        "deadlines_count": 0,
        "tasks_count": 0,
        "messages_count": 0,
        
        # Metadados específicos do tipo
        "metadata": job_data.metadata or {},
        
        # Audit
        "version": 1
    }
    
    await db.jobs.insert_one(job)
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "job_created",
        "entity_type": "job",
        "entity_id": job_id,
        "details": {"job_number": job_number, "type": job_data.type, "client_id": job_data.client_id},
        "timestamp": now
    })
    
    return {
        "success": True,
        "job_id": job_id,
        "job_number": job_number,
        "job": job
    }

@router.get("/")
async def list_jobs(
    client_id: Optional[str] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    priority: Optional[str] = None,
    responsible_user_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Lista jobs com filtros avançados"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {}
    if client_id:
        query["client_id"] = client_id
    if type:
        query["type"] = type
    if status:
        query["status"] = status
    if risk_level:
        query["risk_level"] = risk_level
    if priority:
        query["priority"] = priority
    if responsible_user_id:
        query["responsible_user_id"] = responsible_user_id
    
    jobs = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.jobs.count_documents(query)
    
    # Estatísticas por status
    stats = {}
    for st in ["novo", "em_andamento", "pausado", "concluido", "cancelado"]:
        stats[st] = await db.jobs.count_documents({**query, "status": st})
    
    return {
        "jobs": jobs,
        "total": total,
        "page": skip // limit + 1,
        "total_pages": (total + limit - 1) // limit,
        "stats": stats
    }

@router.get("/{job_id}")
async def get_job(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtém detalhes completos de um job"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    
    # Busca informações relacionadas
    files_count = await db.files.count_documents({"job_id": job_id})
    deadlines_count = await db.deadlines.count_documents({"job_id": job_id})
    
    # Próximos prazos
    upcoming_deadlines = await db.deadlines.find(
        {"job_id": job_id, "completed": {"$ne": True}},
        {"_id": 0}
    ).sort("due_date", 1).limit(5).to_list(5)
    
    # Arquivos recentes
    recent_files = await db.files.find(
        {"job_id": job_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(10).to_list(10)
    
    # Timeline (últimas atividades)
    timeline = await db.audit_logs.find(
        {"entity_id": job_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(20).to_list(20)
    
    job["files_count"] = files_count
    job["deadlines_count"] = deadlines_count
    job["upcoming_deadlines"] = upcoming_deadlines
    job["recent_files"] = recent_files
    job["timeline"] = timeline
    
    return job

@router.put("/{job_id}")
async def update_job(
    job_id: str,
    job_data: JobUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Atualiza um job existente"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    
    # Prepara update
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if job_data.title is not None:
        update_data["title"] = job_data.title
    if job_data.description is not None:
        update_data["description"] = job_data.description
    if job_data.status is not None:
        update_data["status"] = job_data.status
        # Se status mudou para concluído
        if job_data.status == "concluido" and job.get("status") != "concluido":
            update_data["closed_at"] = datetime.now(timezone.utc).isoformat()
    if job_data.risk_level is not None:
        update_data["risk_level"] = job_data.risk_level
    if job_data.priority is not None:
        update_data["priority"] = job_data.priority
    if job_data.responsible_user_id is not None:
        update_data["responsible_user_id"] = job_data.responsible_user_id
    if job_data.team_members is not None:
        update_data["team_members"] = job_data.team_members
    if job_data.estimated_hours is not None:
        update_data["estimated_hours"] = job_data.estimated_hours
    if job_data.hourly_rate is not None:
        update_data["hourly_rate"] = job_data.hourly_rate
    if job_data.fixed_fee is not None:
        update_data["fixed_fee"] = job_data.fixed_fee
    if job_data.metadata is not None:
        update_data["metadata"] = {**job.get("metadata", {}), **job_data.metadata}
    
    update_data["version"] = job.get("version", 1) + 1
    
    await db.jobs.update_one({"id": job_id}, {"$set": update_data})
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "job_updated",
        "entity_type": "job",
        "entity_id": job_id,
        "details": {"changes": list(update_data.keys())},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Retorna job atualizado
    updated_job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    return {"success": True, "job": updated_job}

@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    force: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Deleta um job (soft delete por padrão)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Verifica permissão (apenas admin ou super_admin)
    if current_user.get("role") not in ["administrator", "super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    
    if force:
        # Hard delete
        await db.jobs.delete_one({"id": job_id})
        action = "job_deleted_hard"
    else:
        # Soft delete
        await db.jobs.update_one(
            {"id": job_id},
            {"$set": {
                "deleted": True,
                "deleted_at": datetime.now(timezone.utc).isoformat(),
                "deleted_by": current_user.get("id")
            }}
        )
        action = "job_deleted_soft"
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": action,
        "entity_type": "job",
        "entity_id": job_id,
        "details": {"job_number": job.get("job_number")},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "message": "Job deletado com sucesso"}

@router.get("/types/available")
async def get_job_types(
    current_user: dict = Depends(get_current_user)
):
    """Retorna tipos de jobs disponíveis com descrições"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    job_types = [
        {
            "id": "judicial_process",
            "name": "Processo Judicial",
            "description": "Processos judiciais (cível, criminal, trabalhista, etc)",
            "icon": "Scale",
            "color": "cyan",
            "fields": ["numero_cnj", "vara", "comarca", "foro", "classe", "assunto", "fase"]
        },
        {
            "id": "pericia",
            "name": "Perícia Técnica",
            "description": "Perícias digitais, computação forense, análise técnica",
            "icon": "Microscope",
            "color": "green",
            "fields": ["tipo_pericia", "dispositivos", "metodologia", "prazo_entrega"]
        },
        {
            "id": "contrato",
            "name": "Contrato",
            "description": "Elaboração, revisão e gestão de contratos",
            "icon": "FileText",
            "color": "blue",
            "fields": ["tipo_contrato", "partes", "valor", "vigencia", "renovacao"]
        },
        {
            "id": "consultoria",
            "name": "Consultoria Jurídica",
            "description": "Consultoria, pareceres e assessoria jurídica",
            "icon": "UserCheck",
            "color": "purple",
            "fields": ["area_consultoria", "escopo", "entregaveis"]
        },
        {
            "id": "investigacao",
            "name": "Investigação",
            "description": "Investigações defensivas, OSINT, inteligência",
            "icon": "Search",
            "color": "orange",
            "fields": ["tipo_investigacao", "alvo", "fontes", "confidencialidade"]
        },
        {
            "id": "comunicacao",
            "name": "Comunicação Processual",
            "description": "Intimações, citações, notificações extrajudiciais",
            "icon": "Mail",
            "color": "yellow",
            "fields": ["tipo_comunicacao", "destinatario", "prazo_resposta"]
        },
        {
            "id": "interceptacao",
            "name": "Interceptação Telemática",
            "description": "Análise de interceptações telefônicas e telemáticas",
            "icon": "Phone",
            "color": "red",
            "fields": ["mandado", "alvo", "periodo", "operadora"]
        },
        {
            "id": "diversos",
            "name": "Outros Trabalhos",
            "description": "Outros tipos de trabalhos e demandas",
            "icon": "Briefcase",
            "color": "gray",
            "fields": []
        }
    ]
    
    return {"job_types": job_types}

@router.get("/client/{client_id}/summary")
async def get_client_jobs_summary(
    client_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Retorna resumo de todos os jobs de um cliente (para visão 360°)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Jobs do cliente
    jobs = await db.jobs.find(
        {"client_id": client_id, "deleted": {"$ne": True}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(None)
    
    # Estatísticas
    total_jobs = len(jobs)
    jobs_by_status = {}
    jobs_by_type = {}
    total_billed = 0
    total_paid = 0
    
    for job in jobs:
        status = job.get("status", "novo")
        jobs_by_status[status] = jobs_by_status.get(status, 0) + 1
        
        tipo = job.get("type", "diversos")
        jobs_by_type[tipo] = jobs_by_type.get(tipo, 0) + 1
        
        total_billed += job.get("total_billed", 0)
        total_paid += job.get("total_paid", 0)
    
    # Próximos prazos de todos os jobs
    upcoming_deadlines = await db.deadlines.find(
        {"job_id": {"$in": [j["id"] for j in jobs]}, "completed": {"$ne": True}},
        {"_id": 0}
    ).sort("due_date", 1).limit(10).to_list(10)
    
    return {
        "client_id": client_id,
        "total_jobs": total_jobs,
        "jobs_by_status": jobs_by_status,
        "jobs_by_type": jobs_by_type,
        "financial": {
            "total_billed": total_billed,
            "total_paid": total_paid,
            "pending": total_billed - total_paid
        },
        "jobs": jobs,
        "upcoming_deadlines": upcoming_deadlines
    }
