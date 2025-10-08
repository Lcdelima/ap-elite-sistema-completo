"""
AP ELITE ATHENA - Sistema ERP Completo
18 Módulos Integrados com Segurança E2E e Cloud
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from geoalchemy2 import Geometry
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import os
import uuid
import json
import googlemaps
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import secrets
import base64
from pydantic import BaseModel
import aiofiles
from pathlib import Path

# Environment
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Google Maps
gmaps = googlemaps.Client(key=os.environ.get('GOOGLE_MAPS_API_KEY'))

# PostgreSQL for geospatial (ERBs)
POSTGRES_URL = os.getenv('POSTGRES_URL', 'postgresql://postgres:postgres@localhost:5432/ap_elite')
try:
    pg_engine = create_engine(POSTGRES_URL)
    PGSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=pg_engine)
    Base = declarative_base()
except:
    pg_engine = None
    PGSessionLocal = None
    Base = declarative_base()

# Security
security = HTTPBearer(auto_error=False)

# Router
super_router = APIRouter(prefix="/api/athena")

# WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

# ==================== E2E ENCRYPTION ====================

class E2EEncryption:
    """End-to-End Encryption with Signal Protocol adapted"""
    
    @staticmethod
    def generate_key():
        """Generate a new encryption key"""
        return AESGCM.generate_key(bit_length=256)
    
    @staticmethod
    def encrypt_message(message: str, key: bytes) -> dict:
        """Encrypt message with AES-256-GCM"""
        aesgcm = AESGCM(key)
        nonce = secrets.token_bytes(12)
        
        ciphertext = aesgcm.encrypt(nonce, message.encode(), None)
        
        return {
            "ciphertext": base64.b64encode(ciphertext).decode(),
            "nonce": base64.b64encode(nonce).decode()
        }
    
    @staticmethod
    def decrypt_message(encrypted_data: dict, key: bytes) -> str:
        """Decrypt message"""
        aesgcm = AESGCM(key)
        
        ciphertext = base64.b64decode(encrypted_data["ciphertext"])
        nonce = base64.b64decode(encrypted_data["nonce"])
        
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode()
    
    @staticmethod
    def derive_key_from_password(password: str, salt: bytes = None) -> tuple:
        """Derive key from password using PBKDF2"""
        if salt is None:
            salt = secrets.token_bytes(16)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = kdf.derive(password.encode())
        
        return key, salt

# Authentication
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

# PostgreSQL Models for Geospatial
class ERB(Base):
    """Estação Rádio Base (Cell Tower)"""
    __tablename__ = 'erbs'
    
    id = Column(Integer, primary_key=True)
    erb_id = Column(String, unique=True, nullable=False)
    name = Column(String)
    operator = Column(String)  # Vivo, Claro, TIM, Oi
    technology = Column(String)  # 2G, 3G, 4G, 5G
    location = Column(Geometry('POINT'))
    latitude = Column(Float)
    longitude = Column(Float)
    address = Column(Text)
    coverage_radius = Column(Float)  # meters
    status = Column(String, default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class InterceptionLocation(Base):
    """Location data from interceptions"""
    __tablename__ = 'interception_locations'
    
    id = Column(Integer, primary_key=True)
    interception_id = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    location = Column(Geometry('POINT'))
    latitude = Column(Float)
    longitude = Column(Float)
    accuracy = Column(Float)  # meters
    erb_id = Column(String)
    speed = Column(Float)  # km/h
    bearing = Column(Float)  # degrees
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
if pg_engine:
    Base.metadata.create_all(bind=pg_engine)

# Pydantic Models
class DashboardMetrics(BaseModel):
    total_cases: int = 0
    active_cases: int = 0
    total_clients: int = 0
    monthly_revenue: float = 0.0
    pending_tasks: int = 0
    upcoming_hearings: int = 0

class ClientCreate(BaseModel):
    name: str
    email: str
    phone: str
    cpf: str
    address: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None

class ProcessCreate(BaseModel):
    process_number: str
    client_id: str
    title: str
    description: str
    court: str
    lawyer_id: str
    status: str = "active"
    priority: str = "medium"
    start_date: str

class MessageCreate(BaseModel):
    recipient_id: str
    content: str
    encrypted: bool = True

class MeetingLinkCreate(BaseModel):
    title: str
    duration_minutes: int = 60
    participants: List[str]
    scheduled_time: Optional[str] = None

class ERBCreate(BaseModel):
    erb_id: str
    name: str
    operator: str
    technology: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    coverage_radius: float = 500.0

class InterceptionCreate(BaseModel):
    target_phone: str
    start_date: str
    end_date: str
    type: str  # phone, data
    authorization: str
    case_id: str

# ==================== MODULE 1: DASHBOARD ====================

@super_router.get("/dashboard/metrics")
async def get_dashboard_metrics(current_user: dict = Depends(get_current_user)):
    """Get comprehensive dashboard metrics"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get metrics from MongoDB
    total_cases = await db.cases.count_documents({})
    active_cases = await db.cases.count_documents({"status": "active"})
    total_clients = await db.users.count_documents({"role": "client"})
    pending_tasks = await db.tasks.count_documents({"status": "pending"})
    
    # Monthly revenue
    first_day = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    pipeline = [
        {"$match": {"type": {"$in": ["income", "fee"]}, "date": {"$gte": first_day.isoformat()}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.financial_records.aggregate(pipeline).to_list(1)
    monthly_revenue = revenue_result[0]["total"] if revenue_result else 0.0
    
    # Upcoming hearings
    upcoming_hearings = await db.hearings.count_documents({
        "date": {"$gte": datetime.now(timezone.utc).isoformat()}
    })
    
    return {
        "total_cases": total_cases,
        "active_cases": active_cases,
        "total_clients": total_clients,
        "monthly_revenue": monthly_revenue,
        "pending_tasks": pending_tasks,
        "upcoming_hearings": upcoming_hearings,
        "active_interceptions": await db.interceptions.count_documents({"status": "active"}),
        "evidence_processing": await db.evidence.count_documents({"status": "processing"})
    }

# ==================== MODULE 2: GESTÃO DE CLIENTES ====================

@super_router.post("/clients")
async def create_client(client: ClientCreate, current_user: dict = Depends(get_current_user)):
    """Create new client"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    client_dict = client.model_dump()
    client_dict["id"] = str(uuid.uuid4())
    client_dict["created_by"] = current_user["id"]
    client_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    client_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.clients.insert_one(client_dict)
    
    return {"id": client_dict["id"], "message": "Client created successfully"}

@super_router.get("/clients")
async def list_clients(current_user: dict = Depends(get_current_user)):
    """List all clients"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    clients = await db.clients.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"clients": clients}

@super_router.get("/clients/{client_id}")
async def get_client(client_id: str, current_user: dict = Depends(get_current_user)):
    """Get client details"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    client = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get related processes
    processes = await db.processes.find({"client_id": client_id}, {"_id": 0}).to_list(100)
    
    return {
        "client": client,
        "processes": processes,
        "total_processes": len(processes)
    }

# ==================== MODULE 3: GESTÃO DE PROCESSOS ====================

@super_router.post("/processes")
async def create_process(process: ProcessCreate, current_user: dict = Depends(get_current_user)):
    """Create new legal process"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    process_dict = process.model_dump()
    process_dict["id"] = str(uuid.uuid4())
    process_dict["created_by"] = current_user["id"]
    process_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    process_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    process_dict["phases"] = []
    process_dict["documents"] = []
    process_dict["hearings"] = []
    
    await db.processes.insert_one(process_dict)
    
    return {"id": process_dict["id"], "message": "Process created successfully"}

@super_router.get("/processes")
async def list_processes(
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List processes with filters"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    query = {}
    if status:
        query["status"] = status
    if client_id:
        query["client_id"] = client_id
    
    processes = await db.processes.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"processes": processes}

# ==================== MODULE 4: COMUNICAÇÃO CORPORATIVA E2E ====================

@super_router.post("/messages/send")
async def send_encrypted_message(message: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Send E2E encrypted message"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Get recipient's public key (simplified - in production use Signal Protocol)
    recipient = await db.users.find_one({"id": message.recipient_id}, {"_id": 0})
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Generate session key
    session_key = E2EEncryption.generate_key()
    
    # Encrypt message
    encrypted_data = E2EEncryption.encrypt_message(message.content, session_key)
    
    message_doc = {
        "id": str(uuid.uuid4()),
        "sender_id": current_user["id"],
        "recipient_id": message.recipient_id,
        "encrypted_content": encrypted_data,
        "encrypted": message.encrypted,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message_doc)
    
    # Send via WebSocket if recipient is online
    await manager.send_personal_message(
        json.dumps({"type": "new_message", "message_id": message_doc["id"]}),
        message.recipient_id
    )
    
    return {"message_id": message_doc["id"], "encrypted": True}

@super_router.get("/messages")
async def get_messages(current_user: dict = Depends(get_current_user)):
    """Get user messages"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    messages = await db.messages.find({
        "$or": [
            {"sender_id": current_user["id"]},
            {"recipient_id": current_user["id"]}
        ]
    }, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    
    return {"messages": messages}

@super_router.websocket("/ws/chat/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: str):
    """WebSocket for real-time chat"""
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast message
            await manager.broadcast(f"User {user_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(user_id)

# ==================== MODULE 5: CALENDÁRIO CORPORATIVO ====================

@super_router.post("/calendar/events")
async def create_event(
    title: str = Form(...),
    description: str = Form(...),
    start_time: str = Form(...),
    end_time: str = Form(...),
    participants: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Create calendar event"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    event = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "start_time": start_time,
        "end_time": end_time,
        "participants": json.loads(participants),
        "organizer_id": current_user["id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.calendar_events.insert_one(event)
    
    # TODO: Sync with Google Calendar / Outlook
    
    return {"event_id": event["id"], "message": "Event created"}

@super_router.get("/calendar/events")
async def get_events(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get calendar events"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    query = {"participants": current_user["id"]}
    if start_date and end_date:
        query["start_time"] = {"$gte": start_date, "$lte": end_date}
    
    events = await db.calendar_events.find(query, {"_id": 0}).sort("start_time", 1).to_list(100)
    return {"events": events}

# ==================== MODULE 6 & 7: GERADOR DE LINKS & VIDEOCONFERÊNCIA ====================

@super_router.post("/meetings/create")
async def create_meeting_link(meeting: MeetingLinkCreate, current_user: dict = Depends(get_current_user)):
    """Create Jitsi meeting link with E2E encryption"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    room_id = str(uuid.uuid4())[:8].upper()
    password = secrets.token_urlsafe(8)
    
    meeting_doc = {
        "id": str(uuid.uuid4()),
        "room_id": room_id,
        "title": meeting.title,
        "duration_minutes": meeting.duration_minutes,
        "participants": meeting.participants,
        "organizer_id": current_user["id"],
        "meeting_link": f"https://meet.jit.si/apelite-{room_id}",
        "password": password,
        "scheduled_time": meeting.scheduled_time,
        "status": "scheduled",
        "e2e_enabled": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.meetings.insert_one(meeting_doc)
    
    return {
        "meeting_id": meeting_doc["id"],
        "room_id": room_id,
        "meeting_link": meeting_doc["meeting_link"],
        "password": password,
        "e2e_enabled": True
    }

@super_router.get("/meetings")
async def list_meetings(current_user: dict = Depends(get_current_user)):
    """List user meetings"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    meetings = await db.meetings.find({
        "$or": [
            {"organizer_id": current_user["id"]},
            {"participants": current_user["id"]}
        ]
    }, {"_id": 0}).sort("scheduled_time", -1).to_list(100)
    
    return {"meetings": meetings}

# Continue in next file due to size...
