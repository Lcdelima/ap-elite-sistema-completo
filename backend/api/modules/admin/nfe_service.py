"""Geração de NF-e - Elite Athena"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import os
from motor.motor_asyncio import AsyncIOMotorClient
import hashlib

router = APIRouter(prefix="/api/nfe", tags=["nfe"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]


class NFEItem(BaseModel):
    descricao: str
    quantidade: float
    valor_unitario: float
    ncm: str = "99"


class NFERequest(BaseModel):
    cliente_nome: str
    cliente_cpf_cnpj: str
    cliente_endereco: str
    itens: List[NFEItem]
    natureza_operacao: str = "Prestação de Serviços"


@router.post("/gerar")
async def gerar_nfe(data: NFERequest):
    """Gera NF-e (Nota Fiscal Eletrônica)"""
    
    # TODO: Integrar com provedor de NF-e:
    # - NFe.io
    # - Bling
    # - ContaAzul
    # - ENotas
    
    # Calcular totais
    valor_total = sum(
        item.quantidade * item.valor_unitario 
        for item in data.itens
    )
    
    # Gerar número da nota (sequencial)
    ultima_nfe = await db.notas_fiscais.find_one(
        sort=[("numero", -1)]
    )
    
    numero_nfe = (ultima_nfe['numero'] + 1) if ultima_nfe else 1
    
    # Criar registro
    nfe_record = {
        "numero": numero_nfe,
        "serie": 1,
        "cliente": {
            "nome": data.cliente_nome,
            "cpf_cnpj": data.cliente_cpf_cnpj,
            "endereco": data.cliente_endereco
        },
        "itens": [item.model_dump() for item in data.itens],
        "natureza_operacao": data.natureza_operacao,
        "valor_total": round(valor_total, 2),
        "impostos": {
            "iss": round(valor_total * 0.02, 2),  # 2% ISS (exemplo)
            "pis": 0,
            "cofins": 0
        },
        "status": "em_processamento",  # em_processamento, autorizada, cancelada
        "chave_acesso": None,  # Será preenchida após autorização SEFAZ
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.notas_fiscais.insert_one(nfe_record)
    
    return {
        "numero_nfe": numero_nfe,
        "valor_total": round(valor_total, 2),
        "status": "em_processamento",
        "message": "NF-e gerada (aguardando integração com SEFAZ)",
        "next_steps": [
            "Configure provedor de NF-e (NFe.io, Bling, ENotas)",
            "Obtenha certificado digital ICP-Brasil",
            "Configure credenciais SEFAZ"
        ]
    }


@router.get("/lista")
async def listar_nfes(limit: int = 50):
    """Lista NF-es emitidas"""
    
    nfes = await db.notas_fiscais.find().sort(
        "created_at", -1
    ).limit(limit).to_list(length=limit)
    
    return {
        "notas": nfes,
        "total": len(nfes)
    }


@router.get("/{numero}/xml")
async def download_xml_nfe(numero: int):
    """Download XML da NF-e"""
    
    # TODO: Gerar XML real conforme layout SEFAZ
    return {
        "numero": numero,
        "xml": "<?xml version='1.0'?><nfe>...</nfe>",
        "message": "Geração de XML em desenvolvimento"
    }


@router.post("/{numero}/cancelar")
async def cancelar_nfe(numero: int, motivo: str):
    """Cancela NF-e"""
    
    result = await db.notas_fiscais.update_one(
        {"numero": numero},
        {
            "$set": {
                "status": "cancelada",
                "motivo_cancelamento": motivo,
                "cancelada_em": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="NF-e não encontrada")
    
    return {"message": "NF-e cancelada"}
