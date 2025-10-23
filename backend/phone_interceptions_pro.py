"""
AP ELITE ATHENA - Sistema Profissional de Interceptação Telefônica
Baseado nas melhores práticas de inteligência policial e investigação criminal
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import os
import uuid
import hashlib
import json

router = APIRouter(prefix="/api/athena/interceptions", tags=["Interceptações Telefônicas"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Security
security = HTTPBearer(auto_error=False)

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        token_parts = credentials.credentials.split('_')
        user_id = token_parts[1]
        user = await db.users.find_one({"id": user_id, "active": True}, {"_id": 0, "password": 0})
        return user
    except:
        return None

# ==================== FUNDAMENTOS LEGAIS ====================

LEGAL_BASIS = {
    "LEI_9296_1996": {
        "name": "Lei 9.296/1996",
        "description": "Regulamenta interceptação de comunicações telefônicas",
        "key_points": [
            "Necessidade de autorização judicial",
            "Prazo máximo: 15 dias renováveis",
            "Somente para investigação criminal e instrução processual penal",
            "Crimes punidos com reclusão"
        ]
    },
    "LEI_13964_2019": {
        "name": "Lei 13.964/2019 (Pacote Anticrime)",
        "description": "Alterações no processo penal",
        "key_points": [
            "Reforço de garantias processuais",
            "Maior rigor na fundamentação de decisões",
            "Proteção de dados sensíveis"
        ]
    },
    "LGPD": {
        "name": "Lei 13.709/2018 (LGPD)",
        "description": "Lei Geral de Proteção de Dados",
        "key_points": [
            "Tratamento adequado de dados pessoais",
            "Segurança da informação",
            "Minimização e adequação dos dados"
        ]
    }
}

# ==================== CATEGORIAS E CLASSIFICAÇÕES ====================

CALL_TYPES = {
    "incoming": {"label": "Recebida", "icon": "phone-incoming", "color": "blue"},
    "outgoing": {"label": "Originada", "icon": "phone-outgoing", "color": "green"},
    "missed": {"label": "Perdida", "icon": "phone-missed", "color": "yellow"},
    "voicemail": {"label": "Caixa Postal", "icon": "voicemail", "color": "purple"}
}

RELEVANCE_LEVELS = {
    "baixa": {
        "level": 1,
        "label": "Baixa Relevância",
        "description": "Conversa comum, sem interesse investigativo",
        "color": "gray",
        "priority": "low"
    },
    "media": {
        "level": 2,
        "label": "Média Relevância",
        "description": "Conversa com algum ponto de interesse",
        "color": "yellow",
        "priority": "medium"
    },
    "alta": {
        "level": 3,
        "label": "Alta Relevância",
        "description": "Conversa importante para investigação",
        "color": "orange",
        "priority": "high"
    },
    "critica": {
        "level": 4,
        "label": "Crítica",
        "description": "Evidência direta de crime ou informação crucial",
        "color": "red",
        "priority": "critical"
    }
}

CONTENT_CATEGORIES = {
    "planejamento_crime": "Planejamento de Crime",
    "confissao": "Confissão",
    "combinacao_depoimento": "Combinação de Depoimento",
    "lavagem_dinheiro": "Lavagem de Dinheiro",
    "trafico_drogas": "Tráfico de Drogas",
    "corrupcao": "Corrupção",
    "ameaca": "Ameaça",
    "extorsao": "Extorsão",
    "ocultacao_provas": "Ocultação de Provas",
    "identificacao_coautores": "Identificação de Coautores",
    "localizacao_suspeito": "Localização de Suspeito",
    "negociacao_ilicita": "Negociação Ilícita",
    "comum": "Conversa Comum",
    "outros": "Outros"
}

# ==================== MODELOS DE DADOS ====================

def create_interception_model(data: dict, user: dict) -> dict:
    """Cria modelo completo de interceptação"""
    
    now = datetime.now(timezone.utc)
    interception_id = str(uuid.uuid4())
    
    return {
        # Identificação
        "id": interception_id,
        "numero_sequencial": data.get("numero_sequencial", ""),
        "numero_autos": data.get("numero_autos", ""),
        
        # Dados Legais
        "autorizacao_judicial": {
            "numero_decisao": data.get("numero_decisao", ""),
            "data_decisao": data.get("data_decisao", ""),
            "juizo": data.get("juizo", ""),
            "comarca": data.get("comarca", ""),
            "prazo_inicial": data.get("prazo_inicial", ""),
            "prazo_final": data.get("prazo_final", ""),
            "renovacoes": data.get("renovacoes", []),
            "fundamento_legal": data.get("fundamento_legal", "LEI_9296_1996")
        },
        
        # Alvo da Interceptação
        "alvo": {
            "nome": data.get("alvo_nome", ""),
            "cpf": data.get("alvo_cpf", ""),
            "rg": data.get("alvo_rg", ""),
            "apelido": data.get("alvo_apelido", ""),
            "telefone_alvo": data.get("telefone_alvo", ""),
            "endereco": data.get("alvo_endereco", ""),
            "qualificacao": data.get("alvo_qualificacao", "investigado"),  # investigado, testemunha, informante
            "foto": data.get("alvo_foto", None)
        },
        
        # Dados da Chamada
        "chamada": {
            "tipo": data.get("tipo_chamada", "incoming"),
            "numero_originador": data.get("numero_originador", ""),
            "numero_destino": data.get("numero_destino", ""),
            "data": data.get("data_chamada", ""),
            "hora_inicio": data.get("hora_inicio", ""),
            "hora_fim": data.get("hora_fim", ""),
            "duracao_segundos": data.get("duracao_segundos", 0),
            "duracao_formatada": data.get("duracao_formatada", "00:00:00"),
            "status": data.get("status_chamada", "completa")  # completa, interrompida, nao_atendida
        },
        
        # Localização e Infraestrutura
        "localizacao": {
            "erb_originador": {
                "codigo": data.get("erb_originador_codigo", ""),
                "nome": data.get("erb_originador_nome", ""),
                "latitude": data.get("erb_originador_lat", ""),
                "longitude": data.get("erb_originador_lon", ""),
                "endereco": data.get("erb_originador_endereco", ""),
                "operadora": data.get("erb_originador_operadora", "")
            },
            "erb_destino": {
                "codigo": data.get("erb_destino_codigo", ""),
                "nome": data.get("erb_destino_nome", ""),
                "latitude": data.get("erb_destino_lat", ""),
                "longitude": data.get("erb_destino_lon", ""),
                "endereco": data.get("erb_destino_endereco", ""),
                "operadora": data.get("erb_destino_operadora", "")
            }
        },
        
        # Arquivo de Áudio
        "audio": {
            "arquivo": data.get("audio_arquivo", None),
            "formato": data.get("audio_formato", ""),
            "tamanho_bytes": data.get("audio_tamanho", 0),
            "duracao": data.get("audio_duracao", ""),
            "qualidade": data.get("audio_qualidade", "boa"),  # excelente, boa, regular, ruim
            "hash_md5": data.get("audio_hash", ""),
            "url": data.get("audio_url", None)
        },
        
        # Transcrição
        "transcricao": {
            "texto_completo": data.get("transcricao", ""),
            "metodo": data.get("transcricao_metodo", "manual"),  # manual, automatica, revisada
            "qualidade": data.get("transcricao_qualidade", ""),
            "operador": data.get("transcricao_operador", user.get("name", "")),
            "data_transcricao": data.get("data_transcricao", now.isoformat()),
            "observacoes_transcricao": data.get("obs_transcricao", "")
        },
        
        # Análise de Conteúdo
        "analise": {
            "resumo": data.get("resumo", ""),
            "palavras_chave": data.get("palavras_chave", []),
            "categoria": data.get("categoria", "comum"),
            "relevancia": data.get("relevancia", "media"),
            "nivel_risco": data.get("nivel_risco", "baixo"),
            
            # Elementos Identificados
            "elementos_crime": {
                "autoria": data.get("identifica_autoria", False),
                "materialidade": data.get("identifica_materialidade", False),
                "confissao": data.get("contem_confissao", False),
                "planejamento": data.get("contem_planejamento", False),
                "coautores": data.get("identifica_coautores", False),
                "localizacao_provas": data.get("indica_provas", False)
            },
            
            # Pessoas Mencionadas
            "pessoas_mencionadas": data.get("pessoas_mencionadas", []),
            
            # Locais Mencionados
            "locais_mencionados": data.get("locais_mencionados", []),
            
            # Datas e Eventos Mencionados
            "datas_mencionadas": data.get("datas_mencionadas", []),
            
            # Valores Financeiros Mencionados
            "valores_mencionados": data.get("valores_mencionados", [])
        },
        
        # Conexões e Relacionamentos
        "relacionamentos": {
            "outros_investigados": data.get("relacionamentos_investigados", []),
            "pessoas_interesse": data.get("pessoas_interesse", []),
            "organizacao_criminosa": data.get("vinculo_organizacao", "")
        },
        
        # Providências e Desdobramentos
        "providencias": {
            "diligencias_sugeridas": data.get("diligencias", []),
            "informacoes_cruzar": data.get("cruzamentos", []),
            "urgencia": data.get("urgencia", "normal"),  # baixa, normal, alta, urgente
            "status_providencia": data.get("status_providencia", "pendente")  # pendente, em_andamento, concluida
        },
        
        # Cadeia de Custódia
        "cadeia_custodia": {
            "recebimento": {
                "data": now.isoformat(),
                "responsavel": user.get("name", ""),
                "forma": data.get("forma_recebimento", "Sistema")
            },
            "acessos": [{
                "usuario": user.get("name", ""),
                "data": now.isoformat(),
                "acao": "Criação do registro"
            }],
            "compartilhamentos": data.get("compartilhamentos", [])
        },
        
        # Observações e Notas
        "observacoes": {
            "observacoes_gerais": data.get("observacoes", ""),
            "observacoes_legais": data.get("observacoes_legais", ""),
            "observacoes_tecnicas": data.get("observacoes_tecnicas", ""),
            "alertas": data.get("alertas", [])
        },
        
        # Metadados do Sistema
        "metadata": {
            "criado_por": user.get("email", ""),
            "criado_em": now.isoformat(),
            "atualizado_por": user.get("email", ""),
            "atualizado_em": now.isoformat(),
            "versao": 1,
            "status": "ativa",  # ativa, arquivada, excluida
            "confidencialidade": data.get("confidencialidade", "secreto"),  # publico, reservado, confidencial, secreto
            "tags": data.get("tags", [])
        }
    }

# ==================== ENDPOINTS ====================

@router.get("/list")
async def list_interceptions(
    limit: int = 100,
    skip: int = 0,
    filter_relevance: Optional[str] = None,
    filter_category: Optional[str] = None,
    filter_date_from: Optional[str] = None,
    filter_date_to: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Lista todas as interceptações com filtros"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Build query
    query = {"metadata.status": {"$ne": "excluida"}}
    
    if filter_relevance:
        query["analise.relevancia"] = filter_relevance
    
    if filter_category:
        query["analise.categoria"] = filter_category
    
    if filter_date_from:
        query["chamada.data"] = {"$gte": filter_date_from}
    
    if filter_date_to:
        if "chamada.data" in query:
            query["chamada.data"]["$lte"] = filter_date_to
        else:
            query["chamada.data"] = {"$lte": filter_date_to}
    
    if search:
        query["$or"] = [
            {"alvo.nome": {"$regex": search, "$options": "i"}},
            {"transcricao.texto_completo": {"$regex": search, "$options": "i"}},
            {"numero_autos": {"$regex": search, "$options": "i"}},
            {"alvo.telefone_alvo": {"$regex": search, "$options": "i"}}
        ]
    
    interceptions = await db.phone_interceptions_pro.find(
        query, 
        {"_id": 0}
    ).sort("chamada.data", -1).skip(skip).limit(limit).to_list(limit)
    
    total = await db.phone_interceptions_pro.count_documents(query)
    
    return {
        "interceptions": interceptions,
        "total": total,
        "page": skip // limit + 1,
        "total_pages": (total + limit - 1) // limit
    }

@router.get("/statistics")
async def get_statistics(current_user: dict = Depends(get_current_user)):
    """Retorna estatísticas das interceptações"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Total de interceptações
    total = await db.phone_interceptions_pro.count_documents({"metadata.status": "ativa"})
    
    # Por relevância
    by_relevance = {}
    for key in RELEVANCE_LEVELS.keys():
        count = await db.phone_interceptions_pro.count_documents({
            "analise.relevancia": key,
            "metadata.status": "ativa"
        })
        by_relevance[key] = count
    
    # Por categoria
    by_category = {}
    for key in CONTENT_CATEGORIES.keys():
        count = await db.phone_interceptions_pro.count_documents({
            "analise.categoria": key,
            "metadata.status": "ativa"
        })
        by_category[key] = count
    
    # Por tipo de chamada
    by_call_type = {}
    for key in CALL_TYPES.keys():
        count = await db.phone_interceptions_pro.count_documents({
            "chamada.tipo": key,
            "metadata.status": "ativa"
        })
        by_call_type[key] = count
    
    # Interceptações críticas pendentes
    critical_pending = await db.phone_interceptions_pro.count_documents({
        "analise.relevancia": "critica",
        "providencias.status_providencia": "pendente",
        "metadata.status": "ativa"
    })
    
    # Últimas 7 dias
    last_7_days = datetime.now(timezone.utc) - timedelta(days=7)
    recent = await db.phone_interceptions_pro.count_documents({
        "metadata.criado_em": {"$gte": last_7_days.isoformat()},
        "metadata.status": "ativa"
    })
    
    return {
        "total": total,
        "by_relevance": by_relevance,
        "by_category": by_category,
        "by_call_type": by_call_type,
        "critical_pending": critical_pending,
        "recent_7_days": recent
    }

