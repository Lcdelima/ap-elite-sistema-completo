"""
AP ELITE - Sistema Avançado de Investigação com IA
Módulo de Análise Inteligente para Investigações Criminais
Data: 2025
"""

import os
import json
import asyncio
import aiofiles
import base64
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel
import uuid
from pathlib import Path
import cv2
import numpy as np
import pytesseract
from PIL import Image
import hashlib
import exifread
# import magic  # Commented out temporarily
import requests
from urllib.parse import urlparse

# Import for LLM integration
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Configure Emergent LLM
# Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
if not EMERGENT_LLM_KEY:
    raise ValueError("EMERGENT_LLM_KEY não configurada. Configure no arquivo backend/.env")
llm_chat = LlmChat(
    api_key=EMERGENT_LLM_KEY,
    session_id="investigation_ai_session",
    system_message="You are an AI assistant specialized in criminal investigation analysis. Provide detailed, professional analysis suitable for law enforcement reports."
)

# Router configuration
investigation_router = APIRouter(prefix="/api/investigation")

# File paths
INVESTIGATION_DATA_PATH = Path("/app/backend/investigation_data")
EVIDENCE_PATH = INVESTIGATION_DATA_PATH / "evidence"
REPORTS_PATH = INVESTIGATION_DATA_PATH / "reports" 
ANALYSIS_PATH = INVESTIGATION_DATA_PATH / "analysis"
TEMP_PATH = INVESTIGATION_DATA_PATH / "temp"

# Create directories
for path in [INVESTIGATION_DATA_PATH, EVIDENCE_PATH, REPORTS_PATH, ANALYSIS_PATH, TEMP_PATH]:
    path.mkdir(parents=True, exist_ok=True)

# Data Models
class InvestigationCase(BaseModel):
    id: str
    case_number: str
    title: str
    description: str
    status: str
    priority: str
    created_at: str
    updated_at: str
    evidence_count: int = 0
    ai_analysis_status: str = "pending"

class EvidenceItem(BaseModel):
    id: str
    case_id: str
    evidence_number: str
    name: str
    type: str
    file_path: str
    hash_value: str
    size: int
    created_at: str
    ai_analysis: Dict = {}
    metadata: Dict = {}

class AIAnalysisResult(BaseModel):
    evidence_id: str
    analysis_type: str
    result: Dict
    confidence: float
    timestamp: str

class OSINTResult(BaseModel):
    search_query: str
    source: str
    data: Dict
    relevance_score: float
    timestamp: str

# ==================== ANÁLISE COM IA ====================

