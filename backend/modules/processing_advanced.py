"""Módulo 14: Processamento Aprimorado (Orquestração de Jobs)"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/processing/advanced", tags=["Processamento Aprimorado"])

class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_type: str
    evidence_id: str
    priority: str = "P2"  # P1, P2, P3
    status: str = "queued"  # queued, running, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

jobs_db = {}

@router.get("/jobs")
async def list_jobs(status: Optional[str] = None, priority: Optional[str] = None):
    """Lista jobs"""
    jobs = list(jobs_db.values())
    if status:
        jobs = [j for j in jobs if j.status == status]
    if priority:
        jobs = [j for j in jobs if j.priority == priority]
    return {"total": len(jobs), "jobs": jobs}

@router.post("/jobs/{evidence_id}")
async def create_job(evidence_id: str, job_type: str, priority: str = "P2"):
    """Cria novo job de processamento"""
    job = Job(job_type=job_type, evidence_id=evidence_id, priority=priority)
    jobs_db[job.id] = job
    return job

@router.post("/retry/{job_id}")
async def retry_job(job_id: str):
    """Reprocessa job que falhou"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    
    job = jobs_db[job_id]
    job.status = "queued"
    job.error_message = None
    return job

@router.get("/stats")
async def get_stats():
    return {
        "total_jobs": len(jobs_db),
        "queued": len([j for j in jobs_db.values() if j.status == "queued"]),
        "running": len([j for j in jobs_db.values() if j.status == "running"]),
        "completed": len([j for j in jobs_db.values() if j.status == "completed"]),
        "failed": len([j for j in jobs_db.values() if j.status == "failed"])
    }

@router.get("/health")
async def health_check():
    return {"status": "ok", "module": "Processamento Aprimorado"}
