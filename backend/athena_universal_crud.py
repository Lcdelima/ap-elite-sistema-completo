"""
Universal CRUD Module for Athena System
Provides generic CRUD operations for all modules
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/athena", tags=["Athena Universal"])

# Generic Models
class GenericItem(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    data: Dict[str, Any] = Field(default_factory=dict)

class GenericCreateRequest(BaseModel):
    collection: str
    data: Dict[str, Any]

class GenericUpdateRequest(BaseModel):
    id: str
    collection: str
    data: Dict[str, Any]

# Import database from main server
from server import db

# ==================== UNIVERSAL CRUD ENDPOINTS ====================

@router.post("/{collection}/create")
async def create_item(collection: str, request: GenericCreateRequest):
    """Universal CREATE endpoint for any collection"""
    try:
        item = {
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            **request.data
        }
        
        result = await db[collection].insert_one(item)
        
        # Remove _id do MongoDB
        item.pop("_id", None)
        
        return {
            "success": True,
            "message": f"Item criado em {collection}",
            "data": item
        }
    except Exception as e:
        logger.error(f"Error creating item in {collection}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{collection}/list")
async def list_items(collection: str, limit: int = 100, skip: int = 0):
    """Universal LIST endpoint for any collection"""
    try:
        items = await db[collection].find({}, {"_id": 0}).skip(skip).limit(limit).to_list(length=limit)
        
        return {
            "success": True,
            "count": len(items),
            "data": items
        }
    except Exception as e:
        logger.error(f"Error listing items from {collection}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{collection}/{item_id}")
async def get_item(collection: str, item_id: str):
    """Universal GET endpoint for any collection"""
    try:
        item = await db[collection].find_one({"id": item_id}, {"_id": 0})
        
        if not item:
            raise HTTPException(status_code=404, detail="Item não encontrado")
        
        return {
            "success": True,
            "data": item
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting item from {collection}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{collection}/{item_id}")
async def update_item(collection: str, item_id: str, request: GenericUpdateRequest):
    """Universal UPDATE endpoint for any collection"""
    try:
        update_data = {
            **request.data,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = await db[collection].update_one(
            {"id": item_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Item não encontrado")
        
        updated_item = await db[collection].find_one({"id": item_id}, {"_id": 0})
        
        return {
            "success": True,
            "message": "Item atualizado",
            "data": updated_item
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating item in {collection}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{collection}/{item_id}")
async def delete_item(collection: str, item_id: str):
    """Universal DELETE endpoint for any collection"""
    try:
        result = await db[collection].delete_one({"id": item_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Item não encontrado")
        
        return {
            "success": True,
            "message": "Item deletado"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting item from {collection}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== SPECIFIC MODULE ENDPOINTS ====================

@router.post("/forensics/analyses")
async def create_forensic_analysis(data: Dict[str, Any]):
    """Create forensic analysis"""
    return await create_item("forensic_analyses", GenericCreateRequest(collection="forensic_analyses", data=data))

@router.get("/forensics/analyses")
async def list_forensic_analyses(limit: int = 100):
    """List forensic analyses"""
    return await list_items("forensic_analyses", limit=limit)

@router.post("/processes")
async def create_process(data: Dict[str, Any]):
    """Create legal process"""
    return await create_item("legal_processes", GenericCreateRequest(collection="legal_processes", data=data))

@router.get("/processes")
async def list_processes(limit: int = 100):
    """List legal processes"""
    return await list_items("legal_processes", limit=limit)

@router.post("/interceptions")
async def create_interception(data: Dict[str, Any]):
    """Create phone interception"""
    return await create_item("phone_interceptions", GenericCreateRequest(collection="phone_interceptions", data=data))

@router.get("/interceptions")
async def list_interceptions(limit: int = 100):
    """List phone interceptions"""
    return await list_items("phone_interceptions", limit=limit)

@router.post("/extractions")
async def create_extraction(data: Dict[str, Any]):
    """Create data extraction"""
    return await create_item("data_extractions", GenericCreateRequest(collection="data_extractions", data=data))

@router.get("/extractions")
async def list_extractions(limit: int = 100):
    """List data extractions"""
    return await list_items("data_extractions", limit=limit)

@router.post("/evidence")
async def create_evidence(data: Dict[str, Any]):
    """Create evidence"""
    return await create_item("evidence", GenericCreateRequest(collection="evidence", data=data))

@router.get("/evidence")
async def list_evidence(limit: int = 100):
    """List evidence"""
    return await list_items("evidence", limit=limit)

@router.post("/documents")
async def create_document(data: Dict[str, Any]):
    """Create document"""
    return await create_item("documents", GenericCreateRequest(collection="documents", data=data))

@router.get("/documents")
async def list_documents(limit: int = 100):
    """List documents"""
    return await list_items("documents", limit=limit)

@router.post("/meetings")
async def create_meeting(data: Dict[str, Any]):
    """Create meeting"""
    return await create_item("meetings", GenericCreateRequest(collection="meetings", data=data))

@router.get("/meetings")
async def list_meetings(limit: int = 100):
    """List meetings"""
    return await list_items("meetings", limit=limit)

@router.post("/financial/transactions")
async def create_transaction(data: Dict[str, Any]):
    """Create financial transaction"""
    return await create_item("financial_transactions", GenericCreateRequest(collection="financial_transactions", data=data))

@router.get("/financial/transactions")
async def list_transactions(limit: int = 100):
    """List financial transactions"""
    return await list_items("financial_transactions", limit=limit)

@router.post("/deadlines")
async def create_deadline(data: Dict[str, Any]):
    """Create deadline"""
    return await create_item("deadlines", GenericCreateRequest(collection="deadlines", data=data))

@router.get("/deadlines")
async def list_deadlines(limit: int = 100):
    """List deadlines"""
    return await list_items("deadlines", limit=limit)

@router.post("/erbs")
async def create_erb(data: Dict[str, Any]):
    """Create ERB record"""
    return await create_item("erbs", GenericCreateRequest(collection="erbs", data=data))

@router.get("/erbs")
async def list_erbs(limit: int = 100):
    """List ERB records"""
    return await list_items("erbs", limit=limit)
