"""
ATHENA MOBILE FORENSICS ENGINE - API FastAPI
Integração com AP Elite Gravitas
Superior ao Cellebrite e Oxygen Forensic
"""

from fastapi import APIRouter, HTTPException, Header, UploadFile, File, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import os
import uuid
import hashlib
import jwt
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path

from athena_mobile.core.device_identifier import AthenaDeviceIdentifier, ForensicDeviceProfile
from athena_mobile.core.extraction_mode_selector import AthenaModeSelector
from athena_mobile.core.exploit_manager import AthenaExploitManager
from athena_mobile.extractors.artifact_extractor import ArtifactExtractor

router = APIRouter(prefix="/api/athena-mobile", tags=["athena_mobile_forensics"])

# MongoDB
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get('DB_NAME', 'ap_elite')]

# Paths
EVIDENCE_BASE = Path("/app/backend/evidence/athena_mobile")
EVIDENCE_BASE.mkdir(exist_ok=True, parents=True)

# Authentication
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
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
            raise HTTPException(status_code=401, detail="Token inválido")
    except:
        raise HTTPException(status_code=401, detail="Token inválido")


# ========================================
# MODELS
# ========================================

class ExtractionCreate(BaseModel):
    caso_id: str
    dispositivo_tipo: str
    dispositivo_marca: str
    dispositivo_modelo: str
    numero_serie: Optional[str] = None
    imei: Optional[str] = None
    sistema_operacional: str
    modo_extracao: Optional[str] = None


class ExploitApply(BaseModel):
    exploit_id: str
    justification: str


# ========================================
# ENDPOINTS - ETAPA 1: IDENTIFICAÇÃO
# ========================================

