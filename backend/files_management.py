"""
AP ELITE ATHENA - Sistema de Gestão de Arquivos Forense (Elite Gravitas™)
Upload e gestão de documentos com hash forense, metadados e cadeia de custódia

Features:
- Hash SHA256, SHA512, MD5 para integridade
- Metadados específicos por tipo de documento
- Categorização: pessoais, processuais, mídias, financeiro
- Storage organizado: storage/{cliente_id}/{job_id}/{categoria}/{ano_mes}/
- WORM lógico (Write Once Read Many)
- OCR automático para PDFs
- Transcrição de áudios/vídeos
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
import os
import uuid
import hashlib
import json
import aiofiles
from pathlib import Path

router = APIRouter(prefix="/api/files", tags=["Files Management - Elite Gravitas"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Storage configuration
STORAGE_BASE = os.environ.get("STORAGE_PATH", "/app/backend/storage")
Path(STORAGE_BASE).mkdir(parents=True, exist_ok=True)

# Security
security = HTTPBearer(auto_error=False)

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

# ==================== DOCUMENT TYPES CONFIG ====================

DOCUMENT_TYPES = {
    # Documentos Pessoais
    "RG": {
        "category": "pessoais",
        "name": "RG - Registro Geral",
        "fields": ["numero", "orgao_emissor", "uf", "data_emissao", "validade"],
        "mime_types": ["application/pdf", "image/jpeg", "image/png"]
    },
    "CPF": {
        "category": "pessoais",
        "name": "CPF - Cadastro de Pessoa Física",
        "fields": ["numero"],
        "mime_types": ["application/pdf", "image/jpeg", "image/png"]
    },
    "CNH": {
        "category": "pessoais",
        "name": "CNH - Carteira Nacional de Habilitação",
        "fields": ["numero", "categoria", "validade", "primeira_habilitacao"],
        "mime_types": ["application/pdf", "image/jpeg", "image/png"]
    },
    "COMPROVANTE_RESIDENCIA": {
        "category": "pessoais",
        "name": "Comprovante de Residência",
        "fields": ["tipo", "data_emissao", "endereco"],
        "mime_types": ["application/pdf", "image/jpeg", "image/png"]
    },
    "CERTIDAO": {
        "category": "pessoais",
        "name": "Certidões (Nascimento, Casamento, Óbito)",
        "fields": ["tipo_certidao", "cartorio", "livro", "folha", "data_emissao"],
        "mime_types": ["application/pdf"]
    },
    
    # Documentos Processuais
    "PETICAO_INICIAL": {
        "category": "processuais",
        "name": "Petição Inicial",
        "fields": ["numero_processo", "classe", "assunto", "juiz", "foro", "vara", "data_protocolo"],
        "mime_types": ["application/pdf"]
    },
    "CONTESTACAO": {
        "category": "processuais",
        "name": "Contestação",
        "fields": ["numero_processo", "data_protocolo", "prazo"],
        "mime_types": ["application/pdf"]
    },
    "RECURSO": {
        "category": "processuais",
        "name": "Recurso",
        "fields": ["tipo_recurso", "numero_processo", "data_protocolo", "instancia"],
        "mime_types": ["application/pdf"]
    },
    "SENTENCA": {
        "category": "processuais",
        "name": "Sentença",
        "fields": ["numero_processo", "juiz", "data_sentenca", "resultado"],
        "mime_types": ["application/pdf"]
    },
    "DESPACHO": {
        "category": "processuais",
        "name": "Despacho Judicial",
        "fields": ["numero_processo", "tipo_despacho", "data_despacho"],
        "mime_types": ["application/pdf"]
    },
    "ATA_AUDIENCIA": {
        "category": "processuais",
        "name": "Ata de Audiência",
        "fields": ["numero_processo", "tipo_audiencia", "data_audiencia", "participantes"],
        "mime_types": ["application/pdf"]
    },
    
    # Mídias (Evidências)
    "AUDIO": {
        "category": "midias",
        "name": "Áudio",
        "fields": ["fonte", "data_captacao", "dispositivo", "duracao", "cadeia_custodia"],
        "mime_types": ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac"]
    },
    "VIDEO": {
        "category": "midias",
        "name": "Vídeo",
        "fields": ["fonte", "data_captacao", "dispositivo", "duracao", "resolucao", "cadeia_custodia"],
        "mime_types": ["video/mp4", "video/avi", "video/mov", "video/mkv"]
    },
    "IMAGEM": {
        "category": "midias",
        "name": "Imagem/Foto",
        "fields": ["fonte", "data_captacao", "dispositivo", "geolocalizacao", "cadeia_custodia"],
        "mime_types": ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/tiff"]
    },
    "LAUDO": {
        "category": "midias",
        "name": "Laudo Pericial",
        "fields": ["tipo_laudo", "perito", "data_laudo", "numero_quesitos"],
        "mime_types": ["application/pdf"]
    },
    
    # Financeiro
    "CONTRATO": {
        "category": "financeiro",
        "name": "Contrato",
        "fields": ["tipo_contrato", "partes", "valor", "data_assinatura", "vigencia"],
        "mime_types": ["application/pdf"]
    },
    "FATURA": {
        "category": "financeiro",
        "name": "Fatura/Nota Fiscal",
        "fields": ["numero_nota", "valor", "data_emissao", "vencimento"],
        "mime_types": ["application/pdf", "application/xml"]
    },
    "RECIBO": {
        "category": "financeiro",
        "name": "Recibo",
        "fields": ["valor", "data_pagamento", "forma_pagamento"],
        "mime_types": ["application/pdf", "image/jpeg", "image/png"]
    },
    "HONORARIOS": {
        "category": "financeiro",
        "name": "Contrato de Honorários",
        "fields": ["valor", "forma_pagamento", "parcelas", "data_assinatura"],
        "mime_types": ["application/pdf"]
    },
    
    # Genérico
    "OUTROS": {
        "category": "outros",
        "name": "Outros Documentos",
        "fields": ["descricao"],
        "mime_types": ["*/*"]
    }
}

# ==================== HELPER FUNCTIONS ====================

async def calculate_hashes(file_content: bytes) -> dict:
    """Calcula hashes forenses do arquivo"""
    return {
        "sha256": hashlib.sha256(file_content).hexdigest(),
        "sha512": hashlib.sha512(file_content).hexdigest(),
        "md5": hashlib.md5(file_content).hexdigest()
    }

async def get_storage_path(client_id: str, job_id: str, category: str, filename: str) -> str:
    """Gera path organizado para storage"""
    now = datetime.now()
    ano_mes = now.strftime("%Y%m")
    path = f"{client_id}/{job_id}/{category}/{ano_mes}"
    full_path = Path(STORAGE_BASE) / path
    full_path.mkdir(parents=True, exist_ok=True)
    return f"{path}/{filename}"

# ==================== ENDPOINTS ====================

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    client_id: str = Form(...),
    job_id: str = Form(...),
    doc_type: str = Form(...),
    metadata: str = Form("{}"),  # JSON string
    description: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user)
):
    """Upload de arquivo com hash forense e metadados"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Valida tipo de documento
    if doc_type not in DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Tipo de documento inválido: {doc_type}")
    
    doc_config = DOCUMENT_TYPES[doc_type]
    
    # Valida MIME type
    if "*/*" not in doc_config["mime_types"] and file.content_type not in doc_config["mime_types"]:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de arquivo não suportado para {doc_type}. Aceito: {doc_config['mime_types']}"
        )
    
    # Verifica se job existe
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job não encontrado")
    
    # Lê conteúdo do arquivo
    file_content = await file.read()
    file_size = len(file_content)
    
    # Calcula hashes forenses
    hashes = await calculate_hashes(file_content)
    
    # Verifica duplicata (mesmo hash)
    existing = await db.files.find_one({"sha256": hashes["sha256"]}, {"_id": 0})
    if existing:
        return {
            "success": False,
            "duplicate": True,
            "message": "Arquivo duplicado detectado",
            "existing_file": existing
        }
    
    # Gera ID e storage path
    file_id = str(uuid.uuid4())
    storage_key = await get_storage_path(client_id, job_id, doc_config["category"], f"{file_id}_{file.filename}")
    full_path = Path(STORAGE_BASE) / storage_key
    
    # Salva arquivo
    async with aiofiles.open(full_path, 'wb') as f:
        await f.write(file_content)
    
    # Parse metadata
    try:
        metadata_dict = json.loads(metadata) if metadata else {}
    except:
        metadata_dict = {}
    
    # Cria registro no banco
    now = datetime.now(timezone.utc).isoformat()
    file_record = {
        "id": file_id,
        "client_id": client_id,
        "job_id": job_id,
        "doc_type": doc_type,
        "doc_name": doc_config["name"],
        "category": doc_config["category"],
        "filename": file.filename,
        "original_filename": file.filename,
        "storage_key": storage_key,
        "mime_type": file.content_type,
        "size_bytes": file_size,
        "size_human": f"{file_size / 1024:.2f} KB" if file_size < 1024*1024 else f"{file_size / (1024*1024):.2f} MB",
        
        # Hashes forenses
        "sha256": hashes["sha256"],
        "sha512": hashes["sha512"],
        "md5": hashes["md5"],
        
        # Metadados
        "description": description or "",
        "metadata": metadata_dict,
        
        # Controle
        "immutable": False,  # WORM: pode ser definido como True após "lacrar"
        "sealed_at": None,
        "sealed_by": None,
        
        # Processamento
        "ocr_processed": False,
        "ocr_text": None,
        "transcription_processed": False,
        "transcription_text": None,
        
        # Audit
        "uploaded_by": current_user.get("id"),
        "uploaded_at": now,
        "created_at": now,
        "version": 1
    }
    
    await db.files.insert_one(file_record)
    
    # Atualiza contador do job
    await db.jobs.update_one(
        {"id": job_id},
        {"$inc": {"files_count": 1}}
    )
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "file_uploaded",
        "entity_type": "file",
        "entity_id": file_id,
        "details": {
            "filename": file.filename,
            "doc_type": doc_type,
            "job_id": job_id,
            "sha256": hashes["sha256"]
        },
        "timestamp": now
    })
    
    # TODO: Enfileirar para OCR/transcrição se aplicável
    # if doc_config["category"] == "processuais" and file.content_type == "application/pdf":
    #     await queue_ocr_job(file_id)
    # if doc_config["category"] == "midias" and file.content_type.startswith("audio/"):
    #     await queue_transcription_job(file_id)
    
    return {
        "success": True,
        "file_id": file_id,
        "file": file_record
    }

