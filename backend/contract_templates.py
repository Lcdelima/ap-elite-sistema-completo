"""
AP ELITE ATHENA - Biblioteca de Templates de Contratos (Elite Gravitas™)
Gestão de templates dinâmicos para geração de contratos

Features:
- CRUD de templates
- Variáveis dinâmicas {cliente.nome}, {job.titulo}, etc
- Templates pré-definidos profissionais
- Cláusulas modulares
- Preview em tempo real
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel
import os
import uuid

router = APIRouter(prefix="/api/contract-templates", tags=["Contract Templates - Elite Gravitas"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

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

class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str  # 'contrato', 'aditivo', 'termo', 'declaracao'
    body_html: str
    variables: List[str] = []
    clauses: List[dict] = []
    is_public: bool = True

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    body_html: Optional[str] = None
    variables: Optional[List[str]] = None
    clauses: Optional[List[dict]] = None
    is_public: Optional[bool] = None

# ==================== DEFAULT TEMPLATES ====================

DEFAULT_TEMPLATES = [
    {
        "name": "Contrato de Honorários Advocatícios",
        "description": "Contrato padrão para prestação de serviços jurídicos",
        "category": "contrato",
        "variables": [
            "cliente.nome",
            "cliente.cpf",
            "cliente.endereco",
            "escritorio.nome",
            "escritorio.cnpj",
            "escritorio.oab",
            "valor.total",
            "valor.entrada",
            "valor.parcelas",
            "data.inicio",
            "job.descricao"
        ],
        "body_html": """
<h1 style="text-align: center;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS</h1>

<p><strong>CONTRATANTE:</strong> {cliente.nome}, inscrito no CPF sob o nº {cliente.cpf}, residente e domiciliado em {cliente.endereco}.</p>

<p><strong>CONTRATADO:</strong> {escritorio.nome}, inscrito no CNPJ sob o nº {escritorio.cnpj}, OAB {escritorio.oab}.</p>

<h2>CLÁUSULA PRIMEIRA - DO OBJETO</h2>
<p>O presente contrato tem por objeto a prestação de serviços jurídicos relacionados a: {job.descricao}.</p>

<h2>CLÁUSULA SEGUNDA - DOS HONORÁRIOS</h2>
<p>Os honorários advocatícios são fixados em R$ {valor.total}, sendo:</p>
<ul>
  <li>Entrada: R$ {valor.entrada}</li>
  <li>Saldo: {valor.parcelas} parcelas</li>
</ul>

<h2>CLÁUSULA TERCEIRA - DO PRAZO</h2>
<p>O presente contrato tem início em {data.inicio} e vigora até a conclusão dos serviços contratados.</p>

<h2>CLÁUSULA QUARTA - DAS RESPONSABILIDADES</h2>
<p>O CONTRATADO compromete-se a:</p>
<ul>
  <li>Prestar os serviços com zelo e dedicação;</li>
  <li>Manter o CONTRATANTE informado sobre o andamento do caso;</li>
  <li>Atuar em conformidade com o Código de Ética e Disciplina da OAB.</li>
</ul>

<h2>CLÁUSULA QUINTA - DA RESCISÃO</h2>
<p>O presente contrato poderá ser rescindido por qualquer das partes mediante notificação prévia de 30 dias.</p>

<p style="margin-top: 50px;">E por estarem assim justos e contratados, assinam o presente instrumento em 2 (duas) vias de igual teor e forma.</p>

<p style="margin-top: 50px; text-align: center;">{data.assinatura}</p>

<table style="width: 100%; margin-top: 50px;">
  <tr>
    <td style="text-align: center; border-top: 1px solid #000;">CONTRATANTE</td>
    <td style="text-align: center; border-top: 1px solid #000;">CONTRATADO</td>
  </tr>
</table>
""",
        "clauses": [
            {"id": "objeto", "title": "Do Objeto", "required": True},
            {"id": "honorarios", "title": "Dos Honorários", "required": True},
            {"id": "prazo", "title": "Do Prazo", "required": True},
            {"id": "responsabilidades", "title": "Das Responsabilidades", "required": True},
            {"id": "rescisao", "title": "Da Rescisão", "required": False}
        ]
    },
    {
        "name": "Termo de Confidencialidade LGPD",
        "description": "Termo de sigilo e confidencialidade conforme LGPD",
        "category": "termo",
        "variables": [
            "cliente.nome",
            "cliente.cpf",
            "escritorio.nome",
            "data.assinatura"
        ],
        "body_html": """
<h1 style="text-align: center;">TERMO DE CONFIDENCIALIDADE E SIGILO</h1>
<h2 style="text-align: center;">Lei Geral de Proteção de Dados (LGPD)</h2>

