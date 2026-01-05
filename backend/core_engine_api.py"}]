"""
CORE ENGINE API - Expõe Orchestrator
Permite executar QUALQUER módulo registrado
"""

from fastapi import APIRouter, HTTPException, Header, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
import os
import jwt
from motor.motor_asyncio import AsyncIOMotorClient

from core_engine.orchestrator import AthenaOrchestrator

router = APIRouter(prefix="/api/core-engine", tags=["core_engine"])

# MongoDB
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get('DB_NAME', 'ap_elite')]

# Orchestrator singleton
orchestrator = AthenaOrchestrator()

# Authentication
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}
    try:
        token = authorization.replace("Bearer ", "")
        SECRET_KEY = os.environ.get("SECRET_KEY", "ap_elite_secret_key_2024")
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return payload
        except:
            user = await db.users.find_one({"token": token}, {"_id": 0})
            if user:
                return user
            return {"id": "anonymous", "email": "anonymous@apelite.com"}
    except:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}


# Models
class ModuleExecuteRequest(BaseModel):
    module_path: str
    input_data: Dict[str, Any]


class ModuleRegisterRequest(BaseModel):
    module_path: str
    contract: Dict[str, Any]


# ========================================
# ENDPOINTS
# ========================================

@router.post("/execute")
async def execute_module(
    request: ModuleExecuteRequest,
    background_tasks: BackgroundTasks,
    authorization: str = Header(None)
):
    """
    EXECUTA QUALQUER MÓDULO REGISTRADO
    
    Este é o endpoint universal - todos os módulos usam ele
    """
    try:
        user = await get_current_user(authorization)
        
        # Adiciona operador ao input
        request.input_data["operator"] = user.get("email", "system")
        
        # Executa via orchestrator
        result = await orchestrator.execute(
            request.module_path,
            request.input_data,
            user.get("email", "system")
        )
        
        # Salva execução no MongoDB
        await db.module_executions.insert_one({
            "job_id": result.get("id"),
            "module": request.module_path,
            "user_id": user.get("id"),
            "input_data": request.input_data,
            "result": result,
            "executed_at": datetime.now(timezone.utc)
        })
        
        return {
            "status": "success",
            "job_id": result.get("id"),
            "module": request.module_path,
            "state": result.get("state"),
            "result": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na execução: {str(e)}")


@router.post("/register")
async def register_module(
    request: ModuleRegisterRequest,
    authorization: str = Header(None)
):
    """Registra novo módulo no sistema"""
    try:
        user = await get_current_user(authorization)
        
        success = orchestrator.register_module(
            request.module_path,
            request.contract
        )
        
        return {
            "status": "success" if success else "failed",
            "module": request.module_path,
            "registered_by": user.get("email")
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/registry/stats")
async def get_registry_stats():
    """Estatísticas do registro de módulos"""
    return {
        "status": "success",
        "stats": orchestrator.get_registry_stats()
    }


@router.get("/registry/modules")
async def list_registered_modules():
    """Lista todos os módulos registrados"""
    return {
        "status": "success",
        "modules": orchestrator.registry.modules
    }


@router.get("/jobs")
async def list_jobs(
    module_path: Optional[str] = None,
    authorization: str = Header(None)
):
    """Lista jobs executados"""
    try:
        user = await get_current_user(authorization)
        
        jobs = orchestrator.list_jobs(module_path)
        
        return {
            "status": "success",
            "count": len(jobs),
            "jobs": jobs
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs/{job_id}")
async def get_job_status(
    job_id: str,
    authorization: str = Header(None)
):
    """Obtém status de um job específico"""
    try:
        job = orchestrator.job_manager.get_job(job_id)
        
        if not job:
            raise HTTPException(status_code=404, detail="Job não encontrado")
        
        return {
            "status": "success",
            "job": job.get_status()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check do Core Engine"""
    return {
        "status": "healthy",
        "orchestrator": "running",
        "modules_registered": len(orchestrator.registry.modules)
    }
