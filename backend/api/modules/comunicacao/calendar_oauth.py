"""Google Calendar OAuth Integration - Elite Athena"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/calendar/oauth", tags=["calendar-oauth"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Google OAuth Config
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:3000/calendar/callback')


class OAuthConfig(BaseModel):
    provider: str  # google, microsoft
    user_id: str


@router.get("/google/authorize-url")
async def get_google_auth_url(user_id: str):
    """Obtém URL de autorização Google"""
    
    if not GOOGLE_CLIENT_ID:
        return {
            'status': 'not_configured',
            'message': 'Google OAuth não configurado',
            'setup_instructions': [
                '1. Crie projeto em console.cloud.google.com',
                '2. Ative Google Calendar API',
                '3. Crie credenciais OAuth 2.0',
                '4. Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET'
            ]
        }
    
    # Montar URL de autorização
    scope = 'https://www.googleapis.com/auth/calendar'
    
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={REDIRECT_URI}&"
        f"response_type=code&"
        f"scope={scope}&"
        f"access_type=offline&"
        f"state={user_id}"
    )
    
    return {
        'auth_url': auth_url,
        'message': 'Redirecione o usuário para esta URL'
    }


@router.post("/google/callback")
async def google_oauth_callback(
    code: str,
    user_id: str
):
    """Callback do Google OAuth"""
    
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=400, detail="OAuth não configurado")
    
    # TODO: Trocar code por tokens
    # import requests
    # response = requests.post(
    #     'https://oauth2.googleapis.com/token',
    #     data={
    #         'code': code,
    #         'client_id': GOOGLE_CLIENT_ID,
    #         'client_secret': GOOGLE_CLIENT_SECRET,
    #         'redirect_uri': REDIRECT_URI,
    #         'grant_type': 'authorization_code'
    #     }
    # )
    # tokens = response.json()
    
    # Salvar tokens
    # await db.oauth_tokens.insert_one({
    #     'user_id': user_id,
    #     'provider': 'google',
    #     'access_token': tokens['access_token'],
    #     'refresh_token': tokens.get('refresh_token'),
    #     'expires_at': datetime.now(timezone.utc) + timedelta(seconds=tokens['expires_in'])
    # })
    
    return {
        'status': 'pending_implementation',
        'message': 'Troca de code por tokens em desenvolvimento'
    }


@router.post("/sync-event")
async def sync_event_to_calendar(
    user_id: str,
    event_title: str,
    start_time: str,
    end_time: str,
    description: Optional[str] = None
):
    """Sincroniza evento para Google Calendar"""
    
    # TODO: Usar tokens OAuth para criar evento
    # from googleapiclient.discovery import build
    # service = build('calendar', 'v3', credentials=creds)
    # event = service.events().insert(calendarId='primary', body=event_body).execute()
    
    return {
        'status': 'pending_oauth',
        'message': 'Configure OAuth primeiro'
    }
