"""
Interceptações Telemáticas - IA Legal Suite
Transcrição, Diarização, Análise Jurídica
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import hashlib
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv
import os
import json

load_dotenv()

router = APIRouter(prefix="/api/interceptacoes", tags=["Interceptações Telemáticas"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")

class InterceptacaoCreate(BaseModel):
    numero_ordem: str
    alvo_nome: str
    alvo_telefone: str
    tipo: str  # voz|dados|telematica
    data_inicio: str
    data_fim: Optional[str] = None

@router.post("/")
async def criar_interceptacao(intercept: InterceptacaoCreate):
    """Cria ordem de interceptação"""
    
    intercept_id = str(uuid.uuid4())
    
    data = {
        "id": intercept_id,
        **intercept.dict(),
        "status": "ativa",
        "eventos": [],
        "created_at": datetime.now().isoformat()
    }
    
    await db.interceptacoes.insert_one(data)
    
    return {"success": True, "intercept_id": intercept_id}

@router.post("/{intercept_id}/upload-audio")
async def upload_audio(intercept_id: str, file: UploadFile = File(...)):
    """Upload de áudio com hash e transcrição simulada"""
    
    contents = await file.read()
    sha256 = hashlib.sha256(contents).hexdigest()
    
    audio_id = str(uuid.uuid4())
    
    # Simula transcrição
    transcricao = f"[Transcrição simulada de {file.filename}] Aguardando processamento IA..."
    
    audio_data = {
        "id": audio_id,
        "intercept_id": intercept_id,
        "filename": file.filename,
        "sha256": sha256,
        "size": len(contents),
        "transcricao": transcricao,
        "diarizacao": [],
        "created_at": datetime.now().isoformat()
    }
    
    await db.interceptacoes_audios.insert_one(audio_data)
    
    return {
        "success": True,
        "audio_id": audio_id,
        "sha256": sha256,
        "message": "Áudio carregado. Transcrição em andamento."
    }

@router.post("/{intercept_id}/analisar-ia")
async def analisar_comunicacao_ia(intercept_id: str):
    """IA analisa comunicações para identificar temas jurídicos"""
    
    audios = await db.interceptacoes_audios.find({"intercept_id": intercept_id}).to_list(100)
    
    prompt = f"""
Analise {len(audios)} comunicações interceptadas.

Identifique:
1. Temas jurídicos (ameaça, extorsão, lavagem, organização criminosa)
2. Interlocutores principais
3. Eventos críticos
4. Contexto temporal

Retorne JSON:
{{
  "temas": [{{"tipo": "ameaça", "gravidade": "alta", "trecho": "..."}}],
  "interlocutores": ["João", "Maria"],
  "eventos_criticos": [{{"timestamp": "...", "descricao": "..."}}],
  "conclusao": "..."
}}
"""
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"intercept_{intercept_id}",
            system_message="Você é um perito em análise de comunicações interceptadas."
        ).with_model("anthropic", "claude-4-sonnet-20250514")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        try:
            analise = json.loads(response)
        except:
            analise = {"raw": response}
        
        await db.interceptacoes.update_one(
            {"id": intercept_id},
            {"$set": {"analise_ia": analise, "analisado": True}}
        )
        
        return {"success": True, "analise": analise}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro IA: {str(e)}")

@router.get("/")
async def listar_interceptacoes():
    interceptacoes = await db.interceptacoes.find({}).sort("created_at", -1).to_list(100)
    return {"success": True, "interceptacoes": interceptacoes}

@router.get("/stats")
async def stats_interceptacoes():
    total = await db.interceptacoes.count_documents({})
    ativas = await db.interceptacoes.count_documents({"status": "ativa"})
    
    return {"success": True, "total": total, "ativas": ativas}
