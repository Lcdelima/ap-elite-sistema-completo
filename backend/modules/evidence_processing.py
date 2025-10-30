"""Módulo 12: Processamento de Evidências"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import hashlib

# MongoDB connection
from server import db

router = APIRouter(prefix="/api/evidence", tags=["Processamento de Evidências"])

class Evidence(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    case_number: str
    evidence_type: str
    legal_basis: str
    status: str = "registered"
    hash_sha256: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

@router.get("/items")
async def list_evidences():
    """Lista todas as evidências"""
    evidences = await db.evidences.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return evidences

@router.get("/stats")
async def get_stats():
    """Estatísticas do módulo"""
    total = await db.evidences.count_documents({})
    registered = await db.evidences.count_documents({"status": "registered"})
    uploaded = await db.evidences.count_documents({"status": "uploaded"})
    analyzed = await db.evidences.count_documents({"status": "analyzed"})
    
    return {
        "total": total,
        "registered": registered,
        "uploaded": uploaded,
        "analyzed": analyzed
    }

@router.post("/register")
async def register_evidence(
    title: str = Form(...),
    case_number: str = Form(...),
    evidence_type: str = Form(...),
    legal_basis: str = Form(...)
):
    """Registra nova evidência"""
    evidence = {
        "id": str(uuid.uuid4()),
        "title": title,
        "case_number": case_number,
        "evidence_type": evidence_type,
        "legal_basis": legal_basis,
        "status": "registered",
        "hash_sha256": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.evidences.insert_one(evidence)
    return evidence

@router.post("/{evidence_id}/upload")
async def upload_evidence(
    evidence_id: str,
    file: UploadFile = File(...),
    chunk_number: int = Form(0),
    total_chunks: int = Form(1)
):
    """Upload com chunks"""
    if evidence_id not in evidences_db:
        raise HTTPException(status_code=404)
    
    content = await file.read()
    hash_chunk = hashlib.sha256(content).hexdigest()
    
    if chunk_number == total_chunks - 1:
        evidences_db[evidence_id].hash_sha256 = hash_chunk
        evidences_db[evidence_id].status = "uploaded"
    
    return {
        "evidence_id": evidence_id,
        "chunk": chunk_number,
        "hash": hash_chunk
    }

@router.post("/{evidence_id}/analyze")
async def analyze_evidence(evidence_id: str):
    """Analisa evidência"""
    if evidence_id not in evidences_db:
        raise HTTPException(status_code=404)
    evidences_db[evidence_id].status = "analyzed"
    return {"evidence_id": evidence_id, "status": "analyzed"}

@router.post("/{evidence_id}/export")
async def export_evidence(evidence_id: str, format: str = "pdf"):
    """Exporta evidência"""
    return {
        "evidence_id": evidence_id,
        "format": format,
        "generated_at": datetime.utcnow().isoformat()
    }

@router.get("/health")
async def health_check():
    return {"status": "ok", "module": "Processamento de Evidências"}
