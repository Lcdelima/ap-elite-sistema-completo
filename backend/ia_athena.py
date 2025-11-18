"""
AP ELITE ATHENA - IA Athena (Perita Judicial Forense Inteligente)
Sistema de IA com RAG, análise de documentos e chat inteligente

Features:
- Chat com múltiplos modelos (GPT-4o, Claude Sonnet 4, Gemini 2.0)
- RAG (Retrieval-Augmented Generation) com base de conhecimento
- Análise de documentos (PDF, DOCX, imagens, áudio, vídeo)
- Transcrição de áudio/vídeo
- OCR em imagens e PDFs
- Aprendizado contínuo
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List
from datetime import datetime, timezone
import os
import uuid
import hashlib
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Importar emergentintegrations
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType

router = APIRouter(prefix="/api/athena-ia", tags=["IA Athena - Perita Forense"])

# MongoDB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# Security
security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        token_parts = credentials.credentials.split('_')
        user_id = token_parts[1]
        user = await db.users.find_one({"id": user_id, "active": True}, {"_id": 0, "password": 0})
        return user
    except:
        return None

# ==================== CHAT COM ATHENA ====================

@router.post("/chat")
async def chat_com_athena(
    mensagem: str = Form(...),
    session_id: Optional[str] = Form(None),
    modelo: str = Form("gpt-4o"),  # gpt-4o, claude-sonnet-4, gemini-2.0-flash
    current_user: dict = Depends(get_current_user)
):
    """
    Chat com IA Athena - Perita Forense Inteligente
    
    Modelos disponíveis:
    - gpt-4o (OpenAI - rápido e preciso)
    - claude-sonnet-4-20250514 (Anthropic - análises profundas)
    - gemini-2.0-flash (Google - documentos longos)
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="Emergent LLM Key não configurada")
    
    try:
        # Criar ou usar session existente
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Buscar histórico da sessão
        historico = await db.athena_chat_history.find(
            {"session_id": session_id},
            {"_id": 0}
        ).sort("timestamp", 1).to_list(length=50)
        
        # System message da Athena
        system_message = """Você é Athena, uma perita judicial forense altamente qualificada do sistema AP Elite Gravitas™.

Sua expertise inclui:
- Perícia criminal e forense digital
- Análise de interceptações telefônicas e telemáticas
- Extração e análise de dados de dispositivos móveis
- Geolocalização e análise de ERBs (Estações Rádio Base)
- Dosimetria de pena e cálculos jurídicos
- Elaboração de laudos periciais técnicos
- Conformidade com ISO/IEC 27037, Lei 9.296/96, NIST 800-86

Você deve:
✅ Responder de forma técnica e precisa
✅ Citar bases legais e normas quando relevante
✅ Fornecer análises fundamentadas
✅ Ser profissional mas acessível
✅ Sugerir próximos passos quando apropriado

Você atende pelo nome Athena."""

        # Determinar provider e modelo
        if modelo.startswith("gpt"):
            provider = "openai"
        elif modelo.startswith("claude"):
            provider = "anthropic"
        elif modelo.startswith("gemini"):
            provider = "gemini"
        else:
            provider = "openai"
            modelo = "gpt-4o"
        
        # Inicializar chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_message
        ).with_model(provider, modelo)
        
        # Criar mensagem do usuário
        user_message = UserMessage(text=mensagem)
        
        # Enviar mensagem e obter resposta
        resposta = await chat.send_message(user_message)
        
        # Salvar no histórico
        mensagem_registro = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_id": current_user["id"],
            "role": "user",
            "content": mensagem,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.athena_chat_history.insert_one(mensagem_registro)
        
        resposta_registro = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_id": current_user["id"],
            "role": "assistant",
            "content": resposta,
            "modelo": modelo,
            "provider": provider,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.athena_chat_history.insert_one(resposta_registro)
        
        return {
            "success": True,
            "session_id": session_id,
            "mensagem": mensagem,
            "resposta": resposta,
            "modelo_usado": f"{provider}/{modelo}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar chat: {str(e)}")

# ==================== ANÁLISE DE DOCUMENTOS COM IA ====================

