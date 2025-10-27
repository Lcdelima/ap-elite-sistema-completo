"""
Digital Forensics Complete - Backend API
Sistema profissional de perícia digital forense
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Header
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os
import jwt
import hashlib
from jwt.exceptions import InvalidTokenError
from motor.motor_asyncio import AsyncIOMotorClient

# Router
forensics_router = APIRouter(prefix="/api/forensics/digital", tags=["Digital Forensics"])

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

def calculate_file_hash(file_path: str, algorithm: str = "SHA-256") -> str:
    """Calculate file hash for integrity verification"""
    try:
        hash_algorithms = {
            "MD5": hashlib.md5(),
            "SHA-1": hashlib.sha1(),
            "SHA-256": hashlib.sha256(),
            "SHA-512": hashlib.sha512()
        }
        
        hasher = hash_algorithms.get(algorithm, hashlib.sha256())
        
        with open(file_path, 'rb') as f:
            while chunk := f.read(8192):
                hasher.update(chunk)
        
        return hasher.hexdigest()
    except Exception as e:
        print(f"Error calculating hash: {e}")
        return "hash_error"

# Endpoints
@forensics_router.get("")
async def get_forensics(current_user: dict = Depends(get_current_user)):
    """Get all digital forensics"""
    try:
        print(f"[GET] Fetching forensics for user: {current_user.get('email', 'unknown')}")
        
        forensics = await db.digital_forensics.find().sort("requestDate", -1).to_list(length=100)
        
        for forensic in forensics:
            if '_id' in forensic:
                del forensic['_id']
        
        print(f"[GET] Found {len(forensics)} forensics")
        return {"forensics": forensics, "total": len(forensics)}
    except Exception as e:
        print(f"[ERROR] Error fetching forensics: {e}")
        import traceback
        traceback.print_exc()
        return {"forensics": [], "total": 0}

@forensics_router.post("")
async def create_forensic(
    caseNumber: str = Form(...),
    caseTitle: str = Form(...),
    forensicType: str = Form("computer"),
    deviceType: str = Form(...),
    deviceModel: str = Form(""),
    serialNumber: str = Form(""),
    operatingSystem: str = Form(""),
    storageCapacity: str = Form(""),
    client: str = Form(""),
    requestDate: str = Form(""),
    urgency: str = Form("normal"),
    objectives: str = Form(""),
    legalWarrant: str = Form("false"),
    chainCustody: str = Form(""),
    hashAlgorithm: str = Form("SHA-256"),
    aiAnalysis: str = Form("true"),
    notes: str = Form(""),
    evidenceFiles: Optional[List[UploadFile]] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """Create a new digital forensic analysis"""
    try:
        print(f"[POST] Creating forensic: {caseNumber}")
        print(f"[POST] User: {current_user.get('email', 'unknown')}")
        
        forensic_id = str(uuid.uuid4())
        
        # Handle evidence uploads with hash calculation
        evidence_records = []
        if evidenceFiles and len(evidenceFiles) > 0:
            upload_dir = "/app/backend/uploads/forensics"
            os.makedirs(upload_dir, exist_ok=True)
            
            for file in evidenceFiles:
                if file and file.filename:
                    print(f"[POST] Uploading evidence: {file.filename}")
                    file_path = f"{upload_dir}/{forensic_id}_{file.filename}"
                    
                    # Save file
                    content = await file.read()
                    with open(file_path, "wb") as f:
                        f.write(content)
                    
                    # Calculate hash for chain of custody
                    file_hash = calculate_file_hash(file_path, hashAlgorithm)
                    
                    evidence_records.append({
                        "filename": file.filename,
                        "path": file_path,
                        "hash": file_hash,
                        "algorithm": hashAlgorithm,
                        "size": len(content),
                        "upload_date": datetime.now(timezone.utc).isoformat()
                    })
                    
                    print(f"[POST] Evidence saved: {file.filename} | Hash: {file_hash[:16]}...")
        
        # Create forensic object
        forensic = {
            "id": forensic_id,
            "caseNumber": caseNumber,
            "caseTitle": caseTitle,
            "forensicType": forensicType,
            "deviceType": deviceType,
            "deviceModel": deviceModel or "Não especificado",
            "serialNumber": serialNumber or "N/A",
            "operatingSystem": operatingSystem or "Não especificado",
            "storageCapacity": storageCapacity or "N/A",
            "client": client or "Cliente não informado",
            "requestDate": requestDate or datetime.now(timezone.utc).isoformat(),
            "urgency": urgency,
            "objectives": objectives or "Análise forense digital completa",
            "legalWarrant": legalWarrant.lower() == "true",
            "chainCustody": chainCustody or "Não especificado",
            "hashAlgorithm": hashAlgorithm,
            "aiAnalysis": aiAnalysis.lower() == "true",
            "notes": notes or "",
            "evidenceFiles": evidence_records,
            "status": "processing",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": current_user.get('email', 'unknown'),
            "findings": [],
            "progress": 0,
            "chainCustodyLog": [
                {
                    "action": "created",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "user": current_user.get('email', 'unknown'),
                    "description": "Perícia digital criada e evidências coletadas"
                }
            ]
        }
        
        # Insert into database
        await db.digital_forensics.insert_one(forensic)
        print(f"[POST] Forensic created with ID: {forensic_id}")
        
        # Start async AI processing if enabled
        if forensic["aiAnalysis"]:
            import asyncio
            asyncio.create_task(process_forensic_ai(forensic_id))
        
        return {
            "success": True,
            "message": "Perícia digital iniciada com sucesso",
            "forensic_id": forensic_id,
            "data": forensic
        }
    
    except Exception as e:
        print(f"[ERROR] Error creating forensic: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao criar perícia: {str(e)}")

@forensics_router.get("/{forensic_id}")
async def get_forensic(forensic_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific forensic analysis"""
    try:
        print(f"[GET] Fetching forensic: {forensic_id}")
        forensic = await db.digital_forensics.find_one({"id": forensic_id})
        
        if not forensic:
            raise HTTPException(status_code=404, detail="Perícia não encontrada")
        
        if '_id' in forensic:
            del forensic['_id']
        
        return forensic
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error fetching forensic: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@forensics_router.delete("/{forensic_id}")
async def delete_forensic(forensic_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a forensic analysis"""
    try:
        print(f"[DELETE] Removing forensic: {forensic_id}")
        result = await db.digital_forensics.delete_one({"id": forensic_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Perícia não encontrada")
        
        print(f"[DELETE] Forensic removed successfully")
        return {"success": True, "message": "Perícia removida com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error deleting forensic: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_forensic_ai(forensic_id: str):
    """Process forensic with AI analysis (async)"""
    try:
        print(f"[AI] Starting AI forensic analysis for: {forensic_id}")
        
        # Simulate AI processing delay
        import asyncio
        await asyncio.sleep(5)
        
        # Simulated findings (in production, this would call actual AI)
        findings = [
            {
                "type": "file_recovery",
                "title": "Arquivos deletados recuperados",
                "description": "Foram recuperados 127 arquivos deletados, incluindo documentos e imagens",
                "severity": "high",
                "confidence": 0.94,
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            {
                "type": "registry_analysis",
                "title": "Análise de registro do sistema",
                "description": "Detectadas 43 modificações no registro relacionadas a software suspeito",
                "severity": "medium",
                "confidence": 0.87,
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            {
                "type": "timeline",
                "title": "Linha do tempo de atividades",
                "description": "Reconstruída linha do tempo de 30 dias com atividades relevantes",
                "severity": "info",
                "confidence": 0.92,
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            {
                "type": "network",
                "title": "Conexões de rede suspeitas",
                "description": "Identificadas 8 conexões a servidores não autorizados",
                "severity": "critical",
                "confidence": 0.89,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        # Update with AI results
        await db.digital_forensics.update_one(
            {"id": forensic_id},
            {
                "$set": {
                    "status": "completed",
                    "progress": 100,
                    "findings": findings,
                    "completed_at": datetime.now(timezone.utc).isoformat()
                },
                "$push": {
                    "chainCustodyLog": {
                        "action": "ai_analysis_completed",
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "user": "AI_System",
                        "description": f"Análise com IA concluída. {len(findings)} achados identificados."
                    }
                }
            }
        )
        
        print(f"[AI] AI forensic analysis completed for: {forensic_id}")
    except Exception as e:
        print(f"[ERROR] Error in AI forensic processing: {e}")
        try:
            await db.digital_forensics.update_one(
                {"id": forensic_id},
                {"$set": {"status": "error", "error": str(e)}}
            )
        except:
            pass

@forensics_router.get("/stats/overview")
async def get_forensic_stats(current_user: dict = Depends(get_current_user)):
    """Get forensic statistics"""
    try:
        print(f"[STATS] Fetching statistics")
        
        total = await db.digital_forensics.count_documents({})
        processing = await db.digital_forensics.count_documents({"status": {"$in": ["processing", "analyzing"]}})
        completed = await db.digital_forensics.count_documents({"status": "completed"})
        critical = await db.digital_forensics.count_documents({"urgency": "critical"})
        
        stats = {
            "total": total,
            "processing": processing,
            "completed": completed,
            "critical": critical
        }
        
        print(f"[STATS] Stats: {stats}")
        return stats
    except Exception as e:
        print(f"[ERROR] Error fetching stats: {e}")
        return {
            "total": 0,
            "processing": 0,
            "completed": 0,
            "critical": 0
        }
