"""
Sistema de Biblioteca de Documentos Técnicos
Gerencia, indexa e analisa documentos PDF de perícia e investigação
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from fastapi.responses import FileResponse
from typing import List, Optional, Dict, Any
import os
import json
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from ai_orchestrator import ai_orchestrator
import hashlib

router = APIRouter(prefix="/api/library", tags=["Document Library"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "test_database")]

# Diretório para biblioteca de documentos
LIBRARY_DIR = "/app/backend/document_library"
os.makedirs(LIBRARY_DIR, exist_ok=True)

class Document(BaseModel):
    id: Optional[str] = None
    filename: str
    category: str
    tags: List[str] = []
    description: Optional[str] = None
    file_path: str
    file_size: int
    file_hash: str
    upload_date: str
    indexed: bool = False
    summary: Optional[str] = None
    key_topics: List[str] = []

class SearchQuery(BaseModel):
    query: str
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    limit: int = 10

class AnalysisRequest(BaseModel):
    document_id: str
    analysis_type: str = 'comprehensive'  # comprehensive, legal, evidence, technical

# Categorias predefinidas baseadas nos ZIPs
DOCUMENT_CATEGORIES = {
    'cybersecurity': 'Cibersegurança',
    'forensics': 'Perícia Digital',
    'investigation': 'Investigação Criminal',
    'osint': 'OSINT e Inteligência',
    'malware': 'Análise de Malware',
    'network': 'Segurança de Redes',
    'mobile': 'Perícia Mobile',
    'legal': 'Jurídico e Legislação',
    'tools': 'Ferramentas e Técnicas',
    'reports': 'Relatórios e Estudos'
}

def calculate_file_hash(file_path: str) -> str:
    """Calcula hash SHA256 do arquivo"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Query(...),
    tags: List[str] = Query([]),
    description: Optional[str] = None
):
    """Upload de documento para a biblioteca"""
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são aceitos")
    
    if category not in DOCUMENT_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Categoria inválida. Use: {list(DOCUMENT_CATEGORIES.keys())}")
    
    # Salvar arquivo
    file_path = os.path.join(LIBRARY_DIR, file.filename)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    file_size = os.path.getsize(file_path)
    file_hash = calculate_file_hash(file_path)
    
    # Verificar duplicatas
    existing = await db.document_library.find_one({"file_hash": file_hash})
    if existing:
        os.remove(file_path)
        raise HTTPException(status_code=409, detail="Documento já existe na biblioteca")
    
    # Criar documento
    document = {
        "filename": file.filename,
        "category": category,
        "tags": tags,
        "description": description,
        "file_path": file_path,
        "file_size": file_size,
        "file_hash": file_hash,
        "upload_date": datetime.now().isoformat(),
        "indexed": False,
        "summary": None,
        "key_topics": []
    }
    
    result = await db.document_library.insert_one(document)
    document['id'] = str(result.inserted_id)
    
    return {
        "success": True,
        "document": document,
        "message": "Documento adicionado à biblioteca"
    }

@router.get("/categories")
async def get_categories():
    """Lista categorias disponíveis"""
    return {
        "categories": DOCUMENT_CATEGORIES,
        "total": len(DOCUMENT_CATEGORIES)
    }

