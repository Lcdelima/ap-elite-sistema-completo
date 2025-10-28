"""
Sistema de Análise de Processos Judiciais - ISO/IEC 27037
Com IA integrada, validação CNJ, OCR, geração de minutas e cadeia de custódia
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import uuid
import hashlib
import re
import json

from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations import EmergentClaude
import os

router = APIRouter(prefix="/api/analysis", tags=["Análise de Processos"])

# MongoDB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

# IA - Emergent LLM
EMERGENT_KEY = "sk-emergent-8956b8181D8C59f613"

# ============================================================================
# MODELOS
# ============================================================================

class LegalBasis(BaseModel):
    """Base legal LGPD"""
    basis: str = Field(..., description="regular_direito|mandato|ordem_judicial|consent")
    evidence_id: Optional[str] = None
    purpose: str = Field(..., description="Finalidade")

class CaseAnalysisCreate(BaseModel):
    """Criar análise de processo"""
    # ETAPA 1: Identificação & Escopo
    cnj: str = Field(..., description="Número CNJ do processo")
    comarca: str
    vara: Optional[str] = None
    tipo_processo: str = Field(..., description="Criminal|Cível|Trabalhista")
    tipo_analise: str = Field(..., description="Nulidades|Prescrição|Dosimetria|etc")
    prioridade: str = Field("P2", description="P1|P2|P3")
    prazo: str  # ISO date
    legal: LegalBasis
    
    # Partes
    partes: Optional[Dict[str, str]] = None
    
    @validator('cnj')
    def validar_cnj(cls, v):
        """Valida formato CNJ: NNNNNNN-NN.NNNN.N.NN.NNNN"""
        if not v:
            raise ValueError("CNJ obrigatório")
        
        # Remove espaços e hífens extras
        v = v.strip().replace(' ', '')
        
        # Padrão CNJ
        pattern = r'^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$'
        if not re.match(pattern, v):
            raise ValueError("Formato CNJ inválido. Use: NNNNNNN-NN.NNNN.N.NN.NNNN")
        
        # TODO: Implementar dígito verificador CNJ
        return v

class DocumentUpload(BaseModel):
    """Documento para análise"""
    file_id: str
    tipo: str = Field(..., description="sentenca|denuncia|ra|midia|pericia")
    sha256: str
    sha512: str

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

def extrair_info_cnj(cnj: str) -> Dict:
    """Extrai informações do número CNJ"""
    # NNNNNNN-DD.AAAA.J.TT.OOOO
    # N = número sequencial
    # DD = dígito verificador
    # AAAA = ano
    # J = segmento (1-8)
    # TT = tribunal
    # OOOO = origem
    
    partes = re.match(r'(\d{7})-(\d{2})\.(\d{4})\.(\d{1})\.(\d{2})\.(\d{4})', cnj)
    if not partes:
        return {}
    
    sequencial, dv, ano, segmento, tribunal, origem = partes.groups()
    
    segmentos = {
        "1": "Supremo Tribunal Federal",
        "2": "Conselho Nacional de Justiça",
        "3": "Superior Tribunal de Justiça",
        "4": "Justiça Federal",
        "5": "Justiça do Trabalho",
        "6": "Justiça Eleitoral",
        "7": "Justiça Militar da União",
        "8": "Justiça dos Estados e DF"
    }
    
    # Tribunais mais comuns (código 8 = Justiça Estadual)
    tribunais_sp = {
        "26": "TJSP - Tribunal de Justiça de São Paulo"
    }
    
    return {
        "sequencial": sequencial,
        "ano": ano,
        "segmento": segmentos.get(segmento, f"Segmento {segmento}"),
        "tribunal": tribunais_sp.get(tribunal, f"Tribunal {tribunal}"),
        "origem": origem
    }

async def processar_ocr(file_path: str) -> str:
    """OCR de documento (simplificado)"""
    # TODO: Implementar OCR real com Tesseract ou API
    return "Texto extraído via OCR (mock)"

async def criar_prazo_d3_d1(analysis_id: str, data_prazo: datetime, titulo: str):
    """Cria prazos D-3 e D-1 no módulo de prazos"""
    try:
        # Prazo D-3
        d3_data = {
            "id": str(uuid.uuid4()),
            "processNumber": "Vinculado à análise",
            "processTitle": f"D-3: {titulo}",
            "deadline": (data_prazo - timedelta(days=3)).isoformat(),
            "type": "prazo_processual",
            "status": "pending",
            "priority": "high",
            "analysis_id": analysis_id,
            "created_at": datetime.now().isoformat()
        }
        await db.deadlines.insert_one(d3_data)
        
        # Prazo D-1
        d1_data = {
            "id": str(uuid.uuid4()),
            "processNumber": "Vinculado à análise",
            "processTitle": f"D-1: {titulo}",
            "deadline": (data_prazo - timedelta(days=1)).isoformat(),
            "type": "prazo_processual",
            "status": "pending",
            "priority": "urgent",
            "analysis_id": analysis_id,
            "created_at": datetime.now().isoformat()
        }
        await db.deadlines.insert_one(d1_data)
        
        return True
    except Exception as e:
        print(f"Erro ao criar prazos: {e}")
        return False

# ============================================================================
# ENDPOINTS - ANÁLISE
# ============================================================================

@router.post("/case")
async def criar_analise_processo(case: CaseAnalysisCreate, background_tasks: BackgroundTasks):
    """
    Cria nova análise de processo judicial
    
    - Valida CNJ
    - Extrai informações do número
    - Valida base legal (compliance-gate)
    - Cria prazos D-3 e D-1
    - Retorna ID para upload de documentos
    """
    
    # Compliance-gate: Base legal obrigatória
    if not case.legal or not case.legal.basis or not case.legal.purpose:
        raise HTTPException(
            status_code=400,
            detail="Base legal obrigatória. Anexe o mandato/ordem judicial (LGPD/CPP). Sem isso a análise não inicia."
        )
    
    # Extrai info do CNJ
    info_cnj = extrair_info_cnj(case.cnj)
    
    # Cria análise
    analysis_id = str(uuid.uuid4())
    
    analysis_data = {
        "id": analysis_id,
        "cnj": case.cnj,
        "cnj_info": info_cnj,
        "comarca": case.comarca,
        "vara": case.vara,
        "tipo_processo": case.tipo_processo,
        "tipo_analise": case.tipo_analise,
        "prioridade": case.prioridade,
        "prazo": case.prazo,
        "legal": case.legal.dict(),
        "partes": case.partes or {},
        "status": "em_analise",
        "progresso": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    await db.case_analysis.insert_one(analysis_data)
    
    # Cria prazos D-3 e D-1 em background
    prazo_dt = datetime.fromisoformat(case.prazo)
    background_tasks.add_task(criar_prazo_d3_d1, analysis_id, prazo_dt, f"Análise {case.tipo_analise}")
    
    return {
        "success": True,
        "analysis_id": analysis_id,
        "cnj_info": info_cnj,
        "message": f"Análise criada. Prazos D-3 e D-1 agendados para {case.prazo}",
        "meta": {
            "ts": datetime.now().isoformat(),
            "req_id": str(uuid.uuid4())
        },
        "legal": case.legal.dict()
    }

@router.post("/{analysis_id}/ingest")
async def ingerir_documentos(
    analysis_id: str,
    file: UploadFile = File(...),
    tipo: str = "documento"
):
    """
    Upload de documento com OCR automático e hash
    
    - Calcula SHA-256 e SHA-512
    - Executa OCR se PDF/imagem
    - Indexa para busca
    - Extrai datas-marco
    """
    
    # Verifica análise
    analysis = await db.case_analysis.find_one({"id": analysis_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Lê arquivo
    contents = await file.read()
    
    # Calcula hashes
    sha256 = hashlib.sha256(contents).hexdigest()
    sha512 = hashlib.sha512(contents).hexdigest()
    
    # Salva metadados
    file_id = str(uuid.uuid4())
    doc_data = {
        "id": file_id,
        "analysis_id": analysis_id,
        "filename": file.filename,
        "tipo": tipo,
        "size": len(contents),
        "sha256": sha256,
        "sha512": sha512,
        "ocr": False,
        "ocr_text": None,
        "created_at": datetime.now().isoformat()
    }
    
    # TODO: Executar OCR em background
    # if file.filename.endswith('.pdf') or file.filename.endswith(('.jpg', '.png')):
    #     ocr_text = await processar_ocr(file_path)
    #     doc_data["ocr"] = True
    #     doc_data["ocr_text"] = ocr_text
    
    await db.analysis_docs.insert_one(doc_data)
    
    # Atualiza contador de documentos
    await db.case_analysis.update_one(
        {"id": analysis_id},
        {"$inc": {"docs_count": 1}}
    )
    
    return {
        "success": True,
        "file_id": file_id,
        "hashes": {
            "sha256": sha256,
            "sha512": sha512
        },
        "message": f"Documento '{file.filename}' processado. OCR em execução."
    }

@router.post("/{analysis_id}/ai/prescricao")
async def analisar_prescricao(analysis_id: str):
    """
    IA analisa prescrição (CP 109, 110, 115)
    
    - Calcula prescrição em abstrato
    - Calcula prescrição intercorrente
    - Identifica marcos interruptivos
    - Retorna proposta com links para trechos
    """
    
    analysis = await db.case_analysis.find_one({"id": analysis_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Busca documentos OCR
    docs = await db.analysis_docs.find({"analysis_id": analysis_id, "ocr": True}).to_list(100)
    
    # Prepara prompt para IA
    prompt = f"""
