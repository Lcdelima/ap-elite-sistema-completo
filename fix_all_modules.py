#!/usr/bin/env python3
"""
Script para corrigir TODOS os módulos Athena de uma vez
"""

import re
from pathlib import Path

ATHENA_DIR = Path("/app/frontend/src/pages/athena")

# Template de formData completo
FORM_DATA_TEMPLATE = """{
    title: '',
    type: '',
    category: '',
    priority: '',
    date: '',
    description: ''
  }"""

# Template de formulário completo
FORM_FIELDS_TEMPLATE = """              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <option value="">Selecione o tipo...</option>
                    <option value="tipo1">Tipo 1</option>
                    <option value="tipo2">Tipo 2</option>
                    <option value="tipo3">Tipo 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria*</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="alta">Alta Prioridade</option>
                    <option value="media">Média Prioridade</option>
                    <option value="baixa">Baixa Prioridade</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
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

# Template de reset do formData
RESET_TEMPLATE = """onClick={() => {
                    setShowModal(false);
                    setFormData({
                      title: '',
                      type: '',
                      category: '',
                      priority: '',
                      date: '',
                      description: ''
                    });
                  }}"""

def fix_module(file_path):
    """Corrige um módulo específico"""
    try:
        content = file_path.read_text(encoding='utf-8')
        
        # Verifica se precisa correção
        if 'placeholder="Digite o nome..."' not in content:
            return False, "Já corrigido"
        
        original_content = content
        
        # 1. Corrige formData initialization
        content = re.sub(
            r'const \[formData, setFormData\] = useState\(\{\}\);',
            f'const [formData, setFormData] = useState({FORM_DATA_TEMPLATE});',
            content
        )
        
        # 2. Substitui formulário incompleto
        old_form = r'<div>\s*<label className="block text-sm font-semibold text-gray-700 mb-2">Nome\*</label>\s*<input\s*type="text"\s*required\s*className="w-full px-3 py-2 border border-gray-300 rounded-lg"\s*placeholder="Digite o nome\.\.\."\s*/>\s*</div>'
        
        content = re.sub(old_form, FORM_FIELDS_TEMPLATE, content, flags=re.DOTALL)
        
        # 3. Corrige o botão cancelar
        content = re.sub(
            r'onClick=\{\(\) => setShowModal\(false\)\}',
            RESET_TEMPLATE,
            content
        )
        
        # Salva se houve mudanças
        if content != original_content:
            file_path.write_text(content, encoding='utf-8')
            return True, "Corrigido"
        else:
            return False, "Sem mudanças"
            
    except Exception as e:
        return False, f"Erro: {str(e)}"

def main():
    print("=" * 60)
    print("🔧 CORREÇÃO EM MASSA - TODOS OS MÓDULOS ATHENA")
    print("=" * 60)
    print()
    
    # Lista todos os arquivos JSX
    all_files = sorted(ATHENA_DIR.glob("*.jsx"))
    
    # Módulos já corrigidos manualmente
    corrected = [
        "DataExtraction.jsx",
        "EvidenceProcessing.jsx",
        "Forensics.jsx",
        "USBForensicsPro.jsx",
        "ProcessAnalysisComplete.jsx",
        "PericiaDigitalPro.jsx",
        "UltraExtractionPro.jsx",
        "PasswordRecoveryElite.jsx",
        "DataRecoveryUltimate.jsx",
        "PhoneInterceptionsEnhanced.jsx",
        "DocumentLibraryComplete.jsx"
    ]
    
    print(f"📁 Total de arquivos encontrados: {len(all_files)}")
    print(f"✅ Já corrigidos manualmente: {len(corrected)}")
    print()
    
    success_count = 0
    skip_count = 0
    error_count = 0
    
    print("🚀 Iniciando correção automática...")
    print()
    
    for file_path in all_files:
        if file_path.name in corrected:
            skip_count += 1
            continue
            
        success, message = fix_module(file_path)
        
        if success:
            print(f"✅ {file_path.name:45} - {message}")
            success_count += 1
        elif "Erro" in message:
            print(f"❌ {file_path.name:45} - {message}")
            error_count += 1
        else:
            skip_count += 1
    
    print()
    print("=" * 60)
    print("📊 RESULTADO FINAL")
    print("=" * 60)
    print(f"✅ Corrigidos agora:     {success_count}")
    print(f"⏭️  Já corrigidos antes:  {len(corrected)}")
    print(f"⚠️  Pulados:             {skip_count}")
    print(f"❌ Erros:               {error_count}")
    print(f"📈 Total processado:    {len(all_files)}")
    print()
    print(f"🎉 PROGRESSO TOTAL: {success_count + len(corrected)}/{len(all_files)} ({(success_count + len(corrected))/len(all_files)*100:.1f}%)")
    print("=" * 60)

if __name__ == "__main__":
    main()
