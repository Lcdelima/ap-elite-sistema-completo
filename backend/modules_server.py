"""
Servidor Principal - AP Elite Sistema Completo
Integra TODOS os 16 módulos de Perícia & Investigação
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar TODOS os 16 módulos
from modules import (
    forensics_digital,
    forensics_advanced,
    telephony_interceptions,
    telematics_interceptions,
    data_extraction,
    data_extraction_advanced,
    erbs_analysis,
    erbs_radiobase,
    erbs_advanced,
    erbs_geospatial,
    iped_integration,
    evidence_processing,
    custody_chain,
    processing_advanced,
    evidence_advanced,
    evidence_ai
)

app = FastAPI(
    title="AP Elite - Sistema Completo de Perícia Digital",
    description="Sistema CISAI Forensics 4.0 com 16 módulos especializados",
    version="4.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir TODOS os 16 routers
app.include_router(forensics_digital.router)              # 1. Perícia Digital
app.include_router(forensics_advanced.router)             # 2. Perícia Digital Aprimorada
app.include_router(telephony_interceptions.router)        # 3. Interceptações Telefônicas
app.include_router(telematics_interceptions.router)       # 4. Interceptações Telemáticas
app.include_router(data_extraction.router)                # 5. Extração de Dados
app.include_router(data_extraction_advanced.router)       # 6. Extração Aprimorada com IA
app.include_router(erbs_analysis.router)                  # 7. Análise de ERBs
app.include_router(erbs_radiobase.router)                 # 8. Extração de Radiobase
app.include_router(erbs_advanced.router)                  # 9. ERBs Aprimoradas (GeoIntel 3D)
app.include_router(erbs_geospatial.router)                # 10. Análise Geoespacial
app.include_router(iped_integration.router)               # 11. Integração IPED
app.include_router(evidence_processing.router)            # 12. Processamento de Evidências
app.include_router(custody_chain.router)                  # 13. Cadeia de Custódia
app.include_router(processing_advanced.router)            # 14. Processamento Aprimorado
app.include_router(evidence_advanced.router)              # 15. Processamento Avançado
app.include_router(evidence_ai.router)                    # 16. Análise com IA

@app.get("/")
async def root():
    return {
        "message": "AP Elite - Sistema Completo de Perícia Digital",
        "version": "4.0.0",
        "modules": 16,
        "status": "operational"
    }

@app.get("/health")
async def health():
    """Health check geral do sistema"""
    return {
        "status": "ok",
        "system": "AP Elite CISAI Forensics 4.0",
        "modules_active": 16,
        "modules": [
            {"id": 1, "name": "Perícia Digital", "prefix": "/api/forensics/digital"},
            {"id": 2, "name": "Perícia Digital Aprimorada", "prefix": "/api/forensics/advanced"},
            {"id": 3, "name": "Interceptações Telefônicas", "prefix": "/api/telephony"},
            {"id": 4, "name": "Interceptações Telemáticas", "prefix": "/api/telematics"},
            {"id": 5, "name": "Extração de Dados", "prefix": "/api/extraction"},
            {"id": 6, "name": "Extração Aprimorada com IA", "prefix": "/api/extraction/advanced"},
            {"id": 7, "name": "Análise de ERBs", "prefix": "/api/erbs"},
            {"id": 8, "name": "Extração de Radiobase", "prefix": "/api/erbs/radiobase"},
            {"id": 9, "name": "ERBs Aprimoradas", "prefix": "/api/erbs/advanced"},
            {"id": 10, "name": "Análise Geoespacial", "prefix": "/api/geo/erbs"},
            {"id": 11, "name": "IPED Integration", "prefix": "/api/iped"},
            {"id": 12, "name": "Processamento de Evidências", "prefix": "/api/evidence"},
            {"id": 13, "name": "Cadeia de Custódia", "prefix": "/api/custody"},
            {"id": 14, "name": "Processamento Aprimorado", "prefix": "/api/processing/advanced"},
            {"id": 15, "name": "Processamento Avançado", "prefix": "/api/processing/evidence-advanced"},
            {"id": 16, "name": "Análise com IA", "prefix": "/api/evidence-ai"}
        ]
    }

@app.get("/api/stats/global")
async def global_stats():
    """Estatísticas globais do sistema"""
    return {
        "system": "AP Elite CISAI 4.0",
        "modules_count": 16,
        "features": [
            "Upload de arquivos >4TB com chunks",
            "Cadeia de custódia automatizada",
            "IA forense integrada",
            "Análise geoespacial 3D",
            "Interceptações com transcrição",
            "RAG probatório",
            "Laudos PAdES automatizados"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
