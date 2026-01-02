"""Schemas Pydantic - Aegis System"""
from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel, Field

class CaseCreate(BaseModel):
    name: str = Field(min_length=3, max_length=200)

class CaseOut(BaseModel):
    id: uuid.UUID
    name: str
    status: str
    created_at: datetime

class EvidenceOut(BaseModel):
    id: uuid.UUID
    case_id: uuid.UUID
    target_id: uuid.UUID | None
    judicial_order_id: uuid.UUID | None
    type: str
    status: str
    mime_type: str
    original_filename: str
    size_bytes: int
    sha256: str
    storage_uri: str
    collected_at: datetime | None
    ingested_at: datetime
    transcription: str | None = None

class JudicialOrderOut(BaseModel):
    id: uuid.UUID
    case_id: uuid.UUID
    process_number: str
    court: str
    judge: str
    valid_from: datetime
    valid_until: datetime
    document_sha256: str
    document_uri: str
    created_at: datetime

class TargetCreate(BaseModel):
    type: str
    value: str
    label: str | None = None

class TargetOut(BaseModel):
    id: uuid.UUID
    case_id: uuid.UUID
    type: str
    value: str
    label: str | None
    created_at: datetime