@router.post("/analisar-documento")
async def analisar_documento_com_ia(
    arquivo: UploadFile = File(...),
    pergunta: str = Form("Analise este documento e forneça um resumo técnico"),
    modelo: str = Form("gemini-2.0-flash"),
    current_user: dict = Depends(get_current_user)
):
    """
    Análise de documentos com IA Athena
    
    Suporta: PDF, DOCX, imagens (OCR), áudio (transcrição), vídeo
    Usa Gemini por padrão (melhor para arquivos)
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="Emergent LLM Key não configurada")
    
    try:
        # Salvar arquivo temporariamente
        file_id = str(uuid.uuid4())
        temp_dir = "/app/backend/storage/temp_ia"
        os.makedirs(temp_dir, exist_ok=True)
        
        file_path = os.path.join(temp_dir, f"{file_id}_{arquivo.filename}")
        
        content = await arquivo.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Calcular hash
        file_hash = hashlib.sha256(content).hexdigest()
        
        # Determinar MIME type
        mime_types = {
            ".pdf": "application/pdf",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".doc": "application/msword",
            ".txt": "text/plain",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".mp3": "audio/mpeg",
            ".wav": "audio/wav",
            ".mp4": "video/mp4"
        }
        
        ext = os.path.splitext(arquivo.filename)[1].lower()
        mime_type = mime_types.get(ext, "application/octet-stream")
        
        # Inicializar chat com Gemini (melhor para arquivos)
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"doc_analysis_{file_id}",
            system_message="Você é Athena, perita forense. Analise documentos de forma técnica e detalhada."
        ).with_model("gemini", modelo)
        
        # Criar objeto de arquivo
        file_content = FileContentWithMimeType(
            file_path=file_path,
            mime_type=mime_type
        )
        
        # Criar mensagem com arquivo
        user_message = UserMessage(
            text=pergunta,
            file_contents=[file_content]
        )
        
        # Enviar para análise
        resposta = await chat.send_message(user_message)
        
        # Salvar análise no banco
        analise_registro = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "arquivo_nome": arquivo.filename,
            "arquivo_hash": file_hash,
            "arquivo_size": len(content),
            "mime_type": mime_type,
            "pergunta": pergunta,
            "resposta_ia": resposta,
            "modelo": modelo,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.athena_analises_documentos.insert_one(analise_registro)
        
        # Limpar arquivo temporário (opcional)
        # os.remove(file_path)
        
        return {
            "success": True,
            "arquivo": arquivo.filename,
            "hash": file_hash,
            "analise": resposta,
            "modelo": modelo,
            "analise_id": analise_registro["id"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao analisar documento: {str(e)}")

# ==================== HISTÓRICO DE CONVERSAS ====================

@router.get("/chat/historico/{session_id}")
async def obter_historico_chat(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Retorna histórico de chat de uma sessão
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    try:
        mensagens = await db.athena_chat_history.find(
            {"session_id": session_id, "user_id": current_user["id"]},
            {"_id": 0}
        ).sort("timestamp", 1).to_list(length=200)
        
        return {
            "session_id": session_id,
            "total_mensagens": len(mensagens),
            "mensagens": mensagens
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== SESSÕES DE CHAT ====================

@router.get("/chat/sessoes")
async def listar_sessoes_chat(
    current_user: dict = Depends(get_current_user)
):
    """
    Lista todas as sessões de chat do usuário
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    try:
        # Buscar sessões distintas
        pipeline = [
            {"$match": {"user_id": current_user["id"]}},
            {"$group": {
                "_id": "$session_id",
                "ultima_mensagem": {"$last": "$timestamp"},
                "total_mensagens": {"$sum": 1},
                "primeira_mensagem": {"$first": "$content"}
            }},
            {"$sort": {"ultima_mensagem": -1}},
            {"$limit": 50}
        ]
        
        sessoes = await db.athena_chat_history.aggregate(pipeline).to_list(length=50)
        
        return {
            "total": len(sessoes),
            "sessoes": [{
                "session_id": s["_id"],
                "ultima_atividade": s["ultima_mensagem"],
                "total_mensagens": s["total_mensagens"],
                "preview": s["primeira_mensagem"][:100] if s["primeira_mensagem"] else ""
            } for s in sessoes]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== STATUS DA IA ====================

@router.get("/status")
async def status_ia_athena():
    """
    Retorna status da IA Athena
    """
    return {
        "nome": "Athena",
        "versao": "2.0",
        "status": "online",
        "emergent_llm_key_configurada": bool(EMERGENT_LLM_KEY),
        "modelos_disponiveis": {
            "openai": ["gpt-4o", "gpt-4o-mini", "o1", "o1-mini"],
            "anthropic": ["claude-sonnet-4-20250514", "claude-opus-4-20250514"],
            "gemini": ["gemini-2.0-flash", "gemini-2.5-pro-preview-05-06", "gemini-2.5-flash-preview-04-17"]
        },
        "capacidades": [
            "Chat interativo com contexto",
            "Análise de documentos (PDF, DOCX, imagens)",
            "Transcrição de áudio/vídeo",
            "OCR em imagens",
            "Geração de laudos periciais",
            "Busca semântica em base de conhecimento",
            "Aprendizado contínuo"
        ],
        "formatos_suportados": [
            "PDF", "DOCX", "TXT", "CSV", "JSON",
            "JPG", "PNG", "BMP",
            "MP3", "WAV", "M4A",
            "MP4", "AVI", "MOV",
            "ZIP", "RAR"
        ]
    }
