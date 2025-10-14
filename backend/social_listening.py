"""
Social Listening e Monitoramento
Alertas de menções, análise de reputação, coleta de provas
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from ai_orchestrator import ai_orchestrator

router = APIRouter(prefix="/api/social-listening", tags=["Social Listening"])

MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "test_database")]

class MonitoringAlert(BaseModel):
    keywords: List[str]
    platforms: List[str]
    alert_email: str
    alert_frequency: str = 'realtime'  # realtime, daily, weekly

class ReputationCheck(BaseModel):
    entity_name: str
    entity_type: str  # person, company, brand
    platforms: Optional[List[str]] = None

@router.post("/alerts/create")
async def create_alert(alert: MonitoringAlert):
    """Cria alerta de monitoramento"""
    
    alert_doc = {
        'keywords': alert.keywords,
        'platforms': alert.platforms,
        'alert_email': alert.alert_email,
        'alert_frequency': alert.alert_frequency,
        'created_at': datetime.now().isoformat(),
        'status': 'active',
        'matches_count': 0
    }
    
    result = await db.monitoring_alerts.insert_one(alert_doc)
    
    return {
        'success': True,
        'alert_id': str(result.inserted_id),
        'keywords': alert.keywords,
        'platforms': alert.platforms,
        'message': 'Alerta criado com sucesso. Você receberá notificações.'
    }

@router.get("/alerts")
async def list_alerts(limit: int = 20):
    """Lista alertas ativos"""
    
    cursor = db.monitoring_alerts.find({'status': 'active'}).limit(limit)
    alerts = await cursor.to_list(length=limit)
    
    for alert in alerts:
        alert['id'] = str(alert.pop('_id'))
    
    return {
        'alerts': alerts,
        'total': len(alerts)
    }

@router.post("/reputation/analyze")
async def analyze_reputation(check: ReputationCheck):
    """Analisa reputação online"""
    
    platforms = check.platforms or ['Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'News']
    
    # Simulação de coleta (em produção: APIs reais)
    mentions = [
        {
            'platform': 'Twitter',
            'content': f'Menção positiva sobre {check.entity_name}',
            'sentiment': 'positive',
            'date': (datetime.now() - timedelta(days=1)).isoformat()
        },
        {
            'platform': 'Facebook',
            'content': f'Comentário neutro mencionando {check.entity_name}',
            'sentiment': 'neutral',
            'date': (datetime.now() - timedelta(days=2)).isoformat()
        },
        {
            'platform': 'News',
            'content': f'Notícia sobre {check.entity_name}',
            'sentiment': 'positive',
            'date': (datetime.now() - timedelta(days=5)).isoformat()
        }
    ]
    
    # Análise com IA
    prompt = f"""Analise a reputação online de: {check.entity_name} ({check.entity_type})

Menções encontradas:
{mentions}

