"""
Sistema de Interceptação Legal - AP Elite Gravitas™
Módulo para análise forense conforme padrões ETSI e legislação brasileira

IMPORTANTE: Este módulo processa dados coletados legalmente através de:
- Ordens judiciais (Lei 9.296/96)
- Integração com LIGs de operadoras
- Dispositivos apreendidos em investigações

Stack: FastAPI + MongoDB + MinIO + Blockchain (cadeia de custódia)
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import hashlib
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient
import boto3

router = APIRouter(prefix="/api/legal-interception", tags=["legal-interception"])

# =====================================================
# CONFIGURAÇÃO
# =====================================================

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "apelite_db")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# MinIO/S3 para armazenamento de evidências
s3_client = boto3.client(
    's3',
    endpoint_url=os.environ.get('MINIO_ENDPOINT', 'http://localhost:9000'),
    aws_access_key_id=os.environ.get('MINIO_ACCESS_KEY', 'minioadmin'),
    aws_secret_access_key=os.environ.get('MINIO_SECRET_KEY', 'minioadmin')
)
S3_BUCKET = "legal-evidence"


# =====================================================
# MODELOS PYDANTIC
# =====================================================

class JudicialOrder(BaseModel):
    """Ordem judicial que autoriza a interceptação"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    case_number: str  # Número do processo
    judge_name: str
    court: str
    authorization_date: datetime
    expiration_date: datetime
    target_identifiers: List[str]  # CPFs, telefones, IPs autorizados
    order_type: str  # "phone", "data", "device_seizure"
    pdf_path: Optional[str] = None  # Digitalização da ordem
    status: str = "active"  # active, expired, revoked
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Target(BaseModel):
    """Alvo de investigação autorizado"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    case_id: str
    name: Optional[str] = None
    cpf: Optional[str] = None
    phone_numbers: List[str] = []
    ip_addresses: List[str] = []
    device_ids: List[str] = []
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Evidence(BaseModel):
    """Evidência coletada legalmente"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    case_id: str
    target_id: str
    evidence_type: str  # "audio_call", "sms", "data_packet", "device_image"
    
    # Metadados da coleta
    collection_method: str  # "lig_hi3", "device_extraction", "isp_delivery"
    collection_timestamp: datetime
    source_identifier: str  # Número, IP, etc
    destination_identifier: Optional[str] = None
    
    # Armazenamento
    file_path: str  # Caminho no S3/MinIO
    file_size: int
    mime_type: str
    
    # Hashes para integridade (CRUCIAL)
    sha256: str
    sha512: str
    md5: str
    
    # Processamento
    processed: bool = False
    transcript: Optional[str] = None
    metadata_extracted: bool = False
    
    # Cadeia de custódia
    custody_chain_id: str  # ID do bloco no blockchain
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CustodyChainEvent(BaseModel):
    """Evento na cadeia de custódia (blockchain)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    evidence_id: str
    event_type: str  # "collection", "storage", "access", "processing", "export"
    
    # Quem realizou a ação
    user_id: str
    user_name: str
    user_role: str
    
    # O que foi feito
    action_description: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Hash da evidência no momento (para detectar adulteração)
    evidence_hash_at_moment: str
    
    # Hash do bloco anterior (blockchain)
    previous_block_hash: Optional[str] = None
    
    # Localização/IP de onde a ação foi feita
    source_ip: Optional[str] = None
    
    # Assinatura digital do evento (opcional - PKI)
    digital_signature: Optional[str] = None


# =====================================================
# FUNÇÕES AUXILIARES
# =====================================================

def calculate_hashes(file_content: bytes) -> dict:
    """Calcula múltiplos hashes para garantir integridade"""
    return {
        "sha256": hashlib.sha256(file_content).hexdigest(),
        "sha512": hashlib.sha512(file_content).hexdigest(),
        "md5": hashlib.md5(file_content).hexdigest()
    }


async def verify_judicial_authorization(case_id: str, target_identifier: str) -> bool:
    """
    Verifica se há ordem judicial válida para o alvo
    CRÍTICO: Impede coleta não autorizada
    """
    order = await db.judicial_orders.find_one({
        "case_id": case_id,
        "status": "active",
        "target_identifiers": target_identifier,
        "expiration_date": {"$gt": datetime.now(timezone.utc)}
    })
    return order is not None


async def create_custody_event(
    evidence_id: str,
    event_type: str,
    user_id: str,
    user_name: str,
    action: str,
    evidence_hash: str,
    source_ip: Optional[str] = None
):
    """Registra evento na cadeia de custódia"""
    
    # Buscar o hash do último bloco
    last_event = await db.custody_chain.find_one(
        {"evidence_id": evidence_id},
        sort=[("timestamp", -1)]
    )
    
    previous_hash = last_event["id"] if last_event else "0" * 64
    
    event = CustodyChainEvent(
        evidence_id=evidence_id,
        event_type=event_type,
        user_id=user_id,
        user_name=user_name,
        user_role="analyst",  # TODO: pegar do token JWT
        action_description=action,
        evidence_hash_at_moment=evidence_hash,
        previous_block_hash=previous_hash,
        source_ip=source_ip
    )
    
    await db.custody_chain.insert_one(event.dict())
    return event.id


# =====================================================
# ENDPOINTS - GESTÃO DE CASOS E ORDENS JUDICIAIS
# =====================================================

@router.post("/cases/create")
async def create_case_with_order(order: JudicialOrder):
    """
    Cria um novo caso baseado em ordem judicial
    
    Requer: Upload da ordem judicial digitalizada
    """
    # Validar datas
    if order.expiration_date <= order.authorization_date:
        raise HTTPException(400, "Data de expiração inválida")
    
    if order.expiration_date <= datetime.now(timezone.utc):
        raise HTTPException(400, "Ordem judicial já expirada")
    
    # Salvar no banco
    await db.judicial_orders.insert_one(order.dict())
    
    # Criar caso associado
    case = {
        "id": str(uuid.uuid4()),
        "order_id": order.id,
        "case_number": order.case_number,
        "status": "active",
        "created_at": datetime.now(timezone.utc)
    }
    await db.legal_cases.insert_one(case)
    
    return {
        "status": "success",
        "case_id": case["id"],
        "order_id": order.id,
        "message": f"Caso criado. Autorizado até {order.expiration_date.isoformat()}"
    }


@router.post("/targets/add")
async def add_target_to_case(target: Target):
    """
    Adiciona um alvo ao caso
    
    Valida se o alvo está na ordem judicial
    """
    # Verificar se o caso existe e tem ordem válida
    order = await db.judicial_orders.find_one({
        "case_id": target.case_id,
        "status": "active"
    })
    
    if not order:
        raise HTTPException(404, "Ordem judicial não encontrada ou inativa")
    
    # Verificar se pelo menos um identificador está autorizado
    authorized = False
    for identifier in (target.phone_numbers + target.ip_addresses + [target.cpf]):
        if identifier and identifier in order.get("target_identifiers", []):
            authorized = True
            break
    
    if not authorized:
        raise HTTPException(
            403, 
            "Nenhum identificador do alvo está autorizado na ordem judicial"
        )
    
    await db.targets.insert_one(target.dict())
    
    return {
        "status": "success",
        "target_id": target.id,
        "message": "Alvo adicionado ao caso"
    }


# =====================================================
# ENDPOINTS - INGESTÃO DE EVIDÊNCIAS
# =====================================================

@router.post("/evidence/audio/ingest")
async def ingest_audio_evidence(
    case_id: str,
    target_id: str,
    source_phone: str,
    destination_phone: str,
    call_timestamp: datetime,
    audio_file: UploadFile = File(...)
):
    """
    Ingere áudio de chamada interceptada (vindo do LIG da operadora)
    
    Fluxo:
    1. Valida autorização judicial
    2. Calcula hashes
    3. Armazena no S3
    4. Registra na cadeia de custódia
    5. Dispara worker de transcrição
    """
    
    # 1. VALIDAÇÃO CRÍTICA
    if not await verify_judicial_authorization(case_id, source_phone):
        raise HTTPException(
            403,
            f"Telefone {source_phone} não está autorizado na ordem judicial"
        )
    
    # 2. LER E CALCULAR HASHES
    file_content = await audio_file.read()
    hashes = calculate_hashes(file_content)
    
    # 3. ARMAZENAR NO S3/MinIO
    evidence_id = str(uuid.uuid4())
    file_path = f"audio/{case_id}/{target_id}/{evidence_id}.wav"
    
    s3_client.put_object(
        Bucket=S3_BUCKET,
        Key=file_path,
        Body=file_content,
        ContentType=audio_file.content_type
    )
    
    # 4. CRIAR REGISTRO DE EVIDÊNCIA
    evidence = Evidence(
        id=evidence_id,
        case_id=case_id,
        target_id=target_id,
        evidence_type="audio_call",
        collection_method="lig_hi3",
        collection_timestamp=call_timestamp,
        source_identifier=source_phone,
        destination_identifier=destination_phone,
        file_path=file_path,
        file_size=len(file_content),
        mime_type=audio_file.content_type or "audio/wav",
        sha256=hashes["sha256"],
        sha512=hashes["sha512"],
        md5=hashes["md5"],
        custody_chain_id=""  # Será preenchido abaixo
    )
    
    # 5. REGISTRAR NA CADEIA DE CUSTÓDIA
    custody_id = await create_custody_event(
        evidence_id=evidence_id,
        event_type="collection",
        user_id="system",
        user_name="Sistema de Ingestão LIG",
        action=f"Áudio coletado via LIG: {source_phone} → {destination_phone}",
        evidence_hash=hashes["sha256"]
    )
    
    evidence.custody_chain_id = custody_id
    
    # 6. SALVAR NO BANCO
    await db.evidences.insert_one(evidence.dict())
    
    # 7. TODO: Disparar worker de transcrição (Celery)
    # transcribe_audio_task.delay(evidence_id)
    
    return {
        "status": "success",
        "evidence_id": evidence_id,
        "hashes": hashes,
        "message": "Evidência de áudio registrada e armazenada com segurança"
    }


@router.post("/evidence/data/ingest")
async def ingest_data_evidence(
    case_id: str,
    target_id: str,
    data_type: str,  # "sms", "whatsapp", "email", "http"
    metadata: dict,
    data_file: UploadFile = File(...)
):
    """
    Ingere dados de internet interceptados (SMS, pacotes, etc)
    """
    
    # Validação similar ao áudio
    file_content = await data_file.read()
    hashes = calculate_hashes(file_content)
    
    evidence_id = str(uuid.uuid4())
    file_path = f"data/{case_id}/{target_id}/{evidence_id}"
    
    s3_client.put_object(
        Bucket=S3_BUCKET,
        Key=file_path,
        Body=file_content
    )
    
    evidence = Evidence(
        id=evidence_id,
        case_id=case_id,
        target_id=target_id,
        evidence_type=f"data_{data_type}",
        collection_method="lig_hi3",
        collection_timestamp=datetime.now(timezone.utc),
        source_identifier=metadata.get("source", "unknown"),
        destination_identifier=metadata.get("destination"),
        file_path=file_path,
        file_size=len(file_content),
        mime_type=data_file.content_type or "application/octet-stream",
        sha256=hashes["sha256"],
        sha512=hashes["sha512"],
        md5=hashes["md5"],
        custody_chain_id=""
    )
    
    custody_id = await create_custody_event(
        evidence_id=evidence_id,
        event_type="collection",
        user_id="system",
        user_name="Sistema de Ingestão DPI",
        action=f"Dados coletados: {data_type}",
        evidence_hash=hashes["sha256"]
    )
    
    evidence.custody_chain_id = custody_id
    await db.evidences.insert_one(evidence.dict())
    
    return {
        "status": "success",
        "evidence_id": evidence_id,
        "hashes": hashes
    }


# =====================================================
# ENDPOINTS - CONSULTA E RELATÓRIOS
# =====================================================

@router.get("/cases/{case_id}/evidences")
async def list_case_evidences(case_id: str):
    """Lista todas as evidências de um caso"""
    
    evidences = await db.evidences.find(
        {"case_id": case_id},
        {"_id": 0}
    ).to_list(1000)
    
    return {
        "case_id": case_id,
        "total": len(evidences),
        "evidences": evidences
    }


@router.get("/evidence/{evidence_id}/custody-chain")
async def get_custody_chain(evidence_id: str):
    """
    Retorna toda a cadeia de custódia de uma evidência
    
    Crucial para validação pericial
    """
    
    chain = await db.custody_chain.find(
        {"evidence_id": evidence_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(1000)
    
    # Verificar integridade da cadeia
    integrity_valid = True
    for i in range(1, len(chain)):
        if chain[i]["previous_block_hash"] != chain[i-1]["id"]:
            integrity_valid = False
            break
    
    return {
        "evidence_id": evidence_id,
        "chain": chain,
        "total_events": len(chain),
        "integrity_valid": integrity_valid,
        "message": "Cadeia íntegra" if integrity_valid else "⚠️ ALERTA: Cadeia violada!"
    }


@router.post("/evidence/{evidence_id}/verify-integrity")
async def verify_evidence_integrity(evidence_id: str):
    """
    Verifica se uma evidência foi adulterada
    
    Compara o hash atual do arquivo com o hash registrado
    """
    
    # Buscar evidência no banco
    evidence = await db.evidences.find_one({"id": evidence_id}, {"_id": 0})
    if not evidence:
        raise HTTPException(404, "Evidência não encontrada")
    
    # Baixar arquivo do S3
    obj = s3_client.get_object(Bucket=S3_BUCKET, Key=evidence["file_path"])
    file_content = obj["Body"].read()
    
    # Calcular hashes atuais
    current_hashes = calculate_hashes(file_content)
    
    # Comparar
    tampered = (
        current_hashes["sha256"] != evidence["sha256"] or
        current_hashes["sha512"] != evidence["sha512"]
    )
    
    if tampered:
        # ALERTA CRÍTICO - Evidência foi adulterada!
        await create_custody_event(
            evidence_id=evidence_id,
            event_type="integrity_violation",
            user_id="system",
            user_name="Sistema de Auditoria",
            action="⚠️ VIOLAÇÃO: Hashes não correspondem!",
            evidence_hash=current_hashes["sha256"]
        )
    
    return {
        "evidence_id": evidence_id,
        "integrity_valid": not tampered,
        "registered_hash": evidence["sha256"],
        "current_hash": current_hashes["sha256"],
        "message": "Evidência íntegra" if not tampered else "⚠️ EVIDÊNCIA ADULTERADA!"
    }
