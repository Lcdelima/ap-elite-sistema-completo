#!/usr/bin/env python3
"""
Script para corrigir formulários incompletos nos módulos Athena
"""

import os
import re

# Mapeamento de módulos e seus campos específicos
MODULE_FORMS = {
    # Módulos de Extração e Perícia
    'DataExtraction': {
        'title': 'Extração de Dados',
        'subtitle': 'Extração forense de dispositivos e mídias',
        'button_color': 'purple',
        'fields': [
            {'name': 'deviceName', 'label': 'Nome do Dispositivo', 'type': 'text', 'placeholder': 'Ex: iPhone de João Silva', 'required': True},
            {'name': 'deviceModel', 'label': 'Modelo do Dispositivo', 'type': 'text', 'placeholder': 'Ex: iPhone 13 Pro', 'required': True},
            {'name': 'deviceType', 'label': 'Tipo de Dispositivo', 'type': 'select', 'options': ['smartphone', 'tablet', 'computer', 'storage', 'iot'], 'required': True},
            {'name': 'serialNumber', 'label': 'Número de Série', 'type': 'text', 'placeholder': 'Ex: F2LX12345ABC', 'required': False},
            {'name': 'extractionMethod', 'label': 'Método de Extração', 'type': 'select', 'options': ['physical', 'logical', 'filesystem', 'cloud', 'chip-off', 'jtag'], 'required': True},
            {'name': 'operatingSystem', 'label': 'Sistema Operacional', 'type': 'select', 'options': ['iOS', 'Android', 'Windows', 'macOS', 'Linux'], 'required': True}
        ]
    },
    'EvidenceProcessing': {
        'title': 'Processamento de Evidências',
        'subtitle': 'Gerenciamento e análise de evidências digitais',
        'button_color': 'blue',
        'fields': [
            {'name': 'evidenceName', 'label': 'Nome da Evidência', 'type': 'text', 'placeholder': 'Ex: Evidência_001', 'required': True},
            {'name': 'evidenceType', 'label': 'Tipo de Evidência', 'type': 'select', 'options': ['digital', 'physical', 'document', 'media', 'network'], 'required': True},
            {'name': 'caseNumber', 'label': 'Número do Caso', 'type': 'text', 'placeholder': 'Ex: CASO-2024-001', 'required': True},
            {'name': 'description', 'label': 'Descrição', 'type': 'textarea', 'placeholder': 'Descreva a evidência...', 'required': False},
            {'name': 'collectionDate', 'label': 'Data de Coleta', 'type': 'date', 'required': True}
        ]
    },
    'Forensics': {
        'title': 'Perícia Digital',
        'subtitle': 'Análise forense avançada de dispositivos',
        'button_color': 'indigo',
        'fields': [
            {'name': 'examTitle', 'label': 'Título do Exame', 'type': 'text', 'placeholder': 'Ex: Exame Pericial 001/2024', 'required': True},
            {'name': 'caseNumber', 'label': 'Número do Caso', 'type': 'text', 'placeholder': 'Ex: CASO-2024-001', 'required': True},
            {'name': 'deviceInfo', 'label': 'Informações do Dispositivo', 'type': 'text', 'placeholder': 'Ex: Samsung Galaxy S21', 'required': True},
            {'name': 'examType', 'label': 'Tipo de Exame', 'type': 'select', 'options': ['completo', 'parcial', 'emergencial', 'remoto'], 'required': True},
            {'name': 'priority', 'label': 'Prioridade', 'type': 'select', 'options': ['baixa', 'média', 'alta', 'urgente'], 'required': True}
        ]
    },
    'USBForensics': {
        'title': 'Perícia USB',
        'subtitle': 'Análise forense de dispositivos USB',
        'button_color': 'green',
        'fields': [
            {'name': 'deviceName', 'label': 'Nome do Dispositivo USB', 'type': 'text', 'placeholder': 'Ex: Pendrive Kingston 32GB', 'required': True},
            {'name': 'serialNumber', 'label': 'Número de Série', 'type': 'text', 'placeholder': 'Ex: AA12345678', 'required': False},
            {'name': 'capacity', 'label': 'Capacidade (GB)', 'type': 'number', 'placeholder': 'Ex: 32', 'required': True},
            {'name': 'analysisType', 'label': 'Tipo de Análise', 'type': 'select', 'options': ['history', 'live_detection', 'malware_scan', 'data_extraction'], 'required': True}
        ]
    },
    'PasswordRecovery': {
        'title': 'Recuperação de Senhas',
        'subtitle': 'Quebra e recuperação de senhas',
        'button_color': 'red',
        'fields': [
            {'name': 'fileName', 'label': 'Nome do Arquivo', 'type': 'text', 'placeholder': 'Ex: documento_confidencial.pdf', 'required': True},
            {'name': 'fileType', 'label': 'Tipo de Arquivo', 'type': 'select', 'options': ['pdf', 'zip', 'rar', 'office', 'database'], 'required': True},
            {'name': 'attackMethod', 'label': 'Método de Ataque', 'type': 'select', 'options': ['dictionary', 'brute_force', 'mask_attack', 'hybrid'], 'required': True},
            {'name': 'useGPU', 'label': 'Usar Aceleração GPU', 'type': 'checkbox', 'required': False}
        ]
    }
}

def generate_form_fields_jsx(fields):
    """Gera o JSX dos campos do formulário"""
    jsx_parts = []
    
    for field in fields:
        if field['type'] == 'select':
            options_html = '\n'.join([
                f"                    <option value=\"{opt}\">{opt.title() if opt.islower() else opt}</option>"
                for opt in field['options']
            ])
            jsx_parts.append(f"""                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{field['label']}{'*' if field['required'] else ''}</label>
                  <select
                    {'required' if field['required'] else ''}
                    value={{formData.{field['name']}}}
                    onChange={{(e) => setFormData({{...formData, {field['name']}: e.target.value}})}}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Selecione...</option>
{options_html}
                  </select>
                </div>""")
        elif field['type'] == 'textarea':
            jsx_parts.append(f"""                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{field['label']}{'*' if field['required'] else ''}</label>
                  <textarea
                    {'required' if field['required'] else ''}
                    value={{formData.{field['name']}}}
                    onChange={{(e) => setFormData({{...formData, {field['name']}: e.target.value}})}}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="{field.get('placeholder', '')}"
                  />
                </div>""")
        elif field['type'] == 'checkbox':
            jsx_parts.append(f"""                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={{formData.{field['name']}}}
                    onChange={{(e) => setFormData({{...formData, {field['name']}: e.target.checked}})}}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">{field['label']}</label>
                </div>""")
        else:
            jsx_parts.append(f"""                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{field['label']}{'*' if field['required'] else ''}</label>
                  <input
                    type="{field['type']}"
                    {'required' if field['required'] else ''}
                    value={{formData.{field['name']}}}
                    onChange={{(e) => setFormData({{...formData, {field['name']}: e.target.value}})}}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="{field.get('placeholder', '')}"
                  />
                </div>""")
    
    return '\n\n'.join(jsx_parts)

def generate_initial_state(fields):
    """Gera o estado inicial do formData"""
    state_items = []
    for field in fields:
        if field['type'] == 'checkbox':
            state_items.append(f"{field['name']}: false")
        else:
            state_items.append(f"{field['name']}: ''")
    return ',\n    '.join(state_items)

print("✅ Script de correção em massa preparado!")
print(f"Módulos configurados: {len(MODULE_FORMS)}")
print("\nPara corrigir um módulo específico, use as funções generate_form_fields_jsx() e generate_initial_state()")
