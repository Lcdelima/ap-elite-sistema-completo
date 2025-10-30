"""
Módulo de Dosimetria Penal e Análise Criminal Completa
========================================================

Sistema avançado com IA para:
- Cálculo automático de penas (CP Art. 59, 61-65)
- Análise de reincidência (CP Art. 63, 64)
- Circunstâncias atenuantes (CP Art. 65, 66)
- Circunstâncias agravantes (CP Art. 61, 62)
- Causas de aumento e diminuição
- Prescrição (CP Art. 109-119)
- Concurso de crimes (CP Art. 69, 70, 71)
- Continuidade delitiva (CP Art. 71)
- Substituição de penas (CP Art. 44)
- Sursis (CP Art. 77-82)
- Livramento condicional (CP Art. 83-90)
- Regime inicial (CP Art. 33)
"""

from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional
import uuid
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator

from server import db

router = APIRouter(prefix="/api/dosimetria", tags=["Dosimetria Penal"])
logger = logging.getLogger(__name__)

# ============================================================================
# ============================ MODELOS ======================================
# ============================================================================

class CrimeBase(BaseModel):
    """Dados básicos do crime"""
    tipo_penal: str = Field(..., description="Ex: Furto (CP Art. 155)")
    artigo: str
    pena_minima_anos: int
    pena_minima_meses: int = 0
    pena_maxima_anos: int
    pena_maxima_meses: int = 0
    tipo: str = Field(default="reclusao", description="reclusao, detencao, multa")

class CircunstanciasArt59(BaseModel):
    """Circunstâncias do Art. 59 CP"""
    culpabilidade: str = Field(default="normal", description="leve, normal, grave")
    antecedentes: str = Field(default="primario", description="primario, maus_antecedentes")
    conduta_social: str = Field(default="favoravel", description="favoravel, desfavoravel")
    personalidade: str = Field(default="normal", description="ajustada, normal, desajustada")
    motivos: str = Field(default="normais", description="nobres, normais, torpes")
    circunstancias: str = Field(default="normais", description="favoraveis, normais, desfavoraveis")
    consequencias: str = Field(default="normais", description="leves, normais, graves")
    comportamento_vitima: str = Field(default="neutro", description="contribuiu, neutro")

class Atenuante(BaseModel):
    """Atenuante (CP Art. 65, 66)"""
    artigo: str
    descricao: str
    aplicavel: bool = True
    fundamentacao: Optional[str] = None

class Agravante(BaseModel):
    """Agravante (CP Art. 61, 62)"""
    artigo: str
    descricao: str
    aplicavel: bool = True
    fundamentacao: Optional[str] = None

class Reincidencia(BaseModel):
    """Análise de reincidência"""
    possui_reincidencia: bool = False
    data_condenacao_anterior: Optional[str] = None
    crime_anterior: Optional[str] = None
    tempo_entre_crimes_anos: Optional[int] = None
    reincidencia_especifica: bool = False
    fundamentacao: Optional[str] = None

class CausaAumentoDiminuicao(BaseModel):
    """Causas de aumento/diminuição"""
    tipo: str = Field(..., description="aumento, diminuicao")
    artigo: str
    descricao: str
    fracao: str = Field(..., description="Ex: 1/3, 1/2, 2/3, dobro, triplo")
    aplicavel: bool = True

class DosimetriaCreate(BaseModel):
    """Request para cálculo de dosimetria"""
    processo_id: Optional[str] = None
    reu_nome: str
    reu_cpf: Optional[str] = None
    
    # Crime(s)
    crimes: List[CrimeBase]
    concurso: str = Field(default="unico", description="unico, material, formal, continuidade")
    
    # Art. 59
    circunstancias_art59: CircunstanciasArt59
    
    # Art. 61-66
    atenuantes: List[Atenuante] = Field(default_factory=list)
    agravantes: List[Agravante] = Field(default_factory=list)
    
    # Reincidência
    reincidencia: Optional[Reincidencia] = None
    
    # Causas especiais
    causas_aumento: List[CausaAumentoDiminuicao] = Field(default_factory=list)
    causas_diminuicao: List[CausaAumentoDiminuicao] = Field(default_factory=list)
    
    # Contexto
    possui_filhos_menores: bool = False
    colaborou_justica: bool = False
    confessou_espontaneamente: bool = False
    reparou_dano: bool = False
    
    responsavel: str

# ============================================================================
# ============================ FUNÇÕES CÁLCULO ==============================
# ============================================================================

def _pena_em_meses(anos: int, meses: int) -> int:
    """Converte pena para meses"""
    return (anos * 12) + meses

