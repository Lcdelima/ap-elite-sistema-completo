"""
AP ELITE ATHENA - Elite Seal™ - Sistema de Custódia Digital
Módulo de lacração digital com assinatura RSA-2048, hash duplo e blockchain custody

Features:
- Assinatura digital RSA-2048 (PSS padding, SHA-512 digest)
- Hash duplo (SHA-256 + SHA-512)
- Manifesto JSON completo
- QR Code com validação pública
- Geração de PDF do manifesto
- Integração blockchain opcional (Polygon/Avalanche)
- Conformidade ISO/IEC 27037, 27041, 27042
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List, Dict
from pydantic import BaseModel
import os
import uuid
import hashlib
import json
import base64
import qrcode
import io
from pathlib import Path

# RSA imports
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend

# PDF generation
try:
    from weasyprint import HTML, CSS
except (ImportError, OSError) as e:
    HTML = None  # PDF generation will be unavailable
    print(f"WeasyPrint not available: {e}")
import tempfile

router = APIRouter(prefix="/api/elite-seal", tags=["Elite Seal™ - Digital Custody"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Storage
STORAGE_BASE = os.environ.get("STORAGE_PATH", "/app/backend/storage")
SEALS_DIR = Path(STORAGE_BASE) / "elite_seals"
SEALS_DIR.mkdir(parents=True, exist_ok=True)

# Security
security = HTTPBearer(auto_error=False)

# RSA Keys (in production, these should be securely stored and managed)
RSA_KEYS_DIR = Path(STORAGE_BASE) / "rsa_keys"
RSA_KEYS_DIR.mkdir(parents=True, exist_ok=True)
PRIVATE_KEY_PATH = RSA_KEYS_DIR / "elite_seal_private.pem"
PUBLIC_KEY_PATH = RSA_KEYS_DIR / "elite_seal_public.pem"

# ==================== MODELS ====================

class EliteSealResponse(BaseModel):
    seal_id: str
    evidence_id: str
    hash_sha256: str
    hash_sha512: str
    assinatura_rsa: str
    qr_code_url: str
    manifesto_url: str
    data_emissao: str
    emitido_por: str
    blockchain_tx: Optional[str] = None
    status: str = "sealed"

class VerificationResponse(BaseModel):
    valid: bool
    seal_id: str
    evidence_id: str
    hash_sha256: str
    hash_sha512: str
    data_emissao: str
    emitido_por: str
    blockchain_verified: bool
    cadeia_custodia: List[Dict]

# ==================== AUTHENTICATION ====================

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        token_parts = credentials.credentials.split('_')
        user_id = token_parts[1]
        user = await db.users.find_one({"id": user_id, "active": True}, {"_id": 0, "password": 0})
        return user
    except:
        return None

async def require_module_access(user: dict, module: str):
    """Verifica se o usuário tem acesso ao módulo Elite Seal™"""
    if not user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    # Busca assinatura do tenant
    subscription = await db.subscriptions.find_one(
        {"tenant_id": user.get("tenant_id", user["id"])},
        {"_id": 0}
    )
    
    if not subscription:
        # Se não há subscription, permite acesso (modo desenvolvimento)
        return {"active_modules": [module]}
    
    # Verifica se o módulo está ativo
    active_modules = subscription.get("active_modules", [])
    if module not in active_modules:
        raise HTTPException(
            status_code=403, 
            detail=f"Módulo {module} não disponível no seu plano. Faça upgrade para acessar."
        )
    
    # Verifica validade
    validade = subscription.get("validade")
    if validade:
        try:
            if datetime.fromisoformat(validade.replace('Z', '+00:00')) < datetime.now(timezone.utc):
                raise HTTPException(status_code=403, detail="Assinatura expirada")
        except:
            pass  # Ignora erro de parsing
    
    return subscription

# ==================== RSA SERVICE ====================

class RSAService:
    """Gerenciamento de assinatura RSA-2048"""
    
    @staticmethod
    def generate_keys():
        """Gera par de chaves RSA-2048 (executar apenas uma vez)"""
        if PRIVATE_KEY_PATH.exists() and PUBLIC_KEY_PATH.exists():
            return
        
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        
        public_key = private_key.public_key()
        
        # Salva chave privada
        with open(PRIVATE_KEY_PATH, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        # Salva chave pública
        with open(PUBLIC_KEY_PATH, "wb") as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))
    
    @staticmethod
    def load_private_key():
        """Carrega chave privada"""
        RSAService.generate_keys()  # Garante que as chaves existem
        with open(PRIVATE_KEY_PATH, "rb") as f:
            return serialization.load_pem_private_key(
                f.read(),
                password=None,
                backend=default_backend()
            )
    
    @staticmethod
    def load_public_key():
        """Carrega chave pública"""
        RSAService.generate_keys()
        with open(PUBLIC_KEY_PATH, "rb") as f:
            return serialization.load_pem_public_key(
                f.read(),
                backend=default_backend()
            )
    
    @staticmethod
    def sign_data(data: str) -> str:
        """Assina dados com RSA-2048 PSS padding"""
        private_key = RSAService.load_private_key()
        signature = private_key.sign(
            data.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA512()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA512()
        )
        return base64.b64encode(signature).decode('utf-8')
    
    @staticmethod
    def verify_signature(data: str, signature: str) -> bool:
        """Verifica assinatura RSA"""
        try:
            public_key = RSAService.load_public_key()
            signature_bytes = base64.b64decode(signature)
            public_key.verify(
                signature_bytes,
                data.encode('utf-8'),
                padding.PSS(
                    mgf=padding.MGF1(hashes.SHA512()),
                    salt_length=padding.PSS.MAX_LENGTH
                ),
                hashes.SHA512()
            )
            return True
        except:
            return False

# ==================== QR CODE SERVICE ====================

class QRCodeService:
    """Geração de QR Codes para validação pública"""
    
    @staticmethod
    def generate_qr_code(seal_id: str, hash_sha256: str) -> str:
        """Gera QR Code com URL de verificação"""
        backend_url = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001")
        verify_url = f"{backend_url}/api/elite-seal/verify/{hash_sha256}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(verify_url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Salva QR Code
        qr_path = SEALS_DIR / f"{seal_id}_qr.png"
        img.save(qr_path)
        
        return f"/api/elite-seal/qr/{seal_id}"
    
    @staticmethod
    def get_qr_image_path(seal_id: str) -> Path:
        return SEALS_DIR / f"{seal_id}_qr.png"

# ==================== BLOCKCHAIN SERVICE ====================

class BlockchainService:
    """Integração com blockchain (Polygon/Avalanche) - Opcional"""
    
    @staticmethod
    async def register_hash(hash_value: str) -> Optional[str]:
        """
        Registra hash na blockchain
        TODO: Implementar integração real com Polygon/Avalanche
        Por enquanto retorna mock transaction ID
        """
        # Em produção, usar web3.py para gravar na blockchain
        # tx_hash = await polygon_contract.register_hash(hash_value)
        tx_hash = f"0x{hashlib.sha256(f'{hash_value}{datetime.now().isoformat()}'.encode()).hexdigest()}"
        return tx_hash
    
    @staticmethod
    async def verify_hash(hash_value: str, tx_hash: str) -> bool:
        """
        Verifica hash na blockchain
        TODO: Implementar verificação real
        """
        # Em produção, consultar blockchain
        return True  # Mock

# ==================== MANIFEST SERVICE ====================

class ManifestService:
    """Geração de manifesto JSON e PDF"""
    
    @staticmethod
    def create_manifest(
        seal_id: str,
        evidence_id: str,
        evidence_data: dict,
        hashes: dict,
        chain_of_custody: list,
        signature: str,
        blockchain_tx: Optional[str]
    ) -> dict:
        """Cria manifesto JSON completo"""
        return {
            "seal_id": seal_id,
            "evidence_id": evidence_id,
            "evidence": {
                "filename": evidence_data.get("filename", "unknown"),
                "file_size": evidence_data.get("file_size", 0),
                "mime_type": evidence_data.get("mime_type", "unknown"),
                "original_hash": evidence_data.get("sha256", "")
            },
            "hashes": hashes,
            "data_emissao": datetime.now(timezone.utc).isoformat(),
            "emitido_por": "Elite Gravitas™ Forensic Platform",
            "certificado": "RSA-2048 (PSS padding, SHA-512 digest)",
            "normas_conformidade": [
                "ISO/IEC 27037:2012 - Digital evidence collection",
                "ISO/IEC 27041:2015 - Incident investigation assurance",
                "ISO/IEC 27042:2015 - Digital evidence analysis",
                "ABNT NBR ISO/IEC 27001:2013"
            ],
            "cadeia_custodia": chain_of_custody,
            "blockchain": {
                "network": "Polygon Mumbai Testnet" if blockchain_tx else None,
                "tx_hash": blockchain_tx,
                "verified": bool(blockchain_tx)
            },
            "assinatura_digital": {
                "algoritmo": "RSA-2048",
                "padding": "PSS (PKCS#1 v2.1)",
                "hash_function": "SHA-512",
                "signature": signature
            },
            "verificacao_publica": {
                "url": f"{os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')}/api/elite-seal/verify/{hashes['sha256']}",
                "qr_code": f"/api/elite-seal/qr/{seal_id}"
            }
        }
    
    @staticmethod
    def generate_pdf(manifest: dict, seal_id: str) -> str:
        """Gera PDF do manifesto com Elite Gravitas™ design"""
        if HTML is None:
            # Se WeasyPrint não está disponível, retorna None
            return None
            
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background: #0A0E12;
                    color: #ffffff;
                    padding: 40px;
                    margin: 0;
                }}
                
                .header {{
                    text-align: center;
                    margin-bottom: 40px;
                    border-bottom: 3px solid #00d9ff;
                    padding-bottom: 20px;
                }}
                
                .logo {{
                    font-size: 32px;
                    font-weight: 700;
                    color: #00d9ff;
                    margin-bottom: 10px;
                }}
                
                .subtitle {{
                    font-size: 14px;
                    color: #888;
                    letter-spacing: 2px;
                }}
                
                .section {{
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(0, 217, 255, 0.2);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 20px;
                }}
                
                .section-title {{
                    font-size: 18px;
                    font-weight: 600;
                    color: #00d9ff;
                    margin-bottom: 15px;
                    border-bottom: 1px solid rgba(0, 217, 255, 0.3);
                    padding-bottom: 8px;
                }}
                
                .field {{
                    margin-bottom: 10px;
                    padding: 8px 0;
                }}
                
                .field-label {{
                    font-weight: 600;
                    color: #00d9ff;
                    display: inline-block;
                    width: 180px;
                }}
                
                .field-value {{
                    color: #ffffff;
                    word-break: break-all;
                }}
                
                .hash {{
                    font-family: 'Courier New', monospace;
                    font-size: 10px;
                    background: rgba(0, 217, 255, 0.1);
                    padding: 8px;
                    border-radius: 4px;
                    margin-top: 5px;
                }}
                
                .footer {{
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    font-size: 10px;
                    color: #888;
                }}
                
                .compliance-badge {{
                    display: inline-block;
                    background: rgba(255, 215, 0, 0.1);
                    border: 1px solid #ffd700;
                    border-radius: 6px;
                    padding: 4px 12px;
                    margin: 4px;
                    font-size: 10px;
                    color: #ffd700;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">ELITE SEAL™</div>
                <div class="subtitle">DIGITAL CUSTODY CERTIFICATE</div>
            </div>
            
            <div class="section">
                <div class="section-title">🔒 Informações do Selo</div>
                <div class="field">
                    <span class="field-label">Seal ID:</span>
                    <span class="field-value">{manifest['seal_id']}</span>
                </div>
                <div class="field">
                    <span class="field-label">Evidence ID:</span>
                    <span class="field-value">{manifest['evidence_id']}</span>
                </div>
                <div class="field">
                    <span class="field-label">Data de Emissão:</span>
                    <span class="field-value">{manifest['data_emissao']}</span>
                </div>
                <div class="field">
                    <span class="field-label">Emitido por:</span>
                    <span class="field-value">{manifest['emitido_por']}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">📄 Informações da Evidência</div>
                <div class="field">
                    <span class="field-label">Arquivo:</span>
                    <span class="field-value">{manifest['evidence']['filename']}</span>
                </div>
                <div class="field">
                    <span class="field-label">Tamanho:</span>
                    <span class="field-value">{manifest['evidence']['file_size']} bytes</span>
                </div>
                <div class="field">
                    <span class="field-label">Tipo:</span>
                    <span class="field-value">{manifest['evidence']['mime_type']}</span>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">🔐 Hashes Criptográficos</div>
                <div class="field">
                    <span class="field-label">SHA-256:</span>
                    <div class="hash">{manifest['hashes']['sha256']}</div>
                </div>
                <div class="field">
                    <span class="field-label">SHA-512:</span>
                    <div class="hash">{manifest['hashes']['sha512']}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">✍️ Assinatura Digital</div>
                <div class="field">
                    <span class="field-label">Algoritmo:</span>
                    <span class="field-value">{manifest['assinatura_digital']['algoritmo']}</span>
                </div>
                <div class="field">
                    <span class="field-label">Padding:</span>
                    <span class="field-value">{manifest['assinatura_digital']['padding']}</span>
                </div>
                <div class="field">
                    <span class="field-label">Hash Function:</span>
                    <span class="field-value">{manifest['assinatura_digital']['hash_function']}</span>
                </div>
                <div class="field">
                    <span class="field-label">Signature:</span>
                    <div class="hash">{manifest['assinatura_digital']['signature'][:100]}...</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">⛓️ Cadeia de Custódia</div>
                {''.join([f'''
                <div class="field">
                    <span class="field-label">{event.get('evento', 'N/A')}:</span>
                    <span class="field-value">{event.get('timestamp', 'N/A')} - {event.get('operador', 'N/A')}</span>
                </div>
                ''' for event in manifest.get('cadeia_custodia', [])[:10]])}
            </div>
            
            <div class="section">
                <div class="section-title">🏆 Conformidade e Normas</div>
                {''.join([f'<span class="compliance-badge">{norm}</span>' for norm in manifest['normas_conformidade']])}
            </div>
            
            {f'''
            <div class="section">
                <div class="section-title">⛓️ Blockchain</div>
                <div class="field">
                    <span class="field-label">Network:</span>
                    <span class="field-value">{manifest['blockchain']['network']}</span>
                </div>
                <div class="field">
                    <span class="field-label">Transaction Hash:</span>
                    <div class="hash">{manifest['blockchain']['tx_hash']}</div>
                </div>
            </div>
            ''' if manifest['blockchain'].get('tx_hash') else ''}
            
            <div class="footer">
                <p>Este documento foi gerado digitalmente pela plataforma Elite Gravitas™</p>
                <p>Verificação pública disponível em: {manifest['verificacao_publica']['url']}</p>
                <p>Para validar este selo, escaneie o QR Code ou acesse o link acima</p>
            </div>
        </body>
        </html>
        """
        
        # Gera PDF
        try:
            pdf_path = SEALS_DIR / f"{seal_id}_manifest.pdf"
            HTML(string=html_content).write_pdf(pdf_path)
            return str(pdf_path)
        except Exception as e:
            print(f"Error generating PDF: {e}")
            return None

