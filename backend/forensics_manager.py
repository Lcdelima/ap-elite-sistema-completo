"""
AP ELITE ATHENA - Perícia Digital Forense (Elite Gravitas™)
Núcleo técnico-científico para execução pericial completa

Features:
- CRUD de casos periciais
- Tipos: celular, HD, nuvem, rede, sistema
- Status: coleta, análise, laudo, concluído
- Vinculação cliente/job
- Cadeia de custódia
- Timeline de eventos
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/api/forensics", tags=["Forensics - Elite Gravitas"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Storage
STORAGE_BASE = os.environ.get("STORAGE_PATH", "/app/backend/storage")

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

class ForensicCaseCreate(BaseModel):
    client_id: str
    job_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    tipo: str  # celular, hd, nuvem, rede, sistema, memoria, email
    priority: Optional[str] = "normal"  # baixa, normal, alta, urgente
    expert_user_id: Optional[str] = None
    collection_location: Optional[str] = None
    device_info: Optional[dict] = {}
    notes: Optional[str] = None

class ForensicCaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    expert_user_id: Optional[str] = None
    notes: Optional[str] = None
    conclusion: Optional[str] = None

# ==================== HELPER FUNCTIONS ====================

def generate_case_number() -> str:
    """
    Gera número único do caso (IP-YYYYMMDD-XXXXX)
    """
    date_str = datetime.now().strftime("%Y%m%d")
    return f"IP-{date_str}-{uuid.uuid4().hex[:5].upper()}"

async def create_case_structure(client_id: str, job_id: Optional[str], case_id: str):
    """
    Cria estrutura de pastas para o caso pericial
    """
    if job_id:
        base_path = Path(STORAGE_BASE) / client_id / job_id / "Pericias" / case_id
    else:
        base_path = Path(STORAGE_BASE) / client_id / "_root" / "Pericias" / case_id
    
    # Cria subpastas
    folders = [
        "_Coletas",
        "_Analises",
        "_Laudos",
        "_Assinados",
        "_Temporarios"
    ]
    
    for folder in folders:
        (base_path / folder).mkdir(parents=True, exist_ok=True)
    
    return str(base_path.relative_to(STORAGE_BASE))

# ==================== ENDPOINTS ====================

@router.post("/")
async def create_forensic_case(
    case_data: ForensicCaseCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Cria novo caso pericial
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Verifica cliente
    client = await db.users.find_one({"id": case_data.client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    case_id = str(uuid.uuid4())
    case_number = generate_case_number()
    now = datetime.now(timezone.utc).isoformat()
    
    # Cria estrutura de pastas
    storage_path = await create_case_structure(
        case_data.client_id,
        case_data.job_id,
        case_id
    )
    
    case = {
        "id": case_id,
        "case_number": case_number,
        "client_id": case_data.client_id,
        "client_name": client.get("full_name", client.get("name")),
        "job_id": case_data.job_id,
        "title": case_data.title,
        "description": case_data.description or "",
        "tipo": case_data.tipo,
        
        # Status: coleta, analise, laudo, concluido, arquivado
        "status": "coleta",
        "priority": case_data.priority,
        
        # Perito responsável
        "expert_user_id": case_data.expert_user_id or current_user.get("id"),
        
        # Coleta
        "collection_location": case_data.collection_location or "",
        "device_info": case_data.device_info or {},
        
        # Contadores
        "evidences_count": 0,
        "custody_events_count": 0,
        "reports_count": 0,
        
        # Datas
        "collection_date": now,
        "analysis_started_at": None,
        "report_generated_at": None,
        "completed_at": None,
        
        # Storage
        "storage_path": storage_path,
        
        # Hash de custódia (será atualizado com cada evidência)
        "custody_hash": None,
        
        # Notas e conclusão
        "notes": case_data.notes or "",
        "conclusion": None,
        
        # Audit
        "created_by": current_user.get("id"),
        "created_at": now,
        "updated_at": now,
        "version": 1
    }
    
    await db.forensic_cases.insert_one(case)
    
    # Primeira entrada na cadeia de custódia
    await db.chain_of_custody.insert_one({
        "id": str(uuid.uuid4()),
        "forensic_case_id": case_id,
        "evidence_id": None,
        "event_type": "case_created",
        "description": f"Caso pericial {case_number} criado",
        "user_id": current_user.get("id"),
        "user_name": current_user.get("full_name", current_user.get("name")),
        "location": case_data.collection_location or "N/A",
        "device_info": {},
        "hash_before": None,
        "hash_after": None,
        "timestamp": now
    })
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "forensic_case_created",
        "entity_type": "forensic_case",
        "entity_id": case_id,
        "details": {
            "case_number": case_number,
            "tipo": case_data.tipo,
            "client_id": case_data.client_id
        },
        "timestamp": now
    })
    
    return {
        "success": True,
        "case_id": case_id,
        "case_number": case_number,
        "case": case
    }

@router.get("/")
async def list_forensic_cases(
    client_id: Optional[str] = None,
    job_id: Optional[str] = None,
    tipo: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    expert_user_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Lista casos periciais com filtros
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {}
    if client_id:
        query["client_id"] = client_id
    if job_id:
        query["job_id"] = job_id
    if tipo:
        query["tipo"] = tipo
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if expert_user_id:
        query["expert_user_id"] = expert_user_id
    
    cases = await db.forensic_cases.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.forensic_cases.count_documents(query)
    
    # Estatísticas
    stats = {
        "total": total,
        "by_status": {},
        "by_tipo": {},
        "by_priority": {}
    }
    
    for status_val in ["coleta", "analise", "laudo", "concluido", "arquivado"]:
        stats["by_status"][status_val] = await db.forensic_cases.count_documents({**query, "status": status_val})
    
    return {
        "cases": cases,
        "total": total,
        "page": skip // limit + 1,
        "total_pages": (total + limit - 1) // limit,
        "stats": stats
    }

@router.get("/{case_id}")
async def get_forensic_case(
    case_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtém detalhes completos de um caso
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    case = await db.forensic_cases.find_one({"id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Caso não encontrado")
    
    # Busca evidências
    evidences = await db.forensic_evidences.find(
        {"forensic_case_id": case_id},
        {"_id": 0}
    ).sort("collected_at", -1).to_list(None)
    case["evidences"] = evidences
    
    # Busca cadeia de custódia
    custody_chain = await db.chain_of_custody.find(
        {"forensic_case_id": case_id},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(None)
    case["custody_chain"] = custody_chain
    
    # Busca laudos
    reports = await db.forensic_reports.find(
        {"forensic_case_id": case_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(None)
    case["reports"] = reports
    
    return case

@router.put("/{case_id}")
async def update_forensic_case(
    case_id: str,
    case_data: ForensicCaseUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Atualiza caso pericial
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    case = await db.forensic_cases.find_one({"id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Caso não encontrado")
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if case_data.title is not None:
        update_data["title"] = case_data.title
    if case_data.description is not None:
        update_data["description"] = case_data.description
    if case_data.status is not None:
        update_data["status"] = case_data.status
        # Atualiza timestamps de mudança de status
        if case_data.status == "analise" and not case.get("analysis_started_at"):
            update_data["analysis_started_at"] = datetime.now(timezone.utc).isoformat()
        elif case_data.status == "laudo" and not case.get("report_generated_at"):
            update_data["report_generated_at"] = datetime.now(timezone.utc).isoformat()
        elif case_data.status == "concluido" and not case.get("completed_at"):
            update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
    if case_data.priority is not None:
        update_data["priority"] = case_data.priority
    if case_data.expert_user_id is not None:
        update_data["expert_user_id"] = case_data.expert_user_id
    if case_data.notes is not None:
        update_data["notes"] = case_data.notes
    if case_data.conclusion is not None:
        update_data["conclusion"] = case_data.conclusion
    
    update_data["version"] = case.get("version", 1) + 1
    
    await db.forensic_cases.update_one({"id": case_id}, {"$set": update_data})
    
    # Registro na cadeia de custódia
    if case_data.status and case_data.status != case.get("status"):
        await db.chain_of_custody.insert_one({
            "id": str(uuid.uuid4()),
            "forensic_case_id": case_id,
            "evidence_id": None,
            "event_type": "status_change",
            "description": f"Status alterado: {case.get('status')} → {case_data.status}",
            "user_id": current_user.get("id"),
            "user_name": current_user.get("full_name", current_user.get("name")),
            "location": "Sistema",
            "device_info": {},
            "hash_before": None,
            "hash_after": None,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "forensic_case_updated",
        "entity_type": "forensic_case",
        "entity_id": case_id,
        "details": {"changes": list(update_data.keys())},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    updated_case = await db.forensic_cases.find_one({"id": case_id}, {"_id": 0})
    return {"success": True, "case": updated_case}

@router.delete("/{case_id}")
async def delete_forensic_case(
    case_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Arquiva caso pericial (soft delete)
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Apenas admin
    if current_user.get("role") not in ["administrator", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permissão negada")
    
    case = await db.forensic_cases.find_one({"id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Caso não encontrado")
    
    await db.forensic_cases.update_one(
        {"id": case_id},
        {"$set": {
            "status": "arquivado",
            "archived_at": datetime.now(timezone.utc).isoformat(),
            "archived_by": current_user.get("id")
        }}
    )
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "forensic_case_archived",
        "entity_type": "forensic_case",
        "entity_id": case_id,
        "details": {"case_number": case.get("case_number")},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "message": "Caso arquivado com sucesso"}

@router.get("/stats/overview")
async def get_forensics_stats(
    current_user: dict = Depends(get_current_user)
):
    """
    Estatísticas gerais de perícias
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    total = await db.forensic_cases.count_documents({})
    
    by_status = {}
    for status in ["coleta", "analise", "laudo", "concluido", "arquivado"]:
        by_status[status] = await db.forensic_cases.count_documents({"status": status})
    
    by_tipo = {}
    for tipo in ["celular", "hd", "nuvem", "rede", "sistema", "memoria", "email"]:
        by_tipo[tipo] = await db.forensic_cases.count_documents({"tipo": tipo})
    
    by_priority = {}
    for priority in ["baixa", "normal", "alta", "urgente"]:
        by_priority[priority] = await db.forensic_cases.count_documents({"priority": priority})
    
    # Total de evidências
    total_evidences = await db.forensic_evidences.count_documents({})
    
    return {
        "total_cases": total,
        "total_evidences": total_evidences,
        "by_status": by_status,
        "by_tipo": by_tipo,
        "by_priority": by_priority
    }

