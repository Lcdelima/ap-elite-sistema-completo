"""Módulo 13: Gestão de Cadeia de Custódia"""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/custody", tags=["Cadeia de Custódia"])

class CustodyAct(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    evidence_id: str
    act_type: str  # recebimento, aquisicao, transferencia, guarda, analise, encerramento
    user: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    location: Optional[str] = None
    hash_prev: Optional[str] = None
    hash_curr: str
    notes: Optional[str] = None

custody_db = {}

@router.post("/{evidence_id}/act")
async def register_custody_act(
    evidence_id: str,
    act_type: str,
    user: str,
    location: Optional[str] = None,
    notes: Optional[str] = None
):
    """Registra ato na cadeia de custódia"""
    prev_acts = [a for a in custody_db.values() if a.evidence_id == evidence_id]
    hash_prev = prev_acts[-1].hash_curr if prev_acts else None
    
    act = CustodyAct(
        evidence_id=evidence_id,
        act_type=act_type,
        user=user,
        location=location,
        hash_prev=hash_prev,
        hash_curr=str(uuid.uuid4()),
        notes=notes
    )
    custody_db[act.id] = act
    return act

@router.get("/{evidence_id}/timeline")
async def get_custody_timeline(evidence_id: str):
    """Timeline da cadeia de custódia"""
    acts = [a for a in custody_db.values() if a.evidence_id == evidence_id]
    acts.sort(key=lambda x: x.timestamp)
    return {"evidence_id": evidence_id, "acts": acts}

@router.get("/health")
async def health_check():
    return {"status": "ok", "module": "Cadeia de Custódia"}
