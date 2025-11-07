"""
AP ELITE ATHENA - Sistema de Auditoria (Elite Gravitas™)
Audit trail completo com log de ações, IP, device e compliance

Features:
- Log automático de todas as ações
- IP, device, user agent
- Filtros avançados
- Compliance LGPD/ISO 27001
- Retenção configurada
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from pydantic import BaseModel
import os
import uuid

router = APIRouter(prefix="/api/audit", tags=["Audit Trail - Elite Gravitas"])

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

# ==================== HELPER FUNCTIONS ====================

async def log_action(
    user_id: str,
    action: str,
    entity_type: str,
    entity_id: str,
    details: dict = {},
    request: Optional[Request] = None
):
    """Função helper para criar logs de auditoria"""
    log_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Extraí informações do request
    ip_address = None
    user_agent = None
    device_info = {}
    
    if request:
        # IP real (considera proxy/load balancer)
        ip_address = request.headers.get("X-Forwarded-For", request.client.host if request.client else None)
        if ip_address and "," in ip_address:
            ip_address = ip_address.split(",")[0].strip()
        
        user_agent = request.headers.get("User-Agent")
        
        # Device fingerprint básico
        device_info = {
            "user_agent": user_agent,
            "accept_language": request.headers.get("Accept-Language"),
            "platform": "web"  # Pode ser detectado do user_agent
        }
    
    audit_log = {
        "id": log_id,
        "user_id": user_id,
        "action": action,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "details": details,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "device_info": device_info,
        "timestamp": now,
        "created_at": now
    }
    
    await db.audit_logs.insert_one(audit_log)
    return log_id

# ==================== ENDPOINTS ====================

@router.get("/logs")
async def get_audit_logs(
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    """Lista logs de auditoria com filtros avançados"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Apenas admin pode ver todos os logs
    if current_user.get("role") not in ["administrator", "super_admin", "admin"]:
        # Usuários normais só veem seus próprios logs
        user_id = current_user.get("id")
    
    query = {}
    if user_id:
        query["user_id"] = user_id
    if action:
        query["action"] = action
    if entity_type:
        query["entity_type"] = entity_type
    if entity_id:
        query["entity_id"] = entity_id
    
    # Filtro de data
    if start_date or end_date:
        query["timestamp"] = {}
        if start_date:
            query["timestamp"]["$gte"] = start_date
        if end_date:
            query["timestamp"]["$lte"] = end_date
    
    logs = await db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.audit_logs.count_documents(query)
    
    return {
        "logs": logs,
        "total": total,
        "page": skip // limit + 1,
        "total_pages": (total + limit - 1) // limit
    }

@router.get("/logs/{log_id}")
async def get_audit_log_details(
    log_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Detalhes de um log específico"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    log = await db.audit_logs.find_one({"id": log_id}, {"_id": 0})
    if not log:
        raise HTTPException(status_code=404, detail="Log não encontrado")
    
    # Verifica permissão
    if current_user.get("role") not in ["administrator", "super_admin", "admin"]:
        if log.get("user_id") != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Permissão negada")
    
    return log

@router.get("/stats")
async def get_audit_stats(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Estatísticas de auditoria"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Apenas admin
    if current_user.get("role") not in ["administrator", "super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    query = {}
    if start_date or end_date:
        query["timestamp"] = {}
        if start_date:
            query["timestamp"]["$gte"] = start_date
        if end_date:
            query["timestamp"]["$lte"] = end_date
    
    # Total de logs
    total_logs = await db.audit_logs.count_documents(query)
    
    # Logs por ação (top 10)
    actions_pipeline = [
        {"$match": query},
        {"$group": {"_id": "$action", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    actions = await db.audit_logs.aggregate(actions_pipeline).to_list(10)
    actions_stats = {item["_id"]: item["count"] for item in actions}
    
    # Logs por usuário (top 10)
    users_pipeline = [
        {"$match": query},
        {"$group": {"_id": "$user_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    users = await db.audit_logs.aggregate(users_pipeline).to_list(10)
    users_stats = {item["_id"]: item["count"] for item in users}
    
    # Logs por tipo de entidade
    entities_pipeline = [
        {"$match": query},
        {"$group": {"_id": "$entity_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    entities = await db.audit_logs.aggregate(entities_pipeline).to_list(None)
    entities_stats = {item["_id"]: item["count"] for item in entities}
    
    return {
        "total_logs": total_logs,
        "by_action": actions_stats,
        "by_user": users_stats,
        "by_entity_type": entities_stats
    }

@router.get("/user/{user_id}/activity")
async def get_user_activity(
    user_id: str,
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Atividade de um usuário específico"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Verifica permissão
    if current_user.get("role") not in ["administrator", "super_admin", "admin"]:
        if user_id != current_user.get("id"):
            raise HTTPException(status_code=403, detail="Permissão negada")
    
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    logs = await db.audit_logs.find(
        {"user_id": user_id, "timestamp": {"$gte": start_date}},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(None)
    
    # Agrupa por dia
    activity_by_day = {}
    for log in logs:
        date = log["timestamp"][:10]  # YYYY-MM-DD
        if date not in activity_by_day:
            activity_by_day[date] = []
        activity_by_day[date].append(log)
    
    return {
        "user_id": user_id,
        "period_days": days,
        "total_actions": len(logs),
        "activity_by_day": activity_by_day,
        "recent_logs": logs[:50]  # Últimas 50
    }

@router.delete("/cleanup")
async def cleanup_old_logs(
    days: int = 365,
    dry_run: bool = True,
    current_user: dict = Depends(get_current_user)
):
    """Remove logs antigos (política de retenção)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Apenas super_admin
    if current_user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Apenas super_admin pode executar limpeza")
    
    cutoff_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    # Conta logs que seriam deletados
    count = await db.audit_logs.count_documents({"timestamp": {"$lt": cutoff_date}})
    
    if dry_run:
        return {
            "dry_run": True,
            "logs_to_delete": count,
            "cutoff_date": cutoff_date,
            "message": f"{count} logs seriam deletados (anteriores a {cutoff_date[:10]})"
        }
    
    # Deleta logs antigos
    result = await db.audit_logs.delete_many({"timestamp": {"$lt": cutoff_date}})
    
    # Log desta ação
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "audit_cleanup",
        "entity_type": "audit_logs",
        "entity_id": "system",
        "details": {"deleted_count": result.deleted_count, "days": days},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "dry_run": False,
        "logs_deleted": result.deleted_count,
        "cutoff_date": cutoff_date,
        "message": f"{result.deleted_count} logs deletados com sucesso"
    }
