"""Sistema Completo de Calculadoras Jurídicas - 54 Calculadoras - AP Elite Gravitas™"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import math

router = APIRouter(prefix="/api/calculadoras", tags=["calculadoras"])


# ========================================
# DIREITO CRIMINAL (10 calculadoras)
# ========================================

class PenaTrifasicoRequest(BaseModel):
    pena_base_meses: int
    atenuantes: int = 0
    agravantes: int = 0
    majorantes_percentual: float = 0
    minorantes_percentual: float = 0


@router.post("/criminal/pena-trifasico")
async def calcular_pena_trifasico(data: PenaTrifasicoRequest):
    """1. Cálculo de Pena (Sistema Trifásico - Art. 68 CP)"""
    # 1ª Fase: Circunstâncias judiciais
    primeira_fase = data.pena_base_meses
    
    # 2ª Fase: Agravantes e atenuantes
    segunda_fase = primeira_fase + (data.agravantes * 2) - (data.atenuantes * 2)
    segunda_fase = max(segunda_fase, 1)
    
    # 3ª Fase: Causas de aumento e diminuição
    if data.majorantes_percentual > 0:
        segunda_fase = int(segunda_fase * (1 + data.majorantes_percentual / 100))
    if data.minorantes_percentual > 0:
        terceira_fase = int(segunda_fase * (1 - data.minorantes_percentual / 100))
    else:
        terceira_fase = segunda_fase
    
    return {
        "pena_base_meses": primeira_fase,
        "segunda_fase_meses": segunda_fase,
        "pena_final_meses": terceira_fase,
        "pena_anos": round(terceira_fase / 12, 2)
    }


class ProgressaoRegimeRequest(BaseModel):
    pena_total_meses: int
    crime_hediondo: bool = False
    reincidente: bool = False


@router.post("/criminal/progressao-regime")
async def calcular_progressao_regime(data: ProgressaoRegimeRequest):
    """2. Progressão de Regime (Art. 112 LEP)"""
    if data.crime_hediondo:
        percentual = 60 if data.reincidente else 40
    else:
        percentual = 30 if data.reincidente else 16.67
    
    tempo_necessario = int((data.pena_total_meses * percentual) / 100)
    
    return {
        "pena_total_meses": data.pena_total_meses,
        "crime_hediondo": data.crime_hediondo,
        "percentual_necessario": percentual,
        "tempo_cumprimento_meses": tempo_necessario,
        "tempo_cumprimento_anos": round(tempo_necessario / 12, 2)
    }


class RemicaoRequest(BaseModel):
    dias_trabalhados: int


@router.post("/criminal/remicao")
async def calcular_remicao(data: RemicaoRequest):
    """3. Remição de Pena por Trabalho (Art. 126 LEP)"""
    dias_remidos = data.dias_trabalhados // 3
    
    return {
        "dias_trabalhados": data.dias_trabalhados,
        "dias_remidos": dias_remidos,
        "meses_remidos": round(dias_remidos / 30, 2)
    }


class PrescricaoRequest(BaseModel):
    pena_maxima_anos: int
    data_fato: str


@router.post("/criminal/prescricao")
async def calcular_prescricao(data: PrescricaoRequest):
    """4. Prescrição Penal (Art. 109 CP)"""
    prazos = {
        1: 3, 2: 4, 4: 8, 8: 12, 12: 16
    }
    
    prazo_anos = 20
    for limite, prazo in prazos.items():
        if data.pena_maxima_anos <= limite:
            prazo_anos = prazo
            break
    
    data_fato_dt = datetime.fromisoformat(data.data_fato)
    data_prescricao = data_fato_dt + timedelta(days=prazo_anos * 365)
    prescrito = datetime.now(timezone.utc) > data_prescricao
    
    return {
        "pena_maxima_anos": data.pena_maxima_anos,
        "prazo_prescricional_anos": prazo_anos,
        "data_prescricao": data_prescricao.isoformat(),
        "prescrito": prescrito
    }


class DetracaoRequest(BaseModel):
    dias_preso_provisoriamente: int
    pena_total_meses: int


@router.post("/criminal/detracao")
async def calcular_detracao(data: DetracaoRequest):
    """5. Detração Penal (Art. 42 CP)"""
    meses_detidos = data.dias_preso_provisoriamente / 30
    pena_restante_meses = data.pena_total_meses - meses_detidos
    
    return {
        "dias_detidos": data.dias_preso_provisoriamente,
        "meses_detidos": round(meses_detidos, 2),
        "pena_total_meses": data.pena_total_meses,
        "pena_restante_meses": round(max(pena_restante_meses, 0), 2)
    }


class MultaPenalRequest(BaseModel):
    dias_multa: int
    valor_dia_multa: float


@router.post("/criminal/multa-penal")
async def calcular_multa_penal(data: MultaPenalRequest):
    """6. Multa Penal (Art. 49 CP)"""
    valor_total = data.dias_multa * data.valor_dia_multa
    
    return {
        "dias_multa": data.dias_multa,
        "valor_dia_multa": data.valor_dia_multa,
        "valor_total": round(valor_total, 2),
        "valor_formatado": f"R$ {valor_total:,.2f}"
    }


class SurisisRequest(BaseModel):
    pena_meses: int
    primario: bool = True


@router.post("/criminal/sursis")
async def calcular_sursis(data: SurisisRequest):
    """7. Sursis - Suspensão Condicional da Pena (Art. 77 CP)"""
    elegivel = data.pena_meses <= 24 and data.primario
    
    if elegivel:
        periodo_prova_anos = 2 if data.pena_meses <= 12 else 4
    else:
        periodo_prova_anos = 0
    
    return {
        "pena_meses": data.pena_meses,
        "primario": data.primario,
        "elegivel_sursis": elegivel,
        "periodo_prova_anos": periodo_prova_anos,
        "observacao": "Elegível para sursis" if elegivel else "Não elegível (pena > 2 anos ou reincidente)"
    }


class LivreCondicionalRequest(BaseModel):
    pena_total_meses: int
    crime_hediondo: bool = False


@router.post("/criminal/livramento-condicional")
async def calcular_livramento_condicional(data: LivreCondicionalRequest):
    """8. Livramento Condicional (Art. 83 CP)"""
    percentual = 60 if data.crime_hediondo else 33.33
    tempo_necessario = int((data.pena_total_meses * percentual) / 100)
    
    return {
        "pena_total_meses": data.pena_total_meses,
        "percentual_necessario": percentual,
        "tempo_cumprimento_meses": tempo_necessario,
        "tempo_cumprimento_anos": round(tempo_necessario / 12, 2)
    }


class PrestacaoServicosRequest(BaseModel):
    pena_privativa_meses: int


@router.post("/criminal/prestacao-servicos")
async def calcular_prestacao_servicos(data: PrestacaoServicosRequest):
    """9. Prestação de Serviços Comunitários"""
    horas_totais = data.pena_privativa_meses * 10
    
    return {
        "pena_privativa_meses": data.pena_privativa_meses,
        "horas_servicos": horas_totais,
        "meses_servicos": data.pena_privativa_meses
    }


class ConcursoDelitosRequest(BaseModel):
    penas_meses: List[int]


@router.post("/criminal/concurso-delitos")
async def calcular_concurso_delitos(data: ConcursoDelitosRequest):
    """10. Concurso de Crimes (Art. 70 CP)"""
    pena_mais_grave = max(data.penas_meses)
    total_penas = sum(data.penas_meses)
    
    # Concurso material (soma)
    concurso_material = total_penas
    
    # Concurso formal (aumento de 1/6 a 1/2)
    concurso_formal_min = pena_mais_grave + int(pena_mais_grave / 6)
    concurso_formal_max = pena_mais_grave + int(pena_mais_grave / 2)
    
    return {
        "penas_meses": data.penas_meses,
        "concurso_material_meses": concurso_material,
        "concurso_formal_min_meses": concurso_formal_min,
        "concurso_formal_max_meses": concurso_formal_max
    }


# ========================================
# DIREITO CIVIL (10 calculadoras)
# ========================================

class JurosRequest(BaseModel):
    valor_principal: float
    taxa_mensal: float
    meses: int


@router.post("/civil/juros-simples")
async def calcular_juros_simples(data: JurosRequest):
    """11. Juros Simples"""
    juros = data.valor_principal * (data.taxa_mensal / 100) * data.meses
    total = data.valor_principal + juros
    
    return {
        "valor_principal": data.valor_principal,
        "taxa_mensal": data.taxa_mensal,
        "meses": data.meses,
        "juros": round(juros, 2),
        "total": round(total, 2),
        "total_formatado": f"R$ {total:,.2f}"
    }


@router.post("/civil/juros-compostos")
async def calcular_juros_compostos(data: JurosRequest):
    """12. Juros Compostos"""
    montante = data.valor_principal * ((1 + data.taxa_mensal / 100) ** data.meses)
    juros = montante - data.valor_principal
    
    return {
        "valor_principal": data.valor_principal,
        "taxa_mensal": data.taxa_mensal,
        "meses": data.meses,
        "juros": round(juros, 2),
        "montante": round(montante, 2),
        "montante_formatado": f"R$ {montante:,.2f}"
    }


class CorrecaoMonetariaRequest(BaseModel):
    valor_inicial: float
    data_inicial: str
    data_final: str
    indice: str = "IPCA"


@router.post("/civil/correcao-monetaria")
async def calcular_correcao_monetaria(data: CorrecaoMonetariaRequest):
    """13. Correção Monetária"""
    # Simulação com 0.5% ao mês (ajustar com índices reais)
    data_ini = datetime.fromisoformat(data.data_inicial)
    data_fim = datetime.fromisoformat(data.data_final)
    meses = (data_fim.year - data_ini.year) * 12 + (data_fim.month - data_ini.month)
    
    taxa_mensal = 0.5  # Simulação
    valor_corrigido = data.valor_inicial * ((1 + taxa_mensal / 100) ** meses)
    correcao = valor_corrigido - data.valor_inicial
    
    return {
        "valor_inicial": data.valor_inicial,
        "meses": meses,
        "indice": data.indice,
        "correcao": round(correcao, 2),
        "valor_corrigido": round(valor_corrigido, 2),
        "valor_formatado": f"R$ {valor_corrigido:,.2f}"
    }


class HonorariosRequest(BaseModel):
    valor_causa: float
    percentual: float = 10.0


@router.post("/civil/honorarios")
async def calcular_honorarios(data: HonorariosRequest):
    """14. Honorários Advocatícios"""
    valor_honorarios = data.valor_causa * (data.percentual / 100)
    
    # Limites CPC
    if data.percentual < 10:
        valor_honorarios = data.valor_causa * 0.10
    elif data.percentual > 20:
        valor_honorarios = data.valor_causa * 0.20
    
    return {
        "valor_causa": data.valor_causa,
        "percentual": data.percentual,
        "valor_honorarios": round(valor_honorarios, 2),
        "valor_formatado": f"R$ {valor_honorarios:,.2f}"
    }


class PrazoCivilRequest(BaseModel):
    prazo_dias: int
    data_intimacao: str


@router.post("/civil/prazo-processual")
async def calcular_prazo_civil(data: PrazoCivilRequest):
    """15. Prazo Processual Civil"""
    data_intimacao_dt = datetime.fromisoformat(data.data_intimacao)
    data_vencimento = data_intimacao_dt + timedelta(days=data.prazo_dias)
    
    return {
        "prazo_dias": data.prazo_dias,
        "data_intimacao": data.data_intimacao,
        "data_vencimento": data_vencimento.isoformat(),
        "vencido": datetime.now(timezone.utc) > data_vencimento
    }


class PensaoAlimentosRequest(BaseModel):
    renda_alimentante: float
    percentual: float = 30.0


@router.post("/civil/pensao-alimentos")
async def calcular_pensao_alimentos(data: PensaoAlimentosRequest):
    """16. Pensão Alimentícia"""
    valor_pensao = data.renda_alimentante * (data.percentual / 100)
    
    return {
        "renda_alimentante": data.renda_alimentante,
        "percentual": data.percentual,
        "valor_pensao": round(valor_pensao, 2),
        "valor_formatado": f"R$ {valor_pensao:,.2f}"
    }


class IndenizacaoDanoMoralRequest(BaseModel):
    gravidade: str  # leve, media, grave
    renda_vitima: float


@router.post("/civil/dano-moral")
async def calcular_dano_moral(data: IndenizacaoDanoMoralRequest):
    """17. Indenização por Dano Moral"""
    multiplicadores = {
        "leve": 3,
        "media": 10,
        "grave": 50
    }
    
    multiplicador = multiplicadores.get(data.gravidade, 10)
    valor_indenizacao = data.renda_vitima * multiplicador
    
    return {
        "gravidade": data.gravidade,
        "renda_vitima": data.renda_vitima,
        "multiplicador": multiplicador,
        "valor_indenizacao": round(valor_indenizacao, 2),
        "valor_formatado": f"R$ {valor_indenizacao:,.2f}"
    }


class UsucapiaoRequest(BaseModel):
    anos_posse: int
    area_rural: bool = False


@router.post("/civil/usucapiao")
async def calcular_usucapiao(data: UsucapiaoRequest):
    """18. Usucapião"""
    if data.area_rural:
        tempo_necessario = 15
    else:
        tempo_necessario = 10
    
    elegivel = data.anos_posse >= tempo_necessario
    anos_faltantes = max(tempo_necessario - data.anos_posse, 0)
    
    return {
        "anos_posse": data.anos_posse,
        "area_rural": data.area_rural,
        "tempo_necessario_anos": tempo_necessario,
        "elegivel": elegivel,
        "anos_faltantes": anos_faltantes
    }


class CustasProcessuaisRequest(BaseModel):
    valor_causa: float
    estado: str = "SP"


@router.post("/civil/custas-processuais")
async def calcular_custas(data: CustasProcessuaisRequest):
    """19. Custas Processuais"""
    # Simulação (percentual varia por estado)
    percentual = 1.0  # 1% do valor da causa
    custas = data.valor_causa * (percentual / 100)
    
    return {
        "valor_causa": data.valor_causa,
        "estado": data.estado,
        "percentual": percentual,
        "custas": round(custas, 2),
        "custas_formatadas": f"R$ {custas:,.2f}"
    }


class MultaProcessualRequest(BaseModel):
    valor_causa: float
    tipo_multa: str  # litigancia_ma_fe, ato_atentatario


@router.post("/civil/multa-processual")
async def calcular_multa_processual(data: MultaProcessualRequest):
    """20. Multa Processual"""
    percentuais = {
        "litigancia_ma_fe": 1.0,
        "ato_atentatario": 20.0,
        "contempt_of_court": 20.0
    }
    
    percentual = percentuais.get(data.tipo_multa, 1.0)
    multa = data.valor_causa * (percentual / 100)
    
    return {
        "valor_causa": data.valor_causa,
        "tipo_multa": data.tipo_multa,
        "percentual": percentual,
        "multa": round(multa, 2),
        "multa_formatada": f"R$ {multa:,.2f}"
    }


# ========================================
# DIREITO TRABALHISTA (10 calculadoras)
# ========================================

class FeriasRequest(BaseModel):
    salario: float
    dias_ferias: int = 30


@router.post("/trabalhista/ferias")
async def calcular_ferias(data: FeriasRequest):
    """21. Férias"""
    valor_ferias = (data.salario / 30) * data.dias_ferias
    terco_constitucional = valor_ferias / 3
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


@router.post("/trabalhista/13-salario")
async def calcular_decimo_terceiro(data: DecimoTerceiroRequest):
    """22. 13º Salário"""
    valor_13 = (data.salario / 12) * data.meses_trabalhados
    
    return {
        "salario": data.salario,
        "meses_trabalhados": data.meses_trabalhados,
        "valor_13": round(valor_13, 2),
        "valor_formatado": f"R$ {valor_13:,.2f}"
    }


class HorasExtrasRequest(BaseModel):
    salario_base: float
    horas_extras_mes: int
    adicional_percentual: float = 50.0


@router.post("/trabalhista/horas-extras")
async def calcular_horas_extras(data: HorasExtrasRequest):
    """23. Horas Extras"""
    valor_hora = data.salario_base / 220
    valor_hora_extra = valor_hora * (1 + data.adicional_percentual / 100)
    total_horas_extras = valor_hora_extra * data.horas_extras_mes
    
    return {
        "salario_base": data.salario_base,
        "horas_extras_mes": data.horas_extras_mes,
        "adicional_percentual": data.adicional_percentual,
        "valor_hora": round(valor_hora, 2),
        "valor_hora_extra": round(valor_hora_extra, 2),
        "total": round(total_horas_extras, 2),
        "total_formatado": f"R$ {total_horas_extras:,.2f}"
    }


class AdicionalNoturnoRequest(BaseModel):
    salario_base: float
    horas_noturnas_mes: int


@router.post("/trabalhista/adicional-noturno")
async def calcular_adicional_noturno(data: AdicionalNoturnoRequest):
    """24. Adicional Noturno"""
    valor_hora = data.salario_base / 220
    adicional_noturno = valor_hora * 0.20 * data.horas_noturnas_mes
    
    return {
        "salario_base": data.salario_base,
        "horas_noturnas_mes": data.horas_noturnas_mes,
        "valor_hora": round(valor_hora, 2),
        "adicional_noturno": round(adicional_noturno, 2),
        "adicional_formatado": f"R$ {adicional_noturno:,.2f}"
    }


class InsalubridadeRequest(BaseModel):
    salario_minimo: float = 1412.00
    grau: str = "medio"


@router.post("/trabalhista/insalubridade")
async def calcular_insalubridade(data: InsalubridadeRequest):
    """25. Adicional de Insalubridade"""
    percentuais = {
        "minimo": 10,
        "medio": 20,
        "maximo": 40
    }
    
    percentual = percentuais.get(data.grau, 20)
    adicional = data.salario_minimo * (percentual / 100)
    
    return {
        "salario_minimo": data.salario_minimo,
        "grau": data.grau,
        "percentual": percentual,
        "adicional": round(adicional, 2),
        "adicional_formatado": f"R$ {adicional:,.2f}"
    }


class PericulosidadeRequest(BaseModel):
    salario_base: float


@router.post("/trabalhista/periculosidade")
async def calcular_periculosidade(data: PericulosidadeRequest):
    """26. Adicional de Periculosidade"""
    adicional = data.salario_base * 0.30
    
    return {
        "salario_base": data.salario_base,
        "percentual": 30,
        "adicional": round(adicional, 2),
        "adicional_formatado": f"R$ {adicional:,.2f}"
    }


class RescisaoRequest(BaseModel):
    salario: float
    meses_trabalhados: int
    tipo_rescisao: str
    aviso_previo_indenizado: bool = True


@router.post("/trabalhista/rescisao")
async def calcular_rescisao(data: RescisaoRequest):
    """27. Rescisão Trabalhista"""
    verbas = {}
    verbas['saldo_salario'] = data.salario
    verbas['13_proporcional'] = (data.salario / 12) * data.meses_trabalhados
    verbas['ferias_proporcionais'] = (data.salario / 12) * data.meses_trabalhados
    verbas['terco_ferias'] = verbas['ferias_proporcionais'] / 3
    
    if data.aviso_previo_indenizado and data.tipo_rescisao == "sem_justa_causa":
        verbas['aviso_previo'] = data.salario
    else:
        verbas['aviso_previo'] = 0.0
    
    if data.tipo_rescisao == "sem_justa_causa":
        saldo_fgts = data.salario * 0.08 * data.meses_trabalhados
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
    """28. FGTS"""
    deposito_mensal = data.salario * 0.08
    total_fgts = deposito_mensal * data.meses
    
    return {
        "salario": data.salario,
        "meses": data.meses,
        "deposito_mensal": round(deposito_mensal, 2),
        "total_fgts": round(total_fgts, 2),
        "total_formatado": f"R$ {total_fgts:,.2f}"
    }


class DescansoSemanalRequest(BaseModel):
    salario_base: float
    horas_extras_mes: int


@router.post("/trabalhista/dsr-horas-extras")
async def calcular_dsr_horas_extras(data: DescansoSemanalRequest):
    """29. DSR sobre Horas Extras"""
    valor_hora = data.salario_base / 220
    valor_hora_extra = valor_hora * 1.50
    total_he = valor_hora_extra * data.horas_extras_mes
    
    dias_uteis = 25
    domingos_feriados = 5
    dsr = (total_he / dias_uteis) * domingos_feriados
    
    return {
        "salario_base": data.salario_base,
        "horas_extras_mes": data.horas_extras_mes,
        "total_horas_extras": round(total_he, 2),
        "dsr": round(dsr, 2),
        "dsr_formatado": f"R$ {dsr:,.2f}"
    }


class AvisoPrevioRequest(BaseModel):
    salario: float
    anos_servico: int


@router.post("/trabalhista/aviso-previo")
async def calcular_aviso_previo(data: AvisoPrevioRequest):
    """30. Aviso Prévio Proporcional"""
    dias_base = 30
    dias_adicionais = min(data.anos_servico * 3, 60)
    dias_totais = dias_base + dias_adicionais
    
    valor = (data.salario / 30) * dias_totais
    
    return {
        "salario": data.salario,
        "anos_servico": data.anos_servico,
        "dias_base": dias_base,
        "dias_adicionais": dias_adicionais,
        "dias_totais": dias_totais,
        "valor": round(valor, 2),
        "valor_formatado": f"R$ {valor:,.2f}"
    }


# ========================================
# DIREITO PREVIDENCIÁRIO (6 calculadoras)
# ========================================

class TempoContribuicaoRequest(BaseModel):
    data_inicio: str
    data_fim: str


@router.post("/previdenciario/tempo-contribuicao")
async def calcular_tempo_contribuicao(data: TempoContribuicaoRequest):
    """31. Tempo de Contribuição"""
    inicio = datetime.fromisoformat(data.data_inicio)
    fim = datetime.fromisoformat(data.data_fim)
    
    dias = (fim - inicio).days
    anos = dias // 365
    meses = (dias % 365) // 30
    
    return {
        "data_inicio": data.data_inicio,
        "data_fim": data.data_fim,
        "dias_totais": dias,
        "anos": anos,
        "meses": meses
    }


class AposentadoriaIdadeRequest(BaseModel):
    idade: int
    tempo_contribuicao_anos: int
    sexo: str


@router.post("/previdenciario/aposentadoria-idade")
async def calcular_aposentadoria_idade(data: AposentadoriaIdadeRequest):
    """32. Aposentadoria por Idade"""
    idade_necessaria = 65 if data.sexo == "masculino" else 62
    tempo_necessario = 15
    
    elegivel = data.idade >= idade_necessaria and data.tempo_contribuicao_anos >= tempo_necessario
    anos_faltantes = max(idade_necessaria - data.idade, 0)
    
    return {
        "idade": data.idade,
        "sexo": data.sexo,
        "idade_necessaria": idade_necessaria,
        "tempo_contribuicao_anos": data.tempo_contribuicao_anos,
        "tempo_necessario": tempo_necessario,
        "elegivel": elegivel,
        "anos_faltantes": anos_faltantes
    }


class AposentadoriaTempoRequest(BaseModel):
    tempo_contribuicao_anos: int
    sexo: str


@router.post("/previdenciario/aposentadoria-tempo")
async def calcular_aposentadoria_tempo(data: AposentadoriaTempoRequest):
    """33. Aposentadoria por Tempo de Contribuição"""
    tempo_necessario = 35 if data.sexo == "masculino" else 30
    elegivel = data.tempo_contribuicao_anos >= tempo_necessario
    anos_faltantes = max(tempo_necessario - data.tempo_contribuicao_anos, 0)
    
    return {
        "tempo_contribuicao_anos": data.tempo_contribuicao_anos,
        "sexo": data.sexo,
        "tempo_necessario": tempo_necessario,
        "elegivel": elegivel,
        "anos_faltantes": anos_faltantes
    }


class SalarioBeneficioRequest(BaseModel):
    salarios_contribuicao: List[float]


@router.post("/previdenciario/salario-beneficio")
async def calcular_salario_beneficio(data: SalarioBeneficioRequest):
    """34. Salário de Benefício"""
    media = sum(data.salarios_contribuicao) / len(data.salarios_contribuicao)
    
    return {
        "salarios_contribuicao": data.salarios_contribuicao,
        "quantidade": len(data.salarios_contribuicao),
        "media": round(media, 2),
        "salario_beneficio": round(media, 2),
        "valor_formatado": f"R$ {media:,.2f}"
    }


class RMIRequest(BaseModel):
    salario_beneficio: float
    tempo_contribuicao_anos: int


@router.post("/previdenciario/rmi")
async def calcular_rmi(data: RMIRequest):
    """35. RMI - Renda Mensal Inicial"""
    if data.tempo_contribuicao_anos >= 35:
        coeficiente = 1.00
    elif data.tempo_contribuicao_anos >= 30:
        coeficiente = 0.90
    else:
        coeficiente = 0.70
    
    rmi = data.salario_beneficio * coeficiente
    
    return {
        "salario_beneficio": data.salario_beneficio,
        "tempo_contribuicao_anos": data.tempo_contribuicao_anos,
        "coeficiente": coeficiente,
        "rmi": round(rmi, 2),
        "rmi_formatada": f"R$ {rmi:,.2f}"
    }


class FatorPrevidenciarioRequest(BaseModel):
    idade: int
    tempo_contribuicao_anos: int
    expectativa_vida: float = 75.0


@router.post("/previdenciario/fator-previdenciario")
async def calcular_fator_previdenciario(data: FatorPrevidenciarioRequest):
    """36. Fator Previdenciário"""
    tc = data.tempo_contribuicao_anos
    es = data.expectativa_vida
    id = data.idade
    a = 0.31
    
    fator = (tc * a) / es * (1 + (id + tc * a) / 100)
    
    return {
        "idade": id,
        "tempo_contribuicao_anos": tc,
        "expectativa_vida": es,
        "fator_previdenciario": round(fator, 4)
    }


# ========================================
# DIREITO TRIBUTÁRIO (8 calculadoras)
# ========================================

class IRPFRequest(BaseModel):
    renda_mensal: float
    dependentes: int = 0


@router.post("/tributario/irpf")
async def calcular_irpf(data: IRPFRequest):
    """37. IRPF - Imposto de Renda Pessoa Física"""
    deducao_dependente = 189.59
    base_calculo = data.renda_mensal - (data.dependentes * deducao_dependente)
    
    if base_calculo <= 2259.20:
        aliquota = 0
        parcela_deduzir = 0
    elif base_calculo <= 2826.65:
        aliquota = 7.5
        parcela_deduzir = 169.44
    elif base_calculo <= 3751.05:
        aliquota = 15.0
        parcela_deduzir = 381.44
    elif base_calculo <= 4664.68:
        aliquota = 22.5
        parcela_deduzir = 662.77
    else:
        aliquota = 27.5
        parcela_deduzir = 896.00
    
    imposto = (base_calculo * aliquota / 100) - parcela_deduzir
    imposto = max(imposto, 0)
    
    return {
        "renda_mensal": data.renda_mensal,
        "dependentes": data.dependentes,
        "base_calculo": round(base_calculo, 2),
        "aliquota": aliquota,
        "imposto": round(imposto, 2),
        "imposto_formatado": f"R$ {imposto:,.2f}"
    }


class IRPJRequest(BaseModel):
    lucro_real: float


@router.post("/tributario/irpj")
async def calcular_irpj(data: IRPJRequest):
    """38. IRPJ - Imposto de Renda Pessoa Jurídica"""
    aliquota_base = 15.0
    aliquota_adicional = 10.0
    limite_adicional = 20000.00
    
    irpj_base = data.lucro_real * (aliquota_base / 100)
    
    if data.lucro_real > limite_adicional:
        excedente = data.lucro_real - limite_adicional
        irpj_adicional = excedente * (aliquota_adicional / 100)
    else:
        irpj_adicional = 0
    
    total = irpj_base + irpj_adicional
    
    return {
        "lucro_real": data.lucro_real,
        "irpj_base": round(irpj_base, 2),
        "irpj_adicional": round(irpj_adicional, 2),
        "total": round(total, 2),
        "total_formatado": f"R$ {total:,.2f}"
    }


class ICMSRequest(BaseModel):
    valor_produto: float
    aliquota_percentual: float = 18.0


@router.post("/tributario/icms")
async def calcular_icms(data: ICMSRequest):
    """39. ICMS"""
    icms = data.valor_produto * (data.aliquota_percentual / 100)
    
    return {
        "valor_produto": data.valor_produto,
        "aliquota": data.aliquota_percentual,
        "icms": round(icms, 2),
        "icms_formatado": f"R$ {icms:,.2f}"
    }


class ISSRequest(BaseModel):
    valor_servico: float
    aliquota_percentual: float = 5.0


@router.post("/tributario/iss")
async def calcular_iss(data: ISSRequest):
    """40. ISS - Imposto Sobre Serviços"""
    iss = data.valor_servico * (data.aliquota_percentual / 100)
    
    return {
        "valor_servico": data.valor_servico,
        "aliquota": data.aliquota_percentual,
        "iss": round(iss, 2),
        "iss_formatado": f"R$ {iss:,.2f}"
    }


class PISCOFINSRequest(BaseModel):
    receita_bruta: float


@router.post("/tributario/pis-cofins")
async def calcular_pis_cofins(data: PISCOFINSRequest):
    """41. PIS e COFINS"""
    pis = data.receita_bruta * 0.0165
    cofins = data.receita_bruta * 0.076
    total = pis + cofins
    
    return {
        "receita_bruta": data.receita_bruta,
        "pis": round(pis, 2),
        "cofins": round(cofins, 2),
        "total": round(total, 2),
        "total_formatado": f"R$ {total:,.2f}"
    }


class SimplesNacionalRequest(BaseModel):
    receita_bruta_12meses: float
    anexo: int = 3


@router.post("/tributario/simples-nacional")
async def calcular_simples_nacional(data: SimplesNacionalRequest):
    """42. Simples Nacional"""
    # Anexo III - Serviços
    if data.receita_bruta_12meses <= 180000:
        aliquota = 6.0
    elif data.receita_bruta_12meses <= 360000:
        aliquota = 11.2
    elif data.receita_bruta_12meses <= 720000:
        aliquota = 13.5
    else:
        aliquota = 16.0
    
    tributo_mensal = (data.receita_bruta_12meses / 12) * (aliquota / 100)
    
    return {
        "receita_bruta_12meses": data.receita_bruta_12meses,
        "anexo": data.anexo,
        "aliquota": aliquota,
        "tributo_mensal": round(tributo_mensal, 2),
        "tributo_formatado": f"R$ {tributo_mensal:,.2f}"
    }


class ITBIRequest(BaseModel):
    valor_imovel: float
    aliquota_percentual: float = 2.0


@router.post("/tributario/itbi")
async def calcular_itbi(data: ITBIRequest):
    """43. ITBI - Imposto sobre Transmissão de Bens Imóveis"""
    itbi = data.valor_imovel * (data.aliquota_percentual / 100)
    
    return {
        "valor_imovel": data.valor_imovel,
        "aliquota": data.aliquota_percentual,
        "itbi": round(itbi, 2),
        "itbi_formatado": f"R$ {itbi:,.2f}"
    }


class IPVARequest(BaseModel):
    valor_veiculo: float
    aliquota_percentual: float = 4.0


@router.post("/tributario/ipva")
async def calcular_ipva(data: IPVARequest):
    """44. IPVA"""
    ipva = data.valor_veiculo * (data.aliquota_percentual / 100)
    
    return {
        "valor_veiculo": data.valor_veiculo,
        "aliquota": data.aliquota_percentual,
        "ipva": round(ipva, 2),
        "ipva_formatado": f"R$ {ipva:,.2f}"
    }


# ========================================
# OUTRAS ÁREAS (10 calculadoras)
# ========================================

class MultaAmbientalRequest(BaseModel):
    tipo_infracao: str
    gravidade: str
    area_afetada_hectares: Optional[float] = None


@router.post("/ambiental/multa")
async def calcular_multa_ambiental(data: MultaAmbientalRequest):
    """45. Multa Ambiental"""
    valores_base = {
        "leve": 500.00,
        "media": 5000.00,
        "grave": 50000.00,
        "gravissima": 500000.00
    }
    
    valor_base = valores_base.get(data.gravidade, 5000.00)
    
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


class JurosCDCRequest(BaseModel):
    valor_principal: float
    meses_atraso: int


@router.post("/consumidor/juros-cdc")
async def calcular_juros_cdc(data: JurosCDCRequest):
    """46. Juros CDC (1% ao mês)"""
    taxa_mensal = 1.0
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


class PrazoEleitoralRequest(BaseModel):
    tipo_acao: str
    data_fato: str


@router.post("/eleitoral/prazo")
async def calcular_prazo_eleitoral(data: PrazoEleitoralRequest):
    """47. Prazo Eleitoral"""
    prazos = {
        "representacao": 5,
        "recurso": 3,
        "registro": 15
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


class LucroPresumidoRequest(BaseModel):
    receita_bruta: float
    atividade: str


@router.post("/empresarial/lucro-presumido")
async def calcular_lucro_presumido(data: LucroPresumidoRequest):
    """48. Lucro Presumido"""
    percentuais = {
        "servicos": 0.32,
        "comercio": 0.08,
        "industria": 0.08
    }
    
    percentual = percentuais.get(data.atividade, 0.32)
    base_calculo = data.receita_bruta * percentual
    
    irpj = base_calculo * 0.15
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


class TransgressaoDisciplinarRequest(BaseModel):
    tipo: str
    reincidencia: bool = False


@router.post("/penal-militar/transgressao")
async def calcular_punicao_militar(data: TransgressaoDisciplinarRequest):
    """49. Transgressão Disciplinar Militar"""
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


class DireitoAutoral Request(BaseModel):
    valor_obra: float
    percentual_autor: float = 10.0


@router.post("/propriedade-intelectual/direito-autoral")
async def calcular_direito_autoral(data: DireitoAutoralRequest):
    """50. Direito Autoral"""
    valor_autor = data.valor_obra * (data.percentual_autor / 100)
    
    return {
        "valor_obra": data.valor_obra,
        "percentual_autor": data.percentual_autor,
        "valor_autor": round(valor_autor, 2),
        "valor_formatado": f"R$ {valor_autor:,.2f}"
    }


class PartilhaBensRequest(BaseModel):
    total_patrimonio: float
    regime_casamento: str = "comunhao_parcial"


@router.post("/familia/partilha-bens")
async def calcular_partilha_bens(data: PartilhaBensRequest):
    """51. Partilha de Bens"""
    if data.regime_casamento == "comunhao_universal":
        percentual_conjuge = 50.0
    elif data.regime_casamento == "separacao_total":
        percentual_conjuge = 0.0
    else:  # comunhao_parcial
        percentual_conjuge = 50.0
    
    valor_conjuge = data.total_patrimonio * (percentual_conjuge / 100)
    valor_outro = data.total_patrimonio - valor_conjuge
    
    return {
        "total_patrimonio": data.total_patrimonio,
        "regime_casamento": data.regime_casamento,
        "percentual_conjuge": percentual_conjuge,
        "valor_conjuge": round(valor_conjuge, 2),
        "valor_outro": round(valor_outro, 2),
        "conjuge_formatado": f"R$ {valor_conjuge:,.2f}",
        "outro_formatado": f"R$ {valor_outro:,.2f}"
    }


class HerancaRequest(BaseModel):
    total_heranca: float
    numero_herdeiros: int
    meacao: bool = True


@router.post("/familia/heranca")
async def calcular_heranca(data: HerancaRequest):
    """52. Herança e Sucessão"""
    if data.meacao:
        heranca_partilhar = data.total_heranca * 0.50
    else:
        heranca_partilhar = data.total_heranca
    
    valor_por_herdeiro = heranca_partilhar / data.numero_herdeiros
    
    return {
        "total_heranca": data.total_heranca,
        "numero_herdeiros": data.numero_herdeiros,
        "meacao": data.meacao,
        "heranca_partilhar": round(heranca_partilhar, 2),
        "valor_por_herdeiro": round(valor_por_herdeiro, 2),
        "herdeiro_formatado": f"R$ {valor_por_herdeiro:,.2f}"
    }


class DesapropriacaoRequest(BaseModel):
    valor_mercado: float
    percentual_indenizacao: float = 100.0


@router.post("/administrativo/desapropriacao")
async def calcular_desapropriacao(data: DesapropriacaoRequest):
    """53. Desapropriação"""
    valor_indenizacao = data.valor_mercado * (data.percentual_indenizacao / 100)
    
    return {
        "valor_mercado": data.valor_mercado,
        "percentual_indenizacao": data.percentual_indenizacao,
        "valor_indenizacao": round(valor_indenizacao, 2),
        "valor_formatado": f"R$ {valor_indenizacao:,.2f}"
    }


class LicitacaoRequest(BaseModel):
    valor_referencia: float
    percentual_desconto: float = 0.0


@router.post("/administrativo/licitacao")
async def calcular_licitacao(data: LicitacaoRequest):
    """54. Licitação - Valor de Proposta"""
    valor_proposta = data.valor_referencia * (1 - data.percentual_desconto / 100)
    economia = data.valor_referencia - valor_proposta
    
    return {
        "valor_referencia": data.valor_referencia,
        "percentual_desconto": data.percentual_desconto,
        "valor_proposta": round(valor_proposta, 2),
        "economia": round(economia, 2),
        "proposta_formatada": f"R$ {valor_proposta:,.2f}",
        "economia_formatada": f"R$ {economia:,.2f}"
    }


@router.get("/lista")
async def listar_calculadoras():
    """Lista todas as 54 calculadoras disponíveis"""
    return {
        "total": 54,
        "categorias": {
            "Criminal": 10,
            "Civil": 10,
            "Trabalhista": 10,
            "Previdenciário": 6,
            "Tributário": 8,
            "Outras": 10
        },
        "calculadoras": [
            {"id": 1, "nome": "Cálculo de Pena (Trifásico)", "categoria": "Criminal", "endpoint": "/criminal/pena-trifasico"},
            {"id": 2, "nome": "Progressão de Regime", "categoria": "Criminal", "endpoint": "/criminal/progressao-regime"},
            {"id": 3, "nome": "Remição", "categoria": "Criminal", "endpoint": "/criminal/remicao"},
            {"id": 4, "nome": "Prescrição Penal", "categoria": "Criminal", "endpoint": "/criminal/prescricao"},
            {"id": 5, "nome": "Detração Penal", "categoria": "Criminal", "endpoint": "/criminal/detracao"},
            {"id": 6, "nome": "Multa Penal", "categoria": "Criminal", "endpoint": "/criminal/multa-penal"},
            {"id": 7, "nome": "Sursis", "categoria": "Criminal", "endpoint": "/criminal/sursis"},
            {"id": 8, "nome": "Livramento Condicional", "categoria": "Criminal", "endpoint": "/criminal/livramento-condicional"},
            {"id": 9, "nome": "Prestação de Serviços", "categoria": "Criminal", "endpoint": "/criminal/prestacao-servicos"},
            {"id": 10, "nome": "Concurso de Crimes", "categoria": "Criminal", "endpoint": "/criminal/concurso-delitos"},
            
            {"id": 11, "nome": "Juros Simples", "categoria": "Civil", "endpoint": "/civil/juros-simples"},
            {"id": 12, "nome": "Juros Compostos", "categoria": "Civil", "endpoint": "/civil/juros-compostos"},
            {"id": 13, "nome": "Correção Monetária", "categoria": "Civil", "endpoint": "/civil/correcao-monetaria"},
            {"id": 14, "nome": "Honorários Advocatícios", "categoria": "Civil", "endpoint": "/civil/honorarios"},
            {"id": 15, "nome": "Prazo Processual", "categoria": "Civil", "endpoint": "/civil/prazo-processual"},
            {"id": 16, "nome": "Pensão Alimentícia", "categoria": "Civil", "endpoint": "/civil/pensao-alimentos"},
            {"id": 17, "nome": "Dano Moral", "categoria": "Civil", "endpoint": "/civil/dano-moral"},
            {"id": 18, "nome": "Usucapião", "categoria": "Civil", "endpoint": "/civil/usucapiao"},
            {"id": 19, "nome": "Custas Processuais", "categoria": "Civil", "endpoint": "/civil/custas-processuais"},
            {"id": 20, "nome": "Multa Processual", "categoria": "Civil", "endpoint": "/civil/multa-processual"},
            
            {"id": 21, "nome": "Férias", "categoria": "Trabalhista", "endpoint": "/trabalhista/ferias"},
            {"id": 22, "nome": "13º Salário", "categoria": "Trabalhista", "endpoint": "/trabalhista/13-salario"},
            {"id": 23, "nome": "Horas Extras", "categoria": "Trabalhista", "endpoint": "/trabalhista/horas-extras"},
            {"id": 24, "nome": "Adicional Noturno", "categoria": "Trabalhista", "endpoint": "/trabalhista/adicional-noturno"},
            {"id": 25, "nome": "Insalubridade", "categoria": "Trabalhista", "endpoint": "/trabalhista/insalubridade"},
            {"id": 26, "nome": "Periculosidade", "categoria": "Trabalhista", "endpoint": "/trabalhista/periculosidade"},
            {"id": 27, "nome": "Rescisão", "categoria": "Trabalhista", "endpoint": "/trabalhista/rescisao"},
            {"id": 28, "nome": "FGTS", "categoria": "Trabalhista", "endpoint": "/trabalhista/fgts"},
            {"id": 29, "nome": "DSR sobre Horas Extras", "categoria": "Trabalhista", "endpoint": "/trabalhista/dsr-horas-extras"},
            {"id": 30, "nome": "Aviso Prévio", "categoria": "Trabalhista", "endpoint": "/trabalhista/aviso-previo"},
            
            {"id": 31, "nome": "Tempo de Contribuição", "categoria": "Previdenciário", "endpoint": "/previdenciario/tempo-contribuicao"},
            {"id": 32, "nome": "Aposentadoria por Idade", "categoria": "Previdenciário", "endpoint": "/previdenciario/aposentadoria-idade"},
            {"id": 33, "nome": "Aposentadoria por Tempo", "categoria": "Previdenciário", "endpoint": "/previdenciario/aposentadoria-tempo"},
            {"id": 34, "nome": "Salário de Benefício", "categoria": "Previdenciário", "endpoint": "/previdenciario/salario-beneficio"},
            {"id": 35, "nome": "RMI", "categoria": "Previdenciário", "endpoint": "/previdenciario/rmi"},
            {"id": 36, "nome": "Fator Previdenciário", "categoria": "Previdenciário", "endpoint": "/previdenciario/fator-previdenciario"},
            
            {"id": 37, "nome": "IRPF", "categoria": "Tributário", "endpoint": "/tributario/irpf"},
            {"id": 38, "nome": "IRPJ", "categoria": "Tributário", "endpoint": "/tributario/irpj"},
            {"id": 39, "nome": "ICMS", "categoria": "Tributário", "endpoint": "/tributario/icms"},
            {"id": 40, "nome": "ISS", "categoria": "Tributário", "endpoint": "/tributario/iss"},
            {"id": 41, "nome": "PIS e COFINS", "categoria": "Tributário", "endpoint": "/tributario/pis-cofins"},
            {"id": 42, "nome": "Simples Nacional", "categoria": "Tributário", "endpoint": "/tributario/simples-nacional"},
            {"id": 43, "nome": "ITBI", "categoria": "Tributário", "endpoint": "/tributario/itbi"},
            {"id": 44, "nome": "IPVA", "categoria": "Tributário", "endpoint": "/tributario/ipva"},
            
            {"id": 45, "nome": "Multa Ambiental", "categoria": "Ambiental", "endpoint": "/ambiental/multa"},
            {"id": 46, "nome": "Juros CDC", "categoria": "Consumidor", "endpoint": "/consumidor/juros-cdc"},
            {"id": 47, "nome": "Prazo Eleitoral", "categoria": "Eleitoral", "endpoint": "/eleitoral/prazo"},
            {"id": 48, "nome": "Lucro Presumido", "categoria": "Empresarial", "endpoint": "/empresarial/lucro-presumido"},
            {"id": 49, "nome": "Transgressão Militar", "categoria": "Penal Militar", "endpoint": "/penal-militar/transgressao"},
            {"id": 50, "nome": "Direito Autoral", "categoria": "Propriedade Intelectual", "endpoint": "/propriedade-intelectual/direito-autoral"},
            {"id": 51, "nome": "Partilha de Bens", "categoria": "Família", "endpoint": "/familia/partilha-bens"},
            {"id": 52, "nome": "Herança", "categoria": "Família", "endpoint": "/familia/heranca"},
            {"id": 53, "nome": "Desapropriação", "categoria": "Administrativo", "endpoint": "/administrativo/desapropriacao"},
            {"id": 54, "nome": "Licitação", "categoria": "Administrativo", "endpoint": "/administrativo/licitacao"}
        ]
    }