<p>Por este instrumento particular, {cliente.nome}, inscrito no CPF {cliente.cpf}, doravante denominado TITULAR, declara:</p>

<h2>CLÁUSULA PRIMEIRA - DO TRATAMENTO DE DADOS</h2>
<p>O TITULAR autoriza {escritorio.nome} a coletar, armazenar e processar seus dados pessoais exclusivamente para:</p>
<ul>
  <li>Prestação de serviços jurídicos;</li>
  <li>Cumprimento de obrigações legais;</li>
  <li>Comunicação sobre andamento de casos;</li>
  <li>Arquivo obrigatório conforme legislação vigente.</li>
</ul>

<h2>CLÁUSULA SEGUNDA - DA SEGURANÇA</h2>
<p>O escritório compromete-se a:</p>
<ul>
  <li>Implementar medidas de segurança técnicas e administrativas;</li>
  <li>Não compartilhar dados com terceiros sem autorização;</li>
  <li>Manter sigilo absoluto sobre informações confidenciais;</li>
  <li>Notificar incidentes de segurança em até 72 horas.</li>
</ul>

<h2>CLÁUSULA TERCEIRA - DOS DIREITOS DO TITULAR</h2>
<p>O TITULAR possui os seguintes direitos garantidos pela LGPD:</p>
<ul>
  <li>Confirmação de existência de tratamento;</li>
  <li>Acesso aos dados;</li>
  <li>Correção de dados incompletos/inexatos;</li>
  <li>Exclusão de dados desnecessários;</li>
  <li>Portabilidade de dados;</li>
  <li>Revogação do consentimento.</li>
</ul>

<p style="margin-top: 50px;">{data.assinatura}</p>

<table style="width: 100%; margin-top: 50px;">
  <tr>
    <td style="text-align: center; border-top: 1px solid #000;">TITULAR DOS DADOS</td>
  </tr>
</table>
""",
        "clauses": [
            {"id": "tratamento", "title": "Do Tratamento de Dados", "required": True},
            {"id": "seguranca", "title": "Da Segurança", "required": True},
            {"id": "direitos", "title": "Dos Direitos do Titular", "required": True}
        ]
    },
    {
        "name": "Aditivo Contratual",
        "description": "Aditivo para alteração de contrato vigente",
        "category": "aditivo",
        "variables": [
            "contrato.numero",
            "contrato.data",
            "cliente.nome",
            "escritorio.nome",
            "aditivo.descricao",
            "data.assinatura"
        ],
        "body_html": """
<h1 style="text-align: center;">ADITIVO CONTRATUAL</h1>
<h2 style="text-align: center;">Contrato nº {contrato.numero}</h2>

<p>Pelo presente instrumento, as partes:</p>
<p><strong>CONTRATANTE:</strong> {cliente.nome}</p>
<p><strong>CONTRATADO:</strong> {escritorio.nome}</p>

<p>Firmam o presente ADITIVO ao Contrato de Prestação de Serviços Jurídicos celebrado em {contrato.data}, mediante as seguintes cláusulas e condições:</p>

<h2>CLÁUSULA PRIMEIRA - DAS ALTERAÇÕES</h2>
<p>{aditivo.descricao}</p>

<h2>CLÁUSULA SEGUNDA - DAS DEMAIS CLÁUSULAS</h2>
<p>Permanecem inalteradas e em pleno vigor todas as demais cláusulas do contrato original que não conflitarem com o disposto neste aditivo.</p>

<p style="margin-top: 50px;">{data.assinatura}</p>

<table style="width: 100%; margin-top: 50px;">
  <tr>
    <td style="text-align: center; border-top: 1px solid #000;">CONTRATANTE</td>
    <td style="text-align: center; border-top: 1px solid #000;">CONTRATADO</td>
  </tr>
</table>
""",
        "clauses": [
            {"id": "alteracoes", "title": "Das Alterações", "required": True},
            {"id": "demais", "title": "Das Demais Cláusulas", "required": True}
        ]
    },
    {
        "name": "Procuração Ad Judicia",
        "description": "Procuração para atuação judicial",
        "category": "procuracao",
        "variables": [
            "cliente.nome",
            "cliente.cpf",
            "cliente.rg",
            "cliente.endereco",
            "advogado.nome",
            "advogado.oab",
            "poderes.descricao",
            "data.assinatura"
        ],
        "body_html": """
<h1 style="text-align: center;">PROCURAÇÃO AD JUDICIA</h1>

<p><strong>OUTORGANTE:</strong> {cliente.nome}, inscrito no CPF {cliente.cpf}, RG {cliente.rg}, residente e domiciliado em {cliente.endereco}.</p>

<p><strong>OUTORGADO:</strong> {advogado.nome}, inscrito na OAB sob o nº {advogado.oab}.</p>

