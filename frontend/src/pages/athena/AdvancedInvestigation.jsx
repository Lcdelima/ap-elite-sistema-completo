import React, { useState, useEffect } from 'react';
import { 
  Search, Upload, FileText, Image, Users, Brain, Target, 
  Download, AlertCircle, CheckCircle, Clock, Activity,
  Network, Eye, Shield, Database, Map, TrendingUp,
  Camera, Phone, Mail, Globe, Calendar, User
} from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const AdvancedInvestigation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/investigation/cases`);
      const data = await response.json();
      setCases(data.cases || []);
    } catch (error) {
      console.error('Erro ao buscar casos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewCase = async (caseData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/investigation/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      });
      
      const result = await response.json();
      if (response.ok) {
        fetchCases();
        return result;
      }
    } catch (error) {
      console.error('Erro ao criar caso:', error);
    }
  };

  const uploadEvidence = async (file, caseId, evidenceName, evidenceType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('case_id', caseId);
      formData.append('evidence_name', evidenceName);
      formData.append('evidence_type', evidenceType);

      const response = await fetch(`${BACKEND_URL}/api/investigation/evidence/upload`, {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      const result = await response.json();
      if (response.ok) {
        return result;
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  const getCaseAnalysis = async (caseId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/investigation/cases/${caseId}/analysis`);
      const data = await response.json();
      setAnalyses(data);
      return data;
    } catch (error) {
      console.error('Erro ao obter análise:', error);
    }
  };

  const performOSINTSearch = async (searchData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/investigation/osint/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Erro na busca OSINT:', error);
    }
  };

  // ==================== COMPONENTS ====================

  const CaseOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Casos Ativos</p>
              <p className="text-3xl font-bold">{cases.filter(c => c.status === 'active').length}</p>
            </div>
            <Target className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Evidências Processadas</p>
              <p className="text-3xl font-bold">{evidence.length}</p>
            </div>
            <Database className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Análises IA</p>
              <p className="text-3xl font-bold">{analyses.length}</p>
            </div>
            <Brain className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Redes Mapeadas</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <Network className="h-12 w-12 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Casos Recentes</h3>
        <div className="space-y-4">
          {cases.slice(0, 5).map((case_item) => (
            <div key={case_item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  case_item.status === 'active' ? 'bg-green-500' : 
                  case_item.status === 'closed' ? 'bg-gray-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <p className="font-medium">{case_item.title}</p>
                  <p className="text-sm text-gray-600">#{case_item.case_number}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded ${
                  case_item.priority === 'high' ? 'bg-red-100 text-red-800' :
                  case_item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {case_item.priority}
                </span>
                <button
                  onClick={() => setSelectedCase(case_item)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CreateCaseModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      case_number: '',
      title: '',
      description: '',
      priority: 'medium',
      status: 'active'
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
      onClose();
      setFormData({ case_number: '', title: '', description: '', priority: 'medium', status: 'active' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Novo Caso de Investigação</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Número do Caso</label>
              <input
                type="text"
                value={formData.case_number}
                onChange={(e) => setFormData({...formData, case_number: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="INV-2025-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded-md h-20"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Criar Caso
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AnalysisPanel = () => (
    <div className="space-y-6">
      {/* AI Analysis Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h3 className="text-lg font-semibold">Análise de Documentos</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Extração inteligente de informações e identificação de padrões suspeitos
          </p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
            Iniciar Análise
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Camera className="h-8 w-8 text-green-600" />
            <h3 className="text-lg font-semibold">Análise de Imagens</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Reconhecimento facial, OCR e extração de metadados
          </p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
            Processar Imagem
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Network className="h-8 w-8 text-purple-600" />
            <h3 className="text-lg font-semibold">Padrões Criminais</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Identificação de conexões e comportamentos suspeitos
          </p>
          <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
            Analisar Padrões
          </button>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Análises Recentes</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Documento_Suspeito_{i}.pdf</p>
                  <p className="text-sm text-gray-600">Análise IA completa - Confidência: 92%</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-800">
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const OSINTTools = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('general');
    const [osintResults, setOsintResults] = useState([]);

    const handleOSINTSearch = async () => {
      setLoading(true);
      const results = await performOSINTSearch({
        query: searchQuery,
        type: searchType
      });
      setOsintResults([results]);
      setLoading(false);
    };

    return (
      <div className="space-y-6">
        {/* Search Interface */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Busca OSINT</h3>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite nome, CPF, telefone, email..."
                className="flex-1 p-3 border rounded-md"
              />
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="p-3 border rounded-md"
              >
                <option value="general">Busca Geral</option>
                <option value="social_media">Redes Sociais</option>
                <option value="person_verification">Verificação Pessoal</option>
                <option value="geolocation">Geolocalização</option>
              </select>
              <button
                onClick={handleOSINTSearch}
                disabled={!searchQuery || loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* OSINT Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Globe className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Redes Sociais</h4>
            <p className="text-sm text-gray-600">Facebook, Instagram, Twitter, LinkedIn</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <User className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Dados Pessoais</h4>
            <p className="text-sm text-gray-600">CPF, RG, Endereço, Telefone</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Map className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Geolocalização</h4>
            <p className="text-sm text-gray-600">Coordenadas, Endereços, EXIF</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Mail className="h-12 w-12 text-orange-600 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Comunicações</h4>
            <p className="text-sm text-gray-600">Email, WhatsApp, Telegram</p>
          </div>
        </div>

        {/* Results */}
        {osintResults.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Resultados OSINT</h3>
            <div className="space-y-4">
              {osintResults.map((result, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const NetworkMapping = () => (
    <div className="space-y-6">
      {/* Network Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <Network className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Mapeamento de Rede</h3>
          <p className="text-gray-600 mb-4">Visualização de conexões criminosas</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
            Criar Rede
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <Users className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Análise de Centralidade</h3>
          <p className="text-gray-600 mb-4">Identificar membros-chave</p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
            Analisar
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <TrendingUp className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Previsão de Evolução</h3>
          <p className="text-gray-600 mb-4">IA preditiva para redes criminosas</p>
          <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
            Prever
          </button>
        </div>
      </div>

      {/* Network Visualization Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Visualização da Rede Criminal</h3>
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Gráfico de rede será exibido aqui</p>
            <p className="text-sm text-gray-500">Selecione uma rede para visualizar</p>
          </div>
        </div>
      </div>
    </div>
  );

  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <UniversalModuleLayout
      title="Advanced Investigation"
      subtitle="Sistema integrado"
      icon={FileText}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">🔍 Investigação Avançada</h1>
              <p className="text-blue-100">
                Sistema integrado de análise criminal com IA, OSINT e mapeamento de redes
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center space-x-2"
              >
                <FileText className="h-5 w-5" />
                <span>Novo Caso</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Visão Geral', icon: Activity },
                { id: 'analysis', name: 'Análise IA', icon: Brain },
                { id: 'osint', name: 'OSINT', icon: Search },
                { id: 'network', name: 'Redes', icon: Network },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-96">
          {activeTab === 'overview' && <CaseOverview />}
          {activeTab === 'analysis' && <AnalysisPanel />}
          {activeTab === 'osint' && <OSINTTools />}
          {activeTab === 'network' && <NetworkMapping />}
        </div>

        {/* Modals */}
        <CreateCaseModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createNewCase}
        />

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span>Processando...</span>
            </div>
          </div>
        )}
      </div>
    </UniversalModuleLayout>
  );
};

export default AdvancedInvestigation;