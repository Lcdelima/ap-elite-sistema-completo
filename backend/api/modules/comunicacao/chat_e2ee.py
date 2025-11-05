"""Chat E2EE (End-to-End Encrypted) - Elite Athena"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime, timezone
import hashlib
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/chat", tags=["chat-e2ee"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class ConnectionManager:
    """Gerenciador de conexões WebSocket"""
    
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
    
    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
    
    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
    
    async def broadcast(self, room_id: str, message: dict):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass


manager = ConnectionManager()


class ChatMessage(BaseModel):
    room_id: str
    sender_id: str
    encrypted_content: str  # Conteúdo criptografado no cliente
    timestamp: str
    message_hash: str  # Hash forense da mensagem


class ChatRoom(BaseModel):
    id: str
    name: str
    participants: List[str]
    case_id: Optional[str]
    created_at: str
    is_e2ee: bool = True


@router.post("/rooms")
async def create_room(data: ChatRoom):
    """Cria sala de chat"""
    
    room = data.model_dump()
    room['created_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.chat_rooms.insert_one(room)
    
    return {
        "room_id": data.id,
        "message": "Sala criada",
        "e2ee_enabled": True
    }


@router.get("/rooms/{user_id}")
async def list_rooms(user_id: str):
    """Lista salas do usuário"""
    
    rooms = await db.chat_rooms.find(
        {"participants": user_id}
    ).to_list(length=100)
    
    return {"rooms": rooms}


@router.post("/messages")
async def send_message(message: ChatMessage):
    """Envia mensagem com hash forense"""
    
    # Validar hash da mensagem
    expected_hash = hashlib.sha256(
        f"{message.encrypted_content}{message.timestamp}{message.sender_id}".encode()
    ).hexdigest()
    
    if message.message_hash != expected_hash:
        raise HTTPException(status_code=400, detail="Hash inválido - mensagem pode estar adulterada")
    
    # Salvar mensagem
    message_record = message.model_dump()
    message_record['saved_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.chat_messages.insert_one(message_record)
    
    # Broadcast para sala
    await manager.broadcast(message.room_id, message_record)
    
    return {
        "message_id": message.message_hash,
        "delivered": True,
        "hash_verified": True
    }


@router.get("/messages/{room_id}")
async def get_messages(room_id: str, limit: int = 50):
    """Obtém mensagens da sala"""
    
    messages = await db.chat_messages.find(
        {"room_id": room_id}
    ).sort("timestamp", -1).limit(limit).to_list(length=limit)
    
    return {
        "room_id": room_id,
        "messages": list(reversed(messages)),
        "count": len(messages)
    }


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket para chat em tempo real"""
    
    await manager.connect(room_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Broadcast para todos na sala
            await manager.broadcast(room_id, data)
            
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