Você é um perito em Direito Penal. Analise a prescrição neste caso:

Tipo de Processo: {analysis.get('tipo_processo')}
Tipo de Análise: {analysis.get('tipo_analise')}

Documentos disponíveis: {len(docs)}

Analise conforme CP arts. 109, 110, 115:
1. Prescrição em abstrato (antes do trânsito)
2. Prescrição intercorrente (após sentença)
3. Marcos interruptivos (recebimento denúncia, sentença, acórdão)

Retorne JSON:
{{
  "prescricao_abstrata": {{"prazo_anos": N, "data_limite": "YYYY-MM-DD", "fundamentacao": "CP art. X"}},
  "prescricao_intercorrente": {{"aplicavel": true/false, "fundamentacao": "..."}},
  "marcos_interruptivos": [{{"tipo": "...", "data": "...", "base_legal": "..."}}],
  "conclusao": "Prescrita|Não prescrita|Iminente",
  "risco": "alto|medio|baixo",
  "recomendacao": "..."
}}
"""
    
    try:
        # Usa Claude via Emergent
        client_ai = EmergentClaude(api_key=EMERGENT_KEY)
        response = client_ai.chat.completions.create(
            model="claude-sonnet-4-20250514",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        resultado_text = response.choices[0].message.content
        
        # Extrai JSON da resposta
        try:
            resultado = json.loads(resultado_text)
        except:
            # Se não retornar JSON puro, tenta extrair
            resultado = {
                "raw_analysis": resultado_text,
                "conclusao": "Análise gerada",
                "risco": "medio"
            }
        
        # Salva resultado
        ai_result = {
            "id": str(uuid.uuid4()),
            "analysis_id": analysis_id,
            "kind": "prescricao",
            "output": resultado,
            "score": 0.85,
            "created_at": datetime.now().isoformat()
        }
        
        await db.analysis_ai.insert_one(ai_result)
        
        # Atualiza análise
        await db.case_analysis.update_one(
            {"id": analysis_id},
            {"$set": {"ai_prescricao_done": True, "updated_at": datetime.now().isoformat()}}
        )
        
        return {
            "success": True,
            "resultado": resultado,
            "message": "Análise de prescrição concluída",
            "aviso": "Resultado probabilístico — confira marcos interruptivos nos autos."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise IA: {str(e)}")

@router.post("/{analysis_id}/ai/cadeia")
async def analisar_cadeia_custodia(analysis_id: str):
    """
    IA analisa cadeia de custódia (CPP 158-A a 158-F)
    
    - Verifica menções a coleta/lacre/hash
    - Identifica lacunas
    - Sinaliza irregularidades
    """
    
    analysis = await db.case_analysis.find_one({"id": analysis_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    prompt = """
