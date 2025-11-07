"""
AP ELITE ATHENA - Sistema de Licenciamento (Elite Gravitas™)
Gestão de planos, assinaturas, módulos e seats

Features:
- Planos: Basic, Pro, Elite, Corporate
- Módulos por plano: juridico, pericia, comunicacao, sala, diversos
- Seats: controle de usuários simultâneos
- Sessão única: novo login invalida sessão anterior
- Bloqueio por expiração
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from pydantic import BaseModel
import os
import uuid
import secrets

router = APIRouter(prefix="/api/licensing", tags=["Licensing System - Elite Gravitas"])

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

# ==================== PLANS CONFIGURATION ====================

PLANS_CONFIG = {
    "basic": {
        "name": "AP Elite Basic",
        "price_monthly": 297.00,
        "price_annual": 2970.00,
        "seats_included": 2,
        "seats_extra_price": 99.00,
        "active_modules": ["juridico"],
        "limits": {
            "jobs_per_month": 50,
            "storage_gb": 10,
            "users": 3
        },
        "features": [
            "Gestão de Processos Judiciais",
            "Controle de Prazos",
            "Gestão de Clientes",
            "10GB de Armazenamento",
            "2 Usuários Incluísos"
        ]
    },
    "pro": {
        "name": "AP Elite Pro",
        "price_monthly": 697.00,
        "price_annual": 6970.00,
        "seats_included": 5,
        "seats_extra_price": 79.00,
        "active_modules": ["juridico", "pericia", "comunicacao"],
        "limits": {
            "jobs_per_month": 200,
            "storage_gb": 50,
            "users": 10
        },
        "features": [
            "Todos do Basic +",
            "Perícia Digital",
            "Interceptações Telemáticas",
            "OSINT & Investigações",
            "50GB de Armazenamento",
            "5 Usuários Incluísos",
            "Portal do Cliente"
        ]
    },
    "elite": {
        "name": "AP Elite Elite",
        "price_monthly": 1497.00,
        "price_annual": 14970.00,
        "seats_included": 15,
        "seats_extra_price": 59.00,
        "active_modules": ["juridico", "pericia", "comunicacao", "sala", "diversos"],
        "limits": {
            "jobs_per_month": -1,  # Ilimitado
            "storage_gb": 200,
            "users": 50
        },
        "features": [
            "Todos do Pro +",
            "Sala Sit Inteligência",
            "IA Avançada",
            "Relacionamentos & Redes Criminais",
            "Relatórios Automatizados",
            "200GB de Armazenamento",
            "15 Usuários Incluísos",
            "Integrações API"
        ]
    },
    "corporate": {
        "name": "AP Elite Corporate",
        "price_monthly": 2997.00,
        "price_annual": 29970.00,
        "seats_included": 50,
        "seats_extra_price": 39.00,
        "active_modules": ["juridico", "pericia", "comunicacao", "sala", "diversos"],
        "limits": {
            "jobs_per_month": -1,  # Ilimitado
            "storage_gb": 1000,
            "users": -1  # Ilimitado
        },
        "features": [
            "Todos do Elite +",
            "White Label",
            "Suporte 24/7 Prioritário",
            "Onboarding Personalizado",
            "1TB de Armazenamento",
            "Usuários Ilimitados",
            "Integração On-Premise",
            "Compliance LGPD/ISO Premium"
        ]
    }
}

# ==================== DEPENDENCY: REQUIRES MODULE ====================

class RequiresModule:
    """Dependency para verificar se usuário tem acesso ao módulo"""
    def __init__(self, module: str):
        self.module = module
    
    async def __call__(self, current_user: dict = Depends(get_current_user)):
        if not current_user:
            raise HTTPException(status_code=401, detail="Autenticação necessária")
        
        # Admin/SuperAdmin tem acesso total
        if current_user.get("role") in ["administrator", "super_admin"]:
            return current_user
        
        # Busca subscription do usuário
        user_id = current_user.get("id")
        subscription = await db.subscriptions.find_one(
            {"user_id": user_id, "status": "active"},
            {"_id": 0}
        )
        
        if not subscription:
            raise HTTPException(
                status_code=403,
                detail="Nenhuma assinatura ativa encontrada"
            )
        
        # Verifica expiração
        if subscription.get("expires_at"):
            expires = datetime.fromisoformat(subscription["expires_at"])
            if expires < datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=403,
                    detail="Assinatura expirada. Renove para continuar."
                )
        
        # Verifica se tem acesso ao módulo
        active_modules = subscription.get("active_modules", [])
        if self.module not in active_modules:
            raise HTTPException(
                status_code=403,
                detail=f"Módulo '{self.module}' não disponível no seu plano. Faça upgrade."
            )
        
        return current_user

# ==================== SESSION CONTROL ====================

async def enforce_single_session(user_id: str, new_token: str):
    """Garante que apenas uma sessão esteja ativa por usuário"""
    # Invalida tokens anteriores
    await db.sessions.update_many(
        {"user_id": user_id, "active": True},
        {"$set": {"active": False, "invalidated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Cria nova sessão
    await db.sessions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "token": new_token,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    })

async def check_session_validity(token: str, user_id: str) -> bool:
    """Verifica se a sessão é válida e única"""
    session = await db.sessions.find_one(
        {"user_id": user_id, "token": token, "active": True},
        {"_id": 0}
    )
    
    if not session:
        return False
    
    # Verifica expiração
    expires = datetime.fromisoformat(session["expires_at"])
    if expires < datetime.now(timezone.utc):
        await db.sessions.update_one(
            {"id": session["id"]},
            {"$set": {"active": False}}
        )
        return False
    
    return True

# ==================== ENDPOINTS ====================

@router.get("/plans")
async def get_plans(
    current_user: dict = Depends(get_current_user)
):
    """Retorna planos disponíveis"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    return {"plans": PLANS_CONFIG}

