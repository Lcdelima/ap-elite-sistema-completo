import React, { useState, useEffect } from 'react';
import { FileText, Download, Brain, Sparkles, Clock, CheckCircle } from 'lucide-react';

const TemplateGenerator = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [aiProvider, setAiProvider] = useState('anthropic');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadTemplates();
    loadGeneratedDocuments();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/templates/list`);
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const loadGeneratedDocuments = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/templates/generated/list`);
      const data = await response.json();
      setGeneratedDocs(data.documents || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    const initialData = {};
    template.fields.forEach(field => {
      initialData[field] = '';
    });
    setFormData(initialData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateDocument = async () => {
    if (!selectedTemplate) return;

    setGenerating(true);
    try {
      const response = await fetch(`${backendUrl}/api/templates/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          case_data: formData,
          use_ai_completion: true,
          ai_provider: aiProvider
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Documento gerado com sucesso!');
        loadGeneratedDocuments();
        setFormData({});
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      alert('Erro ao gerar documento');
    } finally {
      setGenerating(false);
    }
  };

  const downloadDocument = (docId) => {
    window.open(`${backendUrl}/api/templates/download/${docId}`, '_blank');
  };

  const getFieldLabel = (field) => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getCategoryColor = (category) => {
    const colors = {
      audiencias: 'from-blue-500 to-cyan-500',
      procuracoes: 'from-purple-500 to-pink-500',
      termos: 'from-green-500 to-teal-500',
      atas: 'from-yellow-500 to-orange-500',
      relatorios: 'from-red-500 to-rose-500',
      pericia: 'from-indigo-500 to-violet-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-10 h-10" />
            Gerador de Documentos Jurídicos
          </h1>
          <p className="text-purple-200">
            Crie documentos profissionais com IA - OpenAI GPT-5, Claude Sonnet 4, Gemini 2.5 Pro
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Templates Disponíveis
              </h2>

              <div className="space-y-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-purple-400 bg-purple-500/30'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-gradient-to-r ${getCategoryColor(template.category)} text-white`}>
                      {template.category}
                    </div>
                    <h3 className="text-white font-semibold mb-1">{template.name}</h3>
                    <p className="text-gray-300 text-sm">{template.description}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {template.fields.length} campos
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedTemplate.name}</h2>
                  <p className="text-gray-300">{selectedTemplate.description}</p>
                </div>

                {/* AI Provider Selection */}
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-lg">
                  <label className="block text-sm font-medium text-white mb-2">
                    <Brain className="w-4 h-4 inline mr-2" />
                    Provedor de IA para Geração
                  </label>
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
                  >
                    <option value="openai">OpenAI GPT-5 (Raciocínio Geral)</option>
                    <option value="anthropic">Claude Sonnet 4 (Documentos Jurídicos)</option>
                    <option value="gemini">Gemini 2.5 Pro (Processamento de Dados)</option>
                  </select>
                  <p className="text-gray-300 text-sm mt-2">
                    A IA preencherá campos vazios e melhorará o conteúdo automaticamente
                  </p>
                </div>

                {/* Sections */}
                <div className="space-y-6 mb-6">
                  {selectedTemplate.structure.secoes.map((section, idx) => (
                    <div key={idx} className="border-l-4 border-purple-400 pl-4">
                      <h3 className="text-lg font-semibold text-white mb-3">{section}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedTemplate.fields
                          .filter(field => field.toLowerCase().includes(section.toLowerCase().split(' ')[0]) || idx === 0)
                          .map((field) => (
                            <div key={field}>
                              <label className="block text-sm font-medium text-purple-200 mb-2">
                                {getFieldLabel(field)}
                              </label>
                              <input
                                type="text"
                                value={formData[field] || ''}
                                onChange={(e) => handleInputChange(field, e.target.value)}
                                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
                                placeholder={`Digite ${getFieldLabel(field).toLowerCase()}...`}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={generateDocument}
                  disabled={generating}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-semibold"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      Gerando Documento com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Gerar Documento
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg">
                  Selecione um template para começar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Generated Documents */}
        {generatedDocs.length > 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Documentos Gerados ({generatedDocs.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedDocs.map((doc) => (
                <div key={doc.id} className="bg-white/5 border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="w-8 h-8 text-purple-400" />
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.generated_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <h3 className="text-white font-semibold mb-2">{doc.template_name}</h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-purple-500/30 text-purple-200 rounded text-xs">
                      {doc.ai_provider}
                    </span>
                    <span className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded text-xs">
                      {doc.ai_model}
                    </span>
                  </div>

                  <button
                    onClick={() => downloadDocument(doc.id)}
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download DOCX
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateGenerator;
