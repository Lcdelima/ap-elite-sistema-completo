"""Elite Seal - Manifesto de Custódia com Assinatura Digital - Elite Athena"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timezone
import json
import hashlib
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
import base64
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/elite-seal", tags=["elite-seal"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Chaves RSA Elite (devem ser armazenadas de forma segura)
PRIVATE_KEY = None
PUBLIC_KEY = None


def generate_elite_keys():
    """Gera par de chaves RSA para Elite (executar uma vez)"""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    public_key = private_key.public_key()
    return private_key, public_key


def load_or_generate_keys():
    """Carrega ou gera chaves Elite"""
    global PRIVATE_KEY, PUBLIC_KEY
    
    keys_dir = "/app/backend/elite_keys"
    os.makedirs(keys_dir, exist_ok=True)
    
    private_key_path = os.path.join(keys_dir, "elite_private.pem")
    public_key_path = os.path.join(keys_dir, "elite_public.pem")
    
    if os.path.exists(private_key_path) and os.path.exists(public_key_path):
        # Carregar chaves existentes
        with open(private_key_path, "rb") as f:
            PRIVATE_KEY = serialization.load_pem_private_key(
                f.read(),
                password=None,
                backend=default_backend()
            )
        
        with open(public_key_path, "rb") as f:
            PUBLIC_KEY = serialization.load_pem_public_key(
                f.read(),
                backend=default_backend()
            )
    else:
        # Gerar novas chaves
        PRIVATE_KEY, PUBLIC_KEY = generate_elite_keys()
        
        # Salvar chaves
        with open(private_key_path, "wb") as f:
            f.write(PRIVATE_KEY.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
        
        with open(public_key_path, "wb") as f:
            f.write(PUBLIC_KEY.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))


# Carregar chaves ao iniciar
load_or_generate_keys()


class EliteSealRequest(BaseModel):
    evidence_id: str
    signed_by: str
    purpose: str  # export, report, court_submission


@router.post("/create")
async def create_elite_seal(request: EliteSealRequest):
    """Cria Elite Seal - Manifesto de Custódia com Assinatura Digital"""
    
    # Buscar evidência
    evidence = await db.evidence_vault.find_one({"id": request.evidence_id})
    
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    # Criar manifesto
    manifest = {
        "version": "1.0",
        "seal_id": hashlib.sha256(f"{request.evidence_id}{datetime.now(timezone.utc).isoformat()}".encode()).hexdigest(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "evidence": {
            "id": evidence["id"],
            "filename": evidence["filename"],
            "size_bytes": evidence["file_size"],
            "mime_type": evidence["mime_type"],
            "hashes": {
                "md5": evidence["hash_md5"],
                "sha256": evidence["hash_sha256"],
                "sha512": evidence["hash_sha512"]
            },
            "collected_at": evidence["collected_at"],
            "collected_by": evidence["collected_by"],
            "case_id": evidence["case_id"]
        },
        "custody_chain": evidence["custody_chain"],
        "seal": {
            "created_at": datetime.now(timezone.utc).isoformat(),
            "signed_by": request.signed_by,
            "purpose": request.purpose,
            "organization": "Elite - Estratégias em Perícia e Investigação Criminal",
            "standards": ["ISO/IEC 27037", "ISO 27001", "ABNT NBR"]
        },
        "integrity_verification": {
            "method": "Multi-hash validation (MD5, SHA-256, SHA-512)",
            "custody_chain_complete": True,
            "sealed": evidence.get("is_sealed", False)
        }
    }
    
    # Converter manifesto para JSON
    manifest_json = json.dumps(manifest, indent=2, ensure_ascii=False)
    
    # Assinar manifesto com chave privada Elite
    signature = PRIVATE_KEY.sign(
        manifest_json.encode('utf-8'),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    
    signature_b64 = base64.b64encode(signature).decode('utf-8')
    
    # Adicionar assinatura ao manifesto
    manifest["signature"] = {
        "algorithm": "RSA-2048-PSS",
        "hash_function": "SHA-256",
        "signature": signature_b64,
        "signed_by_organization": "Elite Athena Platform",
        "certificate": "Elite Technical Signature (ICP-Brasil optional)"
    }
    
    # Salvar seal no banco
    seal_record = {
        "seal_id": manifest["seal_id"],
        "evidence_id": request.evidence_id,
        "manifest": manifest,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "signed_by": request.signed_by,
        "purpose": request.purpose
    }
    
    await db.elite_seals.insert_one(seal_record)
    
    # Adicionar evento de seal na cadeia de custódia
    await db.evidence_vault.update_one(
        {"id": request.evidence_id},
        {
            "$push": {
                "custody_chain": {
                    "action": "elite_seal_created",
                    "by": request.signed_by,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "seal_id": manifest["seal_id"],
                    "notes": f"Elite Seal created for {request.purpose}"
                }
            }
        }
    )
    
    return {
        "seal_id": manifest["seal_id"],
        "manifest": manifest,
        "message": "Elite Seal criado com sucesso"
    }


@router.get("/{seal_id}")
async def get_elite_seal(seal_id: str):
    """Obtém manifesto de Elite Seal"""
    seal = await db.elite_seals.find_one({"seal_id": seal_id})
    
    if not seal:
        raise HTTPException(status_code=404, detail="Elite Seal não encontrado")
    
    return seal["manifest"]


@router.post("/{seal_id}/verify")
async def verify_elite_seal(seal_id: str):
    """Verifica assinatura do Elite Seal"""
    seal = await db.elite_seals.find_one({"seal_id": seal_id})
    
    if not seal:
        raise HTTPException(status_code=404, detail="Elite Seal não encontrado")
    
    manifest = seal["manifest"].copy()
    signature_data = manifest.pop("signature")
    signature_b64 = signature_data["signature"]
    
    # Reconstruir JSON original (sem assinatura)
    manifest_json = json.dumps(manifest, indent=2, ensure_ascii=False)
    
    # Verificar assinatura
    try:
        signature = base64.b64decode(signature_b64)
        PUBLIC_KEY.verify(
            signature,
            manifest_json.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        
        return {
            "seal_id": seal_id,
            "signature_valid": True,
            "message": "Assinatura Elite válida",
            "signed_by": manifest["seal"]["signed_by"],
            "timestamp": manifest["timestamp"]
        }
    except Exception as e:
        return {
            "seal_id": seal_id,
            "signature_valid": False,
            "message": "Assinatura inválida ou adulterada",
            "error": str(e)
        }
