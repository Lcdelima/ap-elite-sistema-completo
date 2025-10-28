#!/usr/bin/env python3
"""
Script para corrigir botões dos formulários em todos os módulos
"""

import re
from pathlib import Path

ATHENA_DIR = Path("/app/frontend/src/pages/athena")

# Template correto de botões
CORRECT_BUTTONS_TEMPLATE = """              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      title: '',
                      type: '',
                      category: '',
                      priority: '',
                      date: '',
                      description: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Item'}
                </button>
              </div>"""

def fix_buttons(file_path):
    """Corrige os botões do formulário"""
    try:
        content = file_path.read_text(encoding='utf-8')
        original = content
        
        # Padrão para encontrar a seção de botões problemática
        pattern = r'<div className="flex gap-2 pt-4">.*?</div>\s*</form>'
        
        # Substitui pela versão correta
        replacement = CORRECT_BUTTONS_TEMPLATE + '\n            </form>'
        
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
        if content != original:
            file_path.write_text(content, encoding='utf-8')
            return True, "Botões corrigidos"
        else:
            return False, "Sem alterações"
            
    except Exception as e:
        return False, f"Erro: {str(e)}"

def main():
    print("=" * 60)
    print("🔧 CORREÇÃO DE BOTÕES - TODOS OS MÓDULOS")
    print("=" * 60)
    print()
    
    all_files = sorted(ATHENA_DIR.glob("*.jsx"))
    
    # Módulos que já têm botões customizados corretos
    skip_files = [
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
    
    success_count = 0
    skip_count = 0
    
    print("🚀 Corrigindo botões dos formulários...")
    print()
    
    for file_path in all_files:
        if file_path.name in skip_files:
            skip_count += 1
            continue
            
        success, message = fix_buttons(file_path)
        
        if success:
            print(f"✅ {file_path.name:45} - {message}")
            success_count += 1
    
    print()
    print("=" * 60)
    print("📊 RESULTADO")
    print("=" * 60)
    print(f"✅ Botões corrigidos: {success_count}")
    print(f"⏭️  Pulados:          {skip_count}")
    print(f"📈 Total:            {len(all_files)}")
    print("=" * 60)

if __name__ == "__main__":
    main()
