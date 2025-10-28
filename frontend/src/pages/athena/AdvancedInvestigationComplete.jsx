import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  StandardModuleLayout,
  ActionButton,
  StandardCard,
  StandardSearchBar,
  StandardEmptyState,
  StandardAlert
} from '../../components/StandardModuleLayout';
import { Badge } from '../../components/ui/badge';
import {
  Search, Brain, Target, AlertCircle, CheckCircle, Clock,
  Network, Eye, Shield, Database, TrendingUp, Users,
  Camera, Phone, Mail, Globe, User, Plus, Upload,
  FileText, MapPin, Calendar, Download, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

const AdvancedInvestigationComplete = () => {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    caseNumber: '',
    caseTitle: '',
    investigationType: 'digital_forensics',
    priority: 'medium',
    subject: '',
    description: '',
    location: '',
    dateStarted: '',
    targetName: '',
    targetPhone: '',
    targetEmail: '',
    targetAddress: '',
    evidenceTypes: [],
    aiAnalysis: true,
    documents: []
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem('ap_elite_token');

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const fetchInvestigations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/investigation/advanced`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setInvestigations(res.data.investigations || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar investigações');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.caseNumber || !formData.caseTitle) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setProcessing(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'documents' && formData.documents.length > 0) {
          formData.documents.forEach(file => {
            formDataToSend.append('documents', file);
          });
        } else if (key === 'evidenceTypes') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post(
        `${backendUrl}/api/investigation/advanced`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Investigação iniciada com sucesso!');
      setShowModal(false);
      fetchInvestigations();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar investigação');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      caseNumber: '',
      caseTitle: '',
      investigationType: 'digital_forensics',
      priority: 'medium',
      subject: '',
      description: '',
      location: '',
      dateStarted: '',
      targetName: '',
      targetPhone: '',
      targetEmail: '',
      targetAddress: '',
      evidenceTypes: [],
      aiAnalysis: true,
      documents: []
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { color: 'bg-blue-500', text: 'Ativa', icon: Clock },
      completed: { color: 'bg-green-500', text: 'Concluída', icon: CheckCircle },
      pending: { color: 'bg-yellow-500', text: 'Pendente', icon: AlertCircle },
      suspended: { color: 'bg-red-500', text: 'Suspensa', icon: Shield }
    };
    
    const { color, text, icon: Icon } = config[status] || config.pending;
    
    return (
      <Badge className={`${color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { color: 'bg-red-500', text: 'Alta' },
      medium: { color: 'bg-yellow-500', text: 'Média' },
      low: { color: 'bg-green-500', text: 'Baixa' }
    };
    
    const { color, text } = config[priority] || config.medium;
    
    return <Badge className={`${color} text-white`}>{text}</Badge>;
  };

  const getStats = () => {
    return {
      total: investigations.length,
      active: investigations.filter(i => i.status === 'active').length,
      completed: investigations.filter(i => i.status === 'completed').length,
      highPriority: investigations.filter(i => i.priority === 'high').length
    };
  };

  const stats = getStats();

  const filteredInvestigations = investigations.filter(inv => {
    const matchesSearch = 
      inv.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.caseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.targetName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || inv.investigationType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const investigationTypes = [
    { value: 'digital_forensics', label: 'Perícia Forense Digital' },
    { value: 'osint', label: 'OSINT - Inteligência de Fontes Abertas' },
    { value: 'cyber_investigation', label: 'Investigação Cibernética' },
    { value: 'fraud', label: 'Fraude e Crimes Financeiros' },
    { value: 'background_check', label: 'Background Check' },
    { value: 'corporate', label: 'Investigação Corporativa' }
  ];

  const headerActions = [
    {
      label: 'Nova Investigação',
      icon: Plus,
      onClick: () => setShowModal(true),
      variant: 'primary'
    }
  ];

  return (
    <StandardModuleLayout
      title="Análise Avançada e Investigação"
      subtitle="Sistema profissional de investigação com IA, OSINT e análise forense digital"
      icon={Search}
      color="purple"
      category="Investigação"
      actions={headerActions}
      loading={loading}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total de Investigações</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <Search className="h-10 w-10 text-purple-400" />
          </div>
        </StandardCard>

        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Ativas</p>
              <p className="text-3xl font-bold text-white">{stats.active}</p>
            </div>
            <Clock className="h-10 w-10 text-blue-400 animate-pulse" />
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
              <p className="text-sm text-gray-400 mb-1">Alta Prioridade</p>
              <p className="text-3xl font-bold text-white">{stats.highPriority}</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
        </StandardCard>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StandardSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar por número, título ou alvo..."
        />
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="all">Todos os Tipos</option>
            {investigationTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Investigations List */}
      <StandardCard
        title="Investigações em Andamento"
        icon={Target}
      >
        {filteredInvestigations.length === 0 ? (
          <StandardEmptyState
            icon={Search}
            title="Nenhuma investigação encontrada"
            description="Inicie uma nova investigação avançada para começar"
            action={{
              label: 'Nova Investigação',
              icon: Plus,
              onClick: () => setShowModal(true),
              variant: 'primary'
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredInvestigations.map((inv, idx) => (
              <div
                key={idx}
                className="bg-gray-700/30 border border-gray-600 rounded-lg p-5 hover:bg-gray-700/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <Target className="h-7 w-7 text-purple-400" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-white">
                          {inv.caseTitle || 'Investigação'}
                        </h4>
                        {getStatusBadge(inv.status)}
                        {getPriorityBadge(inv.priority)}
                        {inv.aiAnalysis && (
                          <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            <Brain className="h-3 w-3 mr-1" />
                            IA
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300 mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-400" />
                          <span>{inv.caseNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-purple-400" />
                          <span>{inv.targetName || 'Não informado'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          <span>{inv.dateStarted ? new Date(inv.dateStarted).toLocaleDateString('pt-BR') : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-400" />
                          <span>{inv.location || 'N/A'}</span>
                        </div>
                      </div>

                      {inv.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                          {inv.description}
                        </p>
                      )}

                      {/* Evidence indicators */}
                      {inv.evidenceTypes && inv.evidenceTypes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {inv.evidenceTypes.includes('digital') && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              <Database className="h-3 w-3 mr-1" />
                              Digital
                            </Badge>
                          )}
                          {inv.evidenceTypes.includes('phone') && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              <Phone className="h-3 w-3 mr-1" />
                              Telefone
                            </Badge>
                          )}
                          {inv.evidenceTypes.includes('email') && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Badge>
                          )}
                          {inv.evidenceTypes.includes('social') && (
                            <Badge className="bg-pink-500/20 text-pink-400 text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              Social
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <ActionButton
                      icon={Eye}
                      variant="default"
                      tooltip="Ver detalhes"
                    />
                    <ActionButton
                      icon={Download}
                      variant="success"
                      tooltip="Baixar relatório"
                    />
                    <ActionButton
                      icon={Trash2}
                      variant="danger"
                      tooltip="Remover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </StandardCard>

      {/* Modal - Nova Investigação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Search className="h-7 w-7 text-purple-400" />
                Nova Investigação Avançada
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="h-6 w-6 text-white rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Identificação */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Identificação do Caso
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Número do Caso *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.caseNumber}
                      onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
                      placeholder="INV-2024-001"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Investigação *
                    </label>
                    <select
                      value={formData.investigationType}
                      onChange={(e) => setFormData({...formData, investigationType: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      {investigationTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Título do Caso *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.caseTitle}
                      onChange={(e) => setFormData({...formData, caseTitle: e.target.value})}
                      placeholder="Ex: Investigação de Fraude Digital"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prioridade
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={formData.dateStarted}
                      onChange={(e) => setFormData({...formData, dateStarted: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Alvo da Investigação */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Alvo da Investigação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Alvo</label>
                    <input
                      type="text"
                      value={formData.targetName}
                      onChange={(e) => setFormData({...formData, targetName: e.target.value})}
                      placeholder="Nome completo"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
                    <input
                      type="text"
                      value={formData.targetPhone}
                      onChange={(e) => setFormData({...formData, targetPhone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.targetEmail}
                      onChange={(e) => setFormData({...formData, targetEmail: e.target.value})}
                      placeholder="email@exemplo.com"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Localização</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Cidade/Estado"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Endereço</label>
                    <input
                      type="text"
                      value={formData.targetAddress}
                      onChange={(e) => setFormData({...formData, targetAddress: e.target.value})}
                      placeholder="Endereço completo"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Descrição e Objetivos</h3>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva os objetivos e detalhes da investigação..."
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Tipos de Evidência */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  Tipos de Evidência a Coletar
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['digital', 'phone', 'email', 'social', 'financial', 'physical', 'video', 'audio'].map(type => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.evidenceTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, evidenceTypes: [...formData.evidenceTypes, type]});
                          } else {
                            setFormData({...formData, evidenceTypes: formData.evidenceTypes.filter(t => t !== type)});
                          }
                        }}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-gray-300 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-4 rounded-lg border border-purple-500/30">
                  <input
                    type="checkbox"
                    checked={formData.aiAnalysis}
                    onChange={(e) => setFormData({...formData, aiAnalysis: e.target.checked})}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-400" />
                      <span className="text-white font-semibold">Ativar Análise com IA</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Utiliza inteligência artificial para análise automática de evidências e geração de insights
                    </p>
                  </div>
                </label>
              </div>

              {/* Upload de Documentos */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-purple-400" />
                  Documentos Iniciais
                </h3>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={(e) => setFormData({...formData, documents: Array.from(e.target.files)})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (Múltiplos arquivos)
                </p>
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
                  disabled={processing}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Clock className="h-5 w-5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Target className="h-5 w-5" />
                      <span>Iniciar Investigação</span>
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

export default AdvancedInvestigationComplete;
