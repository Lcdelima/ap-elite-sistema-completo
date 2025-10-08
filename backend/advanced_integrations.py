"""
Advanced Integrations & Improvements for AP Elite ERP
- PDF Report Generation
- Email Integration (SMTP)
- Real-time Notifications
- Data Export (CSV, JSON, Excel)
- Advanced Audit System
- Backup System
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import os
import uuid
import json
import csv
import io
from pathlib import Path
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import aiofiles

# Get DB from environment
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
security = HTTPBearer(auto_error=False)

# Router
integrations_router = APIRouter(prefix="/api/integrations")

# Directories
REPORTS_DIR = Path("/app/backend/reports")
EXPORTS_DIR = Path("/app/backend/exports")
BACKUP_DIR = Path("/app/backend/backups")

for directory in [REPORTS_DIR, EXPORTS_DIR, BACKUP_DIR]:
    directory.mkdir(exist_ok=True, parents=True)

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    
    try:
        token_parts = credentials.credentials.split('_')
        user_id = token_parts[1]
        user = await db.users.find_one({"id": user_id, "active": True}, {"_id": 0, "password": 0})
        return user
    except:
        return None

# ==================== PDF REPORT GENERATION ====================

async def generate_case_report_pdf(case_id: str, user_id: str) -> str:
    """Generate comprehensive PDF report for a case"""
    
    # Fetch case data
    case = await db.cases.find_one({"id": case_id}, {"_id": 0})
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Fetch related data
    evidences = await db.evidence.find({"case_id": case_id}, {"_id": 0}).to_list(100)
    analyses = await db.interception_analysis.find({"case_id": case_id}, {"_id": 0}).to_list(100)
    financial = await db.financial_records.find({"case_id": case_id}, {"_id": 0}).to_list(100)
    
    # Generate PDF
    report_id = str(uuid.uuid4())
    filename = f"case_report_{case_id}_{report_id}.pdf"
    filepath = REPORTS_DIR / filename
    
    doc = SimpleDocTemplate(str(filepath), pagesize=A4)
    story = []
    styles = getSampleStyleSheet()
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#06b6d4'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    story.append(Paragraph("AP ELITE - Relatório de Caso", title_style))
    story.append(Spacer(1, 12))
    
    # Case Information
    story.append(Paragraph("Informações do Caso", styles['Heading2']))
    story.append(Spacer(1, 12))
    
    case_data = [
        ['Número do Caso:', case.get('case_number', 'N/A')],
        ['Título:', case.get('title', 'N/A')],
        ['Status:', case.get('status', 'N/A')],
        ['Prioridade:', case.get('priority', 'N/A')],
        ['Data de Início:', case.get('start_date', 'N/A')[:10] if case.get('start_date') else 'N/A'],
        ['Tipo de Serviço:', case.get('service_type', 'N/A')],
    ]
    
    t = Table(case_data, colWidths=[2*inch, 4*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e2e8f0')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey)
    ]))
    story.append(t)
    story.append(Spacer(1, 20))
    
    # Description
    story.append(Paragraph("Descrição", styles['Heading2']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(case.get('description', 'Sem descrição'), styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Evidences
    if evidences:
        story.append(Paragraph(f"Evidências ({len(evidences)})", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        evidence_data = [['#', 'Número', 'Nome', 'Tipo', 'Status']]
        for idx, ev in enumerate(evidences, 1):
            evidence_data.append([
                str(idx),
                ev.get('evidence_number', 'N/A'),
                ev.get('name', 'N/A')[:30],
                ev.get('type', 'N/A'),
                ev.get('analysis_status', 'N/A')
            ])
        
        t = Table(evidence_data, colWidths=[0.5*inch, 1*inch, 2*inch, 1*inch, 1*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#06b6d4')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        story.append(t)
        story.append(Spacer(1, 20))
    
    # Analyses
    if analyses:
        story.append(Paragraph(f"Análises Realizadas ({len(analyses)})", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        for idx, analysis in enumerate(analyses, 1):
            story.append(Paragraph(f"Análise #{idx} - {analysis.get('analysis_type', 'N/A')}", styles['Heading3']))
            story.append(Paragraph(f"Status: {analysis.get('status', 'N/A')}", styles['Normal']))
            story.append(Paragraph(f"Data: {analysis.get('analysis_date', 'N/A')[:10] if analysis.get('analysis_date') else 'N/A'}", styles['Normal']))
            story.append(Spacer(1, 10))
    
    # Financial Summary
    if financial:
        story.append(PageBreak())
        story.append(Paragraph("Resumo Financeiro", styles['Heading2']))
        story.append(Spacer(1, 12))
        
        total_income = sum(f.get('amount', 0) for f in financial if f.get('type') in ['income', 'fee'])
        total_expenses = sum(f.get('amount', 0) for f in financial if f.get('type') in ['expense', 'cost'])
        net = total_income - total_expenses
        
        financial_summary = [
            ['Receitas:', f'R$ {total_income:,.2f}'],
            ['Despesas:', f'R$ {total_expenses:,.2f}'],
            ['Saldo:', f'R$ {net:,.2f}']
        ]
        
        t = Table(financial_summary, colWidths=[2*inch, 2*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#06b6d4')),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.whitesmoke),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        story.append(t)
    
    # Footer
    story.append(Spacer(1, 40))
    footer_text = f"Relatório gerado em {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')} | AP Elite - Perícia Criminal e Advocacia"
    story.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)))
    
    # Build PDF
    doc.build(story)
    
    # Log report generation
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "action": "generate_report",
        "resource_type": "case",
        "resource_id": case_id,
        "details": {"report_file": filename},
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    
    return filename

@integrations_router.post("/reports/case/{case_id}")
async def generate_case_report(case_id: str, current_user: dict = Depends(get_current_user)):
    """Generate PDF report for a case"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    try:
        filename = await generate_case_report_pdf(case_id, current_user['id'])
        return {
            "status": "success",
            "filename": filename,
            "download_url": f"/api/integrations/reports/download/{filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

@integrations_router.get("/reports/download/{filename}")
async def download_report(filename: str, current_user: dict = Depends(get_current_user)):
    """Download generated report"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    filepath = REPORTS_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    
    async with aiofiles.open(filepath, 'rb') as f:
        content = await f.read()
    
    return Response(
        content=content,
        media_type='application/pdf',
        headers={'Content-Disposition': f'attachment; filename="{filename}"'}
    )

# ==================== EMAIL INTEGRATION ====================

async def send_email_smtp(
    to_email: str,
    subject: str,
    body_html: str,
    attachment_path: Optional[str] = None
):
    """Send email using SMTP (configurable)"""
    
    # Email configuration (should be in .env in production)
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_username = os.getenv('SMTP_USERNAME', 'noreply@apelite.com')
    smtp_password = os.getenv('SMTP_PASSWORD', '')
    
    # Create message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = smtp_username
    msg['To'] = to_email
    
    # Add HTML body
    html_part = MIMEText(body_html, 'html')
    msg.attach(html_part)
    
    # Add attachment if provided
    if attachment_path and os.path.exists(attachment_path):
        with open(attachment_path, 'rb') as f:
            attachment = MIMEApplication(f.read(), _subtype='pdf')
            attachment.add_header('Content-Disposition', 'attachment', filename=os.path.basename(attachment_path))
            msg.attach(attachment)
    
    # Send email (simulated if no credentials)
    try:
        if smtp_password:
            async with aiosmtplib.SMTP(hostname=smtp_server, port=smtp_port) as smtp:
                await smtp.starttls()
                await smtp.login(smtp_username, smtp_password)
                await smtp.send_message(msg)
            return True
        else:
            # Simulate sending
            print(f"[EMAIL SIMULATION] To: {to_email}, Subject: {subject}")
            return True
    except Exception as e:
        print(f"Email send error: {e}")
        return False

@integrations_router.post("/email/send-report")
async def send_report_email(
    case_id: str,
    recipient_email: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Generate report and send via email"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Generate report
    filename = await generate_case_report_pdf(case_id, current_user['id'])
    filepath = REPORTS_DIR / filename
    
    # Get case info
    case = await db.cases.find_one({"id": case_id}, {"_id": 0})
    
    # Email body
    body_html = f"""
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2 style="color: #06b6d4;">AP Elite - Relatório de Caso</h2>
        <p>Prezado(a),</p>
        <p>Segue em anexo o relatório do caso <strong>{case.get('case_number', 'N/A')}</strong>.</p>
        <p><strong>Título:</strong> {case.get('title', 'N/A')}</p>
        <p><strong>Status:</strong> {case.get('status', 'N/A')}</p>
        <br>
        <p>Atenciosamente,<br>
        <strong>AP Elite - Perícia Criminal e Advocacia</strong></p>
        <p style="color: #666; font-size: 12px;">Este é um email automático. Por favor, não responda.</p>
    </body>
    </html>
    """
    
    # Send email in background
    background_tasks.add_task(
        send_email_smtp,
        recipient_email,
        f"Relatório de Caso - {case.get('case_number')}",
        body_html,
        str(filepath)
    )
    
    return {
        "status": "success",
        "message": "Email will be sent in background",
        "recipient": recipient_email
    }

# ==================== DATA EXPORT ====================

@integrations_router.get("/export/cases/csv")
async def export_cases_csv(current_user: dict = Depends(get_current_user)):
    """Export all cases to CSV"""
    if not current_user or current_user.get("role") not in ["administrator", "analyst"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    cases = await db.cases.find({}, {"_id": 0}).to_list(1000)
    
    # Create CSV in memory
    output = io.StringIO()
    if cases:
        fieldnames = ['id', 'case_number', 'title', 'status', 'priority', 'start_date', 'client_id', 'service_type']
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(cases)
    
    csv_content = output.getvalue()
    output.close()
    
    return Response(
        content=csv_content,
        media_type='text/csv',
        headers={'Content-Disposition': 'attachment; filename="cases_export.csv"'}
    )

@integrations_router.get("/export/cases/json")
async def export_cases_json(current_user: dict = Depends(get_current_user)):
    """Export all cases to JSON"""
    if not current_user or current_user.get("role") not in ["administrator", "analyst"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    cases = await db.cases.find({}, {"_id": 0}).to_list(1000)
    
    return Response(
        content=json.dumps(cases, indent=2, default=str),
        media_type='application/json',
        headers={'Content-Disposition': 'attachment; filename="cases_export.json"'}
    )

@integrations_router.get("/export/analytics/json")
async def export_analytics_json(current_user: dict = Depends(get_current_user)):
    """Export analytics data to JSON"""
    if not current_user or current_user.get("role") not in ["administrator", "analyst"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Gather analytics data
    analytics = {
        "export_date": datetime.now(timezone.utc).isoformat(),
        "total_cases": await db.cases.count_documents({}),
        "active_cases": await db.cases.count_documents({"status": "active"}),
        "total_evidence": await db.evidence.count_documents({}),
        "total_users": await db.users.count_documents({"active": True}),
        "cases_by_status": [],
        "evidence_by_type": []
    }
    
    # Cases by status
    pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    cases_by_status = await db.cases.aggregate(pipeline).to_list(None)
    analytics["cases_by_status"] = cases_by_status
    
    # Evidence by type
    pipeline = [{"$group": {"_id": "$type", "count": {"$sum": 1}}}]
    evidence_by_type = await db.evidence.aggregate(pipeline).to_list(None)
    analytics["evidence_by_type"] = evidence_by_type
    
    return Response(
        content=json.dumps(analytics, indent=2, default=str),
        media_type='application/json',
        headers={'Content-Disposition': 'attachment; filename="analytics_export.json"'}
    )

# ==================== BACKUP SYSTEM ====================

@integrations_router.post("/backup/create")
async def create_backup(current_user: dict = Depends(get_current_user)):
    """Create database backup"""
    if not current_user or current_user.get("role") != "administrator":
        raise HTTPException(status_code=403, detail="Administrator access required")
    
    backup_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')
    backup_filename = f"backup_{timestamp}_{backup_id}.json"
    backup_path = BACKUP_DIR / backup_filename
    
    # Collect all data
    backup_data = {
        "backup_id": backup_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "collections": {}
    }
    
    # Backup each collection
    collections = ['users', 'cases', 'evidence', 'financial_records', 'meetings', 'messages', 'tasks', 'iped_projects', 'interception_analysis']
    
    for collection_name in collections:
        try:
            data = await db[collection_name].find({}, {"_id": 0}).to_list(10000)
            backup_data["collections"][collection_name] = data
        except Exception as e:
            print(f"Error backing up {collection_name}: {e}")
    
    # Save backup
    async with aiofiles.open(backup_path, 'w') as f:
        await f.write(json.dumps(backup_data, indent=2, default=str))
    
    # Log backup
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user['id'],
        "action": "create_backup",
        "resource_type": "system",
        "resource_id": backup_id,
        "details": {"backup_file": backup_filename},
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "status": "success",
        "backup_id": backup_id,
        "filename": backup_filename,
        "download_url": f"/api/integrations/backup/download/{backup_filename}"
    }

@integrations_router.get("/backup/download/{filename}")
async def download_backup(filename: str, current_user: dict = Depends(get_current_user)):
    """Download backup file"""
    if not current_user or current_user.get("role") != "administrator":
        raise HTTPException(status_code=403, detail="Administrator access required")
    
    filepath = BACKUP_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Backup not found")
    
    async with aiofiles.open(filepath, 'rb') as f:
        content = await f.read()
    
    return Response(
        content=content,
        media_type='application/json',
        headers={'Content-Disposition': f'attachment; filename="{filename}"'}
    )

# ==================== ADVANCED AUDIT LOG ====================

@integrations_router.get("/audit/logs")
async def get_audit_logs(
    limit: int = 100,
    user_id: Optional[str] = None,
    action: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get audit logs with filters"""
    if not current_user or current_user.get("role") not in ["administrator", "analyst"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if user_id:
        query["user_id"] = user_id
    if action:
        query["action"] = action
    
    logs = await db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return {"logs": logs, "total": len(logs)}

@integrations_router.get("/audit/activity-summary")
async def get_activity_summary(current_user: dict = Depends(get_current_user)):
    """Get user activity summary"""
    if not current_user or current_user.get("role") not in ["administrator", "analyst"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Activity by action
    pipeline = [
        {"$group": {"_id": "$action", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    activity_by_action = await db.audit_logs.aggregate(pipeline).to_list(None)
    
    # Activity by user
    pipeline = [
        {"$group": {"_id": "$user_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    activity_by_user = await db.audit_logs.aggregate(pipeline).to_list(None)
    
    # Recent activity
    recent = await db.audit_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(20).to_list(20)
    
    return {
        "activity_by_action": activity_by_action,
        "top_users": activity_by_user,
        "recent_activity": recent
    }
