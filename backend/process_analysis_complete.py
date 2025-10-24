"""
Process Analysis Complete - Backend API
Sistema avançado de análise processual com IA
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Header
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os
import jwt
from jwt.exceptions import InvalidTokenError

# Router
process_analysis_router = APIRouter(prefix="/api/athena/process-analysis", tags=["Process Analysis"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

# JWT Secret
SECRET_KEY = os.environ.get("SECRET_KEY", "ap_elite_secret_key_2024")

# Authentication dependency
async def get_current_user(authorization: str = Header(None)):
    """Get current user from JWT token"""
    if not authorization:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}
    
    try:
        # Remove 'Bearer ' prefix if present
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except InvalidTokenError:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}
    except Exception as e:
        print(f"Auth error: {e}")
        return {"id": "anonymous", "email": "anonymous@apelite.com"}

# Models
class ProcessAnalysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    processNumber: str
    processTitle: str
    court: str
    vara: Optional[str] = None
    processType: str = "civil"
    status: str = "analyzing"
    plaintiff: Optional[str] = None
    plaintiffLawyer: Optional[str] = None
    defendant: Optional[str] = None
    defendantLawyer: Optional[str] = None
    analysisType: str = "complete"
    aiProvider: str = "gpt-5"
    initialDate: Optional[str] = None
    lastUpdate: Optional[str] = None
    estimatedValue: Optional[str] = None
    subject: Optional[str] = None
    observations: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    documents: List[str] = []
    
    # Analysis results
    summary: Optional[str] = None
    successProbability: Optional[int] = None
    riskLevel: Optional[str] = None
    estimatedDuration: Optional[str] = None
    jurisprudenceCount: Optional[int] = None

# Endpoints
@process_analysis_router.get("")
async def get_process_analyses():
    """Get all process analyses"""
    try:
        analyses = await db.process_analyses.find().to_list(length=100)
        
        # Convert MongoDB _id to string and format data
        for analysis in analyses:
            if '_id' in analysis:
                del analysis['_id']
        
        return {"analyses": analyses}
    except Exception as e:
        print(f"Error fetching analyses: {e}")
        return {"analyses": []}

@process_analysis_router.post("")
async def create_process_analysis(
    processNumber: str = Form(...),
    processTitle: str = Form(...),
    court: str = Form(...),
    vara: str = Form(None),
    processType: str = Form("civil"),
    status: str = Form("active"),
    plaintiff: str = Form(None),
    plaintiffLawyer: str = Form(None),
    defendant: str = Form(None),
    defendantLawyer: str = Form(None),
    analysisType: str = Form("complete"),
    aiProvider: str = Form("gpt-5"),
    initialDate: str = Form(None),
    lastUpdate: str = Form(None),
    estimatedValue: str = Form(None),
    subject: str = Form(None),
    observations: str = Form(None),
    documents: List[UploadFile] = File(None)
):
    """Create a new process analysis"""
    try:
        analysis_id = str(uuid.uuid4())
        
        # Handle document uploads
        document_paths = []
        if documents:
            upload_dir = "/app/backend/uploads/process_analyses"
            os.makedirs(upload_dir, exist_ok=True)
            
            for doc in documents:
                if doc:
                    file_path = f"{upload_dir}/{analysis_id}_{doc.filename}"
                    with open(file_path, "wb") as f:
                        content = await doc.read()
                        f.write(content)
                    document_paths.append(file_path)
        
        # Create analysis object
        analysis = {
            "id": analysis_id,
            "processNumber": processNumber,
            "processTitle": processTitle,
            "court": court,
            "vara": vara,
            "processType": processType,
            "status": "analyzing",
            "plaintiff": plaintiff,
            "plaintiffLawyer": plaintiffLawyer,
            "defendant": defendant,
            "defendantLawyer": defendantLawyer,
            "analysisType": analysisType,
            "aiProvider": aiProvider,
            "initialDate": initialDate,
            "lastUpdate": lastUpdate or datetime.now(timezone.utc).isoformat(),
            "estimatedValue": estimatedValue,
            "subject": subject,
            "observations": observations,
            "documents": document_paths,
            "created_at": datetime.now(timezone.utc).isoformat(),
            # Simulated analysis results (in production, call AI here)
            "summary": f"Análise processual de {processType} em andamento...",
            "successProbability": 75,
            "riskLevel": "medium",
            "estimatedDuration": "6-12m",
            "jurisprudenceCount": 12
        }
        
        # Insert into database
        await db.process_analyses.insert_one(analysis)
        
        # Simulate AI processing
        # In production, this would trigger async AI analysis
        await simulate_ai_analysis(analysis_id)
        
        return {"message": "Análise iniciada com sucesso", "analysis_id": analysis_id}
    
    except Exception as e:
        print(f"Error creating analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@process_analysis_router.get("/{analysis_id}")
async def get_process_analysis(analysis_id: str):
    """Get a specific process analysis"""
    try:
        analysis = await db.process_analyses.find_one({"id": analysis_id})
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Análise não encontrada")
        
        if '_id' in analysis:
            del analysis['_id']
        
        return analysis
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@process_analysis_router.delete("/{analysis_id}")
async def delete_process_analysis(analysis_id: str):
    """Delete a process analysis"""
    try:
        result = await db.process_analyses.delete_one({"id": analysis_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Análise não encontrada")
        
        return {"message": "Análise removida com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def simulate_ai_analysis(analysis_id: str):
    """Simulate AI analysis completion (async)"""
    try:
        # In production, this would call actual AI services
        # For now, just update status to completed after a delay
        await db.process_analyses.update_one(
            {"id": analysis_id},
            {
                "$set": {
                    "status": "completed",
                    "summary": "Análise completa realizada com sucesso. Processo com boa fundamentação legal.",
                    "successProbability": 78,
                    "riskLevel": "low",
                    "estimatedDuration": "8-10 meses",
                    "jurisprudenceCount": 15
                }
            }
        )
    except Exception as e:
        print(f"Error in AI analysis simulation: {e}")

@process_analysis_router.get("/stats/overview")
async def get_analysis_stats():
    """Get statistics for process analyses"""
    try:
        total = await db.process_analyses.count_documents({})
        completed = await db.process_analyses.count_documents({"status": "completed"})
        analyzing = await db.process_analyses.count_documents({"status": "analyzing"})
        high_risk = await db.process_analyses.count_documents({"riskLevel": "high"})
        
        return {
            "total": total,
            "completed": completed,
            "analyzing": analyzing,
            "highRisk": high_risk
        }
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return {
            "total": 0,
            "completed": 0,
            "analyzing": 0,
            "highRisk": 0
        }
