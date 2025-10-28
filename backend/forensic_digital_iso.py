"""
Sistema de Perícia Digital Forense - ISO/IEC 27037
Backend completo para cadeia de custódia, validações e integrações
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import hashlib
import qrcode
import io
import base64
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re

router = APIRouter(prefix="/api/forensics", tags=["Forensics Digital ISO"])

# Configuração MongoDB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

# ============================================================================
# MODELOS PYDANTIC - ISO/IEC 27037
# ============================================================================

class BaseLegal(BaseModel):
    """Base legal para coleta forense"""
    tipo: str = Field(..., description="consent|contrato|exercicio_regular|ordem_judicial")
    numero_processo: Optional[str] = Field(None, description="Número do processo judicial")
    finalidade: str = Field(..., description="Finalidade da perícia")
    controlador: Optional[str] = Field(None, description="Controlador LGPD")
    operador: Optional[str] = Field(None, description="Operador LGPD")
    documento_id: Optional[str] = Field(None, description="ID do documento anexado")

class DispositivoInfo(BaseModel):
    """Informações completas do dispositivo"""
    tipo: str = Field(..., description="smartphone|hd|pendrive|sd|pc|nuvem|app")
    imei: Optional[str] = None
    meid: Optional[str] = None
    serial: Optional[str] = None
    iccid: Optional[str] = None
    mac: Optional[str] = None
    hostname: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    so: Optional[str] = None
    versao_so: Optional[str] = None
    status: str = Field(..., description="ligado|desligado|bloqueado|root|jailbreak|criptografado")
    
    @validator('imei')
    def validar_imei(cls, v):
        """Valida IMEI usando algoritmo de Luhn"""
        if v and v.strip():
            v = v.strip().replace(" ", "").replace("-", "")
            if not v.isdigit() or len(v) != 15:
                raise ValueError("IMEI deve ter 15 dígitos")
            # Algoritmo de Luhn
            def luhn_checksum(imei):
                def digits_of(n):
                    return [int(d) for d in str(n)]
                digits = digits_of(imei)
                odd_digits = digits[-1::-2]
                even_digits = digits[-2::-2]
                checksum = sum(odd_digits)
                for d in even_digits:
                    checksum += sum(digits_of(d*2))
                return checksum % 10
            if luhn_checksum(v) != 0:
                raise ValueError("IMEI inválido (falha na verificação Luhn)")
        return v

class ColetaInfo(BaseModel):
    """Informações sobre o método de coleta"""
    metodo: str = Field(..., description="logica|fisica|afu|chip_off|jtag|dump_ram")
    ferramenta_prevista: str = Field(..., description="UFED|Oxygen|Magnet|XRY|ADB|FTK|Autopsy|AP_Elite_Pro")
    risco_antiforense: bool = Field(False, description="Suspeita de wipe remoto ou anti-tamper")
    isolamento_rf: bool = Field(False, description="Dispositivo em isolamento RF/Faraday")

class CustodiaInfo(BaseModel):
    """Cadeia de custódia - ISO/IEC 27037"""
    local_coleta: str
    data_hora_coleta: datetime
    coletor: str
    testemunha: Optional[str] = None
    condicoes: str = Field(..., description="Condições de embalagem/umidade/temperatura")
    numero_lacre: str
    fotos_lacre: List[str] = Field(default_factory=list, description="IDs das fotos do lacre")
    hashes_previstos: List[str] = Field(default_factory=list, description="MD5|SHA1|SHA256|SHA512|BLAKE3")
    midia_destino: Optional[str] = Field(None, description="NVMe/SSD/Write-Blocker marca/serial")
    local_armazenamento: str = Field(..., description="prateleira|armario|cofre")
    cadeado_logico: str = Field("restrito", description="Permissões de acesso")

class ChecklistSWGDE(BaseModel):
    """Checklist SWGDE - Scientific Working Group on Digital Evidence"""
    write_blocker: bool = False
    modo_aviao: bool = False
    isolador_rf: bool = False
    biometria_desabilitada: bool = False
    preservacao_volatil: bool = False

class AgendamentoJobs(BaseModel):
    """Agendamento de jobs forenses"""
    aquisicao: bool = True
    parsing: bool = True
    timeline: bool = True
    carving: bool = False
    deteccao_pii: bool = False
    keyword_search: bool = False

class ExameForenseCreate(BaseModel):
    """Criação de exame forense completo - ISO/IEC 27037"""
    titulo: str
    numero_caso: str
    base_legal: BaseLegal
    dispositivo: DispositivoInfo
    coleta: ColetaInfo
    custodia: CustodiaInfo
    checklist: ChecklistSWGDE
    agendamento: AgendamentoJobs
    prioridade: str = Field("P2", description="P1|P2|P3")
    perita_responsavel: str
    observacoes: Optional[str] = None

class AtoCadeia(BaseModel):
    """Ato da cadeia de custódia"""
    tipo: str = Field(..., description="recebimento|aquisicao|analise|transferencia|guarda|fechamento")
    descricao: str
    anexos: List[str] = Field(default_factory=list)
    hashes: Dict[str, str] = Field(default_factory=dict)

# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================

def gerar_codigo_exame() -> str:
    """Gera código único: EX-YYYY-####"""
    ano = datetime.now().year
    random_part = str(uuid.uuid4())[:8].upper()
    return f"EX-{ano}-{random_part}"

