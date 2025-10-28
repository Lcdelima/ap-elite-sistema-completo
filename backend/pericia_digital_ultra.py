"""
Perícia Digital Ultra - Núcleo de Extração e Análise
Extração lógica, física, chip-off, JTAG, captura volátil
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
import uuid
import hashlib
import qrcode
import io
import base64
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/pericia-ultra", tags=["Perícia Digital Ultra"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

class ExameCreate(BaseModel):
    titulo: str
    caso_numero: str
    dispositivo_tipo: str
    dispositivo_modelo: str
    imei: Optional[str] = None
    serial: Optional[str] = None
    metodo_extracao: str
    base_legal: str
    lacre_numero: str

@router.post("/exames")
async def criar_exame(exame: ExameCreate, background_tasks: BackgroundTasks):
    """Cria exame forense com QR code e cadeia de custódia"""
    
    exam_id = str(uuid.uuid4())
    codigo = f"EX-{datetime.now().year}-{exam_id[:8].upper()}"
    
    # Gera QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(f"{codigo}|{exame.dispositivo_tipo}|{exame.lacre_numero}")
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    exam_data = {
        "id": exam_id,
        "codigo": codigo,
        **exame.dict(),
        "status": "iniciado",
        "qr_code": qr_base64,
        "progresso": 0,
        "created_at": datetime.now().isoformat()
    }
    
    await db.pericia_ultra_exames.insert_one(exam_data)
    
    # Cria Ato 1 - Recebimento
    ato1 = {
        "id": str(uuid.uuid4()),
        "exam_id": exam_id,
        "tipo": "recebimento",
        "descricao": f"Recebimento - Lacre {exame.lacre_numero}",
        "timestamp": datetime.now().isoformat(),
        "hash_curr": hashlib.sha256(str(exam_data).encode()).hexdigest()
    }
    await db.custody_chain.insert_one(ato1)
    
    return {
        "success": True,
        "exam_id": exam_id,
        "codigo": codigo,
        "qr_code": qr_base64,
        "message": "Exame criado. Ato 1 registrado."
    }

@router.get("/exames")
async def listar_exames():
    exames = await db.pericia_ultra_exames.find({}).sort("created_at", -1).to_list(100)
    return {"success": True, "exames": exames}

@router.post("/exames/{exam_id}/ingest")
async def ingerir_evidencia(exam_id: str, file: UploadFile = File(...)):
    """Upload de evidência com hash automático"""
    
    contents = await file.read()
    sha256 = hashlib.sha256(contents).hexdigest()
    sha512 = hashlib.sha512(contents).hexdigest()
    
    file_id = str(uuid.uuid4())
    
    # Salva evidência
    evidencia = {
        "id": file_id,
        "exam_id": exam_id,
        "filename": file.filename,
        "sha256": sha256,
        "sha512": sha512,
        "size": len(contents),
        "created_at": datetime.now().isoformat()
    }
    
    await db.evidencias.insert_one(evidencia)
    
    # Cria Ato 2 - Aquisição
    ato2 = {
        "id": str(uuid.uuid4()),
        "exam_id": exam_id,
        "tipo": "aquisicao",
        "descricao": f"Aquisição: {file.filename}",
        "hashes": {"sha256": sha256, "sha512": sha512},
        "timestamp": datetime.now().isoformat()
    }
    await db.custody_chain.insert_one(ato2)
    
    return {
        "success": True,
        "file_id": file_id,
        "hashes": {"sha256": sha256, "sha512": sha512}
    }

@router.get("/stats")
async def stats_pericia_ultra():
    total = await db.pericia_ultra_exames.count_documents({})
    concluidos = await db.pericia_ultra_exames.count_documents({"status": "concluido"})
    em_andamento = await db.pericia_ultra_exames.count_documents({"status": "iniciado"})
    
    return {
        "success": True,
        "total": total,
        "concluidos": concluidos,
        "em_andamento": em_andamento
    }
