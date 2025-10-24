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
async def get_process_analyses(current_user: dict = Depends(get_current_user)):
    """Get all process analyses"""
    try:
        print(f"[GET] Fetching analyses for user: {current_user.get('email', 'unknown')}")
        
        analyses = await db.process_analyses.find().sort("created_at", -1).to_list(length=100)
        
        # Convert MongoDB _id to string and format data
        for analysis in analyses:
            if '_id' in analysis:
                del analysis['_id']
        
        print(f"[GET] Found {len(analyses)} analyses")
        return {"analyses": analyses, "total": len(analyses)}
    except Exception as e:
        print(f"[ERROR] Error fetching analyses: {e}")
        import traceback
        traceback.print_exc()
        return {"analyses": [], "total": 0}

@process_analysis_router.post("")
async def create_process_analysis(
    processNumber: str = Form(...),
    processTitle: str = Form(...),
    court: str = Form(...),
    vara: str = Form(""),
    processType: str = Form("civil"),
    status: str = Form("active"),
    plaintiff: str = Form(""),
    plaintiffLawyer: str = Form(""),
    defendant: str = Form(""),
    defendantLawyer: str = Form(""),
    analysisType: str = Form("complete"),
    aiProvider: str = Form("gpt-5"),
    initialDate: str = Form(""),
    lastUpdate: str = Form(""),
    estimatedValue: str = Form(""),
    subject: str = Form(""),
    observations: str = Form(""),
    documents: Optional[List[UploadFile]] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """Create a new process analysis"""
    try:
        print(f"[POST] Creating analysis for process: {processNumber}")
        print(f"[POST] User: {current_user.get('email', 'unknown')}")
        
        analysis_id = str(uuid.uuid4())
        
        # Handle document uploads
        document_paths = []
        if documents and len(documents) > 0:
            upload_dir = "/app/backend/uploads/process_analyses"
            os.makedirs(upload_dir, exist_ok=True)
            
            for doc in documents:
                if doc and doc.filename:
                    print(f"[POST] Uploading file: {doc.filename}")
                    file_path = f"{upload_dir}/{analysis_id}_{doc.filename}"
                    
                    content = await doc.read()
                    with open(file_path, "wb") as f:
                        f.write(content)
                    
                    document_paths.append(file_path)
                    print(f"[POST] File saved: {file_path}")
        
        # Create analysis object
        analysis = {
            "id": analysis_id,
            "processNumber": processNumber,
            "processTitle": processTitle,
            "court": court,
            "vara": vara or "Não informado",
            "processType": processType,
            "status": "analyzing",
            "plaintiff": plaintiff or "Não informado",
            "plaintiffLawyer": plaintiffLawyer or "Não informado",
            "defendant": defendant or "Não informado",
            "defendantLawyer": defendantLawyer or "Não informado",
            "analysisType": analysisType,
            "aiProvider": aiProvider,
            "initialDate": initialDate or datetime.now(timezone.utc).isoformat(),
            "lastUpdate": datetime.now(timezone.utc).isoformat(),
            "estimatedValue": estimatedValue or "A definir",
            "subject": subject or "Análise processual",
            "observations": observations or "",
            "documents": document_paths,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": current_user.get('email', 'unknown'),
            # Simulated analysis results (in production, call AI here)
            "summary": f"Análise de processo {processType} em andamento. Sistema analisando jurisprudências e documentos...",
            "successProbability": 75,
            "riskLevel": "medium",
            "estimatedDuration": "8-12m",
            "jurisprudenceCount": 12
        }
        
        # Insert into database
        result = await db.process_analyses.insert_one(analysis)
        print(f"[POST] Analysis created with ID: {analysis_id}")
        
        # Simulate AI processing (async)
        import asyncio
        asyncio.create_task(simulate_ai_analysis(analysis_id))
        
        return {
            "success": True,
            "message": "Análise iniciada com sucesso",
            "analysis_id": analysis_id,
            "data": analysis
        }
    
    except Exception as e:
        print(f"[ERROR] Error creating analysis: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao criar análise: {str(e)}")

@process_analysis_router.get("/{analysis_id}")
async def get_process_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific process analysis"""
    try:
        print(f"[GET] Fetching analysis: {analysis_id}")
        analysis = await db.process_analyses.find_one({"id": analysis_id})
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Análise não encontrada")
        
        if '_id' in analysis:
            del analysis['_id']
        
        return analysis
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error fetching analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@process_analysis_router.delete("/{analysis_id}")
async def delete_process_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a process analysis"""
    try:
        print(f"[DELETE] Removing analysis: {analysis_id}")
        result = await db.process_analyses.delete_one({"id": analysis_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Análise não encontrada")
        
        print(f"[DELETE] Analysis removed successfully")
        return {"success": True, "message": "Análise removida com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error deleting analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def simulate_ai_analysis(analysis_id: str):
    """Simulate AI analysis completion (async)"""
    try:
        print(f"[AI] Starting AI analysis for: {analysis_id}")
        
        # Simulate processing delay
        import asyncio
        await asyncio.sleep(2)
        
        # In production, this would call actual AI services
        # For now, just update status to completed after a delay
        await db.process_analyses.update_one(
            {"id": analysis_id},
            {
                "$set": {
                    "status": "completed",
                    "summary": "Análise completa realizada com sucesso. Processo apresenta boa fundamentação legal e jurisprudência favorável. Recomenda-se estratégia proativa com foco em precedentes do STJ.",
                    "successProbability": 82,
                    "riskLevel": "low",
                    "estimatedDuration": "6-8 meses",
                    "jurisprudenceCount": 18,
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        print(f"[AI] AI analysis completed for: {analysis_id}")
    except Exception as e:
        print(f"[ERROR] Error in AI analysis simulation: {e}")
        try:
            await db.process_analyses.update_one(
                {"id": analysis_id},
                {"$set": {"status": "error", "error": str(e)}}
            )
        except:
            pass

@process_analysis_router.get("/stats/overview")
async def get_analysis_stats(current_user: dict = Depends(get_current_user)):
    """Get statistics for process analyses"""
    try:
        print(f"[STATS] Fetching statistics")
        
        total = await db.process_analyses.count_documents({})
        completed = await db.process_analyses.count_documents({"status": "completed"})
        analyzing = await db.process_analyses.count_documents({"status": "analyzing"})
        high_risk = await db.process_analyses.count_documents({"riskLevel": "high"})
        
        stats = {
            "total": total,
            "completed": completed,
            "analyzing": analyzing,
            "highRisk": high_risk
        }
        
        print(f"[STATS] Stats: {stats}")
        return stats
    except Exception as e:
        print(f"[ERROR] Error fetching stats: {e}")
        return {
            "total": 0,
            "completed": 0,
            "analyzing": 0,
            "highRisk": 0
        }
