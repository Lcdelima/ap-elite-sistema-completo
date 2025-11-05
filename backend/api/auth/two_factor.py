"""Two-Factor Authentication (2FA) com TOTP - Elite Athena"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pyotp
import qrcode
import io
import base64
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone

router = APIRouter(prefix="/api/auth/2fa", tags=["2fa"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class Enable2FARequest(BaseModel):
    user_id: str


class Verify2FARequest(BaseModel):
    user_id: str
    token: str


@router.post("/enable")
async def enable_2fa(data: Enable2FARequest):
    """Habilita 2FA para usuário"""
    
    # Gerar secret único
    secret = pyotp.random_base32()
    
    # Criar URI para QR Code
    user = await db.users.find_one({"id": data.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=user['email'],
        issuer_name='Elite Athena'
    )
    
    # Gerar QR Code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(totp_uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Converter para base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    # Salvar secret no usuário (ainda não ativado)
    await db.users.update_one(
        {"id": data.user_id},
        {
            "$set": {
                "totp_secret_pending": secret,
                "2fa_enabled": False
            }
        }
    )
    
    return {
        "secret": secret,
        "qr_code": f"data:image/png;base64,{qr_base64}",
        "uri": totp_uri,
        "message": "Escaneie o QR Code com Google Authenticator ou Authy"
    }


@router.post("/verify-and-enable")
async def verify_and_enable_2fa(data: Verify2FARequest):
    """Verifica token e ativa 2FA"""
    
    user = await db.users.find_one({"id": data.user_id})
    if not user or not user.get('totp_secret_pending'):
        raise HTTPException(status_code=400, detail="2FA não configurado")
    
    # Verificar token
    totp = pyotp.TOTP(user['totp_secret_pending'])
    
    if not totp.verify(data.token, valid_window=1):
        raise HTTPException(status_code=401, detail="Token inválido")
    
    # Ativar 2FA
    await db.users.update_one(
        {"id": data.user_id},
        {
            "$set": {
                "totp_secret": user['totp_secret_pending'],
                "2fa_enabled": True,
                "2fa_enabled_at": datetime.now(timezone.utc).isoformat()
            },
            "$unset": {"totp_secret_pending": ""}
        }
    )
    
    return {
        "message": "2FA ativado com sucesso",
        "2fa_enabled": True
    }


@router.post("/verify")
async def verify_2fa_token(data: Verify2FARequest):
    """Verifica token 2FA no login"""
    
    user = await db.users.find_one({"id": data.user_id})
    
    if not user or not user.get('totp_secret'):
        raise HTTPException(status_code=400, detail="2FA não habilitado")
    
    totp = pyotp.TOTP(user['totp_secret'])
    
    if not totp.verify(data.token, valid_window=1):
        raise HTTPException(status_code=401, detail="Token inválido")
    
    return {
        "valid": True,
        "message": "Token verificado"
    }


@router.post("/disable")
async def disable_2fa(user_id: str, password: str):
    """Desabilita 2FA (requer senha)"""
    
    user = await db.users.find_one({"id": user_id})
    if not user or user['password'] != password:
        raise HTTPException(status_code=401, detail="Senha incorreta")
    
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {"2fa_enabled": False},
            "$unset": {"totp_secret": ""}
        }
    )
    
    return {"message": "2FA desabilitado"}


@router.get("/backup-codes/{user_id}")
async def generate_backup_codes(user_id: str):
    """Gera códigos de backup para 2FA"""
    
    import secrets
    
    backup_codes = [secrets.token_hex(4).upper() for _ in range(10)]
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"backup_codes_2fa": backup_codes}}
    )
    
    return {
        "backup_codes": backup_codes,
        "message": "Guarde esses códigos em local seguro"
    }
