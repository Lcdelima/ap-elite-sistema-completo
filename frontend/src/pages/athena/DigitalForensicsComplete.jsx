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
  Microscope, HardDrive, Fingerprint, Shield, Upload, Download,
  FileSearch, Database, Lock, Unlock, AlertCircle, CheckCircle,
  Clock, Eye, Trash2, Plus, Brain, Sparkles, Hash, Target,
  Server, Cpu, Activity, Zap, Code, File, Image, Video,
  Smartphone, Wifi, Cloud, Key, Search, Filter, Calendar,
  User, Building, MapPin, TrendingUp, BarChart3, PieChart
} from 'lucide-react';
import { toast } from 'sonner';

const DigitalForensicsComplete = () => {
  const [forensics, setForensics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedForensic, setSelectedForensic] = useState(null);

  const [formData, setFormData] = useState({
    caseNumber: '',
    caseTitle: '',
    forensicType: 'computer',
    deviceType: '',
    deviceModel: '',
    serialNumber: '',
    operatingSystem: '',
    storageCapacity: '',
    client: '',
    requestDate: '',
    urgency: 'normal',
    objectives: '',
    legalWarrant: false,
    chainCustody: '',
    hashAlgorithm: 'SHA-256',
    aiAnalysis: true,
    evidenceFiles: [],
    notes: ''
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem('ap_elite_token');

  useEffect(() => {
    fetchForensics();
  }, []);

  const fetchForensics = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/forensics/digital`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setForensics(res.data.forensics || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar perícias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.caseNumber || !formData.caseTitle || !formData.deviceType) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setProcessing(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'evidenceFiles' && formData.evidenceFiles.length > 0) {
          formData.evidenceFiles.forEach(file => {
            formDataToSend.append('evidenceFiles', file);
          });
        } else if (typeof formData[key] === 'boolean') {
          formDataToSend.append(key, formData[key].toString());
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.post(
        `${backendUrl}/api/forensics/digital`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Perícia digital iniciada com sucesso!');
      setShowModal(false);
      fetchForensics();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar perícia');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      caseNumber: '',
      caseTitle: '',
      forensicType: 'computer',
      deviceType: '',
      deviceModel: '',
      serialNumber: '',
      operatingSystem: '',
      storageCapacity: '',
      client: '',
      requestDate: '',
      urgency: 'normal',
      objectives: '',
      legalWarrant: false,
      chainCustody: '',
      hashAlgorithm: 'SHA-256',
      aiAnalysis: true,
      evidenceFiles: [],
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      processing: { color: 'bg-yellow-500', text: 'Processando', icon: Clock },
      analyzing: { color: 'bg-blue-500', text: 'Analisando', icon: Brain },
      completed: { color: 'bg-green-500', text: 'Concluído', icon: CheckCircle },
      error: { color: 'bg-red-500', text: 'Erro', icon: AlertCircle }
    };
    
    const { color, text, icon: Icon } = config[status] || config.processing;
    
    return (
      <Badge className={`${color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const config = {
      critical: { color: 'bg-red-500', text: 'Crítica' },
      high: { color: 'bg-orange-500', text: 'Alta' },
      normal: { color: 'bg-blue-500', text: 'Normal' },
      low: { color: 'bg-green-500', text: 'Baixa' }
    };
    
    const { color, text } = config[urgency] || config.normal;
    return <Badge className={`${color} text-white`}>{text}</Badge>;
  };

  const getForensicTypeIcon = (type) => {
    const icons = {
      computer: HardDrive,
      mobile: Smartphone,
      network: Wifi,
      cloud: Cloud,
      memory: Database,
      malware: Shield
    };
    return icons[type] || HardDrive;
  };

  const getStats = () => {
    return {
      total: forensics.length,
      processing: forensics.filter(f => f.status === 'processing' || f.status === 'analyzing').length,
      completed: forensics.filter(f => f.status === 'completed').length,
      critical: forensics.filter(f => f.urgency === 'critical').length
    };
  };

  const stats = getStats();

  const filteredForensics = forensics.filter(forensic => {
    const matchesSearch = 
      forensic.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      forensic.caseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      forensic.deviceType?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || forensic.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const forensicTypes = [
    { value: 'computer', label: 'Computador/Notebook', icon: HardDrive },
    { value: 'mobile', label: 'Smartphone/Tablet', icon: Smartphone },
    { value: 'network', label: 'Análise de Rede', icon: Wifi },
    { value: 'cloud', label: 'Computação em Nuvem', icon: Cloud },
    { value: 'memory', label: 'Memória/Storage', icon: Database },
    { value: 'malware', label: 'Análise de Malware', icon: Shield }
  ];

  const hashAlgorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

  const headerActions = [
    {
      label: 'Nova Perícia',
      icon: Plus,
      onClick: () => setShowModal(true),
      variant: 'primary'
    }
  ];

  return (
    <StandardModuleLayout
      title="Perícia Digital Forense Completa"
      subtitle="Sistema profissional de análise forense com IA, cadeia de custódia e relatórios técnicos"
      icon={Microscope}
      color="purple"
      category="Forense"
      actions={headerActions}
      loading={loading}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total de Perícias</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <Microscope className="h-10 w-10 text-purple-400" />
          </div>
        </StandardCard>

        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Em Processamento</p>
              <p className="text-3xl font-bold text-white">{stats.processing}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-400 animate-pulse" />
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
              <p className="text-sm text-gray-400 mb-1">Urgência Crítica</p>
              <p className="text-3xl font-bold text-white">{stats.critical}</p>
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
          placeholder="Buscar por número, título ou dispositivo..."
        />
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
          >
            <option value="all">Todos os Status</option>
            <option value="processing">Processando</option>
            <option value="analyzing">Analisando</option>
            <option value="completed">Concluídas</option>
            <option value="error">Com Erro</option>
          </select>
        </div>
      </div>

      {/* Info Alert */}
      <StandardAlert
        type="info"
        title="Perícia Digital Profissional"
        message="Sistema completo de análise forense com IA, cadeia de custódia digital, hash criptográfico e relatórios técnicos conforme normas ISO 27037."
      />

      {/* Forensics List */}
      <StandardCard
        title="Perícias Digitais"
        icon={FileSearch}
      >
        {filteredForensics.length === 0 ? (
          <StandardEmptyState
            icon={Microscope}
            title="Nenhuma perícia encontrada"
            description="Inicie uma nova perícia digital forense para começar"
            action={{
              label: 'Nova Perícia',
              icon: Plus,
              onClick: () => setShowModal(true),
              variant: 'primary'
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredForensics.map((forensic, idx) => {
              const TypeIcon = getForensicTypeIcon(forensic.forensicType);
              
              return (
                <div
                  key={idx}
                  className="bg-gray-700/30 border border-gray-600 rounded-lg p-5 hover:bg-gray-700/50 transition-all cursor-pointer"
                  onClick={() => setSelectedForensic(forensic)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-purple-500/20 rounded-lg">
                        <TypeIcon className="h-7 w-7 text-purple-400" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-white">
                            {forensic.caseTitle || 'Perícia Digital'}
                          </h4>
                          {getStatusBadge(forensic.status)}
                          {getUrgencyBadge(forensic.urgency)}
                          {forensic.aiAnalysis && (
                            <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              <Brain className="h-3 w-3 mr-1" />
                              IA
                            </Badge>
                          )}
                          {forensic.legalWarrant && (
                            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                              <Shield className="h-3 w-3 mr-1" />
                              Mandado
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300 mb-3">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-purple-400" />
                            <span>{forensic.caseNumber || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-purple-400" />
                            <span>{forensic.deviceType || 'Dispositivo'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-400" />
                            <span>{forensic.requestDate ? new Date(forensic.requestDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-purple-400" />
                            <span>{forensic.client || 'Cliente'}</span>
                          </div>
                        </div>

                        {forensic.objectives && (
                          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                            {forensic.objectives}
                          </p>
                        )}

                        {/* Technical details */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {forensic.serialNumber && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              <Key className="h-3 w-3 mr-1" />
                              S/N: {forensic.serialNumber}
                            </Badge>
                          )}
                          {forensic.hashAlgorithm && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              <Fingerprint className="h-3 w-3 mr-1" />
                              {forensic.hashAlgorithm}
                            </Badge>
                          )}
                          {forensic.storageCapacity && (
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                              <Database className="h-3 w-3 mr-1" />
                              {forensic.storageCapacity}
                            </Badge>
                          )}
                        </div>
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
              );
            })}
          </div>
        )}
      </StandardCard>

      {/* Modal - Nova Perícia */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-700 my-8">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Microscope className="h-7 w-7 text-purple-400" />
                Nova Perícia Digital Forense
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="h-6 w-6 text-white rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Identificação do Caso */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileSearch className="h-5 w-5 text-purple-400" />
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
                      placeholder="FOR-2024-001"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Perícia *
                    </label>
                    <select
                      value={formData.forensicType}
                      onChange={(e) => setFormData({...formData, forensicType: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      {forensicTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Título da Perícia *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.caseTitle}
                      onChange={(e) => setFormData({...formData, caseTitle: e.target.value})}
                      placeholder="Ex: Análise Forense de Computador - Fraude Empresarial"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cliente/Solicitante
                    </label>
                    <input
                      type="text"
                      value={formData.client}
                      onChange={(e) => setFormData({...formData, client: e.target.value})}
                      placeholder="Nome do cliente"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Data da Solicitação
                    </label>
                    <input
                      type="date"
                      value={formData.requestDate}
                      onChange={(e) => setFormData({...formData, requestDate: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Urgência
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="low">Baixa</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Informações do Dispositivo */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-purple-400" />
                  Informações do Dispositivo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Dispositivo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.deviceType}
                      onChange={(e) => setFormData({...formData, deviceType: e.target.value})}
                      placeholder="Ex: Notebook Dell, iPhone 13, HD Externo"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Modelo
                    </label>
                    <input
                      type="text"
                      value={formData.deviceModel}
                      onChange={(e) => setFormData({...formData, deviceModel: e.target.value})}
                      placeholder="Modelo do dispositivo"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Número de Série
                    </label>
                    <input
                      type="text"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                      placeholder="Serial Number"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sistema Operacional
                    </label>
                    <input
                      type="text"
                      value={formData.operatingSystem}
                      onChange={(e) => setFormData({...formData, operatingSystem: e.target.value})}
                      placeholder="Ex: Windows 11, iOS 17, Android 13"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Capacidade de Armazenamento
                    </label>
                    <input
                      type="text"
                      value={formData.storageCapacity}
                      onChange={(e) => setFormData({...formData, storageCapacity: e.target.value})}
                      placeholder="Ex: 1TB, 512GB, 256GB"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Cadeia de Custódia */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  Cadeia de Custódia e Segurança
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Algoritmo de Hash
                    </label>
                    <select
                      value={formData.hashAlgorithm}
                      onChange={(e) => setFormData({...formData, hashAlgorithm: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      {hashAlgorithms.map(algo => (
                        <option key={algo} value={algo}>{algo}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Responsável pela Custódia
                    </label>
                    <input
                      type="text"
                      value={formData.chainCustody}
                      onChange={(e) => setFormData({...formData, chainCustody: e.target.value})}
                      placeholder="Nome do responsável"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3 cursor-pointer bg-green-600/20 p-4 rounded-lg border border-green-500/30">
                      <input
                        type="checkbox"
                        checked={formData.legalWarrant}
                        onChange={(e) => setFormData({...formData, legalWarrant: e.target.checked})}
                        className="w-5 h-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-green-400" />
                          <span className="text-white font-semibold">Mandado Judicial Apresentado</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Perícia autorizada por ordem judicial
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Objetivos */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  Objetivos da Perícia
                </h3>
                <textarea
                  value={formData.objectives}
                  onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                  placeholder="Descreva os objetivos e o que se espera encontrar na perícia..."
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
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
                      Análise automática de evidências, detecção de padrões e geração de insights forenses
                    </p>
                  </div>
                </label>
              </div>

              {/* Upload de Evidências */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-purple-400" />
                  Evidências Digitais Iniciais
                </h3>
                <input
                  type="file"
                  multiple
                  accept="*/*"
                  onChange={(e) => setFormData({...formData, evidenceFiles: Array.from(e.target.files)})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Todos os formatos aceitos (Múltiplos arquivos - Imagens, Vídeos, Documentos, Logs)
                </p>
              </div>

              {/* Notas */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Notas e Observações</h3>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Observações adicionais, particularidades do caso, informações relevantes..."
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
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
                      <Microscope className="h-5 w-5" />
                      <span>Iniciar Perícia</span>
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

export default DigitalForensicsComplete;