def _meses_para_anos_meses(total_meses: int) -> tuple:
    """Converte meses para anos e meses"""
    anos = total_meses // 12
    meses = total_meses % 12
    return (anos, meses)

def _calcular_pena_base(crime: CrimeBase, circunstancias: CircunstanciasArt59) -> tuple:
    """
    Primeira fase - Pena base (CP Art. 59)
    
    Retorna: (pena_meses, pontos_negativos, fundamentacao)
    """
    min_meses = _pena_em_meses(crime.pena_minima_anos, crime.pena_minima_meses)
    max_meses = _pena_em_meses(crime.pena_maxima_anos, crime.pena_maxima_meses)
    
    # Contar pontos negativos
    pontos = 0
    fundamentos = []
    
    if circunstancias.culpabilidade == "grave":
        pontos += 2
        fundamentos.append("Culpabilidade elevada")
    elif circunstancias.culpabilidade == "leve":
        pontos -= 1
        fundamentos.append("Culpabilidade reduzida")
    
    if circunstancias.antecedentes == "maus_antecedentes":
        pontos += 2
        fundamentos.append("Maus antecedentes")
    
    if circunstancias.conduta_social == "desfavoravel":
        pontos += 1
        fundamentos.append("Conduta social desfavorável")
    
    if circunstancias.personalidade == "desajustada":
        pontos += 1
        fundamentos.append("Personalidade desajustada")
    
    if circunstancias.motivos == "torpes":
        pontos += 2
        fundamentos.append("Motivos torpes")
    elif circunstancias.motivos == "nobres":
        pontos -= 1
        fundamentos.append("Motivos nobres")
    
    if circunstancias.circunstancias == "desfavoraveis":
        pontos += 1
        fundamentos.append("Circunstâncias desfavoráveis")
    
    if circunstancias.consequencias == "graves":
        pontos += 2
        fundamentos.append("Consequências graves")
    
    if circunstancias.comportamento_vitima == "contribuiu":
        pontos -= 1
        fundamentos.append("Comportamento da vítima contribuiu")
    
    # Calcular pena base
    # Cada ponto = ~5% da amplitude
    amplitude = max_meses - min_meses
    incremento_por_ponto = max(1, amplitude // 16)  # 1/16 da amplitude
    
    pena_base = min_meses + (pontos * incremento_por_ponto)
    pena_base = max(min_meses, min(pena_base, max_meses))
    
    return (pena_base, pontos, fundamentos)

def _aplicar_atenuantes_agravantes(
    pena_base: int,
    atenuantes: List[Atenuante],
    agravantes: List[Agravante],
    reincidencia: Optional[Reincidencia]
) -> tuple:
    """
    Segunda fase - Atenuantes e agravantes
    
    Retorna: (pena_intermediaria, reducao, aumento, fundamentos)
    """
    pena = pena_base
    fundamentos = []
    
    # Atenuantes (redução de 1/6)
    atenuantes_aplicadas = [a for a in atenuantes if a.aplicavel]
    if atenuantes_aplicadas:
        reducao = pena // 6
        pena -= reducao
        fundamentos.append(f"Atenuantes aplicadas: {len(atenuantes_aplicadas)} (redução 1/6)")
        for at in atenuantes_aplicadas:
            fundamentos.append(f"  - {at.descricao} ({at.artigo})")
    
    # Agravantes (aumento de 1/6)
    agravantes_aplicadas = [a for a in agravantes if a.aplicavel]
    if agravantes_aplicadas:
        aumento = pena // 6
        pena += aumento
        fundamentos.append(f"Agravantes aplicadas: {len(agravantes_aplicadas)} (aumento 1/6)")
        for ag in agravantes_aplicadas:
            fundamentos.append(f"  - {ag.descricao} ({ag.artigo})")
    
    # Reincidência (aumento de 1/6)
    if reincidencia and reincidencia.possui_reincidencia:
        aumento_reinc = pena // 6
        pena += aumento_reinc
        tipo = "específica" if reincidencia.reincidencia_especifica else "genérica"
        fundamentos.append(f"Reincidência {tipo} (aumento 1/6)")
    
    return (pena, fundamentos)

def _aplicar_causas_especiais(
    pena_intermediaria: int,
    causas_aumento: List[CausaAumentoDiminuicao],
    causas_diminuicao: List[CausaAumentoDiminuicao]
) -> tuple:
    """
    Terceira fase - Causas de aumento/diminuição
    
    Retorna: (pena_final, fundamentos)
    """
    pena = pena_intermediaria
    fundamentos = []
    
    # Causas de aumento
    for causa in causas_aumento:
        if not causa.aplicavel:
            continue
        
        if "/" in causa.fracao:
            numerador, denominador = map(int, causa.fracao.split("/"))
            aumento = (pena * numerador) // denominador
        elif causa.fracao == "dobro":
            aumento = pena
        elif causa.fracao == "triplo":
            aumento = pena * 2
        else:
            aumento = 0
        
        pena += aumento
        fundamentos.append(f"Causa de aumento: {causa.descricao} ({causa.fracao})")
    
    # Causas de diminuição
    for causa in causas_diminuicao:
        if not causa.aplicavel:
            continue
        
        if "/" in causa.fracao:
            numerador, denominador = map(int, causa.fracao.split("/"))
            reducao = (pena * numerador) // denominador
        else:
            reducao = 0
        
        pena -= reducao
        fundamentos.append(f"Causa de diminuição: {causa.descricao} ({causa.fracao})")
    
    return (pena, fundamentos)

def _calcular_regime(pena_meses: int, reincidente: bool) -> str:
    """Determina regime inicial (CP Art. 33)"""
    if pena_meses > 96:  # > 8 anos
        return "fechado"
    elif pena_meses > 48:  # > 4 anos
        return "semiaberto" if not reincidente else "fechado"
    else:
        return "aberto" if not reincidente else "semiaberto"

def _calcular_prescricao(pena_meses: int) -> Dict[str, Any]:
    """
    Calcula prescrição abstrata e retroativa (CP Art. 109)
    
    Retorna prazos de prescrição
    """
    anos = pena_meses // 12
    
    # Prescrição abstrata (antes do trânsito em julgado)
    if anos >= 12:
        prazo_abstrato = 20
    elif anos >= 8:
        prazo_abstrato = 16
    elif anos >= 4:
        prazo_abstrato = 12
    elif anos >= 2:
        prazo_abstrato = 8
    elif anos >= 1:
        prazo_abstrato = 4
    else:
        prazo_abstrato = 3
    
    # Prescrição executória (após trânsito)
    if anos >= 12:
        prazo_executoria = 20
    elif anos >= 8:
        prazo_executoria = 16
    elif anos >= 4:
        prazo_executoria = 12
    elif anos >= 2:
        prazo_executoria = 8
    elif anos >= 1:
        prazo_executoria = 4
    else:
        prazo_executoria = 3
    
    return {
        "prazo_abstrato_anos": prazo_abstrato,
        "prazo_executoria_anos": prazo_executoria,
        "prazo_retroativo_anos": prazo_executoria,  # Pela pena aplicada
        "reducao_menor_21": prazo_abstrato // 2,  # Se menor de 21
        "reducao_maior_70": prazo_abstrato // 2   # Se maior de 70
    }

# ============================================================================
# ============================ ENDPOINTS ====================================
# ============================================================================

@router.post("/calcular")
async def calcular_dosimetria(dados: DosimetriaCreate):
    """
    Calcula dosimetria completa da pena
    
    Três fases:
    1. Pena base (Art. 59)
    2. Atenuantes e agravantes (Art. 61-66)
    3. Causas de aumento/diminuição
    
    Plus: Regime, prescrição, substituição, sursis
    """
    dosimetria_id = str(uuid.uuid4())
    
    logger.info(f"⚖️ Calculando dosimetria para: {dados.reu_nome}")
    
    # Processar cada crime
    resultados_crimes = []
    
    for crime in dados.crimes:
        # Primeira fase
        pena_base, pontos_art59, fund_base = _calcular_pena_base(crime, dados.circunstancias_art59)
        
        # Segunda fase
        pena_intermediaria, fund_intermediaria = _aplicar_atenuantes_agravantes(
            pena_base,
            dados.atenuantes,
            dados.agravantes,
            dados.reincidencia
        )
        
        # Terceira fase
        pena_final, fund_final = _aplicar_causas_especiais(
            pena_intermediaria,
            dados.causas_aumento,
            dados.causas_diminuicao
        )
        
        anos, meses = _meses_para_anos_meses(pena_final)
        
        # Regime
        reincidente = dados.reincidencia.possui_reincidencia if dados.reincidencia else False
        regime = _calcular_regime(pena_final, reincidente)
        
        # Prescrição
        prescricao = _calcular_prescricao(pena_final)
        
        # Substituição possível?
        substituicao_possivel = (
            pena_final <= 48 and  # <= 4 anos
            not reincidente and
            crime.tipo != "reclusao" or pena_final <= 48
        )
        
        # Sursis possível?
        sursis_possivel = (
            pena_final <= 24 and  # <= 2 anos
            not reincidente
        )
        
        resultado_crime = {
            "crime": crime.model_dump(),
            "primeira_fase": {
                "pena_base_meses": pena_base,
                "pena_base_formatada": f"{pena_base//12} anos e {pena_base%12} meses",
                "pontos_art59": pontos_art59,
                "fundamentacao": fund_base
            },
            "segunda_fase": {
                "pena_intermediaria_meses": pena_intermediaria,
                "pena_intermediaria_formatada": f"{pena_intermediaria//12} anos e {pena_intermediaria%12} meses",
                "fundamentacao": fund_intermediaria
            },
            "terceira_fase": {
                "pena_final_meses": pena_final,
                "pena_final_formatada": f"{anos} anos e {meses} meses",
                "fundamentacao": fund_final
            },
            "regime_inicial": regime,
            "prescricao": prescricao,
            "substituicao_possivel": substituicao_possivel,
            "sursis_possivel": sursis_possivel
        }
        
        resultados_crimes.append(resultado_crime)
    
    # Concurso de crimes
    pena_total_meses = 0
    if dados.concurso == "material":
        # Soma das penas
        pena_total_meses = sum([r["terceira_fase"]["pena_final_meses"] for r in resultados_crimes])
    elif dados.concurso == "formal":
        # Pena mais grave + aumento de 1/6
        penas = [r["terceira_fase"]["pena_final_meses"] for r in resultados_crimes]
        pena_mais_grave = max(penas)
        aumento = pena_mais_grave // 6
        pena_total_meses = pena_mais_grave + aumento
    elif dados.concurso == "continuidade":
        # Pena mais grave + 1/6 a 2/3
        penas = [r["terceira_fase"]["pena_final_meses"] for r in resultados_crimes]
        pena_mais_grave = max(penas)
        quantidade_crimes = len(dados.crimes)
        
        if quantidade_crimes <= 3:
            fracao = 1/6
        elif quantidade_crimes <= 6:
            fracao = 1/3
        else:
            fracao = 1/2
        
        aumento = int(pena_mais_grave * fracao)
        pena_total_meses = pena_mais_grave + aumento
    else:
        # Crime único
        pena_total_meses = resultados_crimes[0]["terceira_fase"]["pena_final_meses"]
    
    anos_final, meses_final = _meses_para_anos_meses(pena_total_meses)
    
    # Documento completo
    documento = {
        "id": dosimetria_id,
        "processo_id": dados.processo_id,
        "reu_nome": dados.reu_nome,
        "reu_cpf": dados.reu_cpf,
        "created_at": _agora_iso(),
        "responsavel": dados.responsavel,
        
        "crimes": [c.model_dump() for c in dados.crimes],
        "concurso": dados.concurso,
        "circunstancias_art59": dados.circunstancias_art59.model_dump(),
        "atenuantes": [a.model_dump() for a in dados.atenuantes],
        "agravantes": [a.model_dump() for a in dados.agravantes],
        "reincidencia": dados.reincidencia.model_dump() if dados.reincidencia else None,
        "causas_aumento": [c.model_dump() for c in dados.causas_aumento],
        "causas_diminuicao": [c.model_dump() for c in dados.causas_diminuicao],
        
        "resultados_por_crime": resultados_crimes,
        
        "pena_final": {
            "total_meses": pena_total_meses,
            "anos": anos_final,
            "meses": meses_final,
            "formatado": f"{anos_final} anos e {meses_final} meses"
        },
        
        "regime_inicial": _calcular_regime(pena_total_meses, dados.reincidencia.possui_reincidencia if dados.reincidencia else False),
        "prescricao": _calcular_prescricao(pena_total_meses),
        
        "beneficios": {
            "substituicao_possivel": pena_total_meses <= 48,
            "sursis_possivel": pena_total_meses <= 24,
            "livramento_condicional_possivel": pena_total_meses >= 24
        }
    }
    
    # Salvar no banco
    await db.dosimetrias.insert_one(documento)
    
    logger.info(f"✅ Dosimetria calculada: {dosimetria_id} - Pena: {anos_final}a{meses_final}m")
    
    return documento

@router.get("/calculos")
async def listar_calculos(reu_nome: Optional[str] = None, limit: int = 50):
    """Lista cálculos de dosimetria realizados"""
    query = {}
    if reu_nome:
        query["reu_nome"] = {"$regex": reu_nome, "$options": "i"}
    
    calculos = await db.dosimetrias.find(query, {"_id": 0}).sort("created_at", -1).to_list(limit)
    
    return {
        "total": len(calculos),
        "calculos": calculos
    }

@router.get("/calculos/{dosimetria_id}")
async def obter_calculo(dosimetria_id: str):
    """Obtém detalhes de um cálculo específico"""
    calculo = await db.dosimetrias.find_one({"id": dosimetria_id}, {"_id": 0})
    
    if not calculo:
        raise HTTPException(status_code=404, detail="Cálculo não encontrado")
    
    return calculo

@router.get("/tabelas/atenuantes")
async def listar_atenuantes():
    """Lista todas as atenuantes do CP"""
    atenuantes_cp = [
        {"artigo": "CP Art. 65, I", "descricao": "Ser o agente menor de 21 anos na data do fato"},
        {"artigo": "CP Art. 65, II", "descricao": "Ser o agente maior de 70 anos na data da sentença"},
        {"artigo": "CP Art. 65, III, a", "descricao": "Desconhecer a lei (erro de direito)"},
        {"artigo": "CP Art. 65, III, b", "descricao": "Ter cometido o crime por motivo de relevante valor social"},
        {"artigo": "CP Art. 65, III, c", "descricao": "Ter cometido o crime por motivo de relevante valor moral"},
        {"artigo": "CP Art. 65, III, d", "descricao": "Ter confessado espontaneamente a autoria do crime"},
        {"artigo": "CP Art. 65, III, e", "descricao": "Ter cometido o crime sob influência de violenta emoção"},
        {"artigo": "CP Art. 65, III, f", "descricao": "Ter procurado, por sua espontânea vontade, reparar o dano"},
        {"artigo": "CP Art. 66", "descricao": "Atenuante inominada (circunstância relevante não prevista)"}
    ]
    
    return {"total": len(atenuantes_cp), "atenuantes": atenuantes_cp}

@router.get("/tabelas/agravantes")
async def listar_agravantes():
    """Lista todas as agravantes do CP"""
    agravantes_cp = [
        {"artigo": "CP Art. 61, I", "descricao": "Reincidência"},
        {"artigo": "CP Art. 61, II, a", "descricao": "Ter o agente cometido o crime por motivo fútil"},
        {"artigo": "CP Art. 61, II, b", "descricao": "Ter o agente cometido o crime para facilitar ou assegurar outro crime"},
        {"artigo": "CP Art. 61, II, c", "descricao": "Ter o agente cometido o crime mediante paga ou promessa de recompensa"},
        {"artigo": "CP Art. 61, II, d", "descricao": "Crime praticado por motivo torpe"},
        {"artigo": "CP Art. 61, II, e", "descricao": "Crime cometido para assegurar a execução, ocultação, impunidade de outro"},
        {"artigo": "CP Art. 61, II, f", "descricao": "Crime praticado com emprego de veneno, fogo, explosivo, tortura"},
        {"artigo": "CP Art. 61, II, g", "descricao": "Crime praticado com traição, emboscada ou mediante dissimulação"},
        {"artigo": "CP Art. 61, II, h", "descricao": "Crime contra ascendente, descendente, irmão ou cônjuge"},
        {"artigo": "CP Art. 62, I", "descricao": "Crime praticado com abuso de autoridade ou prevalecendo-se de relações"},
        {"artigo": "CP Art. 62, II", "descricao": "Crime praticado com abuso de poder ou violação de dever"},
        {"artigo": "CP Art. 62, III", "descricao": "Contra criança, maior de 60 anos, enfermo ou mulher grávida"},
        {"artigo": "CP Art. 62, IV", "descricao": "Crime praticado quando o ofendido estava sob imediata proteção da autoridade"}
    ]
    
    return {"total": len(agravantes_cp), "agravantes": agravantes_cp}

@router.get("/health")
async def health_dosimetria():
    """Health check do módulo de dosimetria"""
    return {
        "status": "ok",
        "module": "Dosimetria Penal & Análise Criminal",
        "version": "1.0.0",
        "features": [
            "Cálculo automático de penas (3 fases)",
            "Análise de reincidência",
            "Atenuantes (CP Art. 65, 66)",
            "Agravantes (CP Art. 61, 62)",
            "Causas de aumento/diminuição",
            "Prescrição (abstrata, executória, retroativa)",
            "Concurso de crimes (material, formal, continuidade)",
            "Regime inicial (CP Art. 33)",
            "Substituição de penas (CP Art. 44)",
            "Sursis (CP Art. 77-82)",
            "Livramento condicional (CP Art. 83-90)",
            "Tabelas de atenuantes e agravantes"
        ]
    }
