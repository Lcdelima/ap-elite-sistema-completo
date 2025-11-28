"""
AP ELITE ATHENA - Gerador de Documentos Jurídicos (Elite Gravitas™)
Núcleo de automação documental e inteligência contratual

Features:
- Catálogo de templates (petições, procurações, declarações, contratos)
- Geração automática com variáveis dinâmicas
- Versionamento e auditoria completa
- Integração com assinatura digital
- Portal do cliente
- Hash forense e metadados
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
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

router = APIRouter(prefix="/api/documents", tags=["Documents Generator - Elite Gravitas"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "apelite_db")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Storage
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

# ==================== MODELS ====================

class DocumentGenerate(BaseModel):
    client_id: str
    job_id: Optional[str] = None
    template_id: str
    title: str
    category: str  # 'peticao', 'procuracao', 'declaracao', 'contrato', etc
    variables: dict
    require_signature: bool = False
    notes: Optional[str] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

# ==================== DOCUMENT TEMPLATES ====================

DOCUMENT_TEMPLATES = {
    "peticao_inicial": {
        "name": "Petição Inicial",
        "category": "peticao",
        "description": "Modelo de petição inicial para ações judiciais",
        "variables": [
            "exmo_juiz",
            "comarca",
            "vara",
            "autor.nome",
            "autor.cpf",
            "autor.endereco",
            "reu.nome",
            "reu.cpf",
            "reu.endereco",
            "valor_causa",
            "fatos",
            "fundamento_juridico",
            "pedidos",
            "advogado.nome",
            "advogado.oab",
            "data",
            "local"
        ],
        "template_html": """
<div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; text-align: justify;">
  <p style="text-align: center; font-weight: bold;">EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA {vara} DA COMARCA DE {comarca}</p>
  
  <p style="margin-top: 30px;">
    <strong>{autor.nome}</strong>, brasileiro(a), inscrito(a) no CPF sob o nº {autor.cpf}, 
    residente e domiciliado(a) em {autor.endereco}, por seu advogado que esta subscreve 
    (doc. anexo), vem, respeitosamente, à presença de Vossa Excelência, propor
  </p>
  
  <p style="text-align: center; font-weight: bold; margin: 20px 0;">AÇÃO [TIPO DA AÇÃO]</p>
  
  <p>
    em face de <strong>{reu.nome}</strong>, inscrito no CPF sob o nº {reu.cpf}, 
    residente e domiciliado em {reu.endereco}, pelos fatos e fundamentos que passa a expor:
  </p>
  
  <h2>I – DOS FATOS</h2>
  <p>{fatos}</p>
  
  <h2>II – DO DIREITO</h2>
  <p>{fundamento_juridico}</p>
  
  <h2>III – DO PEDIDO</h2>
  <p>Diante do exposto, requer a Vossa Excelência:</p>
  <p>{pedidos}</p>
  
  <p style="margin-top: 30px;">
    Dá-se à causa o valor de R$ {valor_causa} (valor por extenso).
  </p>
  
  <p>Termos em que,<br/>Pede deferimento.</p>
  
  <p style="margin-top: 50px;">{local}, {data}.</p>
  
  <p style="margin-top: 50px; text-align: center;">
    _________________________________<br/>
    {advogado.nome}<br/>
    OAB/{advogado.oab}
  </p>
</div>
"""
    },
    "procuracao_ad_judicia": {
        "name": "Procuração Ad Judicia",
        "category": "procuracao",
        "description": "Procuração para representação judicial",
        "variables": [
            "outorgante.nome",
            "outorgante.nacionalidade",
            "outorgante.estado_civil",
            "outorgante.profissao",
            "outorgante.cpf",
            "outorgante.rg",
            "outorgante.endereco",
            "outorgado.nome",
            "outorgado.oab",
            "poderes_especiais",
            "local",
            "data"
        ],
        "template_html": """
