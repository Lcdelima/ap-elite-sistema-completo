"""
AP ELITE ATHENA - Email Integration System
SMTP Generic + SendGrid Support
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
import uuid
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client.ap_elite

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        token_parts = credentials.credentials.split('_')
        user_id = token_parts[1]
        user = await db.users.find_one({"id": user_id, "status": "active"}, {"_id": 0, "password": 0})
        return user
    except:
        return None

email_router = APIRouter(prefix="/api/email")

def get_smtp_config():
    """Get SMTP configuration from environment or database"""
    return {
        "host": os.environ.get("SMTP_HOST", "smtp.gmail.com"),
        "port": int(os.environ.get("SMTP_PORT", "587")),
        "username": os.environ.get("SMTP_USERNAME", ""),
        "password": os.environ.get("SMTP_PASSWORD", ""),
        "use_tls": os.environ.get("SMTP_USE_TLS", "true").lower() == "true"
    }

async def send_smtp_email(to_email: str, subject: str, body: str, html_body: str = None):
    """Send email via SMTP"""
    config = get_smtp_config()
    
    if not config["username"] or not config["password"]:
        raise HTTPException(status_code=400, detail="SMTP not configured. Please set SMTP credentials in .env")
    
    msg = MIMEMultipart('alternative')
    msg['From'] = config["username"]
    msg['To'] = to_email
    msg['Subject'] = subject
    
    # Add plain text
    msg.attach(MIMEText(body, 'plain'))
    
    # Add HTML if provided
    if html_body:
        msg.attach(MIMEText(html_body, 'html'))
    
    try:
        server = smtplib.SMTP(config["host"], config["port"])
        if config["use_tls"]:
            server.starttls()
        server.login(config["username"], config["password"])
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@email_router.post("/send")
async def send_email(email_data: dict, current_user: dict = Depends(get_current_user)):
    """Send email"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    to_email = email_data.get("to")
    subject = email_data.get("subject")
    body = email_data.get("body")
    html_body = email_data.get("html_body")
    
    if not to_email or not subject or not body:
        raise HTTPException(status_code=400, detail="Missing required fields: to, subject, body")
    
    # Send email
    success = await send_smtp_email(to_email, subject, body, html_body)
    
    # Log email
    email_log = {
        "id": str(uuid.uuid4()),
        "to": to_email,
        "subject": subject,
        "body": body,
        "sent_by": current_user.get("email"),
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "status": "sent" if success else "failed"
    }
    
    await db.email_logs.insert_one(email_log)
    
    return {"message": "Email sent successfully", "email_id": email_log["id"]}

@email_router.post("/send-template")
async def send_template_email(template_data: dict, current_user: dict = Depends(get_current_user)):
    """Send email using template"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    template_name = template_data.get("template")
    to_email = template_data.get("to")
    variables = template_data.get("variables", {})
    
    # Get template
    template = await db.email_templates.find_one({"name": template_name}, {"_id": 0})
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Replace variables in template
    subject = template["subject"]
    body = template["body"]
    html_body = template.get("html_body", "")
    
    for key, value in variables.items():
        subject = subject.replace(f"{{{{{key}}}}}", str(value))
        body = body.replace(f"{{{{{key}}}}}", str(value))
        if html_body:
            html_body = html_body.replace(f"{{{{{key}}}}}", str(value))
    
    # Send email
    success = await send_smtp_email(to_email, subject, body, html_body if html_body else None)
    
    # Log email
    email_log = {
        "id": str(uuid.uuid4()),
        "to": to_email,
        "template": template_name,
        "subject": subject,
        "sent_by": current_user.get("email"),
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "status": "sent" if success else "failed"
    }
    
    await db.email_logs.insert_one(email_log)
    
    return {"message": "Email sent successfully", "email_id": email_log["id"]}

@email_router.get("/logs")
async def get_email_logs(limit: int = 50, current_user: dict = Depends(get_current_user)):
    """Get email logs"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    logs = await db.email_logs.find({}, {"_id": 0}).sort("sent_at", -1).limit(limit).to_list(limit)
    
    return {"logs": logs, "total": len(logs)}

@email_router.post("/templates/create")
async def create_email_template(template_data: dict, current_user: dict = Depends(get_current_user)):
    """Create email template"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    template = {
        "id": str(uuid.uuid4()),
        "name": template_data.get("name"),
        "subject": template_data.get("subject"),
        "body": template_data.get("body"),
        "html_body": template_data.get("html_body", ""),
        "variables": template_data.get("variables", []),
        "created_by": current_user.get("email"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.email_templates.insert_one(template)
    
    return {"message": "Template created", "template_id": template["id"]}

@email_router.get("/templates/list")
async def list_email_templates(current_user: dict = Depends(get_current_user)):
    """List email templates"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    templates = await db.email_templates.find({}, {"_id": 0}).to_list(100)
    
    return {"templates": templates}

@email_router.get("/config/status")
async def check_email_config(current_user: dict = Depends(get_current_user)):
    """Check if email is configured"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    config = get_smtp_config()
    
    is_configured = bool(config["username"] and config["password"])
    
    return {
        "configured": is_configured,
        "host": config["host"],
        "port": config["port"],
        "username": config["username"] if is_configured else "Not set",
        "use_tls": config["use_tls"]
    }