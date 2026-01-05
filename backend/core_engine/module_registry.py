"""
MODULE REGISTRY - Registro Central de Módulos
Validador de Contratos
"""

import json
from pathlib import Path
from typing import Dict, List, Optional


class ModuleRegistry:
    """Registro central - APENAS módulos com contrato são aceitos"""
    
    REQUIRED_CONTRACT_FIELDS = {
        "module_path",
        "category",
        "engine_entrypoint",
        "states_supported",
        "produces_output",
        "logs_required"
    }
    
    def __init__(self, registry_path: Path = Path("/app/backend/athena_modules/contracts/registry.json")):
        self.registry_path = registry_path
        self.registry_path.parent.mkdir(exist_ok=True, parents=True)
        self.modules: Dict[str, Dict] = {}
        self.load_registry()
    
    def register_module(self, module_path: str, contract: Dict) -> bool:
        """REGISTRA APENAS SE CONTRATO VÁLIDO"""
        if not self._validate_contract(contract):
            raise ValueError(f"Contrato inválido para {module_path}: faltam campos obrigatórios")
        
        contract["module_path"] = module_path
        contract["registered_at"] = datetime.now(timezone.utc).isoformat()
        
        self.modules[module_path] = contract
        self.save_registry()
        
        return True
    
    def validate_module(self, module_path: str) -> bool:
        """VERIFICA SE MÓDULO É REAL"""
        return module_path in self.modules
    
    def get_module_contract(self, module_path: str) -> Optional[Dict]:
        """Obtém contrato de um módulo"""
        return self.modules.get(module_path)
    
    def list_modules_by_category(self, category: str) -> List[str]:
        """Lista módulos de uma categoria"""
        return [
            path for path, contract in self.modules.items()
            if contract.get("category") == category
        ]
    
    def get_prioritized_modules(self) -> List[str]:
        """Ordem de prioridade"""
        priority_map = {
            "Perícia & Investigação": 1,
            "Jurídico & Processos": 2,
            "Inteligência & OSINT": 3,
            "Tecnologia & IA": 4,
            "Gestão & Administração": 5,
            "Comunicação & Colaboração": 6,
            "Compliance & Segurança": 7
        }
        
        return sorted(
            self.modules.keys(),
            key=lambda m: priority_map.get(self.modules[m].get("category", ""), 99)
        )
    
    def get_stats(self) -> Dict:
        """Estatísticas do registro"""
        by_category = {}
        for contract in self.modules.values():
            cat = contract.get("category", "Unknown")
            by_category[cat] = by_category.get(cat, 0) + 1
        
        return {
            "total_modules": len(self.modules),
            "by_category": by_category,
            "categories": list(by_category.keys())
        }
    
    def _validate_contract(self, contract: Dict) -> bool:
        """Valida se contrato tem todos os campos"""
        return self.REQUIRED_CONTRACT_FIELDS.issubset(contract.keys())
    
    def load_registry(self):
        """Carrega registro do disco"""
        if self.registry_path.exists():
            with open(self.registry_path) as f:
                self.modules = json.load(f)
    
    def save_registry(self):
        """Salva registro no disco"""
        with open(self.registry_path, 'w') as f:
            json.dump(self.modules, f, indent=2)
