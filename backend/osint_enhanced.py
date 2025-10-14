"""
Sistema OSINT Aprimorado com Fontes Brasileiras
Integra ferramentas e fontes abertas para investigação
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from ai_orchestrator import ai_orchestrator
import httpx

router = APIRouter(prefix="/api/osint", tags=["OSINT Enhanced"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "test_database")]

class OSINTSource(BaseModel):
    name: str
    category: str
    url: str
    description: str
    requires_auth: bool = False
    country: str = 'BR'

class OSINTQuery(BaseModel):
    query: str
    sources: List[str] = []
    use_ai_analysis: bool = True

class OSINTResult(BaseModel):
    query: str
    sources_used: List[str]
    results: Dict[str, Any]
    ai_analysis: Optional[str] = None
    timestamp: str

# Categorias OSINT Brasileiras
OSINT_CATEGORIES = {
    'government': {
        'name': 'Transparência Governamental',
        'sources': [
            {
                'name': 'Portal da Transparência Federal',
                'url': 'http://www.portaltransparencia.gov.br/',
                'description': 'Gastos públicos, servidores, viagens',
                'type': 'database'
            },
            {
                'name': 'Consulta CNPJ Receita Federal',
                'url': 'https://servicos.receita.fazenda.gov.br/Servicos/cnpjreva/',
                'description': 'Dados de empresas brasileiras',
                'type': 'database'
            },
            {
                'name': 'e-SIC',
                'url': 'http://www.consultaesic.cgu.gov.br/',
                'description': 'Pedidos de informação ao governo',
                'type': 'service'
            },
            {
                'name': 'TSE - Divulgação de Candidaturas',
                'url': 'https://divulgacandcontas.tse.jus.br/',
                'description': 'Dados de candidatos e partidos',
                'type': 'database'
            }
        ]
    },
    'social_media': {
        'name': 'Redes Sociais e Mídias',
        'sources': [
            {
                'name': 'Facebook',
                'url': 'https://www.facebook.com/',
                'description': 'Rede social',
                'type': 'platform'
            },
            {
                'name': 'Instagram',
                'url': 'https://www.instagram.com/',
                'description': 'Rede social de fotos',
                'type': 'platform'
            },
            {
                'name': 'Twitter/X',
                'url': 'https://twitter.com/',
                'description': 'Microblog',
                'type': 'platform'
            },
            {
                'name': 'LinkedIn',
                'url': 'https://www.linkedin.com/',
                'description': 'Rede profissional',
                'type': 'platform'
            },
            {
                'name': 'Social-Searcher',
                'url': 'https://www.social-searcher.com/',
                'description': 'Busca em redes sociais',
                'type': 'tool'
            }
        ]
    },
    'legal': {
        'name': 'Fontes Jurídicas',
        'sources': [
            {
                'name': 'JusBrasil',
                'url': 'https://www.jusbrasil.com.br/',
                'description': 'Processos e jurisprudência',
                'type': 'database'
            },
            {
                'name': 'Escavador',
                'url': 'https://www.escavador.com/',
                'description': 'Busca de pessoas e processos',
                'type': 'tool'
            },
            {
                'name': 'CNJ - Consulta Processual',
                'url': 'https://www.cnj.jus.br/',
                'description': 'Consulta de processos',
                'type': 'database'
            },
            {
                'name': 'OAB - Consulta de Advogados',
                'url': 'https://www.oab.org.br/',
                'description': 'Verificação de advogados',
                'type': 'database'
            }
        ]
    },
    'companies': {
        'name': 'Empresas e Negócios',
        'sources': [
            {
                'name': 'Rede CNPJ',
                'url': 'https://www.redecnpj.com.br/',
                'description': 'Dados de CNPJ',
                'type': 'database'
            },
            {
                'name': 'Consulta Sócio',
                'url': 'https://www.consultasocio.com/',
                'description': 'Sócios de empresas',
                'type': 'tool'
            },
            {
                'name': 'Casa dos Dados',
                'url': 'https://www.casadosdados.com.br/',
                'description': 'Dados empresariais',
                'type': 'database'
            }
        ]
    },
    'geospatial': {
        'name': 'Geolocalização e Mapas',
        'sources': [
            {
                'name': 'Google Maps',
                'url': 'https://www.google.com/maps',
                'description': 'Mapas e localização',
                'type': 'tool'
            },
            {
                'name': 'OpenStreetMap',
                'url': 'https://www.openstreetmap.org/',
                'description': 'Mapas colaborativos',
                'type': 'tool'
            },
            {
                'name': 'FlightRadar24',
                'url': 'https://www.flightradar24.com/',
                'description': 'Rastreamento de voos',
                'type': 'tool'
            },
            {
                'name': 'MarineTraffic',
                'url': 'https://www.marinetraffic.com/',
                'description': 'Rastreamento marítimo',
                'type': 'tool'
            }
        ]
    },
    'technical': {
        'name': 'Análise Técnica',
        'sources': [
            {
                'name': 'Shodan',
                'url': 'https://www.shodan.io/',
                'description': 'Busca de dispositivos IoT',
                'type': 'tool'
            },
            {
                'name': 'VirusTotal',
                'url': 'https://www.virustotal.com/',
                'description': 'Análise de malware',
                'type': 'tool'
            },
            {
                'name': 'SecurityTrails',
                'url': 'https://securitytrails.com/',
                'description': 'DNS e domínios',
                'type': 'tool'
            },
            {
                'name': 'Have I Been Pwned',
                'url': 'https://haveibeenpwned.com/',
                'description': 'Vazamento de dados',
                'type': 'tool'
            }
        ]
    },
    'vehicles': {
        'name': 'Veículos e Transporte',
        'sources': [
            {
                'name': 'Consulta Placa DETRAN',
                'url': 'https://www.detran.sp.gov.br/',
                'description': 'Consulta de veículos',
                'type': 'service'
            },
            {
                'name': 'ANTT - Consultas',
                'url': 'https://www.antt.gov.br/',
                'description': 'Transporte terrestre',
                'type': 'database'
            }
        ]
    },
    'utilities': {
        'name': 'Serviços Públicos',
        'sources': [
            {
                'name': 'Consulta CPF',
                'url': 'https://servicos.receita.fazenda.gov.br/Servicos/CPF/',
                'description': 'Verificação de CPF',
                'type': 'service'
            },
            {
                'name': 'Consulta CEP',
                'url': 'https://buscacepinter.correios.com.br/',
                'description': 'Busca de endereços',
                'type': 'service'
            }
        ]
    },
    'professional': {
        'name': 'Registros Profissionais',
        'sources': [
            {
                'name': 'CFM - Conselho Federal de Medicina',
                'url': 'https://portal.cfm.org.br/',
                'description': 'Registro de médicos',
                'type': 'database'
            },
            {
                'name': 'CONFEA - Engenheiros',
                'url': 'https://www.confea.org.br/',
                'description': 'Registro de engenheiros',
                'type': 'database'
            },
            {
                'name': 'CFC - Contadores',
                'url': 'https://www3.cfc.org.br/',
                'description': 'Registro de contadores',
                'type': 'database'
            }
        ]
    },
    'darkweb': {
        'name': 'Dark Web e Deep Web',
        'sources': [
            {
                'name': 'Ahmia',
                'url': 'https://ahmia.fi/',
                'description': 'Busca na dark web',
                'type': 'tool'
            },
            {
                'name': 'Intelligence X',
                'url': 'https://intelx.io/',
                'description': 'Busca em vazamentos',
                'type': 'tool'
            }
        ]
    }
}

@router.get("/categories")
async def get_osint_categories():
    """Lista todas as categorias e fontes OSINT"""
    return {
        "categories": OSINT_CATEGORIES,
        "total_categories": len(OSINT_CATEGORIES),
        "total_sources": sum(len(cat['sources']) for cat in OSINT_CATEGORIES.values())
    }

@router.get("/categories/{category}")
async def get_category_sources(category: str):
    """Obtém fontes de uma categoria específica"""
    if category not in OSINT_CATEGORIES:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    
    return OSINT_CATEGORIES[category]

@router.post("/query")
async def execute_osint_query(query: OSINTQuery):
    """Executa consulta OSINT com análise de IA"""
    
    # Determinar fontes baseado na consulta se não especificado
    if not query.sources:
        # Usar IA para determinar fontes relevantes
        prompt = f"""
        Para a seguinte consulta OSINT: "{query.query}"
        
        Categorias disponíveis: {list(OSINT_CATEGORIES.keys())}
        
        Sugira as 3 categorias mais relevantes para esta investigação.
        Responda apenas com os nomes das categorias separados por vírgula.
        """
        
        ai_result = await ai_orchestrator.intelligent_analysis(
            'osint_analysis',
            prompt
        )
        
        suggested_categories = ai_result.get('response', '').strip().split(',')
        suggested_categories = [cat.strip() for cat in suggested_categories]
    else:
        suggested_categories = query.sources
    
    # Coletar fontes das categorias
    sources_used = []
    for category in suggested_categories:
        if category in OSINT_CATEGORIES:
            sources_used.extend(OSINT_CATEGORIES[category]['sources'])
    
    # Simular coleta de dados (em produção, isso faria requisições reais)
    collected_data = {
        "query": query.query,
        "timestamp": datetime.now().isoformat(),
        "categories_searched": suggested_categories,
        "sources_checked": len(sources_used),
        "source_details": sources_used[:5]  # Primeiras 5 fontes
    }
    
    # Análise com IA se solicitado
    ai_analysis = None
    if query.use_ai_analysis:
        analysis_result = await ai_orchestrator.osint_intelligence(
            query.query,
            collected_data
        )
        
        if analysis_result['success']:
            ai_analysis = analysis_result['response']
    
    # Salvar consulta no histórico
    osint_record = {
        "query": query.query,
        "categories": suggested_categories,
        "sources_used": [s['name'] for s in sources_used],
        "timestamp": datetime.now().isoformat(),
        "ai_analysis": ai_analysis
    }
    
    await db.osint_queries.insert_one(osint_record)
    
    return {
        "query": query.query,
        "categories_searched": suggested_categories,
        "sources": sources_used,
        "collected_data": collected_data,
        "ai_analysis": ai_analysis,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/history")
async def get_osint_history(limit: int = 20):
    """Histórico de consultas OSINT"""
    cursor = db.osint_queries.find().sort("timestamp", -1).limit(limit)
    queries = await cursor.to_list(length=limit)
    
    for query in queries:
        query['id'] = str(query.pop('_id'))
    
    return {
        "queries": queries,
        "total": len(queries)
    }

@router.post("/analyze-person")
async def analyze_person(
    name: str,
    cpf: Optional[str] = None,
    additional_info: Optional[Dict[str, Any]] = None
):
    """Análise OSINT de pessoa usando múltiplos provedores de IA"""
    
    # Preparar dados para análise
    person_data = {
        "nome": name,
        "cpf": cpf if cpf else "Não informado",
        "informacoes_adicionais": additional_info if additional_info else {}
    }
    
    # Consultar múltiplas fontes sugeridas
    relevant_categories = ['legal', 'social_media', 'professional', 'government']
    
    sources = []
    for category in relevant_categories:
        if category in OSINT_CATEGORIES:
            sources.extend(OSINT_CATEGORIES[category]['sources'])
    
    # Análise multi-provedor
    prompt = f"""
    Analise as seguintes informações sobre uma pessoa em contexto investigativo:
    
    Nome: {name}
    CPF: {cpf if cpf else 'Não disponível'}
    Informações adicionais: {additional_info if additional_info else 'Nenhuma'}
    
    Fontes OSINT disponíveis para consulta:
    {[s['name'] for s in sources[:10]]}
    
    Forneça:
    1. Perfil investigativo da pessoa
    2. Fontes prioritárias para consulta
    3. Possíveis conexões e relacionamentos
    4. Alertas e bandeiras vermelhas
    5. Recomendações de investigação
    """
    
    analysis = await ai_orchestrator.multi_provider_analysis(
        prompt,
        providers=['openai', 'anthropic', 'gemini']
    )
    
    # Salvar análise
    person_record = {
        "name": name,
        "cpf": cpf,
        "additional_info": additional_info,
        "analysis": analysis,
        "timestamp": datetime.now().isoformat()
    }
    
    await db.person_analyses.insert_one(person_record)
    
    return {
        "person": person_data,
        "sources_available": [s['name'] for s in sources],
        "multi_provider_analysis": analysis,
        "timestamp": datetime.now().isoformat()
    }

@router.post("/analyze-company")
async def analyze_company(
    cnpj: str,
    company_name: Optional[str] = None
):
    """Análise OSINT de empresa"""
    
    company_data = {
        "cnpj": cnpj,
        "nome": company_name if company_name else "Não informado"
    }
    
    # Fontes relevantes para empresas
    company_sources = []
    if 'companies' in OSINT_CATEGORIES:
        company_sources = OSINT_CATEGORIES['companies']['sources']
    
    # Análise com IA
    prompt = f"""
    Analise esta empresa brasileira em contexto investigativo:
    
    CNPJ: {cnpj}
    Nome: {company_name if company_name else 'A determinar'}
    
    Fontes disponíveis:
    {[s['name'] for s in company_sources]}
    
    Forneça:
    1. Análise de risco corporativo
    2. Sócios e administradores (prioridade de investigação)
    3. Histórico e atividades
    4. Conexões suspeitas
    5. Recomendações investigativas
    """
    
    analysis = await ai_orchestrator.intelligent_analysis(
        'general_analysis',
        prompt
    )
    
    return {
        "company": company_data,
        "sources": company_sources,
        "analysis": analysis['response'],
        "timestamp": datetime.now().isoformat()
    }

@router.get("/tools")
async def get_osint_tools():
    """Lista ferramentas OSINT por categoria"""
    
    tools = {}
    
    for category_name, category_data in OSINT_CATEGORIES.items():
        tools[category_name] = {
            "name": category_data['name'],
            "tools": category_data['sources']
        }
    
    return {
        "categories": tools,
        "total_categories": len(tools),
        "total_tools": sum(len(cat['tools']) for cat in tools.values())
    }

@router.post("/bulk-search")
async def bulk_osint_search(queries: List[str], categories: Optional[List[str]] = None):
    """Busca OSINT em lote"""
    
    results = []
    
    for query_text in queries[:10]:  # Limite de 10 por vez
        try:
            result = await execute_osint_query(
                OSINTQuery(
                    query=query_text,
                    sources=categories if categories else [],
                    use_ai_analysis=True
                )
            )
            results.append({
                "query": query_text,
                "success": True,
                "result": result
            })
        except Exception as e:
            results.append({
                "query": query_text,
                "success": False,
                "error": str(e)
            })
    
    return {
        "processed": len(results),
        "results": results,
        "timestamp": datetime.now().isoformat()
    }
