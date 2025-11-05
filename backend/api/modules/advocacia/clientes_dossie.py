"""Sistema de Dossiê de Clientes com Documentos - Elite Athena"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import jsonschema
from jsonschema import validate, ValidationError as JsonSchemaValidationError
import hashlib
import os
import uuid
from datetime import datetime, timezone, date
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/clientes", tags=["clientes-dossie"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

DOCS_DIR = "/app/backend/clientes_documentos"
os.makedirs(DOCS_DIR, exist_ok=True)


# ==================== SCHEMAS DE DOCUMENTOS ====================

DOCUMENT_SCHEMAS = {
    "RG": {
        "title": "RG (Registro Geral)",
        "type": "object",
        "required": ["numero", "orgao_emissor", "uf", "data_emissao"],
        "properties": {
            "numero": {"type": "string", "minLength": 5},
            "orgao_emissor": {"type": "string"},
            "uf": {"type": "string", "minLength": 2, "maxLength": 2},
            "data_emissao": {"type": "string", "format": "date"},
            "frente_verso": {"type": "boolean", "default": True}
        }
    },
    "CPF": {
        "title": "CPF (Cadastro Pessoa Física)",
        "type": "object",
        "required": ["numero"],
        "properties": {
            "numero": {"type": "string", "pattern": "^[0-9]{11}$"},
            "situacao": {"type": "string", "enum": ["regular", "irregular", "suspensa"]}
        }
    },
    "CNH": {
        "title": "CNH (Carteira Nacional Habilitação)",
        "type": "object",
        "required": ["numero", "categoria", "validade"],
        "properties": {
            "numero": {"type": "string"},
            "categoria": {"type": "string"},
            "validade": {"type": "string", "format": "date"},
            "primeira_habilitacao": {"type": "string", "format": "date"}
        }
    },
    "PROCURACAO": {
        "title": "Procuração",
        "type": "object",
        "required": ["outorgante", "outorgado", "poderes", "data_assinatura"],
        "properties": {
            "outorgante": {"type": "string"},
            "outorgado": {"type": "string"},
            "poderes": {"type": "string"},
            "data_assinatura": {"type": "string", "format": "date"},
            "validade": {"type": "string", "format": "date"},
            "reconhecimento_firma": {"type": "boolean"}
        }
    },
    "CONTRATO_HONORARIOS": {
        "title": "Contrato de Honorários",
        "type": "object",
        "required": ["valor_base", "data_assinatura"],
        "properties": {
            "valor_base": {"type": "number", "minimum": 0},
            "data_assinatura": {"type": "string", "format": "date"},
            "forma_pagamento": {"type": "string"},
            "parcelas": {"type": "integer", "minimum": 1},
            "indice_reajuste": {"type": "string", "enum": ["IPCA", "IGP-M", "INPC", "SEM_REAJUSTE"]}
        }
    },
    "COMPROVANTE_ENDERECO": {
        "title": "Comprovante de Endereço",
        "type": "object",
        "required": ["tipo", "data_emissao"],
        "properties": {
            "tipo": {"type": "string", "enum": ["conta_luz", "conta_agua", "telefone", "extrato_bancario"]},
            "data_emissao": {"type": "string", "format": "date"},
            "endereco": {"type": "string"}
        }
    },
    "CERTIDAO": {
        "title": "Certidão",
        "type": "object",
        "required": ["tipo_certidao", "orgao_emissor", "data_emissao"],
        "properties": {
            "tipo_certidao": {"type": "string", "enum": ["nascimento", "casamento", "obito", "criminal", "civil"]},
            "orgao_emissor": {"type": "string"},
            "data_emissao": {"type": "string", "format": "date"},
            "numero": {"type": "string"}
        }
    }
}


class Cliente(BaseModel):
    nome: str
    cpf_cnpj: str
    email: Optional[str]
    telefone: Optional[str]
    endereco: Optional[Dict[str, str]]


class DocumentoUpload(BaseModel):
    tipo_codigo: str
    metadados: Dict[str, Any]


# ==================== CLIENTES ====================

@router.post("/")
async def criar_cliente(data: Cliente):
    """Cria novo cliente"""
    
    cliente = data.model_dump()
    cliente['id'] = str(uuid.uuid4())
    cliente['criado_em'] = datetime.now(timezone.utc).isoformat()
    
    await db.clientes.insert_one(cliente)
    
    return {
        "cliente_id": cliente['id'],
        "message": "Cliente criado"
    }


@router.get("/")
async def listar_clientes(q: Optional[str] = None, limit: int = 50):
    """Lista clientes"""
    
    query = {}
    if q:
        query['$or'] = [
            {'nome': {'$regex': q, '$options': 'i'}},
            {'cpf_cnpj': {'$regex': q, '$options': 'i'}},
            {'email': {'$regex': q, '$options': 'i'}}
        ]
    
    clientes = await db.clientes.find(query).limit(limit).to_list(length=limit)
    
    return {
        "clientes": clientes,
        "total": len(clientes)
    }


@router.get("/{cliente_id}")
async def get_cliente(cliente_id: str):
    """Obtém detalhes do cliente"""
    
    cliente = await db.clientes.find_one({"id": cliente_id})
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Buscar documentos do cliente
    documentos = await db.cliente_documentos.find(
        {"cliente_id": cliente_id}
    ).to_list(length=None)
    
    cliente['documentos'] = documentos
    cliente['total_documentos'] = len(documentos)
    
    return cliente


# ==================== DOSSIÊ - DOCUMENTOS ====================

@router.get("/document-types")
async def list_document_types():
    """Lista tipos de documentos disponíveis"""
    
    types = []
    for codigo, schema in DOCUMENT_SCHEMAS.items():
        types.append({
            "codigo": codigo,
            "nome": schema['title'],
            "campos_obrigatorios": schema.get('required', []),
            "tem_validade": 'validade' in schema.get('properties', {})
        })
    
    return {"types": types}


@router.post("/{cliente_id}/documentos/upload")
async def upload_documento(
    request: Request,
    cliente_id: str = "",
    tipo_codigo: str = Form(...),
    metadados: str = Form(...),  # JSON string
    file: UploadFile = File(...)
):
    """Upload de documento do cliente"""
    
    # Verificar cliente
    cliente = await db.clientes.find_one({"id": cliente_id})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Verificar tipo
    if tipo_codigo not in DOCUMENT_SCHEMAS:
        raise HTTPException(status_code=400, detail="Tipo de documento inválido")
    
    schema = DOCUMENT_SCHEMAS[tipo_codigo]
    
    # Validar metadados
    import json
    try:
        metadados_dict = json.loads(metadados)
        validate(instance=metadados_dict, schema=schema)
    except JsonSchemaValidationError as e:
        raise HTTPException(status_code=422, detail=f"Metadados inválidos: {e.message}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="JSON de metadados inválido")
    
    # Ler arquivo
    content = await file.read()
    
    # Calcular hashes
    hashes = {
        'md5': hashlib.md5(content).hexdigest(),
        'sha256': hashlib.sha256(content).hexdigest(),
        'sha512': hashlib.sha512(content).hexdigest()
    }
    
    # Verificar deduplicação
    existing = await db.cliente_documentos.find_one({
        "cliente_id": cliente_id,
        "tipo_codigo": tipo_codigo,
        "sha256": hashes['sha256']
    })
    
    if existing:
        return {
            "status": "duplicate",
            "message": "Documento idêntico já anexado",
            "existing_id": existing['id']
        }
    
    # Salvar arquivo
    doc_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(DOCS_DIR, f"{doc_id}{file_ext}")
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Criar registro
    documento = {
        "id": doc_id,
        "cliente_id": cliente_id,
        "tipo_codigo": tipo_codigo,
        "tipo_nome": schema['title'],
        "filename": file.filename,
        "path": file_path,
        "size_bytes": len(content),
        "md5": hashes['md5'],
        "sha256": hashes['sha256'],
        "sha512": hashes['sha512'],
        "metadados": metadados_dict,
        "validade": metadados_dict.get('validade'),
        "status": "valido",
        "uploaded_by": "current_user",  # TODO: pegar do auth
        "ip_origem": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent", "unknown"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.cliente_documentos.insert_one(documento)
    
    # Log de custódia
    custody_log = {
        "documento_id": doc_id,
        "action": "upload",
        "actor": "current_user",
        "ip": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent", "unknown"),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.custody_logs.insert_one(custody_log)
    
    return {
        "documento_id": doc_id,
        "hashes": hashes,
        "message": "Documento enviado com sucesso"
    }


@router.get("/{cliente_id}/documentos")
async def listar_documentos(cliente_id: str):
    """Lista documentos do cliente"""
    
    documentos = await db.cliente_documentos.find(
        {"cliente_id": cliente_id}
    ).sort("created_at", -1).to_list(length=None)
    
    # Verificar validades
    for doc in documentos:
        if doc.get('validade'):
            validade_dt = datetime.fromisoformat(doc['validade']).date()
            hoje = date.today()
            
            if validade_dt < hoje:
                doc['status'] = 'vencido'
            elif (validade_dt - hoje).days <= 30:
                doc['status'] = 'vencendo_30d'
    
    return {
        "cliente_id": cliente_id,
        "documentos": documentos,
        "total": len(documentos)
    }


@router.get("/{cliente_id}/documentos/{doc_id}/custody")
async def get_custody_log(cliente_id: str, doc_id: str):
    """Obtém cadeia de custódia do documento"""
    
    logs = await db.custody_logs.find(
        {"documento_id": doc_id}
    ).sort("timestamp", 1).to_list(length=None)
    
    return {
        "documento_id": doc_id,
        "custody_chain": logs
    }


@router.post("/{cliente_id}/dossie/export")
async def export_dossie(cliente_id: str):
    """Exporta dossiê completo com Elite Seal"""
    
    # Buscar cliente e documentos
    cliente = await db.clientes.find_one({"id": cliente_id})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    documentos = await db.cliente_documentos.find(
        {"cliente_id": cliente_id}
    ).to_list(length=None)
    
    # Criar manifesto
    manifesto = {
        "cliente": {
            "id": cliente_id,
            "nome": cliente['nome'],
            "cpf_cnpj": cliente['cpf_cnpj']
        },
        "documentos": [
            {
                "id": doc['id'],
                "tipo": doc['tipo_nome'],
                "filename": doc['filename'],
                "hashes": {
                    "md5": doc['md5'],
                    "sha256": doc['sha256'],
                    "sha512": doc['sha512']
                },
                "metadados": doc['metadados']
            }
            for doc in documentos
        ],
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "total_documentos": len(documentos)
    }
    
    # TODO: Criar ZIP com manifesto + documentos
    
    return {
        "manifesto": manifesto,
        "message": "Export ZIP em desenvolvimento"
    }
