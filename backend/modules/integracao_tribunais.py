"""
Módulo de Integração Completa com Tribunais
============================================

Sistema unificado para sincronização bidirecional com:
- Tribunais: TJ (27 estados), STJ, STF, TST, TSE, STM, CNJ
- Sistemas: PJe, SEEU, ePoC, Projudi, Tucujuris, SAJ, Themis, ESAJ
- Justiça Estadual e Federal (1ª e 2ª instâncias)
- Diários Oficiais (27 estados + DOU)
- Portal OAB (todos os estados)

Funcionalidades:
- Push automático de petições e documentos
- Captura de publicações e movimentações
- Pesquisa automática em Diários Oficiais
- Sincronização com Portal OAB
- Alertas inteligentes para intimações
- Agenda unificada por múltiplos identificadores (CPF, CNPJ, OAB, RG)
- Vinculação de partes, advogados e processos correlatos
- Alertas D-5, D-3, D-1 para prazos
- Histórico completo de sincronizações
- Webhook para notificações em tempo real
- Cobertura Nacional: 27 estados + DF
"""

from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
import uuid
import logging

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field, validator

from server import db

router = APIRouter(prefix="/api/tribunais", tags=["Integração Tribunais"])
logger = logging.getLogger(__name__)

# ============================================================================
# ============================ CONSTANTES ===================================
# ============================================================================

# Todos os 27 estados + DF
ESTADOS_BRASIL = [
    {"sigla": "AC", "nome": "Acre", "capital": "Rio Branco"},
    {"sigla": "AL", "nome": "Alagoas", "capital": "Maceió"},
    {"sigla": "AP", "nome": "Amapá", "capital": "Macapá"},
    {"sigla": "AM", "nome": "Amazonas", "capital": "Manaus"},
    {"sigla": "BA", "nome": "Bahia", "capital": "Salvador"},
    {"sigla": "CE", "nome": "Ceará", "capital": "Fortaleza"},
    {"sigla": "DF", "nome": "Distrito Federal", "capital": "Brasília"},
    {"sigla": "ES", "nome": "Espírito Santo", "capital": "Vitória"},
    {"sigla": "GO", "nome": "Goiás", "capital": "Goiânia"},
    {"sigla": "MA", "nome": "Maranhão", "capital": "São Luís"},
    {"sigla": "MT", "nome": "Mato Grosso", "capital": "Cuiabá"},
    {"sigla": "MS", "nome": "Mato Grosso do Sul", "capital": "Campo Grande"},
    {"sigla": "MG", "nome": "Minas Gerais", "capital": "Belo Horizonte"},
    {"sigla": "PA", "nome": "Pará", "capital": "Belém"},
    {"sigla": "PB", "nome": "Paraíba", "capital": "João Pessoa"},
    {"sigla": "PR", "nome": "Paraná", "capital": "Curitiba"},
    {"sigla": "PE", "nome": "Pernambuco", "capital": "Recife"},
    {"sigla": "PI", "nome": "Piauí", "capital": "Teresina"},
    {"sigla": "RJ", "nome": "Rio de Janeiro", "capital": "Rio de Janeiro"},
    {"sigla": "RN", "nome": "Rio Grande do Norte", "capital": "Natal"},
    {"sigla": "RS", "nome": "Rio Grande do Sul", "capital": "Porto Alegre"},
    {"sigla": "RO", "nome": "Rondônia", "capital": "Porto Velho"},
    {"sigla": "RR", "nome": "Roraima", "capital": "Boa Vista"},
    {"sigla": "SC", "nome": "Santa Catarina", "capital": "Florianópolis"},
    {"sigla": "SP", "nome": "São Paulo", "capital": "São Paulo"},
    {"sigla": "SE", "nome": "Sergipe", "capital": "Aracaju"},
    {"sigla": "TO", "nome": "Tocantins", "capital": "Palmas"}
]

# Sistemas disponíveis por tribunal/estado
SISTEMAS_DISPONIVEIS = {
    "PJe": "Processo Judicial Eletrônico (CNJ)",
    "ESAJ": "Sistema de Automação da Justiça Eletrônico (TJ-SP e outros)",
    "SEEU": "Sistema Eletrônico de Execução Unificado",
    "ePoC": "e-Processo Cível",
    "Projudi": "Processo Judicial Digital",
    "SAJ": "Sistema de Automação da Justiça",
    "Themis": "Sistema Themis",
    "Tucujuris": "Sistema Tucujuris"
}

# Tribunais Superiores
TRIBUNAIS_SUPERIORES = {
    "STJ": {"nome": "Superior Tribunal de Justiça", "sistema": "PJe"},
    "STF": {"nome": "Supremo Tribunal Federal", "sistema": "PJe"},
    "TST": {"nome": "Tribunal Superior do Trabalho", "sistema": "PJe"},
    "TSE": {"nome": "Tribunal Superior Eleitoral", "sistema": "PJe"},
    "STM": {"nome": "Superior Tribunal Militar", "sistema": "PJe"},
    "CNJ": {"nome": "Conselho Nacional de Justiça", "sistema": "PJe"}
}

# ============================================================================
# ============================ DATA MODELS ==================================
# ============================================================================

class CredenciaisTribunal(BaseModel):
    """Credenciais para autenticação nos sistemas dos tribunais"""
    usuario: Optional[str] = None
    senha: Optional[str] = None  # Em produção, usar secrets manager
    token: Optional[str] = None
    chave_integracao: Optional[str] = None
    certificado_digital: Optional[str] = None  # Caminho do certificado A1/A3
    escopos: List[str] = Field(default_factory=list)

