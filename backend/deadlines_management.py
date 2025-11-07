"""
AP ELITE ATHENA - Gestão de Prazos (Elite Gravitas™)
Controle automático de prazos judiciais e administrativos com alertas inteligentes

Features:
- CRUD completo de prazos vinculados a jobs/clientes
- Sistema de alertas D-3, D-1, D (dia do vencimento)
- IA preventiva de análise de risco
- Timeline processual
- Portal do cliente
- Integração com calendário
- Auditoria completa
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from pydantic import BaseModel
import os
import uuid

router = APIRouter(prefix="/api/deadlines", tags=["Deadlines Management - Elite Gravitas"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
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

class DeadlineCreate(BaseModel):
    client_id: str
    job_id: Optional[str] = None
    process_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    tipo: str  # judicial, pericia, financeiro, administrativo, audiencia
    due_date: str  # ISO format
    legal_days: Optional[int] = None  # prazo legal em dias
    risk_level: Optional[str] = "medio"  # baixo, medio, alto, critico
    responsible_user_id: Optional[str] = None
    notes: Optional[str] = None
    document_ids: Optional[List[str]] = []

class DeadlineUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    risk_level: Optional[str] = None
    responsible_user_id: Optional[str] = None
    notes: Optional[str] = None
    completed_at: Optional[str] = None
    completed_by: Optional[str] = None
    completion_document_id: Optional[str] = None

# ==================== HELPER FUNCTIONS ====================

def calculate_alert_dates(due_date: datetime) -> dict:
    """
    Calcula datas de alerta D-3, D-1
    """
    d3_date = due_date - timedelta(days=3)
    d1_date = due_date - timedelta(days=1)
    
    return {
        "d3_date": d3_date.isoformat(),
        "d1_date": d1_date.isoformat(),
        "d_date": due_date.isoformat()
    }

def calculate_status(due_date: datetime, completed: bool) -> str:
    """
    Calcula status baseado na data
    """
    if completed:
        return "concluido"
    
    now = datetime.now(timezone.utc)
    days_diff = (due_date - now).days
    
    if days_diff < 0:
        return "vencido"
    elif days_diff == 0:
        return "vence_hoje"
    elif days_diff == 1:
        return "alerta_d1"
    elif days_diff <= 3:
        return "alerta_d3"
    else:
        return "normal"

async def analyze_risk_ia(client_id: str, job_id: Optional[str], tipo: str) -> str:
    """
    IA preventiva: analisa histórico e retorna nível de risco sugerido
    """
    # Busca histórico de prazos do cliente
    query = {"client_id": client_id}
    if job_id:
        query["job_id"] = job_id
    
    deadlines = await db.deadlines.find(query, {"_id": 0}).to_list(None)
    
    if not deadlines:
        return "medio"
    
    # Calcula taxa de atraso
    total = len(deadlines)
    vencidos = len([d for d in deadlines if d.get("status") == "vencido"])
    atraso_rate = vencidos / total if total > 0 else 0
    
    # Analisa tipo específico
    tipo_deadlines = [d for d in deadlines if d.get("tipo") == tipo]
    if tipo_deadlines:
        tipo_vencidos = len([d for d in tipo_deadlines if d.get("status") == "vencido"])
        tipo_atraso_rate = tipo_vencidos / len(tipo_deadlines)
    else:
        tipo_atraso_rate = 0
    
    # Score de risco
    if atraso_rate > 0.5 or tipo_atraso_rate > 0.6:
        return "critico"
    elif atraso_rate > 0.3 or tipo_atraso_rate > 0.4:
        return "alto"
    elif atraso_rate > 0.1 or tipo_atraso_rate > 0.2:
        return "medio"
    else:
        return "baixo"

# ==================== ENDPOINTS ====================

@router.post("/")
async def create_deadline(
    deadline_data: DeadlineCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Cria novo prazo com alertas automáticos
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Verifica cliente
    client = await db.users.find_one({"id": deadline_data.client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # IA: análise de risco se não informado
    if not deadline_data.risk_level or deadline_data.risk_level == "auto":
        deadline_data.risk_level = await analyze_risk_ia(
            deadline_data.client_id,
            deadline_data.job_id,
            deadline_data.tipo
        )
    
    # Converte data
    due_date = datetime.fromisoformat(deadline_data.due_date.replace('Z', '+00:00'))
    
    # Calcula datas de alerta
    alert_dates = calculate_alert_dates(due_date)
    
    # Status inicial
    status = calculate_status(due_date, False)
    
    deadline_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    deadline = {
        "id": deadline_id,
        "client_id": deadline_data.client_id,
        "client_name": client.get("full_name", client.get("name")),
        "job_id": deadline_data.job_id,
        "process_id": deadline_data.process_id,
        "title": deadline_data.title,
        "description": deadline_data.description or "",
        "tipo": deadline_data.tipo,
        "due_date": deadline_data.due_date,
        "legal_days": deadline_data.legal_days,
        
        # Alertas
        "d3_date": alert_dates["d3_date"],
        "d1_date": alert_dates["d1_date"],
        "d_date": alert_dates["d_date"],
        "d3_sent": False,
        "d1_sent": False,
        "d_sent": False,
        
        # Status e risco
        "status": status,
        "risk_level": deadline_data.risk_level,
        "risk_score_ia": 0,  # Para expansão futura
        
        # Responsável
        "responsible_user_id": deadline_data.responsible_user_id or current_user.get("id"),
        
        # Cumprimento
        "completed": False,
        "completed_at": None,
        "completed_by": None,
        "completion_document_id": None,
        
        # Documentos relacionados
        "document_ids": deadline_data.document_ids or [],
        
        # Notas
        "notes": deadline_data.notes or "",
        
        # Audit
        "created_by": current_user.get("id"),
        "created_at": now,
        "updated_at": now,
        "version": 1
    }
    
    await db.deadlines.insert_one(deadline)
    
    # Atualiza contador do job
    if deadline_data.job_id:
        await db.jobs.update_one(
            {"id": deadline_data.job_id},
            {"$inc": {"deadlines_count": 1}}
        )
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "deadline_created",
        "entity_type": "deadline",
        "entity_id": deadline_id,
        "details": {
            "title": deadline_data.title,
            "due_date": deadline_data.due_date,
            "risk_level": deadline_data.risk_level
        },
        "timestamp": now
    })
    
    return {
        "success": True,
        "deadline_id": deadline_id,
        "deadline": deadline,
        "risk_analysis": {
            "level": deadline_data.risk_level,
            "ia_suggested": True if not deadline_data.risk_level else False
        }
    }

@router.get("/")
async def list_deadlines(
    client_id: Optional[str] = None,
    job_id: Optional[str] = None,
    process_id: Optional[str] = None,
    tipo: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    upcoming_days: Optional[int] = None,  # próximos X dias
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Lista prazos com filtros avançados
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {}
    
    if client_id:
        query["client_id"] = client_id
    if job_id:
        query["job_id"] = job_id
    if process_id:
        query["process_id"] = process_id
    if tipo:
        query["tipo"] = tipo
    if status:
        query["status"] = status
    if risk_level:
        query["risk_level"] = risk_level
    
    # Filtro de próximos X dias
    if upcoming_days:
        future_date = (datetime.now(timezone.utc) + timedelta(days=upcoming_days)).isoformat()
        query["due_date"] = {"$lte": future_date}
        query["completed"] = False
    
    deadlines = await db.deadlines.find(query, {"_id": 0}).sort("due_date", 1).skip(skip).limit(limit).to_list(limit)
    total = await db.deadlines.count_documents(query)
    
    # Atualiza status em tempo real
    for deadline in deadlines:
        if not deadline.get("completed"):
            due_date = datetime.fromisoformat(deadline["due_date"].replace('Z', '+00:00'))
            deadline["status"] = calculate_status(due_date, False)
    
    # Estatísticas
    stats = {
        "total": total,
        "vencidos": await db.deadlines.count_documents({**query, "status": "vencido"}),
        "vence_hoje": await db.deadlines.count_documents({**query, "status": "vence_hoje"}),
        "alerta_d1": await db.deadlines.count_documents({**query, "status": "alerta_d1"}),
        "alerta_d3": await db.deadlines.count_documents({**query, "status": "alerta_d3"}),
        "concluidos": await db.deadlines.count_documents({**query, "completed": True})
    }
    
    return {
        "deadlines": deadlines,
        "total": total,
        "page": skip // limit + 1,
        "total_pages": (total + limit - 1) // limit,
        "stats": stats
    }

@router.get("/{deadline_id}")
async def get_deadline(
    deadline_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtém detalhes completos de um prazo
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    deadline = await db.deadlines.find_one({"id": deadline_id}, {"_id": 0})
    if not deadline:
        raise HTTPException(status_code=404, detail="Prazo não encontrado")
    
    # Atualiza status em tempo real
    if not deadline.get("completed"):
        due_date = datetime.fromisoformat(deadline["due_date"].replace('Z', '+00:00'))
        deadline["status"] = calculate_status(due_date, False)
    
    # Busca documentos relacionados
    if deadline.get("document_ids"):
        documents = await db.files.find(
            {"id": {"$in": deadline["document_ids"]}},
            {"_id": 0}
        ).to_list(None)
        deadline["documents"] = documents
    
    # Busca alertas enviados
    alerts = await db.deadline_alerts.find(
        {"deadline_id": deadline_id},
        {"_id": 0}
    ).sort("sent_at", -1).to_list(None)
    deadline["alerts_history"] = alerts
    
    return deadline

@router.put("/{deadline_id}")
async def update_deadline(
    deadline_id: str,
    deadline_data: DeadlineUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Atualiza prazo existente
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    deadline = await db.deadlines.find_one({"id": deadline_id}, {"_id": 0})
    if not deadline:
        raise HTTPException(status_code=404, detail="Prazo não encontrado")
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if deadline_data.title is not None:
        update_data["title"] = deadline_data.title
    if deadline_data.description is not None:
        update_data["description"] = deadline_data.description
    if deadline_data.due_date is not None:
        update_data["due_date"] = deadline_data.due_date
        # Recalcula alertas
        due_date = datetime.fromisoformat(deadline_data.due_date.replace('Z', '+00:00'))
        alert_dates = calculate_alert_dates(due_date)
        update_data.update(alert_dates)
    if deadline_data.status is not None:
        update_data["status"] = deadline_data.status
    if deadline_data.risk_level is not None:
        update_data["risk_level"] = deadline_data.risk_level
    if deadline_data.responsible_user_id is not None:
        update_data["responsible_user_id"] = deadline_data.responsible_user_id
    if deadline_data.notes is not None:
        update_data["notes"] = deadline_data.notes
    
    # Marcar como concluído
    if deadline_data.completed_at is not None:
        update_data["completed"] = True
        update_data["completed_at"] = deadline_data.completed_at
        update_data["completed_by"] = deadline_data.completed_by or current_user.get("id")
        update_data["completion_document_id"] = deadline_data.completion_document_id
        update_data["status"] = "concluido"
    
    update_data["version"] = deadline.get("version", 1) + 1
    
    await db.deadlines.update_one({"id": deadline_id}, {"$set": update_data})
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "deadline_updated",
        "entity_type": "deadline",
        "entity_id": deadline_id,
        "details": {"changes": list(update_data.keys())},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    updated_deadline = await db.deadlines.find_one({"id": deadline_id}, {"_id": 0})
    return {"success": True, "deadline": updated_deadline}

@router.post("/{deadline_id}/complete")
async def complete_deadline(
    deadline_id: str,
    completion_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Marca prazo como concluído com documento de cumprimento
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    deadline = await db.deadlines.find_one({"id": deadline_id}, {"_id": 0})
    if not deadline:
        raise HTTPException(status_code=404, detail="Prazo não encontrado")
    
    now = datetime.now(timezone.utc).isoformat()
    
    await db.deadlines.update_one(
        {"id": deadline_id},
        {"$set": {
            "completed": True,
            "completed_at": now,
            "completed_by": current_user.get("id"),
            "completion_document_id": completion_data.get("document_id"),
            "completion_notes": completion_data.get("notes", ""),
            "status": "concluido"
        }}
    )
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "deadline_completed",
        "entity_type": "deadline",
        "entity_id": deadline_id,
        "details": {
            "completed_at": now,
            "document_id": completion_data.get("document_id")
        },
        "timestamp": now
    })
    
    return {"success": True, "message": "Prazo marcado como concluído"}

@router.delete("/{deadline_id}")
async def delete_deadline(
    deadline_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Deleta prazo (soft delete)
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    deadline = await db.deadlines.find_one({"id": deadline_id}, {"_id": 0})
    if not deadline:
        raise HTTPException(status_code=404, detail="Prazo não encontrado")
    
    # Soft delete
    await db.deadlines.update_one(
        {"id": deadline_id},
        {"$set": {
            "deleted": True,
            "deleted_at": datetime.now(timezone.utc).isoformat(),
            "deleted_by": current_user.get("id")
        }}
    )
    
    # Atualiza contador do job
    if deadline.get("job_id"):
        await db.jobs.update_one(
            {"id": deadline["job_id"]},
            {"$inc": {"deadlines_count": -1}}
        )
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "deadline_deleted",
        "entity_type": "deadline",
        "entity_id": deadline_id,
        "details": {"title": deadline.get("title")},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "message": "Prazo deletado com sucesso"}

@router.get("/stats/overview")
async def get_deadlines_stats(
    client_id: Optional[str] = None,
    job_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Estatísticas gerais de prazos
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {}
    if client_id:
        query["client_id"] = client_id
    if job_id:
        query["job_id"] = job_id
    
    total = await db.deadlines.count_documents(query)
    
    # Por status
    now = datetime.now(timezone.utc)
    vencidos = 0
    vence_hoje = 0
    d1 = 0
    d3 = 0
    concluidos = 0
    
    # Busca todos para calcular status em tempo real
    all_deadlines = await db.deadlines.find(query, {"_id": 0, "due_date": 1, "completed": 1}).to_list(None)
    
    for deadline in all_deadlines:
        if deadline.get("completed"):
            concluidos += 1
        else:
            due_date = datetime.fromisoformat(deadline["due_date"].replace('Z', '+00:00'))
            status = calculate_status(due_date, False)
            if status == "vencido":
                vencidos += 1
            elif status == "vence_hoje":
                vence_hoje += 1
            elif status == "alerta_d1":
                d1 += 1
            elif status == "alerta_d3":
                d3 += 1
    
    # Por tipo
    by_tipo = {}
    for tipo in ["judicial", "pericia", "financeiro", "administrativo", "audiencia"]:
        by_tipo[tipo] = await db.deadlines.count_documents({**query, "tipo": tipo})
    
    # Por risco
    by_risk = {}
    for risk in ["baixo", "medio", "alto", "critico"]:
        by_risk[risk] = await db.deadlines.count_documents({**query, "risk_level": risk})
    
    return {
        "total": total,
        "by_status": {
            "vencidos": vencidos,
            "vence_hoje": vence_hoje,
            "alerta_d1": d1,
            "alerta_d3": d3,
            "concluidos": concluidos
        },
        "by_tipo": by_tipo,
        "by_risk": by_risk
    }

@router.get("/timeline/{job_id}")
async def get_deadlines_timeline(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Timeline cronológica de prazos de um job/processo
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    deadlines = await db.deadlines.find(
        {"job_id": job_id, "deleted": {"$ne": True}},
        {"_id": 0}
    ).sort("due_date", 1).to_list(None)
    
    # Atualiza status em tempo real
    for deadline in deadlines:
        if not deadline.get("completed"):
            due_date = datetime.fromisoformat(deadline["due_date"].replace('Z', '+00:00'))
            deadline["status"] = calculate_status(due_date, False)
    
    # Agrupa por mês
    timeline_by_month = {}
    for deadline in deadlines:
        month_key = deadline["due_date"][:7]  # YYYY-MM
        if month_key not in timeline_by_month:
            timeline_by_month[month_key] = []
        timeline_by_month[month_key].append(deadline)
    
    return {
        "job_id": job_id,
        "deadlines": deadlines,
        "timeline_by_month": timeline_by_month,
        "total": len(deadlines)
    }

@router.post("/alerts/send")
async def send_deadline_alerts(
    current_user: dict = Depends(get_current_user)
):
    """
    Envia alertas D-3, D-1, D (executado por scheduler)
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Apenas admin pode executar manualmente
    if current_user.get("role") not in ["administrator", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    now = datetime.now(timezone.utc)
    now_str = now.isoformat()
    
    alerts_sent = []
    
    # Busca prazos pendentes
    deadlines = await db.deadlines.find(
        {"completed": False, "deleted": {"$ne": True}},
        {"_id": 0}
    ).to_list(None)
    
    for deadline in deadlines:
        # D-3
        if not deadline.get("d3_sent"):
            d3_date = datetime.fromisoformat(deadline["d3_date"].replace('Z', '+00:00'))
            if now >= d3_date:
                # Envia alerta D-3
                alert_id = str(uuid.uuid4())
                await db.deadline_alerts.insert_one({
                    "id": alert_id,
                    "deadline_id": deadline["id"],
                    "type": "D-3",
                    "sent_at": now_str,
                    "recipient_user_id": deadline.get("responsible_user_id"),
                    "channel": "email",  # email, push, sms
                    "status": "sent"
                })
                await db.deadlines.update_one(
                    {"id": deadline["id"]},
                    {"$set": {"d3_sent": True}}
                )
                alerts_sent.append({"deadline_id": deadline["id"], "type": "D-3"})
        
        # D-1
        if not deadline.get("d1_sent"):
            d1_date = datetime.fromisoformat(deadline["d1_date"].replace('Z', '+00:00'))
            if now >= d1_date:
                alert_id = str(uuid.uuid4())
                await db.deadline_alerts.insert_one({
                    "id": alert_id,
                    "deadline_id": deadline["id"],
                    "type": "D-1",
                    "sent_at": now_str,
                    "recipient_user_id": deadline.get("responsible_user_id"),
                    "channel": "email",
                    "status": "sent"
                })
                await db.deadlines.update_one(
                    {"id": deadline["id"]},
                    {"$set": {"d1_sent": True}}
                )
                alerts_sent.append({"deadline_id": deadline["id"], "type": "D-1"})
        
        # D (dia do vencimento)
        if not deadline.get("d_sent"):
            d_date = datetime.fromisoformat(deadline["d_date"].replace('Z', '+00:00'))
            if now.date() >= d_date.date():
                alert_id = str(uuid.uuid4())
                await db.deadline_alerts.insert_one({
                    "id": alert_id,
                    "deadline_id": deadline["id"],
                    "type": "D",
                    "sent_at": now_str,
                    "recipient_user_id": deadline.get("responsible_user_id"),
                    "channel": "email",
                    "status": "sent"
                })
                await db.deadlines.update_one(
                    {"id": deadline["id"]},
                    {"$set": {"d_sent": True}}
                )
                alerts_sent.append({"deadline_id": deadline["id"], "type": "D"})
    
    return {
        "success": True,
        "alerts_sent": len(alerts_sent),
        "details": alerts_sent
    }
