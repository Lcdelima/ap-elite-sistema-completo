"""
Data Extraction Enhanced - Backend API
Sistema avançado de extração de dados forenses de dispositivos
"""

from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import os
import uuid
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/data-extraction", tags=["data_extraction_enhanced"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['ap_elite']

# Models
class ExtractionCreate(BaseModel):
    device_type: str
    device_model: str
    device_brand: Optional[str] = None
    imei: Optional[str] = None
    serial_number: Optional[str] = None
    case_id: str
    extraction_tool: str
    extraction_method: str = "logical"
    notes: Optional[str] = None
    priority: str = "medium"

class ExtractionUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = None
    notes: Optional[str] = None

# Helper function for authentication
async def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token não fornecido")
    
    try:
        token = authorization.replace("Bearer ", "")
        user = await db.users.find_one({"token": token})
        if not user:
            raise HTTPException(status_code=401, detail="Token inválido")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Erro de autenticação: {str(e)}")

@router.get("/stats")
async def get_extraction_stats(authorization: str = Header(None)):
    """Get data extraction statistics"""
    user = await verify_token(authorization)
    
    try:
        total = await db.data_extractions.count_documents({})
        in_progress = await db.data_extractions.count_documents({"status": "in_progress"})
        completed = await db.data_extractions.count_documents({"status": "completed"})
        failed = await db.data_extractions.count_documents({"status": "failed"})
        
        # Count by device type
        by_device_type = await db.data_extractions.aggregate([
            {"$group": {"_id": "$device_type", "count": {"$sum": 1}}}
        ]).to_list(None)
        
        return {
            "total": total,
            "in_progress": in_progress,
            "completed": completed,
            "failed": failed,
            "by_device_type": {item["_id"]: item["count"] for item in by_device_type}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar estatísticas: {str(e)}")

@router.get("/extractions")
async def list_extractions(
    status: Optional[str] = None,
    device_type: Optional[str] = None,
    authorization: str = Header(None)
):
    """List all data extractions with optional filters"""
    user = await verify_token(authorization)
    
    try:
        query = {}
        if status:
            query["status"] = status
        if device_type:
            query["device_type"] = device_type
            
        extractions = await db.data_extractions.find(query).sort("created_at", -1).to_list(100)
        
        for extraction in extractions:
            extraction.pop("_id", None)
        
        return {"extractions": extractions, "count": len(extractions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar extrações: {str(e)}")

@router.post("/extractions")
async def create_extraction(
    extraction: ExtractionCreate,
    authorization: str = Header(None)
):
    """Create a new data extraction"""
    user = await verify_token(authorization)
    
    try:
        extraction_id = str(uuid.uuid4())
        
        extraction_doc = {
            "extraction_id": extraction_id,
            "device_type": extraction.device_type,
            "device_model": extraction.device_model,
            "device_brand": extraction.device_brand,
            "imei": extraction.imei,
            "serial_number": extraction.serial_number,
            "case_id": extraction.case_id,
            "extraction_tool": extraction.extraction_tool,
            "extraction_method": extraction.extraction_method,
            "notes": extraction.notes,
            "priority": extraction.priority,
            "status": "pending",
            "progress": 0,
            "data_extracted": {},
            "created_by": user.get("email"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.data_extractions.insert_one(extraction_doc)
        
        return {
            "success": True,
            "extraction_id": extraction_id,
            "message": "Extração criada com sucesso",
            "status": "pending"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar extração: {str(e)}")

@router.get("/extractions/{extraction_id}")
async def get_extraction(
    extraction_id: str,
    authorization: str = Header(None)
):
    """Get details of a specific extraction"""
    user = await verify_token(authorization)
    
    try:
        extraction = await db.data_extractions.find_one({"extraction_id": extraction_id})
        
        if not extraction:
            raise HTTPException(status_code=404, detail="Extração não encontrada")
        
        extraction.pop("_id", None)
        return extraction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar extração: {str(e)}")

@router.put("/extractions/{extraction_id}")
async def update_extraction(
    extraction_id: str,
    update: ExtractionUpdate,
    authorization: str = Header(None)
):
    """Update an extraction"""
    user = await verify_token(authorization)
    
    try:
        update_doc = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if update.status:
            update_doc["status"] = update.status
        if update.progress is not None:
            update_doc["progress"] = update.progress
        if update.notes:
            update_doc["notes"] = update.notes
            
        result = await db.data_extractions.update_one(
            {"extraction_id": extraction_id},
            {"$set": update_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Extração não encontrada")
        
        return {
            "success": True,
            "message": "Extração atualizada com sucesso",
            "extraction_id": extraction_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar extração: {str(e)}")

@router.get("/tools")
async def get_extraction_tools(authorization: str = Header(None)):
    """Get list of available extraction tools"""
    user = await verify_token(authorization)
    
    tools = [
        {
            "name": "Cellebrite UFED",
            "type": "mobile",
            "description": "Extração física e lógica de dispositivos móveis",
            "supports": ["iOS", "Android", "Windows Phone"],
            "methods": ["physical", "logical", "filesystem"]
        },
        {
            "name": "Oxygen Forensics",
            "type": "mobile",
            "description": "Suite completa para análise mobile",
            "supports": ["iOS", "Android"],
            "methods": ["physical", "logical", "cloud"]
        },
        {
            "name": "MOBILedit Forensic",
            "type": "mobile",
            "description": "Extração de dados de celulares",
            "supports": ["iOS", "Android", "Feature Phones"],
            "methods": ["logical", "filesystem"]
        },
        {
            "name": "XRY",
            "type": "mobile",
            "description": "Ferramenta profissional de extração mobile",
            "supports": ["iOS", "Android"],
            "methods": ["physical", "logical"]
        },
        {
            "name": "FTK Imager",
            "type": "computer",
            "description": "Aquisição de imagens forenses",
            "supports": ["Windows", "Mac", "Linux"],
            "methods": ["physical", "logical"]
        },
        {
            "name": "EnCase Imager",
            "type": "computer",
            "description": "Criação de imagens forenses",
            "supports": ["Windows", "Mac", "Linux"],
            "methods": ["physical"]
        },
        {
            "name": "dd (Linux)",
            "type": "computer",
            "description": "Ferramenta de linha de comando para cópia de dados",
            "supports": ["Linux", "Unix", "Mac"],
            "methods": ["physical"]
        },
        {
            "name": "Magnet AXIOM",
            "type": "multi",
            "description": "Plataforma completa de análise digital",
            "supports": ["Computer", "Mobile", "Cloud"],
            "methods": ["physical", "logical", "cloud"]
        }
    ]
    
    return {"tools": tools, "total": len(tools)}

@router.get("/device-types")
async def get_device_types(authorization: str = Header(None)):
    """Get list of supported device types"""
    user = await verify_token(authorization)
    
    device_types = [
        {
            "type": "smartphone",
            "name": "Smartphone",
            "description": "Celulares iOS e Android",
            "extraction_methods": ["physical", "logical", "filesystem", "cloud"],
            "typical_duration": "2-4 horas"
        },
        {
            "type": "tablet",
            "name": "Tablet",
            "description": "Tablets iOS e Android",
            "extraction_methods": ["physical", "logical", "filesystem"],
            "typical_duration": "2-4 horas"
        },
        {
            "type": "computer",
            "name": "Computador",
            "description": "Desktops e notebooks",
            "extraction_methods": ["physical", "logical"],
            "typical_duration": "4-8 horas"
        },
        {
            "type": "hd_externo",
            "name": "HD Externo",
            "description": "Discos rígidos externos",
            "extraction_methods": ["physical", "logical"],
            "typical_duration": "2-6 horas"
        },
        {
            "type": "pendrive",
            "name": "Pen Drive",
            "description": "Dispositivos de armazenamento USB",
            "extraction_methods": ["logical"],
            "typical_duration": "1-2 horas"
        },
        {
            "type": "cartao_sd",
            "name": "Cartão SD",
            "description": "Cartões de memória",
            "extraction_methods": ["logical"],
            "typical_duration": "1-2 horas"
        },
        {
            "type": "servidor",
            "name": "Servidor",
            "description": "Servidores físicos ou virtuais",
            "extraction_methods": ["physical", "logical", "remote"],
            "typical_duration": "8-16 horas"
        },
        {
            "type": "iot",
            "name": "Dispositivo IoT",
            "description": "Dispositivos Internet das Coisas",
            "extraction_methods": ["logical", "memory_dump"],
            "typical_duration": "4-8 horas"
        }
    ]
    
    return {"device_types": device_types, "total": len(device_types)}

@router.get("/extraction-methods")
async def get_extraction_methods(authorization: str = Header(None)):
    """Get list of extraction methods"""
    user = await verify_token(authorization)
    
    methods = [
        {
            "method": "physical",
            "name": "Extração Física",
            "description": "Cópia bit-a-bit de toda a memória do dispositivo",
            "advantages": ["Dados completos", "Arquivos deletados", "Dados não alocados"],
            "disadvantages": ["Demora mais", "Requer root/jailbreak em alguns casos"],
            "recommended_for": ["Casos críticos", "Evidências importantes"]
        },
        {
            "method": "logical",
            "name": "Extração Lógica",
            "description": "Extração de dados ativos e arquivos do sistema",
            "advantages": ["Mais rápido", "Não requer modificações no dispositivo"],
            "disadvantages": ["Dados deletados não incluídos", "Menos completo"],
            "recommended_for": ["Casos gerais", "Dispositivos sem root"]
        },
        {
            "method": "filesystem",
            "name": "Extração de Sistema de Arquivos",
            "description": "Extração completa do sistema de arquivos",
            "advantages": ["Balanceado", "Boa quantidade de dados"],
            "disadvantages": ["Requer backup ou acesso especial"],
            "recommended_for": ["Dispositivos iOS", "Backups disponíveis"]
        },
        {
            "method": "cloud",
            "name": "Extração em Nuvem",
            "description": "Aquisição de dados de serviços em nuvem",
            "advantages": ["Não precisa do dispositivo físico", "Acesso remoto"],
            "disadvantages": ["Requer credenciais", "Pode não ter todos os dados"],
            "recommended_for": ["Dispositivos inacessíveis", "Backups em nuvem"]
        },
        {
            "method": "chip-off",
            "name": "Chip-Off",
            "description": "Remoção física do chip de memória",
            "advantages": ["Acesso direto aos dados", "Dispositivos danificados"],
            "disadvantages": ["Destrutivo", "Requer equipamento especializado"],
            "recommended_for": ["Dispositivos danificados", "Último recurso"]
        },
        {
            "method": "jtag",
            "name": "JTAG",
            "description": "Extração via interface JTAG do hardware",
            "advantages": ["Acesso de baixo nível", "Dispositivos bloqueados"],
            "disadvantages": ["Técnico", "Requer equipamento especial"],
            "recommended_for": ["Dispositivos bloqueados", "Casos complexos"]
        }
    ]
    
    return {"methods": methods, "total": len(methods)}
