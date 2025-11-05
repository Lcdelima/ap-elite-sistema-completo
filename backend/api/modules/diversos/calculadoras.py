"""Calculadoras Jurídicas - Elite Athena"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import math

router = APIRouter(prefix="/api/calculadoras", tags=["calculadoras"])


# ========== CRIMINAL ==========

class CalculoPenaRequest(BaseModel):
    pena_base_meses: int
    atenuantes: int = 0
    agravantes: int = 0
    majorantes_percentual: float = 0.0
    minorantes_percentual: float = 0.0


@router.post("/criminal/pena-trifasico")
async def calcular_pena_trifasica(data: CalculoPenaRequest):
    """Calcula pena pelo sistema trifásico"""
    
    # 1ª Fase - Pena Base
    pena_base = data.pena_base_meses
    
    # 2ª Fase - Atenuantes e Agravantes
    reducao_atenuantes = data.atenuantes * 2  # 1/6 = ~2 meses por atenuante
    aumento_agravantes = data.agravantes * 2
    
    pena_segunda_fase = pena_base - reducao_atenuantes + aumento_agravantes
    if pena_segunda_fase < pena_base / 2:  # Não pode reduzir mais de 50%
        pena_segunda_fase = pena_base / 2
    
    # 3ª Fase - Majorantes e Minorantes
    aumento_majorantes = pena_segunda_fase * (data.majorantes_percentual / 100)
    reducao_minorantes = pena_segunda_fase * (data.minorantes_percentual / 100)
    
    pena_final = pena_segunda_fase + aumento_majorantes - reducao_minorantes
    
    return {
        "pena_base_meses": pena_base,
        "pena_segunda_fase_meses": round(pena_segunda_fase, 2),
        "pena_final_meses": round(pena_final, 2),
        "pena_final_anos": round(pena_final / 12, 2),
        "detalhamento": {
            "reducao_atenuantes": reducao_atenuantes,
            "aumento_agravantes": aumento_agravantes,
            "aumento_majorantes": round(aumento_majorantes, 2),
            "reducao_minorantes": round(reducao_minorantes, 2)
        }
    }


class ProgressaoRequest(BaseModel):
    pena_total_meses: int
    regime_inicial: str  # fechado, semiaberto, aberto
    bom_comportamento: bool = True
    reincidente: bool = False


@router.post("/criminal/progressao")
async def calcular_progressao(data: ProgressaoRequest):
    """Calcula progressão de regime"""
    
    # Percentual para progressão
    if data.reincidente:
        percentual = 0.60  # 3/5
    else:
        percentual = 0.40  # 2/5
    
    tempo_para_progressao = data.pena_total_meses * percentual
    
    return {
        "pena_total_meses": data.pena_total_meses,
        "regime_inicial": data.regime_inicial,
        "percentual_necessario": f"{percentual * 100}%",
        "tempo_necessario_meses": round(tempo_para_progressao, 2),
        "tempo_necessario_anos": round(tempo_para_progressao / 12, 2),
        "reincidente": data.reincidente
    }


class RemicaoRequest(BaseModel):
    dias_trabalhados: int


@router.post("/criminal/remicao")
async def calcular_remicao(data: RemicaoRequest):
    """Calcula remição pela leitura (12 livros = 1 dia) ou trabalho (3 dias = 1 dia)"""
    
    # Trabalho: 3 dias trabalhados = 1 dia de remição
    dias_remidos_trabalho = data.dias_trabalhados / 3
    
    return {
        "dias_trabalhados": data.dias_trabalhados,
        "dias_remidos": round(dias_remidos_trabalho, 2),
        "meses_remidos": round(dias_remidos_trabalho / 30, 2)
    }


# ========== CÍVEL ==========

class PrazoRequest(BaseModel):
    dias: int
    dias_uteis: bool = True


@router.post("/civil/prazo")
async def calcular_prazo_civil(data: PrazoRequest):
    """Calcula prazo processual considerando dias úteis"""
    
    hoje = datetime.now()
    dias_corridos = data.dias
    
    if data.dias_uteis:
        # Aproximação: dias úteis * 1.4 (considerando fds e feriados)
        dias_corridos = int(data.dias * 1.4)
    
    data_final = hoje + timedelta(days=dias_corridos)
    
    return {
        "dias_solicitados": data.dias,
        "tipo": "dias úteis" if data.dias_uteis else "dias corridos",
        "dias_corridos_aproximados": dias_corridos,
        "data_inicial": hoje.strftime("%d/%m/%Y"),
        "data_final": data_final.strftime("%d/%m/%Y")
    }


class HonorariosRequest(BaseModel):
    valor_causa: float
    percentual: float = 10.0  # 10% padrão


@router.post("/civil/honorarios")
async def calcular_honorarios(data: HonorariosRequest):
    """Calcula honorários advocatícios"""
    
    valor_honorarios = data.valor_causa * (data.percentual / 100)
    
    return {
        "valor_causa": data.valor_causa,
        "percentual": data.percentual,
        "valor_honorarios": round(valor_honorarios, 2),
        "honorarios_formatado": f"R$ {valor_honorarios:,.2f}"
    }


# ========== TRABALHISTA ==========

class FeriasRequest(BaseModel):
    salario: float
    dias_ferias: int = 30


@router.post("/trabalhista/ferias")
async def calcular_ferias(data: FeriasRequest):
    """Calcula valor de férias"""
    
    valor_ferias = data.salario
    terco_constitucional = data.salario / 3
    total = valor_ferias + terco_constitucional
    
    return {
        "salario": data.salario,
        "dias_ferias": data.dias_ferias,
        "valor_ferias": round(valor_ferias, 2),
        "terco_constitucional": round(terco_constitucional, 2),
        "total": round(total, 2),
        "total_formatado": f"R$ {total:,.2f}"
    }


class DecimoTerceiroRequest(BaseModel):
    salario: float
    meses_trabalhados: int = 12


@router.post("/trabalhista/decimo-terceiro")
async def calcular_decimo_terceiro(data: DecimoTerceiroRequest):
    """Calcula 13º salário"""
    
    valor_proporcional = (data.salario / 12) * data.meses_trabalhados
    
    return {
        "salario": data.salario,
        "meses_trabalhados": data.meses_trabalhados,
        "valor_13": round(valor_proporcional, 2),
        "valor_formatado": f"R$ {valor_proporcional:,.2f}"
    }


# ========== PREVIDENCIÁRIO ==========

class TempoContribuicaoRequest(BaseModel):
    anos_contribuicao: int
    meses_contribuicao: int = 0
    idade_atual: int


@router.post("/previdenciario/tempo-contribuicao")
async def calcular_tempo_contribuicao(data: TempoContribuicaoRequest):
    """Calcula tempo de contribuição e requisitos para aposentadoria"""
    
    tempo_total_meses = (data.anos_contribuicao * 12) + data.meses_contribuicao
    
    # Regras atuais (podem mudar)
    tempo_minimo_homem = 35 * 12  # 35 anos
    tempo_minimo_mulher = 30 * 12  # 30 anos
    
    return {
        "tempo_total_anos": data.anos_contribuicao,
        "tempo_total_meses": tempo_total_meses,
        "idade_atual": data.idade_atual,
        "falta_para_homem_meses": max(0, tempo_minimo_homem - tempo_total_meses),
        "falta_para_mulher_meses": max(0, tempo_minimo_mulher - tempo_total_meses),
        "pode_aposentar_homem": tempo_total_meses >= tempo_minimo_homem,
        "pode_aposentar_mulher": tempo_total_meses >= tempo_minimo_mulher
    }


# ========== TRIBUTÁRIO ==========

class JurosRequest(BaseModel):
    valor_principal: float
    taxa_mensal: float
    meses: int


@router.post("/tributario/juros-compostos")
async def calcular_juros_compostos(data: JurosRequest):
    """Calcula juros compostos"""
    
    taxa_decimal = data.taxa_mensal / 100
    montante = data.valor_principal * math.pow((1 + taxa_decimal), data.meses)
    juros = montante - data.valor_principal
    
    return {
        "valor_principal": data.valor_principal,
        "taxa_mensal": data.taxa_mensal,
        "meses": data.meses,
        "montante": round(montante, 2),
        "juros": round(juros, 2),
        "montante_formatado": f"R$ {montante:,.2f}"
    }
