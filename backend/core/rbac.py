"""Sistema RBAC (Role-Based Access Control) - Elite Athena"""
from enum import Enum
from typing import List, Set
from fastapi import HTTPException, Depends
from functools import wraps


class Role(str, Enum):
    ADMIN = "admin"
    PERITO = "perito"
    ADVOGADO = "advogado"
    CLIENTE = "cliente"
    VIEWER = "viewer"


class Permission(str, Enum):
    # Advocacia
    VIEW_PROCESSOS = "view_processos"
    EDIT_PROCESSOS = "edit_processos"
    DELETE_PROCESSOS = "delete_processos"
    
    # Perícia
    VIEW_EVIDENCIAS = "view_evidencias"
    UPLOAD_EVIDENCIAS = "upload_evidencias"
    ANALYZE_EVIDENCIAS = "analyze_evidencias"
    
    # Admin
    MANAGE_USERS = "manage_users"
    VIEW_FINANCEIRO = "view_financeiro"
    MANAGE_BILLING = "manage_billing"
    
    # Comunicação
    SEND_MESSAGES = "send_messages"
    VIEW_MESSAGES = "view_messages"
    
    # Diversos
    USE_CALCULADORAS = "use_calculadoras"
    GENERATE_REPORTS = "generate_reports"


# Mapeamento de permissões por role
ROLE_PERMISSIONS: dict[Role, Set[Permission]] = {
    Role.ADMIN: {  # Admin tem TUDO
        Permission.VIEW_PROCESSOS,
        Permission.EDIT_PROCESSOS,
        Permission.DELETE_PROCESSOS,
        Permission.VIEW_EVIDENCIAS,
        Permission.UPLOAD_EVIDENCIAS,
        Permission.ANALYZE_EVIDENCIAS,
        Permission.MANAGE_USERS,
        Permission.VIEW_FINANCEIRO,
        Permission.MANAGE_BILLING,
        Permission.SEND_MESSAGES,
        Permission.VIEW_MESSAGES,
        Permission.USE_CALCULADORAS,
        Permission.GENERATE_REPORTS
    },
    
    Role.PERITO: {
        Permission.VIEW_EVIDENCIAS,
        Permission.UPLOAD_EVIDENCIAS,
        Permission.ANALYZE_EVIDENCIAS,
        Permission.VIEW_PROCESSOS,
        Permission.USE_CALCULADORAS,
        Permission.GENERATE_REPORTS,
        Permission.SEND_MESSAGES,
        Permission.VIEW_MESSAGES
    },
    
    Role.ADVOGADO: {
        Permission.VIEW_PROCESSOS,
        Permission.EDIT_PROCESSOS,
        Permission.VIEW_EVIDENCIAS,
        Permission.USE_CALCULADORAS,
        Permission.GENERATE_REPORTS,
        Permission.SEND_MESSAGES,
        Permission.VIEW_MESSAGES
    },
    
    Role.CLIENTE: {
        Permission.VIEW_PROCESSOS,  # Apenas visualização
        Permission.VIEW_EVIDENCIAS,
        Permission.VIEW_MESSAGES,
        Permission.SEND_MESSAGES  # Pode enviar mensagens
    },
    
    Role.VIEWER: {
        Permission.VIEW_PROCESSOS,
        Permission.VIEW_EVIDENCIAS,
        Permission.VIEW_MESSAGES
    }
}


def has_permission(user_role: Role, required_permission: Permission) -> bool:
    """Verifica se role tem permissão"""
    return required_permission in ROLE_PERMISSIONS.get(user_role, set())


def require_permission(required: Permission):
    """Decorator para proteger endpoints"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # TODO: Pegar usuário do contexto (request.state.user)
            # Por enquanto, mock
            user_role = Role.ADMIN  # Mock
            
            if not has_permission(user_role, required):
                raise HTTPException(
                    status_code=403,
                    detail=f"Permissão '{required.value}' necessária"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_role(required: Role):
    """Decorator para exigir role específica"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user_role = Role.ADMIN  # Mock
            
            if user_role != required and user_role != Role.ADMIN:
                raise HTTPException(
                    status_code=403,
                    detail=f"Role '{required.value}' necessária"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
