"""Captura de IP e User-Agent para Audit Trail - Elite Athena"""
from fastapi import Request
from datetime import datetime, timezone
import hashlib


class SessionAudit:
    """Captura completa de sessão para auditoria forense"""
    
    @staticmethod
    def capture_session_data(request: Request) -> dict:
        """Captura dados completos da sessão"""
        
        # IP do cliente
        client_ip = request.client.host if request.client else "unknown"
        
        # Headers relevantes
        user_agent = request.headers.get("user-agent", "unknown")
        accept_language = request.headers.get("accept-language", "unknown")
        referer = request.headers.get("referer", "unknown")
        
        # Fingerprint único
        fingerprint_data = f"{client_ip}:{user_agent}:{accept_language}"
        fingerprint = hashlib.sha256(fingerprint_data.encode()).hexdigest()
        
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ip_address": client_ip,
            "user_agent": user_agent,
            "accept_language": accept_language,
            "referer": referer,
            "device_fingerprint": fingerprint,
            "headers": dict(request.headers)
        }
    
    @staticmethod
    async def log_session(db, user_id: str, action: str, request: Request, metadata: dict = None):
        """Registra evento de sessão com dados completos"""
        
        session_data = SessionAudit.capture_session_data(request)
        
        log_entry = {
            "id": hashlib.sha256(f"{user_id}{datetime.now(timezone.utc).isoformat()}".encode()).hexdigest(),
            "user_id": user_id,
            "action": action,
            "session_data": session_data,
            "metadata": metadata or {},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await db.session_audit.insert_one(log_entry)
        return log_entry
    
    @staticmethod
    async def detect_anomalies(db, user_id: str) -> dict:
        """Detecta anomalias de acesso (IPs diferentes, user-agents suspeitos)"""
        
        # Últimos 10 logins
        recent_logins = await db.session_audit.find(
            {"user_id": user_id, "action": "login"}
        ).sort("timestamp", -1).limit(10).to_list(length=10)
        
        if len(recent_logins) < 2:
            return {"anomalies": [], "risk_score": 0}
        
        # Verificar IPs diferentes
        ips = set()
        user_agents = set()
        
        for login in recent_logins:
            session = login.get("session_data", {})
            ips.add(session.get("ip_address", "unknown"))
            user_agents.add(session.get("user_agent", "unknown"))
        
        anomalies = []
        risk_score = 0
        
        if len(ips) > 3:
            anomalies.append({
                "type": "multiple_ips",
                "severity": "high",
                "description": f"{len(ips)} IPs diferentes nos últimos 10 logins"
            })
            risk_score += 40
        
        if len(user_agents) > 2:
            anomalies.append({
                "type": "multiple_devices",
                "severity": "medium",
                "description": f"{len(user_agents)} dispositivos diferentes"
            })
            risk_score += 20
        
        return {
            "anomalies": anomalies,
            "risk_score": min(risk_score, 100),
            "unique_ips": len(ips),
            "unique_devices": len(user_agents)
        }
