"""API Avançada de Processos - Elite Athena"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/processes", tags=["processes-advanced"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class BulkArchiveRequest(BaseModel):
    process_ids: List[str]


@router.get("/advanced")
async def list_processes_advanced(
    search: Optional[str] = None,
    status: str = 'all',
    fase: str = 'all',
    responsavel: str = 'all',
    prazo_critico: bool = False,
    sort: str = 'data_desc'
):
    """Lista processos com filtros avançados"""
    
    query = {}
    
    if search:
        query['$or'] = [
            {'numero': {'$regex': search, '$options': 'i'}},
            {'titulo': {'$regex': search, '$options': 'i'}},
            {'cliente': {'$regex': search, '$options': 'i'}}
        ]
    
    if status != 'all':
        query['status'] = status
    
    if fase != 'all':
        query['fase'] = fase
    
    if responsavel != 'all':
        query['responsavel'] = responsavel
    
    if prazo_critico:
        query['prazo_critico'] = True
    
    # Ordenação
    sort_map = {
        'data_desc': ('created_at', -1),
        'data_asc': ('created_at', 1),
        'prioridade': ('prioridade', -1),
        'valor_desc': ('valor', -1),
        'prazo_asc': ('proximo_prazo', 1)
    }
    
    sort_field, sort_order = sort_map.get(sort, ('created_at', -1))
    
    processes = await db.processes.find(query).sort(
        sort_field, sort_order
    ).to_list(length=200)
    
    return {
        'processes': processes,
        'count': len(processes),
        'filters_applied': query
    }


@router.post("/bulk-archive")
async def bulk_archive_processes(data: BulkArchiveRequest):
    """Arquiva múltiplos processos"""
    
    result = await db.processes.update_many(
        {'id': {'$in': data.process_ids}},
        {'$set': {'status': 'arquivado'}}
    )
    
    return {
        'message': f'{result.modified_count} processos arquivados',
        'count': result.modified_count
    }


@router.get("/export")
async def export_processes_excel(
    search: Optional[str] = None,
    status: str = 'all'
):
    """Exporta processos para Excel (placeholder)"""
    
    # TODO: Implementar export real com openpyxl
    return {
        'message': 'Export em desenvolvimento',
        'format': 'xlsx'
    }