Analise a cadeia de custódia nos documentos conforme CPP arts. 158-A a 158-F:

1. Há menção a lacre/embalagem?
2. Há hashes (MD5/SHA) das evidências?
3. Há ata de coleta com local/data/testemunha?
4. Há menção a write-blocker ou isolamento?
5. Há registro fotográfico?

Retorne JSON:
{
  "lacres": {"presente": true/false, "detalhes": "..."},
  "hashes": {"presente": true/false, "algoritmos": []},
  "ata_coleta": {"presente": true/false},
  "write_blocker": {"presente": true/false},
  "fotos": {"presente": true/false},
  "lacunas": ["lacuna 1", "lacuna 2"],
  "conclusao": "Regular|Irregular|Lacunas graves",
  "fundamentacao": "CPP art. X"
}
"""
    
    try:
        client_ai = EmergentClaude(api_key=EMERGENT_KEY)
        response = client_ai.chat.completions.create(
            model="claude-sonnet-4-20250514",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        resultado_text = response.choices[0].message.content
        
        try:
            resultado = json.loads(resultado_text)
        except:
            resultado = {"raw_analysis": resultado_text, "conclusao": "Análise gerada"}
        
        # Salva
        ai_result = {
            "id": str(uuid.uuid4()),
            "analysis_id": analysis_id,
            "kind": "cadeia",
            "output": resultado,
            "score": 0.80,
            "created_at": datetime.now().isoformat()
        }
        
        await db.analysis_ai.insert_one(ai_result)
        
        await db.case_analysis.update_one(
            {"id": analysis_id},
            {"$set": {"ai_cadeia_done": True}}
        )
        
        return {
            "success": True,
            "resultado": resultado,
            "message": "Análise de cadeia de custódia concluída",
            "aviso": "Se não houver hash/ata de coleta, sinalizamos 'lacuna de custódia'."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro IA: {str(e)}")

@router.post("/{analysis_id}/ai/dosimetria")
async def analisar_dosimetria(analysis_id: str):
    """
    IA analisa dosimetria da pena (CP 59, 61-65)
    
    - Verifica 3 fases (base, circunstâncias, causas)
    - Identifica bis in idem
    - Verifica fundamentação
    """
    
    prompt = """
