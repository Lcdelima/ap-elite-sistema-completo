"""Módulo 4: Interceptações Telemáticas (Dados e Apps)"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/telematics", tags=["Interceptações Telemáticas"])

# Models
class TelematicsImport(BaseModel):
    case_number: str
    legal_basis: str
    data_type: str  # pcap, har, json, whatsapp, telegram
    date_range_start: str
    date_range_end: str

class DataPacket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    case_number: str
    packet_type: str  # network, app_data, message
    source_ip: Optional[str] = None
    dest_ip: Optional[str] = None
    protocol: Optional[str] = None
    timestamp: datetime
    data: Dict
    decoded: bool = False

class FlowAnalysis(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    case_number: str
    source: str
    destination: str
    protocol: str
    packets_count: int
    bytes_total: int
    duration_seconds: int
    suspicious: bool = False

# Storage
packets_db = {}
flows_db = {}

@router.post("/import")
async def import_telematic_data(
    data: TelematicsImport,
    files: List[UploadFile] = File(...)
):
    """Importa dados telemáticos (PCAP, HAR, logs, etc)"""
    
    imported_packets = []
    
    # Simular importação de pacotes
    for i in range(10):
        packet = DataPacket(
            case_number=data.case_number,
            packet_type="network",
            source_ip=f"192.168.1.{i+1}",
            dest_ip=f"8.8.8.{i+1}",
            protocol="HTTPS",
            timestamp=datetime.utcnow(),
            data={
                "method": "GET",
                "url": f"https://example.com/api/data{i}",
                "status": 200,
                "size": 1024 * (i+1)
            }
        )
        packets_db[packet.id] = packet
        imported_packets.append(packet)
    
    return {
        "status": "success",
        "case_number": data.case_number,
        "imported_packets": len(imported_packets),
        "data_type": data.data_type
    }

@router.post("/decode")
async def decode_packets(case_number: str):
    """Decodifica pacotes telemáticos"""
    
    case_packets = [p for p in packets_db.values() if p.case_number == case_number]
    
    if not case_packets:
        raise HTTPException(status_code=404, detail="Nenhum pacote encontrado para este caso")
    
    decoded_count = 0
    for packet in case_packets:
        if not packet.decoded:
            packet.decoded = True
            decoded_count += 1
    
    return {
        "case_number": case_number,
        "total_packets": len(case_packets),
        "decoded_packets": decoded_count
    }

@router.get("/flows/{case_number}")
async def analyze_flows(case_number: str):
    """Analisa fluxos de comunicação"""
    
    # Simular análise de fluxos
    flows = []
    
    for i in range(5):
        flow = FlowAnalysis(
            case_number=case_number,
            source=f"192.168.1.{i+1}",
            destination=f"8.8.8.{i+1}",
            protocol="HTTPS",
            packets_count=100 + i * 10,
            bytes_total=1024 * 1024 * (i+1),
            duration_seconds=300 + i * 60,
            suspicious=i % 3 == 0
        )
        flows_db[flow.id] = flow
        flows.append(flow)
    
    return {
        "case_number": case_number,
        "total_flows": len(flows),
        "suspicious_flows": len([f for f in flows if f.suspicious]),
        "flows": flows
    }

@router.get("/packets")
async def list_packets(
    case_number: Optional[str] = None,
    protocol: Optional[str] = None,
    decoded: Optional[bool] = None
):
    """Lista pacotes com filtros"""
    packets = list(packets_db.values())
    
    if case_number:
        packets = [p for p in packets if p.case_number == case_number]
    if protocol:
        packets = [p for p in packets if p.protocol == protocol]
    if decoded is not None:
        packets = [p for p in packets if p.decoded == decoded]
    
    return {
        "total": len(packets),
        "packets": packets
    }

@router.post("/report")
async def generate_report(case_number: str, format: str = "pdf"):
    """Gera relatório de interceptações telemáticas"""
    
    case_packets = [p for p in packets_db.values() if p.case_number == case_number]
    case_flows = [f for f in flows_db.values() if f.case_number == case_number]
    
    if not case_packets and not case_flows:
        raise HTTPException(status_code=404, detail="Nenhum dado encontrado para este caso")
    
    # Analisar IPs únicos
    unique_ips = set()
    for p in case_packets:
        if p.source_ip:
            unique_ips.add(p.source_ip)
        if p.dest_ip:
            unique_ips.add(p.dest_ip)
    
    report = {
        "type": "pades" if format == "pdf" else "json",
        "case_number": case_number,
        "total_packets": len(case_packets),
        "decoded_packets": len([p for p in case_packets if p.decoded]),
        "total_flows": len(case_flows),
        "suspicious_flows": len([f for f in case_flows if f.suspicious]),
        "unique_ips": len(unique_ips),
        "protocols": list(set([p.protocol for p in case_packets if p.protocol])),
        "generated_at": datetime.utcnow().isoformat(),
        "digital_signature": "SHA256-RSA"
    }
    
    return report

@router.get("/network/diagram/{case_number}")
async def get_network_diagram(case_number: str):
    """Gera diagrama de rede das comunicações"""
    
    case_flows = [f for f in flows_db.values() if f.case_number == case_number]
    
    # Criar estrutura para diagrama (formato D3.js)
    nodes = set()
    links = []
    
    for flow in case_flows:
        nodes.add(flow.source)
        nodes.add(flow.destination)
        links.append({
            "source": flow.source,
            "target": flow.destination,
            "value": flow.packets_count,
            "suspicious": flow.suspicious
        })
    
    return {
        "case_number": case_number,
        "nodes": [{ "id": node, "group": 1 } for node in nodes],
        "links": links
    }

@router.get("/stats")
async def get_stats():
    """Estatísticas do módulo"""
    return {
        "total_packets": len(packets_db),
        "decoded_packets": len([p for p in packets_db.values() if p.decoded]),
        "total_flows": len(flows_db),
        "suspicious_flows": len([f for f in flows_db.values() if f.suspicious])
    }

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "module": "Interceptações Telemáticas",
        "version": "1.0.0"
    }
