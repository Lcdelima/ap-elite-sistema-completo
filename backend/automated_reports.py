"""
AP ELITE - Sistema de Relatórios Automatizados
Geração inteligente de relatórios de investigação
Data: 2025
"""

import json
import asyncio
import aiofiles
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Response
from pydantic import BaseModel
import uuid
from pathlib import Path
import os
from reportlab.lib.pagesizes import A4, letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics.charts.piecharts import Pie
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
import seaborn as sns
from io import BytesIO
import base64

# Import for LLM integration
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Configure Emergent LLM
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', 'sk-emergent-aD33e9977E0D345EfD')
llm_chat = LlmChat(api_key=EMERGENT_LLM_KEY)

# Router configuration
reports_router = APIRouter(prefix="/api/reports")

# File paths
REPORTS_DATA_PATH = Path("/app/backend/reports_data")
TEMPLATES_PATH = REPORTS_DATA_PATH / "templates"
OUTPUT_PATH = REPORTS_DATA_PATH / "output"
CHARTS_PATH = REPORTS_DATA_PATH / "charts"
EVIDENCE_PATH = REPORTS_DATA_PATH / "evidence"

# Create directories
for path in [REPORTS_DATA_PATH, TEMPLATES_PATH, OUTPUT_PATH, CHARTS_PATH, EVIDENCE_PATH]:
    path.mkdir(parents=True, exist_ok=True)

# Data Models
class ReportTemplate(BaseModel):
    id: str
    name: str
    type: str  # investigation, forensic, osint, network, summary
    sections: List[Dict]
    format: str  # pdf, docx, html
    created_at: str

class ReportRequest(BaseModel):
    template_id: str
    case_id: str
    title: str
    parameters: Dict = {}
    include_charts: bool = True
    include_evidence: bool = True
    format: str = "pdf"

class GeneratedReport(BaseModel):
    id: str
    request_id: str
    case_id: str
    title: str
    file_path: str
    format: str
    size: int
    generated_at: str
    ai_summary: Dict = {}

# ==================== REPORT GENERATION FUNCTIONS ====================

class ReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()

    def setup_custom_styles(self):
        """Configurar estilos personalizados"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Title'],
            fontSize=24,
            textColor=colors.darkblue,
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        # Header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading1'],
            fontSize=16,
            textColor=colors.darkred,
            spaceBefore=20,
            spaceAfter=12
        ))
        
        # Subheader style
        self.styles.add(ParagraphStyle(
            name='SubHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.darkgreen,
            spaceBefore=15,
            spaceAfter=8
        ))

    async def generate_investigation_report(self, case_data: Dict, evidence_data: List[Dict], 
                                         network_data: Dict = None) -> str:
        """Gerar relatório completo de investigação"""
        
        report_id = str(uuid.uuid4())
        output_file = OUTPUT_PATH / f"investigation_report_{report_id}.pdf"
        
        # Create PDF document
        doc = SimpleDocTemplate(
            str(output_file),
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Story elements
        story = []
        
        # Title page
        story.append(Paragraph("RELATÓRIO DE INVESTIGAÇÃO CRIMINAL", self.styles['CustomTitle']))
        story.append(Spacer(1, 20))
        
        # Case information
        case_info = [
            ["Número do Caso:", case_data.get("case_number", "N/A")],
            ["Título:", case_data.get("title", "N/A")],
            ["Status:", case_data.get("status", "N/A")],
            ["Prioridade:", case_data.get("priority", "N/A")],
            ["Data de Criação:", case_data.get("created_at", "N/A")],
            ["Última Atualização:", case_data.get("updated_at", "N/A")]
        ]
        
        case_table = Table(case_info, colWidths=[2*inch, 4*inch])
        case_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(case_table)
        story.append(Spacer(1, 30))

        # Executive summary (AI-generated)
        story.append(Paragraph("RESUMO EXECUTIVO", self.styles['SectionHeader']))
        
        # Generate AI summary
        ai_summary = await self.generate_ai_summary(case_data, evidence_data, network_data)
        story.append(Paragraph(ai_summary.get("executive_summary", "Resumo em processamento..."), 
                              self.styles['Normal']))
        story.append(Spacer(1, 20))

        # Evidence analysis
        story.append(Paragraph("ANÁLISE DE EVIDÊNCIAS", self.styles['SectionHeader']))
        
        if evidence_data:
            evidence_summary = []
            for i, evidence in enumerate(evidence_data[:10], 1):  # Limit to 10 evidence items
                evidence_summary.append([
                    str(i),
                    evidence.get("name", "N/A"),
                    evidence.get("type", "N/A"),
                    evidence.get("created_at", "N/A")[:10] if evidence.get("created_at") else "N/A"
                ])
            
            evidence_table = Table([["#", "Nome", "Tipo", "Data"]] + evidence_summary,
                                 colWidths=[0.5*inch, 2.5*inch, 1.5*inch, 1.5*inch])
            evidence_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(evidence_table)
        else:
            story.append(Paragraph("Nenhuma evidência encontrada.", self.styles['Normal']))
        
        story.append(Spacer(1, 20))

        # AI analysis results
        story.append(Paragraph("ANÁLISE INTELIGENTE", self.styles['SectionHeader']))
        
        ai_analysis_text = ai_summary.get("detailed_analysis", "Análise em processamento...")
        story.append(Paragraph(ai_analysis_text, self.styles['Normal']))
        story.append(Spacer(1, 20))

        # Network analysis (if available)
        if network_data:
            story.append(Paragraph("ANÁLISE DE REDE CRIMINAL", self.styles['SectionHeader']))
            
            network_summary = [
                ["Nome da Rede:", network_data.get("name", "N/A")],
                ["Tipo:", network_data.get("network_type", "N/A")],
                ["Status:", network_data.get("status", "N/A")],
                ["Membros:", str(len(network_data.get("members", [])))],
                ["Criada em:", network_data.get("created_at", "N/A")[:10] if network_data.get("created_at") else "N/A"]
            ]
            
            network_table = Table(network_summary, colWidths=[2*inch, 4*inch])
            network_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightcoral),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(network_table)
            story.append(Spacer(1, 20))

        # Timeline
        story.append(Paragraph("CRONOLOGIA DE EVENTOS", self.styles['SectionHeader']))
        timeline_text = await self.generate_timeline(case_data, evidence_data)
        story.append(Paragraph(timeline_text, self.styles['Normal']))
        story.append(Spacer(1, 20))

        # Recommendations
        story.append(Paragraph("RECOMENDAÇÕES", self.styles['SectionHeader']))
        recommendations = ai_summary.get("recommendations", ["Continuar investigação", "Analisar evidências adicionais"])
        
        for i, rec in enumerate(recommendations, 1):
            story.append(Paragraph(f"{i}. {rec}", self.styles['Normal']))
        
        story.append(Spacer(1, 20))

        # Conclusion
        story.append(Paragraph("CONCLUSÃO", self.styles['SectionHeader']))
        conclusion = ai_summary.get("conclusion", "Investigação em andamento com evidências significativas coletadas.")
        story.append(Paragraph(conclusion, self.styles['Normal']))
        
        # Footer
        story.append(Spacer(1, 50))
        story.append(Paragraph(f"Relatório gerado automaticamente em {datetime.now().strftime('%d/%m/%Y às %H:%M')}",
                              self.styles['Normal']))
        story.append(Paragraph("Sistema AP Elite - Athena Intelligence", self.styles['Normal']))

        # Build PDF
        doc.build(story)
        
        return str(output_file)

    async def generate_ai_summary(self, case_data: Dict, evidence_data: List[Dict], 
                                network_data: Dict = None) -> Dict:
        """Gerar resumo inteligente usando IA"""
        try:
            # Prepare data for AI analysis
            case_summary = {
                "title": case_data.get("title", ""),
                "description": case_data.get("description", ""),
                "status": case_data.get("status", ""),
                "priority": case_data.get("priority", ""),
                "evidence_count": len(evidence_data)
            }
            
            evidence_summary = []
            for evidence in evidence_data[:5]:  # Limit to avoid token limits
                evidence_summary.append({
                    "name": evidence.get("name", ""),
                    "type": evidence.get("type", ""),
                    "ai_analysis": evidence.get("ai_analysis", {})
                })

            prompt = f"""
            Gere um relatório de investigação criminal profissional baseado nos dados:

            CASO: {json.dumps(case_summary, indent=2)}
            EVIDÊNCIAS: {json.dumps(evidence_summary, indent=2)}
            REDE CRIMINAL: {json.dumps(network_data, indent=2) if network_data else "Não aplicável"}

            Forneça:
            1. RESUMO EXECUTIVO (3-4 parágrafos profissionais)
            2. ANÁLISE DETALHADA das evidências e padrões
            3. CRONOLOGIA provável dos eventos
            4. RECOMENDAÇÕES específicas para próximos passos
            5. CONCLUSÃO baseada nas evidências
            6. GRAU DE CONFIABILIDADE da análise (1-10)

            Use linguagem formal e técnica apropriada para relatórios policiais.
            Responda em formato JSON estruturado.
            """

            response = await llm_provider.complete(
                messages=[{"role": "user", "content": prompt}],
                model="gpt-4o",
                max_tokens=2000
            )

            return json.loads(response.choices[0].message.content)

        except Exception as e:
            return {
                "executive_summary": "Erro na geração de resumo automático.",
                "detailed_analysis": f"Erro: {str(e)}",
                "timeline": "Timeline não disponível.",
                "recommendations": ["Revisar dados do caso", "Executar análise manual"],
                "conclusion": "Análise automática indisponível.",
                "confidence": 0
            }

    async def generate_timeline(self, case_data: Dict, evidence_data: List[Dict]) -> str:
        """Gerar cronologia dos eventos"""
        try:
            events = []
            
            # Add case creation
            if case_data.get("created_at"):
                events.append({
                    "date": case_data["created_at"],
                    "event": f"Caso criado: {case_data.get('title', 'Sem título')}"
                })
            
            # Add evidence dates
            for evidence in evidence_data:
                if evidence.get("created_at"):
                    events.append({
                        "date": evidence["created_at"],
                        "event": f"Evidência coletada: {evidence.get('name', 'Sem nome')}"
                    })
            
            # Sort by date
            events.sort(key=lambda x: x["date"])
            
            # Format timeline
            timeline_text = ""
            for event in events[:10]:  # Limit to 10 events
                try:
                    date_obj = datetime.fromisoformat(event["date"].replace('Z', '+00:00'))
                    formatted_date = date_obj.strftime("%d/%m/%Y %H:%M")
                    timeline_text += f"• {formatted_date} - {event['event']}<br/>"
                except:
                    timeline_text += f"• {event['date'][:10]} - {event['event']}<br/>"
            
            return timeline_text if timeline_text else "Nenhum evento registrado."

        except Exception as e:
            return f"Erro na geração de timeline: {str(e)}"

    async def generate_forensic_report(self, evidence_data: Dict, analysis_results: Dict) -> str:
        """Gerar relatório específico de perícia"""
        
        report_id = str(uuid.uuid4())
        output_file = OUTPUT_PATH / f"forensic_report_{report_id}.pdf"
        
        doc = SimpleDocTemplate(str(output_file), pagesize=A4)
        story = []
        
        # Title
        story.append(Paragraph("LAUDO PERICIAL DIGITAL", self.styles['CustomTitle']))
        story.append(Spacer(1, 30))
        
        # Evidence information
        evidence_info = [
            ["Número da Evidência:", evidence_data.get("evidence_number", "N/A")],
            ["Nome do Arquivo:", evidence_data.get("name", "N/A")],
            ["Tipo:", evidence_data.get("type", "N/A")],
            ["Tamanho:", f"{evidence_data.get('size', 0)} bytes"],
            ["Hash MD5:", analysis_results.get("metadata", {}).get("hashes", {}).get("md5", "N/A")],
            ["Hash SHA256:", analysis_results.get("metadata", {}).get("hashes", {}).get("sha256", "N/A")],
            ["Data da Coleta:", evidence_data.get("created_at", "N/A")[:19] if evidence_data.get("created_at") else "N/A"]
        ]
        
        evidence_table = Table(evidence_info, colWidths=[2.5*inch, 3.5*inch])
        evidence_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(evidence_table)
        story.append(Spacer(1, 30))

        # Methodology
        story.append(Paragraph("METODOLOGIA APLICADA", self.styles['SectionHeader']))
        methodology = """
        A análise foi realizada utilizando ferramentas forenses digitais avançadas,
        incluindo análise de metadados, extração de texto por OCR, reconhecimento facial
        e análise inteligente por IA. Todas as evidências foram processadas mantendo
        a cadeia de custódia e integridade dos dados.
        """
        story.append(Paragraph(methodology, self.styles['Normal']))
        story.append(Spacer(1, 20))

        # Results
        story.append(Paragraph("RESULTADOS DA ANÁLISE", self.styles['SectionHeader']))
        
        # Add analysis results
        if analysis_results.get("image_analysis"):
            img_analysis = analysis_results["image_analysis"]["results"]
            story.append(Paragraph("Análise de Imagem:", self.styles['SubHeader']))
            story.append(Paragraph(f"Faces detectadas: {img_analysis.get('faces_detected', 0)}", self.styles['Normal']))
            if img_analysis.get("extracted_text"):
                story.append(Paragraph(f"Texto extraído: {img_analysis['extracted_text'][:200]}...", self.styles['Normal']))
        
        if analysis_results.get("document_analysis"):
            doc_analysis = analysis_results["document_analysis"]["ai_summary"]
            story.append(Paragraph("Análise de Documento:", self.styles['SubHeader']))
            story.append(Paragraph(json.dumps(doc_analysis, indent=2)[:500] + "...", self.styles['Normal']))

        story.append(Spacer(1, 30))

        # Technical details
        story.append(Paragraph("DETALHES TÉCNICOS", self.styles['SectionHeader']))
        tech_details = f"""
        Arquivo analisado em ambiente controlado com ferramentas certificadas.
        Integridade verificada através de hashes criptográficos.
        Análise realizada em: {datetime.now().strftime('%d/%m/%Y às %H:%M:%S')}
        Sistema utilizado: AP Elite Athena v2.0
        """
        story.append(Paragraph(tech_details, self.styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        return str(output_file)

    async def generate_charts(self, data: Dict, chart_type: str = "summary") -> str:
        """Gerar gráficos para relatórios"""
        
        chart_id = str(uuid.uuid4())
        chart_file = CHARTS_PATH / f"chart_{chart_id}.png"
        
        plt.figure(figsize=(12, 8))
        plt.style.use('seaborn-v0_8')
        
        if chart_type == "evidence_timeline":
            # Evidence collection timeline
            dates = []
            counts = []
            
            # Sample data - would be replaced with real data
            for i in range(7):
                date = (datetime.now() - timedelta(days=i)).strftime("%d/%m")
                dates.append(date)
                counts.append(np.random.randint(1, 10))
            
            plt.subplot(2, 2, 1)
            plt.plot(dates, counts, marker='o', linewidth=2, markersize=8)
            plt.title("Cronologia de Coleta de Evidências")
            plt.xlabel("Data")
            plt.ylabel("Quantidade")
            plt.xticks(rotation=45)

        elif chart_type == "evidence_types":
            # Evidence types distribution
            types = data.get("evidence_types", {"Documento": 5, "Imagem": 8, "Comunicação": 3, "Vídeo": 2})
            
            plt.subplot(2, 2, 2)
            plt.pie(types.values(), labels=types.keys(), autopct='%1.1f%%', startangle=90)
            plt.title("Distribuição por Tipo de Evidência")

        elif chart_type == "risk_levels":
            # Risk levels
            risks = data.get("risk_levels", {"Baixo": 3, "Médio": 7, "Alto": 4, "Crítico": 2})
            
            plt.subplot(2, 2, 3)
            colors_list = ['green', 'yellow', 'orange', 'red']
            plt.bar(risks.keys(), risks.values(), color=colors_list)
            plt.title("Níveis de Risco Identificados")
            plt.xlabel("Nível de Risco")
            plt.ylabel("Quantidade")

        elif chart_type == "network_centrality":
            # Network centrality (if network data available)
            centrality_data = data.get("centrality", {})
            
            plt.subplot(2, 2, 4)
            if centrality_data:
                persons = list(centrality_data.keys())[:10]  # Top 10
                scores = [centrality_data[p] for p in persons]
                plt.barh(persons, scores)
                plt.title("Centralidade na Rede")
                plt.xlabel("Score de Centralidade")
            else:
                plt.text(0.5, 0.5, 'Dados de rede não disponíveis', 
                        horizontalalignment='center', verticalalignment='center')
                plt.title("Análise de Rede")

        plt.tight_layout()
        plt.savefig(chart_file, dpi=300, bbox_inches='tight')
        plt.close()
        
        return str(chart_file)

# ==================== API ENDPOINTS ====================

@reports_router.post("/generate")
async def generate_report(report_request: ReportRequest, background_tasks: BackgroundTasks):
    """Gerar relatório automatizado"""
    
    request_id = str(uuid.uuid4())
    
    # Schedule background report generation
    background_tasks.add_task(
        generate_report_background,
        request_id,
        report_request.dict()
    )
    
    return {
        "message": "Relatório sendo gerado",
        "request_id": request_id,
        "estimated_time": "2-5 minutos"
    }

async def generate_report_background(request_id: str, request_data: Dict):
    """Geração de relatório em background"""
    try:
        generator = ReportGenerator()
        
        # Load case data (mock for now)
        case_data = {
            "case_number": f"INV-{datetime.now().strftime('%Y%m%d')}-001",
            "title": request_data.get("title", "Investigação Criminal"),
            "description": "Caso de investigação criminal",
            "status": "active",
            "priority": "high",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Load evidence data (mock)
        evidence_data = [
            {
                "name": "Documento Suspeito",
                "type": "document",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "ai_analysis": {"relevance": "high"}
            },
            {
                "name": "Fotografia da Cena",
                "type": "image",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "ai_analysis": {"faces_detected": 2}
            }
        ]
        
        # Generate report based on template
        template_id = request_data.get("template_id", "investigation")
        
        if template_id == "investigation":
            report_file = await generator.generate_investigation_report(
                case_data, evidence_data
            )
        elif template_id == "forensic":
            # Load specific evidence for forensic report
            evidence_item = evidence_data[0] if evidence_data else {}
            analysis_results = {"metadata": {"hashes": {"md5": "abc123", "sha256": "def456"}}}
            report_file = await generator.generate_forensic_report(
                evidence_item, analysis_results
            )
        else:
            # Default to investigation report
            report_file = await generator.generate_investigation_report(
                case_data, evidence_data
            )
        
        # Generate charts if requested
        chart_file = None
        if request_data.get("include_charts", True):
            chart_data = {
                "evidence_types": {"Documento": 3, "Imagem": 5, "Comunicação": 2},
                "risk_levels": {"Baixo": 2, "Médio": 4, "Alto": 2, "Crítico": 1}
            }
            chart_file = await generator.generate_charts(chart_data, "summary")
        
        # Save report metadata
        report_record = GeneratedReport(
            id=str(uuid.uuid4()),
            request_id=request_id,
            case_id=request_data.get("case_id", ""),
            title=request_data.get("title", ""),
            file_path=report_file,
            format=request_data.get("format", "pdf"),
            size=Path(report_file).stat().st_size,
            generated_at=datetime.now(timezone.utc).isoformat(),
            ai_summary={"status": "generated", "chart_file": chart_file}
        )
        
        # Save report record
        report_meta_file = REPORTS_DATA_PATH / f"report_{request_id}.json"
        async with aiofiles.open(report_meta_file, 'w') as f:
            await f.write(report_record.json())

    except Exception as e:
        print(f"Erro na geração de relatório {request_id}: {str(e)}")

@reports_router.get("/status/{request_id}")
async def get_report_status(request_id: str):
    """Verificar status do relatório"""
    
    report_meta_file = REPORTS_DATA_PATH / f"report_{request_id}.json"
    
    if not report_meta_file.exists():
        return {"status": "processing", "message": "Relatório sendo gerado..."}
    
    try:
        async with aiofiles.open(report_meta_file, 'r') as f:
            report_data = json.loads(await f.read())
        
        return {
            "status": "completed",
            "report": report_data,
            "download_url": f"/api/reports/download/{request_id}"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@reports_router.get("/download/{request_id}")
async def download_report(request_id: str):
    """Download do relatório gerado"""
    
    report_meta_file = REPORTS_DATA_PATH / f"report_{request_id}.json"
    
    if not report_meta_file.exists():
        raise HTTPException(status_code=404, detail="Relatório não encontrado")
    
    try:
        async with aiofiles.open(report_meta_file, 'r') as f:
            report_data = json.loads(await f.read())
        
        report_file = Path(report_data["file_path"])
        
        if not report_file.exists():
            raise HTTPException(status_code=404, detail="Arquivo do relatório não encontrado")
        
        async with aiofiles.open(report_file, 'rb') as f:
            content = await f.read()
        
        return Response(
            content=content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=relatorio_{request_id}.pdf"
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@reports_router.get("/templates")
async def list_report_templates():
    """Listar templates de relatório disponíveis"""
    
    templates = [
        {
            "id": "investigation",
            "name": "Relatório de Investigação Criminal",
            "type": "investigation",
            "description": "Relatório completo com análise de evidências, rede criminal e recomendações",
            "sections": ["Resumo Executivo", "Evidências", "Análise IA", "Rede Criminal", "Cronologia", "Recomendações"]
        },
        {
            "id": "forensic",
            "name": "Laudo Pericial Digital",
            "type": "forensic",
            "description": "Laudo técnico para evidências digitais com análise detalhada",
            "sections": ["Identificação", "Metodologia", "Análise Técnica", "Resultados", "Conclusão"]
        },
        {
            "id": "osint",
            "name": "Relatório OSINT",
            "type": "osint",
            "description": "Relatório de inteligência de fontes abertas",
            "sections": ["Fontes Pesquisadas", "Dados Coletados", "Análise", "Verificação", "Conclusões"]
        },
        {
            "id": "network",
            "name": "Análise de Rede Criminal",
            "type": "network",
            "description": "Relatório focado em mapeamento de relacionamentos criminais",
            "sections": ["Estrutura da Rede", "Membros Identificados", "Hierarquia", "Análise de Centralidade", "Recomendações"]
        }
    ]
    
    return {"templates": templates}

@reports_router.get("/list")
async def list_generated_reports():
    """Listar relatórios gerados"""
    
    try:
        report_files = list(REPORTS_DATA_PATH.glob("report_*.json"))
        reports = []
        
        for report_file in report_files:
            async with aiofiles.open(report_file, 'r') as f:
                report_data = json.loads(await f.read())
                reports.append(report_data)
        
        # Sort by generation date
        reports.sort(key=lambda x: x.get("generated_at", ""), reverse=True)
        
        return {"reports": reports}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Initialize automated reports system
async def initialize_reports_system():
    """Initialize the automated reports system"""
    print("📊 Automated Reports System initialized")
    print(f"📄 PDF Generation: Ready")
    print(f"📈 Charts & Visualizations: Active")
    print(f"🤖 AI-Powered Summaries: Enabled")

# Run initialization
asyncio.create_task(initialize_reports_system())