"""
Sistema de Colaboração em Tempo Real
Edição colaborativa, comentários, versionamento, aprovações
"""

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import json

router = APIRouter(prefix="/api/collaboration", tags=["Collaboration"])

MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "test_database")]

class Document(BaseModel):
    title: str
    content: str
    doc_type: str
    created_by: str

class Comment(BaseModel):
    document_id: str
    user_id: str
    comment: str
    position: Optional[Dict[str, Any]] = None

class Approval(BaseModel):
    document_id: str
    approver_id: str
    status: str  # approved, rejected, pending
    comments: Optional[str] = None

# Gerenciar conexões WebSocket
active_connections: Dict[str, List[WebSocket]] = {}

@router.post("/documents/create")
async def create_document(doc: Document):
    """Cria novo documento colaborativo"""
    
    doc_data = {
        'title': doc.title,
        'content': doc.content,
        'doc_type': doc.doc_type,
        'created_by': doc.created_by,
        'created_at': datetime.now().isoformat(),
        'version': 1,
        'collaborators': [doc.created_by],
        'status': 'draft',
        'approval_required': False
    }
    
    result = await db.collaborative_docs.insert_one(doc_data)
    
    return {
        'success': True,
        'document_id': str(result.inserted_id),
        'title': doc.title,
        'version': 1,
        'edit_url': f'/collaboration/edit/{result.inserted_id}'
    }

@router.post("/documents/{doc_id}/edit")
async def edit_document(doc_id: str, content: str, user_id: str):
    """Edita documento (cria nova versão)"""
    
    from bson import ObjectId
    
    try:
        doc = await db.collaborative_docs.find_one({'_id': ObjectId(doc_id)})
        
        if not doc:
            raise HTTPException(status_code=404, detail="Documento não encontrado")
        
        # Criar versão anterior
        version_backup = {
            'document_id': doc_id,
            'version': doc['version'],
            'content': doc['content'],
            'saved_by': user_id,
            'saved_at': datetime.now().isoformat()
        }
        
        await db.document_versions.insert_one(version_backup)
        
        # Atualizar documento
        new_version = doc['version'] + 1
        
        await db.collaborative_docs.update_one(
            {'_id': ObjectId(doc_id)},
            {'$set': {
                'content': content,
                'version': new_version,
                'last_edited_by': user_id,
                'last_edited_at': datetime.now().isoformat()
            }}
        )
        
        # Notificar colaboradores conectados
        await broadcast_update(doc_id, {
            'type': 'document_updated',
            'version': new_version,
            'user_id': user_id
        })
        
        return {
            'success': True,
            'document_id': doc_id,
            'version': new_version,
            'message': 'Documento atualizado'
        }
    except:
        raise HTTPException(status_code=400, detail="Erro ao editar documento")

@router.post("/comments/add")
async def add_comment(comment: Comment):
    """Adiciona comentário ao documento"""
    
    comment_data = {
        'document_id': comment.document_id,
        'user_id': comment.user_id,
        'comment': comment.comment,
        'position': comment.position,
        'created_at': datetime.now().isoformat(),
        'resolved': False
    }
    
    result = await db.document_comments.insert_one(comment_data)
    
    # Notificar colaboradores
    await broadcast_update(comment.document_id, {
        'type': 'new_comment',
        'comment_id': str(result.inserted_id),
        'user_id': comment.user_id
    })
    
    return {
        'success': True,
        'comment_id': str(result.inserted_id),
        'message': 'Comentário adicionado'
    }

@router.get("/documents/{doc_id}/comments")
async def get_comments(doc_id: str):
    """Lista comentários do documento"""
    
    cursor = db.document_comments.find({'document_id': doc_id}).sort('created_at', -1)
    comments = await cursor.to_list(length=100)
    
    for comment in comments:
        comment['id'] = str(comment.pop('_id'))
    
    return {
        'document_id': doc_id,
        'comments': comments,
        'total': len(comments)
    }

