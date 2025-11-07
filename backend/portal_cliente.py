"""
AP ELITE ATHENA - Portal do Cliente (Elite Gravitas™)
Portal externo para clientes acessarem seus jobs, documentos e informações

Features:
- Login de cliente (escopo limitado)
- Visualização de jobs
- Download de documentos
- Upload de documentos solicitados
- Mensagens seguras
- Agendamento de atendimentos
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
import os
import uuid
import hashlib

router = APIRouter(prefix="/api/portal", tags=["Portal do Cliente - Elite Gravitas"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Security
security = HTTPBearer(auto_error=False)

async def get_client_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Auth específica para portal do cliente"""
    if not credentials:
        return None
    try:
        token_parts = credentials.credentials.split('_')
        user_id = token_parts[1]
        # Busca cliente (role='client')
        user = await db.users.find_one(
            {"id": user_id, "role": "client", "active": True},
            {"_id": 0, "password": 0}
        )
        return user
    except:
        return None

# ==================== MODELS ====================

class PortalLoginRequest(BaseModel):
    email: str
    password: str

class MessageCreate(BaseModel):
    job_id: str
    message: str
    attachments: Optional[List[str]] = []

class AppointmentRequest(BaseModel):
    date: str  # ISO format
    time: str
    type: str  # 'presencial', 'remoto', 'telefonico'
    subject: str
    notes: Optional[str] = None

# ==================== ENDPOINTS ====================

@router.post("/login")
async def portal_login(credentials: PortalLoginRequest):
    """Login específico para portal do cliente"""
    # Busca usuário cliente
    user = await db.users.find_one(
        {"email": credentials.email, "role": "client"},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    # Verifica senha (simplificado - usar hash em produção)
    password_hash = hashlib.sha256(credentials.password.encode()).hexdigest()
    if user.get("password") != password_hash:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    if not user.get("active"):
        raise HTTPException(status_code=403, detail="Conta inativa")
    
    # Retorna token e dados do cliente
    token = user.get("token", f"client_token_{user['id']}_{uuid.uuid4().hex[:8]}")
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "action": "portal_login",
        "entity_type": "user",
        "entity_id": user["id"],
        "details": {"email": credentials.email, "role": "client"},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "name": user.get("full_name", user.get("name")),
            "email": user["email"],
            "role": "client"
        }
    }

