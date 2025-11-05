"""Stripe Payment Integration - Elite Athena"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import os
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import hashlib
import json

router = APIRouter(prefix="/api/payments/stripe", tags=["payments-stripe"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Stripe configuration
# TODO: Instalar stripe: pip install stripe
# import stripe
# stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


class CreatePaymentIntentRequest(BaseModel):
    subscription_id: str
    amount: float
    currency: str = "BRL"


@router.post("/create-payment-intent")
async def create_payment_intent(data: CreatePaymentIntentRequest):
    """Cria Payment Intent no Stripe"""
    
    # TODO: Implementar quando tiver Stripe API key
    # payment_intent = stripe.PaymentIntent.create(
    #     amount=int(data.amount * 100),  # Centavos
    #     currency=data.currency.lower(),
    #     metadata={'subscription_id': data.subscription_id}
    # )
    
    # Mock por enquanto
    mock_intent = {
        "client_secret": f"mock_secret_{hashlib.md5(data.subscription_id.encode()).hexdigest()}",
        "id": f"pi_{hashlib.sha256(data.subscription_id.encode()).hexdigest()[:16]}",
        "amount": int(data.amount * 100),
        "currency": data.currency.lower(),
        "status": "requires_payment_method"
    }
    
    # Registrar tentativa de pagamento
    payment_record = {
        "payment_intent_id": mock_intent['id'],
        "subscription_id": data.subscription_id,
        "amount": data.amount,
        "currency": data.currency,
        "status": "pending",
        "provider": "stripe",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payments.insert_one(payment_record)
    
    return {
        "client_secret": mock_intent['client_secret'],
        "payment_intent_id": mock_intent['id'],
        "message": "Payment Intent criado (MOCK - aguardando Stripe API key)"
    }


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Webhook do Stripe para processar eventos"""
    
    # TODO: Validar assinatura do Stripe
    # payload = await request.body()
    # sig_header = request.headers.get('stripe-signature')
    
    # event = stripe.Webhook.construct_event(
    #     payload, sig_header, os.getenv('STRIPE_WEBHOOK_SECRET')
    # )
    
    # Mock event
    event_type = "payment_intent.succeeded"
    
    if event_type == "payment_intent.succeeded":
        # Ativar assinatura
        # payment_intent = event['data']['object']
        # subscription_id = payment_intent['metadata']['subscription_id']
        
        # TODO: Chamar activate_subscription
        pass
    
    return {"status": "received"}


@router.get("/payment-methods/{customer_id}")
async def list_payment_methods(customer_id: str):
    """Lista métodos de pagamento do cliente"""
    
    # TODO: Implementar com Stripe API
    return {
        "payment_methods": [],
        "message": "Aguardando Stripe API key"
    }
