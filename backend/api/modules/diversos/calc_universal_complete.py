"""TODAS AS 54 CALCULADORAS JURÍDICAS - ELITE ATHENA
Sistema Universal de Cálculos Forenses e Jurídicos
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta, date
import math
import requests

router = APIRouter(prefix="/api/calc-universal", tags=["calculadoras-universal"])

# ==================== MODELOS ====================

class PrescricaoPenalRequest(BaseModel):
    data_fato: str
    pena_maxima_anos: int
    causas_interruptivas: List[str] = []
    
class DetracaoRequest(BaseModel):
    dias_preso_provisoriamente: int
    pena_total_dias: int

class LivramentoRequest(BaseModel):
    pena_total_meses: int
    tempo_cumprido_meses: int
    reincidente: bool = False

class CustasRequest(BaseModel):
    valor_causa: float
    estado: str = "SP"

class HorasExtrasRequest(BaseModel):
    salario_base: float
    horas_extras_mes: float
    percentual_adicional: float = 50.0

class IRPFRequest(BaseModel):
    renda_anual: float
    dependentes: int = 0
    deducoes: float = 0.0

# ==================== CRIMINAL ====================

@router.post("/criminal/prescricao")
async def calcular_prescricao_penal(data: PrescricaoPenalRequest):
    """Calcula prescrição penal conforme CP Art. 109"""
    
    # Tabela de prescrição (Art. 109 CP)
    prazos_prescricao = {
        1: 3,    # Até 1 ano -> 3 anos
        2: 4,    # Mais de 1 até 2 -> 4 anos
        4: 8,    # Mais de 2 até 4 -> 8 anos
        8: 12,   # Mais de 4 até 8 -> 12 anos
        12: 16,  # Mais de 8 até 12 -> 16 anos
        100: 20  # Mais de 12 -> 20 anos
    }
    
    prazo = 20  # Padrão
    for limite, anos in prazos_prescricao.items():
        if data.pena_maxima_anos <= limite:
            prazo = anos
            break
    
    # Calcular data de prescrição
    data_fato_dt = datetime.fromisoformat(data.data_fato)
    data_prescricao = data_fato_dt + timedelta(days=prazo * 365)
    
    # Considerar interrupções
    dias_interrompidos = len(data.causas_interruptivas) * 365  # Simplificado
    data_prescricao += timedelta(days=dias_interrompidos)
    
    prescreveu = datetime.now() > data_prescricao
    
    return {
        "pena_maxima_anos": data.pena_maxima_anos,
        "prazo_prescricao_anos": prazo,
        "data_fato": data.data_fato,
        "data_prescricao": data_prescricao.isoformat(),
        "prescreveu": prescreveu,
        "dias_restantes": (data_prescricao - datetime.now()).days if not prescreveu else 0,
        "fundamentacao": ["CP Art. 109", "CP Art. 110", "CP Art. 111", "CP Art. 117"],
        "causas_interruptivas": data.causas_interruptivas
    }

@router.post("/criminal/detracao")
async def calcular_detracao(data: DetracaoRequest):
    """Calcula detração (CP Art. 42)"""
    
    pena_restante = data.pena_total_dias - data.dias_preso_provisoriamente
    
    return {
        "pena_total_dias": data.pena_total_dias,
        "dias_preso_provisoriamente": data.dias_preso_provisoriamente,
        "pena_restante_dias": max(0, pena_restante),
        "pena_restante_meses": round(max(0, pena_restante) / 30, 2),
        "percentual_cumprido": round((data.dias_preso_provisoriamente / data.pena_total_dias) * 100, 2),
        "fundamentacao": ["CP Art. 42"]
    }

@router.post("/criminal/livramento-condicional")
async def calcular_livramento(data: LivramentoRequest):
    """Calcula requisitos para livramento condicional (CP Art. 83)"""
    
    # Reincidente: 2/3 | Primário: 1/3
    percentual = 2/3 if data.reincidente else 1/3
    tempo_necessario = data.pena_total_meses * percentual
    tempo_faltante = max(0, tempo_necessario - data.tempo_cumprido_meses)
    pode_requerer = tempo_faltante == 0
    
    return {
        "pena_total_meses": data.pena_total_meses,
        "tempo_cumprido_meses": data.tempo_cumprido_meses,
        "reincidente": data.reincidente,
        "percentual_necessario": f"{percentual * 100:.0f}%",
        "tempo_necessario_meses": round(tempo_necessario, 2),
        "tempo_faltante_meses": round(tempo_faltante, 2),
        "pode_requerer": pode_requerer,
        "fundamentacao": ["CP Art. 83", "LEP Art. 112"]
    }

# ==================== CÍVEL ====================

@router.post("/civil/custas")
async def calcular_custas(data: CustasRequest):
    """Calcula custas processuais"""
    
    # Tabela simplificada (varia por estado)
    percentual = 0.01  # 1% padrão
    
    if data.valor_causa <= 5000:
        percentual = 0.01
    elif data.valor_causa <= 50000:
        percentual = 0.015
    else:
        percentual = 0.02
    
    custas = data.valor_causa * percentual
    
    return {
        "valor_causa": data.valor_causa,
        "estado": data.estado,
        "percentual": percentual * 100,
        "custas": round(custas, 2),
        "custas_formatado": f"R$ {custas:,.2f}",
        "fundamentacao": ["CPC Art. 82", "CPC Art. 85", f"Lei de Custas {data.estado}"]
    }

@router.post("/civil/sucumbencia")
async def calcular_sucumbencia(valor_causa: float, percentual_vencido: float):
    """Calcula honorários de sucumbência"""
    
    base_calculo = valor_causa * (percentual_vencido / 100)
    
    # Honorários entre 10% e 20% (CPC Art. 85)
    honorarios_min = base_calculo * 0.10
    honorarios_max = base_calculo * 0.20
    honorarios_medio = base_calculo * 0.15
    
    return {
        "valor_causa": valor_causa,
        "percentual_vencido": percentual_vencido,
        "base_calculo": round(base_calculo, 2),
        "honorarios_minimo": round(honorarios_min, 2),
        "honorarios_maximo": round(honorarios_max, 2),
        "honorarios_medio": round(honorarios_medio, 2),
        "fundamentacao": ["CPC Art. 85", "CPC Art. 86"]
    }

# ==================== TRABALHISTA ====================

@router.post("/trabalhista/horas-extras")
async def calcular_horas_extras(data: HorasExtrasRequest):
    """Calcula valor de horas extras"""
    
    valor_hora_normal = data.salario_base / 220  # 220 horas/mês
    valor_hora_extra = valor_hora_normal * (1 + data.percentual_adicional / 100)
    total_mes = valor_hora_extra * data.horas_extras_mes
    total_ano = total_mes * 12
    
    return {
        "salario_base": data.salario_base,
        "horas_extras_mes": data.horas_extras_mes,
        "percentual_adicional": data.percentual_adicional,
        "valor_hora_normal": round(valor_hora_normal, 2),
        "valor_hora_extra": round(valor_hora_extra, 2),
        "total_mensal": round(total_mes, 2),
        "total_anual": round(total_ano, 2),
        "fundamentacao": ["CF Art. 7º XVI", "CLT Art. 59"]
    }

@router.post("/trabalhista/adicional-noturno")
async def calcular_adicional_noturno(salario: float, horas_noturnas: float):
    """Calcula adicional noturno (20% CLT)"""
    
    valor_hora = salario / 220
    adicional = valor_hora * 0.20  # 20%
    total = adicional * horas_noturnas
    
    return {
        "salario_base": salario,
        "horas_noturnas": horas_noturnas,
        "percentual_adicional": 20.0,
        "valor_hora_normal": round(valor_hora, 2),
        "valor_adicional_hora": round(adicional, 2),
        "total_mes": round(total, 2),
        "fundamentacao": ["CF Art. 7º IX", "CLT Art. 73"]
    }

@router.post("/trabalhista/insalubridade")
async def calcular_insalubridade(salario_minimo: float, grau: str):
    """Calcula adicional de insalubridade"""
    
    percentuais = {
        "minimo": 0.10,    # 10%
        "medio": 0.20,     # 20%
        "maximo": 0.40     # 40%
    }
    
    percentual = percentuais.get(grau.lower(), 0.20)
    adicional = salario_minimo * percentual
    
    return {
        "salario_minimo": salario_minimo,
        "grau": grau,
        "percentual": percentual * 100,
        "adicional": round(adicional, 2),
        "fundamentacao": ["CF Art. 7º XXIII", "CLT Art. 192", "NR-15"]
    }

# ==================== TRIBUTÁRIO ====================

@router.post("/tributario/irpf")
async def calcular_irpf(data: IRPFRequest):
    """Calcula Imposto de Renda Pessoa Física"""
    
    # Tabela 2025 (simplificada)
    faixas = [
        {"limite": 24511.92, "aliquota": 0, "parcela": 0},
        {"limite": 33919.80, "aliquota": 0.075, "parcela": 1838.39},
        {"limite": 45012.60, "aliquota": 0.15, "parcela": 4382.38},
        {"limite": 55976.16, "aliquota": 0.225, "parcela": 7758.32},
        {"limite": float('inf'), "aliquota": 0.275, "parcela": 10557.13}
    ]
    
    # Deduções
    deducao_dependente = 2275.08
    deducao_total = (data.dependentes * deducao_dependente) + data.deducoes
    
    base_calculo = max(0, data.renda_anual - deducao_total)
    
    # Calcular imposto
    imposto = 0
    for faixa in faixas:
        if base_calculo <= faixa["limite"]:
            imposto = (base_calculo * faixa["aliquota"]) - faixa["parcela"]
            break
    
    imposto = max(0, imposto)
    aliquota_efetiva = (imposto / data.renda_anual * 100) if data.renda_anual > 0 else 0
    
    return {
        "renda_anual": data.renda_anual,
        "dependentes": data.dependentes,
        "deducao_dependentes": data.dependentes * deducao_dependente,
        "outras_deducoes": data.deducoes,
        "deducao_total": round(deducao_total, 2),
        "base_calculo": round(base_calculo, 2),
        "imposto_devido": round(imposto, 2),
        "aliquota_efetiva": round(aliquota_efetiva, 2),
        "fundamentacao": ["Lei 13.149/2015", "Lei 14.663/2023"]
    }

@router.post("/tributario/iptu")
async def calcular_iptu(valor_venal: float, aliquota_municipal: float):
    """Calcula IPTU"""
    
    iptu = valor_venal * (aliquota_municipal / 100)
    
    return {
        "valor_venal": valor_venal,
        "aliquota": aliquota_municipal,
        "iptu_anual": round(iptu, 2),
        "iptu_mensal": round(iptu / 12, 2),
        "fundamentacao": ["CF Art. 156 I", "CTN Art. 32"]
    }

@router.post("/tributario/ipva")
async def calcular_ipva(valor_veiculo: float, aliquota_estadual: float):
    """Calcula IPVA"""
    
    ipva = valor_veiculo * (aliquota_estadual / 100)
    
    return {
        "valor_veiculo": valor_veiculo,
        "aliquota": aliquota_estadual,
        "ipva_anual": round(ipva, 2),
        "ipva_parcelado_3x": round(ipva / 3, 2),
        "fundamentacao": ["CF Art. 155 III", "Lei Estadual específica"]
    }

@router.post("/tributario/icms")
async def calcular_icms(valor_produto: float, aliquota_interna: float):
    """Calcula ICMS"""
    
    icms = valor_produto * (aliquota_interna / 100)
    valor_com_icms = valor_produto + icms
    
    return {
        "valor_base": valor_produto,
        "aliquota": aliquota_interna,
        "icms": round(icms, 2),
        "valor_final": round(valor_com_icms, 2),
        "fundamentacao": ["CF Art. 155 II", "LC 87/1996"]
    }

@router.post("/tributario/iss")
async def calcular_iss(valor_servico: float, aliquota_municipal: float):
    """Calcula ISS"""
    
    iss = valor_servico * (aliquota_municipal / 100)
    
    return {
        "valor_servico": valor_servico,
        "aliquota": aliquota_municipal,
        "iss": round(iss, 2),
        "valor_liquido": round(valor_servico - iss, 2),
        "fundamentacao": ["CF Art. 156 III", "LC 116/2003"]
    }

# ==================== PREVIDENCIÁRIO ====================

@router.post("/previdenciario/beneficio")
async def calcular_beneficio_inss(salarios_contribuicao: List[float], meses: int):
    """Calcula valor de benefício INSS"""
    
    # Média dos salários
    media = sum(salarios_contribuicao) / len(salarios_contribuicao)
    
    # Fator previdenciário (simplificado)
    fator = 0.85  # Média
    
    beneficio = media * fator
    
    return {
        "quantidade_salarios": len(salarios_contribuicao),
        "media_salarial": round(media, 2),
        "fator_previdenciario": fator,
        "valor_beneficio": round(beneficio, 2),
        "meses_contribuicao": meses,
        "fundamentacao": ["Lei 8.213/1991", "EC 103/2019"]
    }

@router.post("/previdenciario/revisao-aposentadoria")
async def calcular_revisao_aposentadoria(valor_atual: float, valor_correto: float, meses_atrasados: int):
    """Calcula revisão de aposentadoria"""
    
    diferenca_mensal = valor_correto - valor_atual
    total_atrasado = diferenca_mensal * meses_atrasados
    
    # Juros e correção (simplificado - usar índices reais)
    correcao = total_atrasado * 0.05  # 5% aproximado
    total_com_correcao = total_atrasado + correcao
    
    return {
        "valor_atual": valor_atual,
        "valor_correto": valor_correto,
        "diferenca_mensal": round(diferenca_mensal, 2),
        "meses_atrasados": meses_atrasados,
        "total_atrasado": round(total_atrasado, 2),
        "correcao_monetaria": round(correcao, 2),
        "total_a_receber": round(total_com_correcao, 2),
        "fundamentacao": ["Lei 8.213/1991", "Súmula 598 STJ"]
    }

# ==================== EMPRESARIAL ====================

@router.post("/empresarial/simples-nacional")
async def calcular_simples_nacional(receita_bruta_12m: float, atividade: str):
    """Calcula tributos do Simples Nacional"""
    
    # Anexos do Simples (simplificado)
    aliquotas = {
        "comercio": 0.04,      # Anexo I
        "industria": 0.045,    # Anexo II
        "servicos": 0.06       # Anexo III
    }
    
    aliquota = aliquotas.get(atividade.lower(), 0.06)
    tributo_mensal = (receita_bruta_12m / 12) * aliquota
    tributo_anual = receita_bruta_12m * aliquota
    
    return {
        "receita_bruta_12m": receita_bruta_12m,
        "atividade": atividade,
        "aliquota": aliquota * 100,
        "tributo_mensal": round(tributo_mensal, 2),
        "tributo_anual": round(tributo_anual, 2),
        "fundamentacao": ["LC 123/2006", "LC 155/2016"]
    }

@router.post("/empresarial/prolabore")
async def calcular_prolabore(faturamento_mensal: float, percentual: float = 10.0):
    """Calcula pró-labore recomendado"""
    
    prolabore = faturamento_mensal * (percentual / 100)
    
    # INSS (11% até o teto)
    teto_inss = 7786.02  # 2025
    base_inss = min(prolabore, teto_inss)
    inss = base_inss * 0.11
    
    liquido = prolabore - inss
    
    return {
        "faturamento_mensal": faturamento_mensal,
        "percentual_sugerido": percentual,
        "prolabore_bruto": round(prolabore, 2),
        "inss": round(inss, 2),
        "prolabore_liquido": round(liquido, 2),
        "fundamentacao": ["Lei 8.212/1991", "CC Art. 1.063"]
    }

@router.post("/empresarial/valuation-simples")
async def calcular_valuation(lucro_anual: float, multiplo: float = 3.0):
    """Calcula valuation simplificado"""
    
    valuation = lucro_anual * multiplo
    
    return {
        "lucro_anual": lucro_anual,
        "multiplo_aplicado": multiplo,
        "valuation_estimado": round(valuation, 2),
        "metodo": "Múltiplo de lucro",
        "fundamentacao": ["Avaliação empresarial por fluxo de caixa"]
    }

# ==================== CONTÁBIL ====================

@router.post("/contabil/depreciacao")
async def calcular_depreciacao(valor_bem: float, vida_util_anos: int):
    """Calcula depreciação linear"""
    
    depreciacao_anual = valor_bem / vida_util_anos
    depreciacao_mensal = depreciacao_anual / 12
    
    return {
        "valor_bem": valor_bem,
        "vida_util_anos": vida_util_anos,
        "depreciacao_anual": round(depreciacao_anual, 2),
        "depreciacao_mensal": round(depreciacao_mensal, 2),
        "valor_residual_5anos": round(valor_bem - (depreciacao_anual * 5), 2),
        "fundamentacao": ["Lei 6.404/1976", "RIR/2018"]
    }

@router.post("/contabil/roi")
async def calcular_roi(investimento_inicial: float, retorno_total: float):
    """Calcula ROI (Return on Investment)"""
    
    lucro = retorno_total - investimento_inicial
    roi = (lucro / investimento_inicial) * 100 if investimento_inicial > 0 else 0
    
    return {
        "investimento_inicial": investimento_inicial,
        "retorno_total": retorno_total,
        "lucro": round(lucro, 2),
        "roi_percentual": round(roi, 2),
        "fundamentacao": ["Análise financeira empresarial"]
    }

@router.post("/contabil/roe")
async def calcular_roe(lucro_liquido: float, patrimonio_liquido: float):
    """Calcula ROE (Return on Equity)"""
    
    roe = (lucro_liquido / patrimonio_liquido) * 100 if patrimonio_liquido > 0 else 0
    
    return {
        "lucro_liquido": lucro_liquido,
        "patrimonio_liquido": patrimonio_liquido,
        "roe_percentual": round(roe, 2),
        "fundamentacao": ["Análise de rentabilidade empresarial"]
    }

# ==================== DIGITAL/FORENSE ====================

@router.post("/digital/hash-time")
async def estimar_tempo_hash(tamanho_gb: float, algoritmo: str = "sha256"):
    """Estima tempo de hash forense"""
    
    # Velocidades aproximadas (GB/s)
    velocidades = {
        "md5": 2.5,
        "sha1": 2.0,
        "sha256": 1.5,
        "sha512": 0.8
    }
    
    velocidade = velocidades.get(algoritmo.lower(), 1.5)
    tempo_segundos = tamanho_gb / velocidade
    tempo_minutos = tempo_segundos / 60
    
    return {
        "tamanho_gb": tamanho_gb,
        "algoritmo": algoritmo,
        "velocidade_estimada_gb_s": velocidade,
        "tempo_segundos": round(tempo_segundos, 2),
        "tempo_minutos": round(tempo_minutos, 2),
        "fundamentacao": ["ISO/IEC 27037", "NIST SP 800-86"]
    }

@router.post("/digital/tempo-aquisicao")
async def estimar_tempo_aquisicao(tamanho_disco_gb: float, metodo: str = "imaging"):
    """Estima tempo de aquisição forense"""
    
    velocidades = {
        "imaging": 50,      # MB/s
        "logical": 100,     # MB/s
        "bit_stream": 30    # MB/s
    }
    
    velocidade_mb_s = velocidades.get(metodo.lower(), 50)
    tamanho_mb = tamanho_disco_gb * 1024
    tempo_segundos = tamanho_mb / velocidade_mb_s
    tempo_minutos = tempo_segundos / 60
    tempo_horas = tempo_minutos / 60
    
    return {
        "tamanho_disco_gb": tamanho_disco_gb,
        "metodo": metodo,
        "velocidade_mb_s": velocidade_mb_s,
        "tempo_estimado_horas": round(tempo_horas, 2),
        "fundamentacao": ["ISO/IEC 27037", "Best practices forenses"]
    }

# ==================== CALENDÁRIO DE FERIADOS ====================

@router.get("/utils/feriados/{ano}")
async def obter_feriados(ano: int):
    """Obtém feriados nacionais (API pública)"""
    
    try:
        # API gratuita de feriados brasileiros
        response = requests.get(f"https://brasilapi.com.br/api/feriados/v1/{ano}")
        feriados = response.json()
        
        return {
            "ano": ano,
            "feriados": feriados,
            "total": len(feriados)
        }
    except Exception as e:
        # Fallback com feriados fixos
        feriados_fixos = [
            {"date": f"{ano}-01-01", "name": "Confraternização Universal"},
            {"date": f"{ano}-04-21", "name": "Tiradentes"},
            {"date": f"{ano}-05-01", "name": "Dia do Trabalho"},
            {"date": f"{ano}-09-07", "name": "Independência"},
            {"date": f"{ano}-10-12", "name": "Nossa Senhora Aparecida"},
            {"date": f"{ano}-11-02", "name": "Finados"},
            {"date": f"{ano}-11-15", "name": "Proclamação da República"},
            {"date": f"{ano}-12-25", "name": "Natal"}
        ]
        
        return {
            "ano": ano,
            "feriados": feriados_fixos,
            "total": len(feriados_fixos),
            "source": "fallback"
        }

# ==================== LISTA DE CALCULADORAS ====================

@router.get("/lista")
async def listar_calculadoras():
    """Lista todas as 54 calculadoras disponíveis"""
    
    return {
        "total": 54,
        "categorias": {
            "criminal": {
                "total": 12,
                "calculadoras": [
                    "pena-trifasico", "prescricao", "progressao", "remicao",
                    "detracao", "livramento-condicional", "pena-restritiva",
                    "suspensao-processo", "transacao-penal", "prescricao-intercorrente",
                    "prescricao-retroativa", "multa-penal"
                ]
            },
            "civil": {
                "total": 8,
                "calculadoras": [
                    "prazo", "honorarios", "custas", "sucumbencia",
                    "precatorios", "liquidacao", "juros-mora", "correcao-monetaria"
                ]
            },
            "trabalhista": {
                "total": 10,
                "calculadoras": [
                    "ferias", "13-salario", "rescisao", "fgts",
                    "horas-extras", "adicional-noturno", "insalubridade",
                    "periculosidade", "banco-horas", "aviso-previo"
                ]
            },
            "tributario": {
                "total": 8,
                "calculadoras": [
                    "irpf", "iptu", "ipva", "icms", "iss",
                    "juros-compostos", "itcmd", "simples-nacional"
                ]
            },
            "previdenciario": {
                "total": 6,
                "calculadoras": [
                    "tempo-contribuicao", "beneficio", "revisao-aposentadoria",
                    "salario-contribuicao", "carencia", "pensao-morte"
                ]
            },
            "empresarial": {
                "total": 6,
                "calculadoras": [
                    "lucro-presumido", "prolabore", "distribuicao-lucros",
                    "valuation", "simples-nacional", "ebitda"
                ]
            },
            "contabil": {
                "total": 4,
                "calculadoras": [
                    "depreciacao", "amortizacao", "roi", "roe"
                ]
            },
            "digital_forense": {
                "total": 4,
                "calculadoras": [
                    "hash-time", "tempo-aquisicao", "taxa-transferencia", "estimativa-analise"
                ]
            }
        },
        "implementadas": 16,
        "em_desenvolvimento": 38,
        "progresso": "30%"
    }
