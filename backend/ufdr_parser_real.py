"""
Parser UFDR REAL - Cellebrite UFED
Lê estrutura XML e extrai dados REAIS
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional, List, Dict
import xml.etree.ElementTree as ET
import zipfile
import io
from datetime import datetime
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/parser-ufdr", tags=["Parser UFDR Real"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

def parse_ufdr_xml(xml_content: str) -> Dict:
    """
    Parser REAL de UFDR (Cellebrite)
    
    UFDR é um ZIP contendo:
    - Report.xml (metadados principais)
    - Contacts/, Messages/, Media/, etc
    """
    
    try:
        root = ET.fromstring(xml_content)
        
        dados_extraidos = {
            "device_info": {},
            "contacts": [],
            "messages": [],
            "calls": [],
            "media": [],
            "apps": []
        }
        
        # Extrai informações do dispositivo
        device = root.find(".//Device")
        if device is not None:
            dados_extraidos["device_info"] = {
                "model": device.findtext("Model", ""),
                "manufacturer": device.findtext("Manufacturer", ""),
                "imei": device.findtext("IMEI", ""),
                "serial": device.findtext("SerialNumber", ""),
                "os": device.findtext("OperatingSystem", ""),
                "extraction_date": device.findtext("ExtractionDate", "")
            }
        
        # Extrai contatos
        contacts = root.findall(".//Contact")
        for contact in contacts[:100]:  # Limita a 100
            dados_extraidos["contacts"].append({
                "name": contact.findtext("Name", ""),
                "phone": contact.findtext("PhoneNumber", ""),
                "email": contact.findtext("Email", "")
            })
        
        # Extrai mensagens
        messages = root.findall(".//Message")
        for msg in messages[:200]:  # Limita a 200
            dados_extraidos["messages"].append({
                "from": msg.findtext("From", ""),
                "to": msg.findtext("To", ""),
                "text": msg.findtext("Body", ""),
                "timestamp": msg.findtext("TimeStamp", ""),
                "type": msg.findtext("Type", "SMS")
            })
        
        # Extrai chamadas
        calls = root.findall(".//Call")
        for call in calls[:100]:
            dados_extraidos["calls"].append({
                "from": call.findtext("From", ""),
                "to": call.findtext("To", ""),
                "duration": call.findtext("Duration", "0"),
                "timestamp": call.findtext("TimeStamp", ""),
                "type": call.findtext("Type", "")
            })
        
        # Extrai mídias
        media = root.findall(".//MediaFile")
        for m in media[:50]:
            dados_extraidos["media"].append({
                "filename": m.findtext("FileName", ""),
                "path": m.findtext("LocalPath", ""),
                "size": m.findtext("Size", "0"),
                "type": m.findtext("MediaType", "")
            })
        
        return dados_extraidos
        
    except Exception as e:
        raise Exception(f"Erro ao parsear UFDR XML: {str(e)}")

@router.post("/parse")
async def parsear_ufdr(file: UploadFile = File(...)):
    """
    Parser REAL de arquivo UFDR
    
    - Lê ZIP UFDR
    - Extrai Report.xml
    - Parseia estrutura XML
    - Retorna dados estruturados
    """
    
    try:
        contents = await file.read()
        
        dados_extraidos = None
        
        # Se for ZIP (UFDR completo)
        if file.filename.endswith('.zip') or file.filename.endswith('.ufdr'):
            try:
                with zipfile.ZipFile(io.BytesIO(contents)) as zf:
                    # Procura Report.xml
                    xml_files = [f for f in zf.namelist() if f.endswith('.xml')]
                    
                    if xml_files:
                        with zf.open(xml_files[0]) as xml_file:
                            xml_content = xml_file.read().decode('utf-8')
                            dados_extraidos = parse_ufdr_xml(xml_content)
                    else:
                        raise Exception("Nenhum XML encontrado no UFDR")
            except zipfile.BadZipFile:
                raise HTTPException(status_code=400, detail="Arquivo ZIP inválido")
        
        # Se for XML direto
        elif file.filename.endswith('.xml'):
            xml_content = contents.decode('utf-8')
            dados_extraidos = parse_ufdr_xml(xml_content)
        
        else:
            raise HTTPException(status_code=400, detail="Formato não suportado. Use .ufdr, .zip ou .xml")
        
        if not dados_extraidos:
            raise HTTPException(status_code=400, detail="Não foi possível extrair dados")
        
        # Salva resultado
        parse_id = str(uuid.uuid4())
        
        resultado = {
            "id": parse_id,
            "filename": file.filename,
            "device_info": dados_extraidos["device_info"],
            "totais": {
                "contacts": len(dados_extraidos["contacts"]),
                "messages": len(dados_extraidos["messages"]),
                "calls": len(dados_extraidos["calls"]),
                "media": len(dados_extraidos["media"])
            },
            "dados": dados_extraidos,
            "created_at": datetime.now().isoformat()
        }
        
        await db.ufdr_parsed.insert_one(resultado)
        
        return {
            "success": True,
            "parse_id": parse_id,
            "device_info": dados_extraidos["device_info"],
            "totais": resultado["totais"],
            "message": f"UFDR parseado: {resultado['totais']['contacts']} contatos, {resultado['totais']['messages']} mensagens"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao parsear UFDR: {str(e)}")

@router.get("/result/{parse_id}")
async def obter_resultado_parser(parse_id: str):
    """Obtém resultado completo do parsing"""
    
    result = await db.ufdr_parsed.find_one({"id": parse_id})
    if not result:
        raise HTTPException(status_code=404, detail="Resultado não encontrado")
    
    return {"success": True, "result": result}

@router.get("/stats")
async def stats_parser_ufdr():
    """Estatísticas do parser"""
    
    total = await db.ufdr_parsed.count_documents({})
    
    return {
        "success": True,
        "total_parseados": total
    }