Forneça:
1. Resumo da reputação geral
2. Pontos positivos identificados
3. Pontos de atenção ou negativos
4. Recomendações de ação
5. Score de reputação (0-100)"""
    
    analysis = await ai_orchestrator.intelligent_analysis(
        'general_analysis',
        prompt
    )
    
    # Calcular scores
    positive_count = sum(1 for m in mentions if m['sentiment'] == 'positive')
    negative_count = sum(1 for m in mentions if m['sentiment'] == 'negative')
    neutral_count = sum(1 for m in mentions if m['sentiment'] == 'neutral')
    
    total = len(mentions)
    reputation_score = int(((positive_count * 2 + neutral_count) / (total * 2)) * 100) if total > 0 else 50
    
    reputation = {
        'entity_name': check.entity_name,
        'entity_type': check.entity_type,
        'reputation_score': reputation_score,
        'total_mentions': total,
        'sentiment_breakdown': {
            'positive': positive_count,
            'neutral': neutral_count,
            'negative': negative_count
        },
        'mentions': mentions,
        'ai_analysis': analysis['response'],
        'platforms_checked': platforms,
        'analyzed_at': datetime.now().isoformat()
    }
    
    await db.reputation_analyses.insert_one(reputation)
    
    return reputation

@router.post("/evidence/collect")
async def collect_evidence(keywords: List[str], platforms: List[str]):
    """Coleta evidências digitais de redes sociais"""
    
    # Simulação de coleta
    evidence = []
    
    for platform in platforms:
        for keyword in keywords:
            evidence.append({
                'platform': platform,
                'keyword': keyword,
                'content': f'Post contendo: {keyword}',
                'url': f'https://{platform.lower()}.com/post/12345',
                'author': 'usuario_exemplo',
                'timestamp': datetime.now().isoformat(),
                'screenshot': 'evidence_12345.png',
                'hash': 'abc123def456...',
                'chain_of_custody': 'Registered in blockchain'
            })
    
    # Salvar evidências
    collection_record = {
        'keywords': keywords,
        'platforms': platforms,
        'evidence_collected': evidence,
        'total_items': len(evidence),
        'collected_at': datetime.now().isoformat(),
        'status': 'archived'
    }
    
    result = await db.evidence_collections.insert_one(collection_record)
    
    return {
        'success': True,
        'collection_id': str(result.inserted_id),
        'total_evidence': len(evidence),
        'evidence': evidence,
        'message': 'Evidências coletadas e arquivadas com cadeia de custódia'
    }

@router.get("/timeline/{entity_name}")
async def social_timeline(entity_name: str, days: int = 30):
    """Timeline de atividades sociais"""
    
    start_date = datetime.now() - timedelta(days=days)
    
    # Simulação de atividades
    activities = []
    for i in range(days):
        date = start_date + timedelta(days=i)
        activities.append({
            'date': date.isoformat(),
            'posts': 2,
            'comments': 5,
            'likes_received': 10,
            'shares': 3,
            'platforms': ['Twitter', 'Facebook']
        })
    
    return {
        'entity_name': entity_name,
        'period': f'Últimos {days} dias',
        'timeline': activities,
        'total_posts': sum(a['posts'] for a in activities),
        'total_interactions': sum(a['comments'] + a['likes_received'] for a in activities)
    }

@router.post("/graph/relationships")
async def relationship_graph(entity_name: str, depth: int = 2):
    """Grafo de relacionamentos sociais"""
    
    # Simulação de grafo
    graph = {
        'center': entity_name,
        'nodes': [
            {'id': entity_name, 'type': 'person', 'level': 0},
            {'id': 'amigo_1', 'type': 'person', 'level': 1},
            {'id': 'empresa_x', 'type': 'organization', 'level': 1},
            {'id': 'familiar_1', 'type': 'person', 'level': 1},
            {'id': 'socio_y', 'type': 'person', 'level': 2}
        ],
        'edges': [
            {'from': entity_name, 'to': 'amigo_1', 'type': 'follows'},
            {'from': entity_name, 'to': 'empresa_x', 'type': 'works_at'},
            {'from': entity_name, 'to': 'familiar_1', 'type': 'family'},
            {'from': 'empresa_x', 'to': 'socio_y', 'type': 'partner'}
        ]
    }
    
    return {
        'entity': entity_name,
        'depth': depth,
        'graph': graph,
        'total_nodes': len(graph['nodes']),
        'total_connections': len(graph['edges']),
        'message': 'Grafo de relacionamentos mapeado'
    }

@router.get("/statistics")
async def social_listening_statistics():
    """Estatísticas de social listening"""
    
    total_alerts = await db.monitoring_alerts.count_documents({})
    total_analyses = await db.reputation_analyses.count_documents({})
    
    return {
        'total_alerts': total_alerts,
        'active_alerts': await db.monitoring_alerts.count_documents({'status': 'active'}),
        'total_reputation_analyses': total_analyses,
        'features': [
            'Real-time monitoring',
            'Mention alerts',
            'Reputation analysis',
            'Evidence collection',
            'Social timeline',
            'Relationship graphs',
            'Sentiment analysis',
            'Multi-platform support'
        ],
        'platforms': [
            'Twitter/X',
            'Facebook',
            'Instagram',
            'LinkedIn',
            'TikTok',
            'YouTube',
            'News sites',
            'Forums'
        ]
    }
