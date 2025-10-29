"""
OCR System REAL - Tesseract Integration
Extração de texto REAL de PDFs e imagens
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional
import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image
import io
from datetime import datetime
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/ocr", tags=["OCR Real"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

# Configura Tesseract
pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

@router.post("/extract-text")
async def extrair_texto_ocr(
    file: UploadFile = File(...),
    language: str = "por"  # por (português) ou eng (inglês)
):
    """
    OCR REAL com Tesseract
    
    - Extrai texto de PDFs e imagens
    - Suporta português e inglês
    - Retorna texto completo + confiança
    """
    
    try:
        contents = await file.read()
        
        texto_extraido = ""
        confianca_media = 0
        total_paginas = 0
        
        # Detecta tipo de arquivo
        if file.filename.lower().endswith('.pdf'):
            # Converte PDF para imagens
            try:
                images = convert_from_bytes(contents, dpi=300)
                total_paginas = len(images)
                
                textos_paginas = []
                
                for i, image in enumerate(images):
                    # OCR em cada página
                    data = pytesseract.image_to_data(image, lang=language, output_type=pytesseract.Output.DICT)
                    
                    # Extrai texto
                    texto_pagina = pytesseract.image_to_string(image, lang=language)
                    textos_paginas.append(f"--- Página {i+1} ---\n{texto_pagina}")
                    
                    # Calcula confiança média
                    confidences = [int(conf) for conf in data['conf'] if conf != '-1']
                    if confidences:
                        confianca_media += sum(confidences) / len(confidences)
                
                texto_extraido = "\n\n".join(textos_paginas)
                confianca_media = confianca_media / total_paginas if total_paginas > 0 else 0
                
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Erro ao processar PDF: {str(e)}")
        
        else:
            # Imagem direta (JPG, PNG, etc)
            try:
                image = Image.open(io.BytesIO(contents))
                
                # OCR
                data = pytesseract.image_to_data(image, lang=language, output_type=pytesseract.Output.DICT)
                texto_extraido = pytesseract.image_to_string(image, lang=language)
                
                # Confiança
                confidences = [int(conf) for conf in data['conf'] if conf != '-1']
                confianca_media = sum(confidences) / len(confidences) if confidences else 0
                total_paginas = 1
                
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Erro ao processar imagem: {str(e)}")
        
        # Salva resultado
        ocr_id = str(uuid.uuid4())
        
        ocr_result = {
            "id": ocr_id,
            "filename": file.filename,
            "language": language,
            "texto_extraido": texto_extraido,
            "total_caracteres": len(texto_extraido),
            "total_palavras": len(texto_extraido.split()),
            "total_paginas": total_paginas,
            "confianca_media": round(confianca_media, 2),
            "created_at": datetime.now().isoformat()
        }
        
        await db.ocr_results.insert_one(ocr_result)
        
        return {
            "success": True,
            "ocr_id": ocr_id,
            "texto": texto_extraido,
            "total_caracteres": len(texto_extraido),
            "total_palavras": len(texto_extraido.split()),
            "total_paginas": total_paginas,
            "confianca_media": round(confianca_media, 2),
            "message": f"OCR concluído. {len(texto_extraido)} caracteres extraídos com {confianca_media:.1f}% de confiança."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no OCR: {str(e)}")

@router.get("/result/{ocr_id}")
async def obter_resultado_ocr(ocr_id: str):
    """Obtém resultado do OCR"""
    
    result = await db.ocr_results.find_one({"id": ocr_id})
    if not result:
        raise HTTPException(status_code=404, detail="Resultado OCR não encontrado")
    
    return {"success": True, "result": result}

@router.get("/stats")
async def stats_ocr():
    """Estatísticas OCR"""
    
    total = await db.ocr_results.count_documents({})
    
    # Total de caracteres processados
    pipeline = [
        {"$group": {"_id": None, "total_chars": {"$sum": "$total_caracteres"}}}
    ]
    
    result = await db.ocr_results.aggregate(pipeline).to_list(1)
    total_chars = result[0]["total_chars"] if result else 0
    
    return {
        "success": True,
        "total_processados": total,
        "total_caracteres_extraidos": total_chars
    }
