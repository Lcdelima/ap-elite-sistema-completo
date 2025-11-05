"""Sistema de Controle de Licenças e Entitlements - Elite Athena"""
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from pydantic import BaseModel, Field
import uuid
from fastapi import HTTPException


class EntitlementCreate(BaseModel):
    """Modelo para criação de entitlement"""
    user_id: str
    module_name: str
    plan_type: str  # basic, pro, elite, corporate
    duration_days: int = 30
    max_sessions: int = 1


class Entitlement(BaseModel):
    """Modelo de entitlement"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    module_name: str
    plan_type: str
    expires_at: datetime
    max_sessions: int = 1
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True


class EntitlementsService:
    """Serviço de gerenciamento de licenças"""
    
    def __init__(self, db):
        self.db = db
        self.collection = db.entitlements
    
    async def create_entitlement(self, data: EntitlementCreate) -> Entitlement:
        """Cria uma nova licença para um módulo"""
        expires_at = datetime.now(timezone.utc) + timedelta(days=data.duration_days)
        
        entitlement = Entitlement(
            user_id=data.user_id,
            module_name=data.module_name,
            plan_type=data.plan_type,
            expires_at=expires_at,
            max_sessions=data.max_sessions
        )
        
        entitlement_dict = entitlement.model_dump()
        entitlement_dict['expires_at'] = entitlement_dict['expires_at'].isoformat()
        entitlement_dict['created_at'] = entitlement_dict['created_at'].isoformat()
        
        await self.collection.insert_one(entitlement_dict)
        return entitlement
    
    async def check_access(self, user_id: str, module_name: str) -> bool:
        """Verifica se usuário tem acesso ao módulo"""
        entitlement = await self.collection.find_one({
            "user_id": user_id,
            "module_name": module_name,
            "is_active": True
        })
        
        if not entitlement:
            return False
        
        # Verificar expiração
        expires_at = datetime.fromisoformat(entitlement['expires_at'])
        if expires_at < datetime.now(timezone.utc):
            # Desativar licença expirada
            await self.collection.update_one(
                {"id": entitlement['id']},
                {"$set": {"is_active": False}}
            )
            return False
        
        return True
    
    async def get_user_entitlements(self, user_id: str) -> List[dict]:
        """Lista todos os entitlements de um usuário"""
        entitlements = await self.collection.find({
            "user_id": user_id,
            "is_active": True
        }).to_list(length=None)
        
        return entitlements
    
    async def revoke_entitlement(self, entitlement_id: str) -> bool:
        """Revoga uma licença"""
        result = await self.collection.update_one(
            {"id": entitlement_id},
            {"$set": {"is_active": False}}
        )
        return result.modified_count > 0
    
    async def extend_entitlement(self, entitlement_id: str, additional_days: int) -> bool:
        """Extende a validade de uma licença"""
        entitlement = await self.collection.find_one({"id": entitlement_id})
        if not entitlement:
            return False
        
        current_expires = datetime.fromisoformat(entitlement['expires_at'])
        new_expires = current_expires + timedelta(days=additional_days)
        
        result = await self.collection.update_one(
            {"id": entitlement_id},
            {"$set": {"expires_at": new_expires.isoformat()}}
        )
        return result.modified_count > 0


# Mapeamento de módulos por plano
PLAN_MODULES = {
    "basic": [
        "advocacia",
        "admin",
        "diversos"
    ],
    "pro": [
        "advocacia",
        "pericia",
        "admin",
        "diversos",
        "comunicacao"
    ],
    "elite": [
        "advocacia",
        "pericia",
        "admin",
        "diversos",
        "comunicacao",
        "sala-aula",
        "osint",
        "ia"
    ],
    "corporate": ["*"]  # Acesso total
}


def get_modules_for_plan(plan_type: str) -> List[str]:
    """Retorna módulos disponíveis para um plano"""
    return PLAN_MODULES.get(plan_type, [])
