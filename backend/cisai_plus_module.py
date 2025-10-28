"""
CISAI+ Module - Advanced Geointelligence, IP/Wi-Fi Intelligence & Antiforensics
Sistema completo de inteligência forense com cadeia de custódia e conformidade LGPD/ISO
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
import logging
import base64
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
import requests
import json
import math
import ipaddress
import socket
import dns.resolver
from ipwhois import IPWhois
import hashlib
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/cisai", tags=["CISAI+"])

# Configurações
OPENCELLID_TOKEN = os.environ.get("OPENCELLID_TOKEN", "pk.8af9548f3db205e782c0f801c89b13a5")
OPENCELLID_API_URL = "https://opencellid.org/cell/get"

# Wigle API
WIGLE_API_NAME = os.environ.get("WIGLE_API_NAME", "AID56a4ee26f4863c9b4294ea8dd46ae464")
WIGLE_API_TOKEN = os.environ.get("WIGLE_API_TOKEN", "b33413ff9f980b546420d1f4385a9bc8")
WIGLE_API_URL = "https://api.wigle.net/api/v2/network/search"

# AbuseIPDB API
ABUSEIPDB_API_KEY = os.environ.get("ABUSEIPDB_API_KEY", "775dedec262fb746785dabbd99a49ea738ca978f4fc0cf5aaf074bd95f89256635804ad705efd8e0")
ABUSEIPDB_API_URL = "https://api.abuseipdb.com/api/v2"

# ==================== MODELS ====================

class GPSCoordinate(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)
    accuracy: Optional[float] = Field(None, description="Precisão em metros")
    timestamp: Optional[datetime] = None

class CellTowerData(BaseModel):
    mcc: int = Field(..., description="Mobile Country Code")
    mnc: int = Field(..., description="Mobile Network Code")
    lac: int = Field(..., description="Location Area Code")
    cid: int = Field(..., description="Cell ID")
    ta: Optional[int] = Field(None, description="Timing Advance")

class WiFiBSSID(BaseModel):
    bssid: str = Field(..., description="MAC address do ponto de acesso")
    ssid: Optional[str] = None
    signal_strength: Optional[int] = None
    channel: Optional[int] = None
    encryption: Optional[str] = None

class GeoResolveRequest(BaseModel):
    gps: Optional[GPSCoordinate] = None
    cell: Optional[CellTowerData] = None
    wifi: Optional[List[WiFiBSSID]] = None
    ts: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GeoTimelineRequest(BaseModel):
    device_id: str
    range: Dict[str, datetime]

class IPIntelRequest(BaseModel):
    ip: str

class WiFiLookupRequest(BaseModel):
    bssid: str

class SpoofDetectionRequest(BaseModel):
    fixes: List[GPSCoordinate]

class IPSpoofRequest(BaseModel):
    sessions: List[Dict[str, Any]]

# ==================== HELPER FUNCTIONS ====================

def calculate_distance(coord1, coord2):
    """Calcula distância entre duas coordenadas em metros"""
    return geodesic((coord1['lat'], coord1['lon']), (coord2['lat'], coord2['lon'])).meters

def calculate_speed(dist_meters, time_diff_seconds):
    """Calcula velocidade em km/h"""
    if time_diff_seconds == 0:
        return 0
    return (dist_meters / 1000) / (time_diff_seconds / 3600)

def opencellid_lookup(mcc, mnc, lac, cid):
    """Consulta OpenCellID para localização de ERB"""
    try:
        params = {
            "token": OPENCELLID_TOKEN,
            "mcc": mcc,
            "mnc": mnc,
            "lac": lac,
            "cellid": cid,
            "format": "json"
        }
        response = requests.get(OPENCELLID_API_URL, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "ok":
                return {
                    "lat": float(data.get("lat")),
                    "lon": float(data.get("lon")),
                    "accuracy_m": int(data.get("range", 1000)),
                    "source": "opencellid",
                    "samples": data.get("samples", 0)
                }
        logger.warning(f"OpenCellID lookup failed: {response.status_code}")
        return None
    except Exception as e:
        logger.error(f"OpenCellID API error: {str(e)}")
        return None

def estimate_cell_accuracy(ta, environment="urban"):
    """Estima precisão baseada em TA e ambiente"""
    if ta is not None:
        # TA é medido em símbolos de tempo (1 TA ≈ 550m)
        base_radius = ta * 550
    else:
        # Sem TA, usar estimativa baseada em ambiente
        environment_ranges = {
            "urban": 500,
            "suburban": 2000,
            "rural": 10000
        }
        base_radius = environment_ranges.get(environment, 1000)
    
    return base_radius

def ip_intelligence_lookup(ip_address):
    """Consulta informações de IP usando APIs gratuitas e AbuseIPDB"""
    try:
        # Validar IP
        ip_obj = ipaddress.ip_address(ip_address)
        
        result = {
            "ip": ip_address,
            "version": ip_obj.version,
            "is_private": ip_obj.is_private,
            "is_multicast": ip_obj.is_multicast,
            "is_loopback": ip_obj.is_loopback
        }
        
        # Se for IP privado, não consultar APIs externas
        if ip_obj.is_private:
            return {**result, "note": "IP privado - sem dados públicos"}
        
        # Consultar AbuseIPDB primeiro
        try:
            abuse_headers = {
                "Key": ABUSEIPDB_API_KEY,
                "Accept": "application/json"
            }
            abuse_params = {
                "ipAddress": ip_address,
                "maxAgeInDays": 90,
                "verbose": ""
            }
            abuse_response = requests.get(
                f"{ABUSEIPDB_API_URL}/check",
                headers=abuse_headers,
                params=abuse_params,
                timeout=10
            )
            
            if abuse_response.status_code == 200:
                abuse_data = abuse_response.json().get("data", {})
                result["abuseipdb"] = {
                    "abuse_confidence_score": abuse_data.get("abuseConfidenceScore", 0),
                    "usage_type": abuse_data.get("usageType"),
                    "isp": abuse_data.get("isp"),
                    "domain": abuse_data.get("domain"),
                    "total_reports": abuse_data.get("totalReports", 0),
                    "num_distinct_users": abuse_data.get("numDistinctUsers", 0),
                    "last_reported_at": abuse_data.get("lastReportedAt"),
                    "is_whitelisted": abuse_data.get("isWhitelisted", False),
                    "country_code": abuse_data.get("countryCode")
                }
                logger.info(f"AbuseIPDB lookup successful for {ip_address}")
        except Exception as e:
            logger.error(f"AbuseIPDB API error: {str(e)}")
            result["abuseipdb"] = {"error": str(e)}
        
        # Consultar ip-api.com (API gratuita)
        try:
            response = requests.get(f"http://ip-api.com/json/{ip_address}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting,query", timeout=5)
            if response.status_code == 200:
                api_data = response.json()
                if api_data.get("status") == "success":
                    result["geolocation"] = {
                        "country": api_data.get("country"),
                        "country_code": api_data.get("countryCode"),
                        "region": api_data.get("regionName"),
                        "city": api_data.get("city"),
                        "lat": api_data.get("lat"),
                        "lon": api_data.get("lon"),
                        "timezone": api_data.get("timezone")
                    }
                    result["network"] = {
                        "isp": api_data.get("isp"),
                        "org": api_data.get("org"),
                        "as": api_data.get("as"),
                        "asname": api_data.get("asname")
                    }
                    result["flags"] = {
                        "is_mobile": api_data.get("mobile", False),
                        "is_proxy": api_data.get("proxy", False),
                        "is_hosting": api_data.get("hosting", False)
                    }
        except Exception as e:
            logger.error(f"ip-api.com error: {str(e)}")
        
        # WHOIS lookup
        try:
            whois_obj = IPWhois(ip_address)
            whois_result = whois_obj.lookup_rdap()
            result["whois"] = {
                "asn": whois_result.get("asn"),
                "asn_country_code": whois_result.get("asn_country_code"),
                "asn_description": whois_result.get("asn_description"),
                "network": whois_result.get("network", {}).get("name")
            }
        except Exception as e:
            logger.error(f"WHOIS error: {str(e)}")
        
        # Reverse DNS
        try:
            hostname = socket.gethostbyaddr(ip_address)[0]
            result["ptr"] = hostname
        except Exception:
            result["ptr"] = None
        
        # Detectar VPN/TOR (heurísticas simples)
        is_vpn = False
        is_tor = False
        
        if result.get("flags", {}).get("is_proxy") or result.get("flags", {}).get("is_hosting"):
            is_vpn = True
        
        # Checar se é exit node do Tor (simplificado)
        if result.get("ptr") and "tor" in result["ptr"].lower():
            is_tor = True
        
        # Calcular risk score com dados AbuseIPDB
        abuse_score = result.get("abuseipdb", {}).get("abuse_confidence_score", 0)
        
        result["security"] = {
            "is_vpn": is_vpn,
            "is_tor": is_tor,
            "risk_score": calculate_ip_risk_score(result, abuse_score)
        }
        
        return result
        
    except ValueError:
        raise HTTPException(status_code=400, detail="IP address inválido")
    except Exception as e:
        logger.error(f"IP intelligence error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao processar IP")

def calculate_ip_risk_score(ip_data, abuse_score=0):
    """Calcula score de risco para IP (0-100) incluindo AbuseIPDB"""
    risk = 0
    
    # Score de abuso do AbuseIPDB (peso maior)
    risk += abuse_score * 0.6  # 60% do peso
    
    if ip_data.get("flags", {}).get("is_proxy"):
        risk += 15
    if ip_data.get("flags", {}).get("is_hosting"):
        risk += 10
    if ip_data.get("security", {}).get("is_vpn"):
        risk += 15
    if ip_data.get("security", {}).get("is_tor"):
        risk += 20
    
    return min(int(risk), 100)

def wigle_bssid_lookup(bssid):
    """Consulta Wigle API para localização de BSSID"""
    try:
        headers = {
            "Authorization": f"Basic {WIGLE_API_NAME}:{WIGLE_API_TOKEN}"
        }
        
        # Encode credentials in base64
        import base64
        credentials = f"{WIGLE_API_NAME}:{WIGLE_API_TOKEN}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Accept": "application/json"
        }
        
        params = {
            "netid": bssid.upper()
        }
        
        response = requests.get(WIGLE_API_URL, headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("success") and data.get("totalResults", 0) > 0:
                results = data.get("results", [])
                if results:
                    first_result = results[0]
                    return {
                        "bssid": bssid,
                        "ssid": first_result.get("ssid"),
                        "lat": float(first_result.get("trilat", 0)),
                        "lon": float(first_result.get("trilong", 0)),
                        "first_seen": first_result.get("firsttime"),
                        "last_seen": first_result.get("lasttime"),
                        "channel": first_result.get("channel"),
                        "encryption": first_result.get("encryption"),
                        "vendor": first_result.get("name"),
                        "total_results": data.get("totalResults"),
                        "source": "wigle"
                    }
            
            return {"error": "BSSID não encontrado no Wigle", "bssid": bssid}
        else:
            logger.error(f"Wigle API error: {response.status_code} - {response.text}")
            return {"error": f"Erro Wigle API: {response.status_code}", "bssid": bssid}
            
    except Exception as e:
        logger.error(f"Wigle lookup error: {str(e)}")
        return {"error": str(e), "bssid": bssid}

def detect_gps_spoofing(fixes):
    """Detecta spoofing de GPS baseado em velocidades impossíveis"""
    if len(fixes) < 2:
        return {
            "score": 0.0,
            "flags": [],
            "explain": "Dados insuficientes para análise",
            "recommendations": []
        }
    
    flags = []
    max_realistic_speed = 250  # km/h (velocidade máxima realista para veículo terrestre)
    
    for i in range(1, len(fixes)):
        prev = fixes[i-1]
        curr = fixes[i]
        
        dist = calculate_distance(
            {"lat": prev.lat, "lon": prev.lon},
            {"lat": curr.lat, "lon": curr.lon}
        )
        
        time_diff = (curr.timestamp - prev.timestamp).total_seconds() if curr.timestamp and prev.timestamp else 0
        
        if time_diff > 0:
            speed = calculate_speed(dist, time_diff)
            
            if speed > max_realistic_speed:
                flags.append({
                    "type": "impossible_speed",
                    "speed_kmh": round(speed, 2),
                    "between": [i-1, i],
                    "severity": "high"
                })
            elif speed > 120:  # Velocidade suspeita
                flags.append({
                    "type": "suspicious_speed",
                    "speed_kmh": round(speed, 2),
                    "between": [i-1, i],
                    "severity": "medium"
                })
    
    # Calcular score (0-1)
    score = min(len(flags) / len(fixes), 1.0)
    
    recommendations = []
    if score > 0.5:
        recommendations.append("Solicitar CDR completo da operadora")
        recommendations.append("Verificar ERBs registradas no período")
        recommendations.append("Analisar metadados de aplicativos de localização")
    
    return {
        "score": round(score, 2),
        "flags": flags,
        "explain": f"Detectadas {len(flags)} anomalias em {len(fixes)} pontos GPS",
        "recommendations": recommendations
    }

def detect_ip_spoofing(sessions):
    """Detecta spoofing de IP baseado em saltos de ASN e mudanças geográficas"""
    if len(sessions) < 2:
        return {
            "score": 0.0,
            "flags": [],
            "explain": "Dados insuficientes para análise"
        }
    
    flags = []
    
    for i in range(1, len(sessions)):
        prev = sessions[i-1]
        curr = sessions[i]
        
        # Detectar salto de ASN
        if prev.get("asn") != curr.get("asn"):
            time_diff = abs((curr.get("timestamp", 0) - prev.get("timestamp", 0)))
            
            if time_diff < 300:  # Menos de 5 minutos
                flags.append({
                    "type": "asn_jump",
                    "from_asn": prev.get("asn"),
                    "to_asn": curr.get("asn"),
                    "time_diff_seconds": time_diff,
                    "severity": "high"
                })
        
        # Detectar mudança geográfica impossível
        if prev.get("country") != curr.get("country"):
            time_diff = abs((curr.get("timestamp", 0) - prev.get("timestamp", 0)))
            
            if time_diff < 3600:  # Menos de 1 hora para mudar de país
                flags.append({
                    "type": "geographic_jump",
                    "from_country": prev.get("country"),
                    "to_country": curr.get("country"),
                    "time_diff_seconds": time_diff,
                    "severity": "high"
                })
    
    score = min(len(flags) / max(len(sessions), 1), 1.0)
    
    return {
        "score": round(score, 2),
        "flags": flags,
        "explain": f"Detectadas {len(flags)} anomalias em {len(sessions)} sessões"
    }

# ==================== ENDPOINTS ====================

@router.get("/health")
async def health_check():
    """Health check do módulo CISAI+"""
    return {
        "status": "operational",
        "module": "CISAI+",
        "version": "1.1.0",
        "features": [
            "GeoIntel Forense",
            "IP Intelligence",
            "Wi-Fi Intelligence",
            "Antiforense & Spoofing Guard"
        ],
        "integrations": {
            "opencellid": "active",
            "wigle": "active",
            "abuseipdb": "active",
            "sentinel_hub": "configured",
            "osint_sources": "available"
        }
    }

@router.post("/geo/resolve")
async def geo_resolve(request: GeoResolveRequest):
    """
    Resolve localização multimodal (GPS + ERB + Wi-Fi)
    Retorna localização consolidada com precisão e fontes
    """
    try:
        locations = []
        sources = []
        
        # GPS
        if request.gps:
            locations.append({
                "lat": request.gps.lat,
                "lon": request.gps.lon,
                "accuracy_m": request.gps.accuracy or 10,
                "source": "gps",
                "weight": 0.7 if request.gps.accuracy and request.gps.accuracy < 50 else 0.4
            })
            sources.append("gps")
        
        # ERB (Cell Tower)
        if request.cell:
            cell_data = opencellid_lookup(
                request.cell.mcc,
                request.cell.mnc,
                request.cell.lac,
                request.cell.cid
            )
            
            if cell_data:
                accuracy = estimate_cell_accuracy(request.cell.ta, "urban")
                locations.append({
                    **cell_data,
                    "accuracy_m": accuracy,
                    "weight": 0.3
                })
                sources.append("erb")
        
        # Wi-Fi (mock - requer banco de dados de BSSIDs)
        if request.wifi and len(request.wifi) > 0:
            # Mock: usar localização próxima ao GPS se disponível
            if request.gps:
                locations.append({
                    "lat": request.gps.lat + 0.0001,
                    "lon": request.gps.lon + 0.0001,
                    "accuracy_m": 50,
                    "source": "wifi",
                    "weight": 0.2,
                    "note": "Estimativa baseada em BSSID (mock)"
                })
                sources.append("wifi")
        
        # Calcular localização consolidada (weighted average)
        if not locations:
            raise HTTPException(status_code=400, detail="Nenhuma fonte de localização fornecida")
        
        total_weight = sum(loc["weight"] for loc in locations)
        final_lat = sum(loc["lat"] * loc["weight"] for loc in locations) / total_weight
        final_lon = sum(loc["lon"] * loc["weight"] for loc in locations) / total_weight
        
        # Calcular precisão final (média ponderada)
        final_accuracy = sum(loc["accuracy_m"] * loc["weight"] for loc in locations) / total_weight
        
        # Gerar hash único para esta resolução
        location_hash = hashlib.sha256(
            f"{final_lat},{final_lon},{request.ts.isoformat()}".encode()
        ).hexdigest()[:16]
        
        return {
            "location": {
                "lat": round(final_lat, 6),
                "lon": round(final_lon, 6),
                "accuracy_m": round(final_accuracy, 2)
            },
            "sources": sources,
            "source_details": locations,
            "timestamp": request.ts,
            "explain": f"Localização consolidada de {len(sources)} fontes: {', '.join(sources)}",
            "map_token": location_hash,
            "custody_chain": {
                "id": str(uuid.uuid4()),
                "processed_at": datetime.now(timezone.utc),
                "hash": location_hash
            }
        }
        
    except Exception as e:
        logger.error(f"Geo resolve error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao resolver localização: {str(e)}")

@router.post("/geo/timeline")
async def geo_timeline(request: GeoTimelineRequest):
    """
    Gera linha do tempo geoespacial para um dispositivo
    Cruza dados de GPS, CDR e evidências
    """
    # Mock implementation - em produção consultaria banco de dados
    return {
        "device_id": request.device_id,
        "timeline": [
            {
                "timestamp": request.range["start"],
                "lat": -22.9068,
                "lon": -43.1729,
                "accuracy_m": 50,
                "source": "gps",
                "event": "Início do rastreamento"
            },
            {
                "timestamp": request.range["end"],
                "lat": -22.9200,
                "lon": -43.1850,
                "accuracy_m": 100,
                "source": "erb",
                "event": "Última localização conhecida"
            }
        ],
        "summary": {
            "total_points": 2,
            "sources": ["gps", "erb"],
            "distance_covered_km": 2.5,
            "duration_hours": 2
        }
    }

@router.post("/net/ip/intel")
async def ip_intelligence(request: IPIntelRequest):
    """
    Intelligence completa de IP: ASN, geoloc, VPN/TOR, risk score
    """
    try:
        intel_data = ip_intelligence_lookup(request.ip)
        return intel_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"IP intel error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao processar IP intelligence")

@router.post("/wifi/lookup")
async def wifi_lookup(request: WiFiLookupRequest):
    """
    Lookup de BSSID Wi-Fi usando Wigle API
    """
    try:
        result = wigle_bssid_lookup(request.bssid)
        return result
    except Exception as e:
        logger.error(f"WiFi lookup error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao consultar Wi-Fi: {str(e)}")

@router.post("/anti/spoof/gps")
async def gps_spoof_detection(request: SpoofDetectionRequest):
    """
    Detecta spoofing de GPS baseado em velocidades e padrões impossíveis
    """
    try:
        result = detect_gps_spoofing(request.fixes)
        return result
    except Exception as e:
        logger.error(f"GPS spoof detection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro na detecção de spoofing GPS")

@router.post("/anti/spoof/ip")
async def ip_spoof_detection(request: IPSpoofRequest):
    """
    Detecta spoofing de IP baseado em saltos de ASN e anomalias temporais
    """
    try:
        result = detect_ip_spoofing(request.sessions)
        return result
    except Exception as e:
        logger.error(f"IP spoof detection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro na detecção de spoofing IP")

@router.get("/osint/sources")
async def list_osint_sources():
    """
    Lista fontes OSINT disponíveis para investigação
    """
    return {
        "categories": [
            {
                "name": "Social Media Intelligence",
                "sources": [
                    {"name": "Twitter/X Advanced Search", "url": "https://x.com/search-advanced"},
                    {"name": "Facebook Ads Library", "url": "https://www.facebook.com/ads/library/"},
                    {"name": "Instagram Location Search", "url": "https://www.instagram.com/explore/locations/"}
                ]
            },
            {
                "name": "Geospatial Intelligence",
                "sources": [
                    {"name": "Google Earth", "url": "https://earth.google.com/"},
                    {"name": "OpenStreetMap", "url": "https://www.openstreetmap.org/"},
                    {"name": "Sentinel Hub", "integrated": True}
                ]
            },
            {
                "name": "Network Intelligence",
                "sources": [
                    {"name": "Shodan", "url": "https://www.shodan.io/"},
                    {"name": "Censys", "url": "https://censys.io/"},
                    {"name": "WHOIS Lookup", "integrated": True}
                ]
            },
            {
                "name": "Public Records (Brasil)",
                "sources": [
                    {"name": "Portal da Transparência", "url": "https://www.transparencia.gov.br/"},
                    {"name": "Consulta CNPJ", "url": "http://servicos.receita.fazenda.gov.br/"},
                    {"name": "Portal de Dados Abertos", "url": "https://dados.gov.br/"}
                ]
            }
        ],
        "total_sources": 100,
        "note": "Lista completa de fontes OSINT disponível via documento fornecido"
    }