@router.post("/approval/request")
async def request_approval(doc_id: str, approvers: List[str]):
    """Solicita aprovação de documento"""
    
    from bson import ObjectId
    
    try:
        # Atualizar documento
        await db.collaborative_docs.update_one(
            {'_id': ObjectId(doc_id)},
            {'$set': {
                'approval_required': True,
                'approvers': approvers,
                'approval_status': 'pending'
            }}
        )
        
        # Criar registros de aprovação
        for approver in approvers:
            await db.approval_requests.insert_one({
                'document_id': doc_id,
                'approver_id': approver,
                'status': 'pending',
                'requested_at': datetime.now().isoformat()
            })
        
        return {
            'success': True,
            'document_id': doc_id,
            'approvers': approvers,
            'message': 'Aprovação solicitada'
        }
    except:
        raise HTTPException(status_code=400, detail="Erro ao solicitar aprovação")

@router.post("/approval/respond")
async def respond_approval(approval: Approval):
    """Responde solicitação de aprovação"""
    
    # Atualizar registro
    await db.approval_requests.update_one(
        {
            'document_id': approval.document_id,
            'approver_id': approval.approver_id
        },
        {'$set': {
            'status': approval.status,
            'comments': approval.comments,
            'responded_at': datetime.now().isoformat()
        }}
    )
    
    # Verificar se todos aprovaram
    pending = await db.approval_requests.count_documents({
        'document_id': approval.document_id,
        'status': 'pending'
    })
    
    if pending == 0:
        # Verificar se algum rejeitou
        rejected = await db.approval_requests.count_documents({
            'document_id': approval.document_id,
            'status': 'rejected'
        })
        
        final_status = 'rejected' if rejected > 0 else 'approved'
        
        from bson import ObjectId
        await db.collaborative_docs.update_one(
            {'_id': ObjectId(approval.document_id)},
            {'$set': {'approval_status': final_status}}
        )
    
    return {
        'success': True,
        'document_id': approval.document_id,
        'status': approval.status,
        'pending_approvals': pending
    }

@router.get("/documents/{doc_id}/versions")
async def get_versions(doc_id: str):
    """Lista versões do documento"""
    
    cursor = db.document_versions.find({'document_id': doc_id}).sort('version', -1)
    versions = await cursor.to_list(length=50)
    
    for version in versions:
        version['id'] = str(version.pop('_id'))
    
    return {
        'document_id': doc_id,
        'versions': versions,
        'total': len(versions)
    }

async def broadcast_update(doc_id: str, message: Dict[str, Any]):
    """Envia atualização para todos os conectados"""
    if doc_id in active_connections:
        for connection in active_connections[doc_id]:
            try:
                await connection.send_json(message)
            except:
                pass

@router.websocket("/ws/{doc_id}")
async def websocket_endpoint(websocket: WebSocket, doc_id: str):
    """WebSocket para colaboração em tempo real"""
    
    await websocket.accept()
    
    if doc_id not in active_connections:
        active_connections[doc_id] = []
    
    active_connections[doc_id].append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            # Broadcast para outros usuários
            await broadcast_update(doc_id, {
                'type': 'cursor_move',
                'data': data
            })
    except WebSocketDisconnect:
        active_connections[doc_id].remove(websocket)

@router.get("/statistics")
async def collaboration_statistics():
    """Estatísticas de colaboração"""
    
    total_docs = await db.collaborative_docs.count_documents({})
    total_comments = await db.document_comments.count_documents({})
    pending_approvals = await db.approval_requests.count_documents({'status': 'pending'})
    
    return {
        'total_documents': total_docs,
        'total_comments': total_comments,
        'pending_approvals': pending_approvals,
        'active_connections': sum(len(conns) for conns in active_connections.values()),
        'features': [
            'Real-time editing',
            'Version control',
            'Comments & annotations',
            'Multi-stage approval',
            'Conflict resolution',
            'Live cursors',
            'Change tracking',
            'WebSocket sync'
        ]
    }
