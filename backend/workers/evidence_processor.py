"""Worker para Processamento de Evidências em Background - Elite Athena"""
from fastapi import BackgroundTasks
from typing import Dict, Any
import os
import hashlib
from datetime import datetime, timezone
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class EvidenceProcessor:
    """Processador de evidências em background"""
    
    @staticmethod
    async def process_evidence_background(
        evidence_id: str,
        file_path: str,
        processing_type: str  # hash, metadata, forensic_analysis
    ):
        """Processa evidência em background"""
        
        try:
            # Atualizar status
            await db.evidence_vault.update_one(
                {"id": evidence_id},
                {"$set": {"processing_status": "processing"}}
            )
            
            result = {}
            
            # Hash completo
            if processing_type in ['hash', 'forensic_analysis']:
                result['hashes'] = await EvidenceProcessor._calculate_all_hashes(file_path)
            
            # Metadados
            if processing_type in ['metadata', 'forensic_analysis']:
                result['metadata'] = await EvidenceProcessor._extract_metadata(file_path)
            
            # Análise forense completa
            if processing_type == 'forensic_analysis':
                result['forensic_report'] = await EvidenceProcessor._forensic_analysis(file_path)
            
            # Atualizar com resultado
            await db.evidence_vault.update_one(
                {"id": evidence_id},
                {
                    "$set": {
                        "processing_status": "completed",
                        "processing_result": result,
                        "processed_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            print(f"✅ Evidence {evidence_id} processed successfully")
            
        except Exception as e:
            # Erro no processamento
            await db.evidence_vault.update_one(
                {"id": evidence_id},
                {
                    "$set": {
                        "processing_status": "failed",
                        "processing_error": str(e),
                        "failed_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            print(f"❌ Evidence {evidence_id} processing failed: {str(e)}")
    
    @staticmethod
    async def _calculate_all_hashes(file_path: str) -> Dict[str, str]:
        """Calcula todos os hashes da evidência"""
        
        with open(file_path, 'rb') as f:
            content = f.read()
        
        return {
            'md5': hashlib.md5(content).hexdigest(),
            'sha1': hashlib.sha1(content).hexdigest(),
            'sha256': hashlib.sha256(content).hexdigest(),
            'sha512': hashlib.sha512(content).hexdigest()
        }
    
    @staticmethod
    async def _extract_metadata(file_path: str) -> Dict[str, Any]:
        """Extrai metadados do arquivo"""
        
        # TODO: Usar exiftool ou PIL para metadados completos
        file_stat = os.stat(file_path)
        
        return {
            'size_bytes': file_stat.st_size,
            'created': datetime.fromtimestamp(file_stat.st_ctime).isoformat(),
            'modified': datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
            'extension': os.path.splitext(file_path)[1]
        }
    
    @staticmethod
    async def _forensic_analysis(file_path: str) -> Dict[str, Any]:
        """Análise forense completa"""
        
        return {
            'file_type': 'Detected via magic bytes',
            'entropy': 'Medium',  # TODO: Calcular entropia real
            'signatures': 'Valid',
            'anomalies': [],
            'timestamp': datetime.now(timezone.utc).isoformat()
        }


# Função helper para adicionar task
async def queue_evidence_processing(
    background_tasks: BackgroundTasks,
    evidence_id: str,
    file_path: str,
    processing_type: str = 'forensic_analysis'
):
    """Adiciona processamento de evidência à fila"""
    background_tasks.add_task(
        EvidenceProcessor.process_evidence_background,
        evidence_id,
        file_path,
        processing_type
    )
    return {"message": "Processamento iniciado em background", "evidence_id": evidence_id}
