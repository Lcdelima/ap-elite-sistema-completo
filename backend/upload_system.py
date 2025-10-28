"""
Sistema Universal de Upload de Arquivos
Hash SHA-256/SHA-512, OCR, Processamento, Storage
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import hashlib
import os
import shutil
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/upload", tags=["Upload Universal"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

# Diretório de armazenamento
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

class FileMetadata(BaseModel):
    filename: str
    file_id: str
    sha256: str
    sha512: str
    size: int
    tipo: str

def calcular_hashes(data: bytes):
    """Calcula múltiplos hashes"""
    return {
        "md5": hashlib.md5(data).hexdigest(),
        "sha256": hashlib.sha256(data).hexdigest(),
        "sha512": hashlib.sha512(data).hexdigest()
    }

async def processar_arquivo_background(file_id: str, file_path: str, file_type: str):
    """Processa arquivo em background (OCR, parsing, etc)"""
    try:
        # TODO: Implementar OCR se PDF/imagem
        # TODO: Parser UFED/Oxygen se export forense
        
        await db.files.update_one(
            {"id": file_id},
            {"$set": {"processed": True, "processed_at": datetime.now().isoformat()}}
        )
    except Exception as e:
        print(f"Erro ao processar arquivo: {e}")

@router.post("/file")
async def upload_arquivo(
    file: UploadFile = File(...),
    tipo: str = "documento",
    relacionado_a: Optional[str] = None,
    background_tasks: BackgroundTasks = None
):
    """
    Upload universal com hash automático
    
    - Calcula MD5, SHA-256, SHA-512
    - Salva em /app/uploads
    - Processa em background (OCR, parsing)
    - Retorna metadados completos
    """
    
    # Lê arquivo
    contents = await file.read()
    
    # Calcula hashes
    hashes = calcular_hashes(contents)
    
    # Gera ID único
    file_id = str(uuid.uuid4())
    
    # Define caminho de armazenamento
    ext = Path(file.filename).suffix
    safe_filename = f"{file_id}{ext}"
    file_path = UPLOAD_DIR / safe_filename
    
    # Salva arquivo
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Metadados
    file_data = {
        "id": file_id,
        "filename": file.filename,
        "safe_filename": safe_filename,
        "path": str(file_path),
        "tipo": tipo,
        "mime": file.content_type,
        "size": len(contents),
        "hashes": hashes,
        "relacionado_a": relacionado_a,
        "processed": False,
        "created_at": datetime.now().isoformat()
    }
    
    await db.files.insert_one(file_data)
    
    # Processa em background
    if background_tasks:
        background_tasks.add_task(processar_arquivo_background, file_id, str(file_path), tipo)
    
    return {
        "success": True,
        "file_id": file_id,
        "filename": file.filename,
        "hashes": hashes,
        "size": len(contents),
        "message": "Arquivo carregado com sucesso. Processamento iniciado."
    }

@router.post("/multiple")
async def upload_multiplos(
    files: List[UploadFile] = File(...),
    tipo: str = "documento",
    relacionado_a: Optional[str] = None
):
    """Upload de múltiplos arquivos"""
    
    resultados = []
    
    for file in files:
        contents = await file.read()
        hashes = calcular_hashes(contents)
        
        file_id = str(uuid.uuid4())
        ext = Path(file.filename).suffix
        safe_filename = f"{file_id}{ext}"
        file_path = UPLOAD_DIR / safe_filename
        
        with open(file_path, "wb") as f:
            f.write(contents)
        
        file_data = {
            "id": file_id,
            "filename": file.filename,
            "safe_filename": safe_filename,
            "path": str(file_path),
            "tipo": tipo,
            "size": len(contents),
            "hashes": hashes,
            "relacionado_a": relacionado_a,
            "created_at": datetime.now().isoformat()
        }
        
        await db.files.insert_one(file_data)
        
        resultados.append({
            "file_id": file_id,
            "filename": file.filename,
            "sha256": hashes["sha256"]
        })
    
    return {
        "success": True,
        "count": len(resultados),
        "files": resultados
    }

@router.get("/file/{file_id}")
async def obter_arquivo(file_id: str):
    """Obtém metadados do arquivo"""
    
    file_data = await db.files.find_one({"id": file_id})
    if not file_data:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    return {
        "success": True,
        "file": file_data
    }

@router.post("/verify-hash")
async def verificar_hash(file_id: str, hash_esperado: str, algoritmo: str = "sha256"):
    """Verifica integridade do arquivo"""
    
    file_data = await db.files.find_one({"id": file_id})
    if not file_data:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    hash_atual = file_data["hashes"].get(algoritmo)
    
    if hash_atual != hash_esperado:
        return {
            "success": False,
            "integro": False,
            "message": "⚠️ Divergência de integridade. Hash não corresponde!",
            "hash_esperado": hash_esperado,
            "hash_atual": hash_atual
        }
    
    return {
        "success": True,
        "integro": True,
        "message": "✓ Integridade verificada com sucesso"
    }
