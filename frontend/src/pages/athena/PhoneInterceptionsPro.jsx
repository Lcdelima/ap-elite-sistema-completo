import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AthenaLayout from '@/components/AthenaLayout';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, Filter,
  Calendar, Plus, Edit, Trash2, Eye, Download, FileText, AlertCircle,
  CheckCircle, Clock, User, MapPin, Radio, Volume2, FileAudio,
  Shield, Lock, TrendingUp, BarChart3, Hash, Globe, MessageSquare,
  Users, Target, Gavel, FileCheck, AlertTriangle, ChevronDown, ChevronUp,
  X, Save, Upload, Mic, Play, Pause
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const PhoneInterceptionsProfessional = () => {
  // ==================== ESTADO ====================
  const [interceptions, setInterceptions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState(null);
  const [legalBasis, setLegalBasis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('list'); // list, create, detail
  const [selectedInterception, setSelectedInterception] = useState(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    relevance: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    callType: ''
  });
  
  // Paginação
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // ==================== EFEITOS ====================
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchInterceptions();
  }, [filters, pagination.page]);

  // ==================== API CALLS ====================
  const fetchInitialData = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, catsRes, legalRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/athena/interceptions/statistics`, { headers }),
        axios.get(`${BACKEND_URL}/api/athena/interceptions/metadata/categories`, { headers }),
        axios.get(`${BACKEND_URL}/api/athena/interceptions/legal/foundations`, { headers })
      ]);

      setStatistics(statsRes.data);
      setCategories(catsRes.data);
      setLegalBasis(legalRes.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const fetchInterceptions = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');

      const params = new URLSearchParams({
        limit: pagination.limit,
        skip: (pagination.page - 1) * pagination.limit,
        ...(filters.relevance && { filter_relevance: filters.relevance }),
        ...(filters.category && { filter_category: filters.category }),
        ...(filters.dateFrom && { filter_date_from: filters.dateFrom }),
        ...(filters.dateTo && { filter_date_to: filters.dateTo }),
        ...(filters.search && { search: filters.search })
      });

      const res = await axios.get(
        `${BACKEND_URL}/api/athena/interceptions/list?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInterceptions(res.data.interceptions || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.total,
        totalPages: res.data.total_pages
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      toast.error('Erro ao carregar interceptações');
    }
  };

  // ==================== COMPONENTES DE UI ====================
  
  // Dashboard de Estatísticas
  const StatisticsDashboard = () => {
    if (!statistics) return null;

    const statsCards = [
      {
        label: 'Total de Interceptações',
        value: statistics.total,
        icon: Phone,
        color: 'blue'
      },
      {
        label: 'Críticas Pendentes',
        value: statistics.critical_pending,
        icon: AlertTriangle,
        color: 'red'
      },
      {
        label: 'Últimos 7 Dias',
        value: statistics.recent_7_days,
        icon: TrendingUp,
        color: 'green'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statsCards.map((stat, idx) => (
          <Card key={idx} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Barra de Filtros
  const FiltersBar = () => (
    <Card className="bg-gray-800 border-gray-700 mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Busca */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome, nº processo, telefone..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          {/* Relevância */}
          <select
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            value={filters.relevance}
            onChange={(e) => setFilters({ ...filters, relevance: e.target.value })}
          >
            <option value="">Todas Relevâncias</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>

          {/* Categoria */}
          <select
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">Todas Categorias</option>
            {categories && Object.entries(categories.content_categories || {}).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Botão Criar */}
          <button
            onClick={() => setActiveView('create')}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova Interceptação
          </button>
        </div>

        {/* Data Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Data Inicial</label>
            <input
              type="date"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Data Final</label>
            <input
              type="date"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Lista de Interceptações
  const InterceptionsList = () => {
    const getRelevanceColor = (relevance) => {
      const colors = {
        baixa: 'gray',
        media: 'yellow',
        alta: 'orange',
        critica: 'red'
      };
      return colors[relevance] || 'gray';
    };

    const getRelevanceIcon = (relevance) => {
      if (relevance === 'critica') return AlertTriangle;
      if (relevance === 'alta') return AlertCircle;
      return CheckCircle;
    };

    return (
      <div className="space-y-4">
        {interceptions.map((interception) => {
          const RelevanceIcon = getRelevanceIcon(interception.analise?.relevancia);
          const relevanceColor = getRelevanceColor(interception.analise?.relevancia);

          return (
            <Card 
              key={interception.id} 
              className="bg-gray-800 border-gray-700 hover:border-cyan-600 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedInterception(interception);
                setActiveView('detail');
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  {/* Info Principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`bg-${relevanceColor}-500/20 text-${relevanceColor}-400 border-${relevanceColor}-500/30`}>
                        <RelevanceIcon className="w-3 h-3 mr-1" />
                        {interception.analise?.relevancia?.toUpperCase()}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {categories?.content_categories[interception.analise?.categoria] || interception.analise?.categoria}
                      </Badge>
                      {interception.chamada?.tipo && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {interception.chamada.tipo === 'incoming' && <PhoneIncoming className="w-3 h-3 mr-1" />}
                          {interception.chamada.tipo === 'outgoing' && <PhoneOutgoing className="w-3 h-3 mr-1" />}
                          {categories?.call_types[interception.chamada.tipo]?.label}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-white font-semibold text-lg mb-1">
                      {interception.alvo?.nome || 'Nome não informado'}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-400 mb-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {interception.alvo?.telefone_alvo || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {interception.chamada?.data || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {interception.chamada?.duracao_formatada || 'N/A'}
                      </div>
                    </div>

                    {interception.analise?.resumo && (
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {interception.analise.resumo}
                      </p>
                    )}

                    {/* Palavras-chave */}
                    {interception.analise?.palavras_chave && interception.analise.palavras_chave.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {interception.analise.palavras_chave.slice(0, 5).map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-md">
                            #{keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInterception(interception);
                        setActiveView('detail');
                      }}
                      className="p-2 bg-cyan-600/20 hover:bg-cyan-600/30 rounded-lg text-cyan-400 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Implementar edição
                      }}
                      className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Implementar exportação
                      }}
                      className="p-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg text-green-400 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Nº Processo */}
                {interception.numero_autos && (
                  <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2 text-sm">
                    <Gavel className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Processo:</span>
                    <span className="text-white font-mono">{interception.numero_autos}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <button
              onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-white transition-colors"
            >
              Anterior
            </button>
            <span className="text-gray-400">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages, pagination.page + 1) })}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded-lg text-white transition-colors"
            >
              Próxima
            </button>
          </div>
        )}

        {interceptions.length === 0 && !loading && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <Phone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">
                Nenhuma interceptação encontrada
              </h3>
              <p className="text-gray-400">
                Ajuste os filtros ou crie uma nova interceptação
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ==================== RENDER PRINCIPAL ====================
  return (
    <AthenaLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              <Phone className="inline-block mr-3 text-cyan-400" />
              Interceptações Telefônicas
            </h1>
            <p className="text-gray-400">
              Sistema profissional de gerenciamento de interceptações conforme Lei 9.296/1996
            </p>
          </div>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            SECRETO
          </Badge>
        </div>

        {/* Conteúdo */}
        {activeView === 'list' && (
          <>
            <StatisticsDashboard />
            <FiltersBar />
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              </div>
            ) : (
              <InterceptionsList />
            )}
          </>
        )}

        {activeView === 'create' && (
          <div className="text-white">
            <button
              onClick={() => setActiveView('list')}
              className="mb-4 text-gray-400 hover:text-white flex items-center gap-2"
            >
              ← Voltar para lista
            </button>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Nova Interceptação</h2>
                <p className="text-gray-400">Formulário de criação será implementado aqui...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'detail' && selectedInterception && (
          <div className="text-white">
            <button
              onClick={() => setActiveView('list')}
              className="mb-4 text-gray-400 hover:text-white flex items-center gap-2"
            >
              ← Voltar para lista
            </button>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Detalhes da Interceptação
                </h2>
                <p className="text-gray-400">Detalhes completos serão implementados aqui...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AthenaLayout>
  );
};

export default PhoneInterceptionsProfessional;