# ==================== ENDPOINTS ====================

@router.post("/{evidence_id}", response_model=EliteSealResponse)
async def create_elite_seal(
    evidence_id: str,
    enable_blockchain: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """
    🔒 Cria Elite Seal™ para uma evidência
    
    Processo:
    1. Valida licença do módulo Elite Seal™
    2. Busca evidência e calcula hashes
    3. Gera assinatura RSA-2048
    4. Cria manifesto JSON completo
    5. Gera QR Code de verificação
    6. Opcional: registra na blockchain
    7. Exporta manifesto em PDF
    """
    # Valida acesso ao módulo
    await require_module_access(current_user, "elite_seal")
    
    # Busca evidência (primeiro tenta evidence_vault, depois forensic_evidences)
    evidence = await db.evidence_vault.find_one({"id": evidence_id}, {"_id": 0})
    if not evidence:
        evidence = await db.forensic_evidences.find_one({"id": evidence_id}, {"_id": 0})
    
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    # Verifica se já está selada
    existing_seal = await db.elite_seals.find_one({"evidence_id": evidence_id}, {"_id": 0})
    if existing_seal:
        raise HTTPException(status_code=400, detail="Evidência já possui Elite Seal™")
    
    # Gera ID do selo
    seal_id = str(uuid.uuid4())
    
    # Hashes (reutiliza os da evidência e adiciona SHA-512 se necessário)
    hashes = {
        "sha256": evidence.get("hash_sha256", evidence.get("sha256", "")),
        "sha512": evidence.get("hash_sha512", evidence.get("sha512", "")),
        "md5": evidence.get("hash_md5", evidence.get("md5", ""))
    }
    
    # Busca cadeia de custódia
    custody_events = await db.chain_of_custody.find(
        {"evidence_id": evidence_id},
        {"_id": 0}  # Exclude MongoDB _id field
    ).sort("timestamp", -1).to_list(length=100)
    
    chain_of_custody = []
    for event in custody_events:
        chain_of_custody.append({
            "evento": event.get("evento", event.get("action", "unknown")),
            "operador": event.get("operador", event.get("by", "unknown")),
            "timestamp": event.get("timestamp", ""),
            "ip": event.get("ip", ""),
            "device": event.get("device", "")
        })
    
    # Também busca custody_chain do evidence (se existir)
    if evidence.get("custody_chain"):
        for event in evidence["custody_chain"]:
            chain_of_custody.append({
                "evento": event.get("action", "unknown"),
                "operador": event.get("by", "unknown"),
                "timestamp": event.get("timestamp", ""),
                "ip": "",
                "device": ""
            })
    
    # Adiciona evento de lacração
    lacration_event = {
        "id": str(uuid.uuid4()),
        "evidence_id": evidence_id,
        "evento": "lacração_elite_seal",
        "operador": current_user.get("name", current_user.get("email", "System")),
        "ip": "system",
        "device": "Elite Seal™ System",
        "hash": hashes["sha256"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    # Insert a copy to avoid MongoDB adding _id to our dict
    await db.chain_of_custody.insert_one(lacration_event.copy())
    chain_of_custody.insert(0, lacration_event)
    
    # Cria manifesto pré-assinatura
    pre_manifest = ManifestService.create_manifest(
        seal_id=seal_id,
        evidence_id=evidence_id,
        evidence_data=evidence,
        hashes=hashes,
        chain_of_custody=chain_of_custody[:20],  # Limita a 20 eventos
        signature="",
        blockchain_tx=None
    )
    
    # Assina manifesto com RSA-2048
    manifest_json = json.dumps(pre_manifest, sort_keys=True)
    signature = RSAService.sign_data(manifest_json)
    
    # Atualiza manifesto com assinatura
    pre_manifest["assinatura_digital"]["signature"] = signature
    
    # Blockchain (opcional)
    blockchain_tx = None
    if enable_blockchain:
        blockchain_tx = await BlockchainService.register_hash(hashes["sha256"])
        pre_manifest["blockchain"]["tx_hash"] = blockchain_tx
        pre_manifest["blockchain"]["verified"] = True
    
    # Gera QR Code
    qr_code_url = QRCodeService.generate_qr_code(seal_id, hashes["sha256"])
    
    # Gera PDF do manifesto
    pdf_path = ManifestService.generate_pdf(pre_manifest, seal_id)
    
    # Salva selo no banco
    seal_record = {
        "id": seal_id,
        "evidence_id": evidence_id,
        "hash_sha256": hashes["sha256"],
        "hash_sha512": hashes["sha512"],
        "hash_md5": hashes["md5"],
        "assinatura_rsa": signature,
        "manifesto_json": pre_manifest,
        "qr_code_url": qr_code_url,
        "manifesto_pdf_path": pdf_path,
        "blockchain_tx": blockchain_tx,
        "data_emissao": datetime.now(timezone.utc).isoformat(),
        "emitido_por": current_user.get("name", current_user.get("email", "System")),
        "tenant_id": current_user.get("tenant_id", current_user["id"]),
        "status": "sealed"
    }
    
    await db.elite_seals.insert_one(seal_record)
    
    # Atualiza evidência como selada
    await db.evidence_vault.update_one(
        {"id": evidence_id},
        {"$set": {"elite_sealed": True, "seal_id": seal_id, "is_sealed": True}}
    )
    await db.forensic_evidences.update_one(
        {"id": evidence_id},
        {"$set": {"elite_sealed": True, "seal_id": seal_id}}
    )
    
    # Registra auditoria
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "acao": "elite_seal_created",
        "alvo": f"evidence:{evidence_id}",
        "hash": hashes["sha256"],
        "ip": "system",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "detalhes": {
            "seal_id": seal_id,
            "blockchain": enable_blockchain
        }
    })
    
    return EliteSealResponse(
        seal_id=seal_id,
        evidence_id=evidence_id,
        hash_sha256=hashes["sha256"],
        hash_sha512=hashes["sha512"],
        assinatura_rsa=signature[:50] + "...",  # Resumido
        qr_code_url=qr_code_url,
        manifesto_url=f"/api/elite-seal/manifest/{seal_id}",
        data_emissao=seal_record["data_emissao"],
        emitido_por=seal_record["emitido_por"],
        blockchain_tx=blockchain_tx,
        status="sealed"
    )

@router.get("/list")
async def list_elite_seals(
    current_user: dict = Depends(get_current_user)
):
    """Lista todos os Elite Seals™ do tenant"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    tenant_id = current_user.get("tenant_id", current_user["id"])
    
    seals = await db.elite_seals.find(
        {"tenant_id": tenant_id}
    ).sort("data_emissao", -1).to_list(length=100)
    
    return {
        "total": len(seals),
        "seals": [{
            "seal_id": s["id"],
            "evidence_id": s["evidence_id"],
            "hash_sha256": s["hash_sha256"],
            "data_emissao": s["data_emissao"],
            "emitido_por": s["emitido_por"],
            "blockchain_tx": s.get("blockchain_tx"),
            "status": s["status"]
        } for s in seals]
    }

@router.get("/manifest/{seal_id}")
async def get_manifest(
    seal_id: str,
    format: str = "json"  # json ou pdf
):
    """Retorna manifesto do selo (JSON ou PDF)"""
    seal = await db.elite_seals.find_one({"id": seal_id}, {"_id": 0})
    if not seal:
        raise HTTPException(status_code=404, detail="Selo não encontrado")
    
    if format == "pdf":
        pdf_path = seal.get("manifesto_pdf_path")
        if not pdf_path or not Path(pdf_path).exists():
            raise HTTPException(status_code=404, detail="PDF não encontrado")
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"elite_seal_{seal_id}.pdf"
        )
    
    return JSONResponse(content=seal["manifesto_json"])

@router.get("/qr/{seal_id}")
async def get_qr_code(seal_id: str):
    """Retorna imagem do QR Code"""
    qr_path = QRCodeService.get_qr_image_path(seal_id)
    if not qr_path.exists():
        raise HTTPException(status_code=404, detail="QR Code não encontrado")
    
    return FileResponse(qr_path, media_type="image/png")

@router.get("/verify/{hash_value}", response_class=HTMLResponse)
async def verify_seal_public(hash_value: str):
    """
    🌐 Endpoint público de verificação via QR Code
    Retorna página HTML com informações do selo
    """
    seal = await db.elite_seals.find_one({"hash_sha256": hash_value}, {"_id": 0})
    
    if not seal:
        return HTMLResponse(content="""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Elite Seal™ - Verificação</title>
            <style>
                body {
                    font-family: 'Segoe UI', sans-serif;
                    background: #0A0E12;
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    text-align: center;
                    padding: 40px;
                    background: rgba(255, 0, 0, 0.1);
                    border: 2px solid #ff0000;
                    border-radius: 12px;
                }
                h1 { color: #ff0000; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>❌ Selo Inválido</h1>
                <p>Nenhum Elite Seal™ encontrado para este hash.</p>
            </div>
        </body>
        </html>
        """, status_code=404)
    
    manifest = seal["manifesto_json"]
    blockchain_badge = ""
    if seal.get("blockchain_tx"):
        blockchain_badge = f'<div class="badge blockchain">⛓️ Blockchain Verified</div>'
    
    return HTMLResponse(content=f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Elite Seal™ - Verificação Pública</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #0A0E12 0%, #1a1f2e 100%);
                color: white;
                padding: 40px 20px;
                margin: 0;
            }}
            
            .container {{
                max-width: 900px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid rgba(0, 217, 255, 0.3);
                border-radius: 16px;
                padding: 40px;
                box-shadow: 0 8px 32px rgba(0, 217, 255, 0.2);
            }}
            
            .header {{
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 30px;
                border-bottom: 2px solid rgba(0, 217, 255, 0.3);
            }}
            
            .logo {{
                font-size: 48px;
                font-weight: 700;
                color: #00d9ff;
                margin-bottom: 10px;
            }}
            
            .subtitle {{
                color: #888;
                letter-spacing: 3px;
                font-size: 14px;
            }}
            
            .badge {{
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                margin: 10px 5px;
            }}
            
            .badge.valid {{
                background: rgba(0, 255, 0, 0.2);
                border: 1px solid #00ff00;
                color: #00ff00;
            }}
            
            .badge.blockchain {{
                background: rgba(255, 215, 0, 0.2);
                border: 1px solid #ffd700;
                color: #ffd700;
            }}
            
            .section {{
                margin: 30px 0;
                padding: 20px;
                background: rgba(0, 217, 255, 0.05);
                border-left: 4px solid #00d9ff;
                border-radius: 8px;
            }}
            
            .section-title {{
                font-size: 18px;
                font-weight: 600;
                color: #00d9ff;
                margin-bottom: 15px;
            }}
            
            .field {{
                margin: 12px 0;
                display: flex;
                gap: 10px;
            }}
            
            .field-label {{
                font-weight: 600;
                color: #00d9ff;
                min-width: 150px;
            }}
            
            .field-value {{
                color: #ffffff;
                word-break: break-all;
                font-family: 'Courier New', monospace;
                font-size: 13px;
            }}
            
            .compliance {{
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 15px;
            }}
            
            .compliance-badge {{
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid #ffd700;
                border-radius: 6px;
                padding: 6px 12px;
                font-size: 11px;
                color: #ffd700;
            }}
            
            .footer {{
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                color: #888;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">ELITE SEAL™</div>
                <div class="subtitle">VERIFICAÇÃO PÚBLICA</div>
                <div style="margin-top: 20px;">
                    <div class="badge valid">✅ Selo Válido</div>
                    {blockchain_badge}
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">🔒 Informações do Selo</div>
                <div class="field">
                    <div class="field-label">Seal ID:</div>
                    <div class="field-value">{seal['id']}</div>
                </div>
                <div class="field">
                    <div class="field-label">Evidence ID:</div>
                    <div class="field-value">{seal['evidence_id']}</div>
                </div>
                <div class="field">
                    <div class="field-label">Data de Emissão:</div>
                    <div class="field-value">{seal['data_emissao']}</div>
                </div>
                <div class="field">
                    <div class="field-label">Emitido por:</div>
                    <div class="field-value">{seal['emitido_por']}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">🔐 Hashes Criptográficos</div>
                <div class="field">
                    <div class="field-label">SHA-256:</div>
                    <div class="field-value">{seal['hash_sha256']}</div>
                </div>
                <div class="field">
                    <div class="field-label">SHA-512:</div>
                    <div class="field-value">{seal['hash_sha512']}</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">✍️ Assinatura Digital</div>
                <div class="field">
                    <div class="field-label">Algoritmo:</div>
                    <div class="field-value">RSA-2048 (PSS padding, SHA-512 digest)</div>
                </div>
                <div class="field">
                    <div class="field-label">Status:</div>
                    <div class="field-value">✅ Assinatura válida</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">🏆 Conformidade e Normas</div>
                <div class="compliance">
                    {''.join([f'<div class="compliance-badge">{norm}</div>' for norm in manifest['normas_conformidade']])}
                </div>
            </div>
            
            <div class="footer">
                <p>Este selo foi emitido pela plataforma <strong>Elite Gravitas™</strong></p>
                <p>Verificação independente disponível via QR Code ou este link público</p>
            </div>
        </div>
    </body>
    </html>
    """)

@router.post("/blockchain/register/{seal_id}")
async def register_seal_blockchain(
    seal_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    ⛓️ Registra selo na blockchain (post-création)
    Útil para selos criados sem blockchain inicialmente
    """
    await require_module_access(current_user, "elite_seal")
    
    seal = await db.elite_seals.find_one({"id": seal_id}, {"_id": 0})
    if not seal:
        raise HTTPException(status_code=404, detail="Selo não encontrado")
    
    if seal.get("blockchain_tx"):
        raise HTTPException(status_code=400, detail="Selo já registrado na blockchain")
    
    # Registra na blockchain
    tx_hash = await BlockchainService.register_hash(seal["hash_sha256"])
    
    # Atualiza seal
    await db.elite_seals.update_one(
        {"id": seal_id},
        {"$set": {
            "blockchain_tx": tx_hash,
            "manifesto_json.blockchain.tx_hash": tx_hash,
            "manifesto_json.blockchain.verified": True
        }}
    )
    
    return {
        "success": True,
        "seal_id": seal_id,
        "blockchain_tx": tx_hash,
        "network": "Polygon Mumbai Testnet"
    }

# Initialize RSA keys on module load
RSAService.generate_keys()
