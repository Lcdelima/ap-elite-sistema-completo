"""
Automação de Workflows Jurídicos
Fluxos automáticos, notificações, prazos, checklists dinâmicos
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/workflows", tags=["Workflow Automation"])

MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "test_database")]

class WorkflowTemplate(BaseModel):
    name: str
    case_type: str
    stages: List[Dict[str, Any]]
    auto_notifications: bool = True

class TaskCreate(BaseModel):
    workflow_id: str
    title: str
    description: str
    assigned_to: str
    due_date: str
    priority: str = 'medium'

WORKFLOW_TEMPLATES = {
    'criminal_defense': {
        'name': 'Defesa Criminal Completa',
        'stages': [
            {'name': 'Recepção do Caso', 'duration_days': 1, 'tasks': ['Análise inicial', 'Reunião com cliente']},
            {'name': 'Investigação Preliminar', 'duration_days': 7, 'tasks': ['Coleta de provas', 'OSINT', 'Perícia']},
            {'name': 'Elaboração da Defesa', 'duration_days': 5, 'tasks': ['Redação de petição', 'Revisão jurídica']},
            {'name': 'Protocolo e Acompanhamento', 'duration_days': 2, 'tasks': ['Protocolo', 'Acompanhamento processual']},
            {'name': 'Audiências', 'duration_days': 15, 'tasks': ['Preparação', 'Realização', 'Follow-up']},
            {'name': 'Finalização', 'duration_days': 3, 'tasks': ['Relatório final', 'Feedback cliente']}
        ]
    },
    'digital_forensics': {
        'name': 'Perícia Digital',
        'stages': [
            {'name': 'Recebimento', 'duration_days': 1, 'tasks': ['Registro', 'Cadeia de custódia']},
            {'name': 'Análise Técnica', 'duration_days': 10, 'tasks': ['Extração', 'Análise', 'Documentação']},
            {'name': 'Laudo', 'duration_days': 5, 'tasks': ['Redação', 'Revisão técnica', 'Assinatura']},
            {'name': 'Entrega', 'duration_days': 2, 'tasks': ['Envio', 'Confirmação']}
        ]
    },
    'osint_investigation': {
        'name': 'Investigação OSINT',
        'stages': [
            {'name': 'Planejamento', 'duration_days': 1, 'tasks': ['Defineção de escopo', 'Fontes']},
            {'name': 'Coleta de Dados', 'duration_days': 5, 'tasks': ['OSINT', 'Social media', 'Públicos']},
            {'name': 'Análise', 'duration_days': 3, 'tasks': ['Correlação', 'IA', 'Validação']},
            {'name': 'Relatório', 'duration_days': 2, 'tasks': ['Redação', 'Revisão', 'Entrega']}
        ]
    }
}

@router.post("/create")
async def create_workflow(template: WorkflowTemplate):
    """Cria novo workflow"""
    
    workflow = {
        'name': template.name,
        'case_type': template.case_type,
        'stages': template.stages,
        'current_stage': 0,
        'status': 'active',
        'created_at': datetime.now().isoformat(),
        'auto_notifications': template.auto_notifications
    }
    
    result = await db.workflows.insert_one(workflow)
    
    return {
        'success': True,
        'workflow_id': str(result.inserted_id),
        'name': template.name,
        'total_stages': len(template.stages)
    }

@router.post("/create-from-template")
async def create_from_template(template_key: str, case_id: str):
    """Cria workflow baseado em template"""
    
    if template_key not in WORKFLOW_TEMPLATES:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    template = WORKFLOW_TEMPLATES[template_key]
    
    workflow = {
        'name': template['name'],
        'case_id': case_id,
        'template_key': template_key,
        'stages': template['stages'],
        'current_stage': 0,
        'status': 'active',
        'created_at': datetime.now().isoformat(),
        'progress': 0
    }
    
    result = await db.workflows.insert_one(workflow)
    
    # Criar tarefas da primeira fase
    first_stage = template['stages'][0]
    for task_name in first_stage['tasks']:
        await db.workflow_tasks.insert_one({
            'workflow_id': str(result.inserted_id),
            'stage': 0,
            'title': task_name,
            'status': 'pending',
            'created_at': datetime.now().isoformat()
        })
    
    return {
        'success': True,
        'workflow_id': str(result.inserted_id),
        'template': template['name'],
        'first_stage': first_stage['name'],
        'tasks_created': len(first_stage['tasks'])
    }

@router.get("/templates")
async def list_templates():
    """Lista templates disponíveis"""
    
    return {
        'templates': WORKFLOW_TEMPLATES,
        'total': len(WORKFLOW_TEMPLATES)
    }

@router.post("/advance-stage/{workflow_id}")
async def advance_stage(workflow_id: str):
    """Avança workflow para próxima fase"""
    
    from bson import ObjectId
    
    try:
        workflow = await db.workflows.find_one({'_id': ObjectId(workflow_id)})
        
        if not workflow:
            raise HTTPException(status_code=404, detail="Workflow não encontrado")
        
        current = workflow['current_stage']
        total = len(workflow['stages'])
        
        if current >= total - 1:
            # Última fase - completar workflow
            await db.workflows.update_one(
                {'_id': ObjectId(workflow_id)},
                {'$set': {
                    'status': 'completed',
                    'completed_at': datetime.now().isoformat(),
                    'progress': 100
                }}
            )
            
            return {
                'success': True,
                'workflow_id': workflow_id,
                'status': 'completed',
                'message': 'Workflow concluído!'
            }
        else:
            # Avançar para próxima fase
            next_stage = current + 1
            progress = int((next_stage / total) * 100)
            
            await db.workflows.update_one(
                {'_id': ObjectId(workflow_id)},
                {'$set': {
                    'current_stage': next_stage,
                    'progress': progress
                }}
            )
            
            # Criar tarefas da próxima fase
            next_stage_info = workflow['stages'][next_stage]
            for task_name in next_stage_info.get('tasks', []):
                await db.workflow_tasks.insert_one({
                    'workflow_id': workflow_id,
                    'stage': next_stage,
                    'title': task_name,
                    'status': 'pending',
                    'created_at': datetime.now().isoformat()
                })
            
            return {
                'success': True,
                'workflow_id': workflow_id,
                'current_stage': next_stage,
                'stage_name': next_stage_info['name'],
                'progress': progress,
                'tasks_created': len(next_stage_info.get('tasks', []))
            }
    except:
        raise HTTPException(status_code=400, detail="ID inválido")

@router.get("/deadlines/upcoming")
async def upcoming_deadlines(days: int = 7):
    """Prazos próximos"""
    
    deadline_date = datetime.now() + timedelta(days=days)
    
    cursor = db.workflow_tasks.find({
        'status': 'pending',
        'due_date': {'$lte': deadline_date.isoformat()}
    }).sort('due_date', 1)
    
    tasks = await cursor.to_list(length=50)
    
    for task in tasks:
        task['id'] = str(task.pop('_id'))
    
    return {
        'upcoming_deadlines': tasks,
        'total': len(tasks),
        'period_days': days
    }

@router.get("/statistics")
async def workflow_statistics():
    """Estatísticas de workflows"""
    
    total = await db.workflows.count_documents({})
    active = await db.workflows.count_documents({'status': 'active'})
    completed = await db.workflows.count_documents({'status': 'completed'})
    
    return {
        'total_workflows': total,
        'active': active,
        'completed': completed,
        'templates_available': len(WORKFLOW_TEMPLATES),
        'automation_features': [
            'Auto-created tasks',
            'Deadline notifications',
            'Progress tracking',
            'Stage advancement',
            'Template library',
            'Checklist generation'
        ]
    }