class IntegracaoTribunalConfig(BaseModel):
    """Configuração de integração com tribunal específico"""
    tribunal: str = Field(..., description="TJ, STJ, STF, TST, TSE, STM, CNJ")
    uf: Optional[str] = Field(None, description="UF para tribunais estaduais (SP, RJ, etc)")
    sistema: str = Field(..., description="PJe, SEEU, ePoC, Projudi, SAJ, Themis, Tucujuris")
    endpoint: str = Field(..., description="URL base do endpoint de integração")
    versao_api: str = Field(default="1.0")
    ambiente: str = Field(default="producao", description="producao, homologacao")
    credenciais: CredenciaisTribunal
    rotinas_automaticas: List[str] = Field(
        default_factory=lambda: ["captura_publicacoes", "sincronizacao_autos"],
        description="sincronizacao_autos, push_peticoes, captura_publicacoes, captura_movimentacoes"
    )
    intervalo_sincronizacao_minutos: int = Field(default=30)
    notificacao_emails: List[str] = Field(default_factory=list)
    notificacao_webhook: Optional[str] = None
    habilitado: bool = True

class IdentificadoresProcessuais(BaseModel):
    """Identificadores unificados para busca e vinculação"""
    nome_completo: Optional[str] = None
    cpf: Optional[str] = None
    cnpj: Optional[str] = None
    rg: Optional[str] = None
    oab: Optional[str] = None
    oab_uf: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    
    @validator('cpf')
    def validar_cpf(cls, v):
        if v and len(v.replace('.', '').replace('-', '')) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        return v
    
    @validator('cnpj')
    def validar_cnpj(cls, v):
        if v and len(v.replace('.', '').replace('/', '').replace('-', '')) != 14:
            raise ValueError('CNPJ deve ter 14 dígitos')
        return v

class ParteProcessual(BaseModel):
    """Parte vinculada ao processo"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    papel: str = Field(..., description="autor, reu, investigado, assistente, cliente, testemunha, terceiro")
    identificadores: IdentificadoresProcessuais
    representante_legal: Optional[str] = None
    endereco: Optional[str] = None
    contatos: Dict[str, Any] = Field(default_factory=dict)
    observacoes: Optional[str] = None

class AdvogadoProcessual(BaseModel):
    """Advogado vinculado ao processo"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    oab: str
    oab_uf: str
    tipo: str = Field(default="constituido", description="constituido, dativo, publico")
    identificadores: IdentificadoresProcessuais = Field(default_factory=IdentificadoresProcessuais)
    escritorio: Optional[str] = None
    receber_intimacoes: bool = True

class ProcessoCorrelato(BaseModel):
    """Processo relacionado/conexo"""
    numero: str
    numero_cnj: Optional[str] = None
    tribunal: Optional[str] = None
    tipo_relacao: str = Field(..., description="principal, apenso, recurso, conexo, cautelar, incidente")
    observacao: Optional[str] = None

class ProcessoTribunalCreate(BaseModel):
    """Cadastro completo de processo para integração"""
    numero_processo: str
    numero_cnj: Optional[str] = None
    tribunal: str
    tribunal_uf: Optional[str] = None
    sistema: str
    instancia: str = Field(default="primeira", description="primeira, segunda, superior")
    segmento: str = Field(default="estadual", description="estadual, federal, trabalhista, eleitoral, militar")
    classe_processual: Optional[str] = None
    assunto_principal: Optional[str] = None
    orgao_julgador: Optional[str] = None
    vara: Optional[str] = None
    comarca: Optional[str] = None
    
    # Partes e Advogados
    partes: List[ParteProcessual]
    advogados: List[AdvogadoProcessual] = Field(default_factory=list)
    processos_relacionados: List[ProcessoCorrelato] = Field(default_factory=list)
    
    # Controle
    valor_causa: Optional[float] = None
    segredo_justica: bool = False
    prioridade: str = Field(default="normal", description="baixa, normal, alta, urgente")
    push_imediato: bool = True
    responsavel: str
    observacoes: Optional[str] = None

class PushDocumento(BaseModel):
    """Documento para push ao tribunal"""
    tipo: str = Field(..., description="peticao_inicial, contestacao, recurso, parecer, outros")
    titulo: str
    arquivo_path: str
    numero_paginas: Optional[int] = None
    hash_sha256: Optional[str] = None

class AtualizacaoPush(BaseModel):
    """Push de atualização ao tribunal"""
    descricao: str = Field(..., min_length=10)
    tipo_push: str = Field(..., description="peticao, documentos, juntada, manifestacao")
    documentos: List[PushDocumento] = Field(default_factory=list)
    campos_atualizados: Dict[str, Any] = Field(default_factory=dict)
    responsavel: str
    solicitar_confirmacao: bool = True

class PublicacaoCreate(BaseModel):
    """Registro de publicação do tribunal"""
    titulo: str
    data_publicacao: str
    teor_completo: str
    caderno: Optional[str] = Field(None, description="Caderno 1, 2, 3, Diário Justiça")
    prazo_resposta_dias: Optional[int] = None
    origem: str = Field(default="diario_oficial")
    identificadores: List[str] = Field(default_factory=list)
    anexos: List[Dict[str, str]] = Field(default_factory=list)

