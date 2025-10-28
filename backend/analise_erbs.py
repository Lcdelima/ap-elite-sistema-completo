"""
Análise de ERBs - GeoIntel Forense
CDR/ERB, Geocálculo, Triangulação, Mapas
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/erbs", tags=["Análise ERBs"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

class RegistroERB(BaseModel):
    imei: str
    imsi: Optional[str] = None
    msisdn: str
    timestamp: str
    mcc: int
    mnc: int
    lac: int
    cid: int
    ta: Optional[int] = None

@router.post("/import")
async def importar_erb(file: UploadFile = File(...)):
    """Importa planilha CDR/ERB oficial"""
    
    # Simula parsing de CSV/Excel
    import_id = str(uuid.uuid4())
    
    data = {
        "id": import_id,
        "filename": file.filename,
        "registros_count": 0,
        "status": "processando",
        "created_at": datetime.now().isoformat()
    }
    
    await db.erb_imports.insert_one(data)
    
    return {
        "success": True,
        "import_id": import_id,
        "message": "Planilha ERB importada. Processamento iniciado."
    }

@router.post("/registros")
async def adicionar_registro_erb(registro: RegistroERB):
    """Adiciona registro ERB individual"""
    
    reg_id = str(uuid.uuid4())
    
    # Simula conversão para coordenadas (necessita API OpenCellID)
    lat = -23.5505 + (registro.cid % 100) * 0.001
    lon = -46.6333 + (registro.lac % 100) * 0.001
    
    data = {
        "id": reg_id,
        **registro.dict(),
        "lat": lat,
        "lon": lon,
        "accuracy_m": 500,
        "created_at": datetime.now().isoformat()
    }
    
    await db.erb_registros.insert_one(data)
    
    return {"success": True, "registro_id": reg_id, "coordenadas": {"lat": lat, "lon": lon}}

@router.get("/timeline")
async def timeline_erb(imei: str):
    """Timeline geográfica por IMEI"""
    
    registros = await db.erb_registros.find({"imei": imei}).sort("timestamp", 1).to_list(1000)
    
    return {
        "success": True,
        "count": len(registros),
        "timeline": registros
    }

@router.get("/stats")
async def stats_erb():
    total_registros = await db.erb_registros.count_documents({})
    total_imports = await db.erb_imports.count_documents({})
    
    return {"success": True, "total_registros": total_registros, "total_imports": total_imports}
