"""
ATHENA - MOTOR DE SELEÇÃO INTELIGENTE DE MODO
ISO 27037 Compliant - Menos invasivo primeiro
"""

from enum import Enum
from dataclasses import dataclass, asdict
from typing import Dict, List, Tuple
import json
from datetime import datetime, timezone


class ExtractionMode(str, Enum):
    """Modos de extração (do menos ao mais invasivo)"""
    LOGICAL = "logical"
    FILESYSTEM = "filesystem"
    PHYSICAL = "physical"
    ADVANCED = "advanced"
    CHIPOFF = "chipoff"


@dataclass
class ModeRecommendation:
    """Recomendação de modo com justificativa"""
    recommended_mode: str
    confidence: float
    alternatives: List[Dict]
    risk_factors: List[str]
    methodology: str
    legal_justification: str
    timestamp: str
    
    def to_dict(self) -> Dict:
        return asdict(self)


class AthenaModeSelector:
    """Seletor inteligente de modo de extração"""
    
    def __init__(self):
        self.decision_log = []
    
    def select_mode(self, profile_dict: Dict) -> ModeRecommendation:
        """Motor de decisão inteligente - LOG TRANSPARENTE"""
        decision_factors = self._analyze_profile(profile_dict)
        mode_scores = self._calculate_mode_scores(decision_factors)
        recommendation = self._select_best_mode(mode_scores, profile_dict)
        
        self.decision_log.append({
            "profile_hash": profile_dict.get("hash_id"),
            "factors": decision_factors,
            "scores": mode_scores,
            "recommendation": recommendation.recommended_mode,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return recommendation
    
    def _analyze_profile(self, profile: Dict) -> Dict[str, float]:
        """Análise detalhada do perfil"""
        factors = {}
        
        # Encryption
        if profile.get("encryption_status") == "FULL_DISK_ENCRYPTION":
            factors["encryption_full"] = 1.0
        elif profile.get("encryption_status") == "PARTIAL_ENCRYPTION":
            factors["encryption_partial"] = 0.7
        else:
            factors["no_encryption"] = 0.0
        
        # Bootloader
        if profile.get("bootloader_status") == "LOCKED":
            factors["bootloader_locked"] = 1.0
        elif profile.get("bootloader_status") == "UNLOCKED":
            factors["bootloader_unlocked"] = 1.0
        
        # Root
        if not profile.get("root_status", False):
            factors["no_root"] = 1.0
        else:
            factors["root_detected"] = 1.0
        
        # Patch de segurança
        patch = profile.get("security_patch", "")
        if patch and patch > "2024-01-01":
            factors["recent_patch"] = 1.0
        else:
            factors["old_patch"] = 1.0
        
        # Risco geral
        risk_map = {"LOW": 0.2, "MEDIUM": 0.5, "HIGH": 0.8, "CRITICAL": 1.0}
        factors["risk_level"] = risk_map.get(profile.get("forensic_risk_level"), 0.5)
        
        return factors
    
    def _calculate_mode_scores(self, factors: Dict[str, float]) -> Dict[str, float]:
        """Calcula score para cada modo"""
        scores = {}
        
        # Logical sempre disponível
        scores[ExtractionMode.LOGICAL.value] = 1.0
        
        # FileSystem se não FULL encryption
        scores[ExtractionMode.FILESYSTEM.value] = 1.0 - factors.get("encryption_full", 0)
        
        # Physical precisa bootloader ou root
        scores[ExtractionMode.PHYSICAL.value] = (
            factors.get("bootloader_unlocked", 0) + factors.get("root_detected", 0)
        ) / 2
        
        # Advanced para casos extremos
        scores[ExtractionMode.ADVANCED.value] = factors.get("risk_level", 0) * 0.8
        
        # Chip-off sempre último recurso
        scores[ExtractionMode.CHIPOFF.value] = factors.get("risk_level", 0) * 0.3
        
        return {k: max(0.0, min(1.0, v)) for k, v in scores.items()}
    
    def _select_best_mode(self, scores: Dict[str, float], profile: Dict) -> ModeRecommendation:
        """Seleciona melhor modo com alternativas"""
        best_mode = max(scores, key=scores.get)
        confidence = scores[best_mode]
        
        alternatives = sorted(
            [(k, v) for k, v in scores.items() if k != best_mode],
            key=lambda x: x[1],
            reverse=True
        )[:2]
        
        alternatives_list = [{"mode": k, "confidence": v} for k, v in alternatives]
        
        risk_factors = self._get_risk_factors(confidence)
        methodology, justification = self._get_methodology(best_mode)
        
        return ModeRecommendation(
            recommended_mode=best_mode,
            confidence=confidence,
            alternatives=alternatives_list,
            risk_factors=risk_factors,
            methodology=methodology,
            legal_justification=justification,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
    
    def _get_risk_factors(self, confidence: float) -> List[str]:
        """Fatores de risco da decisão"""
        if confidence < 0.4:
            return ["BAIXA CONFIANÇA", "CONSULTAR ESPECIALISTA"]
        elif confidence < 0.7:
            return ["MÉDIA CONFIANÇA", "VALIDAR MANUALMENTE"]
        return ["ALTA CONFIANÇA"]
    
    def _get_methodology(self, mode: str) -> Tuple[str, str]:
        """Metodologia pericial para cada modo"""
        methodologies = {
            "logical": (
                "Extração via APIs públicas do SO (Content Providers)",
                "Método não-invasivo, 100% reproduzível, aceito universalmente"
            ),
            "filesystem": (
                "Acesso read-only ao sistema de arquivos via ADB/MTP",
                "Preserva integridade, permite hash por bloco"
            ),
            "physical": (
                "Dump de partições via bootloader/exploit documentado",
                "Requer justificativa técnica explícita"
            ),
            "advanced": (
                "Exploits versionados + ISP (JTAG/Chip-off preparado)",
                "Somente com autorização judicial específica"
            ),
            "chipoff": (
                "Extração física do chip NAND (último recurso)",
                "Destrutivo, requer laboratório especializado"
            )
        }
        return methodologies.get(mode, ("N/A", "N/A"))
