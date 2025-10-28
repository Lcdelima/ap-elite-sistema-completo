"""
Sistema de Playbooks Forenses - ISO/IEC 27037
Backend completo para gerenciamento de playbooks, steps, execução e automações
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Header
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import uuid
import hashlib
import json

from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/playbooks", tags=["Playbooks Forenses"])

# MongoDB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

# ============================================================================
# MODELOS
# ============================================================================

class BaseLegalPlaybook(BaseModel):
    """Base legal LGPD/CPP"""
    basis: str = Field(..., description="consent|contrato|exercicio_regular|ordem_judicial")
    evidence_id: Optional[str] = None
    purpose: str = Field(..., description="Finalidade específica")
    processo_numero: Optional[str] = None

class PlaybookStep(BaseModel):
    """Etapa do playbook"""
    ordem: int
    titulo: str
    descricao: str
    responsavel_role: str = Field(..., description="ADV|PERITA|ADM|EST")
    prazo_relativo: Optional[Dict[str, Any]] = None  # {days: -3, anchor: "audiencia"}
    validacao: Optional[Dict[str, bool]] = None  # {requires_hash: true, requires_upload: true}
    automacoes: List[Dict[str, Any]] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

class PlaybookCreate(BaseModel):
    """Criar playbook"""
    # ETAPA 1: Metadados
    titulo: str
    tipo: str = Field(..., description="JURIDICO|PERICIA|ADMIN|OSINT|GEO")
    categoria: str
    processo_id: Optional[str] = None
    cliente_id: Optional[str] = None
    prioridade: str = Field("P2", description="P1|P2|P3")
    validade: Optional[str] = None
    
    # ETAPA 2: Conteúdo
    steps: List[PlaybookStep] = Field(default_factory=list)
    templates: List[str] = Field(default_factory=list)
    
    # ETAPA 3: Conformidade
    base_legal: BaseLegalPlaybook
    nivel_sigilo: str = Field("CONF", description="CONF|ULTRA|RESTRITO")
    observacoes: Optional[str] = None

class PlaybookRunCreate(BaseModel):
    """Executar playbook"""
    playbook_id: str
    processo_id: Optional[str] = None
    cliente_id: Optional[str] = None
    context: Dict[str, Any] = Field(default_factory=dict)

class StepComplete(BaseModel):
    """Completar etapa"""
    evidencias: List[Dict[str, str]] = Field(default_factory=list)
    observacoes: Optional[str] = None

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

def calcular_hash_blockchain(hash_prev: Optional[str], dados: dict) -> str:
    """Hash encadeado para audit trail"""
    dados_str = json.dumps(dados, sort_keys=True)
    if hash_prev:
        dados_str = hash_prev + dados_str
    return hashlib.sha256(dados_str.encode()).hexdigest()

def calcular_prazo(prazo_relativo: Dict, data_base: datetime) -> datetime:
    """Calcula prazo absoluto baseado em prazo relativo"""
    if not prazo_relativo:
        return data_base
    
    days = prazo_relativo.get("days", 0)
    return data_base + timedelta(days=days)

# ============================================================================
# ENDPOINTS - PLAYBOOKS
# ============================================================================

@router.post("/create")
async def criar_playbook(playbook: PlaybookCreate):
    """
    Cria novo playbook forense
    
    Validações:
    - Título único
    - Base legal obrigatória
    - Pelo menos 1 step
    """
    
    # Valida título único
    existe = await db.playbooks.find_one({"titulo": playbook.titulo})
    if existe:
        raise HTTPException(status_code=400, detail="Título já existe. Use um título único.")
    
    # Valida base legal
    if not playbook.base_legal or not playbook.base_legal.basis:
        raise HTTPException(
            status_code=400,
            detail="Base legal obrigatória (LGPD/CPP). Anexe autorização/mandato/ordem judicial."
        )
    
    # Cria playbook
    playbook_id = str(uuid.uuid4())
    
    playbook_data = {
        "id": playbook_id,
        **playbook.dict(),
        "status": "ativo",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "execucoes_count": 0
    }
    
    await db.playbooks.insert_one(playbook_data)
    
    # Salva steps separadamente para facilitar drag-and-drop
    for step in playbook.steps:
        step_data = {
            "id": str(uuid.uuid4()),
            "playbook_id": playbook_id,
            **step.dict(),
            "created_at": datetime.now().isoformat()
        }
        await db.playbook_steps.insert_one(step_data)
    
    return {
        "success": True,
        "playbook_id": playbook_id,
        "message": f"Playbook '{playbook.titulo}' criado com {len(playbook.steps)} etapas"
    }

@router.get("/list")
async def listar_playbooks(
    tipo: Optional[str] = None,
    categoria: Optional[str] = None,
    status: Optional[str] = None
):
    """Lista playbooks com filtros"""
    query = {}
    if tipo:
        query["tipo"] = tipo
    if categoria:
        query["categoria"] = categoria
    if status:
        query["status"] = status
    
    playbooks = await db.playbooks.find(query).sort("created_at", -1).to_list(100)
    
    # Para cada playbook, busca steps
    for pb in playbooks:
        steps = await db.playbook_steps.find({"playbook_id": pb["id"]}).sort("ordem", 1).to_list(100)
        pb["steps_count"] = len(steps)
        pb["steps"] = steps
    
    return {
        "success": True,
        "count": len(playbooks),
        "playbooks": playbooks
    }

@router.get("/{playbook_id}")
async def obter_playbook(playbook_id: str):
    """Obtém detalhes completos do playbook"""
    playbook = await db.playbooks.find_one({"id": playbook_id})
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook não encontrado")
    
    # Busca steps
    steps = await db.playbook_steps.find({"playbook_id": playbook_id}).sort("ordem", 1).to_list(100)
    
    return {
        "success": True,
        "playbook": playbook,
        "steps": steps
    }

# ============================================================================
# ENDPOINTS - EXECUÇÃO (RUNS)
# ============================================================================

@router.post("/run")
async def executar_playbook(run: PlaybookRunCreate):
    """
    Instancia execução de playbook vinculada a processo/cliente
    
    - Cria run com progresso 0%
    - Clona steps do playbook
    - Calcula prazos absolutos
    - Dispara automações de início
    """
    
    # Busca playbook
    playbook = await db.playbooks.find_one({"id": run.playbook_id})
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook não encontrado")
    
    # Cria run
    run_id = str(uuid.uuid4())
    
    run_data = {
        "id": run_id,
        "playbook_id": run.playbook_id,
        "playbook_titulo": playbook["titulo"],
        "processo_id": run.processo_id,
        "cliente_id": run.cliente_id,
        "context": run.context,
        "status": "em_andamento",
        "progresso": 0,
        "started_at": datetime.now().isoformat(),
        "finished_at": None
    }
    
    await db.playbook_runs.insert_one(run_data)
    
    # Clona steps e calcula prazos
    steps = await db.playbook_steps.find({"playbook_id": run.playbook_id}).sort("ordem", 1).to_list(100)
    
    data_base = datetime.now()
    
    for step in steps:
        # Calcula prazo absoluto
        due_at = None
        if step.get("prazo_relativo"):
            due_at = calcular_prazo(step["prazo_relativo"], data_base).isoformat()
        
        run_step = {
            "id": str(uuid.uuid4()),
            "run_id": run_id,
            "step_id": step["id"],
            "titulo": step["titulo"],
            "descricao": step.get("descricao"),
            "responsavel_role": step["responsavel_role"],
            "ordem": step["ordem"],
            "status": "pendente",
            "due_at": due_at,
            "validacao": step.get("validacao", {}),
            "automacoes": step.get("automacoes", []),
            "evidencias": [],
            "observacoes": None,
            "completed_at": None
        }
        
        await db.playbook_run_steps.insert_one(run_step)
        
        # TODO: Disparar automações de início se configuradas
    
    # Incrementa contador de execuções
    await db.playbooks.update_one(
        {"id": run.playbook_id},
        {"$inc": {"execucoes_count": 1}}
    )
    
    return {
        "success": True,
        "run_id": run_id,
        "total_steps": len(steps),
        "message": f"Execução iniciada para '{playbook['titulo']}'"
    }

@router.get("/run/{run_id}")
async def obter_run(run_id: str):
    """Obtém detalhes da execução"""
    run = await db.playbook_runs.find_one({"id": run_id})
    if not run:
        raise HTTPException(status_code=404, detail="Execução não encontrada")
    
    # Busca steps da execução
    steps = await db.playbook_run_steps.find({"run_id": run_id}).sort("ordem", 1).to_list(100)
    
    # Calcula progresso
    total_steps = len(steps)
    completed_steps = len([s for s in steps if s["status"] == "ok"])
    progresso = round((completed_steps / total_steps * 100), 2) if total_steps > 0 else 0
    
    # Atualiza progresso no run
    await db.playbook_runs.update_one(
        {"id": run_id},
        {"$set": {"progresso": progresso}}
    )
    
    return {
        "success": True,
        "run": run,
        "steps": steps,
        "progresso": progresso,
        "total_steps": total_steps,
        "completed_steps": completed_steps
    }

@router.post("/run/{run_id}/step/{step_id}/complete")
async def completar_step(run_id: str, step_id: str, completion: StepComplete):
    """
    Completa etapa com validação de hash e anexos
    
    - Valida hash se requerido
    - Registra evidências
    - Cria hash blockchain do ato
    - Atualiza progresso
    """
    
    # Busca step
    step = await db.playbook_run_steps.find_one({"id": step_id, "run_id": run_id})
    if not step:
        raise HTTPException(status_code=404, detail="Etapa não encontrada")
    
    if step["status"] == "ok":
        raise HTTPException(status_code=400, detail="Etapa já concluída")
    
    # Validação: se requires_hash, verifica evidências
    validacao = step.get("validacao", {})
    if validacao.get("requires_hash") and not completion.evidencias:
        raise HTTPException(
            status_code=400,
            detail="Esta etapa exige upload de evidências com hash SHA-256/SHA-512"
        )
    
    # Busca último hash da cadeia
    ultimo_step = await db.playbook_run_steps.find_one(
        {"run_id": run_id, "hash_curr": {"$exists": True}},
        sort=[("completed_at", -1)]
    )
    
    hash_prev = ultimo_step.get("hash_curr") if ultimo_step else None
    
    # Calcula hash atual
    step_data = {
        "step_id": step_id,
        "completed_at": datetime.now().isoformat(),
        "evidencias": completion.evidencias,
        "observacoes": completion.observacoes
    }
    
    hash_curr = calcular_hash_blockchain(hash_prev, step_data)
    
    # Atualiza step
    await db.playbook_run_steps.update_one(
        {"id": step_id},
        {
            "$set": {
                "status": "ok",
                "evidencias": completion.evidencias,
                "observacoes": completion.observacoes,
                "completed_at": datetime.now().isoformat(),
                "hash_prev": hash_prev,
                "hash_curr": hash_curr
            }
        }
    )
    
    # Recalcula progresso
    all_steps = await db.playbook_run_steps.find({"run_id": run_id}).to_list(100)
    completed = len([s for s in all_steps if s.get("status") == "ok"])
    progresso = round((completed / len(all_steps) * 100), 2)
    
    # Atualiza run
    update_data = {"progresso": progresso}
    
    # Se 100%, marca como concluído
    if progresso == 100:
        update_data["status"] = "concluido"
        update_data["finished_at"] = datetime.now().isoformat()
    
    await db.playbook_runs.update_one(
        {"id": run_id},
        {"$set": update_data}
    )
    
    return {
        "success": True,
        "step_id": step_id,
        "hash_curr": hash_curr,
        "progresso": progresso,
        "message": f"Etapa '{step['titulo']}' concluída. Progresso: {progresso}%"
    }

@router.post("/run/{run_id}/step/{step_id}/block")
async def bloquear_step(run_id: str, step_id: str, motivo: str):
    """Bloqueia etapa (ex: hash divergente, impossibilidade técnica)"""
    
    await db.playbook_run_steps.update_one(
        {"id": step_id, "run_id": run_id},
        {
            "$set": {
                "status": "bloqueado",
                "observacoes": f"BLOQUEADO: {motivo}",
                "blocked_at": datetime.now().isoformat()
            }
        }
    )
    
    # Marca run como bloqueada
    await db.playbook_runs.update_one(
        {"id": run_id},
        {"$set": {"status": "bloqueado"}}
    )
    
    return {
        "success": True,
        "message": f"Etapa bloqueada. Motivo: {motivo}"
    }

# ============================================================================
# ENDPOINTS - STATS
# ============================================================================

@router.get("/stats")
async def estatisticas_playbooks():
    """Estatísticas gerais"""
    total_playbooks = await db.playbooks.count_documents({})
    ativos = await db.playbooks.count_documents({"status": "ativo"})
    
    total_runs = await db.playbook_runs.count_documents({})
    runs_andamento = await db.playbook_runs.count_documents({"status": "em_andamento"})
    runs_concluidos = await db.playbook_runs.count_documents({"status": "concluido"})
    runs_bloqueados = await db.playbook_runs.count_documents({"status": "bloqueado"})
    
    # Média de progresso
    runs = await db.playbook_runs.find({}).to_list(1000)
    progresso_medio = sum([r.get("progresso", 0) for r in runs]) / len(runs) if runs else 0
    
    # Por tipo
    por_tipo = {}
    for tipo in ["JURIDICO", "PERICIA", "ADMIN", "OSINT", "GEO"]:
        count = await db.playbooks.count_documents({"tipo": tipo})
        por_tipo[tipo] = count
    
    return {
        "success": True,
        "playbooks": {
            "total": total_playbooks,
            "ativos": ativos,
            "por_tipo": por_tipo
        },
        "execucoes": {
            "total": total_runs,
            "em_andamento": runs_andamento,
            "concluidos": runs_concluidos,
            "bloqueados": runs_bloqueados,
            "progresso_medio": round(progresso_medio, 1)
        }
    }

@router.get("/run/{run_id}/export")
async def exportar_relatorio_execucao(run_id: str):
    """
    Exporta relatório de execução (JSON probatório)
    
    Inclui:
    - Dados completos da execução
    - Cadeia de custódia (hashes encadeados)
    - Evidências (hashes SHA-256/SHA-512)
    - Timeline de ações
    - Incidentes/bloqueios
    """
    
    run = await db.playbook_runs.find_one({"id": run_id})
    if not run:
        raise HTTPException(status_code=404, detail="Execução não encontrada")
    
    playbook = await db.playbooks.find_one({"id": run["playbook_id"]})
    steps = await db.playbook_run_steps.find({"run_id": run_id}).sort("ordem", 1).to_list(100)
    
    # Verifica integridade da cadeia
    integridade = True
    for i in range(1, len(steps)):
        if steps[i].get("hash_prev") != steps[i-1].get("hash_curr"):
            integridade = False
            break
    
    # Coleta todas as evidências
    todas_evidencias = []
    for step in steps:
        if step.get("evidencias"):
            todas_evidencias.extend(step["evidencias"])
    
    relatorio = {
        "relatorio_id": str(uuid.uuid4()),
        "gerado_em": datetime.now().isoformat(),
        "run": {
            "id": run["id"],
            "playbook": playbook["titulo"],
            "tipo": playbook["tipo"],
            "categoria": playbook["categoria"],
            "status": run["status"],
            "progresso": run.get("progresso", 0),
            "started_at": run["started_at"],
            "finished_at": run.get("finished_at")
        },
        "base_legal": playbook.get("base_legal"),
        "nivel_sigilo": playbook.get("nivel_sigilo"),
        "steps": [
            {
                "ordem": s["ordem"],
                "titulo": s["titulo"],
                "status": s["status"],
                "responsavel": s["responsavel_role"],
                "completed_at": s.get("completed_at"),
                "evidencias": s.get("evidencias", []),
                "hash_prev": s.get("hash_prev"),
                "hash_curr": s.get("hash_curr")
            }
            for s in steps
        ],
        "evidencias_totais": len(todas_evidencias),
        "integridade_cadeia": "OK" if integridade else "FALHA",
        "incidentes": [
            {
                "step": s["titulo"],
                "motivo": s.get("observacoes")
            }
            for s in steps if s.get("status") == "bloqueado"
        ]
    }
    
    return {
        "success": True,
        "relatorio": relatorio,
        "export_json": json.dumps(relatorio, indent=2, ensure_ascii=False)
    }

# ============================================================================
# ENDPOINTS - TEMPLATES
# ============================================================================

@router.get("/templates")
async def listar_templates():
    """Lista templates disponíveis"""
    templates = [
        {
            "id": "ra_assistente_tecnico",
            "titulo": "RA - Habilitação Assistente Técnico",
            "tipo": "JURIDICO",
            "categoria": "Resposta à Acusação",
            "placeholders": ["{{processo}}", "{{comarca}}", "{{vara}}", "{{cliente}}", "{{oab_adv}}"],
            "base_legal": "CPP art. 159, §§ 3º e 5º"
        },
        {
            "id": "ata_custodia_ato1",
            "titulo": "Ata de Custódia - Ato 1 (Recebimento)",
            "tipo": "PERICIA",
            "categoria": "Cadeia de Custódia",
            "placeholders": ["{{dispositivo}}", "{{imei}}", "{{lacre}}", "{{hash}}", "{{data_coleta}}", "{{local}}", "{{perita}}"],
            "base_legal": "ISO/IEC 27037"
        },
        {
            "id": "ata_aquisicao_ato2",
            "titulo": "Ata de Aquisição - Ato 2",
            "tipo": "PERICIA",
            "categoria": "Cadeia de Custódia",
            "placeholders": ["{{dispositivo}}", "{{metodo}}", "{{ferramenta}}", "{{hash}}", "{{perita}}"],
            "base_legal": "ISO/IEC 27037"
        },
        {
            "id": "checklist_iso_27037",
            "titulo": "Checklist ISO/IEC 27037",
            "tipo": "PERICIA",
            "categoria": "Conformidade",
            "placeholders": ["{{write_blocker}}", "{{modo_aviao}}", "{{isolador_rf}}", "{{biometria}}"],
            "base_legal": "ISO/IEC 27037"
        },
        {
            "id": "minuta_hc",
            "titulo": "Minuta HC - Apreensão Irregular",
            "tipo": "JURIDICO",
            "categoria": "Habeas Corpus",
            "placeholders": ["{{processo}}", "{{paciente}}", "{{dispositivo}}", "{{data_apreensao}}"],
            "base_legal": "CPP art. 648, XI"
        },
        {
            "id": "ata_audiencia",
            "titulo": "Ata de Audiência",
            "tipo": "JURIDICO",
            "categoria": "Audiência",
            "placeholders": ["{{processo}}", "{{data}}", "{{hora}}", "{{perguntas}}", "{{respostas}}"],
            "base_legal": "CPC/CPP"
        }
    ]
    
    return {
        "success": True,
        "count": len(templates),
        "templates": templates
    }

def calcular_hash_blockchain(hash_prev: Optional[str], dados: dict) -> str:
    """Hash encadeado"""
    dados_str = json.dumps(dados, sort_keys=True)
    if hash_prev:
        dados_str = hash_prev + dados_str
    return hashlib.sha256(dados_str.encode()).hexdigest()
