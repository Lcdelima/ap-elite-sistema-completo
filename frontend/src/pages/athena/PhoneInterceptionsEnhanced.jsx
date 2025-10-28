import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import {
  Radio, Upload, Play, Pause, Download, FileAudio, Clock, User, MapPin,
  TrendingUp, AlertCircle, CheckCircle, Sparkles, Phone, PhoneCall,
  PhoneIncoming, PhoneOutgoing, PhoneMissed, Search, Filter, Calendar,
  BarChart3, FileText, MessageSquare, Mic, Volume2, Hash, Globe,
  Shield, Lock, Eye, Edit, Trash2, Plus, X, ChevronDown, Users
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const PhoneInterceptionsEnhanced = () => {
  const [interceptions, setInterceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInterception, setSelectedInterception] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, incoming, outgoing, missed
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [formData, setFormData] = useState({
    // Dados da Interceptação
    caseId: '',
    caseNumber: '',
    courtOrder: '',
    orderDate: '',
    expirationDate: '',
    targetNumber: '',
    targetName: '',
    targetDocument: '',
    
    // Dados da Chamada
    callType: 'incoming', // incoming, outgoing, missed
    callerNumber: '',
    receiverNumber: '',
    callDate: '',
    callTime: '',
    duration: '',
    
    // Localização
    callerLocation: '',
    receiverLocation: '',
    cellTower: '',
    
    // Arquivo de Áudio
    audioFile: null,
    
    // Transcrição e Análise
    transcription: '',
    summary: '',
    keywords: '',
    relevance: 'medium', // low, medium, high, critical
    
    // Observações
    observations: '',
    legalNotes: ''
  });

  useEffect(() => {
    fetchInterceptions();
  }, []);

  const fetchInterceptions = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/phone-interceptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setInterceptions(res.data.interceptions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post(
        `${BACKEND_URL}/api/athena/phone-interceptions`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Interceptação registrada com sucesso!');
      setShowModal(false);
      fetchInterceptions();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao registrar interceptação');
    }
  };

  const resetForm = () => {
    setFormData({
      caseId: '', caseNumber: '', courtOrder: '', orderDate: '', expirationDate: '',
      targetNumber: '', targetName: '', targetDocument: '', callType: 'incoming',
      callerNumber: '', receiverNumber: '', callDate: '', callTime: '', duration: '',
      callerLocation: '', receiverLocation: '', cellTower: '', audioFile: null,
      transcription: '', summary: '', keywords: '', relevance: 'medium',
      observations: '', legalNotes: ''
    });
  };

  const getStats = () => {
    const total = interceptions.length;
    const incoming = interceptions.filter(i => i.callType === 'incoming').length;
    const outgoing = interceptions.filter(i => i.callType === 'outgoing').length;
    const critical = interceptions.filter(i => i.relevance === 'critical').length;
    
    return { total, incoming, outgoing, critical };
  };

  const stats = getStats();

  const getCallTypeIcon = (type) => {
    const icons = {
      incoming: PhoneIncoming,
      outgoing: PhoneOutgoing,
      missed: PhoneMissed
    };
    return icons[type] || PhoneCall;
  };

  const getCallTypeColor = (type) => {
    const colors = {
      incoming: 'text-green-500',
      outgoing: 'text-blue-500',
      missed: 'text-red-500'
    };
    return colors[type] || 'text-gray-500';
  };

  const getRelevanceBadge = (relevance) => {
    const config = {
      low: { color: 'bg-gray-500', text: 'Baixa' },
      medium: { color: 'bg-blue-500', text: 'Média' },
      high: { color: 'bg-orange-500', text: 'Alta' },
      critical: { color: 'bg-red-500', text: 'Crítica' }
    };
    const { color, text } = config[relevance] || config.medium;
    return <Badge className={`${color} text-white`}>{text}</Badge>;
  };

  const filteredInterceptions = interceptions.filter(item => {
    const matchTab = activeTab === 'all' || item.callType === activeTab;
    const matchSearch = !searchTerm || 
      item.targetNumber?.includes(searchTerm) ||
      item.targetName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.caseNumber?.includes(searchTerm);
    const matchDate = !filterDate || item.callDate === filterDate;
    
    return matchTab && matchSearch && matchDate;
  });

  return (
    <AthenaLayout title="Interceptações Telefônicas" subtitle="Análise avançada de chamadas com IA">
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">Total de Interceptações</span>
                <Radio className="h-8 w-8 opacity-80" />
              </div>
              <p className="text-4xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">Chamadas Recebidas</span>
                <PhoneIncoming className="h-8 w-8 opacity-80" />
              </div>
              <p className="text-4xl font-bold">{stats.incoming}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">Chamadas Realizadas</span>
                <PhoneOutgoing className="h-8 w-8 opacity-80" />
              </div>
              <p className="text-4xl font-bold">{stats.outgoing}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm opacity-90">Críticas</span>
                <AlertCircle className="h-8 w-8 opacity-80" />
              </div>
              <p className="text-4xl font-bold">{stats.critical}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                {['all', 'incoming', 'outgoing', 'missed'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {tab === 'all' ? 'Todas' : 
                     tab === 'incoming' ? 'Recebidas' :
                     tab === 'outgoing' ? 'Realizadas' : 'Perdidas'}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por número, nome ou caso..."
                    className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />

                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all font-semibold"
                >
                  <Plus className="h-5 w-5" />
                  <span>Nova Interceptação</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interceptions List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <FileAudio className="h-6 w-6 mr-2 text-cyan-400" />
              Interceptações Registradas
            </h2>

            {loading ? (
              <div className="text-center py-12 text-slate-400">
                <Clock className="h-12 w-12 mx-auto mb-4 animate-spin" />
                <p>Carregando interceptações...</p>
              </div>
            ) : filteredInterceptions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Radio className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Nenhuma interceptação encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInterceptions.map((item, idx) => {
                  const CallIcon = getCallTypeIcon(item.callType);
                  
                  return (
                    <div
                      key={idx}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700 transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedInterception(item);
                        setShowDetailModal(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`p-3 rounded-lg ${
                            item.callType === 'incoming' ? 'bg-green-500/20' :
                            item.callType === 'outgoing' ? 'bg-blue-500/20' : 'bg-red-500/20'
                          }`}>
                            <CallIcon className={`h-6 w-6 ${getCallTypeColor(item.callType)}`} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">
                                {item.targetName || 'Alvo não identificado'}
                              </h3>
                              {getRelevanceBadge(item.relevance)}
                              {item.transcription && (
                                <Badge className="bg-purple-500 text-white">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  IA Transcrito
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-300">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-cyan-400" />
                                <span>{item.targetNumber || 'N/A'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-cyan-400" />
                                <span>{item.callDate ? new Date(item.callDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-cyan-400" />
                                <span>{item.duration || '0:00'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-cyan-400" />
                                <span>{item.callerLocation || 'Desconhecido'}</span>
                              </div>
                            </div>

                            {item.summary && (
                              <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                                {item.summary}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {item.audioFile && (
                            <button className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                              <Play className="h-4 w-4 text-white" />
                            </button>
                          )}
                          <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                            <Download className="h-4 w-4 text-white" />
                          </button>
                          <button className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors">
                            <Eye className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal - Nova Interceptação */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Radio className="h-6 w-6 mr-3 text-cyan-400" />
                  Nova Interceptação Telefônica
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Dados do Processo */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-cyan-400" />
                    Autorização Judicial
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Número do Caso *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.caseNumber}
                        onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
                        placeholder="CASO-2025-001"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Mandado Judicial *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.courtOrder}
                        onChange={(e) => setFormData({...formData, courtOrder: e.target.value})}
                        placeholder="Nº do Mandado"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Data de Expiração *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.expirationDate}
                        onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados do Alvo */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-cyan-400" />
                    Identificação do Alvo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.targetName}
                        onChange={(e) => setFormData({...formData, targetName: e.target.value})}
                        placeholder="Nome do investigado"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Número Monitorado *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.targetNumber}
                        onChange={(e) => setFormData({...formData, targetNumber: e.target.value})}
                        placeholder="(11) 99999-9999"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        CPF/CNPJ
                      </label>
                      <input
                        type="text"
                        value={formData.targetDocument}
                        onChange={(e) => setFormData({...formData, targetDocument: e.target.value})}
                        placeholder="000.000.000-00"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados da Chamada */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <PhoneCall className="h-5 w-5 mr-2 text-cyan-400" />
                    Detalhes da Chamada
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Tipo de Chamada *
                      </label>
                      <select
                        value={formData.callType}
                        onChange={(e) => setFormData({...formData, callType: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="incoming">Recebida</option>
                        <option value="outgoing">Realizada</option>
                        <option value="missed">Perdida</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Data da Chamada *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.callDate}
                        onChange={(e) => setFormData({...formData, callDate: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Duração
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        placeholder="00:05:32"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Localização */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-cyan-400" />
                    Localização
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Local do Originador
                      </label>
                      <input
                        type="text"
                        value={formData.callerLocation}
                        onChange={(e) => setFormData({...formData, callerLocation: e.target.value})}
                        placeholder="São Paulo - SP"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Local do Receptor
                      </label>
                      <input
                        type="text"
                        value={formData.receiverLocation}
                        onChange={(e) => setFormData({...formData, receiverLocation: e.target.value})}
                        placeholder="Rio de Janeiro - RJ"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        ERB / Torre
                      </label>
                      <input
                        type="text"
                        value={formData.cellTower}
                        onChange={(e) => setFormData({...formData, cellTower: e.target.value})}
                        placeholder="ERB-SP-1234"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload de Áudio */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FileAudio className="h-5 w-5 mr-2 text-cyan-400" />
                    Arquivo de Áudio
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Upload do Áudio da Chamada
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setFormData({...formData, audioFile: e.target.files[0]})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Formatos aceitos: MP3, WAV, M4A, AAC (Máx: 100MB)
                    </p>
                  </div>
                </div>

                {/* Análise e Transcrição */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-cyan-400" />
                    Análise e Transcrição
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Relevância da Interceptação *
                      </label>
                      <select
                        value={formData.relevance}
                        onChange={(e) => setFormData({...formData, relevance: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                        <option value="critical">Crítica</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Transcrição (gerada por IA ou manual)
                      </label>
                      <textarea
                        value={formData.transcription}
                        onChange={(e) => setFormData({...formData, transcription: e.target.value})}
                        placeholder="Cole ou digite a transcrição da chamada..."
                        rows="4"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Resumo da Conversa
                      </label>
                      <textarea
                        value={formData.summary}
                        onChange={(e) => setFormData({...formData, summary: e.target.value})}
                        placeholder="Resumo dos principais pontos discutidos..."
                        rows="3"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Palavras-chave
                      </label>
                      <input
                        type="text"
                        value={formData.keywords}
                        onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                        placeholder="drogas, arma, encontro, dinheiro (separado por vírgula)"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Observações Investigativas
                  </label>
                  <textarea
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    placeholder="Observações relevantes para a investigação..."
                    rows="3"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50"
                  >
                    {processing ? 'Processando...' : 'Registrar Interceptação'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </UniversalModuleLayout>
  );
};

export default PhoneInterceptionsEnhanced;
