"""Cadastro controlado com aprovação manual - Elite Athena"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/auth", tags=["auth"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    company: str = Field(..., max_length=200)
    role: str = Field(..., description="advogado, perito, gestor, estudante")
    area_of_interest: str = Field(..., description="Área de atuação")
    plan_desired: str = Field(..., description="basic, pro, elite, corporate")
    justification: str = Field(..., min_length=20, max_length=1000)


class RegisterResponse(BaseModel):
    message: str
    request_id: str
    status: str


@router.post("/request-access", response_model=RegisterResponse)
async def request_access(request_data: RegisterRequest):
    """Solicitar acesso à plataforma (requer aprovação)"""
    
    # Verificar se email já existe
    existing = await db.access_requests.find_one({"email": request_data.email})
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Já existe uma solicitação com este e-mail"
        )
    
    # Criar solicitação
    request_id = str(uuid.uuid4())
    
    access_request = {
        "id": request_id,
        "name": request_data.name,
        "email": request_data.email,
        "phone": request_data.phone,
        "company": request_data.company,
        "role": request_data.role,
        "area_of_interest": request_data.area_of_interest,
        "plan_desired": request_data.plan_desired,
        "justification": request_data.justification,
        "status": "pending",  # pending, approved, rejected
        "created_at": datetime.now(timezone.utc).isoformat(),
        "reviewed_at": None,
        "reviewed_by": None,
        "notes": None
    }
    
    await db.access_requests.insert_one(access_request)
    
    # TODO: Enviar e-mail de notificação para equipe Elite
    
    return RegisterResponse(
        message="Solicitação enviada com sucesso! A equipe Elite entrará em contato em até 48 horas.",
        request_id=request_id,
        status="pending"
    )


@router.get("/access-requests")
async def list_access_requests(status: str = "pending"):
    """Listar solicitações de acesso (admin only)"""
    requests = await db.access_requests.find(
        {"status": status}
    ).sort("created_at", -1).to_list(length=100)
    
    return {"requests": requests, "count": len(requests)}


@router.post("/access-requests/{request_id}/approve")
async def approve_request(request_id: str, admin_notes: str = None):
    """Aprovar solicitação de acesso (admin only)"""
    
    request_data = await db.access_requests.find_one({"id": request_id})
    if not request_data:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada")
    
    # Atualizar status
    await db.access_requests.update_one(
        {"id": request_id},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "notes": admin_notes
            }
        }
    )
    
    # TODO: Criar usuário e enviar credenciais por e-mail
    # TODO: Criar entitlements baseado no plano escolhido
    
    return {"message": "Solicitação aprovada", "request_id": request_id}


@router.post("/access-requests/{request_id}/reject")
async def reject_request(request_id: str, reason: str):
    """Rejeitar solicitação de acesso (admin only)"""
    
    await db.access_requests.update_one(
        {"id": request_id},
        {
            "$set": {
                "status": "rejected",
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "notes": reason
            }
        }
    )
    
    # TODO: Enviar e-mail de notificação
    
    return {"message": "Solicitação rejeitada", "request_id": request_id}
