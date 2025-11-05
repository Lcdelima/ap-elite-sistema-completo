"""API de entitlements para frontend - Elite Athena"""
from fastapi import APIRouter, HTTPException, Depends
from core.entitlements import EntitlementsService
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/entitlements", tags=["entitlements"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

entitlements_service = EntitlementsService(db)


@router.get("/my-entitlements")
async def get_my_entitlements(user_id: str):
    """Retorna entitlements do usuário atual"""
    
    # TODO: Extrair user_id do token JWT
    # Por enquanto, aceitar como parâmetro
    
    entitlements = await entitlements_service.get_user_entitlements(user_id)
    
    return {
        "entitlements": entitlements,
        "count": len(entitlements)
    }


@router.post("/check-access")
async def check_module_access(user_id: str, module_name: str):
    """Verifica se usuário tem acesso a um módulo"""
    
    has_access = await entitlements_service.check_access(user_id, module_name)
    
    return {
        "user_id": user_id,
        "module_name": module_name,
        "has_access": has_access
    }
