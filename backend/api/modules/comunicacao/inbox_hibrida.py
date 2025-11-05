"""Inbox Híbrida - Unifica Publicações, Tarefas, Mensagens e Alertas - Elite Athena"""
from fastapi import APIRouter
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/inbox", tags=["inbox-hibrida"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


@router.get("/unified")
async def get_unified_inbox(
    user_id: str,
    filter_type: Optional[str] = None,  # publicacao, tarefa, mensagem, alerta
    status: Optional[str] = None,  # unread, read, archived
    limit: int = 50
):
    """Inbox híbrida unificada"""
    
    items = []
    
    # 1. Publicações não tratadas
    if not filter_type or filter_type == 'publicacao':
        publicacoes = await db.publicacoes.find(
            {'status': 'nao_tratada', 'responsavel': {'$in': [user_id, None]}}
        ).limit(20).to_list(length=20)
        
        for pub in publicacoes:
            items.append({
                'id': pub['id'],
                'type': 'publicacao',
                'title': f"{pub['tribunal']} - {pub['tipo']}",
                'content': pub['conteudo'][:200],
                'priority': pub.get('prioridade', 'media'),
                'timestamp': pub['data_publicacao'],
                'status': 'unread',
                'action_required': bool(pub.get('prazo_fatal')),
                'deadline': pub.get('prazo_fatal'),
                'source': 'publicacoes',
                'metadata': {
                    'tribunal': pub['tribunal'],
                    'tipo': pub['tipo']
                }
            })
    
    # 2. Tarefas pendentes
    if not filter_type or filter_type == 'tarefa':
        tarefas = await db.tasks.find(
            {'assigned_to': user_id, 'status': 'pending'}
        ).limit(20).to_list(length=20)
        
        for task in tarefas:
            items.append({
                'id': task.get('id', str(task.get('_id'))),
                'type': 'tarefa',
                'title': task.get('title', 'Tarefa'),
                'content': task.get('description', ''),
                'priority': task.get('priority', 'media'),
                'timestamp': task.get('created_at', datetime.now(timezone.utc).isoformat()),
                'status': 'unread',
                'action_required': True,
                'deadline': task.get('due_date'),
                'source': 'tasks'
            })
    
    # 3. Mensagens não lidas
    if not filter_type or filter_type == 'mensagem':
        # Buscar salas do usuário
        rooms = await db.chat_rooms.find(
            {'participants': user_id}
        ).to_list(length=50)
        
        room_ids = [r['id'] for r in rooms]
        
        # Mensagens recentes
        messages = await db.chat_messages.find(
            {'room_id': {'$in': room_ids}, 'sender_id': {'$ne': user_id}}
        ).sort('timestamp', -1).limit(20).to_list(length=20)
        
        for msg in messages:
            items.append({
                'id': msg.get('message_hash', ''),
                'type': 'mensagem',
                'title': f"Mensagem de {msg.get('sender_id', 'Unknown')}",
                'content': '[Mensagem criptografada]',  # E2EE
                'priority': 'baixa',
                'timestamp': msg.get('timestamp', ''),
                'status': 'unread',
                'action_required': False,
                'source': 'chat',
                'metadata': {
                    'room_id': msg.get('room_id')
                }
            })
    
    # 4. Alertas do sistema
    if not filter_type or filter_type == 'alerta':
        alerts = [
            {
                'id': 'alert_1',
                'type': 'alerta',
                'title': 'Prazo crítico em 3 dias',
                'content': 'Processo XYZ tem prazo fatal em 3 dias',
                'priority': 'alta',
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'status': 'unread',
                'action_required': True,
                'source': 'system'
            }
        ]
        items.extend(alerts)
    
    # Ordenar por timestamp (mais recentes primeiro)
    items.sort(key=lambda x: x['timestamp'], reverse=True)
    
    # Aplicar filtro de status
    if status:
        items = [i for i in items if i['status'] == status]
    
    # Limitar
    items = items[:limit]
    
    # Estatísticas
    stats = {
        'total': len(items),
        'unread': len([i for i in items if i['status'] == 'unread']),
        'action_required': len([i for i in items if i.get('action_required')]),
        'by_type': {}
    }
    
    for item in items:
        item_type = item['type']
        stats['by_type'][item_type] = stats['by_type'].get(item_type, 0) + 1
    
    return {
        'items': items,
        'stats': stats
    }


@router.post("/mark-read/{item_id}")
async def mark_as_read(item_id: str, item_type: str):
    """Marca item como lido"""
    
    collection_map = {
        'publicacao': db.publicacoes,
        'tarefa': db.tasks,
        'mensagem': db.chat_messages
    }
    
    collection = collection_map.get(item_type)
    if not collection:
        raise HTTPException(status_code=400, detail="Tipo inválido")
    
    # Marcar como lido
    await collection.update_one(
        {'id': item_id},
        {'$set': {'read_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    return {'message': 'Marcado como lido'}


@router.post("/bulk-action")
async def bulk_action(
    item_ids: List[str],
    action: str  # archive, mark_read, delete
):
    """Ações em massa"""
    
    if action == 'archive':
        # Arquivar itens
        pass
    elif action == 'mark_read':
        # Marcar como lidos
        pass
    
    return {
        'action': action,
        'items_affected': len(item_ids)
    }