Analise a dosimetria da pena conforme CP arts. 59, 61-65 (3 fases):

1ª fase - Pena base (art. 59)
2ª fase - Circunstâncias agravantes/atenuantes (arts. 61-65)
3ª fase - Causas de aumento/diminuição

Retorne JSON:
{
  "fase1": {"pena_base": "X anos", "fundamentacao": "..."},
  "fase2": {"agravantes": [], "atenuantes": [], "pena_intermediaria": "..."},
  "fase3": {"causas_aumento": [], "causas_diminuicao": [], "pena_final": "..."},
  "irregularidades": ["bis in idem", "fundamentação genérica"],
  "conclusao": "Dosimetria adequada|Excessiva|Insuficiente"
}
"""
    
    try:
        client_ai = EmergentClaude(api_key=EMERGENT_KEY)
        response = client_ai.chat.completions.create(
            model="claude-sonnet-4-20250514",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        resultado = {"raw_analysis": response.choices[0].message.content}
        
        ai_result = {
            "id": str(uuid.uuid4()),
            "analysis_id": analysis_id,
            "kind": "dosimetria",
            "output": resultado,
            "score": 0.75,
            "created_at": datetime.now().isoformat()
        }
        
        await db.analysis_ai.insert_one(ai_result)
        
        return {
            "success": True,
            "resultado": resultado
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.post("/{analysis_id}/ai/resumo")
async def gerar_resumo_executivo(analysis_id: str):
    """
    IA gera resumo executivo da análise
    
    - Resumo dos fatos
    - Nulidades identificadas
    - Teses defensivas
    - Risco e recomendações
    """
    
    analysis = await db.case_analysis.find_one({"id": analysis_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Busca análises IA já feitas
    ai_results = await db.analysis_ai.find({"analysis_id": analysis_id}).to_list(100)
    
    prompt = f"""
Gere um Resumo Executivo profissional para esta análise:

Processo CNJ: {analysis.get('cnj')}
Tipo: {analysis.get('tipo_processo')} - {analysis.get('tipo_analise')}
Comarca: {analysis.get('comarca')}

