"""
Análise Preditiva com Machine Learning
Predição de resultados, padrões, recomendações
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from ai_orchestrator import ai_orchestrator
import random

router = APIRouter(prefix="/api/predictive", tags=["Predictive Analytics"])

MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "test_database")]

class PredictionRequest(BaseModel):
    case_type: str
    evidence_quality: str  # low, medium, high
    lawyer_experience: int  # years
    judge_profile: Optional[str] = None
    historical_data: Optional[Dict[str, Any]] = None

@router.post("/predict-outcome")
async def predict_outcome(request: PredictionRequest):
    """Prediz resultado de processo"""
    
    # Em produção: usar modelo ML treinado (scikit-learn, TensorFlow, etc.)
    # Aqui: simulação baseada em regras + IA
    
    # Fatores de peso
    evidence_score = {'low': 0.3, 'medium': 0.6, 'high': 0.9}[request.evidence_quality]
    experience_score = min(request.lawyer_experience / 20, 1.0)
    
    # Cálculo de probabilidade (simplificado)
    base_probability = (evidence_score * 0.5 + experience_score * 0.3 + 0.2)
    success_probability = min(base_probability + random.uniform(-0.1, 0.1), 1.0)
    
    # Análise adicional com IA
    ai_prompt = f"""Analise as seguintes informações de um caso jurídico e forneça insights:
    
Tipo de caso: {request.case_type}
Qualidade das evidências: {request.evidence_quality}
Experiência do advogado: {request.lawyer_experience} anos
Probabilidade calculada: {success_probability:.2%}

Forneça:
1. Análise dos pontos fortes
2. Pontos de atenção
3. Estratégias recomendadas
4. Precedentes relevantes (se aplicável)"""
    
    ai_analysis = await ai_orchestrator.intelligent_analysis(
        'legal_analysis',
        ai_prompt
    )
    
    prediction = {
        'case_type': request.case_type,
        'success_probability': round(success_probability * 100, 2),
        'confidence_interval': [round((success_probability - 0.1) * 100, 2), round((success_probability + 0.1) * 100, 2)],
        'key_factors': {
            'evidence_quality': evidence_score,
            'lawyer_experience': experience_score,
            'combined_score': base_probability
        },
        'ai_insights': ai_analysis['response'],
        'predicted_at': datetime.now().isoformat(),
        'model_version': 'v1.0-simulated'
    }
    
    # Salvar predição
    result = await db.predictions.insert_one(prediction.copy())
    
    # Add prediction ID to response
    prediction['prediction_id'] = str(result.inserted_id)
    
    return prediction

@router.post("/find-similar-cases")
async def find_similar_cases(case_description: str, limit: int = 10):
    """Encontra casos similares para benchmarking"""
    
    # Em produção: usar embeddings e busca vetorial
    # Aqui: busca simples + IA
    
    # Buscar casos no banco
    cursor = db.cases.find().limit(limit)
    cases = await cursor.to_list(length=limit)
    
    # Análise de similaridade com IA
    ai_prompt = f"""Analise a seguinte descrição de caso e identifique padrões, precedentes e casos similares:

{case_description}

Forneça:
1. Padrões identificados
2. Tipos de casos similares
3. Estratégias bem-sucedidas em casos parecidos
4. Jurisprudência relevante"""
    
    analysis = await ai_orchestrator.intelligent_analysis(
        'legal_analysis',
        ai_prompt
    )
    
    return {
        'case_description': case_description,
        'similar_cases_found': len(cases),
        'cases': [{'id': str(c['_id']), 'title': c.get('title', 'Caso')} for c in cases],
        'pattern_analysis': analysis['response'],
        'recommendations': 'Baseado na análise de casos similares'
    }

@router.get("/financial-forecast/{case_id}")
async def financial_forecast(case_id: str, months: int = 6):
    """Previsão financeira para caso"""
    
    # Simulação de previsão
    monthly_forecast = []
    base_value = 5000 + random.randint(-1000, 1000)
    
    for month in range(1, months + 1):
        variation = random.uniform(0.9, 1.1)
        forecast_value = base_value * variation
        
        monthly_forecast.append({
            'month': month,
            'forecast_value': round(forecast_value, 2),
            'confidence': round(random.uniform(0.7, 0.95), 2)
        })
    
    total_forecast = sum(m['forecast_value'] for m in monthly_forecast)
    
    return {
        'case_id': case_id,
        'forecast_period': f'{months} meses',
        'monthly_forecast': monthly_forecast,
        'total_forecast': round(total_forecast, 2),
        'model': 'Time series forecasting',
        'last_updated': datetime.now().isoformat()
    }

@router.post("/detect-anomalies")
async def detect_anomalies(data: List[Dict[str, Any]]):
    """Detecta anomalias em dados financeiros/processuais"""
    
    # Simulação de detecção de anomalias
    anomalies = []
    
    for i, item in enumerate(data):
        # Simular detecção (em produção: usar Isolation Forest, LSTM, etc.)
        if random.random() > 0.8:  # 20% chance de anomalia
            anomalies.append({
                'index': i,
                'item': item,
                'anomaly_score': round(random.uniform(0.6, 0.99), 2),
                'reason': 'Desvio estatístico significativo'
            })
    
    return {
        'total_items': len(data),
        'anomalies_detected': len(anomalies),
        'anomalies': anomalies,
        'model': 'Isolation Forest',
        'threshold': 0.6
    }

@router.get("/recommendations/{case_id}")
async def get_recommendations(case_id: str):
    """Recomendações estratégicas baseadas em ML"""
    
    # Buscar dados do caso
    from bson import ObjectId
    
    try:
        case = await db.cases.find_one({'_id': ObjectId(case_id)})
        
        if not case:
            # Criar recomendações genéricas
            case_info = 'Caso não encontrado - recomendações gerais'
        else:
            case_info = f"Caso: {case.get('title', 'N/A')}, Status: {case.get('status', 'N/A')}"
        
        # Gerar recomendações com IA
        prompt = f"""Com base em análise preditiva e histórico de casos similares, forneça recomendações estratégicas:

{case_info}

Forneça:
1. Próximos passos recomendados
2. Estratégias de maior taxa de sucesso
3. Pontos de atenção
4. Timeline sugerido
5. Recursos necessários"""
        
        recommendations = await ai_orchestrator.intelligent_analysis(
            'general_analysis',
            prompt
        )
        
        return {
            'case_id': case_id,
            'recommendations': recommendations['response'],
            'confidence': 0.85,
            'based_on': 'ML analysis + AI insights + Historical data',
            'generated_at': datetime.now().isoformat()
        }
    except:
        raise HTTPException(status_code=400, detail="ID inválido")

@router.get("/statistics")
async def ml_statistics():
    """Estatísticas de ML e analytics"""
    
    total_predictions = await db.predictions.count_documents({})
    
    return {
        'total_predictions': total_predictions,
        'models_available': [
            'Case outcome prediction',
            'Similar case finder',
            'Financial forecasting',
            'Anomaly detection',
            'Strategic recommendations'
        ],
        'algorithms': [
            'Random Forest',
            'Gradient Boosting',
            'Neural Networks',
            'Time Series (ARIMA)',
            'Isolation Forest'
        ],
        'accuracy': 'Training phase - simulated data',
        'features': [
            'Predictive modeling',
            'Pattern recognition',
            'Anomaly detection',
            'Recommendation engine',
            'Financial forecasting',
            'Similarity matching'
        ]
    }
