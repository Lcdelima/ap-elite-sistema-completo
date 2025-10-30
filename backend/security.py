"""
Módulo de Segurança e Autenticação
Hashing de senhas, validação de tokens, RBAC
"""
from passlib.context import CryptContext
from datetime import datetime, timedelta
import uuid
import secrets

# Contexto para hashing de senhas com bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Gera hash seguro da senha usando bcrypt
    
    Args:
        password: Senha em texto plano
        
    Returns:
        Hash bcrypt da senha
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se a senha corresponde ao hash
    
    Args:
        plain_password: Senha em texto plano
        hashed_password: Hash bcrypt
        
    Returns:
        True se a senha está correta, False caso contrário
    """
    return pwd_context.verify(plain_password, hashed_password)

def generate_token() -> str:
    """
    Gera token seguro para autenticação
    
    Returns:
        Token único e seguro
    """
    return f"token_{uuid.uuid4().hex}_{secrets.token_urlsafe(32)}"

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Valida força da senha
    
    Args:
        password: Senha a ser validada
        
    Returns:
        Tupla (is_valid, message)
    """
    if len(password) < 8:
        return False, "Senha deve ter no mínimo 8 caracteres"
    
    if not any(c.isupper() for c in password):
        return False, "Senha deve conter pelo menos uma letra maiúscula"
    
    if not any(c.islower() for c in password):
        return False, "Senha deve conter pelo menos uma letra minúscula"
    
    if not any(c.isdigit() for c in password):
        return False, "Senha deve conter pelo menos um número"
    
    return True, "Senha forte"

# RBAC - Papéis e permissões
ROLES = {
    "super_admin": {
        "name": "Super Administrador",
        "permissions": ["*"]  # Todas as permissões
    },
    "administrator": {
        "name": "Administrador",
        "permissions": [
            "cases.create", "cases.read", "cases.update", "cases.delete",
            "users.create", "users.read", "users.update",
            "forensics.*", "evidence.*", "reports.*"
        ]
    },
    "perito": {
        "name": "Perito Forense",
        "permissions": [
            "forensics.*", "evidence.*", "reports.create", "reports.read"
        ]
    },
    "advogado": {
        "name": "Advogado",
        "permissions": [
            "cases.read", "cases.update", "documents.*", "processes.*"
        ]
    },
    "cliente": {
        "name": "Cliente",
        "permissions": [
            "cases.read", "documents.read", "reports.read"
        ]
    },
    "auditor": {
        "name": "Auditor",
        "permissions": [
            "audit.*", "compliance.*", "reports.read"
        ]
    }
}

def check_permission(user_role: str, permission: str) -> bool:
    """
    Verifica se o papel tem a permissão específica
    
    Args:
        user_role: Papel do usuário
        permission: Permissão a verificar (ex: "cases.create")
        
    Returns:
        True se tem permissão, False caso contrário
    """
    role_data = ROLES.get(user_role)
    if not role_data:
        return False
    
    permissions = role_data["permissions"]
    
    # Super admin tem tudo
    if "*" in permissions:
        return True
    
    # Verificar permissão exata
    if permission in permissions:
        return True
    
    # Verificar wildcard (ex: "forensics.*" cobre "forensics.create")
    resource = permission.split(".")[0]
    if f"{resource}.*" in permissions:
        return True
    
    return False
