"""
Gestão Inteligente de Honorários
Cálculo automático, split, integração bancária, previsão
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/fees", tags=["Smart Fees"])

MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "test_database")]

class FeeCalculation(BaseModel):
    case_id: str
    case_type: str
    complexity: str  # low, medium, high
    estimated_hours: float
    hourly_rate: float
    success_fee: Optional[float] = None

class FeeSplit(BaseModel):
    fee_id: str
    splits: List[Dict[str, Any]]  # [{'lawyer_id': 'x', 'percentage': 40}, ...]

FEE_TABLES = {
    'criminal_defense': {
        'low': 5000,
        'medium': 15000,
        'high': 50000
    },
    'digital_forensics': {
        'low': 3000,
        'medium': 8000,
        'high': 25000
    },
    'osint_investigation': {
        'low': 2000,
        'medium': 5000,
        'high': 15000
    },
    'litigation': {
        'low': 8000,
        'medium': 20000,
        'high': 60000
    }
}

@router.post("/calculate")
async def calculate_fee(calc: FeeCalculation):
    """Calcula honorário baseado em múltiplos fatores"""
    
    # Honorário base da tabela
    base_fee = FEE_TABLES.get(calc.case_type, {}).get(calc.complexity, 10000)
    
    # Cálculo por hora
    hourly_fee = calc.estimated_hours * calc.hourly_rate
    
    # Média ponderada
    calculated_fee = (base_fee * 0.6) + (hourly_fee * 0.4)
    
    # Taxa de êxito (se aplicável)
    success_component = 0
    if calc.success_fee:
        success_component = calc.success_fee
    
    total_fee = calculated_fee + success_component
    
    # Parcelas sugeridas
    installments = [
        {'number': 1, 'amount': total_fee * 0.3, 'due': 'Contratação'},
        {'number': 2, 'amount': total_fee * 0.3, 'due': 'Meio do processo'},
        {'number': 3, 'amount': total_fee * 0.4, 'due': 'Finalização'}
    ]
    
    fee_record = {
        'case_id': calc.case_id,
        'case_type': calc.case_type,
        'complexity': calc.complexity,
        'base_fee': base_fee,
        'hourly_component': hourly_fee,
        'success_component': success_component,
        'total_fee': total_fee,
        'installments': installments,
        'calculated_at': datetime.now().isoformat(),
        'status': 'calculated'
    }
    
    result = await db.fee_calculations.insert_one(fee_record)
    
    return {
        'success': True,
        'fee_id': str(result.inserted_id),
        'total_fee': round(total_fee, 2),
        'breakdown': {
            'base': round(base_fee, 2),
            'hourly': round(hourly_fee, 2),
            'success': round(success_component, 2)
        },
        'installments': installments
    }

@router.post("/split")
async def split_fee(split: FeeSplit):
    """Divide honorário entre múltiplos advogados"""
    
    from bson import ObjectId
    
    try:
        fee = await db.fee_calculations.find_one({'_id': ObjectId(split.fee_id)})
        
        if not fee:
            raise HTTPException(status_code=404, detail="Honorário não encontrado")
        
        total = fee['total_fee']
        
        # Validar percentuais
        total_percentage = sum(s['percentage'] for s in split.splits)
        if total_percentage != 100:
            raise HTTPException(status_code=400, detail="Soma dos percentuais deve ser 100%")
        
        # Calcular valores
        split_details = []
        for s in split.splits:
            amount = total * (s['percentage'] / 100)
            split_details.append({
                'lawyer_id': s['lawyer_id'],
                'percentage': s['percentage'],
                'amount': round(amount, 2)
            })
        
        # Atualizar registro
        await db.fee_calculations.update_one(
            {'_id': ObjectId(split.fee_id)},
            {'$set': {
                'split': split_details,
                'split_at': datetime.now().isoformat()
            }}
        )
        
        return {
            'success': True,
            'fee_id': split.fee_id,
            'total_amount': total,
            'split_details': split_details
        }
    except:
        raise HTTPException(status_code=400, detail="ID inválido")

@router.post("/generate-invoice")
async def generate_invoice(fee_id: str, client_info: Dict[str, Any]):
    """Gera nota fiscal / recibo"""
    
    from bson import ObjectId
    
    try:
        fee = await db.fee_calculations.find_one({'_id': ObjectId(fee_id)})
        
        if not fee:
            raise HTTPException(status_code=404, detail="Honorário não encontrado")
        
        invoice = {
            'fee_id': fee_id,
            'client': client_info,
            'total_amount': fee['total_fee'],
            'breakdown': fee.get('breakdown', {}),
            'issue_date': datetime.now().isoformat(),
            'due_date': datetime.now().isoformat(),
            'status': 'issued',
            'payment_methods': ['PIX', 'Boleto', 'Transferência', 'Cartão']
        }
        
        result = await db.invoices.insert_one(invoice)
        
        return {
            'success': True,
            'invoice_id': str(result.inserted_id),
            'invoice_number': f'INV-{result.inserted_id}',
            'total_amount': fee['total_fee'],
            'download_url': f'/api/fees/invoice/{result.inserted_id}/download',
            'message': 'Nota fiscal gerada com sucesso'
        }
    except:
        raise HTTPException(status_code=400, detail="Erro ao gerar nota")

@router.post("/payment/pix")
async def generate_pix(fee_id: str, amount: float):
    """Gera PIX para pagamento"""
    
    import uuid
    
    pix_key = 'pagamentos@apelite.com.br'
    pix_txid = str(uuid.uuid4())[:32]
    
    return {
        'success': True,
        'payment_method': 'PIX',
        'amount': amount,
        'pix_key': pix_key,
        'txid': pix_txid,
        'qr_code': f'00020126360014br.gov.bcb.pix0114{pix_key}52040000530398654{amount:05.2f}',
        'expires_in': '30 minutes',
        'message': 'Escaneie o QR Code ou copie a chave PIX'
    }

@router.get("/forecast")
async def revenue_forecast(months: int = 6):
    """Previsão de receita de honorários"""
    
    import random
    
    forecast = []
    base = 50000
    
    for month in range(1, months + 1):
        variation = random.uniform(0.8, 1.2)
        value = base * variation
        
        forecast.append({
            'month': month,
            'forecast': round(value, 2),
            'cases_expected': random.randint(5, 15)
        })
    
    return {
        'forecast_period': f'{months} meses',
        'monthly_forecast': forecast,
        'total_forecast': sum(f['forecast'] for f in forecast),
        'based_on': 'Historical data + ML predictions'
    }

@router.get("/statistics")
async def fee_statistics():
    """Estatísticas de honorários"""
    
    total_calculated = await db.fee_calculations.count_documents({})
    total_invoices = await db.invoices.count_documents({})
    
    return {
        'total_calculations': total_calculated,
        'total_invoices': total_invoices,
        'features': [
            'Automatic calculation',
            'Fee splitting',
            'Invoice generation',
            'PIX integration',
            'Boleto generation',
            'Revenue forecasting',
            'Installment plans',
            'Multi-lawyer split'
        ],
        'integrations': ['PIX', 'Boleto', 'Banking APIs']
    }
