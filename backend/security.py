"""Segurança central da Elite Intelligence 360.

Responsável por hashing, JWT estável, RBAC e dependências de autorização.
A chave JWT deve ser definida em ``JWT_SECRET_KEY`` no ambiente de produção.
"""
from __future__ import annotations

import logging
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import jwt
from fastapi import Depends, Header, HTTPException
from passlib.context import CryptContext

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
JWT_REFRESH_TOKEN_EXPIRE_DAYS = int(os.environ.get("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7"))
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or os.environ.get("SECRET_KEY")

if not JWT_SECRET_KEY:
    JWT_SECRET_KEY = "elite-intelligence-360-development-key-change-in-production"
    logger.warning("JWT_SECRET_KEY não configurada; usando chave estável de desenvolvimento")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "jti": str(uuid.uuid4()), "type": "access"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_refresh_token(data: Dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "jti": str(uuid.uuid4()), "type": "refresh"})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, jwt.PyJWTError):
        return None


def generate_token() -> str:
    """Compatibilidade com fluxos legados; novos fluxos devem usar JWT."""
    return f"token_{uuid.uuid4().hex}_{secrets.token_urlsafe(32)}"


def validate_password_strength(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return False, "Senha deve ter no mínimo 8 caracteres"
    if not any(c.isupper() for c in password):
        return False, "Senha deve conter pelo menos uma letra maiúscula"
    if not any(c.islower() for c in password):
        return False, "Senha deve conter pelo menos uma letra minúscula"
    if not any(c.isdigit() for c in password):
        return False, "Senha deve conter pelo menos um número"
    return True, "Senha forte"


ROLES = {
    "super_admin": {
        "name": "Super Administrador",
        "permissions": ["*"],
    },
    "administrator": {
        "name": "Administrador",
        "permissions": [
            "cases.*", "users.create", "users.read", "users.update",
            "forensics.*", "evidence.*", "reports.*", "documents.*",
            "site.*", "content.*", "media.*", "seo.*", "navigation.*",
        ],
    },
    "editor": {
        "name": "Editor de Conteúdo",
        "permissions": [
            "site.read", "site.preview", "content.*", "media.*",
            "seo.read", "seo.update", "navigation.read", "navigation.update",
        ],
    },
    "perito": {
        "name": "Perito Forense",
        "permissions": ["forensics.*", "evidence.*", "reports.create", "reports.read"],
    },
    "advogado": {
        "name": "Advogado",
        "permissions": ["cases.read", "cases.update", "documents.*", "processes.*"],
    },
    "cliente": {
        "name": "Cliente",
        "permissions": ["cases.read", "documents.read", "reports.read"],
    },
    "client": {
        "name": "Cliente",
        "permissions": ["cases.read", "documents.read", "reports.read"],
    },
    "aluno": {
        "name": "Aluno",
        "permissions": ["academy.read", "academy.activities", "academy.community"],
    },
    "auditor": {
        "name": "Auditor",
        "permissions": ["audit.*", "compliance.*", "reports.read", "site.read"],
    },
}


def check_permission(user_role: str, permission: str) -> bool:
    role_data = ROLES.get(user_role)
    if not role_data:
        return False
    permissions = role_data["permissions"]
    if "*" in permissions or permission in permissions:
        return True
    resource = permission.split(".")[0]
    return f"{resource}.*" in permissions


async def get_current_user(authorization: str = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Token de autenticação não fornecido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = verify_token(authorization.replace("Bearer ", ""))
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


def require_role(required_roles: list[str]):
    async def role_checker(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        if user.get("role") not in required_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Acesso negado. Requer um dos papéis: {', '.join(required_roles)}",
            )
        return user

    return role_checker


def require_permission(permission: str):
    async def permission_checker(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        if not check_permission(user.get("role", ""), permission):
            raise HTTPException(status_code=403, detail=f"Permissão negada: {permission}")
        return user

    return permission_checker