def validar_base_legal(base_legal: BaseLegal, documento_id: Optional[str]) -> bool:
    """Valida se há base legal válida + documento anexado"""
    if not base_legal or not base_legal.tipo:
        return False
    
    # Para ordem judicial e consentimento, exige documento
    if base_legal.tipo in ["ordem_judicial", "consent"] and not documento_id:
        return False
    
    return True

def calcular_hash(data: bytes, algoritmo: str = "sha256") -> str:
    """Calcula hash de dados"""
    if algoritmo == "md5":
        return hashlib.md5(data).hexdigest()
    elif algoritmo == "sha1":
        return hashlib.sha1(data).hexdigest()
    elif algoritmo == "sha256":
        return hashlib.sha256(data).hexdigest()
    elif algoritmo == "sha512":
        return hashlib.sha512(data).hexdigest()
    else:
        return hashlib.sha256(data).hexdigest()

def gerar_qrcode(data: str) -> str:
    """Gera QR Code em base64"""
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    
    return base64.b64encode(buffer.getvalue()).decode()

def calcular_hash_blockchain(ato_anterior: Optional[str], dados_atuais: dict) -> str:
    """Calcula hash encadeado para blockchain-lite da custódia"""
    dados_str = str(dados_atuais)
    if ato_anterior:
        dados_str = ato_anterior + dados_str
    return hashlib.sha256(dados_str.encode()).hexdigest()

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/exams")
async def criar_exame_forense(exame: ExameForenseCreate):
    """
    Cria novo exame forense com validações ISO/IEC 27037
    
    - Valida base legal obrigatória
    - Valida IMEI (algoritmo Luhn)
    - Gera código único EX-YYYY-####
    - Cria QR Code para etiqueta
    - Inicia cadeia de custódia (Ato 1 - Recebimento)
    - Retorna ID e QR Code para impressão
    """
    
    # Validação: Base legal obrigatória
    if not validar_base_legal(exame.base_legal, exame.base_legal.documento_id):
        raise HTTPException(
            status_code=400,
            detail="Base legal insuficiente. Anexe consentimento do titular, mandato ou ordem judicial (CPP 158-A/159; LGPD)."
        )
    
    # Gera código único
    codigo = gerar_codigo_exame()
    exam_id = str(uuid.uuid4())
    
    # Prepara documento
    exam_data = {
        "id": exam_id,
        "codigo": codigo,
        "titulo": exame.titulo,
        "numero_caso": exame.numero_caso,
        "base_legal": exame.base_legal.dict(),
        "dispositivo": exame.dispositivo.dict(),
        "coleta": exame.coleta.dict(),
        "custodia": exame.custodia.dict(),
        "checklist": exame.checklist.dict(),
        "agendamento": exame.agendamento.dict(),
        "prioridade": exame.prioridade,
        "perita_responsavel": exame.perita_responsavel,
        "observacoes": exame.observacoes,
        "status": "iniciado",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # Insere no MongoDB
    await db.forensic_exams.insert_one(exam_data)
    
    # Cria Ato 1 da Cadeia de Custódia - Recebimento
    hash_inicial = calcular_hash_blockchain(None, exam_data)
    
    ato1 = {
        "id": str(uuid.uuid4()),
        "exam_id": exam_id,
        "tipo": "recebimento",
        "descricao": f"Recebimento do dispositivo {exame.dispositivo.tipo} - Lacre {exame.custodia.numero_lacre}",
        "user_id": exame.perita_responsavel,
        "timestamp": datetime.now().isoformat(),
        "lacre": exame.custodia.numero_lacre,
        "local": exame.custodia.local_coleta,
        "hash_prev": None,
        "hash_curr": hash_inicial,
        "anexos": exame.custodia.fotos_lacre
    }
    
    await db.custody_chain.insert_one(ato1)
    
    # Gera QR Code para etiqueta
    qr_data = f"{codigo}|{exame.dispositivo.tipo}|{exame.custodia.numero_lacre}|{hash_inicial}"
    qr_code_base64 = gerar_qrcode(qr_data)
    
    return {
        "success": True,
        "exam_id": exam_id,
        "codigo": codigo,
        "qr_code": qr_code_base64,
        "hash_inicial": hash_inicial,
        "message": "Exame forense criado com sucesso. Ato 1 (Recebimento) registrado na cadeia de custódia.",
        "etiqueta": {
            "codigo": codigo,
            "lacre": exame.custodia.numero_lacre,
            "hash": hash_inicial[:16],
            "qr_code": qr_code_base64
        }
    }

@router.get("/exams")
async def listar_exames(
    status: Optional[str] = None,
    prioridade: Optional[str] = None,
    perita: Optional[str] = None
):
    """Lista exames forenses com filtros"""
    query = {}
    if status:
        query["status"] = status
    if prioridade:
        query["prioridade"] = prioridade
    if perita:
        query["perita_responsavel"] = perita
    
    exames = await db.forensic_exams.find(query).sort("created_at", -1).to_list(100)
    
    return {
        "success": True,
        "count": len(exames),
        "exames": exames
    }

@router.get("/exams/{exam_id}")
async def obter_exame(exam_id: str):
    """Obtém detalhes completos do exame"""
    exame = await db.forensic_exams.find_one({"id": exam_id})
    if not exame:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    
    # Busca cadeia de custódia
    cadeia = await db.custody_chain.find({"exam_id": exam_id}).sort("timestamp", 1).to_list(100)
    
    return {
        "success": True,
        "exame": exame,
        "cadeia_custodia": cadeia
    }

@router.post("/exams/{exam_id}/chain")
async def adicionar_ato_cadeia(exam_id: str, ato: AtoCadeia, user_id: str):
    """
    Adiciona ato à cadeia de custódia com hash encadeado
    
    Tipos: recebimento|aquisicao|analise|transferencia|guarda|fechamento
    """
    # Verifica exame
    exame = await db.forensic_exams.find_one({"id": exam_id})
    if not exame:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    
    # Busca último ato para hash encadeado
    ultimo_ato = await db.custody_chain.find_one(
        {"exam_id": exam_id},
        sort=[("timestamp", -1)]
    )
    
    hash_prev = ultimo_ato["hash_curr"] if ultimo_ato else None
    
    # Calcula novo hash
    ato_data = {
        "tipo": ato.tipo,
        "descricao": ato.descricao,
        "timestamp": datetime.now().isoformat(),
        "user_id": user_id,
        "hashes": ato.hashes
    }
    hash_curr = calcular_hash_blockchain(hash_prev, ato_data)
    
    # Insere ato
    novo_ato = {
        "id": str(uuid.uuid4()),
        "exam_id": exam_id,
        **ato_data,
        "hash_prev": hash_prev,
        "hash_curr": hash_curr,
        "anexos": ato.anexos
    }
    
    await db.custody_chain.insert_one(novo_ato)
    
    # Atualiza status do exame se for fechamento
    if ato.tipo == "fechamento":
        await db.forensic_exams.update_one(
            {"id": exam_id},
            {"$set": {"status": "concluido", "updated_at": datetime.now().isoformat()}}
        )
    
    return {
        "success": True,
        "ato_id": novo_ato["id"],
        "hash_curr": hash_curr,
        "message": f"Ato '{ato.tipo}' adicionado à cadeia de custódia"
    }

@router.post("/evidence/upload")
async def upload_evidencia(
    file: UploadFile = File(...),
    exam_id: str = None,
    tipo: str = "imagem"
):
    """
    Upload de evidência com cálculo automático de hashes
    
    - Calcula SHA-256 e SHA-512
    - Cria Ato 2 (Aquisição) automaticamente
    - Valida integridade
    """
    if not exam_id:
        raise HTTPException(status_code=400, detail="exam_id obrigatório")
    
    # Lê arquivo
    contents = await file.read()
    
    # Calcula hashes
    sha256 = calcular_hash(contents, "sha256")
    sha512 = calcular_hash(contents, "sha512")
    md5 = calcular_hash(contents, "md5")
    
    # Salva arquivo (implementar storage real)
    file_id = str(uuid.uuid4())
    # TODO: Salvar em storage (S3, MinIO, filesystem)
    
    # Registra evidência
    evidencia = {
        "id": file_id,
        "exam_id": exam_id,
        "tipo": tipo,
        "filename": file.filename,
        "size": len(contents),
        "sha256": sha256,
        "sha512": sha512,
        "md5": md5,
        "created_at": datetime.now().isoformat()
    }
    
    await db.evidences.insert_one(evidencia)
    
    # Cria Ato 2 - Aquisição automaticamente
    ato_aquisicao = AtoCadeia(
        tipo="aquisicao",
        descricao=f"Aquisição de evidência: {file.filename}",
        anexos=[file_id],
        hashes={"sha256": sha256, "sha512": sha512, "md5": md5}
    )
    
    # Adiciona à cadeia (simplificado - user_id deve vir do auth)
    await adicionar_ato_cadeia(exam_id, ato_aquisicao, "system")
    
    return {
        "success": True,
        "file_id": file_id,
        "hashes": {
            "sha256": sha256,
            "sha512": sha512,
            "md5": md5
        },
        "message": "Evidência carregada e Ato 2 (Aquisição) registrado na cadeia"
    }

@router.get("/exams/{exam_id}/stats")
async def estatisticas_exame(exam_id: str):
    """Estatísticas e KPIs do exame forense"""
    exame = await db.forensic_exams.find_one({"id": exam_id})
    if not exame:
        raise HTTPException(status_code=404, detail="Exame não encontrado")
    
    # Conta atos da cadeia
    total_atos = await db.custody_chain.count_documents({"exam_id": exam_id})
    
    # Conta evidências
    total_evidencias = await db.evidences.count_documents({"exam_id": exam_id})
    
    # Verifica integridade da cadeia
    cadeia = await db.custody_chain.find({"exam_id": exam_id}).sort("timestamp", 1).to_list(100)
    integridade_ok = True
    
    for i in range(1, len(cadeia)):
        if cadeia[i]["hash_prev"] != cadeia[i-1]["hash_curr"]:
            integridade_ok = False
            break
    
    return {
        "success": True,
        "codigo": exame.get("codigo"),
        "status": exame.get("status"),
        "prioridade": exame.get("prioridade"),
        "total_atos_custodia": total_atos,
        "total_evidencias": total_evidencias,
        "integridade_cadeia": "OK" if integridade_ok else "FALHA",
        "checklist_completo": exame.get("checklist", {}),
        "dispositivo": exame.get("dispositivo", {}).get("tipo"),
        "lacre": exame.get("custodia", {}).get("numero_lacre")
    }

@router.get("/stats")
async def estatisticas_gerais():
    """Estatísticas gerais do sistema forense"""
    total = await db.forensic_exams.count_documents({})
    concluidos = await db.forensic_exams.count_documents({"status": "concluido"})
    em_andamento = await db.forensic_exams.count_documents({"status": "iniciado"})
    urgentes = await db.forensic_exams.count_documents({"prioridade": "P1"})
    
    # Verifica integridade geral
    total_com_cadeia = 0
    total_integridade_ok = 0
    
    exames = await db.forensic_exams.find({}).to_list(1000)
    for exame in exames:
        cadeia = await db.custody_chain.find({"exam_id": exame["id"]}).sort("timestamp", 1).to_list(100)
        if cadeia:
            total_com_cadeia += 1
            integridade_ok = True
            for i in range(1, len(cadeia)):
                if cadeia[i]["hash_prev"] != cadeia[i-1]["hash_curr"]:
                    integridade_ok = False
                    break
            if integridade_ok:
                total_integridade_ok += 1
    
    return {
        "success": True,
        "total_exames": total,
        "concluidos": concluidos,
        "em_andamento": em_andamento,
        "urgentes": urgentes,
        "integridade_cadeia_ok": total_integridade_ok,
        "percentual_integridade": round((total_integridade_ok / total_com_cadeia * 100) if total_com_cadeia > 0 else 0, 1)
    }
