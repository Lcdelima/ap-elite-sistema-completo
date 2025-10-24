import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  StandardModuleLayout,
  ActionButton,
  StandardCard,
  StandardSearchBar,
  StandardEmptyState
} from '../../components/StandardModuleLayout';
import { Badge } from '../../components/ui/badge';
import {
  FileSearch, Brain, TrendingUp, Scale, Gavel, Building, Hash,
  Calendar, DollarSign, Upload, Plus, Eye, Download, Sparkles,
  CheckCircle, Clock, AlertCircle, Target, BookOpen, Users
} from 'lucide-react';
import { toast } from 'sonner';

const ProcessAnalysisComplete = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  const [formData, setFormData] = useState({
    processNumber: '',
    processTitle: '',
    court: '',
    vara: '',
    processType: 'civil',
    status: 'active',
    plaintiff: '',
    plaintiffLawyer: '',
    defendant: '',
    defendantLawyer: '',
    documents: [],
    analysisType: 'complete',
    aiProvider: 'gpt-5',
    initialDate: '',
    lastUpdate: '',
    estimatedValue: '',
    subject: '',
    observations: ''
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/process-analysis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAnalyses(res.data.analyses || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar análises');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnalyzing(true);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'documents' && formData.documents.length > 0) {
          formData.documents.forEach(file => {
            formDataToSend.append('documents', file);
          });
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post(
        `${BACKEND_URL}/api/athena/process-analysis`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Análise iniciada com sucesso!');
      setShowModal(false);
      fetchAnalyses();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao iniciar análise');
    } finally {
      setAnalyzing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      processNumber: '', processTitle: '', court: '', vara: '', processType: 'civil',
      status: 'active', plaintiff: '', plaintiffLawyer: '', defendant: '',
      defendantLawyer: '', documents: [], analysisType: 'complete',
      aiProvider: 'gpt-5', initialDate: '', lastUpdate: '', estimatedValue: '',
      subject: '', observations: ''
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      analyzing: { color: 'bg-yellow-500', text: 'Analisando', icon: Brain },
      completed: { color: 'bg-green-500', text: 'Concluído', icon: CheckCircle },
      error: { color: 'bg-red-500', text: 'Erro', icon: AlertCircle }
    };
    const { color, text, icon: Icon } = config[status] || config.analyzing;
    
    return (
      <Badge className={`${color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    );
  };

  const getProcessTypeIcon = (type) => {
    const icons = {
      civil: Scale,
      criminal: Gavel,
      administrative: Building
    };
    return icons[type] || FileSearch;
  };

  const getStats = () => {
    return {
      total: analyses.length,
      completed: analyses.filter(a => a.status === 'completed').length,
      analyzing: analyses.filter(a => a.status === 'analyzing').length,
      highRisk: analyses.filter(a => a.riskLevel === 'high').length
    };
  };

  const stats = getStats();
  const filteredAnalyses = analyses.filter(a =>
    a.processTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.processNumber?.includes(searchTerm)
  );

  const headerActions = [
    {
      label: 'Nova Análise',
      icon: Plus,
      onClick: () => setShowModal(true),
      variant: 'primary'
    }
  ];

  return (
    <StandardModuleLayout
      title="Análise Processual Profissional"
      subtitle="Sistema avançado de análise jurídica com IA - Jurisprudência, Riscos e Estratégias"
      icon={FileSearch}
      color="cyan"
      category="Jurídico"
      actions={headerActions}
      loading={loading}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total de Análises</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <Brain className="h-10 w-10 text-blue-400" />
          </div>
        </StandardCard>

        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Concluídas</p>
              <p className="text-3xl font-bold text-white">{stats.completed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </StandardCard>

        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Em Análise</p>
              <p className="text-3xl font-bold text-white">{stats.analyzing}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-400 animate-pulse" />
          </div>
        </StandardCard>

        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Alto Risco</p>
              <p className="text-3xl font-bold text-white">{stats.highRisk}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
        </StandardCard>
      </div>

      {/* Search Bar */}
      <StandardSearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Buscar por número ou título do processo..."
      />

      {/* Analyses List */}
      <StandardCard
        title="Análises Realizadas"
        icon={FileSearch}
      >
        {filteredAnalyses.length === 0 ? (
          <StandardEmptyState
            icon={FileSearch}
            title="Nenhuma análise encontrada"
            description="Inicie uma nova análise processual com IA para começar"
            action={{
              label: 'Iniciar Análise',
              icon: Plus,
              onClick: () => setShowModal(true),
              variant: 'primary'
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredAnalyses.map((analysis, idx) => {
              const TypeIcon = getProcessTypeIcon(analysis.processType);
              
              return (
                <div
                  key={idx}
                  className="bg-gray-700/30 border border-gray-600 rounded-lg p-5 hover:bg-gray-700/50 transition-all cursor-pointer"
                  onClick={() => setSelectedAnalysis(analysis)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-cyan-500/20 rounded-lg">
                        <TypeIcon className="h-7 w-7 text-cyan-400" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-white">
                            {analysis.processTitle || 'Análise Processual'}
                          </h4>
                          {getStatusBadge(analysis.status)}
                          {analysis.aiProvider && (
                            <Badge className="bg-purple-500 text-white">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {analysis.aiProvider.toUpperCase()}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300 mb-3">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-cyan-400" />
                            <span>{analysis.processNumber || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-cyan-400" />
                            <span>{analysis.court || 'Tribunal não informado'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-cyan-400" />
                            <span>{analysis.initialDate ? new Date(analysis.initialDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-cyan-400" />
                            <span>{analysis.estimatedValue || 'Não informado'}</span>
                          </div>
                        </div>

                        {analysis.summary && (
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                            {analysis.summary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <ActionButton
                        icon={Eye}
                        variant="default"
                        tooltip="Visualizar detalhes"
                      />
                      <ActionButton
                        icon={Download}
                        variant="success"
                        tooltip="Baixar análise"
                      />
                    </div>
                  </div>

                  {/* Analysis Metrics (if completed) */}
                  {analysis.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-gray-600 grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="h-4 w-4 text-green-400" />
                          <span className="text-xs text-gray-400">Chance de Sucesso</span>
                        </div>
                        <p className="text-lg font-bold text-green-400">
                          {analysis.successProbability || '75'}%
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <AlertCircle className="h-4 w-4 text-orange-400" />
                          <span className="text-xs text-gray-400">Nível de Risco</span>
                        </div>
                        <p className="text-lg font-bold text-orange-400">
                          {analysis.riskLevel || 'Médio'}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="h-4 w-4 text-blue-400" />
                          <span className="text-xs text-gray-400">Prazo Estimado</span>
                        </div>
                        <p className="text-lg font-bold text-blue-400">
                          {analysis.estimatedDuration || '6-12m'}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BookOpen className="h-4 w-4 text-purple-400" />
                          <span className="text-xs text-gray-400">Jurisprudências</span>
                        </div>
                        <p className="text-lg font-bold text-purple-400">
                          {analysis.jurisprudenceCount || '12'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </StandardCard>

      {/* Modal - Nova Análise */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Brain className="h-7 w-7 text-cyan-400" />
                Nova Análise Processual com IA
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <TrendingUp className="h-6 w-6 text-white rotate-90" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Form sections remain the same as original but with consistent styling */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-cyan-400" />
                  Identificação do Processo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Número do Processo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.processNumber}
                      onChange={(e) => setFormData({...formData, processNumber: e.target.value})}
                      placeholder="0000000-00.0000.0.00.0000"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Processo *
                    </label>
                    <select
                      value={formData.processType}
                      onChange={(e) => setFormData({...formData, processType: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="civil">Cível</option>
                      <option value="criminal">Criminal</option>
                      <option value="administrative">Administrativo</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Título/Assunto do Processo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.processTitle}
                      onChange={(e) => setFormData({...formData, processTitle: e.target.value})}
                      placeholder="Ex: Ação de Cobrança, Homicídio Doloso..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tribunal/Foro *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.court}
                      onChange={(e) => setFormData({...formData, court: e.target.value})}
                      placeholder="Ex: TJSP, TJRJ..."
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Vara/Comarca
                    </label>
                    <input
                      type="text"
                      value={formData.vara}
                      onChange={(e) => setFormData({...formData, vara: e.target.value})}
                      placeholder="Ex: 1ª Vara Cível"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Partes Envolvidas */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  Partes Envolvidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Autor/Requerente</label>
                    <input
                      type="text"
                      value={formData.plaintiff}
                      onChange={(e) => setFormData({...formData, plaintiff: e.target.value})}
                      placeholder="Nome do autor"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Advogado do Autor</label>
                    <input
                      type="text"
                      value={formData.plaintiffLawyer}
                      onChange={(e) => setFormData({...formData, plaintiffLawyer: e.target.value})}
                      placeholder="Nome do advogado"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Réu/Requerido</label>
                    <input
                      type="text"
                      value={formData.defendant}
                      onChange={(e) => setFormData({...formData, defendant: e.target.value})}
                      placeholder="Nome do réu"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Advogado do Réu</label>
                    <input
                      type="text"
                      value={formData.defendantLawyer}
                      onChange={(e) => setFormData({...formData, defendantLawyer: e.target.value})}
                      placeholder="Nome do advogado"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Configuração da Análise AI */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  Configuração da Análise com IA
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Análise *</label>
                    <select
                      value={formData.analysisType}
                      onChange={(e) => setFormData({...formData, analysisType: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="complete">Análise Completa (Tudo)</option>
                      <option value="jurisprudence">Jurisprudência</option>
                      <option value="deadlines">Prazos Processuais</option>
                      <option value="risks">Análise de Riscos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Provedor de IA *</label>
                    <select
                      value={formData.aiProvider}
                      onChange={(e) => setFormData({...formData, aiProvider: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="gpt-5">GPT-5 (OpenAI)</option>
                      <option value="claude-sonnet-4">Claude Sonnet 4 (Anthropic)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Google)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Upload de Documentos */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-cyan-400" />
                  Documentos do Processo
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload de Petições, Sentenças, Acórdãos, etc.
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setFormData({...formData, documents: Array.from(e.target.files)})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Formatos aceitos: PDF, DOC, DOCX (Múltiplos arquivos)
                  </p>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Informações Adicionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Data de Início</label>
                    <input
                      type="date"
                      value={formData.initialDate}
                      onChange={(e) => setFormData({...formData, initialDate: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Valor Estimado</label>
                    <input
                      type="text"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
                      placeholder="R$ 50.000,00"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Observações</label>
                    <textarea
                      value={formData.observations}
                      onChange={(e) => setFormData({...formData, observations: e.target.value})}
                      placeholder="Informações relevantes sobre o processo..."
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={analyzing}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Brain className="h-5 w-5 animate-pulse" />
                      <span>Analisando com IA...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5" />
                      <span>Iniciar Análise</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StandardModuleLayout>
  );
};

export default ProcessAnalysisComplete;
