"""
AP ELITE ATHENA - Gerador de Contratos Profissional (Elite Gravitas™)
Motor jurídico-financeiro para gestão completa de contratos

Features:
- CRUD completo de contratos vinculados a cliente/job
- Cálculo automático de parcelas e vencimentos
- Gestão de templates dinâmicos
- Assinatura digital integrada
- Controle financeiro de parcelas
- Portal do cliente
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
import calendar

router = APIRouter(prefix="/api/contracts", tags=["Contracts - Elite Gravitas"])

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

class ContractCreate(BaseModel):
    client_id: str
    job_id: Optional[str] = None
    template_id: str
    title: str
    description: Optional[str] = None
    
    # Valores
    value_total: float
    entry_value: Optional[float] = 0
    parcel_count: int = 1
    parcel_value: Optional[float] = None
    
    # Datas
    start_date: str  # ISO format
    first_due_date: Optional[str] = None
    
    # Variáveis do template
    variables: dict = {}
    
    # Observações
    notes: Optional[str] = None

class ContractUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    variables: Optional[dict] = None

# ==================== HELPER FUNCTIONS ====================

def calculate_parcels(value_total: float, entry_value: float, parcel_count: int, first_due_date: str) -> dict:
    """
    Calcula parcelas e datas de vencimento
    """
    remaining = value_total - entry_value
    parcel_value = remaining / parcel_count if parcel_count > 0 else 0
    
    due_dates = []
    due_date = datetime.fromisoformat(first_due_date.replace('Z', '+00:00'))
    
    for i in range(parcel_count):
        due_dates.append(due_date.isoformat())
        # Adiciona 1 mês
        if due_date.month == 12:
            due_date = due_date.replace(year=due_date.year + 1, month=1)
        else:
            # Ajusta dia se necessário (ex: 31 de jan → 28/29 de fev)
            next_month = due_date.month + 1
            max_day = calendar.monthrange(due_date.year, next_month)[1]
            day = min(due_date.day, max_day)
            due_date = due_date.replace(month=next_month, day=day)
    
    return {
        "parcel_value": parcel_value,
        "due_dates": due_dates
    }

def generate_contract_number() -> str:
    """
    Gera número único do contrato
    """
    date_str = datetime.now().strftime("%Y%m%d")
    return f"CTR-{date_str}-{uuid.uuid4().hex[:8].upper()}"

# ==================== ENDPOINTS ====================

@router.post("/")
async def create_contract(
    contract_data: ContractCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Cria novo contrato vinculado a cliente/job
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Verifica se cliente existe
    client = await db.users.find_one({"id": contract_data.client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Verifica se job existe (se informado)
    job = None
    if contract_data.job_id:
        job = await db.jobs.find_one({"id": contract_data.job_id}, {"_id": 0})
        if not job:
            raise HTTPException(status_code=404, detail="Job não encontrado")
    
    # Verifica se template existe
    template = await db.contract_templates.find_one({"id": contract_data.template_id}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    # Calcula parcelas
    first_due = contract_data.first_due_date or (datetime.now() + timedelta(days=30)).isoformat()
    parcels_info = calculate_parcels(
        contract_data.value_total,
        contract_data.entry_value,
        contract_data.parcel_count,
        first_due
    )
    
    contract_id = str(uuid.uuid4())
    contract_number = generate_contract_number()
    now = datetime.now(timezone.utc).isoformat()
    
    contract = {
        "id": contract_id,
        "contract_number": contract_number,
        "client_id": contract_data.client_id,
        "client_name": client.get("full_name", client.get("name")),
        "job_id": contract_data.job_id,
        "job_title": job.get("title") if job else None,
        "template_id": contract_data.template_id,
        "template_name": template.get("name"),
        "title": contract_data.title,
        "description": contract_data.description or "",
        
        # Status: draft, pending_signature, signed, expired, cancelled
        "status": "draft",
        
        # Valores financeiros
        "value_total": contract_data.value_total,
        "entry_value": contract_data.entry_value,
        "parcel_count": contract_data.parcel_count,
        "parcel_value": parcels_info["parcel_value"],
        "due_dates": parcels_info["due_dates"],
        
        # Datas
        "start_date": contract_data.start_date,
        "first_due_date": first_due,
        "signed_at": None,
        "expires_at": None,
        
        # Variáveis do template
        "variables": contract_data.variables,
        
        # Observações
        "notes": contract_data.notes or "",
        
        # Documentos gerados
        "generated_document_url": None,
        "signed_document_url": None,
        
        # Assinatura
        "signature_provider": None,
        "signature_link": None,
        "signature_status": None,
        
        # Pagamentos
        "payments": [],
        "payment_status": "pending",  # pending, partial, paid, overdue
        
        # Audit
        "created_by": current_user.get("id"),
        "created_at": now,
        "updated_at": now,
        "version": 1
    }
    
    await db.contracts.insert_one(contract)
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "contract_created",
        "entity_type": "contract",
        "entity_id": contract_id,
        "details": {
            "contract_number": contract_number,
            "client_id": contract_data.client_id,
            "value_total": contract_data.value_total
        },
        "timestamp": now
    })
    
    return {
        "success": True,
        "contract_id": contract_id,
        "contract_number": contract_number,
        "contract": contract
    }

@router.get("/")
async def list_contracts(
    client_id: Optional[str] = None,
    job_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Lista contratos com filtros
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {}
    if client_id:
        query["client_id"] = client_id
    if job_id:
        query["job_id"] = job_id
    if status:
        query["status"] = status
    
    contracts = await db.contracts.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.contracts.count_documents(query)
    
    # Estatísticas
    stats = {}
    for st in ["draft", "pending_signature", "signed", "expired", "cancelled"]:
        stats[st] = await db.contracts.count_documents({**query, "status": st})
    
    return {
        "contracts": contracts,
        "total": total,
        "page": skip // limit + 1,
        "total_pages": (total + limit - 1) // limit,
        "stats": stats
    }

@router.get("/{contract_id}")
async def get_contract(
    contract_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtém detalhes completos de um contrato
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    contract = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    
    # Busca template completo
    if contract.get("template_id"):
        template = await db.contract_templates.find_one(
            {"id": contract["template_id"]},
            {"_id": 0}
        )
        contract["template"] = template
    
    # Busca pagamentos
    payments = await db.contract_payments.find(
        {"contract_id": contract_id},
        {"_id": 0}
    ).sort("payment_date", -1).to_list(None)
    contract["payment_details"] = payments
    
    # Timeline de atividades
    timeline = await db.audit_logs.find(
        {"entity_id": contract_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(20).to_list(20)
    contract["timeline"] = timeline
    
    return contract

@router.put("/{contract_id}")
async def update_contract(
    contract_id: str,
    contract_data: ContractUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Atualiza um contrato existente
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    contract = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    
    # Não permite editar contratos assinados
    if contract.get("status") == "signed":
        raise HTTPException(
            status_code=400,
            detail="Contrato já assinado não pode ser editado. Crie um aditivo."
        )
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if contract_data.title is not None:
        update_data["title"] = contract_data.title
    if contract_data.description is not None:
        update_data["description"] = contract_data.description
    if contract_data.status is not None:
        update_data["status"] = contract_data.status
    if contract_data.notes is not None:
        update_data["notes"] = contract_data.notes
    if contract_data.variables is not None:
        update_data["variables"] = {**contract.get("variables", {}), **contract_data.variables}
    
    update_data["version"] = contract.get("version", 1) + 1
    
    await db.contracts.update_one({"id": contract_id}, {"$set": update_data})
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "contract_updated",
        "entity_type": "contract",
        "entity_id": contract_id,
        "details": {"changes": list(update_data.keys())},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    updated_contract = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    return {"success": True, "contract": updated_contract}

@router.delete("/{contract_id}")
async def delete_contract(
    contract_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Cancela um contrato (soft delete)
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    contract = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    
    # Não permite cancelar contratos assinados sem motivo
    if contract.get("status") == "signed":
        raise HTTPException(
            status_code=400,
            detail="Contrato assinado requer motivo formal para cancelamento"
        )
    
    await db.contracts.update_one(
        {"id": contract_id},
        {"$set": {
            "status": "cancelled",
            "cancelled_at": datetime.now(timezone.utc).isoformat(),
            "cancelled_by": current_user.get("id")
        }}
    )
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "contract_cancelled",
        "entity_type": "contract",
        "entity_id": contract_id,
        "details": {"contract_number": contract.get("contract_number")},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "message": "Contrato cancelado com sucesso"}

@router.post("/{contract_id}/payment")
async def register_payment(
    contract_id: str,
    payment_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Registra pagamento de parcela
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    contract = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    
    payment_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    payment = {
        "id": payment_id,
        "contract_id": contract_id,
        "parcel_number": payment_data.get("parcel_number", 1),
        "value": payment_data.get("value"),
        "payment_method": payment_data.get("payment_method", "transfer"),
        "payment_date": payment_data.get("payment_date", now),
        "proof_url": payment_data.get("proof_url"),
        "notes": payment_data.get("notes", ""),
        "registered_by": current_user.get("id"),
        "registered_at": now
    }
    
    await db.contract_payments.insert_one(payment)
    
    # Atualiza status de pagamento do contrato
    payments = await db.contract_payments.find({"contract_id": contract_id}).to_list(None)
    total_paid = sum(p.get("value", 0) for p in payments)
    
    if total_paid >= contract["value_total"]:
        payment_status = "paid"
    elif total_paid > 0:
        payment_status = "partial"
    else:
        payment_status = "pending"
    
    await db.contracts.update_one(
        {"id": contract_id},
        {"$set": {"payment_status": payment_status}}
    )
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "payment_registered",
        "entity_type": "contract",
        "entity_id": contract_id,
        "details": {
            "payment_id": payment_id,
            "value": payment_data.get("value"),
            "parcel": payment_data.get("parcel_number")
        },
        "timestamp": now
    })
    
    return {
        "success": True,
        "payment_id": payment_id,
        "payment": payment,
        "contract_payment_status": payment_status
    }

@router.get("/stats/overview")
async def get_contracts_stats(
    current_user: dict = Depends(get_current_user)
):
    """
    Estatísticas gerais de contratos
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    total = await db.contracts.count_documents({})
    by_status = {}
    for status in ["draft", "pending_signature", "signed", "expired", "cancelled"]:
        by_status[status] = await db.contracts.count_documents({"status": status})
    
    # Valor total de contratos
    pipeline = [
        {"$group": {
            "_id": None,
            "total_value": {"$sum": "$value_total"},
            "avg_value": {"$avg": "$value_total"}
        }}
    ]
    value_stats = await db.contracts.aggregate(pipeline).to_list(1)
    
    return {
        "total_contracts": total,
        "by_status": by_status,
        "total_value": value_stats[0]["total_value"] if value_stats else 0,
        "avg_value": value_stats[0]["avg_value"] if value_stats else 0
    }