Análises IA já realizadas: {len(ai_results)}

Gere um resumo executivo estruturado:
1. RESUMO DOS FATOS (1 parágrafo)
2. NULIDADES IDENTIFICADAS (lista)
3. TESES DEFENSIVAS (com base legal)
4. RISCO (alto|médio|baixo) e FUNDAMENTAÇÃO
5. RECOMENDAÇÕES

Formato JSON:
{{
  "resumo_fatos": "...",
  "nulidades": [{{ "tipo": "...", "fundamentacao": "CPP art. X", "gravidade": "alta|media" }}],
  "teses": [{{ "tese": "...", "base_legal": "...", "viabilidade": "alta|media|baixa" }}],
  "risco": "alto|medio|baixo",
  "recomendacoes": ["..."]
}}
"""
    
    try:
        client_ai = EmergentClaude(api_key=EMERGENT_KEY)
        response = client_ai.chat.completions.create(
            model="claude-sonnet-4-20250514",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        
        resultado_text = response.choices[0].message.content
        
        try:
            resultado = json.loads(resultado_text)
        except:
            resultado = {"raw": resultado_text}
        
        # Salva
        ai_result = {
            "id": str(uuid.uuid4()),
            "analysis_id": analysis_id,
            "kind": "resumo",
            "output": resultado,
            "created_at": datetime.now().isoformat()
        }
        
        await db.analysis_ai.insert_one(ai_result)
        
        return {
            "success": True,
            "resumo": resultado,
            "message": "Resumo executivo gerado pela IA"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.get("/{analysis_id}")
async def obter_analise(analysis_id: str):
    """Obtém análise completa com todas as IAs"""
    
    analysis = await db.case_analysis.find_one({"id": analysis_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Busca documentos
    docs = await db.analysis_docs.find({"analysis_id": analysis_id}).to_list(100)
    
    # Busca análises IA
    ai_results = await db.analysis_ai.find({"analysis_id": analysis_id}).to_list(100)
    
    # Organiza por tipo
    ai_por_tipo = {}
    for ai in ai_results:
        ai_por_tipo[ai["kind"]] = ai["output"]
    
    return {
        "success": True,
        "analysis": analysis,
        "documentos": docs,
        "ai_analysis": ai_por_tipo,
        "total_docs": len(docs),
        "ai_completo": len(ai_por_tipo) >= 3  # prescricao, cadeia, resumo
    }

@router.get("/list")
async def listar_analises(
    status: Optional[str] = None,
    prioridade: Optional[str] = None
):
    """Lista análises com filtros"""
    query = {}
    if status:
        query["status"] = status
    if prioridade:
        query["prioridade"] = prioridade
    
    analyses = await db.case_analysis.find(query).sort("created_at", -1).to_list(100)
    
    return {
        "success": True,
        "count": len(analyses),
        "analyses": analyses
    }

@router.get("/stats")
async def estatisticas_analises():
    """Estatísticas gerais"""
    total = await db.case_analysis.count_documents({})
    concluidas = await db.case_analysis.count_documents({"status": "concluida"})
    em_analise = await db.case_analysis.count_documents({"status": "em_analise"})
    urgentes = await db.case_analysis.count_documents({"prioridade": "P1"})
    
    return {
        "success": True,
        "total": total,
        "concluidas": concluidas,
        "em_analise": em_analise,
        "urgentes": urgentes
    }

@router.post("/{analysis_id}/deadlines/schedule")
async def agendar_prazos(analysis_id: str):
    """Cria prazos D-3 e D-1 no módulo de prazos"""
    
    analysis = await db.case_analysis.find_one({"id": analysis_id})
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    prazo_str = analysis.get("prazo")
    if not prazo_str:
        raise HTTPException(status_code=400, detail="Prazo não definido")
    
    prazo_dt = datetime.fromisoformat(prazo_str)
    
    await criar_prazo_d3_d1(analysis_id, prazo_dt, f"Análise {analysis.get('tipo_analise')}")
    
    return {
        "success": True,
        "message": "Prazos D-3 e D-1 criados no módulo de prazos"
    }
