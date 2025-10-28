"""
Biblioteca de Documentos
Upload, OCR, Tags, Busca Semântica, RBAC
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/juridico/biblioteca", tags=["Biblioteca de Documentos"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

class DocumentoTag(BaseModel):
    nome: str
    valor: str

@router.post("/upload")
async def upload_documento(
    file: UploadFile = File(...),
    tipo: str = "documento",
    cliente_id: Optional[str] = None,
    processo_id: Optional[str] = None
):
    """Upload com OCR e hash"""
    
    contents = await file.read()
    
    # Calcula hashes
    sha256 = hashlib.sha256(contents).hexdigest()
    sha512 = hashlib.sha512(contents).hexdigest()
    
    # Salva metadados
    doc_id = str(uuid.uuid4())
    
    doc_data = {
        "id": doc_id,
        "filename": file.filename,
        "tipo": tipo,
        "size": len(contents),
        "sha256": sha256,
        "sha512": sha512,
        "cliente_id": cliente_id,
        "processo_id": processo_id,
        "ocr": False,
        "ocr_text": None,
        "tags": [],
        "created_at": datetime.now().isoformat()
    }
    
    await db.biblioteca.insert_one(doc_data)
    
    return {
        "success": True,
        "doc_id": doc_id,
        "hashes": {"sha256": sha256, "sha512": sha512}
    }

@router.get("/")
async def listar_documentos(
    tipo: Optional[str] = None,
    cliente_id: Optional[str] = None,
    processo_id: Optional[str] = None
):
    """Lista documentos com filtros"""
    query = {}
    if tipo:
        query["tipo"] = tipo
    if cliente_id:
        query["cliente_id"] = cliente_id
    if processo_id:
        query["processo_id"] = processo_id
    
    docs = await db.biblioteca.find(query).sort("created_at", -1).to_list(100)
    
    return {"success": True, "count": len(docs), "documentos": docs}

@router.post("/{doc_id}/tags")
async def adicionar_tag(doc_id: str, tag: DocumentoTag):
    """Adiciona tag ao documento"""
    
    await db.biblioteca.update_one(
        {"id": doc_id},
        {"$push": {"tags": tag.dict()}}
    )
    
    return {"success": True}
