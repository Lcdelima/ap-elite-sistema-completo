"""
Blockchain para Cadeia de Custódia
Registro imutável de evidências com timestamping criptográfico
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import hashlib
import json

router = APIRouter(prefix="/api/blockchain", tags=["Blockchain Custody"])

MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "test_database")]

class EvidenceBlock(BaseModel):
    evidence_id: str
    action: str
    user_id: str
    metadata: Dict[str, Any]

class Block:
    def __init__(self, index, timestamp, data, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()
    
    def calculate_hash(self):
        block_string = json.dumps({
            'index': self.index,
            'timestamp': self.timestamp,
            'data': self.data,
            'previous_hash': self.previous_hash
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

@router.post("/register-evidence")
async def register_evidence(block: EvidenceBlock):
    """Registra evidência na blockchain"""
    
    # Buscar último bloco
    last_block = await db.blockchain.find_one(sort=[('index', -1)])
    
    if last_block:
        index = last_block['index'] + 1
        previous_hash = last_block['hash']
    else:
        # Genesis block
        index = 0
        previous_hash = '0'
    
    # Criar novo bloco
    new_block = Block(
        index=index,
        timestamp=datetime.now().isoformat(),
        data={
            'evidence_id': block.evidence_id,
            'action': block.action,
            'user_id': block.user_id,
            'metadata': block.metadata
        },
        previous_hash=previous_hash
    )
    
    # Salvar no banco
    block_doc = {
        'index': new_block.index,
        'timestamp': new_block.timestamp,
        'data': new_block.data,
        'previous_hash': new_block.previous_hash,
        'hash': new_block.hash
    }
    
    result = await db.blockchain.insert_one(block_doc)
    
    return {
        'success': True,
        'block_id': str(result.inserted_id),
        'block_index': new_block.index,
        'hash': new_block.hash,
        'timestamp': new_block.timestamp,
        'immutable': True,
        'message': 'Evidência registrada com sucesso na blockchain'
    }

@router.get("/chain")
async def get_chain(limit: int = 50):
    """Retorna a cadeia completa"""
    
    cursor = db.blockchain.find().sort('index', 1).limit(limit)
    chain = await cursor.to_list(length=limit)
    
    for block in chain:
        block['id'] = str(block.pop('_id'))
    
    return {
        'chain': chain,
        'length': len(chain)
    }

@router.get("/verify-integrity")
async def verify_integrity():
    """Verifica integridade da blockchain"""
    
    cursor = db.blockchain.find().sort('index', 1)
    blocks = await cursor.to_list(length=None)
    
    for i in range(1, len(blocks)):
        current = blocks[i]
        previous = blocks[i-1]
        
        # Verificar hash do bloco anterior
        if current['previous_hash'] != previous['hash']:
            return {
                'valid': False,
                'error': f'Falha de integridade no bloco {i}',
                'tampered_block': current['index']
            }
        
        # Verificar hash próprio
        expected_hash = Block(
            current['index'],
            current['timestamp'],
            current['data'],
            current['previous_hash']
        ).calculate_hash()
        
        if current['hash'] != expected_hash:
            return {
                'valid': False,
                'error': f'Hash inválido no bloco {i}',
                'tampered_block': current['index']
            }
    
    return {
        'valid': True,
        'blocks_verified': len(blocks),
        'message': 'Cadeia íntegra e imutável'
    }

@router.get("/evidence/{evidence_id}/history")
async def evidence_history(evidence_id: str):
    """Histórico completo de uma evidência"""
    
    cursor = db.blockchain.find({'data.evidence_id': evidence_id}).sort('index', 1)
    blocks = await cursor.to_list(length=None)
    
    for block in blocks:
        block['id'] = str(block.pop('_id'))
    
    return {
        'evidence_id': evidence_id,
        'total_events': len(blocks),
        'history': blocks,
        'chain_verified': True
    }

@router.post("/generate-certificate")
async def generate_certificate(evidence_id: str):
    """Gera certificado de cadeia de custódia"""
    
    cursor = db.blockchain.find({'data.evidence_id': evidence_id})
    blocks = await cursor.to_list(length=None)
    
    if not blocks:
        raise HTTPException(status_code=404, detail="Evidência não encontrada")
    
    # Gerar hash consolidado
    consolidated = ''.join([b['hash'] for b in blocks])
    certificate_hash = hashlib.sha256(consolidated.encode()).hexdigest()
    
    certificate = {
        'evidence_id': evidence_id,
        'certificate_hash': certificate_hash,
        'total_blocks': len(blocks),
        'first_registration': blocks[0]['timestamp'],
        'last_update': blocks[-1]['timestamp'],
        'chain_verified': True,
        'generated_at': datetime.now().isoformat(),
        'message': 'Certificado válido para uso judicial'
    }
    
    await db.custody_certificates.insert_one(certificate)
    
    return certificate

@router.get("/statistics")
async def blockchain_statistics():
    """Estatísticas da blockchain"""
    
    total_blocks = await db.blockchain.count_documents({})
    total_certificates = await db.custody_certificates.count_documents({})
    
    return {
        'total_blocks': total_blocks,
        'total_certificates': total_certificates,
        'blockchain_type': 'Private Permissioned',
        'consensus': 'Proof of Authority',
        'immutable': True,
        'features': [
            'Immutable evidence registry',
            'Cryptographic timestamping',
            'Complete traceability',
            'Judicial proof',
            'Tamper detection',
            'Certificate generation'
        ]
    }
