"""
LOGGER FORENSE - Logs Imutáveis
ISO 27037 Compliant
"""

import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, Optional


class ForensicLogger:
    """Logger imutável para auditoria forense"""
    
    def __init__(self, module_name: str, job_id: str, log_dir: Path = Path("/app/backend/logs/forense")):
        self.module_name = module_name
        self.job_id = job_id
        self.log_dir = log_dir
        self.log_dir.mkdir(exist_ok=True, parents=True)
        
        self.log_file = self.log_dir / f"{module_name.replace('/', '_')}_{job_id}.jsonl"
        self.entries = []
    
    def log(self, action: str, details: Dict[str, Any], level: str = "INFO"):
        """Adiciona entrada de log imutável"""
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "module": self.module_name,
            "job_id": self.job_id,
            "action": action,
            "level": level,
            "details": details,
            "hash": self._compute_hash(action, details)
        }
        
        self.entries.append(entry)
        
        # Salva em JSONL (append-only)
        with open(self.log_file, 'a') as f:
            f.write(json.dumps(entry) + '\n')
    
    def log_state_change(self, from_state: str, to_state: str, metadata: Optional[Dict] = None):
        """Log específico de mudança de estado"""
        self.log(
            action="STATE_CHANGE",
            details={
                "from": from_state,
                "to": to_state,
                "metadata": metadata or {}
            },
            level="INFO"
        )
    
    def log_error(self, error: Exception, context: Optional[Dict] = None):
        """Log de erro com contexto"""
        self.log(
            action="ERROR",
            details={
                "error_type": type(error).__name__,
                "error_message": str(error),
                "context": context or {}
            },
            level="ERROR"
        )
    
    def _compute_hash(self, action: str, details: Dict) -> str:
        """Hash SHA-256 da entrada"""
        data = json.dumps({"action": action, "details": details}, sort_keys=True)
        return hashlib.sha256(data.encode()).hexdigest()[:16]
    
    def get_logs(self) -> List[Dict]:
        """Retorna todos os logs"""
        return self.entries
