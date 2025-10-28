"""
Análise Processual Pro com IA
Mapa de Provas, Risco Processual, Chat IA Contextual
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv
import os
import json

load_dotenv()

router = APIRouter(prefix="/api/juridico/analise-pro", tags=["Análise Pro com IA"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "sk-emergent-8956b8181D8C59f613")

class ChatRequest(BaseModel):
    processo_id: str
    mensagem: str

@router.post("/mapa-provas")
async def gerar_mapa_provas(processo_id: str):
    """Gera mapa visual de provas"""
    
    processo = await db.processos.find_one({"id": processo_id})
    if not processo:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    # Busca documentos do processo
    docs = await db.biblioteca.find({"processo_id": processo_id}).to_list(100)
    
    prompt = f"""
Crie um mapa de provas estruturado para este processo:

Número: {processo.get('numero')}
Tipo: {processo.get('tipo_processo')}
Documentos: {len(docs)}

Retorne JSON:
{{
  "provas_acusacao": [{{"tipo": "", "descricao": "", "validade": "válida|inválida|questionável"}}],
  "provas_defesa": [],
  "provas_testemunhais": [],
  "provas_periciais": [],
  "analise": "..."
}}
"""
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"mapa_{processo_id}",
            system_message="Você é um advogado criminalista."
        ).with_model("anthropic", "claude-4-sonnet-20250514")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        try:
            mapa = json.loads(response)
        except:
            mapa = {"raw": response}
        
        return {"success": True, "mapa": mapa}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.post("/chat")
async def chat_contextual(chat_req: ChatRequest):
    """Chat IA contextual do caso"""
    
    processo = await db.processos.find_one({"id": chat_req.processo_id})
    if not processo:
        raise HTTPException(status_code=404, detail="Processo não encontrado")
    
    context = f"Processo {processo.get('numero')} - {processo.get('tipo_processo')}"
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"chat_{chat_req.processo_id}",
            system_message=f"Você está analisando o {context}"
        ).with_model("anthropic", "claude-4-sonnet-20250514")
        
        response = await chat.send_message(UserMessage(text=chat_req.mensagem))
        
        return {"success": True, "resposta": response}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")
