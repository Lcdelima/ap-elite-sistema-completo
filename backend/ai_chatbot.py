"""
Chatbot Cliente com IA
Atendimento 24/7, WhatsApp, triagem, agendamento
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from ai_orchestrator import ai_orchestrator

router = APIRouter(prefix="/api/chatbot", tags=["AI Chatbot"])

MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "test_database")]

class ChatMessage(BaseModel):
    session_id: str
    message: str
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatSession(BaseModel):
    user_id: Optional[str] = None
    channel: str = 'web'  # web, whatsapp, telegram

FAQ_KNOWLEDGE = {
    'horario': 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.',
    'valores': 'Os valores variam conforme a complexidade do caso. Oferecemos orçamento personalizado.',
    'especialidades': 'Somos especializados em Defesa Criminal, Perícia Digital, OSINT e Investigações.',
    'contato': 'Telefone: (11) 99999-9999 | Email: contato@apelite.com.br',
    'localizacao': 'Estamos localizados em São Paulo, SP. Atendemos em todo Brasil.',
    'urgencia': 'Para casos urgentes, entre em contato diretamente: (11) 99999-9999'
}

@router.post("/session/create")
async def create_session(session: ChatSession):
    """Cria nova sessão de chat"""
    
    import uuid
    
    session_doc = {
        'session_id': str(uuid.uuid4()),
        'user_id': session.user_id,
        'channel': session.channel,
        'started_at': datetime.now().isoformat(),
        'status': 'active',
        'messages': []
    }
    
    result = await db.chat_sessions.insert_one(session_doc)
    
    # Mensagem de boas-vindas
    welcome_message = """Olá! Bem-vindo à AP Elite! 👋

Sou seu assistente virtual e estou aqui para ajudar.

Como posso auxiliá-lo hoje?
- Informações sobre nossos serviços
- Consultar andamento de caso
- Agendar consulta
- Tirar dúvidas"""
    
    return {
        'success': True,
        'session_id': session_doc['session_id'],
        'welcome_message': welcome_message,
        'features': ['24/7 availability', 'Case tracking', 'Appointment booking', 'FAQ']
    }

@router.post("/message")
async def send_message(msg: ChatMessage):
    """Envia mensagem e recebe resposta do chatbot"""
    
    # Buscar sessão
    session = await db.chat_sessions.find_one({'session_id': msg.session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    # Salvar mensagem do usuário
    user_msg = {
        'role': 'user',
        'content': msg.message,
        'timestamp': datetime.now().isoformat()
    }
    
    await db.chat_sessions.update_one(
        {'session_id': msg.session_id},
        {'$push': {'messages': user_msg}}
    )
    
    # Detectar intent
    intent = detect_intent(msg.message)
    
    # Gerar resposta
    if intent in FAQ_KNOWLEDGE:
        # Resposta do FAQ
        bot_response = FAQ_KNOWLEDGE[intent]
    else:
        # Resposta com IA
        context_info = f"""Você é um assistente virtual da AP Elite, escritório especializado em:
- Defesa Criminal
- Perícia Digital
- OSINT e Investigações
- Análise de Evidências

Seja profissional, prestativo e objetivo.

Usuário perguntou: {msg.message}

Responda de forma clara e direta."""
        
        ai_response = await ai_orchestrator.intelligent_analysis(
            'general_analysis',
            context_info
        )
        
        bot_response = ai_response['response']
    
    # Salvar resposta do bot
    bot_msg = {
        'role': 'assistant',
        'content': bot_response,
        'timestamp': datetime.now().isoformat(),
        'intent': intent
    }
    
    await db.chat_sessions.update_one(
        {'session_id': msg.session_id},
        {'$push': {'messages': bot_msg}}
    )
    
    return {
        'success': True,
        'response': bot_response,
        'intent': intent,
        'suggestions': get_suggestions(intent)
    }

def detect_intent(message: str) -> str:
    """Detecta intenção da mensagem"""
    
    message_lower = message.lower()
    
    if any(word in message_lower for word in ['horário', 'horas', 'atendimento', 'funciona']):
        return 'horario'
    elif any(word in message_lower for word in ['valor', 'preço', 'custo', 'quanto']):
        return 'valores'
    elif any(word in message_lower for word in ['especialidade', 'serviço', 'fazem', 'atuam']):
        return 'especialidades'
    elif any(word in message_lower for word in ['contato', 'telefone', 'email', 'falar']):
        return 'contato'
    elif any(word in message_lower for word in ['endereço', 'localização', 'onde']):
        return 'localizacao'
    elif any(word in message_lower for word in ['urgente', 'emergência', 'urgencia']):
        return 'urgencia'
    else:
        return 'general'

def get_suggestions(intent: str) -> List[str]:
    """Retorna sugestões de perguntas"""
    
    suggestions = {
        'general': ['Quais são os serviços?', 'Quanto custa?', 'Como agendar?'],
        'valores': ['Formas de pagamento', 'Parcelamento', 'Orçamento personalizado'],
        'especialidades': ['Perícia Digital', 'Defesa Criminal', 'OSINT'],
        'horario': ['Agendar consulta', 'Atendimento urgente']
    }
    
    return suggestions.get(intent, ['Como posso ajudar?'])

@router.get("/session/{session_id}/history")
async def get_history(session_id: str):
    """Recupera histórico de conversa"""
    
    session = await db.chat_sessions.find_one({'session_id': session_id})
    
    if not session:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    return {
        'session_id': session_id,
        'messages': session.get('messages', []),
        'total_messages': len(session.get('messages', []))
    }

@router.post("/triagem")
async def triagem_caso(descricao: str, urgencia: str = 'normal'):
    """Triagem automática de novos casos"""
    
    # Análise com IA para triagem
    prompt = f"""Analise a seguinte descrição de caso e forneça uma triagem:

Descrição: {descricao}
Urgência declarada: {urgencia}

Determine:
1. Tipo de caso (criminal, digital forensics, OSINT, etc.)
2. Complexidade (baixa, média, alta)
3. Especialista recomendado
4. Prazo estimado
5. Próximos passos imediatos"""
    
    analysis = await ai_orchestrator.intelligent_analysis(
        'legal_analysis',
        prompt
    )
    
    triagem = {
        'descricao': descricao,
        'urgencia': urgencia,
        'analise': analysis['response'],
        'status': 'aguardando_atribuicao',
        'triaged_at': datetime.now().isoformat()
    }
    
    result = await db.case_triagem.insert_one(triagem)
    
    return {
        'success': True,
        'triagem_id': str(result.inserted_id),
        'analysis': analysis['response'],
        'message': 'Caso triado com sucesso. Entraremos em contato em breve.'
    }

@router.get("/statistics")
async def chatbot_statistics():
    """Estatísticas do chatbot"""
    
    total_sessions = await db.chat_sessions.count_documents({})
    active_sessions = await db.chat_sessions.count_documents({'status': 'active'})
    
    return {
        'total_sessions': total_sessions,
        'active_sessions': active_sessions,
        'channels': ['Web', 'WhatsApp', 'Telegram'],
        'features': [
            '24/7 availability',
            'Multi-language support',
            'Case triage',
            'Appointment booking',
            'FAQ responses',
            'AI-powered answers',
            'Intent detection',
            'Conversation history'
        ],
        'integrations': ['WhatsApp Business API', 'Telegram Bot', 'Web Widget']
    }
