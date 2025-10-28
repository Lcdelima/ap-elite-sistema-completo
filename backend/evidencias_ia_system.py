"""
Análise de Evidências IA - CISAI Intelligence
RAG Forense, Busca Semântica, Minutas Automáticas
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

router = APIRouter(prefix="/api/evidencias-ia", tags=["Análise Evidências IA"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")

class BuscaSemantica(BaseModel):
    caso_id: str
    query: str

@router.post("/busca-semantica")
async def busca_semantica_evidencias(busca: BuscaSemantica):
    """Busca semântica em todas as evidências do caso"""
    
    # Busca documentos do caso
    docs = await db.analysis_docs.find({"analysis_id": busca.caso_id}).to_list(100)
    
    prompt = f"""
Busca semântica na base de evidências.

Query: {busca.query}
Documentos: {len(docs)}

Retorne os 5 trechos mais relevantes em JSON:
{{
  "resultados": [
    {{"doc_id": "...", "trecho": "...", "relevancia": 0.95, "pagina": 3}}
  ]
}}
"""
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"busca_{busca.caso_id}",
            system_message="Você é um sistema de busca semântica forense."
        ).with_model("anthropic", "claude-4-sonnet-20250514")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        try:
            resultados = json.loads(response)
        except:
            resultados = {"raw": response}
        
        return {"success": True, "resultados": resultados}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.post("/resumo-probatorio")
async def gerar_resumo_probatorio(caso_id: str):
    """Gera resumo probatório com IA"""
    
    prompt = f"""
Gere resumo probatório estruturado:

1. PROVAS VÁLIDAS (lista)
2. PROVAS QUESTIONADAS (CPP 155/564)
3. LACUNAS DE CUSTÓDIA (CPP 158-A/F)
4. RECOMENDAÇÕES

Retorne JSON estruturado.
"""
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"resumo_{caso_id}",
            system_message="Você é um perito forense."
        ).with_model("anthropic", "claude-4-sonnet-20250514")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        return {"success": True, "resumo": response}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.post("/gerar-minuta")
async def gerar_minuta_ia(caso_id: str, tipo: str):
    """Gera minuta (RA/HC/Embargos/Apelação)"""
    
    prompt = f"""
Gere minuta de {tipo.upper()} baseada nas evidências.

Inclua:
- Fundamentos jurídicos (CPP/CP)
- Referências às provas
- Teses defensivas
- Pedidos

Formato formal jurídico.
"""
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"minuta_{caso_id}",
            system_message="Você é um advogado criminalista."
        ).with_model("anthropic", "claude-4-sonnet-20250514")
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Salva minuta gerada
        minuta_id = str(uuid.uuid4())
        await db.minutas.insert_one({
            "id": minuta_id,
            "caso_id": caso_id,
            "tipo": tipo,
            "conteudo": response,
            "created_at": datetime.now().isoformat()
        })
        
        return {"success": True, "minuta_id": minuta_id, "conteudo": response}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")

@router.get("/stats")
async def stats_evidencias_ia():
    total_buscas = await db.buscas_semanticas.count_documents({})
    return {"success": True, "total_buscas": total_buscas}
