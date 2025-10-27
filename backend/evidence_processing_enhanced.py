"""
Evidence Processing Enhanced - Backend API
Sistema avançado de processamento de evidências digitais
"""

from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import os
import uuid
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/evidence", tags=["evidence_processing_enhanced"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['ap_elite']

# Models
class EvidenceCreate(BaseModel):
    evidence_name: str
    evidence_type: str
    case_id: str
    source: str
    description: Optional[str] = None
    priority: str = "medium"
    hash_algorithm: str = "SHA-256"

class EvidenceUpdate(BaseModel):
    status: Optional[str] = None
    progress: Optional[int] = None
    processing_notes: Optional[str] = None

# Helper function for authentication
async def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token não fornecido")
    
    try:
        token = authorization.replace("Bearer ", "")
        user = await db.users.find_one({"token": token})
        if not user:
            raise HTTPException(status_code=401, detail="Token inválido")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Erro de autenticação: {str(e)}")

@router.get("/stats")
async def get_evidence_stats(authorization: str = Header(None)):
    """Get evidence processing statistics"""
    user = await verify_token(authorization)
    
    try:
        total = await db.evidence_processing.count_documents({})
        pending = await db.evidence_processing.count_documents({"status": "pending"})
        processing = await db.evidence_processing.count_documents({"status": "processing"})
        completed = await db.evidence_processing.count_documents({"status": "completed"})
        failed = await db.evidence_processing.count_documents({"status": "failed"})
        
        # Count by evidence type
        by_type = await db.evidence_processing.aggregate([
            {"$group": {"_id": "$evidence_type", "count": {"$sum": 1}}}
        ]).to_list(None)
        
        # Count by priority
        high_priority = await db.evidence_processing.count_documents({"priority": "high"})
        critical_priority = await db.evidence_processing.count_documents({"priority": "critical"})
        
        return {
            "total": total,
            "pending": pending,
            "processing": processing,
            "completed": completed,
            "failed": failed,
            "by_type": {item["_id"]: item["count"] for item in by_type},
            "high_priority": high_priority,
            "critical_priority": critical_priority
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar estatísticas: {str(e)}")

@router.get("/evidence")
async def list_evidence(
    status: Optional[str] = None,
    evidence_type: Optional[str] = None,
    authorization: str = Header(None)
):
    """List all evidence with optional filters"""
    user = await verify_token(authorization)
    
    try:
        query = {}
        if status:
            query["status"] = status
        if evidence_type:
            query["evidence_type"] = evidence_type
            
        evidence_list = await db.evidence_processing.find(query).sort("created_at", -1).to_list(100)
        
        for evidence in evidence_list:
            evidence.pop("_id", None)
        
        return {"evidence": evidence_list, "count": len(evidence_list)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar evidências: {str(e)}")

@router.post("/evidence")
async def create_evidence(
    evidence: EvidenceCreate,
    authorization: str = Header(None)
):
    """Create a new evidence entry"""
    user = await verify_token(authorization)
    
    try:
        evidence_id = str(uuid.uuid4())
        
        evidence_doc = {
            "evidence_id": evidence_id,
            "evidence_name": evidence.evidence_name,
            "evidence_type": evidence.evidence_type,
            "case_id": evidence.case_id,
            "source": evidence.source,
            "description": evidence.description,
            "priority": evidence.priority,
            "hash_algorithm": evidence.hash_algorithm,
            "status": "pending",
            "progress": 0,
            "processing_steps": [],
            "findings": [],
            "created_by": user.get("email"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.evidence_processing.insert_one(evidence_doc)
        
        return {
            "success": True,
            "evidence_id": evidence_id,
            "message": "Evidência criada com sucesso",
            "status": "pending"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar evidência: {str(e)}")

@router.get("/evidence/{evidence_id}")
async def get_evidence(
    evidence_id: str,
    authorization: str = Header(None)
):
    """Get details of a specific evidence"""
    user = await verify_token(authorization)
    
    try:
        evidence = await db.evidence_processing.find_one({"evidence_id": evidence_id})
        
        if not evidence:
            raise HTTPException(status_code=404, detail="Evidência não encontrada")
        
        evidence.pop("_id", None)
        return evidence
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar evidência: {str(e)}")

@router.put("/evidence/{evidence_id}")
async def update_evidence(
    evidence_id: str,
    update: EvidenceUpdate,
    authorization: str = Header(None)
):
    """Update evidence processing status"""
    user = await verify_token(authorization)
    
    try:
        update_doc = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if update.status:
            update_doc["status"] = update.status
        if update.progress is not None:
            update_doc["progress"] = update.progress
        if update.processing_notes:
            update_doc["processing_notes"] = update.processing_notes
            
        result = await db.evidence_processing.update_one(
            {"evidence_id": evidence_id},
            {"$set": update_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Evidência não encontrada")
        
        return {
            "success": True,
            "message": "Evidência atualizada com sucesso",
            "evidence_id": evidence_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar evidência: {str(e)}")

@router.post("/evidence/{evidence_id}/chain-of-custody")
async def add_custody_record(
    evidence_id: str,
    action: str,
    notes: Optional[str] = None,
    authorization: str = Header(None)
):
    """Add a chain of custody record"""
    user = await verify_token(authorization)
    
    try:
        custody_record = {
            "record_id": str(uuid.uuid4()),
            "action": action,
            "notes": notes,
            "performed_by": user.get("email"),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        result = await db.evidence_processing.update_one(
            {"evidence_id": evidence_id},
            {
                "$push": {"chain_of_custody": custody_record},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Evidência não encontrada")
        
        return {
            "success": True,
            "record_id": custody_record["record_id"],
            "message": "Registro de custódia adicionado com sucesso"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao adicionar registro: {str(e)}")

@router.get("/evidence-types")
async def get_evidence_types(authorization: str = Header(None)):
    """Get list of evidence types"""
    user = await verify_token(authorization)
    
    evidence_types = [
        {
            "type": "digital_image",
            "name": "Imagem Forense Digital",
            "description": "Cópia bit-a-bit de dispositivos",
            "typical_size": "Variável (GB-TB)",
            "processing_time": "4-8 horas"
        },
        {
            "type": "mobile_data",
            "name": "Dados de Celular",
            "description": "Extração de dispositivos móveis",
            "typical_size": "1-128 GB",
            "processing_time": "2-4 horas"
        },
        {
            "type": "email",
            "name": "E-mails",
            "description": "Arquivos de e-mail (PST, MBOX, EML)",
            "typical_size": "100 MB - 10 GB",
            "processing_time": "1-3 horas"
        },
        {
            "type": "documents",
            "name": "Documentos",
            "description": "Documentos Office, PDF, etc",
            "typical_size": "10 MB - 1 GB",
            "processing_time": "30 min - 2 horas"
        },
        {
            "type": "database",
            "name": "Banco de Dados",
            "description": "Arquivos de banco de dados",
            "typical_size": "100 MB - 100 GB",
            "processing_time": "2-6 horas"
        },
        {
            "type": "multimedia",
            "name": "Multimídia",
            "description": "Fotos, vídeos, áudio",
            "typical_size": "1 GB - 1 TB",
            "processing_time": "2-8 horas"
        },
        {
            "type": "network_capture",
            "name": "Captura de Rede",
            "description": "Arquivos PCAP de tráfego de rede",
            "typical_size": "100 MB - 10 GB",
            "processing_time": "1-4 horas"
        },
        {
            "type": "memory_dump",
            "name": "Dump de Memória",
            "description": "Snapshot da memória RAM",
            "typical_size": "4-32 GB",
            "processing_time": "2-4 horas"
        },
        {
            "type": "cloud_data",
            "name": "Dados de Nuvem",
            "description": "Dados de serviços em nuvem",
            "typical_size": "Variável",
            "processing_time": "1-6 horas"
        },
        {
            "type": "logs",
            "name": "Logs de Sistema",
            "description": "Arquivos de log de sistemas",
            "typical_size": "10 MB - 10 GB",
            "processing_time": "1-3 horas"
        }
    ]
    
    return {"evidence_types": evidence_types, "total": len(evidence_types)}

@router.get("/processing-workflows")
async def get_processing_workflows(authorization: str = Header(None)):
    """Get list of evidence processing workflows"""
    user = await verify_token(authorization)
    
    workflows = [
        {
            "workflow": "standard_imaging",
            "name": "Imageamento Padrão",
            "description": "Processo padrão de imageamento forense",
            "steps": [
                "Verificação inicial do dispositivo",
                "Fotografia e documentação",
                "Cálculo de hash pré-aquisição",
                "Aquisição com write blocker",
                "Cálculo de hash pós-aquisição",
                "Verificação de integridade",
                "Documentação final"
            ],
            "estimated_duration": "4-6 horas"
        },
        {
            "workflow": "mobile_extraction",
            "name": "Extração Mobile",
            "description": "Extração de dados de dispositivos móveis",
            "steps": [
                "Isolamento do dispositivo (Faraday bag)",
                "Documentação do estado do dispositivo",
                "Seleção do método de extração",
                "Extração de dados",
                "Validação dos dados",
                "Processamento com ferramenta forense",
                "Geração de relatório"
            ],
            "estimated_duration": "3-5 horas"
        },
        {
            "workflow": "email_analysis",
            "name": "Análise de E-mails",
            "description": "Processamento e análise de e-mails",
            "steps": [
                "Importação de arquivos de e-mail",
                "Indexação de mensagens",
                "Extração de anexos",
                "Análise de metadados",
                "Identificação de threads",
                "Busca por palavras-chave",
                "Geração de timeline"
            ],
            "estimated_duration": "2-4 horas"
        },
        {
            "workflow": "network_forensics",
            "name": "Análise de Rede",
            "description": "Análise de tráfego de rede capturado",
            "steps": [
                "Importação de PCAP",
                "Reconstrução de sessões",
                "Análise de protocolos",
                "Extração de arquivos",
                "Identificação de anomalias",
                "Correlação temporal",
                "Documentação de descobertas"
            ],
            "estimated_duration": "2-6 horas"
        },
        {
            "workflow": "memory_analysis",
            "name": "Análise de Memória",
            "description": "Análise forense de dump de memória",
            "steps": [
                "Identificação do perfil do SO",
                "Listagem de processos",
                "Extração de conexões de rede",
                "Análise de DLLs carregadas",
                "Busca por artefatos",
                "Extração de senhas",
                "Identificação de malware"
            ],
            "estimated_duration": "3-5 horas"
        }
    ]
    
    return {"workflows": workflows, "total": len(workflows)}

@router.get("/hash-algorithms")
async def get_hash_algorithms(authorization: str = Header(None)):
    """Get list of supported hash algorithms"""
    user = await verify_token(authorization)
    
    algorithms = [
        {
            "algorithm": "MD5",
            "name": "MD5",
            "description": "128-bit hash (não recomendado para novos casos)",
            "output_size": "32 caracteres",
            "recommended": False
        },
        {
            "algorithm": "SHA-1",
            "name": "SHA-1",
            "description": "160-bit hash (em desuso)",
            "output_size": "40 caracteres",
            "recommended": False
        },
        {
            "algorithm": "SHA-256",
            "name": "SHA-256",
            "description": "256-bit hash (padrão recomendado)",
            "output_size": "64 caracteres",
            "recommended": True
        },
        {
            "algorithm": "SHA-512",
            "name": "SHA-512",
            "description": "512-bit hash (máxima segurança)",
            "output_size": "128 caracteres",
            "recommended": True
        }
    ]
    
    return {"algorithms": algorithms, "total": len(algorithms)}
