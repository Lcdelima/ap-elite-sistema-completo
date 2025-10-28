"""
AP ELITE ATHENA - Enhanced APIs for Phase 3 Modules
APIs complementares para os módulos melhorados
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional
import uuid
import os

# Database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client.ap_elite

# Security
security = HTTPBearer()

# Auth dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        token_parts = credentials.credentials.split('_')
        user_id = token_parts[1]
        user = await db.users.find_one({"id": user_id, "status": "active"}, {"_id": 0, "password": 0})
        return user
    except:
        return None

enhanced_router = APIRouter(prefix="/api/athena")

# ==================== ERBs APIs ====================

@enhanced_router.post("/erbs/add")
async def add_erb(erb_data: dict, current_user: dict = Depends(get_current_user)):
    """Add new ERB"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    erb = {
        "id": str(uuid.uuid4()),
        **erb_data,
        "created_by": current_user.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.erbs.insert_one(erb)
    return {"message": "ERB added", "erb_id": erb["id"]}

@enhanced_router.get("/erbs/list")
async def list_erbs(current_user: dict = Depends(get_current_user)):
    """List all ERBs"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    erbs = await db.erbs.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"erbs": erbs}

# ==================== Data Extraction APIs ====================

@enhanced_router.post("/data-extraction/create")
async def create_extraction(extraction_data: dict, current_user: dict = Depends(get_current_user)):
    """Create data extraction"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    extraction = {
        "id": str(uuid.uuid4()),
        **extraction_data,
        "status": "pending",
        "progress": 0,
        "created_by": current_user.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.data_extractions.insert_one(extraction)
    return {"message": "Extraction created", "extraction_id": extraction["id"]}

@enhanced_router.get("/data-extraction/list")
async def list_extractions(current_user: dict = Depends(get_current_user)):
    """List all data extractions"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    extractions = await db.data_extractions.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"extractions": extractions}

# ==================== Phone Interceptions APIs ====================

@enhanced_router.get("/phone-interceptions")
async def get_phone_interceptions(current_user: dict = Depends(get_current_user)):
    """Get phone interceptions"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    interceptions = await db.phone_interceptions.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"interceptions": interceptions}

@enhanced_router.post("/phone-interceptions/create")
async def create_phone_interception(data: dict, current_user: dict = Depends(get_current_user)):
    """Create phone interception"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    interception = {
        "id": str(uuid.uuid4()),
        **data,
        "created_by": current_user.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.phone_interceptions.insert_one(interception)
    return {"message": "Interception created", "id": interception["id"]}

# ==================== Data Interceptions APIs ====================

@enhanced_router.get("/data-interceptions")
async def get_data_interceptions(current_user: dict = Depends(get_current_user)):
    """Get data interceptions"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    interceptions = await db.data_interceptions.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"interceptions": interceptions}

@enhanced_router.post("/data-interceptions/create")
async def create_data_interception(data: dict, current_user: dict = Depends(get_current_user)):
    """Create data interception"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    interception = {
        "id": str(uuid.uuid4()),
        **data,
        "created_by": current_user.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.data_interceptions.insert_one(interception)
    return {"message": "Interception created", "id": interception["id"]}

# ==================== Processes APIs ====================

@enhanced_router.get("/processes")
async def get_processes(current_user: dict = Depends(get_current_user)):
    """Get all processes"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    processes = await db.legal_processes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"processes": processes}

@enhanced_router.post("/processes/create")
async def create_process(process_data: dict, current_user: dict = Depends(get_current_user)):
    """Create new process"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    process = {
        "id": str(uuid.uuid4()),
        **process_data,
        "created_by": current_user.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.legal_processes.insert_one(process)
    return {"message": "Process created", "process_id": process["id"]}
