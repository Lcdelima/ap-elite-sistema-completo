"""API Completa de Sync Judicial - Elite Athena"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import os
from motor.motor_asyncio import AsyncIOMotorClient
from services.tribunal_adapters import AdapterFactory, CNJAPIAdapter
from services.tribunal_sync_tasks import (
    sincronizar_processo_task,
    sincronizar_todos_processos_task,
    detectar_prazos_task
)

router = APIRouter(prefix="/api/sync-judicial-complete", tags=["sync-judicial-complete"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class SyncRequest(BaseModel):
    numero_cnj: str
    tribunal: Optional[str] = None
    forcar: bool = False


class BulkSyncRequest(BaseModel):
    tribunal: str
    sistema: str


@router.post("/sync-processo")
async def sync_processo(data: SyncRequest, background_tasks: BackgroundTasks):
    """Sincroniza processo específico"""
    
    # Identificar tribunal pelo CNJ se não fornecido
    if not data.tribunal:
        partes = data.numero_cnj.split('.')
        if len(partes) >= 4:
            codigo_tribunal = partes[3]
            tribunal_map = {
                '08': 'TJSP', '19': 'TJRJ', '13': 'TJMG',
                '01': 'TRF1', '02': 'TRF2', '03': 'TRF3',
                '04': 'TRF4', '05': 'TRF5'
            }
            data.tribunal = tribunal_map.get(codigo_tribunal, 'DESCONHECIDO')
    
    # Buscar config
    config = await db.tribunal_configs.find_one(
        {"tribunal": data.tribunal, "ativo": True}
    )
    
    if not config:
        raise HTTPException(
            status_code=404,
            detail=f"Tribunal {data.tribunal} não configurado"
        )
    
    # Iniciar task em background
    task = sincronizar_processo_task.delay(
        numero_cnj=data.numero_cnj,
        tribunal=config['tribunal'],
        sistema=config['sistema'],
        credenciais=config['credenciais']
    )
    
    return {
        "task_id": task.id,
        "numero_cnj": data.numero_cnj,
        "tribunal": data.tribunal,
        "message": "Sincronização iniciada em background"
    }


@router.post("/sync-tribunal")
async def sync_tribunal_completo(data: BulkSyncRequest):
    """Sincroniza todos os processos de um tribunal"""
    
    config = await db.tribunal_configs.find_one(
        {"tribunal": data.tribunal, "sistema": data.sistema}
    )
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuração não encontrada")
    
    task = sincronizar_todos_processos_task.delay(
        tribunal=data.tribunal,
        sistema=data.sistema,
        credenciais=config['credenciais']
    )
    
    return {
        "task_id": task.id,
        "tribunal": data.tribunal,
        "message": "Sincronização em massa iniciada"
    }


@router.get("/andamentos/{numero_cnj}")
async def listar_andamentos_sincronizados(numero_cnj: str):
    """Lista andamentos já sincronizados"""
    
    andamentos = await db.andamentos.find(
        {"numero_cnj": numero_cnj}
    ).sort("data_evento", -1).to_list(length=None)
    
    return {
        "numero_cnj": numero_cnj,
        "andamentos": andamentos,
        "total": len(andamentos)
    }


@router.get("/prazos-detectados")
async def listar_prazos_detectados(limite: int = 50):
    """Lista prazos detectados automaticamente"""
    
    prazos = await db.prazos_detectados.find().sort(
        "detectado_em", -1
    ).limit(limite).to_list(length=limite)
    
    return {
        "prazos": prazos,
        "total": len(prazos)
    }


@router.get("/logs")
async def listar_logs_sync(limite: int = 100):
    """Logs de sincronização"""
    
    logs = await db.sync_logs.find().sort(
        "timestamp", -1
    ).limit(limite).to_list(length=limite)
    
    return {
        "logs": logs,
        "total": len(logs)
    }


@router.get("/health")
async def health_check_tribunais():
    """Verifica saúde de todas as conexões"""
    
    configs = await db.tribunal_configs.find(
        {"ativo": True}
    ).to_list(length=None)
    
    health = []
    
    for config in configs:
        adapter = AdapterFactory.create(
            config['tribunal'],
            config['sistema'],
            config['credenciais']
        )
        
        if adapter:
            try:
                conectado = adapter.login()
                health.append({
                    'tribunal': config['tribunal'],
                    'sistema': config['sistema'],
                    'status': 'online' if conectado else 'offline'
                })
            except:
                health.append({
                    'tribunal': config['tribunal'],
                    'sistema': config['sistema'],
                    'status': 'error'
                })
        else:
            health.append({
                'tribunal': config['tribunal'],
                'sistema': config['sistema'],
                'status': 'no_adapter'
            })
    
    return {
        "health": health,
        "total_online": len([h for h in health if h['status'] == 'online'])
    }
