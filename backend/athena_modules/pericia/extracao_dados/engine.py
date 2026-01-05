"""
MOTOR REAL - Extração de Dados
Executa extração forense usando Athena Mobile Engine
"""

import asyncio
from pathlib import Path
from typing import Dict, Any
from datetime import datetime, timezone
import hashlib
import json

from athena_mobile.core.device_identifier import AthenaDeviceIdentifier
from athena_mobile.core.extraction_mode_selector import AthenaModeSelector
from athena_mobile.extractors.artifact_extractor import ArtifactExtractor
from core_engine.custody_chain import CustodyChain


async def execute(input_data: Dict, logger) -> Dict[str, Any]:
    """
    MOTOR EXECUTAVEL - Extração de Dados Móveis
    
    Input esperado:
        - tipo_dispositivo: str
        - marca: str
        - modelo: str
        - caso_id: str
    
    Output:
        - profile: Dict (perfil do dispositivo)
        - modo_recomendado: str
        - artifacts: List (artefatos extraídos)
        - hashes: Dict (SHA-256 de cada artefato)
    """
    
    logger.log("ENGINE_START", {"module": "extracao_dados", "input": input_data})
    
    try:
        # ETAPA 1: Identificar dispositivo
        logger.log("IDENTIFICANDO_DISPOSITIVO", {})
        
        evidence_path = Path("/app/backend/evidence/extracao") / input_data.get("caso_id", "default")
        evidence_path.mkdir(exist_ok=True, parents=True)
        
        identifier = AthenaDeviceIdentifier(evidence_path)
        device_type = input_data.get("tipo_dispositivo", "android").lower()
        profile = await identifier.identify_device(device_type)
        
        logger.log("DISPOSITIVO_IDENTIFICADO", {
            "manufacturer": profile.manufacturer,
            "model": profile.model,
            "risk_level": profile.forensic_risk_level
        })
        
        # ETAPA 2: Selecionar modo de extração
        logger.log("SELECIONANDO_MODO", {})
        
        selector = AthenaModeSelector()
        recommendation = selector.select_mode(profile.to_dict())
        
        logger.log("MODO_SELECIONADO", {
            "mode": recommendation.recommended_mode,
            "confidence": recommendation.confidence
        })
        
        # ETAPA 3: Extrair artefatos
        logger.log("EXTRAINDO_ARTEFATOS", {})
        
        extractor = ArtifactExtractor(evidence_path)
        artifacts_result = await extractor.extract_all_artifacts(profile.serial)
        
        logger.log("ARTEFATOS_EXTRAIDOS", {
            "count": artifacts_result["total_count"],
            "artifacts": len(artifacts_result["artifacts_extracted"])
        })
        
        # ETAPA 4: Cadeia de custódia
        custody = CustodyChain(profile.serial)
        custody.add_event(
            event_type="EXTRACAO_COMPLETA",
            actor=input_data.get("operator", "system"),
            details={
                "artifacts": artifacts_result["total_count"],
                "mode": recommendation.recommended_mode
            }
        )
        
        logger.log("CUSTODY_CHAIN_CREATED", {"integrity": custody.verify_integrity()})
        
        # ETAPA 5: Gerar resultado final
        result = {
            "status": "EXTRACAO_CONCLUIDA",
            "device_profile": profile.to_dict(),
            "extraction_mode": recommendation.recommended_mode,
            "confidence": recommendation.confidence,
            "artifacts": artifacts_result["artifacts_extracted"],
            "total_artifacts": artifacts_result["total_count"],
            "evidence_path": str(evidence_path),
            "custody_chain_integrity": custody.verify_integrity(),
            "logs": logger.get_logs()
        }
        
        logger.log("ENGINE_COMPLETED", {"success": True})
        
        return result
        
    except Exception as e:
        logger.log_error(e, {"module": "extracao_dados"})
        raise
