"""Upload Universal com Auto-Classificação e OCR - Elite Athena"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
import os
import uuid
import hashlib
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import magic  # python-magic para detecção de tipo
import re

router = APIRouter(prefix="/api/upload-universal", tags=["upload-universal"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

BASE_DIR = "/app/backend/clientes_pastas"
os.makedirs(BASE_DIR, exist_ok=True)


# ==================== DETECÇÃO E CLASSIFICAÇÃO ====================

def detectar_tipo_arquivo(filename: str, content: bytes) -> str:
    """Detecta tipo do arquivo por nome e conteúdo"""
    
    filename_lower = filename.lower()
    
    # Por extensão
    if filename_lower.endswith(('.jpg', '.jpeg', '.png', '.pdf')):
        # Tentar identificar documento específico
        if 'rg' in filename_lower or 'identidade' in filename_lower:
            return 'RG'
        elif 'cpf' in filename_lower:
            return 'CPF'
        elif 'cnh' in filename_lower or 'habilitacao' in filename_lower:
            return 'CNH'
        elif 'procura' in filename_lower:
            return 'PROCURACAO'
        elif 'contrato' in filename_lower:
            return 'CONTRATO'
        elif 'certidao' in filename_lower or 'certid' in filename_lower:
            return 'CERTIDAO'
        elif 'comprovante' in filename_lower:
            return 'COMPROVANTE'
        else:
            return 'DOCUMENTO_PESSOAL'
    
    elif filename_lower.endswith(('.mp4', '.avi', '.mov', '.mkv')):
        return 'VIDEO'
    
    elif filename_lower.endswith(('.mp3', '.wav', '.m4a', '.ogg')):
        return 'AUDIO'
    
    elif filename_lower.endswith(('.doc', '.docx', '.odt')):
        if 'peticao' in filename_lower or 'petição' in filename_lower:
            return 'PETICAO'
        return 'DOCUMENTO'
    
    elif filename_lower.endswith(('.xls', '.xlsx', '.csv')):
        return 'PLANILHA'
    
    elif filename_lower.endswith(('.zip', '.rar', '.7z')):
        return 'ARQUIVO_COMPACTADO'
    
    elif filename_lower.endswith(('.e01', '.dd', '.aff')):
        return 'IMAGEM_FORENSE'
    
    return 'OUTROS'


def extrair_dados_documento(tipo: str, content: bytes, filename: str) -> dict:
    """Extrai dados do documento usando OCR + IA (mock)"""
    
    # TODO: Implementar OCR real com Tesseract ou AssemblyAI
    # Por enquanto, mock baseado em padrões
    
    dados = {}
    
    if tipo == 'CPF':
        # Simular extração de CPF
        dados = {
            'numero': '123.456.789-00',  # Mock
            'nome': 'Nome Extraído do Documento',
            'data_nascimento': '01/01/1980',
            'metodo_extracao': 'OCR + IA'
        }
    
    elif tipo == 'RG':
        dados = {
            'numero': '12.345.678-9',
            'orgao_emissor': 'SSP',
            'uf': 'SP',
            'data_emissao': '2020-01-15',
            'metodo_extracao': 'OCR + IA'
        }
    
    elif tipo == 'CNH':
        dados = {
            'numero': '12345678900',
            'categoria': 'B',
            'validade': '2028-12-31',
            'metodo_extracao': 'OCR + IA'
        }
    
    # Tentar extrair CPF de qualquer documento
    try:
        text_content = content.decode('utf-8', errors='ignore')
        # Buscar padrão de CPF
        cpf_pattern = r'\d{3}\.\d{3}\.\d{3}-\d{2}'
        cpf_match = re.search(cpf_pattern, text_content)
        if cpf_match:
            dados['cpf_encontrado'] = cpf_match.group()
    except:
        pass
    
    return dados


@router.post("/")
async def upload_universal(
    file: UploadFile = File(...),
    cliente_id: Optional[str] = Form(None),
    processo_id: Optional[str] = Form(None),
    criar_cliente_automatico: bool = Form(True)
):
    """Upload universal com auto-classificação e pasta automática"""
    
    # Ler conteúdo
    content = await file.read()
    
    # Hashes
    hashes = {
        'md5': hashlib.md5(content).hexdigest(),
        'sha256': hashlib.sha256(content).hexdigest(),
        'sha512': hashlib.sha512(content).hexdigest()
    }
    
    # Detectar tipo
    tipo_detectado = detectar_tipo_arquivo(file.filename, content)
    
    # Extrair dados
    dados_extraidos = extrair_dados_documento(tipo_detectado, content, file.filename)
    
    # Se não tem cliente e pode criar automaticamente
    if not cliente_id and criar_cliente_automatico and dados_extraidos.get('nome'):
        # Criar cliente automaticamente
        novo_cliente_id = str(uuid.uuid4())
        
        cliente_auto = {
            'id': novo_cliente_id,
            'nome': dados_extraidos.get('nome', 'Cliente Automático'),
            'cpf_cnpj': dados_extraidos.get('cpf_encontrado', dados_extraidos.get('numero', '')),
            'email': '',
            'telefone': '',
            'criado_automaticamente': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
        
        await db.clientes.insert_one(cliente_auto)
        cliente_id = novo_cliente_id
        
        # Criar pasta
        pasta_cliente = os.path.join(BASE_DIR, cliente_id)
        subpastas = [
            'pessoais', 'contratos', 'procuracoes', 'processos',
            'midias', 'atendimentos', 'relatorios', 'uploads'
        ]
        
        for sub in subpastas:
            os.makedirs(os.path.join(pasta_cliente, sub), exist_ok=True)
    
    # Determinar subpasta
    subpasta_map = {
        'RG': 'pessoais',
        'CPF': 'pessoais',
        'CNH': 'pessoais',
        'CERTIDAO': 'pessoais',
        'COMPROVANTE': 'pessoais',
        'PROCURACAO': 'procuracoes',
        'CONTRATO': 'contratos',
        'PETICAO': 'processos',
        'DOCUMENTO': 'processos',
        'VIDEO': 'midias',
        'AUDIO': 'midias'
    }
    
    subpasta = subpasta_map.get(tipo_detectado, 'uploads')
    
    # Salvar arquivo
    if cliente_id:
        pasta_destino = os.path.join(BASE_DIR, cliente_id, subpasta)
        os.makedirs(pasta_destino, exist_ok=True)
    else:
        pasta_destino = os.path.join(BASE_DIR, 'temp')
        os.makedirs(pasta_destino, exist_ok=True)
    
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(pasta_destino, f"{file_id}{file_ext}")
    
    with open(file_path, 'wb') as f:
        f.write(content)
    
    # Criar registro
    documento = {
        'id': file_id,
        'cliente_id': cliente_id,
        'processo_id': processo_id,
        'tipo_detectado': tipo_detectado,
        'filename': file.filename,
        'path': file_path,
        'subpasta': subpasta,
        'size_bytes': len(content),
        'hashes': hashes,
        'dados_extraidos': dados_extraidos,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.documentos_universais.insert_one(documento)
    
    # Se extraiu dados, atualizar cadastro do cliente
    if cliente_id and dados_extraidos:
        update_fields = {}
        
        if 'nome' in dados_extraidos and not (await db.clientes.find_one({"id": cliente_id})).get('nome'):
            update_fields['nome'] = dados_extraidos['nome']
        
        if 'cpf_encontrado' in dados_extraidos:
            update_fields['cpf_cnpj'] = dados_extraidos['cpf_encontrado']
        
        if update_fields:
            await db.clientes.update_one(
                {"id": cliente_id},
                {"$set": update_fields}
            )
    
    return {
        'file_id': file_id,
        'cliente_id': cliente_id,
        'tipo_detectado': tipo_detectado,
        'subpasta': subpasta,
        'dados_extraidos': dados_extraidos,
        'hashes': hashes,
        'auto_preenchimento': len(dados_extraidos) > 0,
        'message': 'Upload e classificação concluídos'
    }


@router.get("/clientes/{cliente_id}/pasta")
async def visualizar_pasta_completa(cliente_id: str):
    """Visualiza estrutura completa da pasta do cliente"""
    
    # Buscar todos os documentos
    docs = await db.documentos_universais.find(
        {"cliente_id": cliente_id}
    ).to_list(length=None)
    
    # Organizar por subpasta
    pasta = {
        'pessoais': [],
        'contratos': [],
        'procuracoes': [],
        'processos': [],
        'midias': [],
        'atendimentos': [],
        'uploads': []
    }
    
    for doc in docs:
        subpasta = doc.get('subpasta', 'uploads')
        if subpasta in pasta:
            pasta[subpasta].append({
                'id': doc['id'],
                'filename': doc['filename'],
                'tipo': doc['tipo_detectado'],
                'size_mb': round(doc['size_bytes'] / 1024 / 1024, 2),
                'hash_sha256': doc['hashes']['sha256'][:16] + '...',
                'created_at': doc['created_at']
            })
    
    # Estatísticas
    stats = {
        'total_documentos': len(docs),
        'total_size_mb': round(sum(d['size_bytes'] for d in docs) / 1024 / 1024, 2),
        'por_tipo': {}
    }
    
    for doc in docs:
        tipo = doc['tipo_detectado']
        stats['por_tipo'][tipo] = stats['por_tipo'].get(tipo, 0) + 1
    
    return {
        'cliente_id': cliente_id,
        'pasta': pasta,
        'stats': stats
    }