@router.post("/create")
async def create_interception(
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Cria nova interceptação telefônica"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    interception = create_interception_model(data, current_user)
    
    await db.phone_interceptions_pro.insert_one(interception)
    
    return {
        "message": "Interceptação criada com sucesso",
        "id": interception["id"],
        "numero_sequencial": interception["numero_sequencial"]
    }

@router.get("/{interception_id}")
async def get_interception(
    interception_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Obtém detalhes completos de uma interceptação"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    interception = await db.phone_interceptions_pro.find_one(
        {"id": interception_id},
        {"_id": 0}
    )
    
    if not interception:
        raise HTTPException(status_code=404, detail="Interceptação não encontrada")
    
    # Registra acesso na cadeia de custódia
    await db.phone_interceptions_pro.update_one(
        {"id": interception_id},
        {
            "$push": {
                "cadeia_custodia.acessos": {
                    "usuario": current_user.get("name", ""),
                    "data": datetime.now(timezone.utc).isoformat(),
                    "acao": "Visualização"
                }
            }
        }
    )
    
    return interception

@router.put("/{interception_id}")
async def update_interception(
    interception_id: str,
    data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Atualiza uma interceptação"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Verifica se existe
    existing = await db.phone_interceptions_pro.find_one({"id": interception_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Interceptação não encontrada")
    
    # Update data
    update_data = {
        **data,
        "metadata.atualizado_por": current_user.get("email", ""),
        "metadata.atualizado_em": datetime.now(timezone.utc).isoformat(),
        "metadata.versao": existing.get("metadata", {}).get("versao", 1) + 1
    }
    
    # Registra na cadeia de custódia
    await db.phone_interceptions_pro.update_one(
        {"id": interception_id},
        {
            "$set": update_data,
            "$push": {
                "cadeia_custodia.acessos": {
                    "usuario": current_user.get("name", ""),
                    "data": datetime.now(timezone.utc).isoformat(),
                    "acao": "Atualização"
                }
            }
        }
    )
    
    return {"message": "Interceptação atualizada com sucesso"}

@router.delete("/{interception_id}")
async def delete_interception(
    interception_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Marca interceptação como excluída (soft delete)"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    result = await db.phone_interceptions_pro.update_one(
        {"id": interception_id},
        {
            "$set": {
                "metadata.status": "excluida",
                "metadata.excluido_por": current_user.get("email", ""),
                "metadata.excluido_em": datetime.now(timezone.utc).isoformat()
            },
            "$push": {
                "cadeia_custodia.acessos": {
                    "usuario": current_user.get("name", ""),
                    "data": datetime.now(timezone.utc).isoformat(),
                    "acao": "Exclusão"
                }
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Interceptação não encontrada")
    
    return {"message": "Interceptação excluída com sucesso"}

@router.get("/legal/foundations")
async def get_legal_foundations(current_user: dict = Depends(get_current_user)):
    """Retorna fundamentos legais disponíveis"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return {"legal_basis": LEGAL_BASIS}

@router.get("/metadata/categories")
async def get_categories(current_user: dict = Depends(get_current_user)):
    """Retorna todas as categorias e classificações"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return {
        "call_types": CALL_TYPES,
        "relevance_levels": RELEVANCE_LEVELS,
        "content_categories": CONTENT_CATEGORIES
    }

@router.post("/{interception_id}/add-note")
async def add_note(
    interception_id: str,
    note: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Adiciona nota ou observação à interceptação"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    note_data = {
        "id": str(uuid.uuid4()),
        "tipo": note.get("tipo", "observacao"),
        "texto": note.get("texto", ""),
        "usuario": current_user.get("name", ""),
        "data": datetime.now(timezone.utc).isoformat()
    }
    
    await db.phone_interceptions_pro.update_one(
        {"id": interception_id},
        {
            "$push": {
                "observacoes.notas": note_data,
                "cadeia_custodia.acessos": {
                    "usuario": current_user.get("name", ""),
                    "data": datetime.now(timezone.utc).isoformat(),
                    "acao": f"Adicionou nota: {note.get('tipo', 'observacao')}"
                }
            }
        }
    )
    
    return {"message": "Nota adicionada com sucesso", "note_id": note_data["id"]}

@router.get("/export/{interception_id}")
async def export_interception(
    interception_id: str,
    format: str = "json",
    current_user: dict = Depends(get_current_user)
):
    """Exporta interceptação em formato específico"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    interception = await db.phone_interceptions_pro.find_one(
        {"id": interception_id},
        {"_id": 0}
    )
    
    if not interception:
        raise HTTPException(status_code=404, detail="Interceptação não encontrada")
    
    # Registra exportação
    await db.phone_interceptions_pro.update_one(
        {"id": interception_id},
        {
            "$push": {
                "cadeia_custodia.acessos": {
                    "usuario": current_user.get("name", ""),
                    "data": datetime.now(timezone.utc).isoformat(),
                    "acao": f"Exportação em formato {format}"
                }
            }
        }
    )
    
    if format == "json":
        return interception
    elif format == "report":
        # Gerar relatório formatado
        return {
            "report": "Relatório formatado (implementar geração de PDF)",
            "data": interception
        }
    
    return interception
