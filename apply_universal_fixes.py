#!/usr/bin/env python3
"""
Script para aplicar correções universais a todos os módulos Athena
com formulários incompletos.
"""

import os
import re
from pathlib import Path

# Diretório dos módulos Athena
ATHENA_DIR = Path("/app/frontend/src/pages/athena")

# Template genérico de formData inicializado
GENERIC_FORM_DATA = """{
    title: '',
    description: '',
    type: '',
    priority: '',
    status: '',
    responsible: ''
  }"""

# Template de campos genéricos para formulário
GENERIC_FORM_FIELDS = """              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Título*</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Digite o título..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo*</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="tipo1">Tipo 1</option>
                    <option value="tipo2">Tipo 2</option>
                    <option value="tipo3">Tipo 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prioridade*</label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Responsável</label>
                  <input
                    type="text"
                    value={formData.responsible}
                    onChange={(e) => setFormData({...formData, responsible: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Nome do responsável..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Descreva os detalhes..."
                />
              </div>"""

def find_incomplete_modules():
    """Encontra todos os módulos com formulários incompletos."""
    incomplete = []
    
    for file_path in ATHENA_DIR.glob("*.jsx"):
        try:
            content = file_path.read_text(encoding='utf-8')
            
            # Verifica se tem o padrão de formulário incompleto
            if 'placeholder="Digite o nome..."' in content and 'formData' in content:
                incomplete.append(file_path.name)
        except Exception as e:
            print(f"❌ Erro ao ler {file_path.name}: {e}")
    
    return incomplete

def fix_form_data_initialization(content):
    """Corrige a inicialização do formData."""
    # Encontra o padrão atual de formData vazio
    pattern = r"const \[formData, setFormData\] = useState\(\{\}\);"
    replacement = f"const [formData, setFormData] = useState({GENERIC_FORM_DATA});"
    
    return re.sub(pattern, replacement, content)

def fix_form_fields(content):
    """Substitui o campo único por múltiplos campos."""
    # Encontra o padrão do formulário incompleto
    pattern = r'<div>\s*<label className="block text-sm font-semibold text-gray-700 mb-2">Nome\*</label>\s*<input\s*type="text"\s*required\s*className="w-full px-3 py-2 border border-gray-300 rounded-lg"\s*placeholder="Digite o nome\.\.\."\s*/>\s*</div>'
    
    return re.sub(pattern, GENERIC_FORM_FIELDS, content, flags=re.DOTALL)

def add_form_reset(content):
    """Adiciona reset do formData no botão cancelar."""
    # Procura pelo botão cancelar e adiciona reset
    pattern = r'onClick=\{\(\) => setShowModal\(false\)\}'
    replacement = '''onClick={() => {
                    setShowModal(false);
                    setFormData({
                      title: '',
                      description: '',
                      type: '',
                      priority: '',
                      status: '',
                      responsible: ''
                    });
                  }}'''
    
    return re.sub(pattern, replacement, content)

def main():
    print("🔍 Procurando módulos com formulários incompletos...")
    incomplete_modules = find_incomplete_modules()
    
    print(f"\n📊 Encontrados {len(incomplete_modules)} módulos incompletos:")
    for module in incomplete_modules[:10]:  # Mostra apenas os primeiros 10
        print(f"   - {module}")
    
    if len(incomplete_modules) > 10:
        print(f"   ... e mais {len(incomplete_modules) - 10} módulos")
    
    print(f"\n✅ Total de módulos a serem corrigidos: {len(incomplete_modules)}")
    print("\n💡 Para aplicar correções, execute as funções de correção individualmente")
    print("   ou processe em lotes para evitar sobrecarga.")

if __name__ == "__main__":
    main()