@router.get("/dashboard")
async def get_portal_dashboard(
    client_user: dict = Depends(get_client_user)
):
    """Dashboard do portal - visão geral para o cliente"""
    if not client_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    client_id = client_user.get("id")
    
    # Jobs do cliente
    jobs = await db.jobs.find(
        {"client_id": client_id, "deleted": {"$ne": True}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(None)
    
    # Estatísticas
    total_jobs = len(jobs)
    jobs_ativos = len([j for j in jobs if j.get("status") in ["novo", "em_andamento"]])
    jobs_concluidos = len([j for j in jobs if j.get("status") == "concluido"])
    
    # Próximos prazos
    job_ids = [j["id"] for j in jobs]
    upcoming_deadlines = await db.deadlines.find(
        {"job_id": {"$in": job_ids}, "completed": {"$ne": True}},
        {"_id": 0}
    ).sort("due_date", 1).limit(5).to_list(5)
    
    # Mensagens não lidas
    unread_messages = await db.messages.count_documents({
        "recipient_id": client_id,
        "read": False
    })
    
    # Documentos recentes
    recent_docs = await db.files.find(
        {"client_id": client_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "summary": {
            "total_jobs": total_jobs,
            "jobs_ativos": jobs_ativos,
            "jobs_concluidos": jobs_concluidos,
            "unread_messages": unread_messages,
            "upcoming_deadlines_count": len(upcoming_deadlines)
        },
        "jobs": jobs,
        "upcoming_deadlines": upcoming_deadlines,
        "recent_documents": recent_docs
    }

@router.get("/jobs")
async def get_client_jobs(
    status: Optional[str] = None,
    client_user: dict = Depends(get_client_user)
):
    """Lista jobs do cliente"""
    if not client_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {"client_id": client_user.get("id"), "deleted": {"$ne": True}}
    if status:
        query["status"] = status
    
    jobs = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).to_list(None)
    
    return {"jobs": jobs, "total": len(jobs)}

@router.get("/jobs/{job_id}")
async def get_client_job_details(
    job_id: str,
    client_user: dict = Depends(get_client_user)
):
    """Detalhes de um job específico"""
    if not client_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    job = await db.jobs.find_one(
        {"id": job_id, "client_id": client_user.get("id")},
        {"_id": 0}
    )
    
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    
    # Documentos do job
    files = await db.files.find(
        {"job_id": job_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(None)
    
    # Prazos do job
    deadlines = await db.deadlines.find(
        {"job_id": job_id},
        {"_id": 0}
    ).sort("due_date", 1).to_list(None)
    
    # Timeline
    timeline = await db.audit_logs.find(
        {"entity_id": job_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(20).to_list(20)
    
    job["files"] = files
    job["deadlines"] = deadlines
    job["timeline"] = timeline
    
    return job

@router.get("/documents")
async def get_client_documents(
    job_id: Optional[str] = None,
    doc_type: Optional[str] = None,
    client_user: dict = Depends(get_client_user)
):
    """Lista documentos do cliente"""
    if not client_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {"client_id": client_user.get("id")}
    if job_id:
        query["job_id"] = job_id
    if doc_type:
        query["doc_type"] = doc_type
    
    documents = await db.files.find(query, {"_id": 0}).sort("created_at", -1).to_list(None)
    
    return {"documents": documents, "total": len(documents)}

@router.get("/documents/{file_id}/download-info")
async def get_document_download_info(
    file_id: str,
    client_user: dict = Depends(get_client_user)
):
    """Informações para download (cliente não baixa diretamente, usa o endpoint principal)"""
    if not client_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    file = await db.files.find_one(
        {"id": file_id, "client_id": client_user.get("id")},
        {"_id": 0}
    )
    
    if not file:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    return {
        "file_id": file_id,
        "filename": file.get("original_filename"),
        "size": file.get("size_human"),
        "type": file.get("doc_name"),
        "download_url": f"/api/files/{file_id}/download",
        "message": "Use o endpoint /api/files/{file_id}/download com seu token de autenticação"
    }

@router.post("/messages/send")
async def send_message(
    message_data: MessageCreate,
    client_user: dict = Depends(get_client_user)
):
    """Cliente envia mensagem para a equipe"""
    if not client_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Verifica se job existe e pertence ao cliente
    job = await db.jobs.find_one(
        {"id": message_data.job_id, "client_id": client_user.get("id")},
        {"_id": 0}
    )
    
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    
    message_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    message = {
        "id": message_id,
        "job_id": message_data.job_id,
        "sender_id": client_user.get("id"),
        "sender_name": client_user.get("full_name", client_user.get("name")),
        "sender_role": "client",
        "recipient_id": job.get("responsible_user_id"),  # Envia para responsável do job
        "message": message_data.message,
        "attachments": message_data.attachments,
        "read": False,
        "created_at": now
    }
    
    await db.messages.insert_one(message)
    
    # Atualiza contador do job
    await db.jobs.update_one(
        {"id": message_data.job_id},
        {"$inc": {"messages_count": 1}}
    )
    
    return {
        "success": True,
        "message_id": message_id,
        "message": "Mensagem enviada com sucesso"
    }

@router.get("/messages")
async def get_client_messages(
    job_id: Optional[str] = None,
    unread_only: bool = False,
    client_user: dict = Depends(get_client_user)
):
    """Lista mensagens do cliente"""
    if not client_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {
        "$or": [
            {"sender_id": client_user.get("id")},
            {"recipient_id": client_user.get("id")}
        ]
    }
    
    if job_id:
        query["job_id"] = job_id
    if unread_only:
        query["read"] = False
        query["recipient_id"] = client_user.get("id")  # Apenas mensagens recebidas
    
    messages = await db.messages.find(query, {"_id": 0}).sort("created_at", -1).to_list(None)
    
    return {"messages": messages, "total": len(messages)}

@router.put("/messages/{message_id}/read")
async def mark_message_as_read(
    message_id: str,
    client_user: dict = Depends(get_client_user)
):
    """Marca mensagem como lida"""
    if not client_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    result = await db.messages.update_one(
        {"id": message_id, "recipient_id": client_user.get("id")},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada")
    
    return {"success": True, "message": "Mensagem marcada como lida"}

@router.post("/appointments/request")
async def request_appointment(
    appointment: AppointmentRequest,
    client_user: dict = Depends(get_client_user)
):
    """Cliente solicita agendamento"""
    if not client_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    appointment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    appointment_record = {
        "id": appointment_id,
        "client_id": client_user.get("id"),
        "client_name": client_user.get("full_name", client_user.get("name")),
        "date": appointment.date,
        "time": appointment.time,
        "type": appointment.type,
        "subject": appointment.subject,
        "notes": appointment.notes or "",
        "status": "pending",  # pending, confirmed, cancelled
        "requested_at": now,
        "created_at": now
    }
    
    await db.appointments.insert_one(appointment_record)
    
    return {
        "success": True,
        "appointment_id": appointment_id,
        "message": "Solicitação de agendamento enviada. Você será notificado sobre a confirmação."
    }

@router.get("/appointments")
async def get_client_appointments(
    status: Optional[str] = None,
    client_user: dict = Depends(get_client_user)
):
    """Lista agendamentos do cliente"""
    if not client_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {"client_id": client_user.get("id")}
    if status:
        query["status"] = status
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("date", 1).to_list(None)
    
    return {"appointments": appointments, "total": len(appointments)}

@router.get("/profile")
async def get_client_profile(
    client_user: dict = Depends(get_client_user)
):
    """Perfil do cliente"""
    if not client_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Busca dados completos do cliente
    client = await db.users.find_one(
        {"id": client_user.get("id")},
        {"_id": 0, "password": 0, "token": 0}
    )
    
    # Estatísticas
    total_jobs = await db.jobs.count_documents({"client_id": client_user.get("id")})
    total_documents = await db.files.count_documents({"client_id": client_user.get("id")})
    
    return {
        "profile": client,
        "stats": {
            "total_jobs": total_jobs,
            "total_documents": total_documents
        }
    }
