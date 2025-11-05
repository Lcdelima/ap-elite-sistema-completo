"""Sistema de Billing com Stripe - Elite Athena"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import uuid

router = APIRouter(prefix="/api/billing", tags=["billing"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Stripe config (precisa instalar: pip install stripe)
# import stripe
# stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


class SubscriptionCreate(BaseModel):
    user_id: str
    plan_type: str  # basic, pro, elite, corporate
    duration_days: int = 30
    payment_method: str  # stripe, pagbank, mercadopago, pix


class Subscription(BaseModel):
    id: str
    user_id: str
    plan_type: str
    status: str  # active, expired, cancelled, pending
    amount: float
    currency: str = "BRL"
    payment_method: str
    modules_included: List[str]
    starts_at: str
    expires_at: str
    created_at: str
    auto_renew: bool = False


# Preços dos planos
PLAN_PRICES = {
    "basic": {"monthly": 297.00, "quarterly": 797.00, "annual": 2970.00},
    "pro": {"monthly": 897.00, "quarterly": 2397.00, "annual": 8970.00},
    "elite": {"monthly": 1797.00, "quarterly": 4797.00, "annual": 17970.00},
    "corporate": {"monthly": 4997.00, "quarterly": 13497.00, "annual": 49970.00}
}


def get_price(plan_type: str, duration_days: int) -> float:
    """Calcula preço baseado no plano e duração"""
    if duration_days <= 30:
        return PLAN_PRICES[plan_type]["monthly"]
    elif duration_days <= 90:
        return PLAN_PRICES[plan_type]["quarterly"]
    else:
        return PLAN_PRICES[plan_type]["annual"]


@router.post("/subscriptions", response_model=Subscription)
async def create_subscription(data: SubscriptionCreate):
    """Cria nova assinatura"""
    
    subscription_id = str(uuid.uuid4())
    amount = get_price(data.plan_type, data.duration_days)
    
    from datetime import timedelta
    starts_at = datetime.now(timezone.utc)
    expires_at = starts_at + timedelta(days=data.duration_days)
    
    # Módulos incluídos baseado no plano
    from core.entitlements import get_modules_for_plan
    modules = get_modules_for_plan(data.plan_type)
    
    subscription = Subscription(
        id=subscription_id,
        user_id=data.user_id,
        plan_type=data.plan_type,
        status="pending",  # pending até confirmar pagamento
        amount=amount,
        payment_method=data.payment_method,
        modules_included=modules,
        starts_at=starts_at.isoformat(),
        expires_at=expires_at.isoformat(),
        created_at=starts_at.isoformat()
    )
    
    await db.subscriptions.insert_one(subscription.model_dump())
    
    # TODO: Integrar com gateway de pagamento
    # Por enquanto, retornar dados da subscription
    
    return subscription


@router.get("/subscriptions/{user_id}")
async def get_user_subscriptions(user_id: str):
    """Lista assinaturas do usuário"""
    subscriptions = await db.subscriptions.find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(length=None)
    
    return {"subscriptions": subscriptions}


@router.post("/subscriptions/{subscription_id}/activate")
async def activate_subscription(subscription_id: str):
    """Ativa assinatura após confirmação de pagamento"""
    
    subscription = await db.subscriptions.find_one({"id": subscription_id})
    if not subscription:
        raise HTTPException(status_code=404, detail="Assinatura não encontrada")
    
    # Atualizar status
    await db.subscriptions.update_one(
        {"id": subscription_id},
        {"$set": {"status": "active"}}
    )
    
    # Criar entitlements para cada módulo
    from core.entitlements import EntitlementsService, EntitlementCreate
    from datetime import datetime
    
    entitlements_service = EntitlementsService(db)
    
    for module_name in subscription['modules_included']:
        if module_name == "*":  # Corporate - todos os módulos
            continue
        
        # Calcular duração
        starts = datetime.fromisoformat(subscription['starts_at'])
        expires = datetime.fromisoformat(subscription['expires_at'])
        duration = (expires - starts).days
        
        entitlement_data = EntitlementCreate(
            user_id=subscription['user_id'],
            module_name=module_name,
            plan_type=subscription['plan_type'],
            duration_days=duration
        )
        
        await entitlements_service.create_entitlement(entitlement_data)
    
    return {
        "message": "Assinatura ativada e entitlements criados",
        "subscription_id": subscription_id
    }


@router.post("/webhook/stripe")
async def stripe_webhook():
    """Webhook do Stripe para eventos de pagamento"""
    # TODO: Implementar validação de webhook
    # TODO: Processar eventos (payment_intent.succeeded, etc.)
    return {"status": "received"}


@router.get("/plans")
async def list_plans():
    """Lista planos disponíveis"""
    return {
        "plans": [
            {
                "id": "basic",
                "name": "Basic",
                "description": "Advocacia + Admin + Diversos",
                "features": ["1 usuário", "3 módulos", "Suporte padrão"],
                "pricing": PLAN_PRICES["basic"]
            },
            {
                "id": "pro",
                "name": "Pro",
                "description": "+ Perícia + Comunicação",
                "features": ["3 usuários", "5 módulos", "Suporte prioritário"],
                "pricing": PLAN_PRICES["pro"]
            },
            {
                "id": "elite",
                "name": "Elite",
                "description": "Todos os módulos + IA + OSINT",
                "features": ["10 usuários", "Todos os módulos", "IA avançada", "Suporte 24/7"],
                "pricing": PLAN_PRICES["elite"]
            },
            {
                "id": "corporate",
                "name": "Corporate",
                "description": "Acesso ilimitado + White-label",
                "features": ["Usuários ilimitados", "Acesso total", "White-label", "Suporte dedicado"],
                "pricing": PLAN_PRICES["corporate"]
            }
        ]
    }
