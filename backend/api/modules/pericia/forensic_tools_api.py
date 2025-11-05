"""API de Ferramentas Forenses - Elite Athena"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from services.forensic_tools_connector import ForensicToolsOrchestrator

router = APIRouter(prefix="/api/forensic-tools", tags=["forensic-tools"])

orchestrator = ForensicToolsOrchestrator()


class DeviceExtractionRequest(BaseModel):
    device_path: str
    device_type: str  # android, ios, computer
    output_name: str
    tool: str = 'auto'  # auto, cellebrite, ufed


class DiskImagingRequest(BaseModel):
    source_drive: str
    image_name: str
    format: str = 'E01'


@router.get("/available")
async def check_available_tools():
    """Verifica quais ferramentas estão disponíveis"""
    
    tools = await orchestrator.get_available_tools()
    
    return {
        'available_tools': tools,
        'total_available': sum(tools.values()),
        'recommendations': {
            'mobile': 'Use Evidence Vault para registro manual' if not any(tools.values()) else 'Cellebrite/UFED disponíveis',
            'disk': 'Use dd/dcfldd' if not tools['ftk_imager'] else 'FTK Imager disponível',
            'analysis': 'Use IPED' if not tools['autopsy'] else 'Autopsy disponível'
        }
    }


@router.post("/extract-device")
async def extract_mobile_device(
    background_tasks: BackgroundTasks,
    data: DeviceExtractionRequest
):
    """Inicia extração de dispositivo móvel"""
    
    if data.tool == 'cellebrite' or data.tool == 'auto':
        result = await orchestrator.cellebrite.extract_device(
            device_path=data.device_path,
            output_name=data.output_name,
            extraction_type='full'
        )
        return result
    
    elif data.tool == 'ufed':
        result = await orchestrator.ufed.quick_extraction({'device': data.device_path})
        return result
    
    else:
        raise HTTPException(status_code=400, detail="Ferramenta não suportada")


@router.post("/create-disk-image")
async def create_disk_image(
    background_tasks: BackgroundTasks,
    data: DiskImagingRequest
):
    """Cria imagem forense de disco"""
    
    result = await orchestrator.ftk.create_image(
        source_drive=data.source_drive,
        image_name=data.image_name,
        image_format=data.format
    )
    
    return result


@router.get("/job-status/{process_id}")
async def check_job_status(process_id: int):
    """Verifica status de job em execução"""
    
    # TODO: Verificar status real do processo
    return {
        'process_id': process_id,
        'status': 'running',
        'progress': '45%',
        'estimated_remaining': '1h 23min'
    }
