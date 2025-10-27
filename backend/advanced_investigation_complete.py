"""
Advanced Investigation Complete - Backend API
Sistema profissional de investigação avançada
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Header
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os
import jwt
from jwt.exceptions import InvalidTokenError
from motor.motor_asyncio import AsyncIOMotorClient

# Router
investigation_complete_router = APIRouter(prefix="/api/investigation/advanced", tags=["Advanced Investigation"])

# MongoDB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

# JWT Secret
SECRET_KEY = os.environ.get("SECRET_KEY", "ap_elite_secret_key_2024")

# Authentication
async def get_current_user(authorization: str = Header(None)):
    """Get current user from JWT token"""
    if not authorization:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except InvalidTokenError:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}
    except Exception as e:
        print(f"Auth error: {e}")
        return {"id": "anonymous", "email": "anonymous@apelite.com"}

# Endpoints
@investigation_complete_router.get("")
async def get_investigations(current_user: dict = Depends(get_current_user)):
    """Get all investigations"""
    try:
        print(f"[GET] Fetching investigations for user: {current_user.get('email', 'unknown')}")
        
        investigations = await db.advanced_investigations.find().sort("dateStarted", -1).to_list(length=100)
        
        for inv in investigations:
            if '_id' in inv:
                del inv['_id']
        
        print(f"[GET] Found {len(investigations)} investigations")
        return {"investigations": investigations, "total": len(investigations)}
    except Exception as e:
        print(f"[ERROR] Error fetching investigations: {e}")
        import traceback
        traceback.print_exc()
        return {"investigations": [], "total": 0}

@investigation_complete_router.post("")
async def create_investigation(
    caseNumber: str = Form(...),
    caseTitle: str = Form(...),
    investigationType: str = Form("digital_forensics"),
    priority: str = Form("medium"),
    subject: str = Form(""),
    description: str = Form(""),
    location: str = Form(""),
    dateStarted: str = Form(""),
    targetName: str = Form(""),
    targetPhone: str = Form(""),
    targetEmail: str = Form(""),
    targetAddress: str = Form(""),
    evidenceTypes: str = Form("[]"),
    aiAnalysis: str = Form("true"),
    documents: Optional[List[UploadFile]] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """Create a new investigation"""
    try:
        print(f"[POST] Creating investigation: {caseNumber}")
        print(f"[POST] User: {current_user.get('email', 'unknown')}")
        
        investigation_id = str(uuid.uuid4())
        
        # Handle document uploads
        document_paths = []
        if documents and len(documents) > 0:
            upload_dir = "/app/backend/uploads/investigations"
            os.makedirs(upload_dir, exist_ok=True)
            
            for doc in documents:
                if doc and doc.filename:
                    print(f"[POST] Uploading file: {doc.filename}")
                    file_path = f"{upload_dir}/{investigation_id}_{doc.filename}"
                    
                    content = await doc.read()
                    with open(file_path, "wb") as f:
                        f.write(content)
                    
                    document_paths.append(file_path)
                    print(f"[POST] File saved: {file_path}")
        
        # Parse evidence types
        import json
        evidence_types_list = []
        try:
            evidence_types_list = json.loads(evidenceTypes)
        except:
            evidence_types_list = []
        
        # Create investigation object
        investigation = {
            "id": investigation_id,
            "caseNumber": caseNumber,
            "caseTitle": caseTitle,
            "investigationType": investigationType,
            "priority": priority,
            "subject": subject or "Investigação avançada",
            "description": description or "",
            "location": location or "Não especificado",
            "dateStarted": dateStarted or datetime.now(timezone.utc).isoformat(),
            "targetName": targetName or "Não identificado",
            "targetPhone": targetPhone or "",
            "targetEmail": targetEmail or "",
            "targetAddress": targetAddress or "",
            "evidenceTypes": evidence_types_list,
            "aiAnalysis": aiAnalysis.lower() == "true",
            "documents": document_paths,
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": current_user.get('email', 'unknown'),
            "progress": 0,
            "findings": []
        }
        
        # Insert into database
        await db.advanced_investigations.insert_one(investigation)
        print(f"[POST] Investigation created with ID: {investigation_id}")
        
        # Start async processing if AI analysis is enabled
        if investigation["aiAnalysis"]:
            import asyncio
            asyncio.create_task(process_investigation_ai(investigation_id))
        
        return {
            "success": True,
            "message": "Investigação iniciada com sucesso",
            "investigation_id": investigation_id,
            "data": investigation
        }
    
    except Exception as e:
        print(f"[ERROR] Error creating investigation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao criar investigação: {str(e)}")

@investigation_complete_router.get("/{investigation_id}")
async def get_investigation(investigation_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific investigation"""
    try:
        print(f"[GET] Fetching investigation: {investigation_id}")
        investigation = await db.advanced_investigations.find_one({"id": investigation_id})
        
        if not investigation:
            raise HTTPException(status_code=404, detail="Investigação não encontrada")
        
        if '_id' in investigation:
            del investigation['_id']
        
        return investigation
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error fetching investigation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@investigation_complete_router.delete("/{investigation_id}")
async def delete_investigation(investigation_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an investigation"""
    try:
        print(f"[DELETE] Removing investigation: {investigation_id}")
        result = await db.advanced_investigations.delete_one({"id": investigation_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Investigação não encontrada")
        
        print(f"[DELETE] Investigation removed successfully")
        return {"success": True, "message": "Investigação removida com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error deleting investigation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_investigation_ai(investigation_id: str):
    """Process investigation with AI (async)"""
    try:
        print(f"[AI] Starting AI processing for: {investigation_id}")
        
        # Simulate AI processing delay
        import asyncio
        await asyncio.sleep(3)
        
        # Update with simulated AI results
        findings = [
            {
                "type": "osint",
                "title": "Perfis de redes sociais identificados",
                "description": "Encontrados 3 perfis ativos nas redes sociais",
                "confidence": 0.85
            },
            {
                "type": "digital",
                "title": "Evidências digitais coletadas",
                "description": "Análise de metadados e histórico digital",
                "confidence": 0.92
            },
            {
                "type": "analysis",
                "title": "Padrões de comportamento identificados",
                "description": "Análise comportamental concluída",
                "confidence": 0.78
            }
        ]
        
        await db.advanced_investigations.update_one(
            {"id": investigation_id},
            {
                "$set": {
                    "status": "completed",
                    "progress": 100,
                    "findings": findings,
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        print(f"[AI] AI processing completed for: {investigation_id}")
    except Exception as e:
        print(f"[ERROR] Error in AI processing: {e}")
        try:
            await db.advanced_investigations.update_one(
                {"id": investigation_id},
                {"$set": {"status": "error", "error": str(e)}}
            )
        except:
            pass

@investigation_complete_router.get("/stats/overview")
async def get_investigation_stats(current_user: dict = Depends(get_current_user)):
    """Get investigation statistics"""
    try:
        print(f"[STATS] Fetching statistics")
        
        total = await db.advanced_investigations.count_documents({})
        active = await db.advanced_investigations.count_documents({"status": "active"})
        completed = await db.advanced_investigations.count_documents({"status": "completed"})
        high_priority = await db.advanced_investigations.count_documents({"priority": "high"})
        
        stats = {
            "total": total,
            "active": active,
            "completed": completed,
            "highPriority": high_priority
        }
        
        print(f"[STATS] Stats: {stats}")
        return stats
    except Exception as e:
        print(f"[ERROR] Error fetching stats: {e}")
        return {
            "total": 0,
            "active": 0,
            "completed": 0,
            "highPriority": 0
        }
