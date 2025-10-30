"""
AP ELITE ATHENA - Sistema Jurídico Completo
Backend avançado para gestão jurídica profissional com JWT e RBAC
"""

from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File, Header
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
import os
import uuid
import json
import logging

router = APIRouter(prefix="/api/juridico", tags=["Sistema Jurídico"])
logger = logging.getLogger(__name__)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Security - Usar JWT do módulo security
from security import verify_token, check_permission

async def get_current_user_jwt_jwt(authorization: str = Header(None)) -> Dict[str, Any]:
    """
    Dependency segura com JWT
    Substitui autenticação fraca por token_parts
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Token de autenticação não fornecido",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return payload

# ==================== MODELS PYDANTIC ====================

class ProcessoCreate(BaseModel):
    """Modelo validado para criação de processo"""
    numero_processo: str = Field(..., min_length=3, max_length=100)
    titulo: str = Field(..., min_length=5, max_length=200)
    tipo: str = Field(..., pattern="^(civel|criminal|trabalhista|tributario|administrativo)$")
    comarca: str
    vara: str
    cliente: str
    parte_contraria: str
    advogado_responsavel: str
    valor_causa: Optional[float] = Field(None, ge=0)
    data_distribuicao: Optional[str] = None
    status: str = Field(default="em_andamento", pattern="^(em_andamento|suspenso|arquivado|concluido)$")
    prioridade: str = Field(default="normal", pattern="^(baixa|normal|alta|urgente)$")
    observacoes: Optional[str] = None

class MovimentacaoCreate(BaseModel):
    """Modelo para movimentação processual"""
    tipo_movimentacao: str
    descricao: str = Field(..., min_length=10)
    data_movimentacao: str
    responsavel: str

# ==================== PROCESSOS JUDICIAIS ====================

@router.get("/processos")
async def listar_processos(
    status: Optional[str] = None,
    tipo: Optional[str] = None,
    prioridade: Optional[str] = None,
    cliente: Optional[str] = None,
    advogado: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user_jwt_jwt)
):
    """
    Lista processos com filtros avançados e autenticação JWT
    CORRIGIDO: Filtro soft delete, validação de limit, proteção JWT
    """
    
    # Validar limit para evitar divisão por zero
    if limit <= 0:
        limit = 50
    if limit > 100:
        limit = 100
    
    query = {"ativo": True}  # CORRIGIDO: Soft delete filter
    
    # Filtros de perfil - cliente só vê seus processos
    if current_user.get("role") == "client":
        query["cliente_email"] = current_user.get("email")
    
    if status:
        query["status"] = status
    if tipo:
        query["tipo"] = tipo
    if prioridade:
        query["prioridade"] = prioridade
    if cliente:
        query["cliente"] = {"$regex": cliente, "$options": "i"}
    if advogado:
        query["advogado"] = {"$regex": advogado, "$options": "i"}
    
    try:
        processos = await db.processos_juridicos.find(
            query, {"_id": 0}
        ).sort("data_cadastro", -1).skip(skip).limit(limit).to_list(limit)
        
        total = await db.processos_juridicos.count_documents(query)
        
        logger.info(f"📋 Listagem de processos - User: {current_user.get('email')}, Total: {total}")
        
        return {
            "processos": processos,
            "total": total,
            "page": skip // limit + 1,
            "total_pages": (total + limit - 1) // limit
        }
    except Exception as e:
        logger.error(f"Error listing processos: {e}")
        raise HTTPException(status_code=500, detail="Erro ao listar processos")

@router.post("/processos")
async def criar_processo(
    data: ProcessoCreate,
    current_user: dict = Depends(get_current_user_jwt_jwt)
):
    """
    Cria novo processo judicial
    MELHORADO: Validação Pydantic, JWT, auditoria
    """
    
    # Verificar permissão
    if not check_permission(current_user.get("role"), "cases.create"):
        raise HTTPException(status_code=403, detail="Sem permissão para criar processos")
    
    processo_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    processo = {
        "id": processo_id,
        "numero_processo": data.numero_processo,
        "titulo": data.titulo,
        "tipo": data.tipo,
        
        # Partes
        "cliente": data.cliente,
        "parte_contraria": data.parte_contraria,
        "advogado_responsavel": data.advogado_responsavel,
        
        # Informações Judiciais
        "comarca": data.comarca,
        "vara": data.vara,
        
        # Valores
        "valor_causa": data.valor_causa,
        
        # Status e Controle
        "status": data.status,
        "prioridade": data.get("prioridade", "normal"),
        "probabilidade_exito": data.get("probabilidade_exito", ""),
        "risco_processo": data.get("risco_processo", ""),
        
        # Datas
        "data_distribuicao": data.get("data_distribuicao", ""),
        "data_citacao": data.get("data_citacao", ""),
        "data_audiencia": data.get("data_audiencia", ""),
        "prazo_contestacao": data.get("prazo_contestacao", ""),
        "data_sentenca": data.get("data_sentenca", ""),
        "data_transito_julgado": data.get("data_transito_julgado", ""),
        
        # Descrições
        "objeto": data.get("objeto", ""),
        "pedido_principal": data.get("pedido_principal", ""),
        "pedidos_alternativos": data.get("pedidos_alternativos", []),
        "causa_pedir": data.get("causa_pedir", ""),
        "defesa_estrategia": data.get("defesa_estrategia", ""),
        "historico": data.get("historico", ""),
        "observacoes": data.get("observacoes", ""),
        
        # Documentos e Evidências
        "documentos": data.get("documentos", []),
        "provas": data.get("provas", []),
        "peticoes": data.get("peticoes", []),
        "movimentacoes": data.get("movimentacoes", []),
        
        # Prazos e Alertas
        "prazos_pendentes": data.get("prazos_pendentes", []),
        "proxima_audiencia": data.get("proxima_audiencia", None),
        "alertas": data.get("alertas", []),
        
        # Tags e Classificação
        "tags": data.get("tags", []),
        "categoria": data.get("categoria", ""),
        "subcategoria": data.get("subcategoria", ""),
        
        # Controle Interno
        "codigo_interno": data.get("codigo_interno", f"PROC-{processo_id[:8]}"),
        "pasta_fisica": data.get("pasta_fisica", ""),
        "localizacao_arquivo": data.get("localizacao_arquivo", ""),
        
        # Metadados
        "criado_por": current_user.get("email", ""),
        "criado_em": now,
        "atualizado_por": current_user.get("email", ""),
        "atualizado_em": now,
        "ativo": True
    }
    
    await db.processos_juridicos.insert_one(processo)
    
    # Criar linha do tempo
    await criar_evento_timeline(processo_id, "criacao", "Processo criado", current_user)
    
    return {
        "message": "Processo criado com sucesso",
        "id": processo_id,
        "numero_processo": processo["numero_processo"]
    }

@router.get("/processos/{processo_id}")
async def obter_processo(
    processo_id: str,
    current_user: dict = Depends(get_current_user_jwt)
):
    """Obtém detalhes completos do processo"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    processo = await db.processos_juridicos.find_one(
        {"id": processo_id},
        {"_id": 0}
    )
    
    if not processo:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    # Buscar timeline
    timeline = await db.processo_timeline.find(
        {"processo_id": processo_id},
        {"_id": 0}
    ).sort("data", -1).to_list(100)
    
    processo["timeline"] = timeline
    
    return processo