@router.get("/types/available")
async def get_forensic_types(
    current_user: dict = Depends(get_current_user)
):
    """
    Retorna tipos de perícia disponíveis
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    forensic_types = [
        {
            "id": "celular",
            "name": "Celular / Smartphone",
            "description": "Extração e análise de dispositivos móveis",
            "icon": "📱",
            "color": "blue"
        },
        {
            "id": "hd",
            "name": "HD / SSD / Disco",
            "description": "Análise forense de discos rígidos e dispositivos de armazenamento",
            "icon": "💾",
            "color": "purple"
        },
        {
            "id": "nuvem",
            "name": "Nuvem / Cloud",
            "description": "Extração de dados de serviços em nuvem (Google Drive, iCloud, etc)",
            "icon": "☁️",
            "color": "cyan"
        },
        {
            "id": "rede",
            "name": "Rede / Network",
            "description": "Análise de tráfego de rede e pacotes",
            "icon": "🌐",
            "color": "green"
        },
        {
            "id": "sistema",
            "name": "Sistema / OS",
            "description": "Análise de sistemas operacionais e logs",
            "icon": "🖥️",
            "color": "orange"
        },
        {
            "id": "memoria",
            "name": "Memória RAM",
            "description": "Análise de memória volátil",
            "icon": "🧠",
            "color": "red"
        },
        {
            "id": "email",
            "name": "E-mail",
            "description": "Análise de e-mails e comunicações",
            "icon": "📧",
            "color": "yellow"
        }
    ]
    
    return {"forensic_types": forensic_types}
