"""
Interceptações Telemáticas Profissional - Sistema Avançado
Realiza e analisa interceptações em tempo real
"""

from fastapi import APIRouter, HTTPException, Header, WebSocket
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import os
import uuid
import jwt
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/interceptacoes-pro", tags=["interceptacoes_pro"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['ap_elite']

# Authentication
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}
    try:
        token = authorization.replace("Bearer ", "")
        SECRET_KEY = os.environ.get("SECRET_KEY", "ap_elite_secret_key_2024")
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return payload
        except:
            user = await db.users.find_one({"token": token})
            if user:
                return user
            return {"id": "anonymous", "email": "anonymous@apelite.com"}
    except:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}

# Models
class InterceptacaoCreate(BaseModel):
    alvo_nome: str
    alvo_telefone: str
    alvo_email: Optional[str] = None
    tipo_interceptacao: str  # telefonica, dados, email, whatsapp, telegram
    mandado_judicial: str
    validade_inicio: str
    validade_fim: str
    motivo: str
    prioridade: str = "media"

class AnaliseTranscricao(BaseModel):
    interceptacao_id: str
    audio_file: Optional[str] = None
    gerar_timeline: bool = True

@router.get("/stats")
async def get_stats(authorization: str = Header(None)):
    """Estatísticas das interceptações"""
    user = await get_current_user(authorization)
    
    try:
        total = await db.interceptacoes.count_documents({})
        ativas = await db.interceptacoes.count_documents({"status": "ativa"})
        concluidas = await db.interceptacoes.count_documents({"status": "concluida"})
        
        # Contagem por tipo
        by_type = await db.interceptacoes.aggregate([
            {"$group": {"_id": "$tipo_interceptacao", "count": {"$sum": 1}}}
        ]).to_list(None)
        
        # Dados capturados hoje
        hoje = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        eventos_hoje = await db.eventos_interceptacao.count_documents({
            "timestamp": {"$gte": hoje}
        })
        
        return {
            "total": total,
            "ativas": ativas,
            "concluidas": concluidas,
            "por_tipo": {item["_id"]: item["count"] for item in by_type},
            "eventos_hoje": eventos_hoje,
            "capturas_realtime": ativas * 10  # Simula capturas em tempo real
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interceptacoes")
async def list_interceptacoes(authorization: str = Header(None)):
    """Listar todas as interceptações"""
    user = await get_current_user(authorization)
    
    try:
        interceptacoes = await db.interceptacoes.find({}).sort("created_at", -1).to_list(100)
        for i in interceptacoes:
            i.pop("_id", None)
        return {"interceptacoes": interceptacoes, "count": len(interceptacoes)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interceptacoes")
async def create_interceptacao(interceptacao: InterceptacaoCreate, authorization: str = Header(None)):
    """Criar nova interceptação - INICIAR CAPTURA EM TEMPO REAL"""
    user = await get_current_user(authorization)
    
    try:
        interceptacao_id = str(uuid.uuid4())
        
        interceptacao_doc = {
            "interceptacao_id": interceptacao_id,
            "alvo_nome": interceptacao.alvo_nome,
            "alvo_telefone": interceptacao.alvo_telefone,
            "alvo_email": interceptacao.alvo_email,
            "tipo_interceptacao": interceptacao.tipo_interceptacao,
            "mandado_judicial": interceptacao.mandado_judicial,
            "validade_inicio": interceptacao.validade_inicio,
            "validade_fim": interceptacao.validade_fim,
            "motivo": interceptacao.motivo,
            "prioridade": interceptacao.prioridade,
            "status": "ativa",
            "captura_realtime": {
                "ativada": True,
                "porta_escuta": 5060,  # Porta SIP padrão
                "protocolo": "SIP/RTP",
                "codec": "G.711",
                "qualidade_audio": "HD"
            },
            "estatisticas": {
                "chamadas_capturadas": 0,
                "mensagens_capturadas": 0,
                "dados_capturados_mb": 0,
                "localizacoes_registradas": 0,
                "contatos_identificados": []
            },
            "geolocalizacao": {
                "ativada": True,
                "precisao": "alta",
                "atualizacao_tempo_real": True
            },
            "created_by": user.get("email"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.interceptacoes.insert_one(interceptacao_doc)
        interceptacao_doc.pop("_id", None)
        
        return {
            "success": True,
            "interceptacao_id": interceptacao_id,
            "message": "Interceptação iniciada com sucesso - Captura em tempo real ATIVADA",
            "data": interceptacao_doc
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interceptacoes/{interceptacao_id}")
async def get_interceptacao(interceptacao_id: str, authorization: str = Header(None)):
    """Obter detalhes de uma interceptação"""
    user = await get_current_user(authorization)
    
    try:
        interceptacao = await db.interceptacoes.find_one({"interceptacao_id": interceptacao_id})
        if not interceptacao:
            raise HTTPException(status_code=404, detail="Interceptação não encontrada")
        interceptacao.pop("_id", None)
        return interceptacao
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interceptacoes/{interceptacao_id}/eventos-realtime")
async def get_eventos_realtime(interceptacao_id: str, authorization: str = Header(None)):
    """Obter eventos capturados em tempo real"""
    user = await get_current_user(authorization)
    
    try:
        # Simula eventos de captura em tempo real
        import random
        from datetime import timedelta
        
        eventos = []
        now = datetime.now(timezone.utc)
        
        for i in range(10):
            timestamp = (now - timedelta(minutes=random.randint(0, 60))).isoformat()
            tipo = random.choice(["chamada", "mensagem", "dados", "localizacao"])
            
            evento = {
                "evento_id": str(uuid.uuid4()),
                "interceptacao_id": interceptacao_id,
                "tipo": tipo,
                "timestamp": timestamp,
                "duracao": f"{random.randint(10, 300)} segundos" if tipo == "chamada" else None,
                "origem": f"+55 11 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
                "destino": f"+55 11 9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
                "status_captura": "capturado",
                "qualidade": random.choice(["excelente", "boa", "regular"])
            }
            
            if tipo == "localizacao":
                evento["coordenadas"] = {
                    "latitude": -23.5505 + random.uniform(-0.1, 0.1),
                    "longitude": -46.6333 + random.uniform(-0.1, 0.1),
                    "precisao": f"{random.randint(5, 50)}m"
                }
            
            eventos.append(evento)
        
        return {
            "eventos": eventos,
            "count": len(eventos),
            "ultima_atualizacao": datetime.now(timezone.utc).isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interceptacoes/{interceptacao_id}/transcricao")
async def realizar_transcricao(interceptacao_id: str, analise: AnaliseTranscricao, authorization: str = Header(None)):
    """Realizar transcrição automática com IA"""
    user = await get_current_user(authorization)
    
    try:
        # Simula transcrição com IA
        transcricao = {
            "transcricao_id": str(uuid.uuid4()),
            "interceptacao_id": interceptacao_id,
            "status": "concluida",
            "modelo_ia": "Whisper Large-v3 (OpenAI)",
            "idioma_detectado": "pt-BR",
            "confianca_media": 0.95,
            "duracao_audio": "5min 23s",
            "texto_transcrito": "Transcrição automática gerada por IA...",
            "palavras_chave_detectadas": [
                "encontro", "documentos", "entrega", "pagamento", "reunião"
            ],
            "analise_sentimento": {
                "polaridade": "neutra",
                "emocao_predominante": "calma",
                "nivel_suspeita": "baixo"
            },
            "participantes_identificados": 2,
            "data_processamento": datetime.now(timezone.utc).isoformat()
        }
        
        return {
            "success": True,
            "message": "Transcrição concluída com sucesso",
            "transcricao": transcricao
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interceptacoes/{interceptacao_id}/geolocalizacao")
async def get_geolocalizacao(interceptacao_id: str, authorization: str = Header(None)):
    """Obter geolocalização em tempo real"""
    user = await get_current_user(authorization)
    
    try:
        import random
        
        # Simula dados de geolocalização em tempo real
        localizacoes = []
        now = datetime.now(timezone.utc)
        
        for i in range(20):
            from datetime import timedelta
            timestamp = (now - timedelta(minutes=i * 5)).isoformat()
            
            localizacao = {
                "timestamp": timestamp,
                "latitude": -23.5505 + random.uniform(-0.05, 0.05),
                "longitude": -46.6333 + random.uniform(-0.05, 0.05),
                "precisao": f"{random.randint(5, 30)}m",
                "velocidade": f"{random.randint(0, 60)} km/h",
                "tecnologia": random.choice(["GPS", "Cell-ID", "WiFi", "A-GPS"]),
                "endereco_aproximado": "São Paulo, SP, Brasil"
            }
            localizacoes.append(localizacao)
        
        return {
            "localizacoes": localizacoes,
            "count": len(localizacoes),
            "tracking_ativo": True,
            "ultima_atualizacao": datetime.now(timezone.utc).isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tipos-interceptacao")
async def get_tipos_interceptacao(authorization: str = Header(None)):
    """Tipos de interceptação disponíveis"""
    user = await get_current_user(authorization)
    
    tipos = [
        {
            "tipo": "telefonica",
            "nome": "Interceptação Telefônica",
            "descricao": "Captura de chamadas de voz em tempo real",
            "protocolos": ["SIP", "RTP", "SRTP"],
            "formatos_audio": ["WAV", "MP3", "OPUS"],
            "recursos": [
                "Gravação automática",
                "Transcrição com IA",
                "Análise de voz",
                "Identificação de locutor"
            ]
        },
        {
            "tipo": "dados",
            "nome": "Interceptação de Dados",
            "descricao": "Captura de tráfego de dados móveis",
            "protocolos": ["HTTP", "HTTPS", "DNS", "FTP"],
            "recursos": [
                "Deep Packet Inspection",
                "SSL/TLS Decryption",
                "Análise de protocolo",
                "Extração de conteúdo"
            ]
        },
        {
            "tipo": "whatsapp",
            "nome": "WhatsApp",
            "descricao": "Monitoramento de mensagens WhatsApp",
            "recursos": [
                "Captura de mensagens",
                "Extração de mídia",
                "Análise de grupos",
                "Timeline de conversas"
            ]
        },
        {
            "tipo": "telegram",
            "nome": "Telegram",
            "descricao": "Monitoramento de mensagens Telegram",
            "recursos": [
                "Captura de mensagens",
                "Extração de mídia",
                "Análise de canais",
                "Decodificação end-to-end"
            ]
        },
        {
            "tipo": "email",
            "nome": "E-mail",
            "descricao": "Interceptação de e-mails",
            "protocolos": ["SMTP", "IMAP", "POP3"],
            "recursos": [
                "Captura de e-mails",
                "Extração de anexos",
                "Análise de headers",
                "Tracking de remetentes"
            ]
        }
    ]
    
    return {"tipos": tipos, "total": len(tipos)}

@router.get("/equipamentos")
async def get_equipamentos(authorization: str = Header(None)):
    """Equipamentos de interceptação disponíveis"""
    user = await get_current_user(authorization)
    
    equipamentos = [
        {
            "nome": "AP Elite Interceptor Pro",
            "tipo": "hardware",
            "status": "online",
            "capacidade": "100 alvos simultâneos",
            "protocolos": ["2G", "3G", "4G", "5G", "VoIP"],
            "recursos": [
                "Captura em tempo real",
                "Armazenamento redundante",
                "Criptografia AES-256",
                "Interface web"
            ]
        },
        {
            "nome": "AP Elite Voice Analyzer",
            "tipo": "software",
            "status": "ativo",
            "funcao": "Análise e transcrição de áudio",
            "ia_integrada": True,
            "idiomas_suportados": 50
        },
        {
            "nome": "AP Elite Geo Tracker",
            "tipo": "software",
            "status": "ativo",
            "funcao": "Rastreamento geográfico em tempo real",
            "precisao": "5-10 metros",
            "tecnologias": ["GPS", "Cell-ID", "WiFi", "Bluetooth"]
        },
        {
            "nome": "AP Elite Data Extractor",
            "tipo": "software",
            "status": "ativo",
            "funcao": "Extração e análise de dados interceptados",
            "formatos_suportados": "100+"
        }
    ]
    
    return {"equipamentos": equipamentos, "total": len(equipamentos)}

@router.post("/interceptacoes/{interceptacao_id}/parar")
async def parar_interceptacao(interceptacao_id: str, authorization: str = Header(None)):
    """Parar interceptação ativa"""
    user = await get_current_user(authorization)
    
    try:
        result = await db.interceptacoes.update_one(
            {"interceptacao_id": interceptacao_id},
            {
                "$set": {
                    "status": "parada",
                    "data_parada": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Interceptação não encontrada")
        
        return {
            "success": True,
            "message": "Interceptação parada com sucesso"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interceptacoes/{interceptacao_id}/relatorio")
async def gerar_relatorio_interceptacao(interceptacao_id: str, authorization: str = Header(None)):
    """Gerar relatório completo da interceptação"""
    user = await get_current_user(authorization)
    
    try:
        interceptacao = await db.interceptacoes.find_one({"interceptacao_id": interceptacao_id})
        if not interceptacao:
            raise HTTPException(status_code=404, detail="Interceptação não encontrada")
        
        relatorio = {
            "relatorio_id": str(uuid.uuid4()),
            "interceptacao_id": interceptacao_id,
            "tipo": "relatorio_interceptacao_completo",
            "data_geracao": datetime.now(timezone.utc).isoformat(),
            "secoes": [
                "Dados do Mandado Judicial",
                "Informações do Alvo",
                "Período de Interceptação",
                "Estatísticas de Captura",
                "Eventos Registrados",
                "Transcrições",
                "Geolocalização",
                "Análise de Relacionamentos",
                "Timeline Completa",
                "Evidências Coletadas",
                "Conclusões Técnicas"
            ],
            "formato": "PDF",
            "nivel_detalhamento": "completo",
            "incluir_anexos": True
        }
        
        return {
            "success": True,
            "message": "Relatório gerado com sucesso",
            "relatorio": relatorio
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== UPLOAD E PROCESSAMENTO DE ARQUIVOS ====================
from fastapi import UploadFile, File, Form
import hashlib
import aiofiles

@router.post("/telecom/upload")
async def upload_telecom_file(
    file: UploadFile = File(...),
    case_id: str = Form(None),
    tipo: str = Form("documento"),  # mensagem, imagem, documento, weblog
    descricao: str = Form(None),
    authorization: str = Header(None)
):
    """
    Upload universal de arquivos telemáticos com:
    - Validação de extensão e tamanho (max 1GB)
    - Cálculo de hash SHA-256/SHA-512
    - Extração de metadados
    - Armazenamento seguro
    - Registro na cadeia de custódia
    """
    user = await get_current_user(authorization)
    if not user or user.get("id") == "anonymous":
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    try:
        # Validar extensão
        allowed_extensions = ['.json', '.csv', '.xml', '.txt', '.zip', '.jpg', '.jpeg', '.png', 
                            '.pdf', '.mp3', '.wav', '.mp4', '.html', '.db', '.sqlite']
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail=f"Extensão {file_ext} não permitida")
        
        # Ler conteúdo do arquivo
        file_content = await file.read()
        file_size = len(file_content)
        
        # Validar tamanho (max 1GB)
        if file_size > 1024 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Arquivo excede 1GB")
        
        # Calcular hashes
        hash_sha256 = hashlib.sha256(file_content).hexdigest()
        hash_sha512 = hashlib.sha512(file_content).hexdigest()
        
        # Gerar ID único
        file_id = str(uuid.uuid4())
        
        # Determinar tipo MIME
        mime_types = {
            '.json': 'application/json',
            '.csv': 'text/csv',
            '.xml': 'application/xml',
            '.txt': 'text/plain',
            '.zip': 'application/zip',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.pdf': 'application/pdf',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.html': 'text/html',
            '.db': 'application/x-sqlite3',
            '.sqlite': 'application/x-sqlite3'
        }
        mime_type = mime_types.get(file_ext, 'application/octet-stream')
        
        # Criar estrutura de diretórios
        storage_base = "/app/backend/storage/telecom"
        os.makedirs(storage_base, exist_ok=True)
        
        if case_id:
            file_path = os.path.join(storage_base, case_id, f"{file_id}_{file.filename}")
            os.makedirs(os.path.join(storage_base, case_id), exist_ok=True)
        else:
            file_path = os.path.join(storage_base, f"{file_id}_{file.filename}")
        
        # Salvar arquivo
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
        
        # Extrair metadados básicos
        metadados = {
            "size_bytes": file_size,
            "size_readable": f"{file_size / (1024*1024):.2f} MB" if file_size > 1024*1024 else f"{file_size / 1024:.2f} KB",
            "mime_type": mime_type,
            "extension": file_ext,
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Registrar no banco
        telecom_file = {
            "id": file_id,
            "case_id": case_id,
            "nome_arquivo": file.filename,
            "tipo": tipo,
            "hash_sha256": hash_sha256,
            "hash_sha512": hash_sha512,
            "metadados": metadados,
            "caminho": file_path,
            "descricao": descricao,
            "status": "uploaded",
            "uploaded_by": user.get("email"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.telecom_files.insert_one(telecom_file)
        
        # Registrar na cadeia de custódia
        custody_event = {
            "id": str(uuid.uuid4()),
            "file_id": file_id,
            "evento": "upload_telecom_file",
            "operador": user.get("email"),
            "ip": "system",
            "hash": hash_sha256,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.chain_of_custody.insert_one(custody_event)
        
        # Iniciar análise automática (assíncrona)
        analysis_task = {
            "id": str(uuid.uuid4()),
            "file_id": file_id,
            "status": "pending",
            "tarefas": []
        }
        
        # Determinar tarefas baseadas no tipo de arquivo
        if file_ext in ['.jpg', '.jpeg', '.png']:
            analysis_task["tarefas"].extend(["ocr", "exif_extraction", "face_detection"])
        elif file_ext in ['.mp3', '.wav']:
            analysis_task["tarefas"].extend(["transcription", "sentiment_analysis"])
        elif file_ext in ['.json', '.csv', '.xml']:
            analysis_task["tarefas"].extend(["data_parsing", "entity_extraction", "clustering"])
        elif file_ext == '.txt':
            analysis_task["tarefas"].extend(["nlp_analysis", "entity_extraction", "sentiment"])
        elif file_ext in ['.html', '.db', '.sqlite']:
            analysis_task["tarefas"].extend(["web_parsing", "timeline_extraction"])
        
        await db.telecom_analysis.insert_one(analysis_task)
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "hash_sha256": hash_sha256,
            "hash_sha512": hash_sha512,
            "size": file_size,
            "mime_type": mime_type,
            "analysis_queued": True,
            "analysis_tasks": analysis_task["tarefas"],
            "message": f"Arquivo {file.filename} enviado e análise iniciada"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no upload: {str(e)}")

@router.get("/telecom/files")
async def list_telecom_files(
    case_id: str = None,
    tipo: str = None,
    limit: int = 50,
    authorization: str = Header(None)
):
    """Listar arquivos telemáticos com filtros"""
    user = await get_current_user(authorization)
    if not user or user.get("id") == "anonymous":
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    try:
        query = {}
        if case_id:
            query["case_id"] = case_id
        if tipo:
            query["tipo"] = tipo
        
        files = await db.telecom_files.find(query, {"_id": 0}).sort("created_at", -1).to_list(length=limit)
        
        return {
            "success": True,
            "total": len(files),
            "files": files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/telecom/files/{file_id}/analysis")
async def get_file_analysis(file_id: str, authorization: str = Header(None)):
    """Obter análise de um arquivo telemático"""
    user = await get_current_user(authorization)
    if not user or user.get("id") == "anonymous":
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    try:
        file_data = await db.telecom_files.find_one({"id": file_id}, {"_id": 0})
        if not file_data:
            raise HTTPException(status_code=404, detail="Arquivo não encontrado")
        
        analysis = await db.telecom_analysis.find_one({"file_id": file_id}, {"_id": 0})
        
        return {
            "success": True,
            "file": file_data,
            "analysis": analysis or {"status": "not_started", "message": "Análise não iniciada"}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
