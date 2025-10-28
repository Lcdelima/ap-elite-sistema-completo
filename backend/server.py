from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

# Import CISAI+ Module
from cisai_plus_module import router as cisai_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="AP Elite - Perícia e Investigação Criminal")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models for AP Elite
class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ServiceCreate(BaseModel):
    title: str
    description: str
    category: str

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read: bool = False

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    service: str
    datetime: datetime
    description: Optional[str] = None
    urgency: str = "normal"
    status: str = "pending"  # pending, confirmed, cancelled, completed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentCreate(BaseModel):
    name: str
    email: str
    phone: str
    service: str
    date: str
    time: str
    description: Optional[str] = None
    urgency: str = "normal"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    password: str  # In production, this should be hashed
    role: str  # "administrator" or "client"
    phone: Optional[str] = None
    cpf: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_login: Optional[datetime] = None
    active: bool = True

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    phone: Optional[str] = None
    cpf: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str
    role: str

class Case(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_id: str
    title: str
    service_type: str
    description: str
    status: str = "active"  # active, completed, suspended, cancelled
    priority: str = "normal"  # low, normal, high, urgent
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completion_date: Optional[datetime] = None
    estimated_completion: Optional[datetime] = None
    assigned_to: Optional[str] = None
    fee: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CaseCreate(BaseModel):
    client_id: str
    title: str
    service_type: str
    description: str
    priority: str = "normal"
    estimated_completion: Optional[str] = None
    fee: Optional[float] = None
    notes: Optional[str] = None

class Document(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    case_id: str
    client_id: str
    filename: str
    file_type: str
    file_size: int
    description: Optional[str] = None
    category: str  # "laudo", "relatorio", "petição", "contrato", "evidencia"
    upload_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    confidential: bool = True

class DocumentCreate(BaseModel):
    case_id: str
    client_id: str
    filename: str
    file_type: str
    file_size: int
    description: Optional[str] = None
    category: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "AP Elite - Estratégias em Perícia e Investigação Criminal"}

@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({"active": True}, {"_id": 0}).to_list(100)
    for service in services:
        if isinstance(service['created_at'], str):
            service['created_at'] = datetime.fromisoformat(service['created_at'])
    return services

@api_router.post("/services", response_model=Service)
async def create_service(service_data: ServiceCreate):
    service_dict = service_data.model_dump()
    service_obj = Service(**service_dict)
    
    doc = service_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.services.insert_one(doc)
    return service_obj

@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(contact_data: ContactMessageCreate):
    contact_dict = contact_data.model_dump()
    contact_obj = ContactMessage(**contact_dict)
    
    doc = contact_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.contact_messages.insert_one(doc)
    return contact_obj

@api_router.get("/contact", response_model=List[ContactMessage])
async def get_contact_messages():
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for message in messages:
        if isinstance(message['created_at'], str):
            message['created_at'] = datetime.fromisoformat(message['created_at'])
    return messages

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment_data: AppointmentCreate):
    # Convert date and time to datetime
    datetime_str = f"{appointment_data.date}T{appointment_data.time}:00"
    appointment_datetime = datetime.fromisoformat(datetime_str)
    
    # Create appointment object
    appointment_dict = appointment_data.model_dump()
    appointment_dict['datetime'] = appointment_datetime
    appointment_obj = Appointment(**appointment_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = appointment_obj.model_dump()
    doc['datetime'] = doc['datetime'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.appointments.insert_one(doc)
    return appointment_obj

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments():
    appointments = await db.appointments.find({}, {"_id": 0}).sort("datetime", 1).to_list(100)
    for appointment in appointments:
        if isinstance(appointment['datetime'], str):
            appointment['datetime'] = datetime.fromisoformat(appointment['datetime'])
        if isinstance(appointment['created_at'], str):
            appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    return appointments

# Authentication and User Management
@api_router.post("/auth/login")
async def login_user(login_data: UserLogin):
    # Find user by email and role
    user = await db.users.find_one({
        "email": login_data.email, 
        "role": login_data.role,
        "active": True
    }, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # In production, verify hashed password
    if user["password"] != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Remove password from response
    user.pop("password", None)
    
    return {
        "user": user,
        "token": f"token_{user['id']}_{datetime.now().timestamp()}"
    }

@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_dict = user_data.model_dump()
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    # Remove password from response
    user_obj.password = "***"
    return user_obj

# Disabled - using user_management.py endpoint instead
# @api_router.get("/users")
# async def get_users():
#     users = await db.users.find({"active": True}, {"_id": 0, "password": 0}).to_list(100)
#     for user in users:
#         if isinstance(user['created_at'], str):
#             user['created_at'] = datetime.fromisoformat(user['created_at'])
#     return {"users": users, "total": len(users)}

# Case Management
# Disabled - using enhanced_server.py endpoints to avoid conflicts
# @api_router.post("/cases", response_model=Case)
# async def create_case(case_data: CaseCreate):
#     case_dict = case_data.model_dump()
#     if case_dict.get('estimated_completion'):
#         case_dict['estimated_completion'] = datetime.fromisoformat(case_dict['estimated_completion'])
#     
#     case_obj = Case(**case_dict)
#     
#     doc = case_obj.model_dump()
#     doc['start_date'] = doc['start_date'].isoformat()
#     doc['created_at'] = doc['created_at'].isoformat()
#     if doc.get('estimated_completion'):
#         doc['estimated_completion'] = doc['estimated_completion'].isoformat()
#     
#     await db.cases.insert_one(doc)
#     return case_obj

# @api_router.get("/cases", response_model=List[Case])
# async def get_cases():
#     cases = await db.cases.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
#     for case in cases:
#         if isinstance(case['start_date'], str):
#             case['start_date'] = datetime.fromisoformat(case['start_date'])
#         if isinstance(case['created_at'], str):
#             case['created_at'] = datetime.fromisoformat(case['created_at'])
#         if case.get('completion_date') and isinstance(case['completion_date'], str):
#             case['completion_date'] = datetime.fromisoformat(case['completion_date'])
#     return cases

# @api_router.get("/cases/client/{client_id}", response_model=List[Case])
# async def get_client_cases(client_id: str):
#     cases = await db.cases.find({"client_id": client_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
#     for case in cases:
#         if isinstance(case['start_date'], str):
#             case['start_date'] = datetime.fromisoformat(case['start_date'])
#         if isinstance(case['created_at'], str):
#             case['created_at'] = datetime.fromisoformat(case['created_at'])
#     return cases

@api_router.put("/cases/{case_id}/status")
async def update_case_status(case_id: str, status: str):
    update_data = {"status": status}
    if status == "completed":
        update_data["completion_date"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.cases.update_one(
        {"id": case_id},
        {"$set": update_data}
    )
    if result.modified_count == 1:
        return {"message": "Case status updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Case not found")

# Document Management
@api_router.post("/documents", response_model=Document)
async def create_document(document_data: DocumentCreate):
    doc_dict = document_data.model_dump()
    doc_obj = Document(**doc_dict)
    
    doc = doc_obj.model_dump()
    doc['upload_date'] = doc['upload_date'].isoformat()
    
    await db.documents.insert_one(doc)
    return doc_obj

@api_router.get("/documents/case/{case_id}", response_model=List[Document])
async def get_case_documents(case_id: str):
    docs = await db.documents.find({"case_id": case_id}, {"_id": 0}).sort("upload_date", -1).to_list(100)
    for doc in docs:
        if isinstance(doc['upload_date'], str):
            doc['upload_date'] = datetime.fromisoformat(doc['upload_date'])
    return docs

@api_router.get("/documents/client/{client_id}", response_model=List[Document])
async def get_client_documents(client_id: str):
    docs = await db.documents.find({"client_id": client_id}, {"_id": 0}).sort("upload_date", -1).to_list(100)
    for doc in docs:
        if isinstance(doc['upload_date'], str):
            doc['upload_date'] = datetime.fromisoformat(doc['upload_date'])
    return docs

# Admin Statistics
@api_router.get("/admin/stats")
async def get_admin_statistics():
    total_appointments = await db.appointments.count_documents({})
    pending_appointments = await db.appointments.count_documents({"status": "pending"})
    total_cases = await db.cases.count_documents({})
    active_cases = await db.cases.count_documents({"status": "active"})
    total_clients = await db.users.count_documents({"role": "client", "active": True})
    total_documents = await db.documents.count_documents({})
    unread_messages = await db.contact_messages.count_documents({"read": False})
    
    return {
        "total_appointments": total_appointments,
        "pending_appointments": pending_appointments,
        "total_cases": total_cases,
        "active_cases": active_cases,
        "total_clients": total_clients,
        "total_documents": total_documents,
        "unread_messages": unread_messages
    }

# Appointment Management
@api_router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status: str):
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 1:
        return {"message": "Status updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Appointment not found")

@api_router.get("/appointments/client/{client_id}")
async def get_client_appointments(client_id: str):
    # Get appointments by client email (since we store email in appointments)
    client = await db.users.find_one({"id": client_id}, {"_id": 0})
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    appointments = await db.appointments.find(
        {"email": client["email"]}, 
        {"_id": 0}
    ).sort("datetime", 1).to_list(100)
    
    for appointment in appointments:
        if isinstance(appointment['datetime'], str):
            appointment['datetime'] = datetime.fromisoformat(appointment['datetime'])
        if isinstance(appointment['created_at'], str):
            appointment['created_at'] = datetime.fromisoformat(appointment['created_at'])
    
    return appointments

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import and include advanced features
try:
    from advanced_features import advanced_router
    app.include_router(advanced_router)
    logger.info("✅ Advanced features loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ Advanced features not available: {e}")

# Import and include advanced integrations
try:
    from advanced_integrations import integrations_router
    app.include_router(integrations_router)
    logger.info("✅ Advanced integrations loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ Advanced integrations not available: {e}")

# Import Oxygen-style advanced configuration
try:
    from oxygen_advanced_config import router as oxygen_config_router
    app.include_router(oxygen_config_router)
    logger.info("✅ Oxygen Advanced Config loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ Oxygen Advanced Config not available: {e}")

# Import Oxygen-style password management
try:
    from oxygen_password_management import router as oxygen_password_router
    app.include_router(oxygen_password_router)
    logger.info("✅ Oxygen Password Management loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ Oxygen Password Management not available: {e}")

# Import Jurídico Module
try:
    from juridico_completo_v2 import router as juridico_router
    app.include_router(juridico_router)
    logger.info("✅ Jurídico Module V2 loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ Jurídico Module V2 not available: {e}")

# Import CISAI+ Module
try:
    from cisai_plus_module import router as cisai_plus_router
    app.include_router(cisai_plus_router)
    logger.info("🦅 ATHENA CISAI+ MODULE loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ CISAI+ Module not available: {e}")

# Import Athena Universal CRUD Module
try:
    from athena_universal_crud import router as athena_crud_router
    app.include_router(athena_crud_router)
    logger.info("🔧 ATHENA UNIVERSAL CRUD MODULE loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ Athena Universal CRUD Module not available: {e}")

# Forensic Digital ISO/IEC 27037 Module
try:
    from forensic_digital_iso import router as forensic_iso_router
    app.include_router(forensic_iso_router)
    logger.info("🔬 FORENSIC DIGITAL ISO/IEC 27037 MODULE loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ Forensic Digital ISO Module not available: {e}")

# Playbook System - Gestão de Playbooks Forenses
try:
    from playbook_system import router as playbook_router
    app.include_router(playbook_router)
    logger.info("📋 PLAYBOOK SYSTEM loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ Playbook System not available: {e}")

# Process Analysis System - Análise de Processos com IA
try:
    from process_analysis_system import router as analysis_router
    app.include_router(analysis_router)
    logger.info("⚖️ PROCESS ANALYSIS SYSTEM loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ Process Analysis System not available: {e}")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()