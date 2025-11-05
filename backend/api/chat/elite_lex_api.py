"""API do Chat EliteLex - RAG Jurídico - Elite Athena"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.rag_juridico import EliteLexRAG
import os

router = APIRouter(prefix="/api/chat", tags=["chat"])

rag_service = EliteLexRAG()


class ChatRequest(BaseModel):
    query: str
    analysis_type: str = "prescricao"
    area: str = "criminal"
    court: str = "all"


@router.post("/elite-lex")
async def chat_elite_lex(request: ChatRequest):
    """Chat com EliteLex - Assistente jurídico"""
    
    try:
        if request.analysis_type == "jurisprudencia":
            result = await rag_service.search_jurisprudence(
                query=request.query,
                area=request.area,
                court=request.court
            )
        else:
            result = await rag_service.analyze_process(
                process_description=request.query,
                analysis_type=request.analysis_type
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
