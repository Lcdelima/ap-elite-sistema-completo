from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

# Base Models
class BaseDocument(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# User Management
class User(BaseDocument):
    name: str
    email: str
    password: str
    role: str  # administrator, client, analyst, investigator
    phone: Optional[str] = None
    cpf: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None
    permissions: List[str] = []
    last_login: Optional[datetime] = None
    active: bool = True
    profile_image: Optional[str] = None

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    phone: Optional[str] = None
    cpf: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None
    permissions: List[str] = []

class UserLogin(BaseModel):
    email: str
    password: str
    role: str

# Case/Process Management
class Case(BaseDocument):
    client_id: str
    case_number: str
    title: str
    service_type: str
    description: str
    status: str = "active"  # active, completed, suspended, cancelled
    priority: str = "normal"  # low, normal, high, urgent
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completion_date: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None
    assigned_to: Optional[str] = None
    team_members: List[str] = []
    fee: Optional[float] = None
    expenses: Optional[float] = 0.0
    payment_status: str = "pending"  # pending, partial, paid, overdue
    court: Optional[str] = None
    judge: Optional[str] = None
    prosecutor: Optional[str] = None
    notes: Optional[str] = None
    tags: List[str] = []
    evidence_count: int = 0
    document_count: int = 0

class CaseCreate(BaseModel):
    client_id: str
    title: str
    service_type: str
    description: str
    priority: str = "normal"
    estimated_completion: Optional[str] = None
    fee: Optional[float] = None
    court: Optional[str] = None
    judge: Optional[str] = None
    prosecutor: Optional[str] = None
    notes: Optional[str] = None
    tags: List[str] = []

# Evidence Management
class Evidence(BaseDocument):
    case_id: str
    evidence_number: str
    name: str
    type: str  # digital, physical, document, audio, video, phone, computer
    description: str
    source: str
    chain_of_custody: List[Dict[str, Any]] = []
    hash_md5: Optional[str] = None
    hash_sha256: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    analysis_status: str = "pending"  # pending, analyzing, completed, failed
    analysis_results: Optional[Dict[str, Any]] = None
    extracted_data: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = {}
    confidentiality: str = "restricted"  # public, restricted, confidential, secret
    tags: List[str] = []

class EvidenceCreate(BaseModel):
    case_id: str
    name: str
    type: str
    description: str
    source: str
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    metadata: Dict[str, Any] = {}
    confidentiality: str = "restricted"
    tags: List[str] = []

# Financial Management
class FinancialRecord(BaseDocument):
    case_id: Optional[str] = None
    client_id: str
    type: str  # income, expense, fee, cost
    category: str
    description: str
    amount: float
    currency: str = "BRL"
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "pending"  # pending, approved, paid, cancelled
    payment_method: Optional[str] = None
    invoice_number: Optional[str] = None
    receipt_path: Optional[str] = None
    notes: Optional[str] = None

class FinancialRecordCreate(BaseModel):
    case_id: Optional[str] = None
    client_id: str
    type: str
    category: str
    description: str
    amount: float
    currency: str = "BRL"
    payment_method: Optional[str] = None
    invoice_number: Optional[str] = None
    notes: Optional[str] = None

# Communication System
class Message(BaseDocument):
    sender_id: str
    recipient_ids: List[str]
    case_id: Optional[str] = None
    subject: str
    content: str
    message_type: str = "internal"  # internal, email, sms, whatsapp
    priority: str = "normal"  # low, normal, high, urgent
    status: str = "sent"  # draft, sent, delivered, read
    attachments: List[str] = []
    read_by: Dict[str, datetime] = {}
    thread_id: Optional[str] = None

class MessageCreate(BaseModel):
    recipient_ids: List[str]
    case_id: Optional[str] = None
    subject: str
    content: str
    message_type: str = "internal"
    priority: str = "normal"
    attachments: List[str] = []

# Meeting/Conference Management
class Meeting(BaseDocument):
    organizer_id: str
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    participants: List[str] = []
    case_id: Optional[str] = None
    meeting_type: str = "video"  # video, audio, in_person
    platform: str = "internal"  # internal, zoom, meet, teams
    meeting_link: Optional[str] = None
    meeting_id: Optional[str] = None
    password: Optional[str] = None
    status: str = "scheduled"  # scheduled, in_progress, completed, cancelled
    recording_url: Optional[str] = None
    notes: Optional[str] = None
    agenda: List[str] = []

class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: str
    end_time: str
    participants: List[str] = []
    case_id: Optional[str] = None
    meeting_type: str = "video"
    platform: str = "internal"
    agenda: List[str] = []

# Analysis Models
class InterceptionAnalysis(BaseDocument):
    case_id: str
    evidence_id: str
    analysis_type: str  # phone, telematics, email, messaging
    source_data: str  # path or identifier to source data
    analysis_params: Dict[str, Any] = {}
    status: str = "pending"  # pending, processing, completed, failed
    progress: float = 0.0
    results: Optional[Dict[str, Any]] = None
    extracted_contacts: List[Dict[str, Any]] = []
    extracted_messages: List[Dict[str, Any]] = []
    extracted_calls: List[Dict[str, Any]] = []
    timeline: List[Dict[str, Any]] = []
    geographic_data: List[Dict[str, Any]] = []
    network_analysis: Optional[Dict[str, Any]] = None
    report_path: Optional[str] = None
    analyst_id: str
    analysis_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InterceptionAnalysisCreate(BaseModel):
    case_id: str
    evidence_id: str
    analysis_type: str
    source_data: str
    analysis_params: Dict[str, Any] = {}
    analyst_id: str

# IPED Integration
class IPEDProject(BaseDocument):
    case_id: str
    project_name: str
    evidence_ids: List[str]
    iped_version: str
    project_path: str
    status: str = "created"  # created, processing, indexed, completed, failed
    progress: float = 0.0
    total_items: Optional[int] = None
    processed_items: Optional[int] = None
    categories: Dict[str, int] = {}
    bookmarks: List[Dict[str, Any]] = []
    export_path: Optional[str] = None
    analyst_id: str
    processing_start: Optional[datetime] = None
    processing_end: Optional[datetime] = None
    log_path: Optional[str] = None

class IPEDProjectCreate(BaseModel):
    case_id: str
    project_name: str
    evidence_ids: List[str]
    analyst_id: str

# Task Management
class Task(BaseDocument):
    case_id: Optional[str] = None
    assigned_to: str
    created_by: str
    title: str
    description: str
    priority: str = "normal"  # low, normal, high, urgent
    status: str = "pending"  # pending, in_progress, completed, cancelled
    due_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    dependencies: List[str] = []
    attachments: List[str] = []
    comments: List[Dict[str, Any]] = []
    tags: List[str] = []

class TaskCreate(BaseModel):
    case_id: Optional[str] = None
    assigned_to: str
    title: str
    description: str
    priority: str = "normal"
    due_date: Optional[str] = None
    estimated_hours: Optional[float] = None
    dependencies: List[str] = []
    tags: List[str] = []

# Document Templates
class DocumentTemplate(BaseDocument):
    name: str
    category: str  # contract, report, petition, analysis
    description: str
    template_path: str
    variables: List[str] = []
    department: Optional[str] = None
    active: bool = True

# Audit Log
class AuditLog(BaseDocument):
    user_id: str
    action: str
    resource_type: str
    resource_id: str
    details: Dict[str, Any] = {}
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Calendar Events
class CalendarEvent(BaseDocument):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    all_day: bool = False
    location: Optional[str] = None
    organizer_id: str
    attendees: List[str] = []
    case_id: Optional[str] = None
    event_type: str = "meeting"  # meeting, deadline, court, appointment
    status: str = "confirmed"  # tentative, confirmed, cancelled
    recurrence: Optional[Dict[str, Any]] = None
    reminders: List[Dict[str, Any]] = []
    calendar_id: str = "default"
    external_id: Optional[str] = None

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: str
    end_time: str
    all_day: bool = False
    location: Optional[str] = None
    attendees: List[str] = []
    case_id: Optional[str] = None
    event_type: str = "meeting"
    recurrence: Optional[Dict[str, Any]] = None
    reminders: List[Dict[str, Any]] = []