<div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5;">
  <h1 style="text-align: center;">PROCURAÇÃO</h1>
  
  <p style="margin-top: 30px;">
    <strong>OUTORGANTE:</strong> {outorgante.nome}, {outorgante.nacionalidade}, 
    {outorgante.estado_civil}, {outorgante.profissao}, inscrito no CPF sob o nº {outorgante.cpf}, 
    portador do RG nº {outorgante.rg}, residente e domiciliado em {outorgante.endereco}.
  </p>
  
  <p>
    <strong>OUTORGADO:</strong> {outorgado.nome}, advogado inscrito na OAB sob o nº {outorgado.oab}.
  </p>
  
  <h2>PODERES</h2>
  <p>
    O OUTORGANTE nomeia e constitui seu bastante procurador o OUTORGADO, a quem confere 
    amplos poderes para representá-lo ativa e passivamente, em juízo ou fora dele, 
    podendo propor contra quem de direito as ações competentes e defendê-lo nas que lhe 
    forem intentadas, conferindo-lhe, ainda, poderes especiais para:
  </p>
  
  <ul>
    <li>Transigir, acordar e fazer composições;</li>
    <li>Receber e dar quitação;</li>
    <li>Confessar, reconhecer a procedência do pedido;</li>
    <li>Desistir, renunciar ao direito sobre que se funda a ação;</li>
    <li>Firmar compromisso arbitral;</li>
    <li>Interpor e acompanhar recursos de qualquer natureza;</li>
    <li>Substabelecer com ou sem reservas de poderes;</li>
    <li>{poderes_especiais}</li>
  </ul>
  
  <p style="margin-top: 50px;">{local}, {data}.</p>
  
  <p style="margin-top: 50px; text-align: center;">
    _________________________________<br/>
    {outorgante.nome}<br/>
    OUTORGANTE
  </p>
</div>
"""
    },
    "declaracao_hipossuficiencia": {
        "name": "Declaração de Hipossuficiência",
        "category": "declaracao",
        "description": "Declaração para obtenção de benefícios da justiça gratuita",
        "variables": [
            "declarante.nome",
            "declarante.cpf",
            "declarante.rg",
            "declarante.endereco",
            "declarante.profissao",
            "declarante.renda",
            "processo.numero",
            "local",
            "data"
        ],
        "template_html": """
<div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5;">
  <h1 style="text-align: center;">DECLARAÇÃO DE HIPOSSUFICIÊNCIA ECONÔMICA</h1>
  
  <p style="margin-top: 30px;">
    Eu, <strong>{declarante.nome}</strong>, inscrito no CPF sob o nº {declarante.cpf}, 
    portador do RG nº {declarante.rg}, residente e domiciliado em {declarante.endereco}, 
    {declarante.profissao}, <strong>DECLARO</strong>, sob as penas da lei, para fins de 
    comprovação junto ao processo nº {processo.numero}, que:
  </p>
  
  <ol>
    <li>
      Não possuo condições de arcar com as custas processuais e honorários advocatícios 
      sem prejuízo do meu próprio sustento e de minha família;
    </li>
    <li>
      Minha renda mensal é de aproximadamente R$ {declarante.renda};
    </li>
    <li>
      Estou ciente de que a declaração falsa implica nas sanções previstas no 
      artigo 19, § 1º do Novo Código de Processo Civil e no artigo 299 do Código Penal;
    </li>
    <li>
      Comprometo-me a informar qualquer alteração na minha situação econômica que 
      venha a ocorrer durante o trâmite processual.
    </li>
  </ol>
  
  <p style="margin-top: 30px;">
    Por ser expressão da verdade, firmo a presente.
  </p>
  
  <p style="margin-top: 50px;">{local}, {data}.</p>
  
  <p style="margin-top: 50px; text-align: center;">
    _________________________________<br/>
    {declarante.nome}<br/>
    CPF: {declarante.cpf}
  </p>
</div>
"""
    },
    "contestacao": {
        "name": "Contestação",
        "category": "peticao",
        "description": "Contestação em ação judicial",
        "variables": [
            "exmo_juiz",
            "comarca",
            "vara",
            "processo.numero",
            "reu.nome",
            "reu.cpf",
            "autor.nome",
            "preliminares",
            "merito",
            "advogado.nome",
            "advogado.oab",
            "local",
            "data"
        ],
        "template_html": """
<div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; text-align: justify;">
  <p style="text-align: center; font-weight: bold;">EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA {vara} DA COMARCA DE {comarca}</p>
  
  <p style="text-align: center; margin: 20px 0;">Processo nº {processo.numero}</p>
  
  <p style="margin-top: 30px;">
    <strong>{reu.nome}</strong>, qualificado nos autos da ação que lhe move {autor.nome}, 
    por seu advogado que esta subscreve, vem, respeitosamente, à presença de Vossa Excelência, 
    apresentar
  </p>
  
  <p style="text-align: center; font-weight: bold; margin: 20px 0;">CONTESTAÇÃO</p>
  
  <p>Pelos fundamentos de fato e de direito a seguir expostos:</p>
  
  <h2>I – DAS PRELIMINARES</h2>
  <p>{preliminares}</p>
  
  <h2>II – DO MÉRITO</h2>
  <p>{merito}</p>
  
  <h2>III – DO PEDIDO</h2>
  <p>Diante do exposto, requer a Vossa Excelência:</p>
  <ol>
    <li>O conhecimento da presente contestação;</li>
    <li>A total improcedência dos pedidos formulados pelo autor;</li>
    <li>A condenação do autor ao pagamento das custas processuais e honorários advocatícios.</li>
  </ol>
  
  <p>Termos em que,<br/>Pede deferimento.</p>
  
  <p style="margin-top: 50px;">{local}, {data}.</p>
  
  <p style="margin-top: 50px; text-align: center;">
    _________________________________<br/>
    {advogado.nome}<br/>
    OAB/{advogado.oab}
  </p>
