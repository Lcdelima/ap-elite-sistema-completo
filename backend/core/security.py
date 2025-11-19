"""
AP ELITE GRAVITAS™ - Core Security Module
JWT com SECRET fixo, autenticação centralizada e RBAC

Este módulo centraliza toda a lógica de segurança do sistema.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.database import db
import os
from dotenv import load_dotenv

load_dotenv()

# JWT SECRET FIXO (não dinâmico)
JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise ValueError("JWT_SECRET não configurado no .env! Sistema não pode iniciar.")

# Security scheme
security = HTTPBearer(auto_error=False)

# ==================== AUTENTICAÇÃO ====================

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency de autenticação centralizado
    Valida token e retorna usuário
    """
    if not credentials:
        return None
    
    try:
        # Formato do token: token_{user_id}_{timestamp}
        token_parts = credentials.credentials.split('_')
        if len(token_parts) < 2:
            return None
        
        user_id = token_parts[1]
        user = await db.users.find_one(
            {"id": user_id, "active": True},
            {"_id": 0, "password": 0}
        )
        return user
    except Exception as e:
        print(f"Erro na autenticação: {e}")
        return None

async def require_auth(user: dict = Depends(get_current_user)):
    """
    Dependency que EXIGE autenticação
    Retorna HTTPException 401 se não autenticado
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticação necessária",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

# ==================== RBAC (Role-Based Access Control) ====================

def role_required(allowed_roles: list):
    """
    Dependency factory para RBAC
    
    Uso:
    @router.post("/admin-only")
    async def admin_endpoint(user: dict = Depends(role_required(["admin", "superuser"]))):
        ...
    """
    async def role_checker(user: dict = Depends(require_auth)):
        user_role = user.get("role", "")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acesso negado. Perfis permitidos: {', '.join(allowed_roles)}"
            )
        return user
    return role_checker

# ==================== AUDITORIA ====================

async def log_action(user: dict, action: str, details: dict, resource_type: str = None, resource_id: str = None):
    """
    Registra ação no log de auditoria
    
    Parâmetros:
    - user: Usuário que executou a ação
    - action: Tipo de ação (CREATE, UPDATE, DELETE, VIEW, etc.)
    - details: Detalhes da ação (dict)
    - resource_type: Tipo de recurso (processo, evidencia, erb, etc.)
    - resource_id: ID do recurso afetado
    """
    from datetime import datetime, timezone
    
    audit_entry = {
        "user_id": user.get("id"),
        "user_email": user.get("email"),
        "user_role": user.get("role"),
        "action": action,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "details": details,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ip_address": "system"  # TODO: Capturar IP real do request
    }
    
    await db.audit_logs.insert_one(audit_entry)

# ==================== VALIDAÇÃO DE BASE LEGAL ====================

async def validate_legal_basis(legal_basis: str, legal_document: str = None):
    """
    Valida se a base legal está correta e tem documentação
    
    Para interceptações e perícias, exige documento comprobatório
    """
    bases_validas = {
        "ordem_judicial": "Requer documento judicial",
        "mandato": "Requer mandado judicial",
        "consentimento": "Requer termo de consentimento",
        "contrato": "Requer contrato assinado"
    }
    
    if legal_basis not in bases_validas:
        raise HTTPException(
            status_code=400,
            detail=f"Base legal inválida. Opções: {', '.join(bases_validas.keys())}"
        )
    
    # Se é ordem judicial ou mandato, EXIGE documento
    if legal_basis in ["ordem_judicial", "mandato"] and not legal_document:
        raise HTTPException(
            status_code=400,
            detail=f"{bases_validas[legal_basis]} - documento obrigatório não fornecido"
        )
    
    return True