@router.get("/documents")
async def list_documents(
    category: Optional[str] = None,
    tags: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    """Lista documentos da biblioteca"""
    
    query = {}
    if category:
        query['category'] = category
    if tags:
        tag_list = tags.split(',')
        query['tags'] = {'$in': tag_list}
    
    cursor = db.document_library.find(query).skip(skip).limit(limit)
    documents = await cursor.to_list(length=limit)
    
    for doc in documents:
        doc['id'] = str(doc.pop('_id'))
    
    total = await db.document_library.count_documents(query)
    
    return {
        "documents": documents,
        "total": total,
        "limit": limit,
        "skip": skip
    }

@router.get("/documents/{document_id}")
async def get_document(document_id: str):
    """Obtém detalhes de um documento"""
    
    from bson import ObjectId
    
    try:
        doc = await db.document_library.find_one({"_id": ObjectId(document_id)})
    except:
        raise HTTPException(status_code=400, detail="ID inválido")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    doc['id'] = str(doc.pop('_id'))
    return doc

@router.get("/documents/{document_id}/download")
async def download_document(document_id: str):
    """Download de documento"""
    
    from bson import ObjectId
    
    try:
        doc = await db.document_library.find_one({"_id": ObjectId(document_id)})
    except:
        raise HTTPException(status_code=400, detail="ID inválido")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    if not os.path.exists(doc['file_path']):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado no sistema")
    
    return FileResponse(
        doc['file_path'],
        media_type='application/pdf',
        filename=doc['filename']
    )

@router.post("/documents/{document_id}/analyze")
async def analyze_document(document_id: str, request: AnalysisRequest):
    """Analisa documento usando IA"""
    
    from bson import ObjectId
    import PyPDF2
    
    try:
        doc = await db.document_library.find_one({"_id": ObjectId(document_id)})
    except:
        raise HTTPException(status_code=400, detail="ID inválido")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    # Extrair texto do PDF (primeiras 5 páginas para análise)
    try:
        with open(doc['file_path'], 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            text_content = ""
            max_pages = min(5, len(pdf_reader.pages))
            
            for page_num in range(max_pages):
                page = pdf_reader.pages[page_num]
                text_content += page.extract_text()
            
            if not text_content.strip():
                raise HTTPException(status_code=400, detail="Não foi possível extrair texto do PDF")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar PDF: {str(e)}")
    
    # Analisar com IA
    analysis_result = await ai_orchestrator.document_intelligence(
        text_content,
        request.analysis_type
    )
    
    if not analysis_result['success']:
        raise HTTPException(status_code=500, detail="Erro na análise de IA")
    
    # Atualizar documento com análise
    await db.document_library.update_one(
        {"_id": ObjectId(document_id)},
        {"$set": {
            "indexed": True,
            "last_analysis": datetime.now().isoformat(),
            "last_analysis_type": request.analysis_type
        }}
    )
    
    # Salvar análise
    analysis_doc = {
        "document_id": document_id,
        "analysis_type": request.analysis_type,
        "result": analysis_result['response'],
        "provider": analysis_result['provider'],
        "model": analysis_result['model'],
        "timestamp": analysis_result['timestamp']
    }
    
    await db.document_analyses.insert_one(analysis_doc)
    
    return {
        "success": True,
        "document_id": document_id,
        "analysis": analysis_result['response'],
        "metadata": {
            "provider": analysis_result['provider'],
            "model": analysis_result['model'],
            "analysis_type": request.analysis_type
        }
    }

@router.post("/search")
async def search_documents(query: SearchQuery):
    """Busca inteligente de documentos"""
    
    # Busca básica
    db_query = {}
    
    if query.category:
        db_query['category'] = query.category
    
    if query.tags:
        db_query['tags'] = {'$in': query.tags}
    
    # Busca por texto no nome e descrição
    if query.query:
        db_query['$or'] = [
            {'filename': {'$regex': query.query, '$options': 'i'}},
            {'description': {'$regex': query.query, '$options': 'i'}},
            {'key_topics': {'$regex': query.query, '$options': 'i'}}
        ]
    
    cursor = db.document_library.find(db_query).limit(query.limit)
    documents = await cursor.to_list(length=query.limit)
    
    for doc in documents:
        doc['id'] = str(doc.pop('_id'))
    
    # Se houver poucos resultados, usar IA para busca semântica
    if len(documents) < 3 and query.query:
        ai_search_prompt = f"""
        Com base na consulta "{query.query}", sugira:
        1. Termos de busca alternativos
        2. Categorias relevantes: {list(DOCUMENT_CATEGORIES.keys())}
        3. Tags relacionadas ao tema
        
        Responda em formato JSON.
        """
        
        ai_result = await ai_orchestrator.intelligent_analysis(
            'general_analysis',
            ai_search_prompt
        )
        
        return {
            "documents": documents,
            "total": len(documents),
            "ai_suggestions": ai_result.get('response', '')
        }
    
    return {
        "documents": documents,
        "total": len(documents)
    }

@router.get("/statistics")
async def get_library_statistics():
    """Estatísticas da biblioteca"""
    
    total_docs = await db.document_library.count_documents({})
    indexed_docs = await db.document_library.count_documents({"indexed": True})
    
    # Documentos por categoria
    pipeline = [
        {"$group": {
            "_id": "$category",
            "count": {"$sum": 1}
        }}
    ]
    
    by_category = []
    async for doc in db.document_library.aggregate(pipeline):
        by_category.append({
            "category": doc['_id'],
            "count": doc['count']
        })
    
    # Total de análises realizadas
    total_analyses = await db.document_analyses.count_documents({})
    
    return {
        "total_documents": total_docs,
        "indexed_documents": indexed_docs,
        "by_category": by_category,
        "total_analyses": total_analyses,
        "categories_available": DOCUMENT_CATEGORIES
    }

@router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """Remove documento da biblioteca"""
    
    from bson import ObjectId
    
    try:
        doc = await db.document_library.find_one({"_id": ObjectId(document_id)})
    except:
        raise HTTPException(status_code=400, detail="ID inválido")
    
    if not doc:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    # Remover arquivo físico
    if os.path.exists(doc['file_path']):
        os.remove(doc['file_path'])
    
    # Remover do banco
    await db.document_library.delete_one({"_id": ObjectId(document_id)})
    
    # Remover análises associadas
    await db.document_analyses.delete_many({"document_id": document_id})
    
    return {
        "success": True,
        "message": "Documento removido da biblioteca"
    }

@router.post("/batch-index")
async def batch_index_documents(category: Optional[str] = None):
    """Indexa documentos em lote usando IA"""
    
    query = {"indexed": False}
    if category:
        query['category'] = category
    
    cursor = db.document_library.find(query).limit(10)
    documents = await cursor.to_list(length=10)
    
    results = []
    
    for doc in documents:
        try:
            # Analisar documento
            analysis_result = await analyze_document(
                str(doc['_id']),
                AnalysisRequest(
                    document_id=str(doc['_id']),
                    analysis_type='comprehensive'
                )
            )
            
            results.append({
                "document_id": str(doc['_id']),
                "filename": doc['filename'],
                "success": True
            })
        except Exception as e:
            results.append({
                "document_id": str(doc['_id']),
                "filename": doc['filename'],
                "success": False,
                "error": str(e)
            })
    
    return {
        "processed": len(results),
        "results": results
    }