</div>
"""
    },
    "recurso_apelacao": {
        "name": "Recurso de Apelação",
        "category": "recurso",
        "description": "Recurso de apelação contra sentença",
        "variables": [
            "exmo_juiz",
            "comarca",
            "vara",
            "processo.numero",
            "apelante.nome",
            "apelado.nome",
            "sentenca.data",
            "razoes",
            "pedidos",
            "advogado.nome",
            "advogado.oab",
            "local",
            "data"
        ],
        "template_html": """
<div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; text-align: justify;">
  <p style="text-align: center; font-weight: bold;">EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA {vara} DA COMARCA DE {comarca}</p>
  
  <p style="text-align: center; margin: 20px 0;">Processo nº {processo.numero}</p>
  
  <p style="margin-top: 30px;">
    <strong>{apelante.nome}</strong>, por seu advogado que esta subscreve, nos autos da ação 
    que move contra {apelado.nome}, vem, respeitosamente, interpor
  </p>
  
  <p style="text-align: center; font-weight: bold; margin: 20px 0;">RECURSO DE APELAÇÃO</p>
  
  <p>
    contra a r. sentença proferida em {sentenca.data}, que julgou [improcedente/procedente] 
    os pedidos iniciais, requerendo seja o presente recurso recebido e processado na forma da lei.
  </p>
  
  <h2>RAZÕES DE APELAÇÃO</h2>
  <p>{razoes}</p>
  
  <h2>DOS PEDIDOS</h2>
  <p>Diante do exposto, requer a Vossa Excelência:</p>
  <p>{pedidos}</p>
  
  <p>Termos em que,<br/>Pede deferimento.</p>
  
  <p style="margin-top: 50px;">{local}, {data}.</p>
  
  <p style="margin-top: 50px; text-align: center;">
    _________________________________<br/>
    {advogado.nome}<br/>
    OAB/{advogado.oab}
  </p>
</div>
"""
    }
}

# ==================== HELPER FUNCTIONS ====================

async def substitute_variables(template_html: str, variables: dict) -> str:
    """
    Substitui variáveis no template
    """
    result = template_html
    for key, value in variables.items():
        placeholder = "{" + key + "}"
        result = result.replace(placeholder, str(value))
    return result

async def generate_storage_path(client_id: str, job_id: Optional[str], category: str, filename: str) -> str:
    """
    Gera path organizado para documentos
    """
    if job_id:
        base_path = f"{client_id}/{job_id}/Documentos/{category}"
    else:
        base_path = f"{client_id}/_root/Documentos/{category}"
    
    full_path = Path(STORAGE_BASE) / base_path
    full_path.mkdir(parents=True, exist_ok=True)
    
    return f"{base_path}/{filename}"

# ==================== ENDPOINTS ====================

@router.get("/templates")
async def list_document_templates(
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Lista templates de documentos disponíveis
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    templates = []
    for template_id, template_data in DOCUMENT_TEMPLATES.items():
        if category and template_data["category"] != category:
            continue
        
        templates.append({
            "id": template_id,
            **template_data,
            "template_html": None  # Não envia HTML na listagem
        })
    
    return {"templates": templates, "total": len(templates)}

@router.get("/templates/{template_id}")
async def get_document_template(
    template_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtém template específico com HTML
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    if template_id not in DOCUMENT_TEMPLATES:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    return {
        "id": template_id,
        **DOCUMENT_TEMPLATES[template_id]
    }

@router.post("/generate")
async def generate_document(
    doc_data: DocumentGenerate,
    current_user: dict = Depends(get_current_user)
):
    """
    Gera documento a partir de template
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Verifica template
    if doc_data.template_id not in DOCUMENT_TEMPLATES:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    template = DOCUMENT_TEMPLATES[doc_data.template_id]
    
    # Substitui variáveis
    html_content = await substitute_variables(template["template_html"], doc_data.variables)
    
    # Gera filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{doc_data.title.replace(' ', '_')}_{timestamp}.html"
    
    # Salva arquivo
    storage_key = await generate_storage_path(
        doc_data.client_id,
        doc_data.job_id,
        doc_data.category,
        filename
    )
    full_path = Path(STORAGE_BASE) / storage_key
    
    async with aiofiles.open(full_path, 'w', encoding='utf-8') as f:
        await f.write(html_content)
    
    # Calcula hash
    hash_obj = hashlib.sha256(html_content.encode('utf-8'))
    file_hash = hash_obj.hexdigest()
    
    # Cria registro do documento
    document_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    document = {
        "id": document_id,
        "client_id": doc_data.client_id,
        "job_id": doc_data.job_id,
        "template_id": doc_data.template_id,
        "template_name": template["name"],
        "title": doc_data.title,
        "category": doc_data.category,
        "storage_key": storage_key,
        "filename": filename,
        "format": "html",
        "sha256": file_hash,
        "size_bytes": len(html_content.encode('utf-8')),
        "variables": doc_data.variables,
        "status": "generated",  # generated, pending_signature, signed
        "require_signature": doc_data.require_signature,
        "signature_link": None,
        "signed_at": None,
        "notes": doc_data.notes or "",
        "created_by": current_user.get("id"),
        "created_at": now,
        "version": 1
    }
    
    await db.generated_documents.insert_one(document)
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "document_generated",
        "entity_type": "document",
        "entity_id": document_id,
        "details": {
            "template_id": doc_data.template_id,
            "title": doc_data.title,
            "sha256": file_hash
        },
        "timestamp": now
    })
    
    return {
        "success": True,
        "document_id": document_id,
        "document": document,
        "preview_url": f"/api/documents/{document_id}/preview"
    }

