"""Login aprimorado com Session Guard - Elite Athena"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from datetime import datetime, timezone
import os
from motor.motor_asyncio import AsyncIOMotorClient
from core.session_guard import SessionGuard
import aioredis

router = APIRouter(prefix="/api/auth", tags=["auth"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Redis connection
redis_client = None


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "admin"


class LoginResponse(BaseModel):
    user: dict
    token: str
    session_id: str


async def get_redis():
    """Get Redis client"""
    global redis_client
    if redis_client is None:
        redis_client = await aioredis.create_redis_pool('redis://localhost')
    return redis_client


@router.post("/login", response_model=LoginResponse)
async def enhanced_login(request: Request, login_data: LoginRequest):
    """Login com Session Guard"""
    
    # Buscar usuário
    user = await db.users.find_one({
        "email": login_data.email,
        "role": login_data.role,
        "active": True
    }, {"_id": 0})
    
    if not user or user["password"] != login_data.password:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    # Verificar se conta está bloqueada
    if user.get("locked", False):
        raise HTTPException(
            status_code=403, 
            detail="Conta bloqueada. Entre em contato com o suporte."
        )
    
    # Session Guard
    redis = await get_redis()
    session_guard = SessionGuard(redis, db)
    
    device_fingerprint = session_guard.generate_device_fingerprint(request)
    
    # Verificar sessão concorrente
    can_login = await session_guard.check_concurrent_session(
        user['id'], 
        device_fingerprint
    )
    
    if not can_login:
        # Bloquear conta
        await session_guard.lock_account(
            user['id'], 
            "Tentativa de login simultâneo detectada"
        )
        
        raise HTTPException(
            status_code=403,
            detail="Sessão duplicada detectada. Sua conta foi bloqueada por segurança. Entre em contato com o suporte."
        )
    
    # Criar sessão
    await session_guard.create_session(user['id'], device_fingerprint)
    
    # Atualizar último login
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Gerar token (simplificado)
    token = f"elite_token_{user['id']}_{device_fingerprint[:8]}"
    
    # Remover senha da resposta
    user.pop("password", None)
    
    return LoginResponse(
        user=user,
        token=token,
        session_id=device_fingerprint[:16]
    )


@router.post("/logout")
async def logout(request: Request):
    """Logout e destruição de sessão"""
    user = request.state.user if hasattr(request.state, 'user') else None
    
    if not user:
        raise HTTPException(status_code=401, detail="Não autenticado")
    
    redis = await get_redis()
    session_guard = SessionGuard(redis, db)
    
    await session_guard.destroy_session(user['id'])
    
    return {"message": "Logout realizado com sucesso"}
