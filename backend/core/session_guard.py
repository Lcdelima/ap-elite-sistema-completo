"""Session Concurrency Guard - Previne login duplicado - Elite Athena"""
from datetime import datetime, timezone, timedelta
from typing import Optional
import hashlib
import json
from fastapi import Request, HTTPException


class SessionGuard:
    """Guarda de sessão concorrente"""
    
    def __init__(self, redis_client, db):
        self.redis = redis_client
        self.db = db
        self.session_ttl = 86400  # 24 horas
    
    def generate_device_fingerprint(self, request: Request) -> str:
        """Gera fingerprint único do dispositivo"""
        # Coleta informações do request
        user_agent = request.headers.get("user-agent", "")
        ip_address = request.client.host if request.client else "unknown"
        accept_language = request.headers.get("accept-language", "")
        
        # Cria hash único
        fingerprint_data = f"{ip_address}:{user_agent}:{accept_language}"
        fingerprint = hashlib.sha256(fingerprint_data.encode()).hexdigest()
        
        return fingerprint
    
    async def check_concurrent_session(self, user_id: str, device_fingerprint: str) -> bool:
        """Verifica se há sessão ativa de outro dispositivo"""
        # Busca sessão ativa no Redis
        active_session = await self.redis.get(f"session:{user_id}")
        
        if not active_session:
            # Nenhuma sessão ativa, permitir
            return True
        
        active_session = active_session.decode("utf-8")
        
        if active_session == device_fingerprint:
            # Mesmo dispositivo, permitir
            return True
        
        # Dispositivo diferente, bloquear
        return False
    
    async def create_session(self, user_id: str, device_fingerprint: str) -> None:
        """Cria nova sessão no Redis"""
        await self.redis.setex(
            f"session:{user_id}",
            self.session_ttl,
            device_fingerprint
        )
        
        # Log de auditoria
        await self.log_session_event(user_id, device_fingerprint, "login")
    
    async def destroy_session(self, user_id: str) -> None:
        """Destroi sessão ativa"""
        await self.redis.delete(f"session:{user_id}")
        await self.log_session_event(user_id, "unknown", "logout")
    
    async def lock_account(self, user_id: str, reason: str = "concurrent_session") -> None:
        """Bloqueia conta por violação de sessão"""
        # Marca usuário como bloqueado
        await self.db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "locked": True,
                    "locked_at": datetime.now(timezone.utc).isoformat(),
                    "lock_reason": reason
                }
            }
        )
        
        # Destroi sessão
        await self.destroy_session(user_id)
        
        # Log de auditoria
        await self.log_session_event(user_id, "unknown", "account_locked", {"reason": reason})
    
    async def unlock_account(self, user_id: str) -> None:
        """Desbloqueia conta (manual ou após validação)"""
        await self.db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "locked": False,
                    "locked_at": None,
                    "lock_reason": None
                }
            }
        )
        
        await self.log_session_event(user_id, "unknown", "account_unlocked")
    
    async def log_session_event(self, user_id: str, device_fingerprint: str, event_type: str, metadata: dict = None) -> None:
        """Registra evento de sessão para auditoria"""
        log_entry = {
            "id": hashlib.sha256(f"{user_id}{datetime.now(timezone.utc).isoformat()}".encode()).hexdigest(),
            "user_id": user_id,
            "device_fingerprint": device_fingerprint,
            "event_type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata or {}
        }
        
        await self.db.session_logs.insert_one(log_entry)
    
    async def get_session_history(self, user_id: str, limit: int = 50) -> list:
        """Retorna histórico de sessões do usuário"""
        logs = await self.db.session_logs.find(
            {"user_id": user_id}
        ).sort("timestamp", -1).limit(limit).to_list(length=limit)
        
        return logs
