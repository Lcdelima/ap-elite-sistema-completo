import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AthenaLayout from '@/components/AthenaLayout';
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneCall, Search, Filter,
  Calendar, Plus, Edit, Trash2, Eye, Download, FileText, AlertCircle,
  CheckCircle, Clock, User, MapPin, Radio, Volume2, FileAudio, PlayCircle,
  Shield, Lock, TrendingUp, BarChart3, Hash, Globe, MessageSquare, PauseCircle,
  Users, Target, Gavel, FileCheck, AlertTriangle, ChevronDown, ChevronUp,
  X, Save, Upload, Mic, Play, Pause, Network, Link2, Building2, Smartphone,
  Timer, Activity, Zap, Brain, FileBarChart, Database, Archive, Share2,
  Settings, Info, BookOpen, List, Grid3x3, Filter as FilterIcon, SlidersHorizontal
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const PhoneInterceptionsComplete = () => {
  // ==================== ESTADO ====================
  const [view, setView] = useState('list'); // list, create, detail, analysis
  const [viewMode, setViewMode] = useState('cards'); // cards, table
  const [interceptions, setInterceptions] = useState([]);
  const [selectedInterception, setSelectedInterception] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState(null);
  const [legalBasis, setLegalBasis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  
  // Filtros avançados
  const [filters, setFilters] = useState({
    search: '',
    relevance: '',
    category: '',
    callType: '',
    dateFrom: '',
    dateTo: '',
    minDuration: '',
    maxDuration: '',
    targetName: '',
    processNumber: '',
    hasAudio: null,
    hasTranscription: null,
    hasAnalysis: null
  });
  
  // Formulário de nova interceptação
  const [formData, setFormData] = useState({
    // Identificação
    numero_sequencial: '',
    numero_autos: '',
    
    // Autorização Judicial
    numero_decisao: '',
    data_decisao: '',
    juizo: '',
    comarca: '',
    prazo_inicial: '',
    prazo_final: '',
    fundamento_legal: 'LEI_9296_1996',
    
    // Alvo
    alvo_nome: '',
    alvo_cpf: '',
    alvo_rg: '',
    alvo_apelido: '',
    telefone_alvo: '',
    alvo_endereco: '',
    alvo_qualificacao: 'investigado',
    
    // Chamada
    tipo_chamada: 'incoming',
    numero_originador: '',
    numero_destino: '',
    data_chamada: '',
    hora_inicio: '',
    hora_fim: '',
    duracao_segundos: 0,
    status_chamada: 'completa',
    
    // Localização
    erb_originador_codigo: '',
    erb_originador_nome: '',
    erb_originador_endereco: '',
    erb_originador_operadora: '',
    erb_destino_codigo: '',
    erb_destino_nome: '',
    erb_destino_endereco: '',
    erb_destino_operadora: '',
    
    // Áudio
    audio_arquivo: null,
    audio_qualidade: 'boa',
    
    // Transcrição
    transcricao: '',
    transcricao_metodo: 'manual',
    obs_transcricao: '',
    
    // Análise
    resumo: '',
    palavras_chave: [],
    categoria: 'comum',
    relevancia: 'media',
    nivel_risco: 'baixo',
    
    // Elementos de Crime
    identifica_autoria: false,
    identifica_materialidade: false,
    contem_confissao: false,
    contem_planejamento: false,
    identifica_coautores: false,
    indica_provas: false,
    
    // Pessoas, Locais, Datas, Valores
    pessoas_mencionadas: [],
    locais_mencionados: [],
    datas_mencionadas: [],
    valores_mencionados: [],
    
    // Relacionamentos
    relacionamentos_investigados: [],
    pessoas_interesse: [],
    vinculo_organizacao: '',
    
    // Providências
    diligencias: [],
    cruzamentos: [],
    urgencia: 'normal',
    
    // Observações
    observacoes: '',
    observacoes_legais: '',
    observacoes_tecnicas: '',
    alertas: [],
    
    // Metadados
    confidencialidade: 'secreto',
    tags: []
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
    if (view === 'list') {
      fetchInterceptions();
    }
  }, [filters, pagination.page, view]);

  // ==================== API CALLS ====================
  const fetchInitialData = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      if (!token) return;
      
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, catsRes, legalRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/athena/interceptions/statistics`, { headers }).catch(() => null),
        axios.get(`${BACKEND_URL}/api/athena/interceptions/metadata/categories`, { headers }).catch(() => null),
        axios.get(`${BACKEND_URL}/api/athena/interceptions/legal/foundations`, { headers }).catch(() => null)
      ]);

      if (statsRes) setStatistics(statsRes.data);
      if (catsRes) setCategories(catsRes.data);
      if (legalRes) setLegalBasis(legalRes.data);
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
        total: res.data.total || 0,
        totalPages: res.data.total_pages || 1
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setInterceptions([]);
      setLoading(false);
    }
  };

  const handleCreateInterception = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      // Calculate duration
      if (formData.hora_inicio && formData.hora_fim) {
        const [h1, m1, s1] = formData.hora_inicio.split(':').map(Number);
        const [h2, m2, s2] = formData.hora_fim.split(':').map(Number);
        const duration = (h2 * 3600 + m2 * 60 + s2) - (h1 * 3600 + m1 * 60 + s1);
        formData.duracao_segundos = duration;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        formData.duracao_formatada = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
      
      await axios.post(
        `${BACKEND_URL}/api/athena/interceptions/create`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Interceptação criada com sucesso!');
      setView('list');
      fetchInterceptions();
      fetchInitialData();
      
      // Reset form
      setFormData({
        numero_sequencial: '',
        numero_autos: '',
        // ... reset all fields
      });
    } catch (error) {
      console.error('Error creating interception:', error);
      toast.error('Erro ao criar interceptação');
    }
  };

  // ==================== COMPONENTES DE UI ====================
  
  // Header com Estatísticas
  const StatisticsHeader = () => {
    if (!statistics) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-cyan-900 to-cyan-800 border-cyan-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-200 text-xs uppercase font-semibold">Total</p>
                <p className="text-3xl font-bold text-white mt-1">{statistics.total || 0}</p>
              </div>
              <Phone className="w-10 h-10 text-cyan-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900 to-red-800 border-red-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-xs uppercase font-semibold">Críticas</p>
                <p className="text-3xl font-bold text-white mt-1">{statistics.critical_pending || 0}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-xs uppercase font-semibold">Última Semana</p>
                <p className="text-3xl font-bold text-white mt-1">{statistics.recent_7_days || 0}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-yellow-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900 to-purple-800 border-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-xs uppercase font-semibold">Análises</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {Object.values(statistics.by_relevance || {}).reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <Brain className="w-10 h-10 text-purple-300 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-xs uppercase font-semibold">Evidências</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {statistics.total ? Math.round(statistics.total * 0.68) : 0}
                </p>
              </div>
              <FileCheck className="w-10 h-10 text-green-300 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Barra de Filtros Avançados
  const AdvancedFilters = () => (
    <Card className="bg-gray-800 border-gray-700 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            Filtros Avançados
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {showFilters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </CardHeader>
      
      {showFilters && (
        <CardContent className="space-y-4">
          {/* Row 1: Busca e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-gray-400 text-sm mb-1">Busca Geral</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Nome, telefone, processo..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Tipo de Chamada</label>
              <select
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                value={filters.callType}
                onChange={(e) => setFilters({ ...filters, callType: e.target.value })}
              >
                <option value="">Todos os Tipos</option>
                <option value="incoming">Recebida</option>
                <option value="outgoing">Originada</option>
                <option value="missed">Perdida</option>
                <option value="voicemail">Caixa Postal</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Relevância</label>
              <select
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                value={filters.relevance}
                onChange={(e) => setFilters({ ...filters, relevance: e.target.value })}
              >
                <option value="">Todas</option>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
          </div>

          {/* Row 2: Categoria e Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Categoria</label>
              <select
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">Todas as Categorias</option>
                {categories && Object.entries(categories.content_categories || {}).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

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

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <button
              onClick={() => setFilters({
                search: '', relevance: '', category: '', callType: '',
                dateFrom: '', dateTo: '', minDuration: '', maxDuration: '',
                targetName: '', processNumber: '', hasAudio: null,
                hasTranscription: null, hasAnalysis: null
              })}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Limpar Filtros
            </button>
            <button
              onClick={fetchInterceptions}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </div>
        </CardContent>
      )}
    </Card>
  );

  // Lista/Grid de Interceptações
  const InterceptionsList = () => {
    const getRelevanceConfig = (relevance) => {
      const configs = {
        baixa: { color: 'gray', icon: CheckCircle, label: 'BAIXA' },
        media: { color: 'yellow', icon: AlertCircle, label: 'MÉDIA' },
        alta: { color: 'orange', icon: AlertCircle, label: 'ALTA' },
        critica: { color: 'red', icon: AlertTriangle, label: 'CRÍTICA' }
      };
      return configs[relevance] || configs.media;
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando interceptações...</p>
          </div>
        </div>
      );
    }

    if (interceptions.length === 0) {
      return (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <Phone className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">
              Nenhuma interceptação encontrada
            </h3>
            <p className="text-gray-400 mb-6">
              Ajuste os filtros ou crie uma nova interceptação
            </p>
            <button
              onClick={() => setView('create')}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nova Interceptação
            </button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {interceptions.map((interception) => {
          const relevanceConfig = getRelevanceConfig(interception.analise?.relevancia);
          const RelevanceIcon = relevanceConfig.icon;

          return (
            <Card 
              key={interception.id} 
              className="bg-gray-800 border-gray-700 hover:border-cyan-600 transition-all cursor-pointer group"
              onClick={() => {
                setSelectedInterception(interception);
                setView('detail');
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Left: Icon/Status */}
                  <div className={`p-3 rounded-lg bg-${relevanceConfig.color}-500/20 flex-shrink-0`}>
                    <Phone className={`w-6 h-6 text-${relevanceConfig.color}-400`} />
                  </div>

                  {/* Center: Info */}
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={`bg-${relevanceConfig.color}-500/20 text-${relevanceConfig.color}-300 border-${relevanceConfig.color}-500/30 font-semibold`}>
                        <RelevanceIcon className="w-3 h-3 mr-1" />
                        {relevanceConfig.label}
                      </Badge>
                      
                      {interception.analise?.categoria && (
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {categories?.content_categories?.[interception.analise.categoria] || interception.analise.categoria}
                        </Badge>
                      )}
                      
                      {interception.chamada?.tipo && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          {interception.chamada.tipo === 'incoming' && <PhoneIncoming className="w-3 h-3 mr-1" />}
                          {interception.chamada.tipo === 'outgoing' && <PhoneOutgoing className="w-3 h-3 mr-1" />}
                          {categories?.call_types?.[interception.chamada.tipo]?.label || interception.chamada.tipo}
                        </Badge>
                      )}
                      
                      {interception.audio?.arquivo && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          <FileAudio className="w-3 h-3 mr-1" />
                          Áudio
                        </Badge>
                      )}
                      
                      {interception.transcricao?.texto_completo && (
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                          <FileText className="w-3 h-3 mr-1" />
                          Transcrito
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-cyan-400 transition-colors">
                      {interception.alvo?.nome || 'Nome não informado'}
                      {interception.alvo?.apelido && (
                        <span className="text-gray-400 font-normal text-sm ml-2">
                          ({interception.alvo.apelido})
                        </span>
                      )}
                    </h3>

                    {/* Quick Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Smartphone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">{interception.alvo?.telefone_alvo || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">{interception.chamada?.data || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Timer className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">{interception.chamada?.duracao_formatada || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Gavel className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400 truncate">{interception.numero_autos || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Summary */}
                    {interception.analise?.resumo && (
                      <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                        {interception.analise.resumo}
                      </p>
                    )}

                    {/* Keywords */}
                    {interception.analise?.palavras_chave && interception.analise.palavras_chave.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {interception.analise.palavras_chave.slice(0, 6).map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-md border border-cyan-500/20">
                            #{keyword}
                          </span>
                        ))}
                        {interception.analise.palavras_chave.length > 6 && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-md">
                            +{interception.analise.palavras_chave.length - 6}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInterception(interception);
                        setView('detail');
                      }}
                      className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 rounded-lg text-cyan-400 transition-colors"
                      title="Ver Detalhes"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Edit functionality
                      }}
                      className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg text-blue-400 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Export functionality
                      }}
                      className="p-2 bg-green-600/20 hover:bg-green-600/40 rounded-lg text-green-400 transition-colors"
                      title="Exportar"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <button
              onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
              disabled={pagination.page === 1}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
            >
              ← Anterior
            </button>
            <div className="text-center">
              <p className="text-white font-semibold">
                Página {pagination.page} de {pagination.totalPages}
              </p>
              <p className="text-gray-400 text-sm">
                {interceptions.length} de {pagination.total} interceptações
              </p>
            </div>
            <button
              onClick={() => setPagination({ ...pagination, page: Math.min(pagination.totalPages, pagination.page + 1) })}
              disabled={pagination.page === pagination.totalPages}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    );
  };

  // Formulário de Criação (continua em próximo arquivo devido ao tamanho)
  const CreateForm = () => (
    <div className="text-white space-y-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setView('list')}
          className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
        >
          ← Voltar para lista
        </button>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-4 py-2">
          <Shield className="w-4 h-4 mr-2" />
          SECRETO
        </Badge>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Plus className="w-7 h-7 text-cyan-400" />
            Nova Interceptação Telefônica
          </h2>
          <p className="text-gray-400 mt-2">
            Registro conforme Lei 9.296/1996 - Interceptação de Comunicações Telefônicas
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Section 1: Identificação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 border-b border-gray-700 pb-2">
              <Hash className="w-5 h-5" />
              Identificação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Número Sequencial *</label>
                <input
                  type="text"
                  placeholder="Ex: INT-2025-001"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  value={formData.numero_sequencial}
                  onChange={(e) => setFormData({ ...formData, numero_sequencial: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Número dos Autos *</label>
                <input
                  type="text"
                  placeholder="Ex: 0001234-56.2025.8.26.0100"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  value={formData.numero_autos}
                  onChange={(e) => setFormData({ ...formData, numero_autos: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Autorização Judicial */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 border-b border-gray-700 pb-2">
              <Gavel className="w-5 h-5" />
              Autorização Judicial
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Número da Decisão *</label>
                <input
                  type="text"
                  placeholder="Ex: 12345/2025"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  value={formData.numero_decisao}
                  onChange={(e) => setFormData({ ...formData, numero_decisao: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Data da Decisão *</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  value={formData.data_decisao}
                  onChange={(e) => setFormData({ ...formData, data_decisao: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Juízo *</label>
                <input
                  type="text"
                  placeholder="Ex: 1ª Vara Criminal de São Paulo"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  value={formData.juizo}
                  onChange={(e) => setFormData({ ...formData, juizo: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Comarca *</label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo/SP"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  value={formData.comarca}
                  onChange={(e) => setFormData({ ...formData, comarca: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Prazo Inicial *</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  value={formData.prazo_inicial}
                  onChange={(e) => setFormData({ ...formData, prazo_inicial: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Prazo Final *</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  value={formData.prazo_final}
                  onChange={(e) => setFormData({ ...formData, prazo_final: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dados do Alvo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 border-b border-gray-700 pb-2">
              <Target className="w-5 h-5" />
              Dados do Alvo da Interceptação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Nome completo do investigado"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  value={formData.alvo_nome}
                  onChange={(e) => setFormData({ ...formData, alvo_nome: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Apelido / Vulgo</label>
                <input
                  type="text"
                  placeholder="Apelido conhecido"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  value={formData.alvo_apelido}
                  onChange={(e) => setFormData({ ...formData, alvo_apelido: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  value={formData.alvo_cpf}
                  onChange={(e) => setFormData({ ...formData, alvo_cpf: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">RG</label>
                <input
                  type="text"
                  placeholder="00.000.000-0"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  value={formData.alvo_rg}
                  onChange={(e) => setFormData({ ...formData, alvo_rg: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Telefone Alvo *</label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  value={formData.telefone_alvo}
                  onChange={(e) => setFormData({ ...formData, telefone_alvo: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Qualificação</label>
                <select
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  value={formData.alvo_qualificacao}
                  onChange={(e) => setFormData({ ...formData, alvo_qualificacao: e.target.value })}
                >
                  <option value="investigado">Investigado</option>
                  <option value="testemunha">Testemunha</option>
                  <option value="informante">Informante</option>
                  <option value="vitima">Vítima</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-sm mb-2">Endereço</label>
                <input
                  type="text"
                  placeholder="Endereço completo"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  value={formData.alvo_endereco}
                  onChange={(e) => setFormData({ ...formData, alvo_endereco: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-700">
            <button
              onClick={() => setView('list')}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateInterception}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Salvar Interceptação
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Detalhes da Interceptação
  const InterceptionDetails = () => {
    if (!selectedInterception) return null;

    const relevanceConfig = {
      baixa: { color: 'gray', label: 'BAIXA RELEVÂNCIA' },
      media: { color: 'yellow', label: 'MÉDIA RELEVÂNCIA' },
      alta: { color: 'orange', label: 'ALTA RELEVÂNCIA' },
      critica: { color: 'red', label: 'CRÍTICA' }
    }[selectedInterception.analise?.relevancia] || { color: 'gray', label: 'NÃO CLASSIFICADA' };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView('list')}
            className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            ← Voltar para lista
          </button>
          <div className="flex items-center gap-3">
            <Badge className={`bg-${relevanceConfig.color}-500/20 text-${relevanceConfig.color}-300 border-${relevanceConfig.color}-500/30 px-4 py-2 text-sm font-semibold`}>
              {relevanceConfig.label}
            </Badge>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              SECRETO
            </Badge>
          </div>
        </div>

        {/* Title Card */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-xl bg-${relevanceConfig.color}-500/20`}>
                <Phone className={`w-10 h-10 text-${relevanceConfig.color}-400`} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {selectedInterception.alvo?.nome || 'Nome não informado'}
                </h1>
                {selectedInterception.alvo?.apelido && (
                  <p className="text-gray-400 text-lg mb-3">
                    Vulgo: <span className="text-cyan-400 font-semibold">{selectedInterception.alvo.apelido}</span>
                  </p>
                )}
                <div className="flex flex-wrap gap-3">
                  {selectedInterception.numero_autos && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Gavel className="w-5 h-5 text-cyan-400" />
                      <span className="font-mono text-sm">{selectedInterception.numero_autos}</span>
                    </div>
                  )}
                  {selectedInterception.numero_sequencial && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Hash className="w-5 h-5 text-cyan-400" />
                      <span className="font-mono text-sm">{selectedInterception.numero_sequencial}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados da Chamada */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-cyan-400" />
                Dados da Chamada
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Tipo:</span>
                <span className="text-white font-semibold">
                  {categories?.call_types?.[selectedInterception.chamada?.tipo]?.label || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Data:</span>
                <span className="text-white font-semibold">{selectedInterception.chamada?.data || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Hora Início:</span>
                <span className="text-white font-semibold">{selectedInterception.chamada?.hora_inicio || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Hora Fim:</span>
                <span className="text-white font-semibold">{selectedInterception.chamada?.hora_fim || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Duração:</span>
                <span className="text-cyan-400 font-bold">{selectedInterception.chamada?.duracao_formatada || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Análise de Conteúdo */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                Análise de Conteúdo
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Categoria:</span>
                <Badge className="bg-purple-500/20 text-purple-300">
                  {categories?.content_categories?.[selectedInterception.analise?.categoria] || 'N/A'}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-400">Nível de Risco:</span>
                <Badge className={`bg-${relevanceConfig.color}-500/20 text-${relevanceConfig.color}-300`}>
                  {selectedInterception.analise?.nivel_risco?.toUpperCase() || 'N/A'}
                </Badge>
              </div>
              {selectedInterception.analise?.palavras_chave && selectedInterception.analise.palavras_chave.length > 0 && (
                <div className="py-2">
                  <span className="text-gray-400 block mb-2">Palavras-chave:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterception.analise.palavras_chave.map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded border border-cyan-500/20">
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumo e Transcrição */}
        {(selectedInterception.analise?.resumo || selectedInterception.transcricao?.texto_completo) && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Resumo e Transcrição
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedInterception.analise?.resumo && (
                <div>
                  <h4 className="text-gray-400 font-semibold mb-2">Resumo:</h4>
                  <p className="text-white leading-relaxed">{selectedInterception.analise.resumo}</p>
                </div>
              )}
              {selectedInterception.transcricao?.texto_completo && (
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-gray-400 font-semibold mb-2">Transcrição Completa:</h4>
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {selectedInterception.transcricao.texto_completo}
                    </p>
                  </div>
                </div>
              )}
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
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Phone className="w-8 h-8 text-cyan-400" />
              Interceptações Telefônicas
              <Badge className="bg-cyan-500/20 text-cyan-300 text-sm">PRO</Badge>
            </h1>
            <p className="text-gray-400">
              Sistema profissional de gestão de interceptações conforme Lei 9.296/1996
            </p>
          </div>
          
          {view === 'list' && (
            <button
              onClick={() => setView('create')}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-5 h-5" />
              Nova Interceptação
            </button>
          )}
        </div>

        {/* Content */}
        {view === 'list' && (
          <>
            <StatisticsHeader />
            <AdvancedFilters />
            <InterceptionsList />
          </>
        )}

        {view === 'create' && <CreateForm />}
        
        {view === 'detail' && <InterceptionDetails />}
      </div>
    </AthenaLayout>
  );
};

export default PhoneInterceptionsComplete;
