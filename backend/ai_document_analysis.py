"""
AP ELITE ATHENA - AI Document Analysis System
Using Emergent LLM Key with OpenAI GPT
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional
import uuid
import os
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType

load_dotenv()

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client.ap_elite

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        token_parts = credentials.credentials.split('_')
        user_id = token_parts[1]
        user = await db.users.find_one({"id": user_id, "status": "active"}, {"_id": 0, "password": 0})
        return user
    except:
        return None

ai_router = APIRouter(prefix="/api/ai")

UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def get_llm_chat(session_id: str, system_message: str = "Você é um assistente especializado em análise de documentos jurídicos e técnicos."):
    """Initialize LLM Chat with Emergent Key"""
    api_key = os.environ.get('EMERGENT_LLM_KEY', '')
    if not api_key:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")
    
    chat = LlmChat(
        api_key=api_key,
        session_id=session_id,
        system_message=system_message
    ).with_model("openai", "gpt-4o-mini")
    
    return chat

@ai_router.post("/analyze-text")
async def analyze_text(analysis_data: dict, current_user: dict = Depends(get_current_user)):
    """Analyze text using AI"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    text = analysis_data.get("text", "")
    analysis_type = analysis_data.get("type", "general")  # general, legal, summary, sentiment
    
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    # Create session ID
    session_id = f"text_analysis_{uuid.uuid4()}"
    
    # Customize prompt based on analysis type
    prompts = {
        "general": f"Analise o seguinte texto e forneça insights detalhados:\n\n{text}",
        "legal": f"Como especialista jurídico, analise o seguinte texto legal e identifique pontos-chave, riscos e recomendações:\n\n{text}",
        "summary": f"Resuma o seguinte texto de forma concisa e objetiva:\n\n{text}",
        "sentiment": f"Analise o sentimento e o tom do seguinte texto:\n\n{text}",
        "extraction": f"Extraia todas as informações importantes do seguinte texto (nomes, datas, valores, lugares, fatos):\n\n{text}"
    }
    
    prompt = prompts.get(analysis_type, prompts["general"])
    
    try:
        chat = get_llm_chat(session_id)
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Save analysis to database
        analysis_record = {
            "id": str(uuid.uuid4()),
            "type": analysis_type,
            "input_text": text[:500],  # Store first 500 chars
            "analysis_result": response,
            "analyzed_by": current_user.get("email"),
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
            "session_id": session_id
        }
        
        await db.ai_analyses.insert_one(analysis_record)
        
        return {
            "analysis_id": analysis_record["id"],
            "type": analysis_type,
            "result": response
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

@ai_router.post("/analyze-document")
async def analyze_document_endpoint(
    file: UploadFile = File(...),
    analysis_type: str = "general",
    current_user: dict = Depends(get_current_user)
):
    """Analyze document file using AI (Gemini with file support)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Save file temporarily
    file_id = str(uuid.uuid4())
    file_ext = file.filename.split('.')[-1].lower()
    filename = f"{file_id}.{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Determine mime type
    mime_types = {
        "pdf": "application/pdf",
        "txt": "text/plain",
        "csv": "text/csv",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
    
    mime_type = mime_types.get(file_ext, "application/octet-stream")
    
    try:
        # Use Gemini for file analysis
        session_id = f"doc_analysis_{file_id}"
        api_key = os.environ.get('EMERGENT_LLM_KEY', '')
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="Você é um especialista em análise de documentos jurídicos e técnicos."
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Create file content
        file_content = FileContentWithMimeType(
            file_path=str(file_path),
            mime_type=mime_type
        )
        
        # Analysis prompts
        prompts = {
            "general": "Analise este documento e forneça um resumo detalhado com os pontos principais.",
            "legal": "Analise este documento jurídico. Identifique: partes envolvidas, objeto, cláusulas importantes, riscos e recomendações.",
            "summary": "Faça um resumo executivo deste documento.",
            "extraction": "Extraia todas as informações importantes deste documento: nomes, datas, valores, números de processos, endereços."
        }
        
        prompt = prompts.get(analysis_type, prompts["general"])
        
        user_message = UserMessage(
            text=prompt,
            file_contents=[file_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Save analysis
        analysis_record = {
            "id": str(uuid.uuid4()),
            "type": "document",
            "analysis_type": analysis_type,
            "filename": file.filename,
            "file_id": file_id,
            "analysis_result": response,
            "analyzed_by": current_user.get("email"),
            "analyzed_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.ai_analyses.insert_one(analysis_record)
        
        return {
            "analysis_id": analysis_record["id"],
            "filename": file.filename,
            "type": analysis_type,
            "result": response
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document analysis failed: {str(e)}")
    
    finally:
        # Clean up temporary file
        if file_path.exists():
            os.remove(file_path)

@ai_router.post("/chat")
async def ai_chat(chat_data: dict, current_user: dict = Depends(get_current_user)):
    """Chat with AI assistant"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    message = chat_data.get("message", "")
    session_id = chat_data.get("session_id", f"chat_{uuid.uuid4()}")
    
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    try:
        chat = get_llm_chat(session_id, "Você é um assistente jurídico especializado em direito brasileiro.")
        user_message = UserMessage(text=message)
        response = await chat.send_message(user_message)
        
        # Save message to history
        chat_record = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_message": message,
            "ai_response": response,
            "user_email": current_user.get("email"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.ai_chat_history.insert_one(chat_record)
        
        return {
            "session_id": session_id,
            "message": message,
            "response": response
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@ai_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get chat history for a session"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    history = await db.ai_chat_history.find(
        {"session_id": session_id, "user_email": current_user.get("email")},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    
    return {"session_id": session_id, "history": history}

@ai_router.get("/analyses/list")
async def list_analyses(limit: int = 50, current_user: dict = Depends(get_current_user)):
    """List AI analyses"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    analyses = await db.ai_analyses.find(
        {"analyzed_by": current_user.get("email")},
        {"_id": 0, "input_text": 1, "type": 1, "analysis_type": 1, "analyzed_at": 1, "id": 1}
    ).sort("analyzed_at", -1).limit(limit).to_list(limit)
    
    return {"analyses": analyses, "total": len(analyses)}

@ai_router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific analysis"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    analysis = await db.ai_analyses.find_one({"id": analysis_id}, {"_id": 0})
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return {"analysis": analysis}

@ai_router.get("/status")
async def get_ai_status(current_user: dict = Depends(get_current_user)):
    """Check AI system status"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    api_key = os.environ.get('EMERGENT_LLM_KEY', '')
    
    return {
        "configured": bool(api_key),
        "model": "gpt-4o-mini (OpenAI)",
        "document_model": "gemini-2.0-flash (Google)",
        "status": "active" if api_key else "not_configured"
    }
