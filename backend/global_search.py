"""
Sistema de Busca Global Unificado
Busca em todos os módulos do sistema simultaneamente
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

router = APIRouter(prefix="/api/search", tags=["Global Search"])

MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "test_database")]

class GlobalSearchQuery(BaseModel):
    query: str
    modules: Optional[List[str]] = None  # None = todos
    limit: int = 10

SEARCH_MODULES = {
    'cases': {'collection': 'cases', 'fields': ['title', 'description', 'case_number']},
    'clients': {'collection': 'clients', 'fields': ['name', 'email', 'company']},
    'documents': {'collection': 'document_library', 'fields': ['filename', 'description']},
    'evidence': {'collection': 'evidence', 'fields': ['title', 'description', 'type']},
    'workflows': {'collection': 'workflows', 'fields': ['name', 'case_type']},
    'fees': {'collection': 'fee_calculations', 'fields': ['case_type']},
    'communications': {'collection': 'communications', 'fields': ['subject', 'content']},
    'users': {'collection': 'users', 'fields': ['name', 'email', 'role']}
}

@router.post("/global")
async def global_search(search: GlobalSearchQuery):
    """
    Busca global em todos os módulos
    """
    
    modules_to_search = search.modules or list(SEARCH_MODULES.keys())
    
    # Criar tarefas de busca para cada módulo
    search_tasks = []
    for module in modules_to_search:
        if module in SEARCH_MODULES:
            search_tasks.append(search_module(module, search.query, search.limit))
    
    # Executar todas as buscas em paralelo
    results = await asyncio.gather(*search_tasks)
    
    # Combinar resultados
    combined_results = []
    total_found = 0
    
    for module, module_results in zip(modules_to_search, results):
        if module_results:
            total_found += len(module_results)
            combined_results.append({
                'module': module,
                'module_name': module.title(),
                'results': module_results,
                'count': len(module_results)
            })
    
    # Salvar histórico de busca
    await db.search_history.insert_one({
        'query': search.query,
        'modules': modules_to_search,
        'total_results': total_found,
        'timestamp': datetime.now().isoformat()
    })
    
    return {
        'query': search.query,
        'total_results': total_found,
        'modules_searched': len(modules_to_search),
        'results': combined_results,
        'timestamp': datetime.now().isoformat()
    }

async def search_module(module: str, query: str, limit: int) -> List[Dict]:
    """
    Busca em um módulo específico
    """
    
    config = SEARCH_MODULES[module]
    collection = db[config['collection']]
    fields = config['fields']
    
    # Criar query de busca
    search_query = {
        '$or': [
            {field: {'$regex': query, '$options': 'i'}}
            for field in fields
        ]
    }
    
    try:
        cursor = collection.find(search_query).limit(limit)
        results = await cursor.to_list(length=limit)
        
        # Formatar resultados
        for result in results:
            result['id'] = str(result.pop('_id', ''))
            result['module'] = module
        
        return results
    except Exception as e:
        print(f"Erro ao buscar em {module}: {e}")
        return []

@router.get("/quick")
async def quick_search(q: str, limit: int = 5):
    """
    Busca rápida simplificada
    """
    
    if len(q) < 2:
        return {'results': [], 'message': 'Mínimo 2 caracteres'}
    
    # Buscar nos principais módulos
    priority_modules = ['cases', 'clients', 'documents']
    
    search_tasks = [search_module(module, q, limit) for module in priority_modules]
    results = await asyncio.gather(*search_tasks)
    
    combined = []
    for module, module_results in zip(priority_modules, results):
        combined.extend(module_results[:3])  # Top 3 de cada
    
    return {
        'query': q,
        'results': combined[:10],  # Máximo 10 resultados
        'total': len(combined)
    }

@router.get("/suggestions")
async def search_suggestions(q: str):
    """
    Sugestões de busca baseadas em histórico
    """
    
    if len(q) < 2:
        return {'suggestions': []}
    
    # Buscar no histórico
    cursor = db.search_history.find({
        'query': {'$regex': f'^{q}', '$options': 'i'}
    }).sort('timestamp', -1).limit(5)
    
    history = await cursor.to_list(length=5)
    
    suggestions = [h['query'] for h in history]
    
    # Adicionar sugestões comuns se não houver histórico
    if not suggestions:
        common = [
            f'{q} - casos',
            f'{q} - clientes',
            f'{q} - documentos'
        ]
        suggestions = common[:3]
    
    return {
        'query': q,
        'suggestions': suggestions
    }

@router.post("/advanced")
async def advanced_search(
    query: str,
    filters: Dict[str, Any],
    sort_by: Optional[str] = None,
    limit: int = 50
):
    """
    Busca avançada com filtros
    """
    
    # Construir query complexa baseada nos filtros
    search_query = {'$or': []}
    
    # Adicionar filtros de texto
    if query:
        search_query['$or'].append({
            '$or': [
                {'title': {'$regex': query, '$options': 'i'}},
                {'description': {'$regex': query, '$options': 'i'}},
                {'content': {'$regex': query, '$options': 'i'}}
            ]
        })
    
    # Adicionar filtros específicos
    for key, value in filters.items():
        if value:
            search_query[key] = value
    
    # Buscar em múltiplas coleções
    results = []
    
    for module, config in SEARCH_MODULES.items():
        try:
            collection = db[config['collection']]
            cursor = collection.find(search_query)
            
            if sort_by:
                cursor = cursor.sort(sort_by, -1)
            
            module_results = await cursor.limit(limit).to_list(length=limit)
            
            for result in module_results:
                result['id'] = str(result.pop('_id'))
                result['module'] = module
                results.append(result)
        except:
            pass
    
    return {
        'query': query,
        'filters': filters,
        'results': results,
        'total': len(results)
    }

@router.get("/history")
async def search_history(limit: int = 20):
    """Histórico de buscas"""
    
    cursor = db.search_history.find().sort('timestamp', -1).limit(limit)
    history = await cursor.to_list(length=limit)
    
    for item in history:
        item['id'] = str(item.pop('_id'))
    
    return {
        'history': history,
        'total': len(history)
    }

@router.get("/statistics")
async def search_statistics():
    """Estatísticas de busca"""
    
    total_searches = await db.search_history.count_documents({})
    
    # Termos mais buscados
    pipeline = [
        {'$group': {
            '_id': '$query',
            'count': {'$sum': 1}
        }},
        {'$sort': {'count': -1}},
        {'$limit': 10}
    ]
    
    top_searches = []
    async for doc in db.search_history.aggregate(pipeline):
        top_searches.append({
            'query': doc['_id'],
            'count': doc['count']
        })
    
    return {
        'total_searches': total_searches,
        'modules_available': list(SEARCH_MODULES.keys()),
        'top_searches': top_searches,
        'features': [
            'Global search',
            'Quick search',
            'Auto-suggestions',
            'Advanced filters',
            'Multi-module',
            'Search history'
        ]
    }
