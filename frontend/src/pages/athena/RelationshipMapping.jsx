import React, { useState, useEffect } from 'react';
import { 
  Users, Network, Plus, Search, Eye, Edit, Trash2, 
  Download, Upload, AlertCircle, CheckCircle, Target,
  TrendingUp, Activity, Shield, User, Phone, Mail
} from 'lucide-react';
import AthenaLayout from '../../components/AthenaLayout';

const RelationshipMapping = () => {
  const [activeTab, setActiveTab] = useState('networks');
  const [networks, setNetworks] = useState([]);
  const [persons, setPersons] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchNetworks();
    fetchPersons();
  }, []);

  const fetchNetworks = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/relationships/networks`);
      const data = await response.json();
      setNetworks(data.networks || []);
    } catch (error) {
      console.error('Erro ao buscar redes:', error);
    }
  };

  const fetchPersons = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/relationships/persons`);
      const data = await response.json();
      setPersons(data.persons || []);
    } catch (error) {
      console.error('Erro ao buscar pessoas:', error);
    }
  };

  const createNetwork = async (networkData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/relationships/networks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(networkData),
      });
      
      const result = await response.json();
      if (response.ok) {
        fetchNetworks();
        return result;
      }
    } catch (error) {
      console.error('Erro ao criar rede:', error);
    }
  };

  const createPerson = async (personData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/relationships/persons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personData),
      });
      
      const result = await response.json();
      if (response.ok) {
        fetchPersons();
        return result;
      }
    } catch (error) {
      console.error('Erro ao criar pessoa:', error);
    }
  };

  const getNetworkAnalysis = async (networkId) => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/relationships/networks/${networkId}/analysis`);
      const data = await response.json();
      setAnalysisData(data);
      return data;
    } catch (error) {
      console.error('Erro ao obter análise:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateVisualization = async (networkId, layoutType = 'spring') => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/relationships/networks/${networkId}/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout_type: layoutType }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao gerar visualização:', error);
    }
  };

  // ==================== COMPONENTS ====================

  const NetworkOverview = () => (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Redes Criminosas</p>
              <p className="text-3xl font-bold">{networks.length}</p>
            </div>
            <Network className="h-12 w-12 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Pessoas Mapeadas</p>
              <p className="text-3xl font-bold">{persons.length}</p>
            </div>
            <Users className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Alto Risco</p>
              <p className="text-3xl font-bold">
                {persons.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length}
              </p>
            </div>
            <AlertCircle className="h-12 w-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Análises Ativas</p>
              <p className="text-3xl font-bold">8</p>
            </div>
            <Activity className="h-12 w-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Active Networks */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Redes Criminosas Ativas</h3>
          <button
            onClick={() => setShowCreateNetworkModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nova Rede</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {networks.map((network) => (
            <div key={network.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{network.name}</h4>
                  <p className="text-sm text-gray-600">{network.network_type}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  network.status === 'active' ? 'bg-red-100 text-red-800' :
                  network.status === 'under_investigation' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {network.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {network.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Membros: {network.members?.length || 0}</span>
                <span>{new Date(network.created_at).toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedNetwork(network);
                    getNetworkAnalysis(network.id);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center space-x-1"
                >
                  <Eye className="h-3 w-3" />
                  <span>Analisar</span>
                </button>
                <button
                  onClick={() => generateVisualization(network.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 flex items-center justify-center space-x-1"
                >
                  <Network className="h-3 w-3" />
                  <span>Visualizar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PersonsManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('all');

    const filteredPersons = persons.filter(person => {
      const matchesSearch = person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           person.cpf?.includes(searchTerm) ||
                           person.phone?.includes(searchTerm);
      const matchesRisk = riskFilter === 'all' || person.risk_level === riskFilter;
      return matchesSearch && matchesRisk;
    });

    return (
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 flex space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, CPF, telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border rounded-md"
                />
              </div>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-4 py-2 border rounded-md"
              >
                <option value="all">Todos os Riscos</option>
                <option value="low">Risco Baixo</option>
                <option value="medium">Risco Médio</option>
                <option value="high">Risco Alto</option>
                <option value="critical">Risco Crítico</option>
              </select>
            </div>
            <button
              onClick={() => setShowCreatePersonModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Pessoa</span>
            </button>
          </div>
        </div>

        {/* Persons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersons.map((person) => (
            <div key={person.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    person.risk_level === 'critical' ? 'bg-red-100' :
                    person.risk_level === 'high' ? 'bg-orange-100' :
                    person.risk_level === 'medium' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    <User className={`h-6 w-6 ${
                      person.risk_level === 'critical' ? 'text-red-600' :
                      person.risk_level === 'high' ? 'text-orange-600' :
                      person.risk_level === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{person.name}</h4>
                    <p className="text-sm text-gray-600">{person.occupation || 'Não informado'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  person.criminal_record ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {person.criminal_record ? 'Ficha Criminal' : 'Sem Registro'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {person.cpf && (
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">CPF: {person.cpf}</span>
                  </div>
                )}
                {person.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{person.phone}</span>
                  </div>
                )}
                {person.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{person.email}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 text-xs rounded-full ${
                  person.risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                  person.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                  person.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  Risco {person.risk_level || 'unknown'}
                </span>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const NetworkAnalysis = () => {
    if (!selectedNetwork) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Selecione uma rede para ver a análise detalhada</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Network Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{selectedNetwork.name}</h3>
              <p className="text-gray-600">{selectedNetwork.description}</p>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full ${
              selectedNetwork.status === 'active' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {selectedNetwork.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{selectedNetwork.members?.length || 0}</p>
              <p className="text-sm text-gray-600">Membros</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">15</p>
              <p className="text-sm text-gray-600">Conexões</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">3</p>
              <p className="text-sm text-gray-600">Líderes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">8.5</p>
              <p className="text-sm text-gray-600">Risco (1-10)</p>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Análise de Centralidade</h3>
            
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Membros-Chave Identificados</h4>
                  <div className="space-y-2">
                    {analysisData.analysis?.key_players?.slice(0, 5).map((player, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{player.person_id}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          player.importance === 'high' ? 'bg-red-100 text-red-800' :
                          player.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {player.measure}: {(player.score * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recomendações Estratégicas</h4>
                  <ul className="space-y-2 text-sm">
                    {analysisData.analysis?.recommendations?.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Visualization */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Visualização da Rede</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => generateVisualization(selectedNetwork.id, 'spring')}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Spring
              </button>
              <button
                onClick={() => generateVisualization(selectedNetwork.id, 'circular')}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Circular
              </button>
              <button
                onClick={() => generateVisualization(selectedNetwork.id, 'hierarchical')}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Hierárquica
              </button>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Gráfico da rede criminal</p>
              <p className="text-sm text-gray-500">Clique em um layout acima para gerar a visualização</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [showCreateNetworkModal, setShowCreateNetworkModal] = useState(false);
  const [showCreatePersonModal, setShowCreatePersonModal] = useState(false);

  const CreateNetworkModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      network_type: 'organized_crime',
      status: 'under_investigation'
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
      onClose();
      setFormData({ name: '', description: '', network_type: 'organized_crime', status: 'under_investigation' });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Nova Rede Criminal</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Rede</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Rede</label>
              <select
                value={formData.network_type}
                onChange={(e) => setFormData({...formData, network_type: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="organized_crime">Crime Organizado</option>
                <option value="fraud">Fraude</option>
                <option value="trafficking">Tráfico</option>
                <option value="corruption">Corrupção</option>
              </select>
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
                Criar Rede
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CreatePersonModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      name: '',
      cpf: '',
      phone: '',
      email: '',
      occupation: '',
      risk_level: 'medium',
      criminal_record: false
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
      onClose();
      setFormData({
        name: '', cpf: '', phone: '', email: '', occupation: '',
        risk_level: 'medium', criminal_record: false
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Nova Pessoa</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome Completo</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ocupação</label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nível de Risco</label>
              <select
                value={formData.risk_level}
                onChange={(e) => setFormData({...formData, risk_level: e.target.value})}
                className="w-full p-2 border rounded-md"
              >
                <option value="low">Baixo</option>
                <option value="medium">Médio</option>
                <option value="high">Alto</option>
                <option value="critical">Crítico</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.criminal_record}
                onChange={(e) => setFormData({...formData, criminal_record: e.target.checked})}
                className="mr-2"
              />
              <label className="text-sm">Possui registro criminal</label>
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
                Criar Pessoa
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <AthenaLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 via-pink-900 to-purple-900 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">🕸️ Mapeamento de Relacionamentos</h1>
              <p className="text-red-100">
                Análise de redes criminosas, centralidade e previsão de evolução
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-white text-red-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Análise Preditiva</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'networks', name: 'Redes Criminosas', icon: Network },
                { id: 'persons', name: 'Pessoas', icon: Users },
                { id: 'analysis', name: 'Análise Detalhada', icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
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
          {activeTab === 'networks' && <NetworkOverview />}
          {activeTab === 'persons' && <PersonsManagement />}
          {activeTab === 'analysis' && <NetworkAnalysis />}
        </div>

        {/* Modals */}
        <CreateNetworkModal
          isOpen={showCreateNetworkModal}
          onClose={() => setShowCreateNetworkModal(false)}
          onSubmit={createNetwork}
        />

        <CreatePersonModal
          isOpen={showCreatePersonModal}
          onClose={() => setShowCreatePersonModal(false)}
          onSubmit={createPerson}
        />
      </div>
    </AthenaLayout>
  );
};

export default RelationshipMapping;