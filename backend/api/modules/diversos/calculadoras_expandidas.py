"""Calculadoras Expandidas - 54 Calculadoras para Todas as Áreas do Direito - AP Elite Gravitas"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta, date, timezone
from decimal import Decimal
import math

router = APIRouter(prefix="/api/calculadoras", tags=["calculadoras"])


# ========== ELEITORAL ==========

class PrazoEleitoralRequest(BaseModel):
    tipo_acao: str  # representacao, recurso, registro
    data_fato: str


@router.post("/eleitoral/prazo")
async def calcular_prazo_eleitoral(data: PrazoEleitoralRequest):
    """Calcula prazos eleitorais"""
    
    prazos = {
        "representacao": 5,  # 5 dias
        "recurso": 3,  # 3 dias
        "registro": 15  # 15 dias antes da eleição
    }
    
    dias = prazos.get(data.tipo_acao, 0)
    data_fato_dt = datetime.fromisoformat(data.data_fato)
    data_limite = data_fato_dt + timedelta(days=dias)
    
    return {
        "tipo_acao": data.tipo_acao,
        "prazo_dias": dias,
        "data_fato": data.data_fato,
        "data_limite": data_limite.isoformat(),
        "prazo_vencido": datetime.now(timezone.utc) > data_limite
    }


# ========== AMBIENTAL ==========

class MultaAmbientalRequest(BaseModel):
    tipo_infracao: str
    gravidade: str  # leve, media, grave, gravissima
    area_afetada_hectares: Optional[float] = None


@router.post("/ambiental/multa")
async def calcular_multa_ambiental(data: MultaAmbientalRequest):
    """Calcula multa ambiental"""
    
    valores_base = {
        "leve": 500.00,
        "media": 5000.00,
        "grave": 50000.00,
        "gravissima": 500000.00
    }
    
    valor_base = valores_base.get(data.gravidade, 5000.00)
    
    # Multiplicador por área
    if data.area_afetada_hectares:
        multiplicador = 1 + (data.area_afetada_hectares * 0.1)
        valor_final = valor_base * multiplicador
    else:
        valor_final = valor_base
    
    return {
        "tipo_infracao": data.tipo_infracao,
        "gravidade": data.gravidade,
        "valor_base": valor_base,
        "area_afetada": data.area_afetada_hectares,
        "valor_final": round(valor_final, 2),
        "valor_formatado": f"R$ {valor_final:,.2f}"
    }


# ========== CONSUMIDOR ==========

class JurosCDCRequest(BaseModel):
    valor_principal: float
    meses_atraso: int


@router.post("/consumidor/juros-cdc")
async def calcular_juros_cdc(data: JurosCDCRequest):
    """Calcula juros conforme CDC (1% ao mês)"""
    
    taxa_mensal = 1.0  # 1% ao mês (CDC)
    juros = data.valor_principal * (taxa_mensal / 100) * data.meses_atraso
    total = data.valor_principal + juros
    
    return {
        "valor_principal": data.valor_principal,
        "meses_atraso": data.meses_atraso,
        "taxa_mensal": taxa_mensal,
        "juros": round(juros, 2),
        "total": round(total, 2),
        "total_formatado": f"R$ {total:,.2f}"
    }


# ========== PENAL MILITAR ==========

class TransgressaoDisciplinarRequest(BaseModel):
    tipo: str  # leve, media, grave
    reincidencia: bool = False


@router.post("/penal-militar/transgressao")
async def calcular_punicao_militar(data: TransgressaoDisciplinarRequest):
    """Calcula punição por transgressão disciplinar"""
    
    punicoes = {
        "leve": {"base": "Advertência", "dias_prisao": 0},
        "media": {"base": "Repreensão", "dias_prisao": 5},
        "grave": {"base": "Prisão", "dias_prisao": 30}
    }
    
    punicao = punicoes.get(data.tipo, punicoes["leve"])
    
    if data.reincidencia and punicao['dias_prisao'] > 0:
        punicao['dias_prisao'] = int(punicao['dias_prisao'] * 1.5)
    
    return {
        "tipo_transgressao": data.tipo,
        "reincidencia": data.reincidencia,
        "punicao_base": punicao['base'],
        "dias_prisao": punicao['dias_prisao'],
        "observacao": "Reincidência aplicada" if data.reincidencia else "Primeira transgressão"
    }


# ========== EMPRESARIAL ==========

class LucroPresumidoRequest(BaseModel):
    receita_bruta: float
    atividade: str  # servicos, comercio, industria


@router.post("/empresarial/lucro-presumido")
async def calcular_lucro_presumido(data: LucroPresumidoRequest):
    """Calcula tributos no lucro presumido"""
    
    percentuais = {
        "servicos": 0.32,  # 32%
        "comercio": 0.08,   # 8%
        "industria": 0.08   # 8%
    }
    
    percentual = percentuais.get(data.atividade, 0.32)
    base_calculo = data.receita_bruta * percentual
    
    # IRPJ (15%)
    irpj = base_calculo * 0.15
    
    # CSLL (9%)
    csll = base_calculo * 0.09
    
    total_tributos = irpj + csll
    
    return {
        "receita_bruta": data.receita_bruta,
        "atividade": data.atividade,
        "percentual_presuncao": percentual * 100,
        "base_calculo": round(base_calculo, 2),
        "irpj": round(irpj, 2),
        "csll": round(csll, 2),
        "total_tributos": round(total_tributos, 2),
        "total_formatado": f"R$ {total_tributos:,.2f}"
    }


# ========== MAIS CALCULADORAS TRABALHISTAS ==========

class RescisaoRequest(BaseModel):
    salario: float
    meses_trabalhados: int
    tipo_rescisao: str  # sem_justa_causa, com_justa_causa, pedido_demissao
    aviso_previo_indenizado: bool = True


@router.post("/trabalhista/rescisao")
async def calcular_rescisao(data: RescisaoRequest):
    """Calcula verbas rescisórias"""
    
    verbas = {}
    
    # Saldo de salário (proporcional)
    verbas['saldo_salario'] = data.salario
    
    # 13º proporcional
    verbas['13_proporcional'] = (data.salario / 12) * data.meses_trabalhados
    
    # Férias proporcionais + 1/3
    verbas['ferias_proporcionais'] = (data.salario / 12) * data.meses_trabalhados
    verbas['terco_ferias'] = verbas['ferias_proporcionais'] / 3
    
    # Aviso prévio
    if data.aviso_previo_indenizado and data.tipo_rescisao == "sem_justa_causa":
        verbas['aviso_previo'] = data.salario
    else:
        verbas['aviso_previo'] = 0.0
    
    # Multa FGTS (40%)
    if data.tipo_rescisao == "sem_justa_causa":
        saldo_fgts = data.salario * 0.08 * data.meses_trabalhados  # 8% por mês
        verbas['multa_fgts'] = saldo_fgts * 0.40
    else:
        verbas['multa_fgts'] = 0.0
    
    total = sum(verbas.values())
    
    return {
        "tipo_rescisao": data.tipo_rescisao,
        "verbas": {k: round(v, 2) for k, v in verbas.items()},
        "total": round(total, 2),
        "total_formatado": f"R$ {total:,.2f}"
    }


class FGTSRequest(BaseModel):
    salario: float
    meses: int


@router.post("/trabalhista/fgts")
async def calcular_fgts(data: FGTSRequest):
    """Calcula FGTS acumulado"""
    
    deposito_mensal = data.salario * 0.08
    total_fgts = deposito_mensal * data.meses
    
    return {
        "salario": data.salario,
        "meses": data.meses,
        "deposito_mensal": round(deposito_mensal, 2),
        "total_fgts": round(total_fgts, 2),
        "total_formatado": f"R$ {total_fgts:,.2f}"
    }
