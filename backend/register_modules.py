"""
Script para registrar todos os módulos no Core Engine
Executa na inicialização do sistema
"""

import json
from pathlib import Path
import sys

# Adiciona backend ao path
sys.path.insert(0, '/app/backend')

from core_engine.module_registry import ModuleRegistry


def register_all_modules():
    """Registra todos os módulos com contratos válidos"""
    
    registry = ModuleRegistry()
    contracts_dir = Path("/app/backend/athena_modules/contracts")
    
    if not contracts_dir.exists():
        print("⚠️ Diretório de contratos não existe")
        return
    
    registered_count = 0
    failed_count = 0
    
    # Busca todos os arquivos .json no diretório de contratos
    for contract_file in contracts_dir.glob("*.json"):
        try:
            with open(contract_file) as f:
                contract = json.load(f)
            
            module_path = contract.get("module_path")
            if not module_path:
                print(f"❌ {contract_file.name}: falta module_path")
                failed_count += 1
                continue
            
            registry.register_module(module_path, contract)
            print(f"✅ Registrado: {module_path}")
            registered_count += 1
            
        except Exception as e:
            print(f"❌ Erro em {contract_file.name}: {e}")
            failed_count += 1
    
    print(f"\n📊 Resumo:")
    print(f"   Registrados: {registered_count}")
    print(f"   Falhas: {failed_count}")
    print(f"\n🎯 Registry salvo em: {registry.registry_path}")
    
    return registered_count


if __name__ == "__main__":
    count = register_all_modules()
    sys.exit(0 if count > 0 else 1)
