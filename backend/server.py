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


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging FIRST - estruturado e com mais detalhes
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)
logger.info("🚀 Iniciando AP Elite ATHENA - CISAI-Forense 3.0")

# Validar variáveis de ambiente essenciais
def validate_env():
    """Valida variáveis de ambiente críticas com mensagens amigáveis"""
    required_vars = {
        'MONGO_URL': 'mongodb://localhost:27017',
        'DB_NAME': 'test_database'
    }
    
    for var, default in required_vars.items():
        if var not in os.environ:
            logger.warning(f"⚠️ {var} não definida, usando padrão: {default}")
            os.environ[var] = default
        else:
            logger.info(f"✅ {var} = {os.environ[var]}")

# Validar antes de iniciar
validate_env()

# Validar variáveis de ambiente essenciais
def validate_env():
    """Valida variáveis de ambiente críticas com mensagens amigáveis"""
    required_vars = {
        'MONGO_URL': 'mongodb://localhost:27017',
        'DB_NAME': 'apelite_db'
    }
    
    missing_vars = []
    for var, default in required_vars.items():
        if var not in os.environ:
            logger.warning(f"⚠️ {var} não definida, usando padrão: {default}")
            os.environ[var] = default
        else:
            logger.info(f"✅ {var} configurada")
    
    if missing_vars:
        raise ValueError(
            f"❌ Variáveis de ambiente faltando: {', '.join(missing_vars)}\n"
            f"Configure o arquivo backend/.env com as seguintes chaves:\n"
            f"MONGO_URL=mongodb://localhost:27017\n"
            f"DB_NAME=apelite_db"
        )

# Validar antes de iniciar
validate_env()

# MongoDB connection com tratamento de erro
try:
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    logger.info(f"✅ MongoDB conectado: {os.environ['DB_NAME']}")
except Exception as e:
    logger.error(f"❌ Erro ao conectar MongoDB: {e}")
    raise

# Create the main app without a prefix
app = FastAPI(
    title="AP Elite ATHENA - Sistema Completo CISAI-Forense 3.0",
    description="Sistema jurídico completo com 19 módulos especializados",
    version="3.0.0"
)

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
    logger.info(f"🔐 Login attempt: email={login_data.email}, role={login_data.role}")
    
    # Import security module
    from security import verify_password, create_access_token, create_refresh_token
    
    # Find user by email and role
    user = await db.users.find_one({
        "email": login_data.email, 
        "role": login_data.role,
        "active": True
    }, {"_id": 0})
    
    if not user:
        logger.warning(f"❌ User not found: email={login_data.email}, role={login_data.role}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    logger.info(f"✅ User found: {user.get('name')}")
    
    # Verificar senha - suporta tanto hash quanto texto plano (migração)
    password_hash = user.get("password")
    is_valid = False
    
    # Se a senha começa com $2b$ é bcrypt hash
    if password_hash and password_hash.startswith("$2b$"):
        is_valid = verify_password(login_data.password, password_hash)
    else:
        # Compatibilidade com senhas antigas em texto plano
        is_valid = (password_hash == login_data.password)
    
    if not is_valid:
        logger.warning(f"❌ Invalid password for user: {login_data.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    logger.info(f"✅ Login successful for: {user.get('name')}")
    
    # Criar JWT tokens com expiração
    token_data = {
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "name": user["name"]
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Calcular tempo de expiração
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=480)).isoformat()
    
    # Registrar sessão e auditoria
    session_id = str(uuid.uuid4())
    session = {
        "session_id": session_id,
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "access_token": access_token,
        "refresh_token": refresh_token,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expires_at,
        "ip_address": None,  # TODO: Capturar IP do request
        "user_agent": None,  # TODO: Capturar User-Agent
        "active": True
    }
    
    await db.sessions.insert_one(session)
    
    # Registrar auditoria
    audit_log = {
        "id": str(uuid.uuid4()),
        "action": "login",
        "user_id": user["id"],
        "user_email": user["email"],
        "user_role": user["role"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "details": {
            "session_id": session_id,
            "login_method": "password"
        },
        "success": True
    }
    
    await db.audit_logs.insert_one(audit_log)
    
    # Update last login
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "last_login": datetime.now(timezone.utc).isoformat(),
            "last_session_id": session_id
        }}
    )
    
    # Remove password from response
    user.pop("password", None)
    
    logger.info(f"✅ JWT tokens created - Session: {session_id}, Expires: {expires_at}")
    
    return {
        "user": user,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
        "expires_in": 480 * 60,  # segundos
        "expires_at": expires_at,
        "session_id": session_id,
        # Compatibilidade com código antigo
        "token": access_token
    }

