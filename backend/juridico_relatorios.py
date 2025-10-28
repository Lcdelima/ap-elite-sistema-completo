"""
Relatórios Avançados
Dashboards, Gráficos, Export Excel/PDF
"""

from fastapi import APIRouter, Response
from datetime import datetime, timedelta
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json

router = APIRouter(prefix="/api/juridico/relatorios", tags=["Relatórios Avançados"])

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client.ap_elite_db

@router.get("/dashboard")
async def dashboard_juridico():
    """Dashboard com KPIs principais"""
    
    # Processos por fase
    pipeline = [
        {"$group": {"_id": "$fase", "count": {"$sum": 1}}}
    ]
    processos_fase = await db.processos.aggregate(pipeline).to_list(100)
    
    # Prazos próximos
    hoje = datetime.now()
    proximos_7d = hoje + timedelta(days=7)
    
    prazos_proximos = await db.prazos.count_documents({
        "data_limite": {"$gte": hoje.isoformat(), "$lte": proximos_7d.isoformat()},
        "status": "aberto"
    })
    
    # Documentação
    total_docs = await db.biblioteca.count_documents({})
    
    return {
        "success": True,
        "kpis": {
            "processos_por_fase": {item["_id"]: item["count"] for item in processos_fase},
            "prazos_proximos_7d": prazos_proximos,
            "total_documentos": total_docs
        }
    }

@router.post("/export")
async def exportar_relatorio(formato: str = "json"):
    """Exporta relatório em JSON/CSV"""
    
    processos = await db.processos.find({}).to_list(1000)
    
    if formato == "json":
        return {
            "success": True,
            "data": processos,
            "format": "json"
        }
    
    # CSV simples
    csv_lines = ["Numero,Cliente,Juizo,Fase,Status"]
    for p in processos:
        csv_lines.append(f"{p.get('numero')},{p.get('cliente_id')},{p.get('juizo')},{p.get('fase')},{p.get('status')}")
    
    csv_content = "\n".join(csv_lines)
    
    return Response(content=csv_content, media_type="text/csv", headers={
        "Content-Disposition": "attachment; filename=processos.csv"
    })
