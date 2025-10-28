"""
Automated Reports Complete - Backend API
Sistema avançado de geração de relatórios automatizados
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime, timezone
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Router
reports_complete_router = APIRouter(prefix="/api/reports", tags=["Automated Reports"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

# Templates
REPORT_TEMPLATES = [
    {
        "type": "comprehensive",
        "name": "Relatório Completo de Investigação",
        "description": "Relatório completo com todas as seções"
    },
    {
        "type": "executive",
        "name": "Relatório Executivo",
        "description": "Resumo executivo para gestão"
    },
    {
        "type": "technical",
        "name": "Relatório Técnico Pericial",
        "description": "Relatório técnico detalhado"
    },
    {
        "type": "evidence",
        "name": "Relatório de Evidências",
        "description": "Foco em evidências coletadas"
    },
    {
        "type": "timeline",
        "name": "Linha do Tempo",
        "description": "Cronologia dos eventos"
    }
]

class ReportRequest(BaseModel):
    template_type: str
    investigation_id: Optional[str] = None
    case_number: str
    investigator_name: str
    location: Optional[str] = None
    date_range: Optional[Dict] = None
    include_evidence: bool = True
    include_timeline: bool = True
    include_suspects: bool = True
    include_analysis: bool = True

@reports_complete_router.get("/templates")
async def get_templates():
    """Get all report templates"""
    return {"templates": REPORT_TEMPLATES}

@reports_complete_router.post("/generate")
async def generate_report(request: ReportRequest):
    """Generate a new report"""
    try:
        request_id = str(uuid.uuid4())
        
        # Create report record
        report = {
            "request_id": request_id,
            "template_type": request.template_type,
            "case_number": request.case_number,
            "investigator_name": request.investigator_name,
            "location": request.location,
            "date_range": request.date_range,
            "status": "processing",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "include_evidence": request.include_evidence,
            "include_timeline": request.include_timeline,
            "include_suspects": request.include_suspects,
            "include_analysis": request.include_analysis
        }
        
        await db.automated_reports.insert_one(report)
        
        # Simulate report generation
        await simulate_report_generation(request_id)
        
        return {
            "message": "Relatório gerado com sucesso",
            "request_id": request_id
        }
    
    except Exception as e:
        print(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@reports_complete_router.get("/list")
async def list_reports():
    """Get all generated reports"""
    try:
        reports = await db.automated_reports.find().to_list(length=100)
        
        for report in reports:
            if '_id' in report:
                del report['_id']
        
        return {"reports": reports}
    except Exception as e:
        print(f"Error fetching reports: {e}")
        return {"reports": []}

@reports_complete_router.get("/download/{request_id}")
async def download_report(request_id: str):
    """Download a generated report"""
    try:
        report = await db.automated_reports.find_one({"request_id": request_id})
        
        if not report:
            raise HTTPException(status_code=404, detail="Relatório não encontrado")
        
        if report.get("status") != "completed":
            raise HTTPException(status_code=400, detail="Relatório ainda em processamento")
        
        # In production, return actual PDF file
        return {"message": "Download iniciado", "request_id": request_id}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error downloading report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def simulate_report_generation(request_id: str):
    """Simulate report generation (async)"""
    try:
        # Update status to completed
        await db.automated_reports.update_one(
            {"request_id": request_id},
            {
                "$set": {
                    "status": "completed",
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
    except Exception as e:
        print(f"Error in report simulation: {e}")
        await db.automated_reports.update_one(
            {"request_id": request_id},
            {"$set": {"status": "failed"}}
        )
