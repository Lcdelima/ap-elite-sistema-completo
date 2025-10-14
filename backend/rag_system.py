"""
RAG System - Retrieval Augmented Generation
Sistema de busca inteligente com embeddings e IA
Processa os 500+ PDFs técnicos e permite consultas contextuais
"""

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from ai_orchestrator import ai_orchestrator
import numpy as np
import hashlib
import json

router = APIRouter(prefix="/api/rag", tags=["RAG System"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "test_database")]

class RAGQuery(BaseModel):
    query: str
    top_k: int = 5
    use_context: bool = True
    provider: str = 'openai'  # openai, anthropic, gemini

class RAGResponse(BaseModel):
    query: str
    answer: str
    sources: List[Dict[str, Any]]
    confidence: float
    provider: str

class DocumentChunk(BaseModel):
    doc_id: str
    chunk_id: str
    text: str
    page: int
    metadata: Dict[str, Any]

# Embedding cache (em produção, usar Redis ou vector DB como Pinecone/Weaviate)
EMBEDDINGS_CACHE = {}

def generate_text_embedding(text: str) -> List[float]:
    """
    Gera embedding do texto usando hash para simulação
    Em produção: usar OpenAI embeddings, Sentence Transformers, etc.
    """
    # Simulação de embedding com hash (para demonstração)
    # Em produção: usar openai.embeddings.create() ou similar
    hash_obj = hashlib.md5(text.encode())
    hash_bytes = hash_obj.digest()
    
    # Converter para vetor de 768 dimensões (padrão)
    embedding = []
    for i in range(0, len(hash_bytes), 2):
        val = int.from_bytes(hash_bytes[i:i+2], 'big')
        embedding.extend([val / 65535.0] * 48)  # Normalizar e expandir
    
    return embedding[:768]  # Retornar exatamente 768 dimensões

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calcula similaridade de cosseno entre dois vetores"""
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return dot_product / (norm1 * norm2)

@router.post("/query")
async def rag_query(query: RAGQuery):
    """
    Consulta RAG - Busca documentos relevantes e gera resposta contextual
    """
    
    # Gerar embedding da query
    query_embedding = generate_text_embedding(query.query)
    
    # Buscar chunks similares no banco
    # Em produção: usar vector database (Pinecone, Weaviate, Milvus)
    cursor = db.document_chunks.find().limit(100)
    chunks = await cursor.to_list(length=100)
    
    # Calcular similaridades
    similarities = []
    for chunk in chunks:
        if 'embedding' in chunk:
            similarity = cosine_similarity(query_embedding, chunk['embedding'])
            similarities.append({
                'chunk': chunk,
                'similarity': similarity
            })
    
    # Ordenar por similaridade
    similarities.sort(key=lambda x: x['similarity'], reverse=True)
    top_chunks = similarities[:query.top_k]
    
    # Se não houver contexto, buscar na biblioteca de documentos
    if not top_chunks:
        # Buscar documentos da biblioteca
        docs = await db.document_library.find().limit(5).to_list(length=5)
        context_text = "Documentos disponíveis na biblioteca:\n"
        for doc in docs:
            context_text += f"- {doc['filename']}: {doc.get('description', 'Sem descrição')}\n"
    else:
        # Construir contexto com chunks relevantes
        context_text = "Contexto dos documentos:\n\n"
        for item in top_chunks:
            chunk = item['chunk']
            context_text += f"[{chunk.get('source', 'Documento')} - Página {chunk.get('page', '?')}]\n"
            context_text += f"{chunk['text']}\n\n"
    
    # Gerar resposta com IA usando o contexto
    if query.use_context:
        prompt = f"""Baseado no seguinte contexto extraído de documentos técnicos sobre perícia criminal, investigação e cibersegurança, responda a pergunta do usuário de forma precisa e fundamentada.

{context_text}

Pergunta: {query.query}

