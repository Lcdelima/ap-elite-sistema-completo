"""Módulo 1: Perícia Digital (Coleta e Exame Básico)"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
import os
import hashlib
import json

# MongoDB connection
from server import db

router = APIRouter(prefix="/api/forensics/digital", tags=["Perícia Digital"])

# Models
class ExamCreate(BaseModel):
    title: str
    case_number: str
    legal_basis: str  # mandado, ordem_judicial, termo_consentimento
    device_type: str  # smartphone, computador, tablet, hd_externo, pendrive
    device_brand: Optional[str] = None
    device_model: Optional[str] = None
    device_serial: Optional[str] = None
    responsible: str
    description: Optional[str] = None
    priority: str = "normal"  # baixa, normal, alta, urgente

class DeviceInfo(BaseModel):
    device_type: str
    brand: Optional[str] = None
    model: Optional[str] = None
    imei: Optional[str] = None
    serial: Optional[str] = None
    os_version: Optional[str] = None

class Exam(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    case_number: str
    legal_basis: str
    device_type: str
    device_brand: Optional[str] = None
    device_model: Optional[str] = None
    device_serial: Optional[str] = None
    status: str = "aberto"  # aberto, em_processamento, concluído
    priority: str = "normal"
    responsible: str
    description: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    hash_sha256: Optional[str] = None
    hash_sha512: Optional[str] = None
    hash_blake3: Optional[str] = None
    timeline: List[dict] = []
    custody_chain: List[dict] = []  # Ato 1, 2, 3, 4
    files_uploaded: List[dict] = []

@router.post("/exams")
async def create_exam(exam_data: ExamCreate):
    """Cria novo exame pericial com base legal obrigatória"""
    exam_id = str(uuid.uuid4())
    
    exam = {
        "id": exam_id,
        "title": exam_data.title,
        "case_number": exam_data.case_number,
        "legal_basis": exam_data.legal_basis,
        "device_type": exam_data.device_type,
        "device_brand": exam_data.device_brand,
        "device_model": exam_data.device_model,
        "device_serial": exam_data.device_serial,
        "responsible": exam_data.responsible,
        "description": exam_data.description,
        "priority": exam_data.priority,
        "status": "aberto",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "hash_sha256": None,
        "hash_sha512": None,
        "hash_blake3": None,
        "timeline": [
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event": "Exame criado",
                "details": f"Exame pericial iniciado - Caso {exam_data.case_number}",
                "user": exam_data.responsible
            }
        ],
        "custody_chain": [
            {
                "ato": "Ato 1 - Recebimento",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "responsible": exam_data.responsible,
                "description": "Evidência recebida e registrada no sistema CISAI-Forense 3.0",
                "hash_prev": None,
                "hash_curr": str(uuid.uuid4())[:16]  # Hash inicial
            }
        ],
        "files_uploaded": []
    }
    
    await db.forensics_exams.insert_one(exam)
    return exam

@router.get("/exams")
async def list_exams(status: Optional[str] = None, priority: Optional[str] = None):
    """Lista todos os exames com filtros opcionais"""
    query = {}
    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    
    exams = await db.forensics_exams.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return exams

@router.get("/exams/{exam_id}")
async def get_exam(exam_id: str):
    """Obtém detalhes de um exame específico"""
    exam = await db.forensics_exams.find_one({"id": exam_id}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    return exam

@router.put("/exams/{exam_id}/status")
async def update_status(exam_id: str, new_status: str):
    """Atualiza o status do exame"""
    exam = await db.forensics_exams.find_one({"id": exam_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    
    # Adicionar evento na timeline
    timeline_event = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": f"Status alterado para {new_status}",
        "details": f"Status do exame atualizado de '{exam['status']}' para '{new_status}'",
        "user": exam["responsible"]
    }
    
    await db.forensics_exams.update_one(
        {"id": exam_id},
        {
            "$set": {"status": new_status},
            "$push": {"timeline": timeline_event}
        }
    )
    
    return {"message": "Status atualizado com sucesso", "new_status": new_status}

@router.delete("/exams/{exam_id}")
async def delete_exam(exam_id: str):
    """Exclui um exame"""
    result = await db.forensics_exams.delete_one({"id": exam_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    return {"message": "Exame excluído com sucesso"}

@router.post("/exams/{exam_id}/device")
async def register_device(exam_id: str, device: DeviceInfo):
    """Registra informações do dispositivo periciado"""
    exam = await db.forensics_exams.find_one({"id": exam_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    
    await db.forensics_exams.update_one(
        {"id": exam_id},
        {"$set": {
            "device_brand": device.brand,
            "device_model": device.model,
            "device_imei": device.imei,
            "device_serial": device.serial,
            "device_os": device.os_version
        }}
    )
    
    return {"message": "Dispositivo registrado com sucesso"}

@router.post("/exams/{exam_id}/upload")
async def upload_evidence(
    exam_id: str,
    file: UploadFile = File(...),
    chunk_number: int = Form(0),
    total_chunks: int = Form(1)
):
    """Upload de evidências com suporte a chunks (arquivos grandes)"""
    exam = await db.forensics_exams.find_one({"id": exam_id})
    if not exam:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    
    # Criar diretório para evidências
    evidence_dir = f"/tmp/evidences/{exam_id}"
    os.makedirs(evidence_dir, exist_ok=True)
    
    # Salvar chunk
    chunk_path = f"{evidence_dir}/{file.filename}.part{chunk_number}"
    content = await file.read()
    with open(chunk_path, "wb") as f:
        f.write(content)
    
    # Calcular hash do chunk
    hash_sha256 = hashlib.sha256(content).hexdigest()
    
    # Se é o último chunk, juntar todos e calcular hash final
    if chunk_number == total_chunks - 1:
        final_file = f"{evidence_dir}/{file.filename}"
        with open(final_file, "wb") as outfile:
            for i in range(total_chunks):
                chunk_file = f"{evidence_dir}/{file.filename}.part{i}"
                with open(chunk_file, "rb") as infile:
                    outfile.write(infile.read())
                os.remove(chunk_file)  # Limpar chunks
        
        # Calcular hashes finais
        with open(final_file, "rb") as f:
            file_content = f.read()
            final_sha256 = hashlib.sha256(file_content).hexdigest()
            final_sha512 = hashlib.sha512(file_content).hexdigest()
        
        # Atualizar exame
        file_info = {
            "filename": file.filename,
            "size": len(file_content),
            "sha256": final_sha256,
            "sha512": final_sha512,
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Adicionar Ato 2 - Aquisição
        custody_event = {
            "ato": "Ato 2 - Aquisição",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "responsible": exam["responsible"],
            "description": f"Evidência adquirida: {file.filename} ({len(file_content)} bytes)",
            "hash_prev": exam["custody_chain"][-1]["hash_curr"],
            "hash_curr": final_sha256[:16],
            "file_size": len(file_content),
            "file_name": file.filename
        }
        
        timeline_event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": "Upload concluído",
            "details": f"Arquivo {file.filename} enviado com sucesso (SHA-256: {final_sha256[:16]}...)",
            "user": exam["responsible"]
        }
        
        await db.forensics_exams.update_one(
            {"id": exam_id},
            {
                "$set": {
                    "hash_sha256": final_sha256,
                    "hash_sha512": final_sha512,
                    "status": "em_processamento"
                },
                "$push": {
                    "custody_chain": custody_event,
                    "timeline": timeline_event,
                    "files_uploaded": file_info
                }
            }
        )
        
        return {
            "message": "Upload concluído com sucesso",
            "sha256": final_sha256,
            "sha512": final_sha512,
            "size": len(file_content)
        }
    
    return {
        "message": f"Chunk {chunk_number + 1}/{total_chunks} recebido",
        "chunk_hash": hash_sha256
    }

@router.get("/exams/{exam_id}/timeline")
async def get_timeline(exam_id: str):
    """Obtém a timeline de eventos do exame"""
    if exam_id not in exams_db:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    
    # Simular timeline básica
    timeline = [
        {
            "timestamp": datetime.utcnow().isoformat(),
            "event": "Exame criado",
            "details": "Exame pericial iniciado"
        },
        {
            "timestamp": datetime.utcnow().isoformat(),
            "event": "Evidência recebida",
            "details": "Arquivo de evidência processado"
        }
    ]
    
    return {"timeline": timeline}

@router.post("/exams/{exam_id}/report")
async def generate_report(exam_id: str, format: str = "pdf"):
    """Gera laudo técnico em formato PAdES ou JSON"""
    if exam_id not in exams_db:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    
    exam = exams_db[exam_id]
    
    # Adicionar Ato 3 - Análise
    exam.custody_chain.append({
        "ato": "Análise",
        "timestamp": datetime.utcnow().isoformat(),
        "description": "Análise técnica realizada",
        "hash_prev": exam.custody_chain[-1]["hash_curr"],
        "hash_curr": exam.hash_sha256
    })
    
    # Adicionar Ato 4 - Encerramento
    exam.custody_chain.append({
        "ato": "Encerramento",
        "timestamp": datetime.utcnow().isoformat(),
        "description": "Exame pericial concluído e laudo emitido",
        "hash_prev": exam.custody_chain[-1]["hash_curr"],
        "hash_curr": exam.hash_sha256
    })
    
    exam.status = "concluído"
    
    if format == "json":
        return {
            "type": "json_probatorio",
            "exam_id": exam.id,
            "case_number": exam.case_number,
            "legal_basis": exam.legal_basis,
            "hashes": {
                "sha256": exam.hash_sha256,
                "sha512": exam.hash_sha512
            },
            "custody_chain": exam.custody_chain,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    # Simular geração de PDF PAdES
    return {
        "type": "pades",
        "message": "Laudo técnico PAdES gerado com sucesso",
        "report_id": str(uuid.uuid4()),
        "digital_signature": "SHA256-RSA",
        "timestamp_rfc3161": datetime.utcnow().isoformat()
    }

@router.get("/stats")
async def get_stats():
    """Retorna estatísticas do módulo"""
    total = len(exams_db)
    abertos = len([e for e in exams_db.values() if e.status == "aberto"])
    em_processamento = len([e for e in exams_db.values() if e.status == "em_processamento"])
    concluidos = len([e for e in exams_db.values() if e.status == "concluído"])
    
    return {
        "total_exams": total,
        "abertos": abertos,
        "em_processamento": em_processamento,
        "concluidos": concluidos
    }

@router.get("/health")
async def health_check():
    """Verifica saúde do módulo"""
    return {
        "status": "ok",
        "module": "Perícia Digital",
        "version": "1.0.0",
        "uptime": "online"
    }
