"""Modelos de Banco de Dados - Aegis System"""
from __future__ import annotations

import hashlib
import json
import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class CaseStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    CLOSED = "CLOSED"

class TargetType(str, Enum):
    PHONE = "PHONE"
    IP = "IP"
    PERSON = "PERSON"
    IDENTIFIER = "IDENTIFIER"

class EvidenceType(str, Enum):
    AUDIO = "AUDIO"
    DATA = "DATA"
    IMAGE = "IMAGE"
    VIDEO = "VIDEO"
    DOCUMENT = "DOCUMENT"

class EvidenceStatus(str, Enum):
    RECEIVED = "RECEIVED"
    PROCESSING = "PROCESSING"
    PROCESSED = "PROCESSED"
    FAILED = "FAILED"

class CustodyAction(str, Enum):
    INGESTED = "INGESTED"
    HASH_VERIFIED = "HASH_VERIFIED"
    ACCESSED = "ACCESSED"
    EXPORTED = "EXPORTED"
    TRANSCRIBED = "TRANSCRIBED"
    REDACTED = "REDACTED"

class Case(Base):
    __tablename__ = "cases"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[CaseStatus] = mapped_column(SAEnum(CaseStatus), nullable=False, default=CaseStatus.ACTIVE)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    judicial_orders: Mapped[list[JudicialOrder]] = relationship(back_populates="case", cascade="all, delete-orphan")
    targets: Mapped[list[Target]] = relationship(back_populates="case", cascade="all, delete-orphan")
    evidences: Mapped[list[Evidence]] = relationship(back_populates="case", cascade="all, delete-orphan")

class JudicialOrder(Base):
    __tablename__ = "judicial_orders"
    __table_args__ = (
        UniqueConstraint("case_id", "process_number", name="uq_case_process_number"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)

    process_number: Mapped[str] = mapped_column(String(80), nullable=False)
    court: Mapped[str] = mapped_column(String(120), nullable=False)
    judge: Mapped[str] = mapped_column(String(120), nullable=False)

    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    document_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    document_uri: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    case: Mapped[Case] = relationship(back_populates="judicial_orders")

class Target(Base):
    __tablename__ = "targets"
    __table_args__ = (
        UniqueConstraint("case_id", "type", "value", name="uq_case_target"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)

    type: Mapped[TargetType] = mapped_column(SAEnum(TargetType), nullable=False)
    value: Mapped[str] = mapped_column(String(200), nullable=False)
    label: Mapped[str | None] = mapped_column(String(200), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    case: Mapped[Case] = relationship(back_populates="targets")
    evidences: Mapped[list[Evidence]] = relationship(back_populates="target")

class Evidence(Base):
    __tablename__ = "evidences"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    target_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("targets.id"), nullable=True)
    judicial_order_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("judicial_orders.id"), nullable=True)

    type: Mapped[EvidenceType] = mapped_column(SAEnum(EvidenceType), nullable=False)
    status: Mapped[EvidenceStatus] = mapped_column(SAEnum(EvidenceStatus), nullable=False, default=EvidenceStatus.RECEIVED)

    mime_type: Mapped[str] = mapped_column(String(120), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(260), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)

    sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    storage_uri: Mapped[str] = mapped_column(Text, nullable=False)

    collected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    transcription: Mapped[str | None] = mapped_column(Text, nullable=True)

    case: Mapped[Case] = relationship(back_populates="evidences")
    target: Mapped[Target | None] = relationship(back_populates="evidences")
    custody_events: Mapped[list[CustodyEvent]] = relationship(back_populates="evidence", cascade="all, delete-orphan")

class CustodyEvent(Base):
    __tablename__ = "custody_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("evidences.id"), nullable=False)

    actor_id: Mapped[str] = mapped_column(String(120), nullable=False)
    action: Mapped[CustodyAction] = mapped_column(SAEnum(CustodyAction), nullable=False)

    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    prev_event_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
    event_hash: Mapped[str] = mapped_column(String(64), nullable=False)

    metadata: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    evidence: Mapped[Evidence] = relationship(back_populates="custody_events")

    @staticmethod
    def compute_event_hash(
        *,
        evidence_id: uuid.UUID,
        actor_id: str,
        action: CustodyAction,
        timestamp: datetime,
        prev_event_hash: str | None,
        metadata: dict,
    ) -> str:
        payload = {
            "evidence_id": str(evidence_id),
            "actor_id": actor_id,
            "action": action.value,
            "timestamp": timestamp.replace(microsecond=0).isoformat(),
            "prev_event_hash": prev_event_hash,
            "metadata": metadata,
        }
        raw = json.dumps(payload, sort_keys=True, ensure_ascii=False).encode("utf-8")
        return hashlib.sha256(raw).hexdigest()

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id: Mapped[str] = mapped_column(String(120), nullable=False)
    action: Mapped[str] = mapped_column(String(120), nullable=False)

    entity_type: Mapped[str] = mapped_column(String(120), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(120), nullable=False)

    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    ip: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(240), nullable=True)

    details: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
