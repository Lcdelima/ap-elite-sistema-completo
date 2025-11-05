"""Geração de Petições com IA - Elite Athena"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.rag_juridico import EliteLexRAG
import os

router = APIRouter(prefix="/api/peticoes", tags=["peticoes-ia"])

rag_service = EliteLexRAG()


class PeticaoRequest(BaseModel):
    tipo: str  # inicial, contestacao, recurso, etc.
    dados: dict


class PDFExportRequest(BaseModel):
    content: str


@router.post("/gerar-ia")
async def gerar_peticao_ia(data: PeticaoRequest):
    """Gera petição usando GPT-4o"""
    
    prompts_base = {
        'inicial': '''Gere uma petição inicial completa com:
- Qualificação das partes
- Dos fatos
- Do direito (fundamentação legal)
- Dos pedidos
- Formato ABNT
- Linguagem técnica jurídica''',
        'contestacao': 'Gere uma contestação com preliminares e mérito',
        'recurso': 'Gere um recurso com razões recursais fundamentadas',
        'habeas_corpus': 'Gere um Habeas Corpus com ilegalidade ou abuso de poder'
    }
    
    prompt_base = prompts_base.get(data.tipo, 'Gere uma peça jurídica')
    
    contexto = f"""
{prompt_base}

Dados do processo:
- Tipo de ação: {data.dados.get('tipo_acao', 'N/A')}
- Fatos: {data.dados.get('fatos', 'N/A')}
- Pedidos: {data.dados.get('pedidos', 'N/A')}
- Fundamentação: {data.dados.get('fundamentacao', 'N/A')}

Gere a petição em HTML formatado, pronta para uso.
"""
    
    try:
        response = await rag_service.client.send_message(
            message=contexto,
            model="gpt-4o"
        )
        
        peticao_html = response.content
        
        return {
            'tipo': data.tipo,
            'peticao': peticao_html,
            'message': 'Petição gerada com sucesso'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar petição: {str(e)}")


@router.post("/export-pdf")
async def export_peticao_pdf(data: PDFExportRequest):
    """Exporta petição em PDF"""
    
    # TODO: Implementar geração real de PDF com weasyprint ou reportlab
    return {
        'message': 'Export PDF em desenvolvimento',
        'format': 'pdf'
    }
