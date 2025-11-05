"""Dashboard Financeiro Completo - Elite Athena"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/financial", tags=["financial"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class LancamentoFinanceiro(BaseModel):
    tipo: str  # receita, despesa
    categoria: str
    descricao: str
    valor: float
    data: str
    centro_custo: str
    forma_pagamento: str
    status: str = "pago"


@router.get("/dashboard")
async def get_financial_dashboard(mes: int = None, ano: int = None):
    """Dashboard financeiro completo"""
    
    # Período atual se não especificado
    if not mes or not ano:
        now = datetime.now()
        mes = now.month
        ano = now.year
    
    # Filtro de período
    start_date = datetime(ano, mes, 1).isoformat()
    if mes == 12:
        end_date = datetime(ano + 1, 1, 1).isoformat()
    else:
        end_date = datetime(ano, mes + 1, 1).isoformat()
    
    # Buscar lançamentos
    receitas = await db.lancamentos_financeiros.find({
        "tipo": "receita",
        "data": {"$gte": start_date, "$lt": end_date}
    }).to_list(length=None)
    
    despesas = await db.lancamentos_financeiros.find({
        "tipo": "despesa",
        "data": {"$gte": start_date, "$lt": end_date}
    }).to_list(length=None)
    
    # Calcular totais
    total_receitas = sum(r['valor'] for r in receitas)
    total_despesas = sum(d['valor'] for d in despesas)
    resultado = total_receitas - total_despesas
    
    # Receitas por categoria
    receitas_por_categoria = {}
    for r in receitas:
        cat = r.get('categoria', 'Outros')
        receitas_por_categoria[cat] = receitas_por_categoria.get(cat, 0) + r['valor']
    
    # Despesas por categoria
    despesas_por_categoria = {}
    for d in despesas:
        cat = d.get('categoria', 'Outros')
        despesas_por_categoria[cat] = despesas_por_categoria.get(cat, 0) + d['valor']
    
    # Evolução mensal (últimos 12 meses)
    evolucao = []
    for i in range(12):
        m = mes - i
        a = ano
        if m <= 0:
            m += 12
            a -= 1
        
        mes_start = datetime(a, m, 1).isoformat()
        if m == 12:
            mes_end = datetime(a + 1, 1, 1).isoformat()
        else:
            mes_end = datetime(a, m + 1, 1).isoformat()
        
        r_mes = await db.lancamentos_financeiros.find({
            "tipo": "receita",
            "data": {"$gte": mes_start, "$lt": mes_end}
        }).to_list(length=None)
        
        d_mes = await db.lancamentos_financeiros.find({
            "tipo": "despesa",
            "data": {"$gte": mes_start, "$lt": mes_end}
        }).to_list(length=None)
        
        evolucao.append({
            'mes': f"{m:02d}/{a}",
            'receitas': sum(r['valor'] for r in r_mes),
            'despesas': sum(d['valor'] for d in d_mes),
            'resultado': sum(r['valor'] for r in r_mes) - sum(d['valor'] for d in d_mes)
        })
    
    evolucao.reverse()
    
    return {
        "periodo": f"{mes:02d}/{ano}",
        "totais": {
            "receitas": round(total_receitas, 2),
            "despesas": round(total_despesas, 2),
            "resultado": round(resultado, 2),
            "margem": round((resultado / total_receitas * 100) if total_receitas > 0 else 0, 2)
        },
        "receitas_por_categoria": receitas_por_categoria,
        "despesas_por_categoria": despesas_por_categoria,
        "evolucao_12_meses": evolucao,
        "contas_a_receber": 0,  # TODO: Implementar
        "contas_a_pagar": 0      # TODO: Implementar
    }


@router.post("/lancamento")
async def criar_lancamento(data: LancamentoFinanceiro):
    """Cria lançamento financeiro"""
    
    lancamento = data.model_dump()
    lancamento['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.lancamentos_financeiros.insert_one(lancamento)
    
    return {
        "message": "Lançamento criado",
        "tipo": data.tipo,
        "valor": data.valor
    }


@router.get("/dre")
async def gerar_dre(mes: int, ano: int):
    """Gera DRE (Demonstrativo de Resultados do Exercício)"""
    
    # Período
    start_date = datetime(ano, mes, 1).isoformat()
    if mes == 12:
        end_date = datetime(ano + 1, 1, 1).isoformat()
    else:
        end_date = datetime(ano, mes + 1, 1).isoformat()
    
    # Receitas
    receitas = await db.lancamentos_financeiros.find({
        "tipo": "receita",
        "data": {"$gte": start_date, "$lt": end_date}
    }).to_list(length=None)
    
    receita_bruta = sum(r['valor'] for r in receitas)
    
    # Despesas operacionais
    despesas_op = await db.lancamentos_financeiros.find({
        "tipo": "despesa",
        "categoria": {"$in": ["pessoal", "infraestrutura", "marketing", "administrativo"]},
        "data": {"$gte": start_date, "$lt": end_date}
    }).to_list(length=None)
    
    despesas_operacionais = sum(d['valor'] for d in despesas_op)
    
    # Cálculos DRE
    lucro_bruto = receita_bruta
    lucro_operacional = lucro_bruto - despesas_operacionais
    lucro_liquido = lucro_operacional  # Simplificado
    
    return {
        "periodo": f"{mes:02d}/{ano}",
        "dre": {
            "receita_bruta": round(receita_bruta, 2),
            "deducoes": 0,  # TODO: Impostos
            "receita_liquida": round(receita_bruta, 2),
            "custos": 0,
            "lucro_bruto": round(lucro_bruto, 2),
            "despesas_operacionais": round(despesas_operacionais, 2),
            "lucro_operacional": round(lucro_operacional, 2),
            "resultado_financeiro": 0,
            "lucro_antes_impostos": round(lucro_operacional, 2),
            "impostos": 0,
            "lucro_liquido": round(lucro_liquido, 2)
        },
        "margens": {
            "margem_bruta": round((lucro_bruto / receita_bruta * 100) if receita_bruta > 0 else 0, 2),
            "margem_operacional": round((lucro_operacional / receita_bruta * 100) if receita_bruta > 0 else 0, 2),
            "margem_liquida": round((lucro_liquido / receita_bruta * 100) if receita_bruta > 0 else 0, 2)
        }
    }


@router.get("/fluxo-caixa")
async def gerar_fluxo_caixa(mes: int, ano: int):
    """Gera fluxo de caixa"""
    
    start_date = datetime(ano, mes, 1).isoformat()
    if mes == 12:
        end_date = datetime(ano + 1, 1, 1).isoformat()
    else:
        end_date = datetime(ano, mes + 1, 1).isoformat()
    
    # Entradas
    entradas = await db.lancamentos_financeiros.find({
        "tipo": "receita",
        "status": "pago",
        "data": {"$gte": start_date, "$lt": end_date}
    }).to_list(length=None)
    
    # Saídas
    saidas = await db.lancamentos_financeiros.find({
        "tipo": "despesa",
        "status": "pago",
        "data": {"$gte": start_date, "$lt": end_date}
    }).to_list(length=None)
    
    total_entradas = sum(e['valor'] for e in entradas)
    total_saidas = sum(s['valor'] for s in saidas)
    
    # Fluxo diário
    fluxo_diario = []
    current_date = datetime(ano, mes, 1)
    end_dt = datetime(ano, mes + 1, 1) if mes < 12 else datetime(ano + 1, 1, 1)
    
    saldo_acumulado = 0
    
    while current_date < end_dt:
        date_str = current_date.isoformat()
        
        entradas_dia = [e for e in entradas if e['data'].startswith(date_str.split('T')[0])]
        saidas_dia = [s for s in saidas if s['data'].startswith(date_str.split('T')[0])]
        
        entrada_dia = sum(e['valor'] for e in entradas_dia)
        saida_dia = sum(s['valor'] for s in saidas_dia)
        saldo_dia = entrada_dia - saida_dia
        saldo_acumulado += saldo_dia
        
        if entrada_dia > 0 or saida_dia > 0:  # Só dias com movimento
            fluxo_diario.append({
                'data': current_date.strftime('%d/%m'),
                'entradas': round(entrada_dia, 2),
                'saidas': round(saida_dia, 2),
                'saldo': round(saldo_dia, 2),
                'saldo_acumulado': round(saldo_acumulado, 2)
            })
        
        current_date += timedelta(days=1)
    
    return {
        "periodo": f"{mes:02d}/{ano}",
        "resumo": {
            "total_entradas": round(total_entradas, 2),
            "total_saidas": round(total_saidas, 2),
            "saldo_periodo": round(total_entradas - total_saidas, 2)
        },
        "fluxo_diario": fluxo_diario
    }