@api_router.post("/auth/logout")
async def logout_user(authorization: str = Header(None)):
    """
    Logout - invalida sessão atual
    Registra auditoria de logout
    """
    from security import verify_token
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token não fornecido")
    
    token = authorization.replace("Bearer ", "")
    
    # Verificar token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    
    user_id = payload.get("user_id")
    
    # Invalidar sessão
    await db.sessions.update_many(
        {"user_id": user_id, "access_token": token},
        {"$set": {"active": False, "logged_out_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Registrar auditoria
    audit_log = {
        "id": str(uuid.uuid4()),
        "action": "logout",
        "user_id": user_id,
        "user_email": payload.get("email"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "success": True
    }
    
    await db.audit_logs.insert_one(audit_log)
    
    logger.info(f"✅ Logout successful for user: {payload.get('email')}")
    
    return {"message": "Logout realizado com sucesso"}

@api_router.post("/auth/refresh")
async def refresh_access_token(refresh_token: str):
    """
    Renova access token usando refresh token
    """
    from security import verify_token, create_access_token
    
    payload = verify_token(refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token inválido")
    
    # Criar novo access token
    token_data = {
        "user_id": payload.get("user_id"),
        "email": payload.get("email"),
        "role": payload.get("role"),
        "name": payload.get("name")
    }
    
    new_access_token = create_access_token(token_data)
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=480)).isoformat()
    
    logger.info(f"✅ Access token renovado para: {payload.get('email')}")
    
    return {
        "access_token": new_access_token,
        "token_type": "Bearer",
        "expires_in": 480 * 60,
        "expires_at": expires_at
    }

@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Cria novo usuário com senha em hash bcrypt"""
    from security import hash_password, validate_password_strength
    
    # Validar força da senha
    is_strong, message = validate_password_strength(user_data.password)
    if not is_strong:
        raise HTTPException(status_code=400, detail=message)
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Hash da senha ANTES de salvar
    hashed_password = hash_password(user_data.password)
    
    user_dict = user_data.model_dump()
    user_dict['password'] = hashed_password  # Substituir senha por hash
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    logger.info(f"✅ Novo usuário criado: {user_data.email} com senha em hash bcrypt")
    
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

# Import and include Perícia & Investigação modules (CISAI-Forense 3.0)
logger.info("🔍 Loading CISAI-Forense 3.0 modules...")
modules_loaded = 0
try:
    from modules.forensics_digital import router as forensics_digital_router
    app.include_router(forensics_digital_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ forensics_digital module error: {e}")

try:
    from modules.forensics_advanced import router as forensics_advanced_router
    app.include_router(forensics_advanced_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ forensics_advanced module error: {e}")

try:
    from modules.telephony_interceptions import router as telephony_router
    app.include_router(telephony_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ telephony_interceptions module error: {e}")

try:
    from modules.telematics_interceptions import router as telematics_router
    app.include_router(telematics_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ telematics_interceptions module error: {e}")

try:
    from modules.data_extraction import router as data_extraction_router
    app.include_router(data_extraction_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ data_extraction module error: {e}")

try:
    from modules.data_extraction_advanced import router as data_extraction_adv_router
    app.include_router(data_extraction_adv_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ data_extraction_advanced module error: {e}")

try:
    from modules.erbs_analysis import router as erbs_analysis_router
    app.include_router(erbs_analysis_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ erbs_analysis module error: {e}")

try:
    from modules.erbs_radiobase import router as erbs_radiobase_router
    app.include_router(erbs_radiobase_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ erbs_radiobase module error: {e}")

try:
    from modules.erbs_advanced import router as erbs_advanced_router
    app.include_router(erbs_advanced_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ erbs_advanced module error: {e}")

try:
    from modules.erbs_geospatial import router as erbs_geospatial_router
    app.include_router(erbs_geospatial_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ erbs_geospatial module error: {e}")

try:
    from modules.iped_integration import router as iped_router
    app.include_router(iped_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ iped_integration module error: {e}")

try:
    from modules.evidence_processing import router as evidence_processing_router
    app.include_router(evidence_processing_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ evidence_processing module error: {e}")

try:
    from modules.custody_chain import router as custody_chain_router
    app.include_router(custody_chain_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ custody_chain module error: {e}")

try:
    from modules.processing_advanced import router as processing_advanced_router
    app.include_router(processing_advanced_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ processing_advanced module error: {e}")

try:
    from modules.evidence_advanced import router as evidence_advanced_router
    app.include_router(evidence_advanced_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ evidence_advanced module error: {e}")

try:
    from modules.evidence_ai import router as evidence_ai_router
    app.include_router(evidence_ai_router)
    modules_loaded += 1
except ImportError as e:
    logger.error(f"⚠️ evidence_ai module error: {e}")

# Import Análise Processual Profissional
try:
    from modules.analise_processual import router as analise_processual_router
    app.include_router(analise_processual_router)
    modules_loaded += 1
    logger.info("✅ Análise Processual Profissional loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ analise_processual module error: {e}")

# Import Forensics Enhanced
try:
    from forensics_enhanced import forensics_enhanced_router
    app.include_router(forensics_enhanced_router)
    modules_loaded += 1
    logger.info("✅ Forensics Enhanced loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ forensics_enhanced module error: {e}")

# Import Gestão de Processos
try:
    from modules.gestao_processos import router as gestao_processos_router
    app.include_router(gestao_processos_router)
    modules_loaded += 1
    logger.info("✅ Gestão de Processos loaded successfully")
except ImportError as e:
    logger.error(f"⚠️ gestao_processos module error: {e}")

logger.info(f"✅ CISAI-Forense 3.0: {modules_loaded}/19 modules loaded successfully")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint for CISAI-Forense 3.0 modules
@app.get("/api/pericia/health")
async def pericia_health():
    """Health check for all Perícia & Investigação modules"""
    modules = [
        {"id": 1, "name": "Perícia Digital", "prefix": "/api/forensics/digital", "status": "ok"},
        {"id": 2, "name": "Perícia Digital Avançada", "prefix": "/api/forensics/advanced", "status": "ok"},
        {"id": 3, "name": "Interceptações Telefônicas", "prefix": "/api/telephony", "status": "ok"},
        {"id": 4, "name": "Interceptações Telemáticas", "prefix": "/api/telematics", "status": "ok"},
        {"id": 5, "name": "Extração de Dados", "prefix": "/api/extraction", "status": "ok"},
        {"id": 6, "name": "Extração de Dados IA", "prefix": "/api/extraction/advanced", "status": "ok"},
        {"id": 7, "name": "Análise de ERBs", "prefix": "/api/erbs", "status": "ok"},
        {"id": 8, "name": "ERBs Radiobase", "prefix": "/api/erbs/radiobase", "status": "ok"},
        {"id": 9, "name": "ERBs Avançadas (GeoIntel)", "prefix": "/api/erbs/advanced", "status": "ok"},
        {"id": 10, "name": "ERBs Geoespacial", "prefix": "/api/geo/erbs", "status": "ok"},
        {"id": 11, "name": "Integração IPED", "prefix": "/api/iped", "status": "ok"},
        {"id": 12, "name": "Processamento de Evidências", "prefix": "/api/evidence", "status": "ok"},
        {"id": 13, "name": "Cadeia de Custódia", "prefix": "/api/custody", "status": "ok"},
        {"id": 14, "name": "Processamento Avançado", "prefix": "/api/processing/advanced", "status": "ok"},
        {"id": 15, "name": "Evidências Avançadas", "prefix": "/api/processing/evidence-advanced", "status": "ok"},
        {"id": 16, "name": "Análise de Evidências IA", "prefix": "/api/evidence-ai", "status": "ok"},
    ]
    
    return {
        "system": "CISAI-Forense 3.0",
        "total_modules": 16,
        "modules_loaded": modules_loaded,
        "status": "operational",
        "modules": modules
    }

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()