@router.post("/identify")
async def identify_device(
    device_type: str = "auto",
    authorization: str = Header(None)
):
    """ETAPA 1: Identificação Forense do Dispositivo"""
    try:
        user_data = await get_current_user(authorization)
        
        identifier = AthenaDeviceIdentifier(EVIDENCE_BASE)
        profile = await identifier.identify_device(device_type)
        
        # Salvar perfil no MongoDB
        profile_doc = {
            "id": str(uuid.uuid4()),
            "profile": profile.to_dict(),
            "user_id": user_data.get("id"),
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.athena_device_profiles.insert_one(profile_doc)
        
        return {
            "status": "success",
            "profile_id": profile_doc["id"],
            "profile": profile.to_dict(),
            "custody_log": identifier.custody_log
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na identificação: {str(e)}")


@router.get("/profiles")
async def list_profiles(
    user: dict = Header(None, alias="authorization", convert_underscores=False)
):
    """Lista perfis de dispositivos identificados"""
    try:
        user_data = await get_current_user(user)
        
        profiles = await db.athena_device_profiles.find(
            {"user_id": user_data.get("id")},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return {
            "status": "success",
            "count": len(profiles),
            "profiles": profiles
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ========================================
# ENDPOINTS - ETAPA 2: SELEÇÃO DE MODO
# ========================================

@router.post("/select-mode/{profile_id}")
async def select_extraction_mode(
    profile_id: str,
    user: dict = Header(None, alias="authorization", convert_underscores=False)
):
    """ETAPA 2: Seleção Inteligente do Modo de Extração"""
    try:
        user_data = await get_current_user(user)
        
        # Buscar perfil
        profile_doc = await db.athena_device_profiles.find_one(
            {"id": profile_id},
            {"_id": 0}
        )
        
        if not profile_doc:
            raise HTTPException(status_code=404, detail="Perfil não encontrado")
        
        # Selecionar modo
        selector = AthenaModeSelector()
        recommendation = selector.select_mode(profile_doc["profile"])
        
        # Salvar recomendação
        await db.athena_mode_recommendations.insert_one({
            "id": str(uuid.uuid4()),
            "profile_id": profile_id,
            "recommendation": recommendation.to_dict(),
            "user_id": user_data.get("id"),
            "created_at": datetime.now(timezone.utc)
        })
        
        return {
            "status": "success",
            "recommendation": recommendation.to_dict(),
            "decision_log": selector.decision_log
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na seleção: {str(e)}")


# ========================================
# ENDPOINTS - ETAPA 3: EXTRAÇÃO
# ========================================

@router.post("/extractions/create")
async def create_extraction(
    data: ExtractionCreate,
    user: dict = Header(None, alias="authorization", convert_underscores=False)
):
    """Criar nova extração com Athena Mobile Engine"""
    try:
        user_data = await get_current_user(user)
        
        extraction_id = str(uuid.uuid4())
        
        # 1. Identificar dispositivo
        identifier = AthenaDeviceIdentifier(EVIDENCE_BASE / extraction_id)
        profile = await identifier.identify_device(data.dispositivo_tipo.lower())
        
        # 2. Selecionar modo
        selector = AthenaModeSelector()
        recommendation = selector.select_mode(profile.to_dict())
        
        # 3. Criar documento de extração
        extraction_doc = {
            "id": extraction_id,
            "caso_id": data.caso_id,
            "dispositivo": {
                "tipo": data.dispositivo_tipo,
                "marca": data.dispositivo_marca,
                "modelo": data.dispositivo_modelo,
                "numero_serie": data.numero_serie,
                "imei": data.imei,
                "sistema_operacional": data.sistema_operacional
            },
            "profile": profile.to_dict(),
            "modo_recomendado": recommendation.recommended_mode,
            "modo_selecionado": data.modo_extracao or recommendation.recommended_mode,
            "status": "CRIADO",
            "progresso": 0,
            "artifacts_extraidos": 0,
            "user_id": user_data.get("id"),
            "perito": user_data.get("name", user_data.get("email")),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "etapas_completadas": ["IDENTIFICACAO", "SELECAO_MODO"],
            "custody_log": identifier.custody_log
        }
        
        await db.athena_extractions.insert_one(extraction_doc)
        
        return {
            "status": "success",
            "extraction_id": extraction_id,
            "extraction": extraction_doc,
            "profile": profile.to_dict(),
            "recommendation": recommendation.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar extração: {str(e)}")


@router.post("/extractions/{extraction_id}/execute")
async def execute_extraction(
    extraction_id: str,
    background_tasks: BackgroundTasks,
    user: dict = Header(None, alias="authorization", convert_underscores=False)
):
    """ETAPA 5: Executar Extração de Artefatos"""
    try:
        user_data = await get_current_user(user)
        
        extraction = await db.athena_extractions.find_one(
            {"id": extraction_id},
            {"_id": 0}
        )
        
        if not extraction:
            raise HTTPException(status_code=404, detail="Extração não encontrada")
        
        # Atualizar status
        await db.athena_extractions.update_one(
            {"id": extraction_id},
            {"$set": {
                "status": "EM_EXECUCAO",
                "progresso": 10,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        # Executar extração em background
        background_tasks.add_task(
            execute_extraction_background,
            extraction_id,
            extraction.get("profile", {}),
            extraction.get("modo_selecionado", "logical")
        )
        
        return {
            "status": "started",
            "extraction_id": extraction_id,
            "message": "Extração iniciada em background"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def execute_extraction_background(extraction_id: str, profile: Dict, mode: str):
    """Executa extração em background"""
    try:
        # Simula progresso
        extraction_path = EVIDENCE_BASE / extraction_id
        extraction_path.mkdir(exist_ok=True, parents=True)
        
        # Atualizar progresso
        await db.athena_extractions.update_one(
            {"id": extraction_id},
            {"$set": {"progresso": 30, "status": "EXTRAINDO_ARTEFATOS"}}
        )
        
        # Extrair artefatos
        extractor = ArtifactExtractor(extraction_path)
        artifacts_result = await extractor.extract_all_artifacts(extraction_id)
        
        await db.athena_extractions.update_one(
            {"id": extraction_id},
            {"$set": {"progresso": 70, "status": "PROCESSANDO"}}
        )
        
        # Finalizar
        await db.athena_extractions.update_one(
            {"id": extraction_id},
            {"$set": {
                "status": "CONCLUIDO",
                "progresso": 100,
                "artifacts_extraidos": artifacts_result["total_count"],
                "artifacts_detalhes": artifacts_result["artifacts_extracted"],
                "finalized_at": datetime.now(timezone.utc),
                "etapas_completadas": ["IDENTIFICACAO", "SELECAO_MODO", "EXTRACAO", "ARTEFATOS"]
            }}
        )
        
        print(f"✅ Extração {extraction_id} concluída!")
        
    except Exception as e:
        await db.athena_extractions.update_one(
            {"id": extraction_id},
            {"$set": {
                "status": "FALHOU",
                "erro": str(e),
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        print(f"❌ Erro na extração {extraction_id}: {e}")


@router.get("/extractions")
async def list_extractions(
    user: dict = Header(None, alias="authorization", convert_underscores=False)
):
    """Lista todas as extrações"""
    try:
        user_data = await get_current_user(user)
        
        extractions = await db.athena_extractions.find(
            {"user_id": user_data.get("id")},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return {
            "status": "success",
            "count": len(extractions),
            "extractions": extractions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/extractions/{extraction_id}")
async def get_extraction(
    extraction_id: str,
    user: dict = Header(None, alias="authorization", convert_underscores=False)
):
    """Obter detalhes de uma extração"""
    try:
        user_data = await get_current_user(user)
        
        extraction = await db.athena_extractions.find_one(
            {"id": extraction_id},
            {"_id": 0}
        )
        
        if not extraction:
            raise HTTPException(status_code=404, detail="Extração não encontrada")
        
        return {
            "status": "success",
            "extraction": extraction
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ========================================
# ENDPOINTS - ETAPA 4: EXPLOITS
# ========================================

@router.get("/exploits/list")
async def list_exploits(
    profile_id: Optional[str] = None,
    user: dict = Header(None, alias="authorization", convert_underscores=False)
):
    """ETAPA 4: Listar exploits disponíveis"""
    try:
        user_data = await get_current_user(user)
        
        manager = AthenaExploitManager()
        
        if profile_id:
            profile_doc = await db.athena_device_profiles.find_one({"id": profile_id}, {"_id": 0})
            if profile_doc:
                exploits = manager.list_exploits(profile_doc["profile"])
            else:
                exploits = []
        else:
            # Lista todos os exploits
            exploits = [
                manager.EXPLOIT_REGISTRY[eid] | {"id": eid}
                for eid in manager.EXPLOIT_REGISTRY.keys()
            ]
        
        return {
            "status": "success",
            "count": len(exploits),
            "exploits": [e if isinstance(e, dict) else e.to_dict() for e in exploits]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/exploits/{extraction_id}/dry-run")
async def dry_run_exploit(
    extraction_id: str,
    data: ExploitApply,
    user: dict = Header(None, alias="authorization", convert_underscores=False)
):
    """Testar exploit sem aplicar"""
    try:
        user_data = await get_current_user(user)
        
        extraction = await db.athena_extractions.find_one({"id": extraction_id}, {"_id": 0})
        if not extraction:
            raise HTTPException(status_code=404, detail="Extração não encontrada")
        
        manager = AthenaExploitManager()
        result = manager.dry_run(data.exploit_id, extraction["profile"])
        
        return {
            "status": "success",
            "dry_run_result": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/exploits/{extraction_id}/apply")
async def apply_exploit(
    extraction_id: str,
    data: ExploitApply,
    user: dict = Header(None, alias="authorization", convert_underscores=False)
):
    """ETAPA 4: Aplicar exploit com justificativa OBRIGATÓRIA"""
    try:
        user_data = await get_current_user(user)
        
        extraction = await db.athena_extractions.find_one({"id": extraction_id}, {"_id": 0})
        if not extraction:
            raise HTTPException(status_code=404, detail="Extração não encontrada")
        
        manager = AthenaExploitManager()
        result = manager.apply_exploit(
            data.exploit_id,
            extraction["profile"],
            data.justification
        )
        
        # Salvar aplicação no banco
        await db.athena_extractions.update_one(
            {"id": extraction_id},
            {"$push": {
                "exploits_aplicados": {
                    "exploit_id": data.exploit_id,
                    "justification": data.justification,
                    "result": result,
                    "timestamp": datetime.now(timezone.utc)
                }
            }}
        )
        
        return {
            "status": "success",
            "application_result": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ========================================
# ENDPOINTS - ESTATÍSTICAS
# ========================================

@router.get("/stats")
async def get_stats(
    user: dict = Header(None, alias="authorization", convert_underscores=False)
):
    """Estatísticas do Athena Mobile"""
    try:
        user_data = await get_current_user(user)
        
        total_extractions = await db.athena_extractions.count_documents(
            {"user_id": user_data.get("id")}
        )
        
        completed = await db.athena_extractions.count_documents(
            {"user_id": user_data.get("id"), "status": "CONCLUIDO"}
        )
        
        in_progress = await db.athena_extractions.count_documents(
            {"user_id": user_data.get("id"), "status": {"$in": ["EM_EXECUCAO", "EXTRAINDO_ARTEFATOS", "PROCESSANDO"]}}
        )
        
        failed = await db.athena_extractions.count_documents(
            {"user_id": user_data.get("id"), "status": "FALHOU"}
        )
        
        # Artefatos totais
        pipeline = [
            {"$match": {"user_id": user_data.get("id"), "artifacts_extraidos": {"$exists": True}}},
            {"$group": {"_id": None, "total": {"$sum": "$artifacts_extraidos"}}}
        ]
        artifacts_agg = await db.athena_extractions.aggregate(pipeline).to_list(1)
        total_artifacts = artifacts_agg[0]["total"] if artifacts_agg else 0
        
        return {
            "status": "success",
            "stats": {
                "total_extractions": total_extractions,
                "completed": completed,
                "in_progress": in_progress,
                "failed": failed,
                "total_artifacts": total_artifacts,
                "success_rate": round((completed / total_extractions * 100) if total_extractions > 0 else 0, 2)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/extraction-methods")
async def get_extraction_methods():
    """Lista métodos de extração disponíveis"""
    methods = [
        {
            "id": "logical",
            "name": "Extração Lógica",
            "description": "Acesso via APIs públicas do sistema operacional",
            "invasiveness": "Baixa",
            "data_recovered": "60-70%",
            "requirements": ["USB Debugging habilitado", "Dispositivo desbloqueado"],
            "suitable_for": ["Dispositivos cooperativos", "Análise básica"],
            "time_estimate": "10-30 minutos"
        },
        {
            "id": "filesystem",
            "name": "Extração File System",
            "description": "Acesso read-only ao sistema de arquivos",
            "invasiveness": "Média",
            "data_recovered": "70-85%",
            "requirements": ["ADB/MTP acesso", "Permissões de leitura"],
            "suitable_for": ["Dispositivos parcialmente acessíveis"],
            "time_estimate": "30-90 minutos"
        },
        {
            "id": "physical",
            "name": "Extração Física",
            "description": "Dump completo de partições de memória",
            "invasiveness": "Alta",
            "data_recovered": "85-95%",
            "requirements": ["Bootloader desbloqueado ou exploit"],
            "suitable_for": ["Investigações críticas", "Recuperação de dados deletados"],
            "time_estimate": "1-4 horas"
        },
        {
            "id": "advanced",
            "name": "Extração Avançada (JTAG/ISP)",
            "description": "Acesso direto à memória via hardware",
            "invasiveness": "Muito Alta",
            "data_recovered": "95-99%",
            "requirements": ["Equipamento especializado", "Desmontagem do dispositivo"],
            "suitable_for": ["Dispositivos danificados", "Casos complexos"],
            "time_estimate": "4-12 horas"
        },
        {
            "id": "chipoff",
            "name": "Chip-Off",
            "description": "Remoção física do chip de memória",
            "invasiveness": "Extrema (Destrutivo)",
            "data_recovered": "99-100%",
            "requirements": ["Laboratório especializado", "Equipamento avançado"],
            "suitable_for": ["Último recurso", "Dispositivos irrecuperáveis"],
            "time_estimate": "1-3 dias"
        }
    ]
    
    return {
        "status": "success",
        "count": len(methods),
        "methods": methods
    }


@router.get("/artifact-types")
async def get_artifact_types():
    """Lista tipos de artefatos que podem ser extraídos"""
    extractor = ArtifactExtractor(Path("/tmp"))
    
    artifacts = [
        {
            "id": aid,
            "name": info["name"],
            "priority": info["priority"],
            "typical_count": "Varia"
        }
        for aid, info in extractor.ARTIFACT_TYPES.items()
    ]
    
    return {
        "status": "success",
        "count": len(artifacts),
        "artifact_types": artifacts
    }
