"""
TEMPLATE BASE DE MOTOR
Todos os motores seguem esta estrutura
"""

import asyncio
from pathlib import Path
from typing import Dict, Any
from datetime import datetime, timezone
import hashlib
import json


class BaseEngine:
    """Template base para todos os motores"""
    
    def __init__(self, module_name: str):
        self.module_name = module_name
        self.evidence_dir = Path(f"/app/backend/evidence/{module_name.replace('/', '_')}")
        self.evidence_dir.mkdir(exist_ok=True, parents=True)
    
    async def execute(self, input_data: Dict, logger) -> Dict[str, Any]:
        """
        Método principal - OBRIGATÓRIO implementar
        """
        raise NotImplementedError("Subclasse deve implementar execute()")
    
    def _generate_hash(self, data: Any) -> str:
        """Gera hash SHA-256"""
        if isinstance(data, dict):
            data = json.dumps(data, sort_keys=True)
        if isinstance(data, str):
            data = data.encode()
        return hashlib.sha256(data).hexdigest()
    
    def _save_artifact(self, filename: str, content: Any) -> Dict:
        """Salva artefato com hash"""
        filepath = self.evidence_dir / filename
        
        if isinstance(content, dict):
            with open(filepath, 'w') as f:
                json.dump(content, f, indent=2)
            content_bytes = json.dumps(content).encode()
        else:
            with open(filepath, 'w') as f:
                f.write(str(content))
            content_bytes = str(content).encode()
        
        file_hash = hashlib.sha256(content_bytes).hexdigest()
        
        return {
            "file": str(filepath),
            "size": len(content_bytes),
            "hash": file_hash
        }
    
    async def _simulate_processing(self, duration: float = 1.0):
        """Simula processamento (para desenvolvimento)"""
        await asyncio.sleep(duration)
