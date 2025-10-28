import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, ExternalLink, Star, BookmarkPlus, FolderPlus, 
  Eye, Edit, Trash2, FileText, Calendar, Tag, AlertCircle,
  TrendingUp, Database, Users, Building, Gavel, Map, Shield
} from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const DefensiveInvestigation = () => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cases, setCases] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, sources, cases, case-detail
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    target: '',
    type: 'person'
  });
  const [newNote, setNewNote] = useState('');
  const [newFinding, setNewFinding] = useState({
    title: '',
    description: '',
    evidence: '',
    source_url: '',
    category: '',
    relevance: 'medium'
  });

  const categoryIcons = {
    monitoramento_geral: TrendingUp,
    governo_br: Shield,
    redes_sociais: Users,
    email_dominio: Database,
    vazamentos: AlertCircle,
    geolocalizacao: Map,
    investigacao_criminal: Gavel,
    empresas: Building,
    tribunais: Gavel,
    utilidades: Database
  };

  useEffect(() => {
    fetchCategories();
    fetchCases();
    fetchFavorites();
    fetchStats();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/defensive-investigation/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCategories(data.categories || {});
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories({});
    }
  };

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/defensive-investigation/cases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCases(data.cases || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
      setCases([]);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/defensive-investigation/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/defensive-investigation/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({});
    }
  };

  const createCase = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/defensive-investigation/case`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCase)
      });
      
      if (response.ok) {
        setShowNewCaseModal(false);
        setNewCase({ title: '', description: '', target: '', type: 'person' });
        fetchCases();
        fetchStats();
        toast.success("Caso criado com sucesso!");
      }
    } catch (error) {
      console.error('Error creating case:', error);
      toast.success("Erro ao criar caso");
    }
  };

  const addToFavorites = async (source) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BACKEND_URL}/api/athena/defensive-investigation/favorites/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(source)
      });
      fetchFavorites();
      toast.success("Fonte adicionada aos favoritos!");
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  const removeFromFavorites = async (sourceUrl) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BACKEND_URL}/api/athena/defensive-investigation/favorites/remove?source_url=${encodeURIComponent(sourceUrl)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const viewCaseDetails = async (caseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/defensive-investigation/case/${caseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSelectedCase(data.case);
      setActiveTab('case-detail');
    } catch (error) {
      console.error('Error fetching case details:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BACKEND_URL}/api/athena/defensive-investigation/case/${selectedCase.id}/note`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newNote })
      });
      
      setNewNote('');
      viewCaseDetails(selectedCase.id);
      toast.success("Nota adicionada!");
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const addFinding = async () => {
    if (!newFinding.title.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BACKEND_URL}/api/athena/defensive-investigation/case/${selectedCase.id}/finding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFinding)
      });
      
      setNewFinding({
        title: '',
        description: '',
        evidence: '',
        source_url: '',
        category: '',
        relevance: 'medium'
      });
      viewCaseDetails(selectedCase.id);
      toast.success("Descoberta adicionada!");
    } catch (error) {
      console.error('Error adding finding:', error);
    }
  };

  const deleteCase = async (caseId) => {
    if (!window.confirm('Deseja realmente excluir este caso?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BACKEND_URL}/api/athena/defensive-investigation/case/${caseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      fetchCases();
      fetchStats();
      setActiveTab('cases');
      toast.success("Caso excluído com sucesso!");
    } catch (error) {
      console.error('Error deleting case:', error);
    }
  };

  const trackSourceUsage = async (source, categoryKey) => {
    if (!selectedCase) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BACKEND_URL}/api/athena/defensive-investigation/case/${selectedCase.id}/source-used`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_name: source.name,
          source_url: source.url,
          category: categoryKey
        })
      });
    } catch (error) {
      console.error('Error tracking source usage:', error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Casos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_cases || 0}</p>
            </div>
            <FolderPlus className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Casos Ativos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active_cases || 0}</p>
            </div>
            <Eye className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Casos Concluídos</p>
              <p className="text-2xl font-bold text-gray-600">{stats.completed_cases || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categorias OSINT</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total_categories || 0}</p>
            </div>
            <Database className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Fontes Favoritas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((fav, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{fav.name}</h4>
                  <button
                    onClick={() => removeFromFavorites(fav.url)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">{fav.description}</p>
                <a
                  href={fav.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  Acessar <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Cases */}
      {stats.recent_cases && stats.recent_cases.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Casos Recentes</h3>
          <div className="space-y-3">
            {stats.recent_cases.map((recentCase) => (
              <div
                key={recentCase.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => viewCaseDetails(recentCase.id)}
              >
                <div>
                  <p className="font-medium text-gray-900">{recentCase.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(recentCase.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  recentCase.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {recentCase.status === 'active' ? 'Ativo' : 'Concluído'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSources = () => {
    const filteredCategories = Object.entries(categories).filter(([key, cat]) => {
      if (!searchQuery) return true;
      return cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             cat.sources?.some(s => 
               s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               s.description?.toLowerCase().includes(searchQuery.toLowerCase())
             );
    });

    return (
      <div className="space-y-6">
        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar fontes OSINT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        {filteredCategories.map(([key, category]) => {
          const Icon = categoryIcons[key] || Database;
          return (
            <div key={key} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon className="w-5 h-5 text-blue-600" />
                {category.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.sources.map((source, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{source.name}</h4>
                      <button
                        onClick={() => addToFavorites({ ...source, category: key })}
                        className="text-gray-400 hover:text-yellow-500"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{source.description}</p>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackSourceUsage(source, key)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      Acessar <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCases = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Casos de Investigação</h2>
        <button
          onClick={() => setShowNewCaseModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Novo Caso
        </button>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((caseItem) => (
          <div key={caseItem.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{caseItem.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{caseItem.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                caseItem.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {caseItem.status === 'active' ? 'Ativo' : 'Concluído'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="w-4 h-4" />
                <span>Alvo: {caseItem.target || 'Não especificado'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(caseItem.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>{caseItem.notes?.length || 0} notas, {caseItem.findings?.length || 0} descobertas</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => viewCaseDetails(caseItem.id)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Eye className="w-4 h-4" />
                Ver Detalhes
              </button>
              <button
                onClick={() => deleteCase(caseItem.id)}
                className="flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {cases.length === 0 && (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <FolderPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum caso criado</h3>
          <p className="text-gray-600 mb-4">Comece criando seu primeiro caso de investigação</p>
          <button
            onClick={() => setShowNewCaseModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Criar Primeiro Caso
          </button>
        </div>
      )}
    </div>
  );

  const renderCaseDetail = () => {
    if (!selectedCase) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCase.title}</h2>
              <p className="text-gray-600">{selectedCase.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              selectedCase.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {selectedCase.status === 'active' ? 'Ativo' : 'Concluído'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-gray-600">Alvo</p>
              <p className="font-medium">{selectedCase.target || 'Não especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipo</p>
              <p className="font-medium capitalize">{selectedCase.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Criado em</p>
              <p className="font-medium">{new Date(selectedCase.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Findings */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Descobertas ({selectedCase.findings?.length || 0})</h3>
          
          {/* Add Finding Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-3">Adicionar Descoberta</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título da descoberta"
                value={newFinding.title}
                onChange={(e) => setNewFinding({...newFinding, title: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Descrição"
                value={newFinding.description}
                onChange={(e) => setNewFinding({...newFinding, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows="2"
              />
              <input
                type="text"
                placeholder="URL da fonte"
                value={newFinding.source_url}
                onChange={(e) => setNewFinding({...newFinding, source_url: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <div className="flex gap-2">
                <select
                  value={newFinding.relevance}
                  onChange={(e) => setNewFinding({...newFinding, relevance: e.target.value})}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="low">Baixa Relevância</option>
                  <option value="medium">Média Relevância</option>
                  <option value="high">Alta Relevância</option>
                </select>
                <button
                  onClick={addFinding}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>

          {/* Findings List */}
          <div className="space-y-3">
            {selectedCase.findings?.map((finding) => (
              <div key={finding.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{finding.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    finding.relevance === 'high' ? 'bg-red-100 text-red-700' :
                    finding.relevance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {finding.relevance === 'high' ? 'Alta' : finding.relevance === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{finding.description}</p>
                {finding.source_url && (
                  <a
                    href={finding.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    Ver fonte <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(finding.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
            {(!selectedCase.findings || selectedCase.findings.length === 0) && (
              <p className="text-gray-500 text-center py-4">Nenhuma descoberta registrada</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Notas ({selectedCase.notes?.length || 0})</h3>
          
          {/* Add Note */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Adicionar nota..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addNote()}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={addNote}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          {/* Notes List */}
          <div className="space-y-2">
            {selectedCase.notes?.map((note) => (
              <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-900">{note.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(note.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
            {(!selectedCase.notes || selectedCase.notes.length === 0) && (
              <p className="text-gray-500 text-center py-4">Nenhuma nota registrada</p>
            )}
          </div>
        </div>

        {/* Sources Used */}
        {selectedCase.sources_used && selectedCase.sources_used.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Fontes Utilizadas</h3>
            <div className="space-y-2">
              {selectedCase.sources_used.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{source.source_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(source.used_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <a
                    href={source.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <UniversalModuleLayout
      title="Defensive Investigation"
      subtitle="Sistema integrado"
      icon={FileText}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg mb-6">
          <h1 className="text-3xl font-bold mb-2">Investigação Defensiva - OSINT</h1>
          <p className="text-blue-100">
            Ferramentas e recursos de fontes abertas para investigações defensivas
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'sources'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Fontes OSINT
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'cases'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Casos
            </button>
            {activeTab === 'case-detail' && (
              <button
                onClick={() => setActiveTab('cases')}
                className="ml-auto px-6 py-3 text-gray-600 hover:text-gray-900"
              >
                ← Voltar para Casos
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'sources' && renderSources()}
        {activeTab === 'cases' && renderCases()}
        {activeTab === 'case-detail' && renderCaseDetail()}

        {/* New Case Modal */}
        {showNewCaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Novo Caso de Investigação</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título do Caso
                  </label>
                  <input
                    type="text"
                    value={newCase.title}
                    onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: Investigação sobre Empresa XYZ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={newCase.description}
                    onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
                    placeholder="Descreva o objetivo da investigação"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alvo
                  </label>
                  <input
                    type="text"
                    value={newCase.target}
                    onChange={(e) => setNewCase({...newCase, target: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Nome da pessoa ou empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newCase.type}
                    onChange={(e) => setNewCase({...newCase, type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="person">Pessoa</option>
                    <option value="company">Empresa</option>
                    <option value="event">Evento</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowNewCaseModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createCase}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Criar Caso
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </UniversalModuleLayout>
  );
};

export default DefensiveInvestigation;
