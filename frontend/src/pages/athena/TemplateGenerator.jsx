import React, { useState, useEffect } from 'react';
import { FileText, Download, Brain, Sparkles, Clock, CheckCircle, Plus } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const TemplateGenerator = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState('gpt4');
  const [showModal, setShowModal] = useState(false);

  // Mock templates for demonstration
  const mockTemplates = [
    {
      id: 1,
      name: 'Petição Inicial',
      description: 'Modelo de petição inicial para processos civis',
      fields: ['autor', 'reu', 'objeto', 'fundamentos'],
      category: 'processual'
    },
    {
      id: 2,
      name: 'Contrato de Prestação de Serviços',
      description: 'Contrato padrão para prestação de serviços',
      fields: ['contratante', 'contratado', 'servicos', 'valor', 'prazo'],
      category: 'contratual'
    },
    {
      id: 3,
      name: 'Recurso de Apelação',
      description: 'Modelo de recurso de apelação',
      fields: ['apelante', 'processo', 'decisao', 'fundamentos'],
      category: 'processual'
    },
    {
      id: 4,
      name: 'Parecer Jurídico',
      description: 'Modelo de parecer jurídico técnico',
      fields: ['consulente', 'questao', 'analise', 'conclusao'],
      category: 'consultivo'
    }
  ];

  useEffect(() => {
    loadTemplates();
    loadGeneratedDocuments();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // Usar mock templates por enquanto
      setTemplates(mockTemplates);
      // const response = await axios.get(`${BACKEND_URL}/api/athena/documents/list`);
      // setTemplates(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  };

  const loadGeneratedDocuments = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/athena/documents/list`);
      setGeneratedDocs(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowModal(true);
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
      await axios.post(`${BACKEND_URL}/api/athena/documents/create`, {
        collection: 'generated_documents',
        data: {
          template_id: selectedTemplate.id,
          template_name: selectedTemplate.name,
          ai_provider: aiProvider,
          fields: formData,
          status: 'generated'
        }
      });

      toast.success('Documento gerado com sucesso!');
      setShowModal(false);
      setSelectedTemplate(null);
      setFormData({});
      loadGeneratedDocuments();
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      toast.error('Erro ao gerar documento');
    } finally {
      setGenerating(false);
    }
  };

  const fieldLabels = {
    autor: 'Nome do Autor',
    reu: 'Nome do Réu',
    objeto: 'Objeto da Ação',
    fundamentos: 'Fundamentos Legais',
    contratante: 'Nome do Contratante',
    contratado: 'Nome do Contratado',
    servicos: 'Descrição dos Serviços',
    valor: 'Valor do Contrato',
    prazo: 'Prazo de Execução',
    apelante: 'Nome do Apelante',
    processo: 'Número do Processo',
    decisao: 'Decisão Recorrida',
    consulente: 'Nome do Consulente',
    questao: 'Questão Jurídica',
    analise: 'Análise da Situação',
    conclusao: 'Conclusão do Parecer'
  };

  return (
    <UniversalModuleLayout
      title="Gerador de Documentos Jurídicos"
      subtitle="Crie documentos profissionais com IA (OpenAI GPT-5, Claude Sonnet 4, Gemini 2.5 Pro)"
      icon={FileText}
      headerAction={
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-full md:w-auto flex items-center gap-2 justify-center"
        >
          <Plus className="w-5 h-5" />
          Criar Documento
        </button>
      }
    >
      {/* AI Provider Selection */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8" />
            <div>
              <h3 className="font-semibold">Powered by AI</h3>
              <p className="text-sm text-purple-100">Escolha o modelo de IA para gerar seu documento</p>
            </div>
          </div>
          <select
            value={aiProvider}
            onChange={(e) => setAiProvider(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white text-gray-900 font-medium"
          >
            <option value="gpt4">OpenAI GPT-5</option>
            <option value="claude">Claude Sonnet 4</option>
            <option value="gemini">Gemini 2.5 Pro</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Modelos Disponíveis</h2>
          <span className="text-sm text-gray-600">{templates.length} modelos</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando modelos...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum modelo disponível</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <FileText className="w-10 h-10 text-indigo-500 group-hover:scale-110 transition-transform" />
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Sparkles className="w-4 h-4 mr-1" />
                  {template.fields.length} campos
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generated Documents */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Documentos Gerados Recentemente</h2>
        
        {generatedDocs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum documento gerado ainda</p>
            <p className="text-sm text-gray-500 mt-2">Selecione um modelo acima para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedDocs.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{doc.data?.template_name || 'Documento'}</h4>
                      <p className="text-sm text-gray-600">
                        Gerado com {doc.data?.ai_provider || 'IA'} • {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generation Modal */}
      {showModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h3>
                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded">
                {aiProvider === 'gpt4' ? 'GPT-5' : aiProvider === 'claude' ? 'Claude' : 'Gemini'}
              </span>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); generateDocument(); }} className="space-y-4">
              {selectedTemplate.fields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {fieldLabels[field] || field}*
                  </label>
                  {['fundamentos', 'analise', 'conclusao'].includes(field) ? (
                    <textarea
                      required
                      value={formData[field] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows="4"
                      placeholder={`Digite ${fieldLabels[field]?.toLowerCase() || field}...`}
                    />
                  ) : (
                    <input
                      type="text"
                      required
                      value={formData[field] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder={`Digite ${fieldLabels[field]?.toLowerCase() || field}...`}
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedTemplate(null);
                    setFormData({});
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                  disabled={generating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Gerar Documento
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UniversalModuleLayout>
  );
};

export default TemplateGenerator;