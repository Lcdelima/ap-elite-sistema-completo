"""Video Conference Integration - Daily.co - Elite Athena"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import os
import requests
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/video", tags=["video-conference"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Daily.co configuration
DAILY_API_KEY = os.getenv('DAILY_API_KEY')
DAILY_API_URL = 'https://api.daily.co/v1'


class CreateRoomRequest(BaseModel):
    name: str
    privacy: str = "public"  # public, private
    max_participants: int = 10
    enable_recording: bool = True
    case_id: Optional[str] = None


class RoomResponse(BaseModel):
    room_name: str
    room_url: str
    config: dict


@router.post("/create-room")
async def create_video_room(data: CreateRoomRequest):
    """Cria sala de videoconferência"""
    
    if not DAILY_API_KEY:
        return {
            'status': 'not_configured',
            'message': 'Daily.co API key não configurada',
            'setup': 'Configure DAILY_API_KEY no .env',
            'alternative': 'Use Google Meet ou Zoom manualmente'
        }
    
    try:
        # Criar sala no Daily.co
        headers = {
            'Authorization': f'Bearer {DAILY_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'name': data.name,
            'privacy': data.privacy,
            'properties': {
                'max_participants': data.max_participants,
                'enable_recording': 'cloud' if data.enable_recording else 'off',
                'enable_chat': True,
                'enable_screenshare': True,
                'enable_knocking': True
            }
        }
        
        response = requests.post(
            f'{DAILY_API_URL}/rooms',
            json=payload,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            room_data = response.json()
            
            # Salvar registro
            room_record = {
                'room_name': room_data['name'],
                'room_url': room_data['url'],
                'case_id': data.case_id,
                'created_at': datetime.now(timezone.utc).isoformat(),
                'max_participants': data.max_participants,
                'recording_enabled': data.enable_recording,
                'daily_room_id': room_data.get('id')
            }
            
            await db.video_rooms.insert_one(room_record)
            
            return {
                'room_name': room_data['name'],
                'room_url': room_data['url'],
                'config': room_data.get('config', {}),
                'message': 'Sala criada com sucesso'
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Erro ao criar sala: {response.text}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rooms")
async def list_rooms(case_id: Optional[str] = None):
    """Lista salas de vídeo"""
    
    query = {}
    if case_id:
        query['case_id'] = case_id
    
    rooms = await db.video_rooms.find(query).to_list(length=100)
    
    return {'rooms': rooms}


@router.delete("/rooms/{room_name}")
async def delete_room(room_name: str):
    """Deleta sala de vídeo"""
    
    if not DAILY_API_KEY:
        raise HTTPException(status_code=400, detail="Daily.co não configurado")
    
    try:
        headers = {'Authorization': f'Bearer {DAILY_API_KEY}'}
        
        response = requests.delete(
            f'{DAILY_API_URL}/rooms/{room_name}',
            headers=headers
        )
        
        if response.status_code == 200:
            # Remover do banco
            await db.video_rooms.delete_one({'room_name': room_name})
            return {'message': 'Sala deletada'}
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rooms/{room_name}/recording")
async def get_recording(room_name: str):
    """Obtém gravação da reunião"""
    
    if not DAILY_API_KEY:
        raise HTTPException(status_code=400, detail="Daily.co não configurado")
    
    try:
        headers = {'Authorization': f'Bearer {DAILY_API_KEY}'}
        
        response = requests.get(
            f'{DAILY_API_URL}/recordings',
            params={'room': room_name},
            headers=headers
        )
        
        recordings = response.json() if response.status_code == 200 else []
        
        return {
            'room_name': room_name,
            'recordings': recordings
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
