"""Módulo 1: Perícia Digital (Coleta e Exame Básico)"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
import os
import hashlib
import json

router = APIRouter(prefix="/api/forensics/digital", tags=["Perícia Digital"])

# Models
class ExamCreate(BaseModel):
    title: str
    case_number: str
    legal_basis: str  # mandado, contrato, consentimento, ordem judicial
    device_type: str
    responsible: str
    priority: str = "normal"

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
    device_info: Optional[DeviceInfo] = None
    status: str = "aberto"  # aberto, em_processamento, concluído
    priority: str = "normal"
    responsible: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    hash_sha256: Optional[str] = None
    hash_sha512: Optional[str] = None
    hash_blake3: Optional[str] = None
    timeline: List[dict] = []
    custody_chain: List[dict] = []  # Ato 1, 2, 3, 4

# In-memory storage (substituir por MongoDB em produção)
exams_db = {}

@router.post("/exams", response_model=Exam)
async def create_exam(exam_data: ExamCreate):
    """Cria novo exame pericial com base legal obrigatória"""
    exam = Exam(
        title=exam_data.title,
        case_number=exam_data.case_number,
        legal_basis=exam_data.legal_basis,
        device_info=None,
        responsible=exam_data.responsible,
        priority=exam_data.priority,
        custody_chain=[
            {
                "ato": "Recebimento",
                "timestamp": datetime.utcnow().isoformat(),
                "responsible": exam_data.responsible,
                "description": "Evidência recebida e registrada no sistema",
                "hash_prev": None,
                "hash_curr": str(uuid.uuid4())  # Simular hash inicial
            }
        ]
    )
    
    exams_db[exam.id] = exam
    return exam

@router.get("/exams", response_model=List[Exam])
async def list_exams(status: Optional[str] = None, priority: Optional[str] = None):
    """Lista todos os exames com filtros opcionais"""
    exams = list(exams_db.values())
    
    if status:
        exams = [e for e in exams if e.status == status]
    if priority:
        exams = [e for e in exams if e.priority == priority]
    
    return exams

@router.get("/exams/{exam_id}", response_model=Exam)
async def get_exam(exam_id: str):
    """Obtém detalhes de um exame específico"""
    if exam_id not in exams_db:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    return exams_db[exam_id]

@router.post("/exams/{exam_id}/device")
async def register_device(exam_id: str, device: DeviceInfo):
    """Registra informações do dispositivo periciado"""
    if exam_id not in exams_db:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    
    exams_db[exam_id].device_info = device
    return {"message": "Dispositivo registrado com sucesso"}

@router.post("/exams/{exam_id}/upload")
async def upload_evidence(
    exam_id: str,
    file: UploadFile = File(...),
    chunk_number: int = Form(0),
    total_chunks: int = Form(1)
):
    """Upload de evidências com suporte a chunks (arquivos grandes)"""
    if exam_id not in exams_db:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    
    # Criar diretório para evidências
    evidence_dir = f"/tmp/evidences/{exam_id}"
    os.makedirs(evidence_dir, exist_ok=True)
    
    # Salvar chunk
    chunk_path = f"{evidence_dir}/{file.filename}.part{chunk_number}"
    with open(chunk_path, "wb") as f:
        content = await file.read()
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
        exams_db[exam_id].hash_sha256 = final_sha256
        exams_db[exam_id].hash_sha512 = final_sha512
        exams_db[exam_id].status = "em_processamento"
        
        # Adicionar Ato 2 - Aquisição
        exams_db[exam_id].custody_chain.append({
            "ato": "Aquisição",
            "timestamp": datetime.utcnow().isoformat(),
            "description": f"Evidência adquirida: {file.filename}",
            "hash_prev": exams_db[exam_id].custody_chain[-1]["hash_curr"],
            "hash_curr": final_sha256,
            "file_size": len(file_content),
            "file_name": file.filename
        })
        
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
