"""
AP ELITE ATHENA - Integração com APIs de Geolocalização e ERBs
OpenCellID, WiGLE, AbuseIPDB e Sentinel

Features:
- Buscar ERBs reais por localização (OpenCellID)
- Buscar redes WiFi e torres (WiGLE)
- Verificar IPs maliciosos (AbuseIPDB)
- Importar dados do Sentinel
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List
import os
import uuid
import httpx
import base64
from datetime import datetime, timezone

router = APIRouter(prefix="/api/erbs/integrations", tags=["ERBs Integrations"])

# MongoDB
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# API Keys
OPENCELLID_TOKEN = os.environ.get("OPENCELLID_TOKEN", "")
WIGLE_API_NAME = os.environ.get("WIGLE_API_NAME", "")
WIGLE_API_TOKEN = os.environ.get("WIGLE_API_TOKEN", "")
ABUSEIPDB_KEY = os.environ.get("ABUSEIPDB_API_KEY", "")

# Security
security = HTTPBearer(auto_error=False)

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

# ==================== OPENCELLID INTEGRATION ====================

@router.get("/opencellid/search")
async def search_opencellid(
    lat: float,
    lon: float,
    radius: int = 1000,  # metros
    current_user: dict = Depends(get_current_user)
):
    """
    Busca ERBs próximas usando OpenCellID
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    if not OPENCELLID_TOKEN:
        raise HTTPException(status_code=503, detail="Token OpenCellID não configurado")
    
    try:
        async with httpx.AsyncClient() as client:
            # OpenCellID API
            url = f"https://opencellid.org/cell/getInArea"
            params = {
                "token": OPENCELLID_TOKEN,
                "lat": lat,
                "lon": lon,
                "radius": radius,
                "format": "json",
                "limit": 100
            }
            
            response = await client.get(url, params=params, timeout=30.0)
            
            if response.status_code == 200:
                data = response.json()
                erbs_encontradas = []
                
                # Processar e salvar ERBs no banco
                for cell in data.get("cells", []):
                    erb = {
                        "id": str(uuid.uuid4()),
                        "fonte": "OpenCellID",
                        "operadora": cell.get("radio", "Unknown"),
                        "mcc": cell.get("mcc"),
                        "mnc": cell.get("mnc"),
                        "lac": cell.get("area", ""),
                        "cid": cell.get("cell", ""),
                        "latitude": cell.get("lat"),
                        "longitude": cell.get("lon"),
                        "raio_metros": cell.get("range", 500),
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "created_by": current_user.get("email"),
                        "importada_via_api": True
                    }
                    
                    # Verificar se já existe
                    existing = await db.erbs.find_one({
                        "cid": erb["cid"],
                        "lac": erb["lac"]
                    })
                    
                    if not existing:
                        await db.erbs.insert_one(erb)
                        erbs_encontradas.append(erb)
                
                return {
                    "success": True,
                    "fonte": "OpenCellID",
                    "erbs_encontradas": len(erbs_encontradas),
                    "erbs": erbs_encontradas,
                    "total_api": len(data.get("cells", [])),
                    "localizacao": {"lat": lat, "lon": lon, "radius": radius}
                }
            else:
                return {
                    "success": False,
                    "error": f"OpenCellID retornou status {response.status_code}",
                    "message": response.text
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar OpenCellID: {str(e)}")

# ==================== WIGLE INTEGRATION ====================

@router.get("/wigle/search")
async def search_wigle(
    lat: float,
    lon: float,
    radius: float = 0.01,  # graus
    current_user: dict = Depends(get_current_user)
):
    """
    Busca redes WiFi e torres celulares usando WiGLE
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    if not WIGLE_API_NAME or not WIGLE_API_TOKEN:
        raise HTTPException(status_code=503, detail="Credenciais WiGLE não configuradas")
    
    try:
        async with httpx.AsyncClient() as client:
            # WiGLE API
            url = "https://api.wigle.net/api/v2/network/search"
            params = {
                "latrange1": lat - radius,
                "latrange2": lat + radius,
                "longrange1": lon - radius,
                "longrange2": lon + radius
            }
            
            headers = {
                "Authorization": f"Basic {WIGLE_API_NAME}:{WIGLE_API_TOKEN}"
            }
            
            response = await client.get(url, params=params, headers=headers, timeout=30.0)
            
            if response.status_code == 200:
                data = response.json()
                
                return {
                    "success": True,
                    "fonte": "WiGLE",
                    "results": data.get("resultCount", 0),
                    "networks": data.get("results", [])[:50],  # Limitar a 50
                    "localizacao": {"lat": lat, "lon": lon, "radius": radius}
                }
            else:
                return {
                    "success": False,
                    "error": f"WiGLE retornou status {response.status_code}"
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar WiGLE: {str(e)}")

# ==================== ABUSEIPDB INTEGRATION ====================

@router.get("/abuseipdb/check/{ip}")
async def check_ip_abuseipdb(
    ip: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Verifica se um IP é malicioso usando AbuseIPDB
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    if not ABUSEIPDB_KEY:
        raise HTTPException(status_code=503, detail="Chave AbuseIPDB não configurada")
    
    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.abuseipdb.com/api/v2/check"
            headers = {
                "Key": ABUSEIPDB_KEY,
                "Accept": "application/json"
            }
            params = {
                "ipAddress": ip,
                "maxAgeInDays": 90,
                "verbose": True
            }
            
            response = await client.get(url, params=params, headers=headers, timeout=30.0)
            
            if response.status_code == 200:
                data = response.json()
                
                return {
                    "success": True,
                    "ip": ip,
                    "abuse_score": data.get("data", {}).get("abuseConfidenceScore", 0),
                    "is_malicious": data.get("data", {}).get("abuseConfidenceScore", 0) > 50,
                    "reports": data.get("data", {}).get("totalReports", 0),
                    "country": data.get("data", {}).get("countryCode"),
                    "isp": data.get("data", {}).get("isp"),
                    "details": data.get("data", {})
                }
            else:
                return {
                    "success": False,
                    "error": f"AbuseIPDB retornou status {response.status_code}"
                }
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar IP: {str(e)}")

# ==================== IMPORTAÇÃO EM LOTE ====================

@router.post("/import/opencellid")
async def import_opencellid_bulk(
    coordinates: List[dict],  # [{"lat": -23.5505, "lon": -46.6333}, ...]
    current_user: dict = Depends(get_current_user)
):
    """
    Importa ERBs em lote de múltiplas coordenadas
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    total_importadas = 0
    
    for coord in coordinates[:10]:  # Limitar a 10 para não sobrecarregar
        try:
            result = await search_opencellid(
                lat=coord["lat"],
                lon=coord["lon"],
                radius=coord.get("radius", 1000),
                current_user=current_user
            )
            total_importadas += result.get("erbs_encontradas", 0)
        except:
            continue
    
    return {
        "success": True,
        "total_coordenadas": len(coordinates[:10]),
        "total_erbs_importadas": total_importadas
    }

# ==================== STATUS DAS INTEGRAÇÕES ====================

@router.get("/status")
async def integration_status(current_user: dict = Depends(get_current_user)):
    """
    Retorna status de todas as integrações de API
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Autenticação necessária")
    
    return {
        "integrations": {
            "opencellid": {
                "configured": bool(OPENCELLID_TOKEN),
                "status": "active" if OPENCELLID_TOKEN else "not_configured",
                "description": "Busca de ERBs por coordenadas"
            },
            "wigle": {
                "configured": bool(WIGLE_API_NAME and WIGLE_API_TOKEN),
                "status": "active" if (WIGLE_API_NAME and WIGLE_API_TOKEN) else "not_configured",
                "description": "Redes WiFi e torres celulares"
            },
            "abuseipdb": {
                "configured": bool(ABUSEIPDB_KEY),
                "status": "active" if ABUSEIPDB_KEY else "not_configured",
                "description": "Verificação de IPs maliciosos"
            }
        }
    }