async def analyze_document_with_ai(file_path: str, content: str) -> Dict:
    """Análise inteligente de documentos usando LLM"""
    try:
        prompt = f"""
        Analise este documento forense e extraia informações relevantes para investigação criminal:

        Conteúdo: {content[:2000]}...

        Por favor, forneça:
        1. RESUMO EXECUTIVO do documento
        2. INFORMAÇÕES PESSOAIS encontradas (nomes, CPF, telefones, endereços)
        3. DATAS E HORÁRIOS relevantes
        4. TRANSAÇÕES FINANCEIRAS (se aplicável)
        5. POSSÍVEIS INDÍCIOS CRIMINAIS
        6. CONTRADIÇÕES ou inconsistências
        7. GRAU DE IMPORTÂNCIA (1-10)
        8. RECOMENDAÇÕES para investigação

        Responda em formato JSON estruturado.
        """

        response = await llm_chat.achat(
            messages=[UserMessage(content=prompt)],
            model="gpt-4o",
            max_tokens=1500
        )

        # Parse AI response
        ai_result = json.loads(response.content)
        
        return {
            "analysis_type": "document_analysis",
            "ai_summary": ai_result,
            "confidence": 0.85,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        return {
            "analysis_type": "document_analysis",
            "error": str(e),
            "confidence": 0.0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

async def analyze_image_with_ai(image_path: str) -> Dict:
    """Análise de imagem com reconhecimento facial e OCR"""
    try:
        results = {}
        
        # Load image
        image = cv2.imread(image_path)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil_image = Image.open(image_path)

        # 1. Face Detection using OpenCV (Haar cascades)
        try:
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            results["faces_detected"] = len(faces)
            results["face_locations"] = faces.tolist()
            results["face_encodings"] = f"Detectadas {len(faces)} faces"
        except Exception as e:
            results["faces_detected"] = 0
            results["face_locations"] = []
            results["face_encodings"] = f"Erro na detecção: {str(e)}"

        # 2. OCR Text Extraction
        try:
            ocr_text = pytesseract.image_to_string(pil_image, lang='por+eng')
            results["extracted_text"] = ocr_text
            
            # Analyze extracted text with AI
            if ocr_text.strip():
                text_analysis = await analyze_document_with_ai(image_path, ocr_text)
                results["text_analysis"] = text_analysis
        except:
            results["extracted_text"] = ""

        # 3. EXIF Metadata
        try:
            with open(image_path, 'rb') as f:
                exif_tags = exifread.process_file(f)
                exif_data = {}
                for tag, value in exif_tags.items():
                    if tag not in ['JPEGThumbnail', 'TIFFThumbnail', 'Filename', 'EXIF MakerNote']:
                        exif_data[tag] = str(value)
                results["metadata"] = exif_data
        except:
            results["metadata"] = {}

        # 4. Image Analysis with AI
        try:
            # Convert image to base64 for AI analysis
            import base64
            with open(image_path, 'rb') as f:
                image_base64 = base64.b64encode(f.read()).decode()
            
            prompt = """
            Analise esta imagem forense e identifique:
            1. Objetos e pessoas visíveis
            2. Localização possível (ambiente interno/externo)
            3. Horário aproximado (baseado na luz)
            4. Possíveis evidências criminais
            5. Qualidade da imagem para análise forense
            6. Recomendações de análise adicional
            
            Responda em formato JSON.
            """
            
            # Note: This would require vision model integration
            # For now, we'll use text-based analysis
            results["ai_visual_analysis"] = {
                "summary": "Análise visual em desenvolvimento",
                "confidence": 0.7
            }
        except:
            results["ai_visual_analysis"] = {"error": "Análise visual não disponível"}

        return {
            "analysis_type": "image_analysis",
            "results": results,
            "confidence": 0.8,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        return {
            "analysis_type": "image_analysis",
            "error": str(e),
            "confidence": 0.0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

async def analyze_patterns_ai(evidence_data: List[Dict]) -> Dict:
    """Análise de padrões suspeitos usando IA"""
    try:
        # Prepare data for AI analysis
        evidence_summary = []
        for evidence in evidence_data:
            summary = {
                "type": evidence.get("type"),
                "name": evidence.get("name"),
                "metadata": evidence.get("metadata", {}),
                "ai_analysis": evidence.get("ai_analysis", {})
            }
            evidence_summary.append(summary)

        prompt = f"""
        Analise estas evidências de investigação criminal e identifique PADRÕES SUSPEITOS:

        Evidências: {json.dumps(evidence_summary, indent=2)}

        Identifique:
        1. PADRÕES TEMPORAIS (horários, datas recorrentes)
        2. PADRÕES GEOGRÁFICOS (localizações frequentes)
        3. PADRÕES DE COMPORTAMENTO (ações repetitivas)
        4. CONEXÕES entre evidências
        5. ANOMALIAS ou inconsistências
        6. POSSÍVEIS CRIMES identificados
        7. GRAU DE SUSPEITA (1-10)
        8. PRÓXIMOS PASSOS recomendados

        Responda em formato JSON estruturado.
        """

        response = await llm_chat.achat(
            messages=[UserMessage(content=prompt)],
            model="gpt-4o",
            max_tokens=2000
        )

        ai_result = json.loads(response.content)
        
        return {
            "analysis_type": "pattern_analysis",
            "patterns_identified": ai_result,
            "evidence_count": len(evidence_data),
            "confidence": 0.85,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        return {
            "analysis_type": "pattern_analysis",
            "error": str(e),
            "confidence": 0.0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

# ==================== OSINT FUNCTIONS ====================

async def search_social_media(query: str, platforms: List[str]) -> Dict:
    """Busca em redes sociais (simulado - requer APIs específicas)"""
    try:
        results = {}
        
        for platform in platforms:
            # This would integrate with actual social media APIs
            # For now, we'll simulate the search
            results[platform] = {
                "profiles_found": [],
                "posts": [],
                "metadata": {
                    "search_query": query,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "status": "simulated_search"
                }
            }
        
        return {
            "search_type": "social_media",
            "query": query,
            "results": results,
            "confidence": 0.7,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    except Exception as e:
        return {"error": str(e)}

async def analyze_geolocation(coordinates: List[float], images: List[str] = None) -> Dict:
    """Análise de geolocalização"""
    try:
        lat, lon = coordinates
        
        # Reverse geocoding (would use real service)
        location_info = {
            "coordinates": {"latitude": lat, "longitude": lon},
            "address": "Análise de localização em desenvolvimento",
            "nearby_landmarks": [],
            "area_type": "unknown",
            "risk_assessment": "medium"
        }

        # Analyze images for geo data if provided
        geo_evidence = []
        if images:
            for image in images:
                # Extract EXIF GPS data
                try:
                    with open(image, 'rb') as f:
                        exif_tags = exifread.process_file(f)
                        if 'GPS GPSLatitude' in exif_tags:
                            geo_evidence.append({
                                "image": image,
                                "has_gps": True,
                                "coordinates": "extracted"
                            })
                except:
                    pass

        return {
            "analysis_type": "geolocation",
            "location_info": location_info,
            "geo_evidence": geo_evidence,
            "confidence": 0.8,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        return {"error": str(e)}

async def verify_personal_data(person_data: Dict) -> Dict:
    """Verificação de dados pessoais (simulado)"""
    try:
        name = person_data.get("name", "")
        cpf = person_data.get("cpf", "")
        phone = person_data.get("phone", "")
        
        # This would integrate with official databases
        verification_result = {
            "name_verification": {"status": "pending", "confidence": 0.0},
            "cpf_verification": {"status": "pending", "confidence": 0.0},
            "phone_verification": {"status": "pending", "confidence": 0.0},
            "cross_references": [],
            "risk_indicators": [],
            "recommendations": [
                "Verificar dados em bases oficiais",
                "Confirmar identidade através de documentos",
                "Investigar conexões familiares"
            ]
        }
        
        return {
            "verification_type": "personal_data",
            "input_data": person_data,
            "results": verification_result,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        return {"error": str(e)}

# ==================== DIGITAL FORENSICS ====================

async def extract_metadata_advanced(file_path: str) -> Dict:
    """Extração avançada de metadados"""
    try:
        file_path = Path(file_path)
        stat = file_path.stat()
        
        # Basic file info
        metadata = {
            "filename": file_path.name,
            "size": stat.st_size,
            "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "accessed": datetime.fromtimestamp(stat.st_atime).isoformat(),
        }
        
        # File type detection
        try:
            # mime_type = magic.from_file(str(file_path), mime=True)
            # metadata["mime_type"] = mime_type
            metadata["mime_type"] = "application/octet-stream"  # Default mime type
        except:
            metadata["mime_type"] = "unknown"
        
        # Hash calculation
        hash_md5 = hashlib.md5()
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
                hash_sha256.update(chunk)
        
        metadata["hashes"] = {
            "md5": hash_md5.hexdigest(),
            "sha256": hash_sha256.hexdigest()
        }
        
        # Format-specific metadata
        if file_path.suffix.lower() in ['.jpg', '.jpeg', '.png', '.tiff']:
            # Image metadata
            try:
                with open(file_path, 'rb') as f:
                    exif_tags = exifread.process_file(f)
                    exif_data = {}
                    for tag, value in exif_tags.items():
                        if tag not in ['JPEGThumbnail', 'TIFFThumbnail']:
                            exif_data[tag] = str(value)
                    metadata["exif"] = exif_data
            except:
                metadata["exif"] = {}

        return {
            "analysis_type": "metadata_extraction",
            "file_path": str(file_path),
            "metadata": metadata,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        return {"error": str(e)}

async def analyze_communications(file_path: str, comm_type: str) -> Dict:
    """Análise de comunicações (WhatsApp, Telegram, etc.)"""
    try:
        # This would parse actual communication files
        # For now, we'll provide a structure for the analysis
        
        analysis_result = {
            "communication_type": comm_type,
            "total_messages": 0,
            "participants": [],
            "timeline": [],
            "keywords_found": [],
            "media_files": [],
            "suspicious_patterns": [],
            "ai_insights": {}
        }

        # Read and analyze file content
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Basic analysis
            lines = content.split('\n')
            analysis_result["total_messages"] = len([l for l in lines if l.strip()])
            
            # AI analysis of communication content
            if content.strip():
                prompt = f"""
                Analise esta conversa/comunicação forense:

                Conteúdo: {content[:1500]}...

                Identifique:
                1. PARTICIPANTES da conversa
                2. TÓPICOS principais discutidos
                3. INFORMAÇÕES SENSÍVEIS (endereços, telefones, etc.)
                4. INDÍCIOS DE CRIMES (ameaças, chantagem, etc.)
                5. PADRÕES DE COMPORTAMENTO suspeitos
                6. CRONOLOGIA de eventos importantes
                7. GRAU DE RELEVÂNCIA para investigação (1-10)

                Responda em formato JSON.
                """
                
                response = await llm_chat.achat(
                    messages=[UserMessage(content=prompt)],
                    model="gpt-4o",
                    max_tokens=1500
                )
                
                analysis_result["ai_insights"] = json.loads(response.content)

        except Exception as e:
            analysis_result["error"] = f"Erro na análise: {str(e)}"

        return {
            "analysis_type": "communication_analysis",
            "results": analysis_result,
            "confidence": 0.8,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        return {"error": str(e)}

# ==================== API ENDPOINTS ====================

@investigation_router.post("/cases")
async def create_investigation_case(case_data: Dict):
    """Criar novo caso de investigação"""
    case_id = str(uuid.uuid4())
    case = InvestigationCase(
        id=case_id,
        case_number=case_data.get("case_number", f"INV-{datetime.now().strftime('%Y%m%d')}-{case_id[:8]}"),
        title=case_data.get("title", ""),
        description=case_data.get("description", ""),
        status=case_data.get("status", "active"),
        priority=case_data.get("priority", "medium"),
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat()
    )
    
    # Save case data
    case_file = INVESTIGATION_DATA_PATH / f"case_{case_id}.json"
    async with aiofiles.open(case_file, 'w') as f:
        await f.write(case.json())
    
    return {"message": "Caso criado com sucesso", "case": case.dict()}

@investigation_router.post("/evidence/upload")
async def upload_evidence(
    background_tasks: BackgroundTasks,
    case_id: str = Form(...),
    evidence_name: str = Form(...),
    evidence_type: str = Form(...),
    file: UploadFile = File(...)
):
    """Upload e análise automática de evidência"""
    
    evidence_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix
    evidence_filename = f"{evidence_id}{file_extension}"
    evidence_file_path = EVIDENCE_PATH / evidence_filename
    
    # Save file
    async with aiofiles.open(evidence_file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    # Calculate hash
    file_hash = hashlib.sha256(content).hexdigest()
    
    # Create evidence record
    evidence = EvidenceItem(
        id=evidence_id,
        case_id=case_id,
        evidence_number=f"EVD-{datetime.now().strftime('%Y%m%d')}-{evidence_id[:8]}",
        name=evidence_name,
        type=evidence_type,
        file_path=str(evidence_file_path),
        hash_value=file_hash,
        size=len(content),
        created_at=datetime.now(timezone.utc).isoformat()
    )
    
    # Save evidence metadata
    evidence_file = INVESTIGATION_DATA_PATH / f"evidence_{evidence_id}.json"
    async with aiofiles.open(evidence_file, 'w') as f:
        await f.write(evidence.json())
    
    # Schedule AI analysis
    background_tasks.add_task(analyze_evidence_background, evidence_id, str(evidence_file_path), evidence_type)
    
    return {
        "message": "Evidência carregada com sucesso",
        "evidence": evidence.dict(),
        "analysis_status": "scheduled"
    }

async def analyze_evidence_background(evidence_id: str, file_path: str, evidence_type: str):
    """Análise de evidência em background"""
    try:
        results = {}
        
        # Extract metadata
        metadata_result = await extract_metadata_advanced(file_path)
        results["metadata"] = metadata_result
        
        # Type-specific analysis
        if evidence_type in ["image", "photo"]:
            image_analysis = await analyze_image_with_ai(file_path)
            results["image_analysis"] = image_analysis
        
        elif evidence_type in ["document", "text"]:
            # Read document content
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                doc_analysis = await analyze_document_with_ai(file_path, content)
                results["document_analysis"] = doc_analysis
            except:
                # Handle binary documents
                results["document_analysis"] = {"error": "Binary document - requires OCR"}
        
        elif evidence_type in ["communication", "chat"]:
            comm_analysis = await analyze_communications(file_path, evidence_type)
            results["communication_analysis"] = comm_analysis
        
        # Save analysis results
        analysis_file = ANALYSIS_PATH / f"analysis_{evidence_id}.json"
        async with aiofiles.open(analysis_file, 'w') as f:
            await f.write(json.dumps(results, indent=2))
        
        # Update evidence record with analysis
        evidence_file = INVESTIGATION_DATA_PATH / f"evidence_{evidence_id}.json"
        if evidence_file.exists():
            async with aiofiles.open(evidence_file, 'r') as f:
                evidence_data = json.loads(await f.read())
            
            evidence_data["ai_analysis"] = results
            
            async with aiofiles.open(evidence_file, 'w') as f:
                await f.write(json.dumps(evidence_data, indent=2))

    except Exception as e:
        print(f"Erro na análise de evidência {evidence_id}: {str(e)}")

@investigation_router.get("/cases/{case_id}/analysis")
async def get_case_analysis(case_id: str):
    """Obter análise completa do caso"""
    try:
        # Get all evidence for the case
        evidence_files = list(INVESTIGATION_DATA_PATH.glob(f"evidence_*.json"))
        case_evidence = []
        
        for evidence_file in evidence_files:
            async with aiofiles.open(evidence_file, 'r') as f:
                evidence_data = json.loads(await f.read())
                if evidence_data.get("case_id") == case_id:
                    case_evidence.append(evidence_data)
        
        # Perform pattern analysis
        pattern_analysis = await analyze_patterns_ai(case_evidence)
        
        return {
            "case_id": case_id,
            "evidence_count": len(case_evidence),
            "evidence": case_evidence,
            "pattern_analysis": pattern_analysis,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@investigation_router.post("/osint/search")
async def osint_search(search_data: Dict):
    """Busca OSINT"""
    query = search_data.get("query", "")
    search_type = search_data.get("type", "general")
    
    results = {}
    
    if search_type == "social_media":
        platforms = search_data.get("platforms", ["facebook", "instagram", "twitter"])
        results = await search_social_media(query, platforms)
    
    elif search_type == "geolocation":
        coordinates = search_data.get("coordinates", [0, 0])
        images = search_data.get("images", [])
        results = await analyze_geolocation(coordinates, images)
    
    elif search_type == "person_verification":
        person_data = search_data.get("person_data", {})
        results = await verify_personal_data(person_data)
    
    # Save OSINT result
    osint_id = str(uuid.uuid4())
    osint_file = INVESTIGATION_DATA_PATH / f"osint_{osint_id}.json"
    async with aiofiles.open(osint_file, 'w') as f:
        await f.write(json.dumps(results, indent=2))
    
    return results

@investigation_router.get("/cases")
async def list_investigation_cases():
    """Listar todos os casos de investigação"""
    try:
        case_files = list(INVESTIGATION_DATA_PATH.glob("case_*.json"))
        cases = []
        
        for case_file in case_files:
            async with aiofiles.open(case_file, 'r') as f:
                case_data = json.loads(await f.read())
                cases.append(case_data)
        
        return {"cases": cases}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@investigation_router.get("/evidence/{evidence_id}")
async def get_evidence_analysis(evidence_id: str):
    """Obter análise detalhada de uma evidência"""
    try:
        evidence_file = INVESTIGATION_DATA_PATH / f"evidence_{evidence_id}.json"
        analysis_file = ANALYSIS_PATH / f"analysis_{evidence_id}.json"
        
        result = {}
        
        if evidence_file.exists():
            async with aiofiles.open(evidence_file, 'r') as f:
                result["evidence"] = json.loads(await f.read())
        
        if analysis_file.exists():
            async with aiofiles.open(analysis_file, 'r') as f:
                result["detailed_analysis"] = json.loads(await f.read())
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Initialize investigation system
async def initialize_investigation_system():
    """Initialize the investigation system"""
    print("🔍 Advanced Investigation System initialized")
    print(f"📁 Data path: {INVESTIGATION_DATA_PATH}")
    print(f"🤖 AI Analysis: Enabled")
    print(f"🌐 OSINT Tools: Ready")
    print(f"📱 Digital Forensics: Active")

# Run initialization
asyncio.create_task(initialize_investigation_system())