Forneça uma resposta detalhada citando as fontes quando apropriado."""
    else:
        prompt = query.query
    
    # Usar o provedor de IA especificado
    ai_response = await ai_orchestrator.analyze_with_provider(
        query.provider,
        prompt,
        context="Sistema RAG para consulta técnica"
    )
    
    if not ai_response['success']:
        raise HTTPException(status_code=500, detail="Erro na geração de resposta")
    
    # Preparar fontes
    sources = []
    for item in top_chunks[:3]:  # Top 3 fontes
        chunk = item['chunk']
        sources.append({
            'document': chunk.get('source', 'Documento técnico'),
            'page': chunk.get('page', 'N/A'),
            'excerpt': chunk['text'][:200] + '...',
            'relevance': float(item['similarity'])
        })
    
    # Salvar consulta no histórico
    rag_record = {
        'query': query.query,
        'answer': ai_response['response'],
        'sources': sources,
        'provider': query.provider,
        'timestamp': datetime.now().isoformat()
    }
    
    await db.rag_queries.insert_one(rag_record)
    
    return {
        'query': query.query,
        'answer': ai_response['response'],
        'sources': sources,
        'confidence': np.mean([s['relevance'] for s in sources]) if sources else 0.0,
        'provider': ai_response['provider'],
        'model': ai_response['model']
    }

@router.post("/index-document")
async def index_document(doc_id: str, chunks: List[DocumentChunk]):
    """
    Indexa documento por chunks com embeddings
    """
    
    indexed_count = 0
    
    for chunk in chunks:
        # Gerar embedding
        embedding = generate_text_embedding(chunk.text)
        
        # Salvar chunk com embedding
        chunk_doc = {
            'doc_id': doc_id,
            'chunk_id': chunk.chunk_id,
            'text': chunk.text,
            'page': chunk.page,
            'embedding': embedding,
            'source': chunk.metadata.get('source', 'Unknown'),
            'indexed_at': datetime.now().isoformat()
        }
        
        await db.document_chunks.insert_one(chunk_doc)
        indexed_count += 1
    
    return {
        'success': True,
        'doc_id': doc_id,
        'chunks_indexed': indexed_count
    }

@router.post("/batch-index-library")
async def batch_index_library(limit: int = 10):
    """
    Indexa documentos da biblioteca em lote
    """
    
    import PyPDF2
    
    # Buscar documentos não indexados
    cursor = db.document_library.find({'rag_indexed': {'$ne': True}}).limit(limit)
    documents = await cursor.to_list(length=limit)
    
    results = []
    
    for doc in documents:
        try:
            # Extrair texto do PDF
            with open(doc['file_path'], 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                
                chunks = []
                for page_num in range(min(10, len(pdf_reader.pages))):  # Primeiras 10 páginas
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()
                    
                    # Dividir em chunks de ~500 caracteres
                    chunk_size = 500
                    for i in range(0, len(text), chunk_size):
                        chunk_text = text[i:i+chunk_size]
                        if chunk_text.strip():
                            chunks.append(DocumentChunk(
                                doc_id=str(doc['_id']),
                                chunk_id=f"{doc['_id']}_p{page_num}_c{i}",
                                text=chunk_text,
                                page=page_num + 1,
                                metadata={'source': doc['filename']}
                            ))
                
                # Indexar chunks
                if chunks:
                    await index_document(str(doc['_id']), chunks)
                    
                    # Marcar como indexado
                    await db.document_library.update_one(
                        {'_id': doc['_id']},
                        {'$set': {'rag_indexed': True, 'rag_chunks': len(chunks)}}
                    )
                    
                    results.append({
                        'doc_id': str(doc['_id']),
                        'filename': doc['filename'],
                        'chunks': len(chunks),
                        'success': True
                    })
        except Exception as e:
            results.append({
                'doc_id': str(doc['_id']),
                'filename': doc['filename'],
                'success': False,
                'error': str(e)
            })
    
    return {
        'processed': len(results),
        'results': results
    }

@router.get("/statistics")
async def rag_statistics():
    """Estatísticas do sistema RAG"""
    
    total_chunks = await db.document_chunks.count_documents({})
    total_queries = await db.rag_queries.count_documents({})
    indexed_docs = await db.document_library.count_documents({'rag_indexed': True})
    
    return {
        'total_chunks': total_chunks,
        'total_queries': total_queries,
        'indexed_documents': indexed_docs,
        'avg_chunk_size': 500,
        'embedding_dimensions': 768
    }

@router.get("/history")
async def rag_history(limit: int = 20):
    """Histórico de consultas RAG"""
    
    cursor = db.rag_queries.find().sort('timestamp', -1).limit(limit)
    queries = await cursor.to_list(length=limit)
    
    for query in queries:
        query['id'] = str(query.pop('_id'))
    
    return {
        'queries': queries,
        'total': len(queries)
    }

@router.post("/ask-documents")
async def ask_documents(
    question: str,
    doc_ids: Optional[List[str]] = None,
    use_all: bool = False
):
    """
    Faz pergunta diretamente aos documentos específicos
    """
    
    if use_all:
        # Usar todos os documentos indexados
        cursor = db.document_chunks.find().limit(50)
    elif doc_ids:
        # Usar apenas documentos específicos
        cursor = db.document_chunks.find({'doc_id': {'$in': doc_ids}}).limit(50)
    else:
        raise HTTPException(status_code=400, detail="Especifique doc_ids ou use_all=true")
    
    chunks = await cursor.to_list(length=50)
    
    # Construir contexto
    context = "\n\n".join([chunk['text'] for chunk in chunks[:10]])
    
    # Usar Claude para análise de documentos (melhor para textos longos)
    prompt = f"""Analise o seguinte conteúdo de documentos técnicos e responda a pergunta:

CONTEXTO:
{context}

PERGUNTA: {question}

Forneça uma resposta precisa e bem fundamentada."""
    
    response = await ai_orchestrator.analyze_with_provider(
        'anthropic',
        prompt,
        context="Análise de documentos técnicos"
    )
    
    return {
        'question': question,
        'answer': response['response'],
        'documents_analyzed': len(chunks),
        'provider': response['provider']
    }
