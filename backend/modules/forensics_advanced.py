"""Módulo 2: Perícia Digital Aprimorada (Carving, Antiforense, RAM)"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/forensics/advanced", tags=["Perícia Digital Aprimorada"])

# Models
class CarvingRequest(BaseModel):
    exam_id: str
    file_types: List[str] = ["jpg", "png", "pdf", "docx"]
    deep_scan: bool = False

class RAMAnalysisRequest(BaseModel):
    exam_id: str
    extract_credentials: bool = True
    extract_processes: bool = True

class AntiforenseAlert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exam_id: str
    alert_type: str  # timestamp_manipulation, metadata_altered, wipe_detected
    severity: str  # low, medium, high, critical
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Storage
advanced_ops_db = {}
alerts_db = {}

@router.post("/carving")
async def perform_carving(request: CarvingRequest):
    """Realiza carving de arquivos deletados"""
    op_id = str(uuid.uuid4())
    
    # Simular operação de carving
    result = {
        "operation_id": op_id,
        "exam_id": request.exam_id,
        "type": "carving",
        "status": "completed",
        "files_recovered": 45,
        "file_types": {
            "jpg": 23,
            "png": 12,
            "pdf": 7,
            "docx": 3
        },
        "total_size_mb": 128.5,
        "execution_time_seconds": 45.2,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    advanced_ops_db[op_id] = result
    return result

@router.post("/ram/scan")
async def analyze_ram(request: RAMAnalysisRequest):
    """Analisa dump de memória RAM"""
    op_id = str(uuid.uuid4())
    
    # Simular análise de RAM
    result = {
        "operation_id": op_id,
        "exam_id": request.exam_id,
        "type": "ram_analysis",
        "status": "completed",
        "credentials_found": 12 if request.extract_credentials else 0,
        "processes_analyzed": 87 if request.extract_processes else 0,
        "suspicious_processes": [
            {"name": "process_x.exe", "pid": 1234, "risk": "medium"},
            {"name": "hidden_service.dll", "pid": 5678, "risk": "high"}
        ],
        "memory_artifacts": {
            "urls": 34,
            "emails": 8,
            "passwords": 12,
            "keys": 5
        },
        "timestamp": datetime.utcnow().isoformat()
    }
    
    advanced_ops_db[op_id] = result
    return result

@router.post("/antiforense")
async def detect_antiforense(exam_id: str):
    """Detecta técnicas antiforenses"""
    
    # Simular detecção de técnicas antiforenses
    alerts = []
    
    # Alerta 1: Timestamps manipulados
    alert1 = AntiforenseAlert(
        exam_id=exam_id,
        alert_type="timestamp_manipulation",
        severity="high",
        description="Detectados 15 arquivos com timestamps inconsistentes (criados antes da data de fabricação do dispositivo)"
    )
    alerts.append(alert1)
    alerts_db[alert1.id] = alert1
    
    # Alerta 2: Metadados alterados
    alert2 = AntiforenseAlert(
        exam_id=exam_id,
        alert_type="metadata_altered",
        severity="medium",
        description="Detectada alteração manual de metadados EXIF em 8 imagens"
    )
    alerts.append(alert2)
    alerts_db[alert2.id] = alert2
    
    # Alerta 3: Wipe detectado
    alert3 = AntiforenseAlert(
        exam_id=exam_id,
        alert_type="wipe_detected",
        severity="critical",
        description="Detectado padrão de zerofill em setores do disco (possível uso de ferramentas de wipe)"
    )
    alerts.append(alert3)
    alerts_db[alert3.id] = alert3
    
    return {
        "exam_id": exam_id,
        "total_alerts": len(alerts),
        "alerts_by_severity": {
            "critical": 1,
            "high": 1,
            "medium": 1,
            "low": 0
        },
        "alerts": alerts
    }

@router.get("/alerts/{exam_id}")
async def get_alerts(exam_id: str, severity: Optional[str] = None):
    """Lista alertas antiforenses de um exame"""
    exam_alerts = [a for a in alerts_db.values() if a.exam_id == exam_id]
    
    if severity:
        exam_alerts = [a for a in exam_alerts if a.severity == severity]
    
    return {
        "exam_id": exam_id,
        "total_alerts": len(exam_alerts),
        "alerts": exam_alerts
    }

@router.get("/operations/{op_id}")
async def get_operation(op_id: str):
    """Obtém detalhes de uma operação avançada"""
    if op_id not in advanced_ops_db:
        raise HTTPException(status_code=404, detail="Operação não encontrada")
    return advanced_ops_db[op_id]

@router.get("/stats")
async def get_stats():
    """Estatísticas do módulo"""
    return {
        "total_operations": len(advanced_ops_db),
        "total_alerts": len(alerts_db),
        "alerts_by_severity": {
            "critical": len([a for a in alerts_db.values() if a.severity == "critical"]),
            "high": len([a for a in alerts_db.values() if a.severity == "high"]),
            "medium": len([a for a in alerts_db.values() if a.severity == "medium"]),
            "low": len([a for a in alerts_db.values() if a.severity == "low"])
        }
    }

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "module": "Perícia Digital Aprimorada",
        "version": "1.0.0"
    }
