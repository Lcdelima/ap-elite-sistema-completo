"""
ATHENA ORCHESTRATOR - Cérebro Central
Coordena TODOS os módulos do sistema
"""

from typing import Dict, Any
from core_engine.module_registry import ModuleRegistry
from core_engine.job_manager import JobManager


class AthenaOrchestrator:
    """Orquestrador central - controla tudo"""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.registry = ModuleRegistry()
        self.job_manager = JobManager()
        self._initialized = True
        
        print("✅ Athena Orchestrator inicializado")
    
    async def execute(self, module_path: str, input_data: Dict, operator: str = "system") -> Dict:
        """
        EXECUTA QUALQUER MÓDULO VALIDADO
        
        Args:
            module_path: Caminho do módulo (ex: 'pericia/extracao_dados')
            input_data: Dados de entrada
            operator: Quem está executando
        
        Returns:
            Status do job com resultado
        """
        # 1. Valida se módulo existe no registro
        if not self.registry.validate_module(module_path):
            return {
                "status": "error",
                "message": f"Módulo {module_path} não registrado",
                "suggestion": "Módulo precisa de contrato válido para executar"
            }
        
        # 2. Cria job
        job_id = self.job_manager.create_job(module_path, input_data, operator)
        
        # 3. Executa job
        result = await self.job_manager.execute_job(job_id)
        
        return result
    
    def register_module(self, module_path: str, contract: Dict) -> bool:
        """Registra novo módulo"""
        return self.registry.register_module(module_path, contract)
    
    def get_registry_stats(self) -> Dict:
        """Estatísticas do registro"""
        return self.registry.get_stats()
    
    def list_jobs(self, module_path: str = None) -> list:
        """Lista jobs executados"""
        return self.job_manager.list_jobs(module_path)


# Singleton global
orchestrator = AthenaOrchestrator()