@router.put("/processos/{processo_id}")
async def atualizar_processo(
    processo_id: str,
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Atualiza processo"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    processo = await db.processos_juridicos.find_one({"id": processo_id})
    if not processo:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    data["atualizado_por"] = current_user.get("email", "")
    data["atualizado_em"] = datetime.now(timezone.utc).isoformat()
    
    await db.processos_juridicos.update_one(
        {"id": processo_id},
        {"$set": data}
    )
    
    # Registrar na timeline
    await criar_evento_timeline(
        processo_id,
        "atualizacao",
        "Processo atualizado",
        current_user
    )
    
    return {"message": "Processo atualizado com sucesso"}

@router.delete("/processos/{processo_id}")
async def excluir_processo(
    processo_id: str,
    current_user: dict = Depends(get_current_user_jwt)
):
    """Exclui processo (soft delete)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    await db.processos_juridicos.update_one(
        {"id": processo_id},
        {"$set": {
            "ativo": False,
            "excluido_por": current_user.get("email", ""),
            "excluido_em": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Processo excluído com sucesso"}

# ==================== PRAZOS E ALERTAS ====================

@router.post("/processos/{processo_id}/prazos")
async def adicionar_prazo(
    processo_id: str,
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Adiciona prazo ao processo"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    prazo_id = str(uuid.uuid4())
    prazo = {
        "id": prazo_id,
        "tipo": data.get("tipo", ""),
        "descricao": data.get("descricao", ""),
        "data_prazo": data.get("data_prazo", ""),
        "data_alerta_1": data.get("data_alerta_1", ""),  # D-3
        "data_alerta_2": data.get("data_alerta_2", ""),  # D-1
        "status": "pendente",
        "prioridade": data.get("prioridade", "normal"),
        "responsavel": data.get("responsavel", ""),
        "criado_em": datetime.now(timezone.utc).isoformat()
    }
    
    await db.processos_juridicos.update_one(
        {"id": processo_id},
        {"$push": {"prazos_pendentes": prazo}}
    )
    
    await criar_evento_timeline(
        processo_id,
        "prazo",
        f"Prazo adicionado: {prazo['descricao']}",
        current_user
    )
    
    return {"message": "Prazo adicionado com sucesso", "id": prazo_id}

@router.get("/prazos/vencendo")
async def prazos_vencendo(
    dias: int = 7,
    current_user: dict = Depends(get_current_user_jwt)
):
    """Lista prazos vencendo nos próximos N dias"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    data_limite = (datetime.now(timezone.utc) + timedelta(days=dias)).isoformat()
    
    processos = await db.processos_juridicos.find(
        {
            "ativo": True,
            "prazos_pendentes.status": "pendente",
            "prazos_pendentes.data_prazo": {"$lte": data_limite}
        },
        {"_id": 0, "id": 1, "numero_processo": 1, "titulo": 1, "prazos_pendentes": 1}
    ).to_list(100)
    
    prazos = []
    for processo in processos:
        for prazo in processo.get("prazos_pendentes", []):
            if prazo.get("status") == "pendente" and prazo.get("data_prazo", "") <= data_limite:
                prazos.append({
                    **prazo,
                    "processo_id": processo["id"],
                    "processo_numero": processo["numero_processo"],
                    "processo_titulo": processo["titulo"]
                })
    
    return {"prazos": sorted(prazos, key=lambda x: x.get("data_prazo", ""))}

# ==================== MOVIMENTAÇÕES PROCESSUAIS ====================

@router.post("/processos/{processo_id}/movimentacoes")
async def adicionar_movimentacao(
    processo_id: str,
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Adiciona movimentação processual"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    movimentacao_id = str(uuid.uuid4())
    movimentacao = {
        "id": movimentacao_id,
        "tipo": data.get("tipo", ""),
        "descricao": data.get("descricao", ""),
        "data": data.get("data", datetime.now(timezone.utc).isoformat()),
        "detalhes": data.get("detalhes", ""),
        "documentos": data.get("documentos", []),
        "registrado_por": current_user.get("email", ""),
        "registrado_em": datetime.now(timezone.utc).isoformat()
    }
    
    await db.processos_juridicos.update_one(
        {"id": processo_id},
        {"$push": {"movimentacoes": movimentacao}}
    )
    
    await criar_evento_timeline(
        processo_id,
        "movimentacao",
        f"Movimentação: {movimentacao['tipo']}",
        current_user
    )
    
    return {"message": "Movimentação adicionada com sucesso", "id": movimentacao_id}

# ==================== PETIÇÕES E DOCUMENTOS ====================

@router.post("/processos/{processo_id}/peticoes")
async def adicionar_peticao(
    processo_id: str,
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user_jwt)
):
    """Adiciona petição ao processo"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    peticao_id = str(uuid.uuid4())
    peticao = {
        "id": peticao_id,
        "tipo": data.get("tipo", ""),
        "titulo": data.get("titulo", ""),
        "conteudo": data.get("conteudo", ""),
        "protocolo": data.get("protocolo", ""),
        "data_protocolo": data.get("data_protocolo", ""),
        "arquivo_url": data.get("arquivo_url", ""),
        "status": data.get("status", "rascunho"),
        "criado_por": current_user.get("email", ""),
        "criado_em": datetime.now(timezone.utc).isoformat()
    }
    
    await db.processos_juridicos.update_one(
        {"id": processo_id},
        {"$push": {"peticoes": peticao}}
    )
    
    await criar_evento_timeline(
        processo_id,
        "peticao",
        f"Petição criada: {peticao['titulo']}",
        current_user
    )
    
    return {"message": "Petição adicionada com sucesso", "id": peticao_id}

# ==================== ESTATÍSTICAS ====================

@router.get("/estatisticas")
async def obter_estatisticas(
    current_user: dict = Depends(get_current_user_jwt)
):
    """Retorna estatísticas do módulo jurídico"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Total de processos
    total_processos = await db.processos_juridicos.count_documents({"ativo": True})
    
    # Por status
    processos_ativos = await db.processos_juridicos.count_documents(
        {"ativo": True, "status": "ativo"}
    )
    processos_arquivados = await db.processos_juridicos.count_documents(
        {"ativo": True, "status": "arquivado"}
    )
    processos_ganhos = await db.processos_juridicos.count_documents(
        {"ativo": True, "status": "ganho"}
    )
    processos_perdidos = await db.processos_juridicos.count_documents(
        {"ativo": True, "status": "perdido"}
    )
    
    # Por tipo
    processos_civel = await db.processos_juridicos.count_documents(
        {"ativo": True, "tipo": "civel"}
    )
    processos_criminal = await db.processos_juridicos.count_documents(
        {"ativo": True, "tipo": "criminal"}
    )
    processos_trabalhista = await db.processos_juridicos.count_documents(
        {"ativo": True, "tipo": "trabalhista"}
    )
    
    # Valores
    pipeline = [
        {"$match": {"ativo": True}},
        {"$group": {
            "_id": None,
            "valor_total_causas": {"$sum": "$valor_causa"},
            "valor_total_condenacoes": {"$sum": "$valor_condenacao"},
            "valor_total_honorarios": {"$sum": "$honorarios_acordados"}
        }}
    ]
    valores = await db.processos_juridicos.aggregate(pipeline).to_list(1)
    valores_data = valores[0] if valores else {
        "valor_total_causas": 0,
        "valor_total_condenacoes": 0,
        "valor_total_honorarios": 0
    }
    
    # Prazos vencendo
    data_limite = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
    processos_prazos = await db.processos_juridicos.find(
        {
            "ativo": True,
            "prazos_pendentes.status": "pendente",
            "prazos_pendentes.data_prazo": {"$lte": data_limite}
        }
    ).to_list(100)
    
    prazos_vencendo = 0
    for p in processos_prazos:
        for prazo in p.get("prazos_pendentes", []):
            if prazo.get("status") == "pendente" and prazo.get("data_prazo", "") <= data_limite:
                prazos_vencendo += 1
    
    return {
        "total_processos": total_processos,
        "processos_ativos": processos_ativos,
        "processos_arquivados": processos_arquivados,
        "processos_ganhos": processos_ganhos,
        "processos_perdidos": processos_perdidos,
        "processos_civel": processos_civel,
        "processos_criminal": processos_criminal,
        "processos_trabalhista": processos_trabalhista,
        "valor_total_causas": valores_data.get("valor_total_causas", 0),
        "valor_total_condenacoes": valores_data.get("valor_total_condenacoes", 0),
        "valor_total_honorarios": valores_data.get("valor_total_honorarios", 0),
        "prazos_vencendo_7_dias": prazos_vencendo,
        "taxa_exito": round((processos_ganhos / max(total_processos, 1)) * 100, 2)
    }

# ==================== HELPERS ====================

async def criar_evento_timeline(processo_id: str, tipo: str, descricao: str, user: dict):
    """Cria evento na timeline do processo"""
    evento = {
        "id": str(uuid.uuid4()),
        "processo_id": processo_id,
        "tipo": tipo,
        "descricao": descricao,
        "usuario": user.get("name", ""),
        "usuario_email": user.get("email", ""),
        "data": datetime.now(timezone.utc).isoformat()
    }
    
    await db.processo_timeline.insert_one(evento)