@router.get("/subscription/current")
async def get_current_subscription(
    current_user: dict = Depends(get_current_user)
):
    """Retorna assinatura atual do usuário"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    subscription = await db.subscriptions.find_one(
        {"user_id": current_user.get("id"), "status": "active"},
        {"_id": 0}
    )
    
    if not subscription:
        return {
            "has_subscription": False,
            "message": "Nenhuma assinatura ativa"
        }
    
    # Calcula dias restantes
    if subscription.get("expires_at"):
        expires = datetime.fromisoformat(subscription["expires_at"])
        days_remaining = (expires - datetime.now(timezone.utc)).days
    else:
        days_remaining = -1  # Ilimitado
    
    # Busca configuração do plano
    plan_config = PLANS_CONFIG.get(subscription.get("plan_id"), {})
    
    return {
        "has_subscription": True,
        "subscription": subscription,
        "plan_config": plan_config,
        "days_remaining": days_remaining,
        "is_expired": days_remaining < 0 if days_remaining != -1 else False
    }

@router.post("/subscription/create")
async def create_subscription(
    plan_id: str,
    billing_cycle: str,  # 'monthly' ou 'annual'
    current_user: dict = Depends(get_current_user)
):
    """Cria nova assinatura (simulação - integrar com Stripe/PagBank depois)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    if plan_id not in PLANS_CONFIG:
        raise HTTPException(status_code=400, detail="Plano inválido")
    
    plan = PLANS_CONFIG[plan_id]
    
    # Calcula expiração
    if billing_cycle == "monthly":
        expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        price = plan["price_monthly"]
    elif billing_cycle == "annual":
        expires_at = datetime.now(timezone.utc) + timedelta(days=365)
        price = plan["price_annual"]
    else:
        raise HTTPException(status_code=400, detail="Ciclo de cobrança inválido")
    
    subscription_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    subscription = {
        "id": subscription_id,
        "user_id": current_user.get("id"),
        "plan_id": plan_id,
        "plan_name": plan["name"],
        "billing_cycle": billing_cycle,
        "price": price,
        "status": "active",
        "active_modules": plan["active_modules"],
        "seats_included": plan["seats_included"],
        "seats_extra": 0,
        "limits": plan["limits"],
        "started_at": now,
        "expires_at": expires_at.isoformat(),
        "auto_renew": True,
        "created_at": now
    }
    
    await db.subscriptions.insert_one(subscription)
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "subscription_created",
        "entity_type": "subscription",
        "entity_id": subscription_id,
        "details": {"plan_id": plan_id, "billing_cycle": billing_cycle},
        "timestamp": now
    })
    
    return {
        "success": True,
        "subscription": subscription,
        "message": f"Assinatura {plan['name']} criada com sucesso!"
    }

@router.post("/subscription/add-seat")
async def add_seat(
    current_user: dict = Depends(get_current_user)
):
    """Adiciona seat extra à assinatura"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    subscription = await db.subscriptions.find_one(
        {"user_id": current_user.get("id"), "status": "active"},
        {"_id": 0}
    )
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Nenhuma assinatura ativa encontrada")
    
    plan = PLANS_CONFIG.get(subscription["plan_id"])
    if not plan:
        raise HTTPException(status_code=400, detail="Plano inválido")
    
    # Adiciona seat
    new_seats_extra = subscription.get("seats_extra", 0) + 1
    await db.subscriptions.update_one(
        {"id": subscription["id"]},
        {"$set": {"seats_extra": new_seats_extra}}
    )
    
    return {
        "success": True,
        "seats_extra": new_seats_extra,
        "total_seats": subscription["seats_included"] + new_seats_extra,
        "extra_cost": plan["seats_extra_price"],
        "message": "Seat adicional adicionado com sucesso!"
    }

@router.get("/subscription/usage")
async def get_subscription_usage(
    current_user: dict = Depends(get_current_user)
):
    """Retorna uso atual da assinatura (jobs, storage, usuários)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    subscription = await db.subscriptions.find_one(
        {"user_id": current_user.get("id"), "status": "active"},
        {"_id": 0}
    )
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Nenhuma assinatura ativa encontrada")
    
    # Conta jobs do mês atual
    start_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    jobs_this_month = await db.jobs.count_documents({
        "created_by": current_user.get("id"),
        "created_at": {"$gte": start_of_month.isoformat()}
    })
    
    # TODO: Calcular storage usado (soma size_bytes de todos os files)
    # storage_used_bytes = await db.files.aggregate([...]).to_list()
    storage_used_gb = 0  # Placeholder
    
    # Conta usuários ativos
    active_users = await db.users.count_documents({"active": True})
    
    limits = subscription.get("limits", {})
    
    return {
        "usage": {
            "jobs_this_month": jobs_this_month,
            "jobs_limit": limits.get("jobs_per_month", -1),
            "storage_used_gb": storage_used_gb,
            "storage_limit_gb": limits.get("storage_gb", 0),
            "active_users": active_users,
            "users_limit": limits.get("users", 0)
        },
        "limits": limits
    }

@router.post("/session/validate")
async def validate_session(
    authorization: Optional[str] = Header(None),
    current_user: dict = Depends(get_current_user)
):
    """Valida se a sessão atual é válida e única"""
    if not current_user or not authorization:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    token = authorization.replace("Bearer ", "")
    is_valid = await check_session_validity(token, current_user.get("id"))
    
    if not is_valid:
        raise HTTPException(
            status_code=401,
            detail="Sessão inválida ou expirada. Novo login detectado em outro dispositivo."
        )
    
    return {
        "valid": True,
        "message": "Sessão válida"
    }