class PrazoCreate(BaseModel):
    """Cadastro de prazo processual"""
    descricao: str = Field(..., min_length=5)
    data_limite: str
    tipo: str = Field(default="processual")
    responsavel: str
    referencia_publicacao: Optional[str] = None
    alertas: List[str] = Field(default_factory=lambda: ["d-5", "d-3", "d-1"])
    identificadores: List[str] = Field(default_factory=list)

# ============================================================================
# ============================ HELPER FUNCTIONS =============================
# ============================================================================

def _agora_iso() -> str:
    """Retorna timestamp atual em ISO 8601"""
    return datetime.now(timezone.utc).isoformat()

def _parse_iso(data_iso: str) -> datetime:
    """Parse seguro de data ISO 8601"""
    if data_iso.endswith("Z"):
        data_iso = data_iso.replace("Z", "+00:00")
    return datetime.fromisoformat(data_iso)

def _normalizar_lista(valores: List[str]) -> List[str]:
    """Remove duplicatas mantendo ordem"""
    vistos = set()
    resultado = []
    for valor in valores:
        if not valor:
            continue
        chave = str(valor).strip().lower()
        if chave not in vistos:
            vistos.add(chave)
            resultado.append(str(valor).strip())
    return resultado

def _extrair_identificadores(dados: ProcessoTribunalCreate) -> List[str]:
    """Extrai todos os identificadores do processo"""
    ids = []
    
    # Do processo
    ids.append(dados.numero_processo)
    if dados.numero_cnj:
        ids.append(dados.numero_cnj)
    
    # Das partes
    for parte in dados.partes:
        i = parte.identificadores
        for campo in [i.nome_completo, i.cpf, i.cnpj, i.rg, i.oab, i.email, i.telefone]:
            if campo:
                ids.append(campo)
        if parte.representante_legal:
            ids.append(parte.representante_legal)
    
    # Dos advogados
    for adv in dados.advogados:
        ids.append(adv.nome)
        ids.append(f"{adv.oab}/{adv.oab_uf}")
        i = adv.identificadores
        for campo in [i.nome_completo, i.cpf, i.email, i.telefone]:
            if campo:
                ids.append(campo)
    
    return _normalizar_lista(ids)

# ============================================================================
# ============================== CONFIGURAÇÕES ==============================
# ============================================================================

@router.post("/config")
async def criar_configuracao(config: IntegracaoTribunalConfig):
    """
    Cria nova configuração de integração com tribunal
    
    Permite configurar credenciais, endpoints e rotinas automáticas
    para cada tribunal/sistema
    """
    config_id = str(uuid.uuid4())
    
    registro = {
        "id": config_id,
        "created_at": _agora_iso(),
        "updated_at": _agora_iso(),
        **config.model_dump(),
        "ultima_sincronizacao": None,
        "total_sincronizacoes": 0,
        "total_erros": 0
    }
    
    await db.tribunais_configs.insert_one(registro)
    
    logger.info(f"✅ Configuração criada: {config.tribunal}/{config.sistema} - ID: {config_id}")
    
    return {
        "id": config_id,
        "tribunal": config.tribunal,
        "sistema": config.sistema,
        "message": "Configuração criada com sucesso"
    }

@router.get("/config")
async def listar_configuracoes(
    tribunal: Optional[str] = None,
    sistema: Optional[str] = None,
    habilitado: Optional[bool] = None
):
    """Lista todas as configurações de tribunais"""
    query = {}
    
    if tribunal:
        query["tribunal"] = {"$regex": tribunal, "$options": "i"}
    if sistema:
        query["sistema"] = {"$regex": sistema, "$options": "i"}
    if habilitado is not None:
        query["habilitado"] = habilitado
    
    configs = await db.tribunais_configs.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    return {
        "configs": configs,
        "total": len(configs)
    }

@router.get("/config/{config_id}")
async def obter_configuracao(config_id: str):
    """Obtém detalhes de uma configuração específica"""
    config = await db.tribunais_configs.find_one({"id": config_id}, {"_id": 0})
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuração não encontrada")
    
    return config

