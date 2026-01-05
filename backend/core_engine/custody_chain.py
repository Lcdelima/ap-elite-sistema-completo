"""
CADEIA DE CUSTÓDIA - Blockchain-like
"""

import json
import hashlib
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, List, Optional


class CustodyChain:
    """Cadeia de custódia imutável"""
    
    def __init__(self, evidence_id: str, chain_dir: Path = Path("/app/backend/evidence/custody")):
        self.evidence_id = evidence_id
        self.chain_dir = chain_dir
        self.chain_dir.mkdir(exist_ok=True, parents=True)
        
        self.chain_file = self.chain_dir / f"{evidence_id}.jsonl"
        self.events = []
        self.last_hash = None
    
    def add_event(self, event_type: str, actor: str, details: Dict):
        """Adiciona evento à cadeia (blockchain-like)"""
        event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "evidence_id": self.evidence_id,
            "event_type": event_type,
            "actor": actor,
            "details": details,
            "prev_hash": self.last_hash,
            "event_hash": ""
        }
        
        # Calcula hash do evento (incluindo hash anterior)
        event["event_hash"] = self._compute_event_hash(event)
        self.last_hash = event["event_hash"]
        
        self.events.append(event)
        
        # Salva em JSONL
        with open(self.chain_file, 'a') as f:
            f.write(json.dumps(event) + '\n')
    
    def verify_integrity(self) -> bool:
        """Verifica integridade da cadeia"""
        if not self.chain_file.exists():
            return True
        
        events = []
        with open(self.chain_file) as f:
            for line in f:
                events.append(json.loads(line.strip()))
        
        # Verifica hashes sequenciais
        for i in range(1, len(events)):
            if events[i]["prev_hash"] != events[i-1]["event_hash"]:
                return False
        
        return True
    
    def _compute_event_hash(self, event: Dict) -> str:
        """Hash SHA-256 do evento"""
        data_to_hash = {
            "timestamp": event["timestamp"],
            "evidence_id": event["evidence_id"],
            "event_type": event["event_type"],
            "actor": event["actor"],
            "details": event["details"],
            "prev_hash": event["prev_hash"]
        }
        raw = json.dumps(data_to_hash, sort_keys=True, ensure_ascii=False).encode('utf-8')
        return hashlib.sha256(raw).hexdigest()