@router.get("/")
async def list_files(
    job_id: Optional[str] = None,
    client_id: Optional[str] = None,
    doc_type: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Lista arquivos com filtros"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {}
    if job_id:
        query["job_id"] = job_id
    if client_id:
        query["client_id"] = client_id
    if doc_type:
        query["doc_type"] = doc_type
    if category:
        query["category"] = category
    
    files = await db.files.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.files.count_documents(query)
    
    return {
        "files": files,
        "total": total,
        "page": skip // limit + 1,
        "total_pages": (total + limit - 1) // limit
    }

@router.get("/{file_id}")
async def get_file_details(
    file_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtém detalhes completos de um arquivo"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    file = await db.files.find_one({"id": file_id}, {"_id": 0})
    if not file:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    return file

@router.get("/{file_id}/download")
async def download_file(
    file_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Download de arquivo"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    file = await db.files.find_one({"id": file_id}, {"_id": 0})
    if not file:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    full_path = Path(STORAGE_BASE) / file["storage_key"]
    if not full_path.exists():
        raise HTTPException(status_code=404, detail="Arquivo físico não encontrado")
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "file_downloaded",
        "entity_type": "file",
        "entity_id": file_id,
        "details": {"filename": file["filename"]},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return FileResponse(
        path=str(full_path),
        filename=file["original_filename"],
        media_type=file["mime_type"]
    )

@router.put("/{file_id}/seal")
async def seal_file(
    file_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Lacra arquivo (WORM - Write Once Read Many)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    file = await db.files.find_one({"id": file_id}, {"_id": 0})
    if not file:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    if file.get("immutable"):
        raise HTTPException(status_code=400, detail="Arquivo já está lacrado")
    
    # Lacra o arquivo
    now = datetime.now(timezone.utc).isoformat()
    await db.files.update_one(
        {"id": file_id},
        {"$set": {
            "immutable": True,
            "sealed_at": now,
            "sealed_by": current_user.get("id")
        }}
    )
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "file_sealed",
        "entity_type": "file",
        "entity_id": file_id,
        "details": {"filename": file["filename"], "sha256": file["sha256"]},
        "timestamp": now
    })
    
    return {"success": True, "message": "Arquivo lacrado com sucesso"}

@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    force: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Deleta arquivo (não permitido se lacrado)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    file = await db.files.find_one({"id": file_id}, {"_id": 0})
    if not file:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    # Verifica se está lacrado
    if file.get("immutable") and not force:
        raise HTTPException(status_code=403, detail="Arquivo lacrado não pode ser deletado")
    
    # Verifica permissão para force delete
    if force and current_user.get("role") not in ["administrator", "super_admin"]:
        raise HTTPException(status_code=403, detail="Permissão insuficiente para force delete")
    
    # Deleta arquivo físico
    full_path = Path(STORAGE_BASE) / file["storage_key"]
    if full_path.exists():
        full_path.unlink()
    
    # Deleta registro
    await db.files.delete_one({"id": file_id})
    
    # Atualiza contador do job
    await db.jobs.update_one(
        {"id": file["job_id"]},
        {"$inc": {"files_count": -1}}
    )
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "file_deleted" + ("_force" if force else ""),
        "entity_type": "file",
        "entity_id": file_id,
        "details": {"filename": file["filename"], "sha256": file["sha256"]},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "message": "Arquivo deletado com sucesso"}

@router.get("/types/available")
async def get_document_types(
    current_user: dict = Depends(get_current_user)
):
    """Retorna tipos de documentos disponíveis com campos"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    return {"document_types": DOCUMENT_TYPES}

@router.get("/job/{job_id}/by-category")
async def get_files_by_category(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Retorna arquivos de um job agrupados por categoria"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    files = await db.files.find({"job_id": job_id}, {"_id": 0}).sort("created_at", -1).to_list(None)
    
    # Agrupa por categoria
    by_category = {
        "pessoais": [],
        "processuais": [],
        "midias": [],
        "financeiro": [],
        "outros": []
    }
    
    for file in files:
        category = file.get("category", "outros")
        if category in by_category:
            by_category[category].append(file)
    
    return {
        "job_id": job_id,
        "total_files": len(files),
        "by_category": by_category
    }