<h2>PODERES</h2>
<p>O OUTORGANTE confere ao OUTORGADO os mais amplos e gerais poderes para:</p>
<ul>
  <li>Representar o OUTORGANTE em juízo ou fora dele;</li>
  <li>Propor quaisquer ações, defender-se das que forem propostas;</li>
  <li>Acompanhar processos até final decisão;</li>
  <li>Interpor e desistir de recursos;</li>
  <li>Firmar compromissos, acordos e transações;</li>
  <li>Receber e dar quitação;</li>
  <li>Substabelecer com ou sem reservas;</li>
  <li>{poderes.descricao}</li>
</ul>

<p style="margin-top: 50px;">{data.assinatura}</p>

<table style="width: 100%; margin-top: 50px;">
  <tr>
    <td style="text-align: center; border-top: 1px solid #000;">OUTORGANTE</td>
  </tr>
</table>
""",
        "clauses": [
            {"id": "poderes", "title": "Dos Poderes", "required": True}
        ]
    }
]

# ==================== ENDPOINTS ====================

@router.post("/seed")
async def seed_default_templates(
    current_user: dict = Depends(get_current_user)
):
    """
    Popula templates padrão (executar apenas uma vez)
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Verifica permissão
    if current_user.get("role") not in ["administrator", "super_admin"]:
        raise HTTPException(status_code=403, detail="Apenas administradores")
    
    created_count = 0
    now = datetime.now(timezone.utc).isoformat()
    
    for template_data in DEFAULT_TEMPLATES:
        # Verifica se já existe
        existing = await db.contract_templates.find_one({"name": template_data["name"]})
        if existing:
            continue
        
        template = {
            "id": str(uuid.uuid4()),
            **template_data,
            "is_public": True,
            "is_default": True,
            "created_by": current_user.get("id"),
            "created_at": now,
            "updated_at": now,
            "version": 1
        }
        
        await db.contract_templates.insert_one(template)
        created_count += 1
    
    return {
        "success": True,
        "message": f"{created_count} templates criados com sucesso"
    }

@router.get("/")
async def list_templates(
    category: Optional[str] = None,
    is_public: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Lista templates disponíveis
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {}
    if category:
        query["category"] = category
    if is_public is not None:
        query["is_public"] = is_public
    
    templates = await db.contract_templates.find(query, {"_id": 0}).sort("name", 1).to_list(None)
    
    return {"templates": templates, "total": len(templates)}

@router.get("/{template_id}")
async def get_template(
    template_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Obtém template específico
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    template = await db.contract_templates.find_one({"id": template_id}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    return template

@router.post("/")
async def create_template(
    template_data: TemplateCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Cria novo template customizado
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    template_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    template = {
        "id": template_id,
        "name": template_data.name,
        "description": template_data.description or "",
        "category": template_data.category,
        "body_html": template_data.body_html,
        "variables": template_data.variables,
        "clauses": template_data.clauses,
        "is_public": template_data.is_public,
        "is_default": False,
        "created_by": current_user.get("id"),
        "created_at": now,
        "updated_at": now,
        "version": 1
    }
    
    await db.contract_templates.insert_one(template)
    
    return {
        "success": True,
        "template_id": template_id,
        "template": template
    }

@router.put("/{template_id}")
async def update_template(
    template_id: str,
    template_data: TemplateUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Atualiza template existente
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    template = await db.contract_templates.find_one({"id": template_id}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    # Não permite editar templates padrão
    if template.get("is_default"):
        raise HTTPException(
            status_code=400,
            detail="Templates padrão não podem ser editados. Crie uma cópia."
        )
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if template_data.name is not None:
        update_data["name"] = template_data.name
    if template_data.description is not None:
        update_data["description"] = template_data.description
    if template_data.category is not None:
        update_data["category"] = template_data.category
    if template_data.body_html is not None:
        update_data["body_html"] = template_data.body_html
    if template_data.variables is not None:
        update_data["variables"] = template_data.variables
    if template_data.clauses is not None:
        update_data["clauses"] = template_data.clauses
    if template_data.is_public is not None:
        update_data["is_public"] = template_data.is_public
    
    update_data["version"] = template.get("version", 1) + 1
    
    await db.contract_templates.update_one({"id": template_id}, {"$set": update_data})
    
    updated_template = await db.contract_templates.find_one({"id": template_id}, {"_id": 0})
    return {"success": True, "template": updated_template}

@router.delete("/{template_id}")
async def delete_template(
    template_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Deleta template customizado
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    template = await db.contract_templates.find_one({"id": template_id}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    # Não permite deletar templates padrão
    if template.get("is_default"):
        raise HTTPException(status_code=400, detail="Templates padrão não podem ser deletados")
    
    await db.contract_templates.delete_one({"id": template_id})
    
    return {"success": True, "message": "Template deletado com sucesso"}
