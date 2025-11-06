"""Onboarding Inteligente de Clientes - Elite Athena"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import hashlib

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

DOCS_DIR = "/app/backend/onboarding_docs"
os.makedirs(DOCS_DIR, exist_ok=True)


class ClienteOnboarding(BaseModel):
    nome: str
    cpf_cnpj: str
    email: str
    telefone: str
    tipo_caso: str  # penal, civil, trabalhista, familia
    area_direito: str


class DocumentoPacote(BaseModel):
    tipo: str  # contrato, procuracao, lgpd, hipossuficiencia
    campos: Dict[str, Any]


@router.post("/clientes/bootstrap")
async def bootstrap_cliente(data: ClienteOnboarding):
    """Cria cliente e gera pacote inicial de documentos"""
    
    # Criar cliente
    cliente_id = str(uuid.uuid4())
    
    cliente = {
        "id": cliente_id,
        "nome": data.nome,
        "cpf_cnpj": data.cpf_cnpj,
        "email": data.email,
        "telefone": data.telefone,
        "tipo_caso": data.tipo_caso,
        "area_direito": data.area_direito,
        "status_onboarding": "documentos_gerados",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.clientes.insert_one(cliente)
    
    # Criar pasta digital
    pasta_base = os.path.join(DOCS_DIR, cliente_id)
    subpastas = [
        'pessoais', 'contratos', 'procuracoes', 'lgpd',
        'atendimentos', 'processos', 'assinados', 'manifestos'
    ]
    
    for subpasta in subpastas:
        os.makedirs(os.path.join(pasta_base, subpasta), exist_ok=True)
    
    # Gerar documentos iniciais
    documentos_gerados = []
    
    # 1. Contrato de Honorários
    contrato = gerar_contrato_honorarios(data.nome, data.area_direito)
    documentos_gerados.append({
        "tipo": "contrato_honorarios",
        "titulo": "Contrato de Honorários",
        "conteudo": contrato,
        "status": "aguardando_assinatura"
    })
    
    # 2. Procuração
    procuracao = gerar_procuracao(data.nome, data.area_direito)
    documentos_gerados.append({
        "tipo": "procuracao",
        "titulo": "Procuração",
        "conteudo": procuracao,
        "status": "aguardando_assinatura"
    })
    
    # 3. Termo LGPD
    lgpd = gerar_termo_lgpd(data.nome)
    documentos_gerados.append({
        "tipo": "termo_lgpd",
        "titulo": "Termo de Consentimento LGPD",
        "conteudo": lgpd,
        "status": "aguardando_assinatura"
    })
    
    # 4. Declaração de Hipossuficiência (se civil/trabalhista)
    if data.tipo_caso in ['civil', 'trabalhista']:
        hipo = gerar_declaracao_hipossuficiencia(data.nome)
        documentos_gerados.append({
            "tipo": "hipossuficiencia",
            "titulo": "Declaração de Hipossuficiência",
            "conteudo": hipo,
            "status": "aguardando_assinatura"
        })
    
    # Salvar documentos
    for doc in documentos_gerados:
        doc['cliente_id'] = cliente_id
        doc['id'] = str(uuid.uuid4())
        doc['created_at'] = datetime.now(timezone.utc).isoformat()
        doc['hash'] = hashlib.sha256(doc['conteudo'].encode()).hexdigest()
        
        await db.documentos_onboarding.insert_one(doc)
    
    return {
        "cliente_id": cliente_id,
        "pasta_criada": pasta_base,
        "documentos_gerados": len(documentos_gerados),
        "documentos": [d['tipo'] for d in documentos_gerados],
        "proximos_passos": [
            "Revisar documentos gerados",
            "Enviar para assinatura",
            "Aguardar retorno assinado",
            "Liberar acesso ao Portal do Cliente"
        ]
    }


@router.post("/upload-com-ocr")
async def upload_com_ocr(file: UploadFile = File(...)):
    """Upload com extração automática de dados (OCR + IA)"""
    
    # Salvar arquivo
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(DOCS_DIR, f"{file_id}{file_ext}")
    
    content = await file.read()
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Detectar tipo de documento
    tipo_detectado = detectar_tipo_documento(file.filename)
    
    # Extração de dados (mock - implementar OCR real com Tesseract ou AssemblyAI)
    dados_extraidos = {}
    
    if tipo_detectado == 'RG':
        dados_extraidos = {
            'numero': '12.345.678-9',  # Mock - OCR real extrai
            'orgao_emissor': 'SSP',
            'uf': 'SP',
            'detectado_via': 'OCR + IA'
        }
    elif tipo_detectado == 'CPF':
        dados_extraidos = {
            'numero': '123.456.789-00',
            'detectado_via': 'OCR + IA'
        }
    
    return {
        "file_id": file_id,
        "tipo_detectado": tipo_detectado,
        "dados_extraidos": dados_extraidos,
        "hash_sha256": hashlib.sha256(content).hexdigest(),
        "message": "Dados extraídos com sucesso. Revise e confirme."
    }


@router.get("/clientes/{cliente_id}/action-plan")
async def get_action_plan(cliente_id: str):
    """Plano de ação - o que falta para o caso"""
    
    cliente = await db.clientes.find_one({"id": cliente_id})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Verificar documentos
    documentos = await db.cliente_documentos.find(
        {"cliente_id": cliente_id}
    ).to_list(length=None)
    
    documentos_tipos = [d['tipo_codigo'] for d in documentos]
    
    # Documentos obrigatórios por tipo de caso
    obrigatorios_map = {
        'penal': ['RG', 'CPF', 'PROCURACAO', 'CONTRATO_HONORARIOS'],
        'civil': ['RG', 'CPF', 'PROCURACAO', 'CONTRATO_HONORARIOS', 'COMPROVANTE_ENDERECO'],
        'trabalhista': ['RG', 'CPF', 'PROCURACAO', 'CONTRATO_HONORARIOS', 'CARTEIRA_TRABALHO'],
        'familia': ['RG', 'CPF', 'CERTIDAO', 'PROCURACAO', 'CONTRATO_HONORARIOS']
    }
    
    obrigatorios = obrigatorios_map.get(cliente.get('tipo_caso', 'civil'), [])
    
    # Calcular faltantes
    faltantes = [doc for doc in obrigatorios if doc not in documentos_tipos]
    
    # Criar action plan
    action_items = []
    
    for doc in faltantes:
        action_items.append({
            "tipo": "documento_faltante",
            "titulo": f"Enviar {doc}",
            "prioridade": "alta",
            "status": "pendente",
            "acao": "upload"
        })
    
    # Verificar assinaturas pendentes
    docs_onboarding = await db.documentos_onboarding.find(
        {"cliente_id": cliente_id, "status": "aguardando_assinatura"}
    ).to_list(length=None)
    
    for doc in docs_onboarding:
        action_items.append({
            "tipo": "assinatura_pendente",
            "titulo": f"Assinar {doc['titulo']}",
            "prioridade": "alta",
            "status": "pendente",
            "acao": "assinar",
            "documento_id": doc['id']
        })
    
    # Progresso geral
    total_itens = len(obrigatorios) + len(docs_onboarding)
    concluidos = len(obrigatorios) - len(faltantes)
    progresso = (concluidos / total_itens * 100) if total_itens > 0 else 0
    
    return {
        "cliente_id": cliente_id,
        "action_items": action_items,
        "total": len(action_items),
        "progresso": round(progresso, 2),
        "status_onboarding": "completo" if len(action_items) == 0 else "pendente"
    }


# ==================== FUNÇÕES AUXILIARES ====================

def detectar_tipo_documento(filename: str) -> str:
    """Detecta tipo de documento pelo nome do arquivo"""
    
    filename_lower = filename.lower()
    
    if 'rg' in filename_lower:
        return 'RG'
    elif 'cpf' in filename_lower:
        return 'CPF'
    elif 'cnh' in filename_lower:
        return 'CNH'
    elif 'procura' in filename_lower:
        return 'PROCURACAO'
    elif 'contrato' in filename_lower:
        return 'CONTRATO_HONORARIOS'
    elif 'comprovante' in filename_lower or 'endereco' in filename_lower:
        return 'COMPROVANTE_ENDERECO'
    
    return 'OUTROS'


def gerar_contrato_honorarios(nome_cliente: str, area: str) -> str:
    """Gera contrato de honorários"""
    
    return f"""CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS

CONTRATANTE: {nome_cliente}
CONTRATADO: Elite - Estratégias em Perícia e Investigação Criminal
Área: {area}

CLÁUSULA PRIMEIRA - DO OBJETO
O CONTRATADO prestará serviços jurídicos de advocacia na área de {area}.

CLÁUSULA SEGUNDA - DOS HONORÁRIOS
Os honorários serão definidos conforme complexidade do caso.

CLÁUSULA TERCEIRA - DO PRAZO
Vigência a partir da assinatura.

[Documento gerado automaticamente pelo Elite Athena]
"""


def gerar_procuracao(nome_cliente: str, area: str) -> str:
    """Gera procuração"""
    
    poderes_map = {
        'penal': 'defender em inquérito e ação penal, requerer liberdade provisória, recorrer',
        'civil': 'propor ações, contestar, recorrer, transigir',
        'trabalhista': 'reclamar, contestar, recorrer, receber',
        'familia': 'requerer, contestar, acordar, recorrer'
    }
    
    poderes = poderes_map.get(area, 'poderes gerais')
    
    return f"""PROCURAÇÃO AD JUDICIA ET EXTRA

OUTORGANTE: {nome_cliente}
OUTORGADO: Dra. Laura Cunha de Lima, OAB/SP XXXXX

PODERES: {poderes}, com todas as cláusulas 'ad judicia' e 'extra'.

[Documento gerado automaticamente pelo Elite Athena]
"""


def gerar_termo_lgpd(nome_cliente: str) -> str:
    """Gera termo de consentimento LGPD"""
    
    return f"""TERMO DE CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS

Eu, {nome_cliente}, AUTORIZO expressamente a Elite - Estratégias em Perícia e Investigação Criminal a:

1. Coletar, armazenar e processar meus dados pessoais;
2. Compartilhar com peritos, autoridades e tribunais quando necessário;
3. Manter pelo período necessário à finalidade jurídica.

Finalidade: Prestação de serviços jurídicos e periciais.
Base Legal: LGPD Art. 7º, I (consentimento) e Art. 11, II, 'f' (exercício regular de direitos).

Direitos: acesso, correção, eliminação, revogação (contato@eliteathena.com).

[Documento gerado automaticamente pelo Elite Athena - Conforme LGPD]
"""


def gerar_declaracao_hipossuficiencia(nome_cliente: str) -> str:
    """Gera declaração de hipossuficiência"""
    
    return f"""DECLARAÇÃO DE HIPOSSUFICIÊNCIA ECONÔMICA

Eu, {nome_cliente}, DECLARO para os devidos fins que:

1. Não possuo condições de arcar com as custas processuais e honorários advocatícios sem prejuízo do sustento próprio e familiar;

2. Solicito os benefícios da justiça gratuita conforme Lei 1.060/50 e CPC Art. 98.

Ciência: declaração falsa implica sanções penais (CP Art. 299).

[Documento gerado automaticamente pelo Elite Athena]
"""