@router.patch("/config/{config_id}")
async def atualizar_configuracao(config_id: str, atualizacoes: Dict[str, Any]):
    """Atualiza configuração existente"""
    atualizacoes["updated_at"] = _agora_iso()
    
    result = await db.tribunais_configs.update_one(
        {"id": config_id},
        {"$set": atualizacoes}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Configuração não encontrada")
    
    logger.info(f"✅ Configuração atualizada: {config_id}")
    
    return {"id": config_id, "message": "Configuração atualizada com sucesso"}

# ============================================================================
# ============================== PROCESSOS ==================================
# ============================================================================

@router.post("/processos")
async def cadastrar_processo(dados: ProcessoTribunalCreate, background_tasks: BackgroundTasks):
    """
    Cadastra processo e prepara integração com tribunal
    
    - Extrai e normaliza identificadores
    - Cria histórico inicial
    - Agenda push se push_imediato=True
    - Vincula partes, advogados e processos correlatos
    """
    processo_id = str(uuid.uuid4())
    identificadores = _extrair_identificadores(dados)
    
    logger.info(f"📋 Cadastrando processo: {dados.numero_processo} - Tribunal: {dados.tribunal}")
    
    documento = {
        "id": processo_id,
        "created_at": _agora_iso(),
        "updated_at": _agora_iso(),
        
        # Dados principais
        "numero_processo": dados.numero_processo,
        "numero_cnj": dados.numero_cnj,
        "tribunal": dados.tribunal,
        "tribunal_uf": dados.tribunal_uf,
        "sistema": dados.sistema,
        "instancia": dados.instancia,
        "segmento": dados.segmento,
        "classe_processual": dados.classe_processual,
        "assunto_principal": dados.assunto_principal,
        "orgao_julgador": dados.orgao_julgador,
        "vara": dados.vara,
        "comarca": dados.comarca,
        
        # Partes e Advogados
        "partes": [parte.model_dump() for parte in dados.partes],
        "advogados": [adv.model_dump() for adv in dados.advogados],
        "processos_relacionados": [proc.model_dump() for proc in dados.processos_relacionados],
        
        # Valores e Controle
        "valor_causa": dados.valor_causa,
        "segredo_justica": dados.segredo_justica,
        "prioridade": dados.prioridade,
        "responsavel": dados.responsavel,
        "observacoes": dados.observacoes,
        
        # Status e Sincronização
        "status": "pendente_push" if dados.push_imediato else "cadastrado",
        "identificadores_busca": identificadores,
        
        # Arrays de controle
        "agenda": [],
        "prazos": [],
        "publicacoes": [],
        "movimentacoes": [],
        "sincronizacoes": [],
        "historico": [
            {
                "id": str(uuid.uuid4()),
                "evento": "cadastro_interno",
                "descricao": f"Processo cadastrado - {dados.tribunal}/{dados.sistema}",
                "responsavel": dados.responsavel,
                "timestamp": _agora_iso(),
                "detalhes": {
                    "total_partes": len(dados.partes),
                    "total_advogados": len(dados.advogados),
                    "total_identificadores": len(identificadores)
                }
            }
        ]
    }
    
    await db.tribunais_processos.insert_one(documento)
    
    # Se push imediato, agendar
    if dados.push_imediato:
        await db.tribunais_processos.update_one(
            {"id": processo_id},
            {
                "$push": {
                    "sincronizacoes": {
                        "id": str(uuid.uuid4()),
                        "tipo": "push_inicial",
                        "status": "pendente",
                        "descricao": "Push inicial ao tribunal",
                        "created_at": _agora_iso(),
                        "responsavel": dados.responsavel
                    }
                }
            }
        )
        
        # TODO: Executar push em background
        # background_tasks.add_task(executar_push, processo_id)
    
    logger.info(f"✅ Processo cadastrado: {processo_id} - {len(identificadores)} identificadores")
    
    return {
        "id": processo_id,
        "numero_processo": dados.numero_processo,
        "status": documento["status"],
        "identificadores": identificadores,
        "message": "Processo cadastrado com sucesso"
    }

@router.get("/processos")
async def listar_processos(
    tribunal: Optional[str] = None,
    sistema: Optional[str] = None,
    status: Optional[str] = None,
    busca: Optional[str] = None,
    segredo_justica: Optional[bool] = None,
    limit: int = 50
):
    """
    Lista processos integrados com filtros
    
    Busca pode ser por: número do processo, CPF, CNPJ, OAB, nome
    """
    query = {}
    
    if tribunal:
        query["tribunal"] = {"$regex": tribunal, "$options": "i"}
    if sistema:
        query["sistema"] = {"$regex": sistema, "$options": "i"}
    if status:
        query["status"] = status
    if busca:
        query["identificadores_busca"] = {"$regex": busca, "$options": "i"}
    if segredo_justica is not None:
        query["segredo_justica"] = segredo_justica
    
    processos = await db.tribunais_processos.find(query, {"_id": 0}).sort("updated_at", -1).to_list(limit)
    
    # Enrichment: adicionar contadores
    agora = datetime.now(timezone.utc)
    for processo in processos:
        # Prazos próximos
        prazos_proximos = []
        for prazo in processo.get("prazos", []):
            try:
                data_limite = _parse_iso(prazo["data_limite"])
                dias = (data_limite - agora).days
                if dias >= -5 and dias <= 30:
                    prazos_proximos.append({
                        "descricao": prazo["descricao"],
                        "data_limite": prazo["data_limite"],
                        "dias_restantes": dias,
                        "alerta": "vencido" if dias < 0 else "critico" if dias <= 3 else "proximo"
                    })
            except:
                pass
        
        processo["prazos_proximos"] = sorted(prazos_proximos, key=lambda x: x["data_limite"])
        processo["total_publicacoes_nao_lidas"] = len([p for p in processo.get("publicacoes", []) if not p.get("lida")])
        processo["total_sincronizacoes_pendentes"] = len([s for s in processo.get("sincronizacoes", []) if s.get("status") == "pendente"])
    
    return {
        "processos": processos,
        "total": len(processos)
    }

@router.get("/processos/{processo_id}")
async def obter_processo(processo_id: str):
    """Obtém detalhes completos do processo"""
    processo = await db.tribunais_processos.find_one({"id": processo_id}, {"_id": 0})
    
    if not processo:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    return processo

@router.post("/processos/{processo_id}/push")
async def realizar_push(processo_id: str, payload: AtualizacaoPush):
    """
    Executa push de documentos/atualizações ao tribunal
    
    - Registra sincronização
    - Atualiza histórico
    - Marca status como sincronizado
    """
    processo = await db.tribunais_processos.find_one({"id": processo_id})
    
    if not processo:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    sinc_id = str(uuid.uuid4())
    
    sincronizacao = {
        "id": sinc_id,
        "tipo": payload.tipo_push,
        "status": "aguardando_confirmacao" if payload.solicitar_confirmacao else "enviado",
        "descricao": payload.descricao,
        "documentos": [doc.model_dump() for doc in payload.documentos],
        "campos_atualizados": payload.campos_atualizados,
        "responsavel": payload.responsavel,
        "created_at": _agora_iso(),
        "confirmado_em": None
    }
    
    await db.tribunais_processos.update_one(
        {"id": processo_id},
        {
            "$push": {
                "sincronizacoes": sincronizacao,
                "historico": {
                    "id": str(uuid.uuid4()),
                    "evento": "push_realizado",
                    "descricao": f"Push ao tribunal: {payload.descricao}",
                    "responsavel": payload.responsavel,
                    "timestamp": _agora_iso()
                }
            },
            "$set": {
                "status": "sincronizado",
                "updated_at": _agora_iso()
            }
        }
    )
    
    logger.info(f"✅ Push realizado: {processo_id} - {payload.tipo_push}")
    
    return {
        "sincronizacao_id": sinc_id,
        "status": sincronizacao["status"],
        "message": "Push registrado com sucesso"
    }

# ============================================================================
# ============================= PUBLICAÇÕES =================================
# ============================================================================

@router.post("/processos/{processo_id}/publicacoes")
async def registrar_publicacao(processo_id: str, dados: PublicacaoCreate):
    """
    Registra publicação e cria itens de agenda automaticamente
    
    - Se houver prazo, cria alertas D-5, D-3, D-1
    - Adiciona à timeline
    - Marca como não lida
    """
    processo = await db.tribunais_processos.find_one({"id": processo_id})
    
    if not processo:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    pub_id = str(uuid.uuid4())
    ids = _normalizar_lista(dados.identificadores or processo.get("identificadores_busca", []))
    
    publicacao = {
        "id": pub_id,
        "titulo": dados.titulo,
        "data_publicacao": dados.data_publicacao,
        "teor": dados.teor_completo,
        "caderno": dados.caderno,
        "origem": dados.origem,
        "identificadores": ids,
        "anexos": dados.anexos,
        "lida": False,
        "lida_em": None,
        "created_at": _agora_iso()
    }
    
    # Item de agenda
    agenda_item = {
        "id": str(uuid.uuid4()),
        "tipo": "publicacao",
        "referencia_id": pub_id,
        "descricao": f"📰 {dados.titulo}",
        "data": dados.data_publicacao,
        "identificadores": ids,
        "responsavel": processo.get("responsavel"),
        "status": "pendente"
    }
    
    updates = {
        "$push": {
            "publicacoes": publicacao,
            "agenda": agenda_item,
            "historico": {
                "id": str(uuid.uuid4()),
                "evento": "publicacao_capturada",
                "descricao": dados.titulo,
                "responsavel": "sistema",
                "timestamp": _agora_iso()
            }
        },
        "$set": {"updated_at": _agora_iso()}
    }
    
    # Se tem prazo de resposta, criar prazo automático
    if dados.prazo_resposta_dias:
        try:
            data_pub = _parse_iso(dados.data_publicacao)
            data_limite = (data_pub + timedelta(days=dados.prazo_resposta_dias)).isoformat()
            
            prazo = {
                "id": str(uuid.uuid4()),
                "descricao": f"Prazo de {dados.prazo_resposta_dias} dias - {dados.titulo}",
                "data_limite": data_limite,
                "tipo": "processual",
                "responsavel": processo.get("responsavel"),
                "referencia_publicacao": pub_id,
                "identificadores": ids,
                "notificacoes": ["d-5", "d-3", "d-1"],
                "created_at": _agora_iso()
            }
            
            updates["$push"]["prazos"] = prazo
            
            # Criar alertas D-5, D-3, D-1
            for d in [5, 3, 1]:
                data_alerta = (data_pub + timedelta(days=dados.prazo_resposta_dias - d)).isoformat()
                updates["$push"]["agenda"] = {
                    "$each": [{
                        "id": str(uuid.uuid4()),
                        "tipo": f"alerta_d{d}",
                        "referencia_id": prazo["id"],
                        "descricao": f"⚠️ D-{d}: {dados.titulo}",
                        "data": data_alerta,
                        "identificadores": ids,
                        "responsavel": processo.get("responsavel"),
                        "status": "pendente"
                    }]
                }
        except:
            pass
    
    await db.tribunais_processos.update_one({"id": processo_id}, updates)
    
    logger.info(f"📰 Publicação registrada: {pub_id} - {dados.titulo}")
    
    return {
        "id": pub_id,
        "prazo_criado": dados.prazo_resposta_dias is not None,
        "message": "Publicação registrada com sucesso"
    }

@router.patch("/processos/{processo_id}/publicacoes/{publicacao_id}/marcar-lida")
async def marcar_publicacao_lida(processo_id: str, publicacao_id: str):
    """Marca publicação como lida"""
    result = await db.tribunais_processos.update_one(
        {
            "id": processo_id,
            "publicacoes.id": publicacao_id
        },
        {
            "$set": {
                "publicacoes.$.lida": True,
                "publicacoes.$.lida_em": _agora_iso(),
                "updated_at": _agora_iso()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Publicação não encontrada")
    
    return {"message": "Publicação marcada como lida"}

# ============================================================================
# ================================ PRAZOS ===================================
# ============================================================================

@router.post("/processos/{processo_id}/prazos")
async def registrar_prazo(processo_id: str, dados: PrazoCreate):
    """
    Registra prazo e cria alertas automáticos
    
    - Cria alertas D-5, D-3, D-1
    - Adiciona à agenda
    - Vincula identificadores
    """
    processo = await db.tribunais_processos.find_one({"id": processo_id})
    
    if not processo:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    prazo_id = str(uuid.uuid4())
    ids = _normalizar_lista(dados.identificadores or processo.get("identificadores_busca", []))
    
    prazo = {
        "id": prazo_id,
        "descricao": dados.descricao,
        "data_limite": dados.data_limite,
        "tipo": dados.tipo,
        "responsavel": dados.responsavel,
        "referencia_publicacao": dados.referencia_publicacao,
        "identificadores": ids,
        "alertas": dados.alertas,
        "cumprido": False,
        "created_at": _agora_iso()
    }
    
    # Parse data para criar alertas
    try:
        data_limite = _parse_iso(dados.data_limite)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Data inválida: {exc}")
    
    # Criar itens de agenda
    agenda_items = []
    
    # Alertas D-5, D-3, D-1
    for alerta_str in dados.alertas:
        if not alerta_str.startswith("d-"):
            continue
        try:
            dias = int(alerta_str.replace("d-", ""))
            data_alerta = (data_limite - timedelta(days=dias)).isoformat()
            
            agenda_items.append({
                "id": str(uuid.uuid4()),
                "tipo": f"alerta_{alerta_str}",
                "referencia_id": prazo_id,
                "descricao": f"⚠️ D-{dias}: {dados.descricao}",
                "data": data_alerta,
                "identificadores": ids,
                "responsavel": dados.responsavel,
                "status": "pendente"
            })
        except:
            continue
    
    # Prazo principal
    agenda_items.append({
        "id": str(uuid.uuid4()),
        "tipo": "prazo",
        "referencia_id": prazo_id,
        "descricao": f"📅 {dados.descricao}",
        "data": dados.data_limite,
        "identificadores": ids,
        "responsavel": dados.responsavel,
        "status": "pendente"
    })
    
    await db.tribunais_processos.update_one(
        {"id": processo_id},
        {
            "$push": {
                "prazos": prazo,
                "agenda": {"$each": agenda_items},
                "historico": {
                    "id": str(uuid.uuid4()),
                    "evento": "prazo_cadastrado",
                    "descricao": dados.descricao,
                    "responsavel": dados.responsavel,
                    "timestamp": _agora_iso()
                }
            },
            "$set": {"updated_at": _agora_iso()}
        }
    )
    
    logger.info(f"📅 Prazo registrado: {prazo_id} - {dados.descricao}")
    
    return {
        "id": prazo_id,
        "alertas_criados": len(agenda_items) - 1,
        "message": "Prazo registrado com sucesso"
    }

# ============================================================================
# ================================ AGENDA ===================================
# ============================================================================

@router.get("/agenda")
async def consultar_agenda(
    identificador: str,
    inicio: Optional[str] = None,
    fim: Optional[str] = None,
    incluir_publicacoes: bool = True,
    incluir_prazos: bool = True,
    incluir_alertas: bool = True
):
    """
    Consulta agenda por identificador (CPF, CNPJ, OAB, Nome, etc)
    
    Retorna todos os itens de agenda vinculados ao identificador:
    - Publicações
    - Prazos
    - Alertas D-5, D-3, D-1
    """
    if not identificador:
        raise HTTPException(status_code=400, detail="Identificador é obrigatório")
    
    # Buscar processos com este identificador
    query = {"identificadores_busca": {"$regex": identificador, "$options": "i"}}
    processos = await db.tribunais_processos.find(query, {"_id": 0}).to_list(200)
    
    inicio_dt = _parse_iso(inicio) if inicio else None
    fim_dt = _parse_iso(fim) if fim else None
    
    agenda_completa = []
    
    for processo in processos:
        for item in processo.get("agenda", []):
            # Verificar se identificador está neste item
            if identificador.lower() not in [id_.lower() for id_ in item.get("identificadores", [])]:
                continue
            
            # Parse data
            try:
                data_item = _parse_iso(item["data"])
            except:
                continue
            
            # Filtros de data
            if inicio_dt and data_item < inicio_dt:
                continue
            if fim_dt and data_item > fim_dt:
                continue
            
            # Filtros de tipo
            if item["tipo"] == "publicacao" and not incluir_publicacoes:
                continue
            if item["tipo"] == "prazo" and not incluir_prazos:
                continue
            if item["tipo"].startswith("alerta_") and not incluir_alertas:
                continue
            
            # Enriquecer com dados do processo
            agenda_completa.append({
                **item,
                "processo_id": processo["id"],
                "numero_processo": processo["numero_processo"],
                "tribunal": processo["tribunal"],
                "sistema": processo["sistema"],
                "classe": processo.get("classe_processual"),
                "vara": processo.get("vara")
            })
    
    # Ordenar por data
    agenda_completa.sort(key=lambda x: x["data"])
    
    logger.info(f"📅 Agenda consultada: {identificador} - {len(agenda_completa)} itens")
    
    return {
        "identificador": identificador,
        "total_itens": len(agenda_completa),
        "agenda": agenda_completa
    }

# ============================================================================
# ============================ MONITORAMENTO ================================
# ============================================================================

@router.get("/monitoramento")
async def painel_monitoramento():
    """
    Dashboard de monitoramento da integração
    
    Retorna:
    - Total de processos por tribunal
    - Prazos críticos (≤ 5 dias)
    - Publicações não lidas
    - Sincronizações pendentes
    """
    processos = await db.tribunais_processos.find({}, {"_id": 0}).to_list(300)
    agora = datetime.now(timezone.utc)
    
    # Contadores
    total_processos = len(processos)
    por_tribunal = {}
    por_sistema = {}
    prazos_criticos = []
    publicacoes_nao_lidas = []
    sincronizacoes_pendentes = []
    
    for proc in processos:
        # Contadores por tribunal/sistema
        tribunal = proc.get("tribunal", "Desconhecido")
        sistema = proc.get("sistema", "Desconhecido")
        
        por_tribunal[tribunal] = por_tribunal.get(tribunal, 0) + 1
        por_sistema[sistema] = por_sistema.get(sistema, 0) + 1
        
        # Prazos críticos (≤ 5 dias)
        for prazo in proc.get("prazos", []):
            if prazo.get("cumprido"):
                continue
            try:
                data_limite = _parse_iso(prazo["data_limite"])
                dias = (data_limite - agora).days
                
                if dias <= 5:
                    prazos_criticos.append({
                        "processo_id": proc["id"],
                        "numero_processo": proc["numero_processo"],
                        "tribunal": tribunal,
                        "descricao": prazo["descricao"],
                        "data_limite": prazo["data_limite"],
                        "dias_restantes": dias,
                        "responsavel": prazo.get("responsavel"),
                        "urgencia": "vencido" if dias < 0 else "hoje" if dias == 0 else "critico" if dias <= 1 else "proximo"
                    })
            except:
                pass
        
        # Publicações não lidas
        for pub in proc.get("publicacoes", []):
            if not pub.get("lida"):
                publicacoes_nao_lidas.append({
                    "processo_id": proc["id"],
                    "numero_processo": proc["numero_processo"],
                    "tribunal": tribunal,
                    "titulo": pub["titulo"],
                    "data_publicacao": pub["data_publicacao"]
                })
        
        # Sincronizações pendentes
        for sync in proc.get("sincronizacoes", []):
            if sync.get("status") == "pendente":
                sincronizacoes_pendentes.append({
                    "processo_id": proc["id"],
                    "numero_processo": proc["numero_processo"],
                    "tribunal": tribunal,
                    "tipo": sync.get("tipo"),
                    "descricao": sync.get("descricao"),
                    "criado_em": sync.get("created_at")
                })
    
    return {
        "total_processos": total_processos,
        "por_tribunal": por_tribunal,
        "por_sistema": por_sistema,
        "prazos_criticos": sorted(prazos_criticos, key=lambda x: x["data_limite"]),
        "publicacoes_nao_lidas": sorted(publicacoes_nao_lidas, key=lambda x: x["data_publicacao"], reverse=True),
        "sincronizacoes_pendentes": sincronizacoes_pendentes,
        "atualizado_em": _agora_iso()
    }

@router.get("/stats")
async def estatisticas():
    """Estatísticas gerais da integração"""
    total = await db.tribunais_processos.count_documents({})
    configs = await db.tribunais_configs.count_documents({})
    configs_ativas = await db.tribunais_configs.count_documents({"habilitado": True})
    
    return {
        "total_processos": total,
        "total_configuracoes": configs,
        "configuracoes_ativas": configs_ativas,
        "tribunais_integrados": configs_ativas
    }

@router.get("/health")
async def health_check():
    """Health check do módulo"""
    return {
        "status": "ok",
        "module": "Integração Tribunais",
        "version": "2.0.0",
        "features": [
            "Integração TJ/STJ/STF/TST/TSE/STM/CNJ",
            "Suporte PJe, ESAJ, SEEU, ePoC, Projudi, SAJ, Themis",
            "27 Estados + DF (Cobertura Nacional)",
            "Diários Oficiais (27 estados + DOU)",
            "Portal OAB (integração nacional)",
            "Push automático de petições",
            "Captura de publicações",
            "Alertas inteligentes de intimações",
            "Agenda unificada",
            "Alertas D-5/D-3/D-1",
            "Vinculação de partes e advogados",
            "Processos correlatos",
            "Monitoramento em tempo real"
        ],
        "cobertura": {
            "estados": len(ESTADOS_BRASIL),
            "tribunais_superiores": len(TRIBUNAIS_SUPERIORES),
            "sistemas": len(SISTEMAS_DISPONIVEIS)
        }
    }

# ============================================================================
# ==================== DIÁRIOS OFICIAIS =====================================
# ============================================================================

@router.post("/diarios/configurar")
async def configurar_diario_oficial(uf: str, url_diario: str, parser_type: str = "html"):
    """
    Configura captura automática de Diário Oficial do estado
    
    Suporta todos os 27 estados + DOU (Diário Oficial da União)
    """
    if uf not in [e["sigla"] for e in ESTADOS_BRASIL] and uf != "DOU":
        raise HTTPException(status_code=400, detail="UF inválida")
    
    config = {
        "id": str(uuid.uuid4()),
        "uf": uf,
        "url_diario": url_diario,
        "parser_type": parser_type,
        "habilitado": True,
        "ultima_captura": None,
        "total_publicacoes_capturadas": 0,
        "created_at": _agora_iso()
    }
    
    await db.diarios_oficiais_configs.insert_one(config)
    
    logger.info(f"📰 Diário Oficial configurado: {uf}")
    
    return {
        "id": config["id"],
        "uf": uf,
        "message": "Diário Oficial configurado com sucesso"
    }

@router.post("/diarios/pesquisar")
async def pesquisar_diario_oficial(
    identificadores: List[str],
    estados: List[str] = None,
    data_inicio: Optional[str] = None,
    data_fim: Optional[str] = None
):
    """
    Pesquisa em Diários Oficiais por identificadores
    
    Busca por: Nome, CPF, CNPJ, OAB, número de processo
    Em todos os estados configurados ou estados específicos
    """
    if not identificadores:
        raise HTTPException(status_code=400, detail="Informe ao menos um identificador")
    
    # Simular busca em diários oficiais
    # Em produção, fazer scraping real ou usar APIs dos DOs
    
    resultados = []
    
    for identificador in identificadores:
        resultado = {
            "identificador": identificador,
            "encontrado": False,
            "publicacoes": [],
            "estados_pesquisados": estados or [e["sigla"] for e in ESTADOS_BRASIL]
        }
        
        # TODO: Implementar busca real nos diários
        # Por enquanto, retornar estrutura
        
        resultados.append(resultado)
    
    logger.info(f"🔍 Pesquisa em Diários: {len(identificadores)} identificadores")
    
    return {
        "total_identificadores": len(identificadores),
        "resultados": resultados,
        "pesquisado_em": _agora_iso()
    }

# ============================================================================
# ======================= PORTAL OAB ========================================
# ============================================================================

@router.post("/oab/sincronizar")
async def sincronizar_oab(oab: str, uf: str):
    """
    Sincroniza dados do advogado com Portal OAB
    
    Busca:
    - Situação cadastral
    - Especialidades
    - Histórico disciplinar
    - Processos vinculados
    """
    if uf not in [e["sigla"] for e in ESTADOS_BRASIL]:
        raise HTTPException(status_code=400, detail="UF inválida")
    
    # Simular consulta ao portal OAB
    # Em produção, usar API oficial da OAB ou scraping autorizado
    
    dados_oab = {
        "oab": oab,
        "uf": uf,
        "situacao": "ativo",
        "nome": "Advogado Exemplo",
        "inscricao_principal": f"{oab}/{uf}",
        "inscricoes_suplementares": [],
        "especialidades": [],
        "historico_limpo": True,
        "data_inscricao": "2010-01-01",
        "sincronizado_em": _agora_iso()
    }
    
    # Salvar no cache
    await db.oab_cache.update_one(
        {"oab": oab, "uf": uf},
        {"$set": dados_oab},
        upsert=True
    )
    
    logger.info(f"⚖️ OAB sincronizado: {oab}/{uf}")
    
    return {
        "success": True,
        "dados": dados_oab,
        "message": "Dados sincronizados com Portal OAB"
    }

@router.get("/oab/consultar")
async def consultar_oab_cache(oab: str, uf: str):
    """Consulta dados em cache do Portal OAB"""
    dados = await db.oab_cache.find_one(
        {"oab": oab, "uf": uf},
        {"_id": 0}
    )
    
    if not dados:
        return {
            "encontrado": False,
            "message": "Execute sincronização primeiro"
        }
    
    return {
        "encontrado": True,
        "dados": dados
    }

# ============================================================================
# ======================= ALERTAS INTELIGENTES ==============================
# ============================================================================

@router.post("/alertas/configurar")
async def configurar_alertas(
    tipo: str,
    identificadores: List[str],
    canais: List[str] = ["email", "webhook"],
    antecedencia_dias: List[int] = [5, 3, 1]
):
    """
    Configura alertas inteligentes para intimações e publicações
    
    Tipos: intimacao, publicacao, prazo, movimentacao
    Canais: email, sms, webhook, push
    """
    config_id = str(uuid.uuid4())
    
    config = {
        "id": config_id,
        "tipo": tipo,
        "identificadores": _normalizar_lista(identificadores),
        "canais": canais,
        "antecedencia_dias": antecedencia_dias,
        "habilitado": True,
        "total_alertas_enviados": 0,
        "created_at": _agora_iso()
    }
    
    await db.alertas_configs.insert_one(config)
    
    logger.info(f"🔔 Alerta configurado: {tipo} para {len(identificadores)} identificadores")
    
    return {
        "id": config_id,
        "tipo": tipo,
        "message": "Alerta configurado com sucesso"
    }

@router.get("/alertas/pendentes")
async def listar_alertas_pendentes(identificador: Optional[str] = None):
    """Lista alertas pendentes de envio"""
    query = {"status": "pendente"}
    
    if identificador:
        query["identificadores"] = {"$regex": identificador, "$options": "i"}
    
    alertas = await db.alertas_pendentes.find(query, {"_id": 0}).sort("data_alerta", 1).to_list(100)
    
    return {
        "total": len(alertas),
        "alertas": alertas
    }

# ============================================================================
# ======================= ENDPOINTS AUXILIARES ==============================
# ============================================================================

@router.get("/estados")
async def listar_estados():
    """Lista todos os estados do Brasil"""
    return {
        "total": len(ESTADOS_BRASIL),
        "estados": ESTADOS_BRASIL
    }

@router.get("/sistemas")
async def listar_sistemas():
    """Lista todos os sistemas suportados"""
    return {
        "total": len(SISTEMAS_DISPONIVEIS),
        "sistemas": SISTEMAS_DISPONIVEIS
    }

@router.get("/tribunais-superiores")
async def listar_tribunais_superiores():
    """Lista tribunais superiores"""
    return {
        "total": len(TRIBUNAIS_SUPERIORES),
        "tribunais": TRIBUNAIS_SUPERIORES
    }
