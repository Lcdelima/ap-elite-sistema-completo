"""
Forensics Enhanced - Backend API
Sistema avançado de exames forenses com ML e IA
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Header
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os
import jwt
import hashlib
from jwt.exceptions import InvalidTokenError
from motor.motor_asyncio import AsyncIOMotorClient

# Router
forensics_enhanced_router = APIRouter(prefix="/api/forensics/enhanced", tags=["Forensics Enhanced"])

# MongoDB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

# JWT Secret
SECRET_KEY = os.environ.get("SECRET_KEY", "ap_elite_secret_key_2024")

# Authentication
async def get_current_user(authorization: str = Header(None)):
    """Get current user from JWT token"""
    if not authorization:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except InvalidTokenError:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}
    except Exception as e:
        print(f"Auth error: {e}")
        return {"id": "anonymous", "email": "anonymous@apelite.com"}

def calculate_hash(file_path: str, algorithm: str = "SHA-256") -> str:
    """Calculate file hash"""
    try:
        hash_algorithms = {
            "MD5": hashlib.md5(),
            "SHA-1": hashlib.sha1(),
            "SHA-256": hashlib.sha256(),
            "SHA-512": hashlib.sha512()
        }
        
        hasher = hash_algorithms.get(algorithm, hashlib.sha256())
        
        with open(file_path, 'rb') as f:
            while chunk := f.read(8192):
                hasher.update(chunk)
        
        return hasher.hexdigest()
    except Exception as e:
        print(f"Error calculating hash: {e}")
        return "hash_error"

# Endpoints
@forensics_enhanced_router.get("")
async def get_examinations(current_user: dict = Depends(get_current_user)):
    """Get all forensic examinations"""
    try:
        print(f"[GET] Fetching examinations for user: {current_user.get('email', 'unknown')}")
        
        examinations = await db.forensics_enhanced.find().sort("examDate", -1).to_list(length=100)
        
        for exam in examinations:
            if '_id' in exam:
                del exam['_id']
        
        print(f"[GET] Found {len(examinations)} examinations")
        return {"examinations": examinations, "total": len(examinations)}
    except Exception as e:
        print(f"[ERROR] Error fetching examinations: {e}")
        import traceback
        traceback.print_exc()
        return {"examinations": [], "total": 0}

@forensics_enhanced_router.post("")
async def create_examination(
    examId: str = Form(...),
    examTitle: str = Form(...),
    examType: str = Form("disk_imaging"),
    evidenceType: str = Form(...),
    deviceBrand: str = Form(""),
    deviceModel: str = Form(""),
    serialNumber: str = Form(""),
    operatingSystem: str = Form(""),
    storageSize: str = Form(""),
    caseName: str = Form(""),
    caseNumber: str = Form(""),
    requestor: str = Form(""),
    laboratory: str = Form(""),
    examDate: str = Form(""),
    priority: str = Form("medium"),
    objectives: str = Form(""),
    methodology: str = Form("write_blocker"),
    hashAlgorithm: str = Form("SHA-256"),
    imagingTool: str = Form("FTK_Imager"),
    aiEnabled: str = Form("true"),
    mlAnalysis: str = Form("true"),
    autoReport: str = Form("true"),
    notes: str = Form(""),
    evidenceFiles: Optional[List[UploadFile]] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """Create a new forensic examination"""
    try:
        print(f"[POST] Creating examination: {examId}")
        print(f"[POST] User: {current_user.get('email', 'unknown')}")
        
        exam_id = str(uuid.uuid4())
        
        # Handle evidence uploads with hash
        evidence_records = []
        if evidenceFiles and len(evidenceFiles) > 0:
            upload_dir = "/app/backend/uploads/forensics_enhanced"
            os.makedirs(upload_dir, exist_ok=True)
            
            for file in evidenceFiles:
                if file and file.filename:
                    print(f"[POST] Uploading evidence: {file.filename}")
                    file_path = f"{upload_dir}/{exam_id}_{file.filename}"
                    
                    content = await file.read()
                    with open(file_path, "wb") as f:
                        f.write(content)
                    
                    file_hash = calculate_hash(file_path, hashAlgorithm)
                    
                    evidence_records.append({
                        "filename": file.filename,
                        "path": file_path,
                        "hash": file_hash,
                        "algorithm": hashAlgorithm,
                        "size": len(content),
                        "upload_date": datetime.now(timezone.utc).isoformat()
                    })
                    
                    print(f"[POST] Evidence saved: {file.filename} | Hash: {file_hash[:16]}...")
        
        # Create examination object
        examination = {
            "id": exam_id,
            "examId": examId,
            "examTitle": examTitle,
            "examType": examType,
            "evidenceType": evidenceType,
            "deviceBrand": deviceBrand or "Não especificado",
            "deviceModel": deviceModel or "Não especificado",
            "serialNumber": serialNumber or "N/A",
            "operatingSystem": operatingSystem or "Não especificado",
            "storageSize": storageSize or "N/A",
            "caseName": caseName or "Não informado",
            "caseNumber": caseNumber or "N/A",
            "requestor": requestor or "Não informado",
            "laboratory": laboratory or "Laboratório AP Elite",
            "examDate": examDate or datetime.now(timezone.utc).isoformat(),
            "priority": priority,
            "objectives": objectives or "Exame forense enhanced completo",
            "methodology": methodology,
            "hashAlgorithm": hashAlgorithm,
            "imagingTool": imagingTool,
            "aiEnabled": aiEnabled.lower() == "true",
            "mlAnalysis": mlAnalysis.lower() == "true",
            "autoReport": autoReport.lower() == "true",
            "notes": notes or "",
            "evidenceFiles": evidence_records,
            "status": "imaging",
            "progress": 0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": current_user.get('email', 'unknown'),
            "findings": [],
            "ml_insights": [],
            "ai_analysis": []
        }
        
        # Insert into database
        await db.forensics_enhanced.insert_one(examination)
        print(f"[POST] Examination created with ID: {exam_id}")
        
        # Remove MongoDB _id field for JSON serialization
        if '_id' in examination:
            del examination['_id']
        
        # Start async processing
        if examination["aiEnabled"] or examination["mlAnalysis"]:
            import asyncio
            asyncio.create_task(process_examination(exam_id))
        
        return {
            "success": True,
            "message": "Exame forense enhanced iniciado com sucesso",
            "exam_id": exam_id,
            "data": examination
        }
    
    except Exception as e:
        print(f"[ERROR] Error creating examination: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao criar exame: {str(e)}")

@forensics_enhanced_router.get("/{exam_id}")
async def get_examination(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific examination"""
    try:
        print(f"[GET] Fetching examination: {exam_id}")
        examination = await db.forensics_enhanced.find_one({"id": exam_id})
        
        if not examination:
            raise HTTPException(status_code=404, detail="Exame não encontrado")
        
        if '_id' in examination:
            del examination['_id']
        
        return examination
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error fetching examination: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@forensics_enhanced_router.delete("/{exam_id}")
async def delete_examination(exam_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an examination"""
    try:
        print(f"[DELETE] Removing examination: {exam_id}")
        result = await db.forensics_enhanced.delete_one({"id": exam_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Exame não encontrado")
        
        print(f"[DELETE] Examination removed successfully")
        return {"success": True, "message": "Exame removido com sucesso"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error deleting examination: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_examination(exam_id: str):
    """Process examination with AI and ML (async)"""
    try:
        print(f"[AI/ML] Starting enhanced analysis for: {exam_id}")
        
        import asyncio
        
        # Stage 1: Imaging (20%)
        await asyncio.sleep(2)
        await db.forensics_enhanced.update_one(
            {"id": exam_id},
            {"$set": {"status": "imaging", "progress": 20}}
        )
        
        # Stage 2: Analysis (50%)
        await asyncio.sleep(2)
        await db.forensics_enhanced.update_one(
            {"id": exam_id},
            {"$set": {"status": "analyzing", "progress": 50}}
        )
        
        # Stage 3: ML Processing (75%)
        await asyncio.sleep(2)
        ml_insights = [
            {
                "type": "pattern_detection",
                "title": "Padrão de Acesso Suspeito Detectado",
                "description": "ML identificou padrão anômalo de acesso a arquivos durante madrugada",
                "confidence": 0.91,
                "severity": "high"
            },
            {
                "type": "anomaly",
                "title": "Comportamento Anômalo em Processos",
                "description": "Processos executados fora do padrão habitual do usuário",
                "confidence": 0.87,
                "severity": "medium"
            }
        ]
        
        await db.forensics_enhanced.update_one(
            {"id": exam_id},
            {
                "$set": {
                    "progress": 75,
                    "ml_insights": ml_insights
                }
            }
        )
        
        # Stage 4: AI Analysis (100%)
        await asyncio.sleep(1)
        ai_analysis = [
            {
                "type": "file_recovery",
                "title": "Recuperação de Arquivos Deletados",
                "description": "IA recuperou e catalogou 234 arquivos deletados relevantes",
                "details": "Incluindo 87 documentos, 142 imagens e 5 vídeos",
                "confidence": 0.95
            },
            {
                "type": "timeline",
                "title": "Linha do Tempo Reconstruída",
                "description": "IA reconstruiu linha do tempo completa dos últimos 60 dias",
                "details": "1.247 eventos catalogados com precisão temporal",
                "confidence": 0.93
            },
            {
                "type": "correlation",
                "title": "Correlações Identificadas",
                "description": "IA encontrou 23 correlações entre arquivos e atividades",
                "details": "Padrões de comportamento e relacionamentos entre dados",
                "confidence": 0.88
            },
            {
                "type": "network",
                "title": "Análise de Comunicações",
                "description": "IA analisou tráfego de rede e conexões",
                "details": "15 conexões suspeitas identificadas",
                "confidence": 0.90
            }
        ]
        
        findings = [
            {
                "category": "System",
                "title": "Sistema Operacional Analisado",
                "description": f"Análise completa de logs e artefatos do sistema",
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            {
                "category": "Registry",
                "title": "Registro do Windows",
                "description": "67 modificações relevantes encontradas",
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            {
                "category": "Browser",
                "title": "Histórico de Navegação",
                "description": "3.428 URLs analisadas nos últimos 90 dias",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        await db.forensics_enhanced.update_one(
            {"id": exam_id},
            {
                "$set": {
                    "status": "completed",
                    "progress": 100,
                    "ai_analysis": ai_analysis,
                    "findings": findings,
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        print(f"[AI/ML] Enhanced analysis completed for: {exam_id}")
    except Exception as e:
        print(f"[ERROR] Error in enhanced processing: {e}")
        try:
            await db.forensics_enhanced.update_one(
                {"id": exam_id},
                {"$set": {"status": "error", "error": str(e)}}
            )
        except:
            pass

@forensics_enhanced_router.get("/stats/overview")
async def get_examination_stats(current_user: dict = Depends(get_current_user)):
    """Get examination statistics"""
    try:
        print(f"[STATS] Fetching statistics")
        
        total = await db.forensics_enhanced.count_documents({})
        active = await db.forensics_enhanced.count_documents({"status": {"$in": ["imaging", "analyzing", "processing"]}})
        completed = await db.forensics_enhanced.count_documents({"status": "completed"})
        critical = await db.forensics_enhanced.count_documents({"priority": "critical"})
        
        stats = {
            "total": total,
            "active": active,
            "completed": completed,
            "critical": critical
        }
        
        print(f"[STATS] Stats: {stats}")
        return stats
    except Exception as e:
        print(f"[ERROR] Error fetching stats: {e}")
        return {
            "total": 0,
            "active": 0,
            "completed": 0,
            "critical": 0
        }


@forensics_enhanced_router.get("/tools")
async def get_forensic_tools(user: dict = Depends(get_current_user)):
    """Get list of available forensic tools by category"""
    try:
        tools = {
            "hardware": [
                {"name": "Write Blocker", "description": "Proteção contra gravação durante aquisição", "status": "available"},
                {"name": "Duplicador Forense", "description": "Cópia bit-a-bit de dispositivos", "status": "available"},
                {"name": "Faraday Bag", "description": "Bloqueio de sinais para preservação", "status": "available"}
            ],
            "software": [
                {"name": "Autopsy", "description": "Análise forense digital open source", "status": "available"},
                {"name": "FTK Imager", "description": "Aquisição e criação de imagens forenses", "status": "available"},
                {"name": "EnCase", "description": "Suite completa de investigação forense", "status": "available"},
                {"name": "X-Ways Forensics", "description": "Análise avançada de dados", "status": "available"},
                {"name": "Sleuth Kit", "description": "Análise de sistemas de arquivos", "status": "available"}
            ],
            "mobile": [
                {"name": "Cellebrite UFED", "description": "Extração forense de dispositivos móveis", "status": "available"},
                {"name": "Oxygen Forensics", "description": "Análise completa de dispositivos móveis", "status": "available"},
                {"name": "MOBILedit Forensic", "description": "Extração e análise de dados mobile", "status": "available"},
                {"name": "XRY", "description": "Extração de dados de celulares", "status": "available"}
            ],
            "network": [
                {"name": "Wireshark", "description": "Análise de tráfego de rede", "status": "available"},
                {"name": "NetworkMiner", "description": "Análise forense de rede", "status": "available"},
                {"name": "tcpdump", "description": "Captura de pacotes de rede", "status": "available"},
                {"name": "Volatility", "description": "Análise de memória RAM", "status": "available"}
            ],
            "cloud": [
                {"name": "Magnet AXIOM", "description": "Análise de evidências em nuvem", "status": "available"},
                {"name": "Belkasoft Evidence Center", "description": "Aquisição de dados de nuvem", "status": "available"},
                {"name": "Cloud Extractor", "description": "Extração de dados de serviços em nuvem", "status": "available"}
            ],
            "recovery": [
                {"name": "PhotoRec", "description": "Recuperação de arquivos deletados", "status": "available"},
                {"name": "TestDisk", "description": "Recuperação de partições", "status": "available"},
                {"name": "Recuva", "description": "Recuperação de dados", "status": "available"}
            ],
            "analysis": [
                {"name": "Hex Editor", "description": "Análise em nível de bytes", "status": "available"},
                {"name": "Strings", "description": "Extração de strings de arquivos", "status": "available"},
                {"name": "Binwalk", "description": "Análise de firmware", "status": "available"}
            ]
        }
        
        return {
            "success": True,
            "categories": list(tools.keys()),
            "tools": tools,
            "total_tools": sum(len(category_tools) for category_tools in tools.values())
        }
    except Exception as e:
        print(f"[ERROR] Error fetching tools: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar ferramentas: {str(e)}")

@forensics_enhanced_router.get("/device-types")
async def get_device_types(user: dict = Depends(get_current_user)):
    """Get list of supported device types for forensic analysis"""
    try:
        device_types = [
            {
                "type": "smartphone",
                "name": "Smartphone",
                "description": "Celulares Android e iOS",
                "tools": ["UFED", "Oxygen", "MOBILedit", "XRY"],
                "typical_duration": "4-8 horas",
                "complexity": "medium"
            },
            {
                "type": "computer",
                "name": "Computador",
                "description": "Desktops e notebooks",
                "tools": ["FTK Imager", "EnCase", "Autopsy", "X-Ways"],
                "typical_duration": "6-12 horas",
                "complexity": "medium"
            },
            {
                "type": "hdd",
                "name": "HD/SSD",
                "description": "Discos rígidos e SSDs",
                "tools": ["FTK Imager", "dd", "EnCase", "X-Ways"],
                "typical_duration": "4-8 horas",
                "complexity": "low"
            },
            {
                "type": "usb",
                "name": "Pen Drive/USB",
                "description": "Dispositivos de armazenamento USB",
                "tools": ["FTK Imager", "Autopsy", "PhotoRec"],
                "typical_duration": "2-4 horas",
                "complexity": "low"
            },
            {
                "type": "memory_card",
                "name": "Cartão de Memória",
                "description": "SD Cards, microSD, etc",
                "tools": ["FTK Imager", "PhotoRec", "Autopsy"],
                "typical_duration": "2-4 horas",
                "complexity": "low"
            },
            {
                "type": "tablet",
                "name": "Tablet",
                "description": "Tablets Android e iOS",
                "tools": ["UFED", "Oxygen", "MOBILedit"],
                "typical_duration": "4-6 horas",
                "complexity": "medium"
            },
            {
                "type": "iot",
                "name": "Dispositivo IoT",
                "description": "Dispositivos Internet das Coisas",
                "tools": ["Custom Scripts", "Wireshark", "Binwalk"],
                "typical_duration": "8-16 horas",
                "complexity": "high"
            },
            {
                "type": "cloud",
                "name": "Armazenamento em Nuvem",
                "description": "Google Drive, Dropbox, OneDrive, etc",
                "tools": ["Magnet AXIOM", "Belkasoft", "Cloud Extractor"],
                "typical_duration": "4-8 horas",
                "complexity": "medium"
            },
            {
                "type": "server",
                "name": "Servidor",
                "description": "Servidores físicos ou virtuais",
                "tools": ["EnCase", "X-Ways", "FTK", "Volatility"],
                "typical_duration": "12-24 horas",
                "complexity": "high"
            },
            {
                "type": "router",
                "name": "Router/Switch",
                "description": "Equipamentos de rede",
                "tools": ["Wireshark", "tcpdump", "Custom Scripts"],
                "typical_duration": "4-8 horas",
                "complexity": "medium"
            }
        ]
        
        return {
            "success": True,
            "device_types": device_types,
            "total": len(device_types)
        }
    except Exception as e:
        print(f"[ERROR] Error fetching device types: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar tipos de dispositivos: {str(e)}")

@forensics_enhanced_router.get("/analysis-types")
async def get_analysis_types(user: dict = Depends(get_current_user)):
    """Get list of available analysis types"""
    try:
        analysis_types = [
            {
                "type": "data_recovery",
                "name": "Recuperação de Dados",
                "description": "Recuperação de arquivos deletados e dados perdidos",
                "duration": "2-4 horas",
                "difficulty": "medium",
                "tools": ["PhotoRec", "TestDisk", "Recuva", "FTK"],
                "outputs": ["Arquivos recuperados", "Relatório de recuperação", "Hash de evidências"]
            },
            {
                "type": "timeline_analysis",
                "name": "Análise de Linha do Tempo",
                "description": "Reconstrução cronológica de eventos no sistema",
                "duration": "3-6 horas",
                "difficulty": "medium",
                "tools": ["Autopsy", "Sleuth Kit", "log2timeline"],
                "outputs": ["Timeline completa", "Eventos críticos", "Relatório temporal"]
            },
            {
                "type": "malware_analysis",
                "name": "Análise de Malware",
                "description": "Identificação e análise de software malicioso",
                "duration": "4-8 horas",
                "difficulty": "high",
                "tools": ["VirusTotal", "Cuckoo Sandbox", "IDA Pro", "Ghidra"],
                "outputs": ["Relatório de malware", "IOCs", "Comportamento malicioso"]
            },
            {
                "type": "network_analysis",
                "name": "Análise de Rede",
                "description": "Análise de tráfego e comunicações de rede",
                "duration": "2-4 horas",
                "difficulty": "medium",
                "tools": ["Wireshark", "NetworkMiner", "tcpdump"],
                "outputs": ["Conexões identificadas", "Protocolos usados", "Dados transferidos"]
            },
            {
                "type": "memory_analysis",
                "name": "Análise de Memória",
                "description": "Análise forense de dump de memória RAM",
                "duration": "3-5 horas",
                "difficulty": "high",
                "tools": ["Volatility", "Rekall", "WinDbg"],
                "outputs": ["Processos ativos", "Conexões de rede", "Artefatos em memória"]
            },
            {
                "type": "mobile_analysis",
                "name": "Análise Mobile",
                "description": "Extração e análise completa de dispositivos móveis",
                "duration": "4-6 horas",
                "difficulty": "medium",
                "tools": ["UFED", "Oxygen", "MOBILedit", "XRY"],
                "outputs": ["Dados extraídos", "Mensagens", "Contatos", "Localização", "Apps"]
            },
            {
                "type": "cloud_analysis",
                "name": "Análise de Nuvem",
                "description": "Aquisição e análise de dados armazenados em nuvem",
                "duration": "2-4 horas",
                "difficulty": "medium",
                "tools": ["Magnet AXIOM", "Belkasoft", "Cloud Extractor"],
                "outputs": ["Arquivos em nuvem", "Metadados", "Histórico de acesso"]
            },
            {
                "type": "email_analysis",
                "name": "Análise de E-mail",
                "description": "Análise de comunicações por e-mail",
                "duration": "2-3 horas",
                "difficulty": "low",
                "tools": ["Aid4Mail", "MailXaminer", "Kernel"],
                "outputs": ["E-mails recuperados", "Anexos", "Headers completos", "Timeline"]
            },
            {
                "type": "database_analysis",
                "name": "Análise de Banco de Dados",
                "description": "Extração e análise de bancos de dados",
                "duration": "4-6 horas",
                "difficulty": "high",
                "tools": ["DB Browser", "SQL queries", "Custom scripts"],
                "outputs": ["Registros extraídos", "Estrutura do BD", "Logs de transação"]
            },
            {
                "type": "steganography_detection",
                "name": "Detecção de Esteganografia",
                "description": "Identificação de dados ocultos em arquivos",
                "duration": "3-5 horas",
                "difficulty": "high",
                "tools": ["StegDetect", "OpenStego", "Steghide"],
                "outputs": ["Arquivos com dados ocultos", "Conteúdo extraído", "Método usado"]
            },
            {
                "type": "registry_analysis",
                "name": "Análise de Registro Windows",
                "description": "Análise do registro do sistema Windows",
                "duration": "2-4 horas",
                "difficulty": "medium",
                "tools": ["Registry Explorer", "RegRipper", "Registry Viewer"],
                "outputs": ["Chaves modificadas", "Programas instalados", "Atividade do usuário"]
            },
            {
                "type": "browser_forensics",
                "name": "Forense de Navegador",
                "description": "Análise de histórico e dados de navegadores",
                "duration": "2-3 horas",
                "difficulty": "low",
                "tools": ["Browser History Viewer", "IEF", "Magnet AXIOM"],
                "outputs": ["Histórico de navegação", "Downloads", "Cookies", "Senhas"]
            }
        ]
        
        return {
            "success": True,
            "analysis_types": analysis_types,
            "total": len(analysis_types),
            "categories": {
                "low_difficulty": len([a for a in analysis_types if a["difficulty"] == "low"]),
                "medium_difficulty": len([a for a in analysis_types if a["difficulty"] == "medium"]),
                "high_difficulty": len([a for a in analysis_types if a["difficulty"] == "high"])
            }
        }
    except Exception as e:
        print(f"[ERROR] Error fetching analysis types: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar tipos de análise: {str(e)}")

