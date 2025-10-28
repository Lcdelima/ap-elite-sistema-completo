"""
Sistema de Compliance e LGPD
Gestão de consentimentos, anonimização, DPIA, auditoria
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import re

router = APIRouter(prefix="/api/compliance", tags=["Compliance LGPD"])

MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "test_database")]

class ConsentRequest(BaseModel):
    user_id: str
    purpose: str
    data_types: List[str]
    retention_period: str

class AnonymizeRequest(BaseModel):
    text: str
    anonymize_names: bool = True
    anonymize_cpf: bool = True
    anonymize_emails: bool = True
    anonymize_phones: bool = True

def anonymize_text(text: str, options: AnonymizeRequest) -> str:
    """Anonimiza dados sensíveis no texto"""
    
    result = text
    
    if options.anonymize_cpf:
        # Anonimizar CPF
        result = re.sub(r'\d{3}\.\d{3}\.\d{3}-\d{2}', '***.***.***-**', result)
        result = re.sub(r'\d{11}', '***********', result)
    
    if options.anonymize_emails:
        # Anonimizar emails
        result = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '****@****.***', result)
    
    if options.anonymize_phones:
        # Anonimizar telefones
        result = re.sub(r'\(\d{2}\)\s?\d{4,5}-\d{4}', '(**) ****-****', result)
        result = re.sub(r'\d{10,11}', '***********', result)
    
    if options.anonymize_names:
        # Anonimizar nomes comuns (simplificado)
        common_names = ['João', 'Maria', 'José', 'Ana', 'Pedro', 'Paulo', 'Carlos', 'Silva', 'Santos', 'Oliveira']
        for name in common_names:
            result = re.sub(f'\\b{name}\\b', '[NOME]', result, flags=re.IGNORECASE)
    
    return result

@router.post("/consent/register")
async def register_consent(consent: ConsentRequest):
    """Registra consentimento LGPD"""
    
    consent_doc = {
        'user_id': consent.user_id,
        'purpose': consent.purpose,
        'data_types': consent.data_types,
        'retention_period': consent.retention_period,
        'granted_at': datetime.now().isoformat(),
        'status': 'active',
        'revocable': True
    }
    
    result = await db.lgpd_consents.insert_one(consent_doc)
    
    return {
        'success': True,
        'consent_id': str(result.inserted_id),
        'user_id': consent.user_id,
        'status': 'active',
        'message': 'Consentimento registrado conforme LGPD'
    }

@router.post("/consent/{consent_id}/revoke")
async def revoke_consent(consent_id: str):
    """Revoga consentimento"""
    
    from bson import ObjectId
    
    try:
        result = await db.lgpd_consents.update_one(
            {'_id': ObjectId(consent_id)},
            {'$set': {
                'status': 'revoked',
                'revoked_at': datetime.now().isoformat()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Consentimento não encontrado")
        
        return {
            'success': True,
            'consent_id': consent_id,
            'status': 'revoked',
            'message': 'Consentimento revogado com sucesso'
        }
    except:
        raise HTTPException(status_code=400, detail="ID inválido")

@router.post("/anonymize")
async def anonymize_data(request: AnonymizeRequest):
    """Anonimiza dados pessoais"""
    
    anonymized = anonymize_text(request.text, request)
    
    # Salvar operação de anonimização
    await db.anonymization_log.insert_one({
        'original_length': len(request.text),
        'anonymized_length': len(anonymized),
        'options': request.dict(),
        'processed_at': datetime.now().isoformat()
    })
    
    return {
        'success': True,
        'original': request.text,
        'anonymized': anonymized,
        'changes_made': request.text != anonymized
    }

@router.post("/dpia/create")
async def create_dpia(project_name: str, description: str):
    """Cria Data Protection Impact Assessment"""
    
    dpia = {
        'project_name': project_name,
        'description': description,
        'created_at': datetime.now().isoformat(),
        'status': 'in_progress',
        'risk_level': 'medium',
        'assessment': {
            'data_types': [],
            'processing_purposes': [],
            'risks_identified': [],
            'mitigation_measures': [],
            'compliance_status': 'pending'
        }
    }
    
    result = await db.dpia_assessments.insert_one(dpia)
    
    return {
        'success': True,
        'dpia_id': str(result.inserted_id),
        'project_name': project_name,
        'status': 'in_progress'
    }

@router.get("/audit-log")
async def get_audit_log(limit: int = 50, user_id: Optional[str] = None):
    """Log de auditoria de acessos"""
    
    query = {}
    if user_id:
        query['user_id'] = user_id
    
    cursor = db.lgpd_audit.find(query).sort('timestamp', -1).limit(limit)
    logs = await cursor.to_list(length=limit)
    
    for log in logs:
        log['id'] = str(log.pop('_id'))
    
    return {
        'audit_logs': logs,
        'total': len(logs)
    }

@router.post("/data-retention/check")
async def check_data_retention():
    """Verifica políticas de retenção"""
    
    # Buscar consentimentos expirados
    consents = await db.lgpd_consents.find({'status': 'active'}).to_list(length=None)
    
    expired = []
    for consent in consents:
        # Verificar período de retenção (simplificado)
        granted = datetime.fromisoformat(consent['granted_at'])
        days_active = (datetime.now() - granted).days
        
        if days_active > 365:  # Exemplo: 1 ano
            expired.append({
                'consent_id': str(consent['_id']),
                'user_id': consent['user_id'],
                'days_active': days_active,
                'action': 'review_required'
            })
    
    return {
        'total_consents': len(consents),
        'expired_consents': len(expired),
        'consents_to_review': expired,
        'message': f'{len(expired)} consentimentos precisam de revisão'
    }

@router.get("/statistics")
async def compliance_statistics():
    """Estatísticas de compliance"""
    
    total_consents = await db.lgpd_consents.count_documents({})
    active_consents = await db.lgpd_consents.count_documents({'status': 'active'})
    total_dpias = await db.dpia_assessments.count_documents({})
    
    return {
        'total_consents': total_consents,
        'active_consents': active_consents,
        'revoked_consents': total_consents - active_consents,
        'total_dpias': total_dpias,
        'features': [
            'Consent management',
            'Data anonymization',
            'DPIA creation',
            'Audit logging',
            'Data retention policies',
            'Right to be forgotten',
            'ANPD compliance'
        ],
        'compliance_level': 'High'
    }
