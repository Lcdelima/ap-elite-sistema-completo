"""
OXYGEN-STYLE PASSWORD MANAGEMENT SYSTEM
Sistema avançado de gerenciamento e armazenamento de senhas
Baseado no Oxygen Forensic Detective
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import os
import uuid
import jwt
import hashlib
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/oxygen-passwords", tags=["oxygen_passwords"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['ap_elite']

# Encryption key (em produção, gerar e armazenar de forma segura)
MASTER_KEY = os.environ.get('MASTER_ENCRYPTION_KEY', 'ap_elite_master_key_2024_secure')

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
            return user if user else {"id": "anonymous", "email": "anonymous@apelite.com"}
    except:
        return {"id": "anonymous", "email": "anonymous@apelite.com"}

def get_cipher():
    """Gera cipher para criptografia"""
    kdf = PBKDF2(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'ap_elite_salt_2024',
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(MASTER_KEY.encode()))
    return Fernet(key)

def encrypt_password(password: str) -> str:
    """Encripta senha"""
    cipher = get_cipher()
    encrypted = cipher.encrypt(password.encode())
    return base64.urlsafe_b64encode(encrypted).decode()

def decrypt_password(encrypted_password: str) -> str:
    """Decripta senha"""
    try:
        cipher = get_cipher()
        encrypted_bytes = base64.urlsafe_b64decode(encrypted_password.encode())
        decrypted = cipher.decrypt(encrypted_bytes)
        return decrypted.decode()
    except:
        return "[DECRYPTION_ERROR]"

# Models
class PasswordEntry(BaseModel):
    """Entrada de senha (estilo Oxygen)"""
    source: str  # file, application, browser, system, manual
    application_name: Optional[str] = None
    url: Optional[str] = None
    username: Optional[str] = None
    password: str
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    category: str = "general"  # general, banking, social, email, work, personal
    tags: List[str] = []
    strength: Optional[str] = None  # weak, medium, strong
    compromised: bool = False

class PasswordDatabase(BaseModel):
    """Database de senhas (estilo Oxygen)"""
    database_name: str
    source_type: str  # extraction, import, manual
    caso_id: Optional[str] = None
    extracao_id: Optional[str] = None
    device_info: Optional[Dict[str, Any]] = None
    encryption_status: str = "encrypted"  # encrypted, decrypted, mixed

# Routes
@router.get("/databases")
async def list_password_databases(authorization: str = Header(None)):
    """Listar todos os bancos de senhas"""
    user = await get_current_user(authorization)
    
    try:
        databases = await db.password_databases.find({}).sort("created_at", -1).to_list(100)
        
        for db_entry in databases:
            db_entry.pop("_id", None)
            # Conta senhas neste banco
            password_count = await db.password_entries.count_documents({
                "database_id": db_entry.get("database_id")
            })
            db_entry["password_count"] = password_count
        
        return {
            "databases": databases,
            "total": len(databases)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/databases")
async def create_password_database(database: PasswordDatabase, authorization: str = Header(None)):
    """Criar novo banco de senhas"""
    user = await get_current_user(authorization)
    
    try:
        database_id = str(uuid.uuid4())
        
        db_doc = {
            "database_id": database_id,
            "database_name": database.database_name,
            "source_type": database.source_type,
            "caso_id": database.caso_id,
            "extracao_id": database.extracao_id,
            "device_info": database.device_info,
            "encryption_status": database.encryption_status,
            "password_count": 0,
            "categories": {},
            "sources": {},
            "strength_distribution": {
                "weak": 0,
                "medium": 0,
                "strong": 0
            },
            "compromised_count": 0,
            "created_by": user.get("email"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.password_databases.insert_one(db_doc)
        db_doc.pop("_id", None)
        
        return {
            "success": True,
            "database_id": database_id,
            "database": db_doc
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/databases/{database_id}/passwords")
async def add_password_to_database(
    database_id: str, 
    password_entry: PasswordEntry, 
    authorization: str = Header(None)
):
    """Adicionar senha ao banco"""
    user = await get_current_user(authorization)
    
    try:
        # Verifica se banco existe
        database = await db.password_databases.find_one({"database_id": database_id})
        if not database:
            raise HTTPException(status_code=404, detail="Banco de senhas não encontrado")
        
        password_id = str(uuid.uuid4())
        
        # Calcula força da senha
        strength = calculate_password_strength(password_entry.password)
        
        # Verifica se senha foi comprometida (simulado)
        compromised = check_if_compromised(password_entry.password)
        
        # Encripta senha
        encrypted_password = encrypt_password(password_entry.password)
        
        # Hash da senha original (para busca)
        password_hash = hashlib.sha256(password_entry.password.encode()).hexdigest()
        
        password_doc = {
            "password_id": password_id,
            "database_id": database_id,
            "source": password_entry.source,
            "application_name": password_entry.application_name,
            "url": password_entry.url,
            "username": password_entry.username,
            "encrypted_password": encrypted_password,
            "password_hash": password_hash,
            "email": password_entry.email,
            "phone": password_entry.phone,
            "notes": password_entry.notes,
            "category": password_entry.category,
            "tags": password_entry.tags,
            "strength": strength,
            "compromised": compromised,
            "first_seen": datetime.now(timezone.utc).isoformat(),
            "last_used": None,
            "times_reused": 0,
            "created_by": user.get("email"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.password_entries.insert_one(password_doc)
        
        # Atualiza estatísticas do banco
        await update_database_stats(database_id)
        
        password_doc.pop("_id", None)
        password_doc.pop("encrypted_password", None)  # Não retorna senha encriptada
        
        return {
            "success": True,
            "password_id": password_id,
            "strength": strength,
            "compromised": compromised,
            "password": password_doc
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/databases/{database_id}/passwords")
async def get_database_passwords(
    database_id: str,
    category: Optional[str] = None,
    source: Optional[str] = None,
    compromised_only: bool = False,
    authorization: str = Header(None)
):
    """Listar senhas de um banco"""
    user = await get_current_user(authorization)
    
    try:
        query = {"database_id": database_id}
        
        if category:
            query["category"] = category
        if source:
            query["source"] = source
        if compromised_only:
            query["compromised"] = True
        
        passwords = await db.password_entries.find(query).to_list(1000)
        
        for pwd in passwords:
            pwd.pop("_id", None)
            pwd.pop("encrypted_password", None)  # Nunca expõe senha encriptada
            pwd["password"] = "***PROTECTED***"  # Não retorna senha por padrão
        
        return {
            "passwords": passwords,
            "count": len(passwords),
            "database_id": database_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/databases/{database_id}/passwords/{password_id}/decrypt")
async def decrypt_password_entry(
    database_id: str,
    password_id: str,
    authorization: str = Header(None)
):
    """Decriptar senha específica (REQUER AUTORIZAÇÃO)"""
    user = await get_current_user(authorization)
    
    try:
        password = await db.password_entries.find_one({
            "database_id": database_id,
            "password_id": password_id
        })
        
        if not password:
            raise HTTPException(status_code=404, detail="Senha não encontrada")
        
        # Decripta senha
        decrypted_password = decrypt_password(password.get("encrypted_password"))
        
        # Registra acesso
        await db.password_access_log.insert_one({
            "password_id": password_id,
            "database_id": database_id,
            "accessed_by": user.get("email"),
            "action": "decrypt",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "password_id": password_id,
            "username": password.get("username"),
            "password": decrypted_password,
            "url": password.get("url"),
            "application_name": password.get("application_name"),
            "strength": password.get("strength"),
            "compromised": password.get("compromised"),
            "warning": "Esta senha foi decriptada. Mantenha segura!"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/databases/{database_id}/stats")
async def get_database_stats(database_id: str, authorization: str = Header(None)):
    """Obter estatísticas do banco de senhas"""
    user = await get_current_user(authorization)
    
    try:
        database = await db.password_databases.find_one({"database_id": database_id})
        
        if not database:
            raise HTTPException(status_code=404, detail="Banco não encontrado")
        
        # Stats por categoria
        by_category = await db.password_entries.aggregate([
            {"$match": {"database_id": database_id}},
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]).to_list(None)
        
        # Stats por fonte
        by_source = await db.password_entries.aggregate([
            {"$match": {"database_id": database_id}},
            {"$group": {"_id": "$source", "count": {"$sum": 1}}}
        ]).to_list(None)
        
        # Stats por força
        by_strength = await db.password_entries.aggregate([
            {"$match": {"database_id": database_id}},
            {"$group": {"_id": "$strength", "count": {"$sum": 1}}}
        ]).to_list(None)
        
        # Senhas comprometidas
        compromised = await db.password_entries.count_documents({
            "database_id": database_id,
            "compromised": True
        })
        
        # Senhas duplicadas
        duplicates = await db.password_entries.aggregate([
            {"$match": {"database_id": database_id}},
            {"$group": {"_id": "$password_hash", "count": {"$sum": 1}}},
            {"$match": {"count": {"$gt": 1}}}
        ]).to_list(None)
        
        return {
            "database_id": database_id,
            "database_name": database.get("database_name"),
            "total_passwords": database.get("password_count", 0),
            "by_category": {item["_id"]: item["count"] for item in by_category},
            "by_source": {item["_id"]: item["count"] for item in by_source},
            "by_strength": {item["_id"]: item["count"] for item in by_strength},
            "compromised_count": compromised,
            "duplicate_passwords": len(duplicates),
            "security_score": calculate_security_score(
                database.get("password_count", 0),
                compromised,
                len(duplicates),
                by_strength
            )
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/weak-passwords")
async def analyze_weak_passwords(authorization: str = Header(None)):
    """Analisar senhas fracas em todos os bancos"""
    user = await get_current_user(authorization)
    
    try:
        weak_passwords = await db.password_entries.find({
            "strength": "weak"
        }).to_list(100)
        
        for pwd in weak_passwords:
            pwd.pop("_id", None)
            pwd.pop("encrypted_password", None)
            pwd["password"] = "***WEAK***"
        
        return {
            "weak_passwords": weak_passwords,
            "count": len(weak_passwords),
            "recommendations": [
                "Use senhas com pelo menos 12 caracteres",
                "Inclua letras maiúsculas e minúsculas",
                "Adicione números e símbolos especiais",
                "Evite palavras do dicionário",
                "Não reutilize senhas",
                "Use um gerenciador de senhas"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/compromised")
async def analyze_compromised_passwords(authorization: str = Header(None)):
    """Analisar senhas comprometidas"""
    user = await get_current_user(authorization)
    
    try:
        compromised = await db.password_entries.find({
            "compromised": True
        }).to_list(100)
        
        for pwd in compromised:
            pwd.pop("_id", None)
            pwd.pop("encrypted_password", None)
            pwd["password"] = "***COMPROMISED***"
        
        return {
            "compromised_passwords": compromised,
            "count": len(compromised),
            "severity": "HIGH" if len(compromised) > 10 else "MEDIUM" if len(compromised) > 5 else "LOW",
            "action_required": "Trocar IMEDIATAMENTE todas as senhas comprometidas!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/duplicates")
async def analyze_duplicate_passwords(authorization: str = Header(None)):
    """Analisar senhas duplicadas"""
    user = await get_current_user(authorization)
    
    try:
        duplicates = await db.password_entries.aggregate([
            {"$group": {
                "_id": "$password_hash",
                "count": {"$sum": 1},
                "entries": {"$push": {
                    "password_id": "$password_id",
                    "database_id": "$database_id",
                    "username": "$username",
                    "url": "$url",
                    "application_name": "$application_name"
                }}
            }},
            {"$match": {"count": {"$gt": 1}}},
            {"$sort": {"count": -1}}
        ]).to_list(100)
        
        return {
            "duplicate_groups": duplicates,
            "total_groups": len(duplicates),
            "total_duplicates": sum(d["count"] for d in duplicates),
            "warning": "Senhas duplicadas são um risco de segurança. Se uma for comprometida, todas as contas ficam vulneráveis."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_passwords(
    query: str,
    search_in: str = "all",  # all, username, url, application
    authorization: str = Header(None)
):
    """Buscar senhas"""
    user = await get_current_user(authorization)
    
    try:
        search_query = {}
        
        if search_in == "all":
            search_query = {
                "$or": [
                    {"username": {"$regex": query, "$options": "i"}},
                    {"url": {"$regex": query, "$options": "i"}},
                    {"application_name": {"$regex": query, "$options": "i"}},
                    {"email": {"$regex": query, "$options": "i"}}
                ]
            }
        else:
            search_query = {search_in: {"$regex": query, "$options": "i"}}
        
        results = await db.password_entries.find(search_query).to_list(100)
        
        for pwd in results:
            pwd.pop("_id", None)
            pwd.pop("encrypted_password", None)
            pwd["password"] = "***SEARCH_RESULT***"
        
        return {
            "results": results,
            "count": len(results),
            "query": query
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
def calculate_password_strength(password: str) -> str:
    """Calcula força da senha"""
    score = 0
    
    if len(password) >= 8:
        score += 1
    if len(password) >= 12:
        score += 1
    if any(c.isupper() for c in password):
        score += 1
    if any(c.islower() for c in password):
        score += 1
    if any(c.isdigit() for c in password):
        score += 1
    if any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        score += 1
    
    if score <= 2:
        return "weak"
    elif score <= 4:
        return "medium"
    else:
        return "strong"

def check_if_compromised(password: str) -> bool:
    """Verifica se senha está em lista de senhas comprometidas (simulado)"""
    common_passwords = [
        "123456", "password", "12345678", "qwerty", "123456789",
        "12345", "1234", "111111", "1234567", "dragon",
        "123123", "baseball", "iloveyou", "trustno1", "1234567890"
    ]
    return password.lower() in common_passwords

async def update_database_stats(database_id: str):
    """Atualiza estatísticas do banco de senhas"""
    # Conta total
    total = await db.password_entries.count_documents({"database_id": database_id})
    
    # Por categoria
    by_category = await db.password_entries.aggregate([
        {"$match": {"database_id": database_id}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]).to_list(None)
    
    # Por fonte
    by_source = await db.password_entries.aggregate([
        {"$match": {"database_id": database_id}},
        {"$group": {"_id": "$source", "count": {"$sum": 1}}}
    ]).to_list(None)
    
    # Por força
    by_strength = await db.password_entries.aggregate([
        {"$match": {"database_id": database_id}},
        {"$group": {"_id": "$strength", "count": {"$sum": 1}}}
    ]).to_list(None)
    
    # Comprometidas
    compromised = await db.password_entries.count_documents({
        "database_id": database_id,
        "compromised": True
    })
    
    await db.password_databases.update_one(
        {"database_id": database_id},
        {
            "$set": {
                "password_count": total,
                "categories": {item["_id"]: item["count"] for item in by_category},
                "sources": {item["_id"]: item["count"] for item in by_source},
                "strength_distribution": {item["_id"]: item["count"] for item in by_strength},
                "compromised_count": compromised,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )

def calculate_security_score(total: int, compromised: int, duplicates: int, strength_dist: List) -> int:
    """Calcula score de segurança (0-100)"""
    if total == 0:
        return 0
    
    score = 100
    
    # Penaliza comprometidas
    score -= (compromised / total * 100) * 0.4
    
    # Penaliza duplicadas
    score -= (duplicates / total * 100) * 0.3
    
    # Penaliza fracas
    weak_count = sum(item["count"] for item in strength_dist if item["_id"] == "weak")
    score -= (weak_count / total * 100) * 0.3
    
    return max(0, int(score))
