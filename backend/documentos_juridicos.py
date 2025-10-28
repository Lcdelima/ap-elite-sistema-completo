"""
AP ELITE ATHENA - Gerador de Documentos Jurídicos Avançado
Backend completo para geração de documentos profissionais
"""

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
import os
import uuid
import json

router = APIRouter(prefix="/api/documentos", tags=["Documentos Jurídicos"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

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

# ==================== TEMPLATES DE DOCUMENTOS ====================

TEMPLATES_DOCUMENTOS = {
    "peticao_inicial": {
        "nome": "Petição Inicial",
        "categoria": "Petições",
        "campos": [
            {"nome": "comarca", "tipo": "text", "label": "Comarca", "obrigatorio": True},
            {"nome": "vara", "tipo": "text", "label": "Vara", "obrigatorio": True},
            {"nome": "autor", "tipo": "text", "label": "Autor/Requerente", "obrigatorio": True},
            {"nome": "autor_qualificacao", "tipo": "textarea", "label": "Qualificação do Autor", "obrigatorio": True},
            {"nome": "reu", "tipo": "text", "label": "Réu/Requerido", "obrigatorio": True},
            {"nome": "reu_qualificacao", "tipo": "textarea", "label": "Qualificação do Réu", "obrigatorio": True},
            {"nome": "fatos", "tipo": "textarea", "label": "Dos Fatos", "obrigatorio": True},
            {"nome": "direito", "tipo": "textarea", "label": "Do Direito", "obrigatorio": True},
            {"nome": "pedidos", "tipo": "textarea", "label": "Dos Pedidos", "obrigatorio": True},
            {"nome": "valor_causa", "tipo": "number", "label": "Valor da Causa (R$)", "obrigatorio": True},
            {"nome": "provas", "tipo": "textarea", "label": "Provas", "obrigatorio": False}
        ],
        "template": """
EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(ÍZA) DE DIREITO DA {vara} DA COMARCA DE {comarca}

{autor}, {autor_qualificacao}, por seu advogado que esta subscreve, vem, respeitosamente, à presença de Vossa Excelência, propor

AÇÃO [TIPO DE AÇÃO]

em face de {reu}, {reu_qualificacao}, pelos fatos e fundamentos jurídicos a seguir expostos:

I - DOS FATOS

{fatos}

II - DO DIREITO

{direito}

III - DOS PEDIDOS

Diante do exposto, requer-se:

{pedidos}

IV - DO VALOR DA CAUSA

Dá-se à causa o valor de R$ {valor_causa}.

V - DAS PROVAS

{provas}

Termos em que,
Pede deferimento.

[Local], [Data]

_____________________________
[Advogado(a)]
OAB/[UF] [Número]
"""
    },
    
    "contestacao": {
        "nome": "Contestação",
        "categoria": "Petições",
        "campos": [
            {"nome": "comarca", "tipo": "text", "label": "Comarca", "obrigatorio": True},
            {"nome": "vara", "tipo": "text", "label": "Vara", "obrigatorio": True},
            {"nome": "numero_processo", "tipo": "text", "label": "Nº do Processo", "obrigatorio": True},
            {"nome": "autor", "tipo": "text", "label": "Autor", "obrigatorio": True},
            {"nome": "reu", "tipo": "text", "label": "Réu/Contestante", "obrigatorio": True},
            {"nome": "preliminares", "tipo": "textarea", "label": "Preliminares", "obrigatorio": False},
            {"nome": "merito", "tipo": "textarea", "label": "Do Mérito", "obrigatorio": True},
            {"nome": "pedidos", "tipo": "textarea", "label": "Dos Pedidos", "obrigatorio": True}
        ],
        "template": """
EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(ÍZA) DE DIREITO DA {vara} DA COMARCA DE {comarca}

Processo nº {numero_processo}

{reu}, já qualificado nos autos da ação que lhe move {autor}, vem, respeitosamente, à presença de Vossa Excelência, por seu advogado que esta subscreve, apresentar

CONTESTAÇÃO

pelos fundamentos de fato e de direito a seguir expostos:

I - PRELIMINARES

{preliminares}

II - DO MÉRITO

{merito}

III - DOS PEDIDOS

{pedidos}

Termos em que,
Pede deferimento.

[Local], [Data]

_____________________________
[Advogado(a)]
OAB/[UF] [Número]
"""
    },
    
    "recurso_apelacao": {
        "nome": "Recurso de Apelação",
        "categoria": "Recursos",
        "campos": [
            {"nome": "tribunal", "tipo": "text", "label": "Tribunal", "obrigatorio": True},
            {"nome": "numero_processo", "tipo": "text", "label": "Nº do Processo", "obrigatorio": True},
            {"nome": "apelante", "tipo": "text", "label": "Apelante", "obrigatorio": True},
            {"nome": "apelado", "tipo": "text", "label": "Apelado", "obrigatorio": True},
            {"nome": "sentenca_data", "tipo": "date", "label": "Data da Sentença", "obrigatorio": True},
            {"nome": "razoes", "tipo": "textarea", "label": "Razões de Recurso", "obrigatorio": True},
            {"nome": "pedidos", "tipo": "textarea", "label": "Pedidos", "obrigatorio": True}
        ],
        "template": """
EGRÉGIO {tribunal}

Processo nº {numero_processo}

{apelante}, nos autos da ação que lhe move {apelado}, vem, respeitosamente, à presença deste Egrégio Tribunal, por seu advogado signatário, interpor

RECURSO DE APELAÇÃO

em face da r. sentença proferida em {sentenca_data}, pelas razões de fato e de direito a seguir deduzidas.

I - DAS RAZÕES DE RECURSO

{razoes}

II - DOS PEDIDOS

{pedidos}

Termos em que,
Pede provimento.

[Local], [Data]

_____________________________
[Advogado(a)]
OAB/[UF] [Número]
"""
    },
    
    "contrato_prestacao_servicos": {
        "nome": "Contrato de Prestação de Serviços Jurídicos",
        "categoria": "Contratos",
        "campos": [
            {"nome": "contratante", "tipo": "text", "label": "Contratante", "obrigatorio": True},
            {"nome": "contratante_qualificacao", "tipo": "textarea", "label": "Qualificação Contratante", "obrigatorio": True},
            {"nome": "contratado", "tipo": "text", "label": "Contratado", "obrigatorio": True},
            {"nome": "contratado_qualificacao", "tipo": "textarea", "label": "Qualificação Contratado", "obrigatorio": True},
            {"nome": "servicos", "tipo": "textarea", "label": "Descrição dos Serviços", "obrigatorio": True},
            {"nome": "honorarios", "tipo": "number", "label": "Honorários (R$)", "obrigatorio": True},
            {"nome": "forma_pagamento", "tipo": "textarea", "label": "Forma de Pagamento", "obrigatorio": True},
            {"nome": "prazo", "tipo": "text", "label": "Prazo de Vigência", "obrigatorio": True}
        ],
        "template": """
CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS

Pelo presente instrumento particular, as partes:

CONTRATANTE: {contratante}, {contratante_qualificacao}

CONTRATADO: {contratado}, {contratado_qualificacao}

Têm entre si, justo e acertado, o presente Contrato de Prestação de Serviços Advocatícios, mediante as cláusulas e condições seguintes:

CLÁUSULA PRIMEIRA - DO OBJETO
O presente contrato tem por objeto a prestação de serviços advocatícios pelo CONTRATADO ao CONTRATANTE, compreendendo:

{servicos}

CLÁUSULA SEGUNDA - DOS HONORÁRIOS
Pelos serviços prestados, o CONTRATANTE pagará ao CONTRATADO honorários no valor de R$ {honorarios} ({honorarios_extenso}).

CLÁUSULA TERCEIRA - DA FORMA DE PAGAMENTO
{forma_pagamento}

CLÁUSULA QUARTA - DO PRAZO
O presente contrato terá vigência de {prazo}, podendo ser prorrogado mediante acordo entre as partes.

CLÁUSULA QUINTA - DAS DISPOSIÇÕES GERAIS
[Inserir cláusulas adicionais conforme necessário]

E, por estarem assim justos e contratados, firmam o presente instrumento em duas vias de igual teor e forma.

[Local], [Data]

_____________________________          _____________________________
CONTRATANTE                           CONTRATADO
"""
    },
    
    "procuracao": {
        "nome": "Procuração",
        "categoria": "Procurações",
        "campos": [
            {"nome": "outorgante", "tipo": "text", "label": "Outorgante", "obrigatorio": True},
            {"nome": "outorgante_qualificacao", "tipo": "textarea", "label": "Qualificação Outorgante", "obrigatorio": True},
            {"nome": "outorgado", "tipo": "text", "label": "Outorgado", "obrigatorio": True},
            {"nome": "outorgado_oab", "tipo": "text", "label": "OAB", "obrigatorio": True},
            {"nome": "poderes", "tipo": "textarea", "label": "Poderes", "obrigatorio": True},
            {"nome": "fim_especial", "tipo": "textarea", "label": "Fim Especial", "obrigatorio": False}
        ],
        "template": """
PROCURAÇÃO

Por este instrumento particular de PROCURAÇÃO,

{outorgante}, {outorgante_qualificacao}, nomeia e constitui seu bastante Procurador o(a) Dr(a). {outorgado}, inscrito(a) na OAB/{outorgado_oab}, a quem confere os mais amplos e gerais poderes para o foro em geral, com as cláusulas ad judicia et extra, podendo:

{poderes}

{fim_especial}

[Local], [Data]

_____________________________
{outorgante}
OUTORGANTE
"""
    },
    
    "declaracao": {
        "nome": "Declaração",
        "categoria": "Declarações",
        "campos": [
            {"nome": "declarante", "tipo": "text", "label": "Declarante", "obrigatorio": True},
            {"nome": "declarante_qualificacao", "tipo": "textarea", "label": "Qualificação", "obrigatorio": True},
            {"nome": "finalidade", "tipo": "text", "label": "Finalidade", "obrigatorio": True},
            {"nome": "conteudo", "tipo": "textarea", "label": "Conteúdo da Declaração", "obrigatorio": True}
        ],
        "template": """
DECLARAÇÃO

{declarante}, {declarante_qualificacao}, DECLARA para os devidos fins, especialmente para {finalidade}, que:

{conteudo}

Por ser expressão da verdade, firmo a presente declaração.

[Local], [Data]

_____________________________
{declarante}
"""
    },
    
    "ata_reuniao": {
        "nome": "Ata de Reunião",
        "categoria": "Documentos Corporativos",
        "campos": [
            {"nome": "empresa", "tipo": "text", "label": "Empresa/Entidade", "obrigatorio": True},
            {"nome": "tipo_reuniao", "tipo": "text", "label": "Tipo de Reunião", "obrigatorio": True},
            {"nome": "data_reuniao", "tipo": "date", "label": "Data da Reunião", "obrigatorio": True},
            {"nome": "local", "tipo": "text", "label": "Local", "obrigatorio": True},
            {"nome": "participantes", "tipo": "textarea", "label": "Participantes", "obrigatorio": True},
            {"nome": "pauta", "tipo": "textarea", "label": "Pauta", "obrigatorio": True},
            {"nome": "deliberacoes", "tipo": "textarea", "label": "Deliberações", "obrigatorio": True}
        ],
        "template": """
ATA DE {tipo_reuniao}

{empresa}

Aos {data_reuniao}, no {local}, reuniram-se:

{participantes}

Para tratar da seguinte pauta:

{pauta}

Após discussão, foram tomadas as seguintes deliberações:

{deliberacoes}

Nada mais havendo a tratar, foi lavrada a presente ata que vai assinada por todos os presentes.

[Local], [Data]

_____________________________
[Assinaturas]
"""
    },
    
    "notificacao_extrajudicial": {
        "nome": "Notificação Extrajudicial",
        "categoria": "Notificações",
        "campos": [
            {"nome": "notificante", "tipo": "text", "label": "Notificante", "obrigatorio": True},
            {"nome": "notificado", "tipo": "text", "label": "Notificado", "obrigatorio": True},
            {"nome": "notificado_endereco", "tipo": "textarea", "label": "Endereço do Notificado", "obrigatorio": True},
            {"nome": "motivo", "tipo": "textarea", "label": "Motivo da Notificação", "obrigatorio": True},
            {"nome": "prazo", "tipo": "text", "label": "Prazo para Resposta", "obrigatorio": True},
            {"nome": "consequencias", "tipo": "textarea", "label": "Consequências", "obrigatorio": False}
        ],
        "template": """
NOTIFICAÇÃO EXTRAJUDICIAL

DE: {notificante}
PARA: {notificado}
ENDEREÇO: {notificado_endereco}

Pelo presente, fica V.Sa. NOTIFICADO(A) de que:

{motivo}

Fica estabelecido o prazo de {prazo} para manifestação, sob pena de:

{consequencias}

[Local], [Data]

_____________________________
{notificante}
"""
    },
    
    "acordo_extrajudicial": {
        "nome": "Acordo Extrajudicial",
        "categoria": "Acordos",
        "campos": [
            {"nome": "parte1", "tipo": "text", "label": "Primeira Parte", "obrigatorio": True},
            {"nome": "parte1_qualificacao", "tipo": "textarea", "label": "Qualificação Parte 1", "obrigatorio": True},
            {"nome": "parte2", "tipo": "text", "label": "Segunda Parte", "obrigatorio": True},
            {"nome": "parte2_qualificacao", "tipo": "textarea", "label": "Qualificação Parte 2", "obrigatorio": True},
            {"nome": "objeto", "tipo": "textarea", "label": "Objeto do Acordo", "obrigatorio": True},
            {"nome": "condicoes", "tipo": "textarea", "label": "Condições", "obrigatorio": True},
            {"nome": "valor", "tipo": "number", "label": "Valor (R$)", "obrigatorio": False}
        ],
        "template": """
ACORDO EXTRAJUDICIAL

Pelo presente instrumento particular, as partes:

PRIMEIRA PARTE: {parte1}, {parte1_qualificacao}

SEGUNDA PARTE: {parte2}, {parte2_qualificacao}

Têm entre si, justo e acordado:

CLÁUSULA PRIMEIRA - DO OBJETO
{objeto}

CLÁUSULA SEGUNDA - DAS CONDIÇÕES
{condicoes}

CLÁUSULA TERCEIRA - DO VALOR
O presente acordo envolve o valor de R$ {valor}.

CLÁUSULA QUARTA - DA QUITAÇÃO
As partes dão-se recíproca e geral quitação para nada mais reclamarem uma da outra.

E, por estarem assim justos e acordados, firmam o presente em duas vias.

[Local], [Data]

_____________________________          _____________________________
PRIMEIRA PARTE                         SEGUNDA PARTE
"""
    },
    
    "requerimento_administrativo": {
        "nome": "Requerimento Administrativo",
        "categoria": "Administrativo",
        "campos": [
            {"nome": "orgao", "tipo": "text", "label": "Órgão Destinatário", "obrigatorio": True},
            {"nome": "requerente", "tipo": "text", "label": "Requerente", "obrigatorio": True},
            {"nome": "requerente_qualificacao", "tipo": "textarea", "label": "Qualificação", "obrigatorio": True},
            {"nome": "fundamento", "tipo": "textarea", "label": "Fundamentação", "obrigatorio": True},
            {"nome": "pedido", "tipo": "textarea", "label": "Pedido", "obrigatorio": True}
        ],
        "template": """
REQUERIMENTO

AO {orgao}

{requerente}, {requerente_qualificacao}, vem, respeitosamente, à presença de Vossa Senhoria, requerer:

I - DA FUNDAMENTAÇÃO

{fundamento}

II - DO PEDIDO

{pedido}

Termos em que,
Pede deferimento.

[Local], [Data]

_____________________________
{requerente}
"""
    }
}

@router.get("/templates")
async def listar_templates(
    categoria: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Lista todos os templates disponíveis"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    templates = []
    for key, template in TEMPLATES_DOCUMENTOS.items():
        if categoria and template["categoria"] != categoria:
            continue
        templates.append({
            "id": key,
            "nome": template["nome"],
            "categoria": template["categoria"]
        })
    
    # Agrupar por categoria
    categorias = {}
    for t in templates:
        cat = t["categoria"]
        if cat not in categorias:
            categorias[cat] = []
        categorias[cat].append(t)
    
    return {
        "templates": templates,
        "por_categoria": categorias,
        "total": len(templates)
    }

@router.get("/templates/{template_id}")
async def obter_template(
    template_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtém detalhes do template"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    if template_id not in TEMPLATES_DOCUMENTOS:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    return {
        "id": template_id,
        **TEMPLATES_DOCUMENTOS[template_id]
    }

@router.post("/gerar")
async def gerar_documento(
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Gera documento a partir de template"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    template_id = data.get("template_id")
    campos = data.get("campos", {})
    
    if template_id not in TEMPLATES_DOCUMENTOS:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    template = TEMPLATES_DOCUMENTOS[template_id]
    
    # Validar campos obrigatórios
    for campo in template["campos"]:
        if campo["obrigatorio"] and not campos.get(campo["nome"]):
            raise HTTPException(
                status_code=400,
                detail=f"Campo obrigatório não preenchido: {campo['label']}"
            )
    
    # Gerar documento
    conteudo = template["template"]
    for key, value in campos.items():
        conteudo = conteudo.replace(f"{{{key}}}", str(value))
    
    # Adicionar data e local padrão
    now = datetime.now()
    conteudo = conteudo.replace("[Local]", campos.get("local", "São Paulo/SP"))
    conteudo = conteudo.replace("[Data]", now.strftime("%d de %B de %Y"))
    
    # Salvar no banco
    documento_id = str(uuid.uuid4())
    documento = {
        "id": documento_id,
        "template_id": template_id,
        "template_nome": template["nome"],
        "conteudo": conteudo,
        "campos": campos,
        "criado_por": current_user.get("email", ""),
        "criado_em": now.isoformat(),
        "atualizado_em": now.isoformat()
    }
    
    await db.documentos_gerados.insert_one(documento)
    
    return {
        "message": "Documento gerado com sucesso",
        "id": documento_id,
        "conteudo": conteudo
    }

@router.get("/documentos")
async def listar_documentos(
    template_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user)
):
    """Lista documentos gerados"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    query = {}
    if template_id:
        query["template_id"] = template_id
    
    documentos = await db.documentos_gerados.find(
        query, {"_id": 0}
    ).sort("criado_em", -1).skip(skip).limit(limit).to_list(limit)
    
    total = await db.documentos_gerados.count_documents(query)
    
    return {
        "documentos": documentos,
        "total": total
    }

@router.get("/documentos/{documento_id}")
async def obter_documento(
    documento_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtém documento gerado"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    documento = await db.documentos_gerados.find_one(
        {"id": documento_id},
        {"_id": 0}
    )
    
    if not documento:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    return documento

@router.delete("/documentos/{documento_id}")
async def excluir_documento(
    documento_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Exclui documento gerado"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    result = await db.documentos_gerados.delete_one({"id": documento_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    return {"message": "Documento excluído com sucesso"}

@router.get("/categorias")
async def listar_categorias(current_user: dict = Depends(get_current_user)):
    """Lista categorias de templates"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    categorias = set()
    for template in TEMPLATES_DOCUMENTOS.values():
        categorias.add(template["categoria"])
    
    return {"categorias": sorted(list(categorias))}