@router.get("/")
async def list_generated_documents(
    client_id: Optional[str] = None,
    job_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """
    Lista documentos gerados
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {}
    if client_id:
        query["client_id"] = client_id
    if job_id:
        query["job_id"] = job_id
    if category:
        query["category"] = category
    if status:
        query["status"] = status
    
    documents = await db.generated_documents.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.generated_documents.count_documents(query)
    
    return {
        "documents": documents,
        "total": total,
        "page": skip // limit + 1,
        "total_pages": (total + limit - 1) // limit
    }

@router.get("/{document_id}")
async def get_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtém detalhes de um documento
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    document = await db.generated_documents.find_one({"id": document_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    return document

@router.get("/{document_id}/preview")
async def preview_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Preview do documento HTML
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    document = await db.generated_documents.find_one({"id": document_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    full_path = Path(STORAGE_BASE) / document["storage_key"]
    if not full_path.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    return FileResponse(
        path=str(full_path),
        media_type="text/html",
        filename=document["filename"]
    )

@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Download do documento
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    document = await db.generated_documents.find_one({"id": document_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    full_path = Path(STORAGE_BASE) / document["storage_key"]
    if not full_path.exists():
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "document_downloaded",
        "entity_type": "document",
        "entity_id": document_id,
        "details": {"filename": document["filename"]},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return FileResponse(
        path=str(full_path),
        media_type="application/octet-stream",
        filename=document["filename"]
    )

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Deleta documento
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    document = await db.generated_documents.find_one({"id": document_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    # Não permite deletar documentos assinados
    if document.get("status") == "signed":
        raise HTTPException(
            status_code=400,
            detail="Documento assinado não pode ser deletado"
        )
    
    # Deleta arquivo
    full_path = Path(STORAGE_BASE) / document["storage_key"]
    if full_path.exists():
        full_path.unlink()
    
    # Deleta registro
    await db.generated_documents.delete_one({"id": document_id})
    
    # Log de auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "document_deleted",
        "entity_type": "document",
        "entity_id": document_id,
        "details": {"filename": document["filename"], "sha256": document["sha256"]},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "message": "Documento deletado com sucesso"}

@router.get("/stats/overview")
async def get_documents_stats(
    current_user: dict = Depends(get_current_user)
):
    """
    Estatísticas de documentos gerados
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    total = await db.generated_documents.count_documents({})
    
    by_category = {}
    for category in ["peticao", "procuracao", "declaracao", "contrato", "recurso", "outros"]:
        by_category[category] = await db.generated_documents.count_documents({"category": category})
    
    by_status = {}
    for status in ["generated", "pending_signature", "signed"]:
        by_status[status] = await db.generated_documents.count_documents({"status": status})
    
    return {
        "total_documents": total,
        "by_category": by_category,
        "by_status": by_status
    }
