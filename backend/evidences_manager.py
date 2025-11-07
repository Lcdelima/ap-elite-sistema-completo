"""
AP ELITE ATHENA - Gestão de Evidências Digitais (Elite Gravitas™)
Upload e gestão de evidências com hash forense e cadeia de custódia

Features:
- Upload com hash SHA-256/512/MD5
- Metadados forenses (EXIF, timestamps, origem)
- Cadeia de custódia automática
- Categorização (mídia, documento, mensagem, sistema)
- OCR e análise IA preparada
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
import os
import uuid
import hashlib
import json
import aiofiles
from pathlib import Path

router = APIRouter(prefix="/api/evidences", tags=["Evidences - Elite Gravitas"])

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

# ==================== HELPER FUNCTIONS ====================

async def calculate_forensic_hashes(file_content: bytes) -> dict:
    """
    Calcula múltiplos hashes para verificação cruzada
    """
    return {
        "sha256": hashlib.sha256(file_content).hexdigest(),
        "sha512": hashlib.sha512(file_content).hexdigest(),
        "md5": hashlib.md5(file_content).hexdigest()
    }

# ==================== ENDPOINTS ====================

@router.post("/upload")
async def upload_evidence(
    file: UploadFile = File(...),
    forensic_case_id: str = Form(...),
    category: str = Form(...),  # midia, documento, mensagem, sistema, rede
    description: str = Form(None),
    source: str = Form(None),  # origem da evidência
    device_info: str = Form("{}"),  # JSON string
    collection_location: str = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload de evidência com hash forense e cadeia de custódia
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Verifica caso pericial
    case = await db.forensic_cases.find_one({"id": forensic_case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Caso pericial não encontrado")
    
    # Lê conteúdo
    file_content = await file.read()
    file_size = len(file_content)
    
    # Calcula hashes forenses
    hashes = await calculate_forensic_hashes(file_content)
    
    # Verifica duplicata
    existing = await db.forensic_evidences.find_one(
        {"sha256": hashes["sha256"], "forensic_case_id": forensic_case_id},
        {"_id": 0}
    )
    if existing:
        return {
            "success": False,
            "duplicate": True,
            "message": "Evidência duplicada detectada",
            "existing_evidence": existing
        }
    
    # Gera ID e storage path
    evidence_id = str(uuid.uuid4())
    storage_path = Path(STORAGE_BASE) / case["storage_path"] / "_Coletas"
    storage_path.mkdir(parents=True, exist_ok=True)
    
    # Nome do arquivo com ID
    filename_safe = f"{evidence_id}_{file.filename}"
    full_path = storage_path / filename_safe
    
    # Salva arquivo
    async with aiofiles.open(full_path, 'wb') as f:
        await f.write(file_content)
    
    # Salva hash em arquivo separado
    hash_file = storage_path / f"{evidence_id}_hashes.txt"
    async with aiofiles.open(hash_file, 'w') as f:
        await f.write(f"SHA-256: {hashes['sha256']}\n")
        await f.write(f"SHA-512: {hashes['sha512']}\n")
        await f.write(f"MD5: {hashes['md5']}\n")
        await f.write(f"Arquivo: {file.filename}\n")
        await f.write(f"Tamanho: {file_size} bytes\n")
        await f.write(f"Coletado em: {datetime.now(timezone.utc).isoformat()}\n")
        await f.write(f"Coletado por: {current_user.get('full_name', current_user.get('name'))}\n")
    
    # Parse device info
    try:
        device_info_dict = json.loads(device_info) if device_info else {}
    except:
        device_info_dict = {}
    
    # Cria registro da evidência
    now = datetime.now(timezone.utc).isoformat()
    
    evidence = {
        "id": evidence_id,
        "forensic_case_id": forensic_case_id,
        "case_number": case.get("case_number"),
        "filename": file.filename,
        "filename_stored": filename_safe,
        "category": category,
        "description": description or "",
        "source": source or "",
        
        # Metadados forenses
        "mime_type": file.content_type,
        "size_bytes": file_size,
        "size_human": f"{file_size / 1024:.2f} KB" if file_size < 1024*1024 else f"{file_size / (1024*1024):.2f} MB",
        
        # Hashes forenses
        "sha256": hashes["sha256"],
        "sha512": hashes["sha512"],
        "md5": hashes["md5"],
        
        # Coleta
        "collected_at": now,
        "collected_by": current_user.get("id"),
        "collection_location": collection_location or "",
        "device_info": device_info_dict,
        
        # Storage
        "storage_key": str(full_path.relative_to(STORAGE_BASE)),
        "hash_file_key": str(hash_file.relative_to(STORAGE_BASE)),
        
        # Análise (preparado para IA)
        "analyzed": False,
        "analysis_results": None,
        "ocr_text": None,
        "metadata_extracted": {},
        
        # Controle
        "sealed": False,
        "sealed_at": None,
        "sealed_by": None,
        
        # Audit
        "created_at": now,
        "version": 1
    }
    
    await db.forensic_evidences.insert_one(evidence)
    
    # Atualiza contador do caso
    await db.forensic_cases.update_one(
        {"id": forensic_case_id},
        {"$inc": {"evidences_count": 1}}
    )
    
    # Registro na cadeia de custódia
    await db.chain_of_custody.insert_one({
        "id": str(uuid.uuid4()),
        "forensic_case_id": forensic_case_id,
        "evidence_id": evidence_id,
        "event_type": "evidence_collected",
        "description": f"Evidência coletada: {file.filename}",
        "user_id": current_user.get("id"),
        "user_name": current_user.get("full_name", current_user.get("name")),
        "location": collection_location or "N/A",
        "device_info": device_info_dict,
        "hash_before": None,
        "hash_after": hashes["sha256"],
        "timestamp": now
    })
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "evidence_uploaded",
        "entity_type": "evidence",
        "entity_id": evidence_id,
        "details": {
            "filename": file.filename,
            "sha256": hashes["sha256"],
            "case_id": forensic_case_id
        },
        "timestamp": now
    })
    
    return {
        "success": True,
        "evidence_id": evidence_id,
        "evidence": evidence,
        "hashes": hashes
    }

@router.get("/")
async def list_evidences(
    forensic_case_id: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Lista evidências com filtros
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {}
    if forensic_case_id:
        query["forensic_case_id"] = forensic_case_id
    if category:
        query["category"] = category
    
    evidences = await db.forensic_evidences.find(query, {"_id": 0}).sort("collected_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.forensic_evidences.count_documents(query)
    
    return {
        "evidences": evidences,
        "total": total,
        "page": skip // limit + 1,
        "total_pages": (total + limit - 1) // limit
    }

@router.get("/{evidence_id}")
async def get_evidence(
    evidence_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtém detalhes completos de uma evidência
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    evidence = await db.forensic_evidences.find_one({"id": evidence_id}, {"_id": 0})
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    # Busca eventos da cadeia de custódia
    custody_events = await db.chain_of_custody.find(
        {"evidence_id": evidence_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(None)
    evidence["custody_events"] = custody_events
    
    return evidence

@router.get("/{evidence_id}/download")
async def download_evidence(
    evidence_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Download de evidência (com auditoria)
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    evidence = await db.forensic_evidences.find_one({"id": evidence_id}, {"_id": 0})
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    full_path = Path(STORAGE_BASE) / evidence["storage_key"]
    if not full_path.exists():
        raise HTTPException(status_code=404, detail="Arquivo físico não encontrado")
    
    # Registro na cadeia de custódia
    await db.chain_of_custody.insert_one({
        "id": str(uuid.uuid4()),
        "forensic_case_id": evidence["forensic_case_id"],
        "evidence_id": evidence_id,
        "event_type": "evidence_accessed",
        "description": f"Evidência acessada: {evidence['filename']}",
        "user_id": current_user.get("id"),
        "user_name": current_user.get("full_name", current_user.get("name")),
        "location": "Download",
        "device_info": {},
        "hash_before": evidence["sha256"],
        "hash_after": evidence["sha256"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "evidence_downloaded",
        "entity_type": "evidence",
        "entity_id": evidence_id,
        "details": {"filename": evidence["filename"]},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return FileResponse(
        path=str(full_path),
        filename=evidence["filename"],
        media_type=evidence["mime_type"]
    )

@router.post("/{evidence_id}/seal")
async def seal_evidence(
    evidence_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Lacra evidência (não pode mais ser modificada)
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    evidence = await db.forensic_evidences.find_one({"id": evidence_id}, {"_id": 0})
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    if evidence.get("sealed"):
        raise HTTPException(status_code=400, detail="Evidência já está lacrada")
    
    now = datetime.now(timezone.utc).isoformat()
    
    await db.forensic_evidences.update_one(
        {"id": evidence_id},
        {"$set": {
            "sealed": True,
            "sealed_at": now,
            "sealed_by": current_user.get("id")
        }}
    )
    
    # Registro na cadeia de custódia
    await db.chain_of_custody.insert_one({
        "id": str(uuid.uuid4()),
        "forensic_case_id": evidence["forensic_case_id"],
        "evidence_id": evidence_id,
        "event_type": "evidence_sealed",
        "description": f"Evidência lacrada: {evidence['filename']}",
        "user_id": current_user.get("id"),
        "user_name": current_user.get("full_name", current_user.get("name")),
        "location": "Sistema",
        "device_info": {},
        "hash_before": evidence["sha256"],
        "hash_after": evidence["sha256"],
        "timestamp": now
    })
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "evidence_sealed",
        "entity_type": "evidence",
        "entity_id": evidence_id,
        "details": {"sha256": evidence["sha256"]},
        "timestamp": now
    })
    
    return {"success": True, "message": "Evidência lacrada com sucesso"}

@router.get("/case/{case_id}/timeline")
async def get_evidences_timeline(
    case_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Timeline de evidências por caso
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    evidences = await db.forensic_evidences.find(
        {"forensic_case_id": case_id},
        {"_id": 0}
    ).sort("collected_at", 1).to_list(None)
    
    # Agrupa por data
    timeline = {}
    for evidence in evidences:
        date_key = evidence["collected_at"][:10]  # YYYY-MM-DD
        if date_key not in timeline:
            timeline[date_key] = []
        timeline[date_key].append(evidence)
    
    return {
        "case_id": case_id,
        "evidences": evidences,
        "timeline": timeline,
        "total": len(evidences)
    }

@router.get("/stats/overview")
async def get_evidences_stats(
    forensic_case_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Estatísticas de evidências
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {}
    if forensic_case_id:
        query["forensic_case_id"] = forensic_case_id
    
    total = await db.forensic_evidences.count_documents(query)
    
    by_category = {}
    for cat in ["midia", "documento", "mensagem", "sistema", "rede"]:
        by_category[cat] = await db.forensic_evidences.count_documents({**query, "category": cat})
    
    sealed_count = await db.forensic_evidences.count_documents({**query, "sealed": True})
    analyzed_count = await db.forensic_evidences.count_documents({**query, "analyzed": True})
    
    # Total de tamanho
    pipeline = [
        {"$match": query},
        {"$group": {"_id": None, "total_size": {"$sum": "$size_bytes"}}}
    ]
    size_result = await db.forensic_evidences.aggregate(pipeline).to_list(1)
    total_size = size_result[0]["total_size"] if size_result else 0
    
    return {
        "total_evidences": total,
        "by_category": by_category,
        "sealed": sealed_count,
        "analyzed": analyzed_count,
        "total_size_bytes": total_size,
        "total_size_human": f"{total_size / (1024*1024*1024):.2f} GB" if total_size > 1024*1024*1024 else f"{total_size / (1024*1024):.2f} MB"
    }
