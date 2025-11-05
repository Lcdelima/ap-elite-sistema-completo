"""Feature Flags baseados em dependências - Elite Athena"""
import os
from typing import Dict


class FeatureFlags:
    """Gerenciador de feature flags"""
    
    @staticmethod
    def get_flags() -> Dict[str, bool]:
        """Retorna status de todas as features"""
        return {
            # Core features (sempre disponíveis)
            "core": {
                "auth": True,
                "cases": True,
                "documents": True,
                "clients": True
            },
            
            # Features dependentes de integrações
            "erbs_analysis": bool(os.getenv('POSTGRES_URL') and os.getenv('GOOGLE_MAPS_API_KEY')),
            "advanced_ocr": bool(os.getenv('TESSERACT_PATH')),
            "video_analysis": bool(os.getenv('FFMPEG_PATH')),
            "cloud_storage": bool(os.getenv('AWS_ACCESS_KEY_ID')),
            "payment_processing": bool(os.getenv('STRIPE_SECRET_KEY') or os.getenv('PAGBANK_TOKEN')),
            "ai_features": bool(os.getenv('EMERGENT_LLM_KEY')),
            "session_caching": bool(os.getenv('REDIS_URL')),
            
            # Features de perícia
            "forensic_tools": {
                "evidence_vault": True,
                "elite_seal": True,
                "hash_verification": True,
                "chain_of_custody": True
            }
        }
    
    @staticmethod
    def is_enabled(feature_name: str) -> bool:
        """Verifica se uma feature está habilitada"""
        flags = FeatureFlags.get_flags()
        return flags.get(feature_name, False)
    
    @staticmethod
    def require_feature(feature_name: str) -> None:
        """Lança exceção se feature não estiver disponível"""
        if not FeatureFlags.is_enabled(feature_name):
            raise ValueError(
                f"Feature '{feature_name}' não disponível. "
                f"Verifique as dependências necessárias em /api/health/dependencies"
            )
