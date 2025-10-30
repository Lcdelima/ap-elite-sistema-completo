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
  FileSearch, Database, Lock, AlertCircle, CheckCircle, Clock,
  Eye, Trash2, Plus, Brain, Sparkles, Hash, Target, Server,
  Cpu, Activity, Zap, Code, File, Image as ImageIcon, Video,
  Smartphone, Wifi, Cloud, Key, Search, Filter, Calendar,
  User, Building, MapPin, TrendingUp, BarChart3, PieChart,
  Settings, Terminal, Folder, FileText, Globe, Share2, Link
} from 'lucide-react';
import { toast } from 'sonner';

const ForensicsEnhanced = () => {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedExam, setSelectedExam] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [formData, setFormData] = useState({
    examId: '',
    examTitle: '',
    examType: 'disk_imaging',
    evidenceType: 'computer',
    deviceBrand: '',
    deviceModel: '',
    serialNumber: '',
    operatingSystem: '',
    storageSize: '',
    caseName: '',
    caseNumber: '',
    requestor: '',
    laboratory: '',
    examDate: '',
    priority: 'medium',
    objectives: '',
    methodology: 'write_blocker',
    hashAlgorithm: 'SHA-256',
    imagingTool: 'FTK_Imager',
    aiEnabled: true,
    mlAnalysis: true,
    autoReport: true,
    evidenceFiles: [],
    notes: ''
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem('token'); // Corrigido de 'ap_elite_token' para 'token'

  useEffect(() => {
    fetchExaminations();
  }, []);

  const fetchExaminations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/forensics/enhanced`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setExaminations(res.data.examinations || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao carregar exames forenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.examId || !formData.examTitle || !formData.evidenceType) {
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
        `${backendUrl}/api/forensics/enhanced`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Exame forense iniciado com sucesso!');
      setShowModal(false);
      fetchExaminations();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar exame forense');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      examId: '',
      examTitle: '',
      examType: 'disk_imaging',
      evidenceType: 'computer',
      deviceBrand: '',
      deviceModel: '',
      serialNumber: '',
      operatingSystem: '',
      storageSize: '',
      caseName: '',
      caseNumber: '',
      requestor: '',
      laboratory: '',
      examDate: '',
      priority: 'medium',
      objectives: '',
      methodology: 'write_blocker',
      hashAlgorithm: 'SHA-256',
      imagingTool: 'FTK_Imager',
      aiEnabled: true,
      mlAnalysis: true,
      autoReport: true,
      evidenceFiles: [],
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      imaging: { color: 'bg-blue-500', text: 'Imageando', icon: HardDrive },
      analyzing: { color: 'bg-yellow-500', text: 'Analisando', icon: Brain },
      processing: { color: 'bg-purple-500', text: 'Processando', icon: Cpu },
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

  const getPriorityBadge = (priority) => {
    const config = {
      critical: { color: 'bg-red-600', text: 'Crítica' },
      high: { color: 'bg-orange-500', text: 'Alta' },
      medium: { color: 'bg-blue-500', text: 'Média' },
      low: { color: 'bg-green-500', text: 'Baixa' }
    };
    
    const { color, text } = config[priority] || config.medium;
    return <Badge className={`${color} text-white`}>{text}</Badge>;
  };

  const getExamTypeIcon = (type) => {
    const icons = {
      disk_imaging: HardDrive,
      memory_analysis: Database,
      mobile_extraction: Smartphone,
      network_forensics: Wifi,
      malware_analysis: Shield,
      cloud_forensics: Cloud,
      live_analysis: Activity
    };
    return icons[type] || Microscope;
  };

  const getStats = () => {
    return {
      total: examinations.length,
      active: examinations.filter(e => ['imaging', 'analyzing', 'processing'].includes(e.status)).length,
      completed: examinations.filter(e => e.status === 'completed').length,
      critical: examinations.filter(e => e.priority === 'critical').length
    };
  };

  const stats = getStats();

  const filteredExaminations = examinations.filter(exam => {
    const matchesSearch = 
      exam.examId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.examTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || exam.examType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const examTypes = [
    { value: 'disk_imaging', label: 'Clonagem de Disco', icon: HardDrive },
    { value: 'memory_analysis', label: 'Análise de Memória RAM', icon: Database },
    { value: 'mobile_extraction', label: 'Extração Mobile', icon: Smartphone },
    { value: 'network_forensics', label: 'Forense de Rede', icon: Wifi },
    { value: 'malware_analysis', label: 'Análise de Malware', icon: Shield },
    { value: 'cloud_forensics', label: 'Forense em Nuvem', icon: Cloud },
    { value: 'live_analysis', label: 'Análise ao Vivo', icon: Activity }
  ];

  const methodologies = [
    'Write Blocker Físico',
    'Write Blocker Software',
    'Live Forensics',
    'Network Capture',
    'Memory Dump',
    'Logical Extraction',
    'Physical Extraction'
  ];

  const imagingTools = [
    'FTK Imager',
    'EnCase',
    'X-Ways Forensics',
    'Autopsy',
    'Cellebrite',
    'Magnet AXIOM',
    'Belkasoft Evidence Center'
  ];

  const headerActions = [
    {
      label: 'Novo Exame',
      icon: Plus,
      onClick: () => setShowModal(true),
      variant: 'primary'
    }
  ];

  return (
    <StandardModuleLayout
      title="Perícia Digital Enhanced"
      subtitle="Sistema avançado de análise forense com imageamento, ML, IA e geração automática de relatórios"
      icon={Microscope}
      color="indigo"
      category="Forense"
      actions={headerActions}
      loading={loading}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total de Exames</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <Microscope className="h-10 w-10 text-indigo-400" />
          </div>
        </StandardCard>

        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Em Andamento</p>
              <p className="text-3xl font-bold text-white">{stats.active}</p>
            </div>
            <Activity className="h-10 w-10 text-blue-400 animate-pulse" />
          </div>
        </StandardCard>

        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Concluídos</p>
              <p className="text-3xl font-bold text-white">{stats.completed}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </StandardCard>

        <StandardCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Prioridade Crítica</p>
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
          placeholder="Buscar por ID, título ou número do caso..."
        />
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="all">Todos os Tipos</option>
            {examTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Banner */}
      <StandardAlert
        type="info"
        title="Perícia Digital Enhanced - ISO 27037 & NIST"
        message="Análise forense avançada com Machine Learning, clonagem bit-a-bit, análise de memória RAM, extração mobile e relatórios automáticos conformes às normas internacionais."
      />

      {/* Examinations List */}
      <StandardCard
        title="Exames Forenses Enhanced"
        icon={FileSearch}
      >
        {filteredExaminations.length === 0 ? (
          <StandardEmptyState
            icon={Microscope}
            title="Nenhum exame forense encontrado"
            description="Inicie um novo exame forense enhanced para começar"
            action={{
              label: 'Novo Exame',
              icon: Plus,
              onClick: () => setShowModal(true),
              variant: 'primary'
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredExaminations.map((exam, idx) => {
              const TypeIcon = getExamTypeIcon(exam.examType);
              
              return (
                <div
                  key={idx}
                  className="bg-gray-700/30 border border-gray-600 rounded-lg p-5 hover:bg-gray-700/50 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedExam(exam);
                    setShowDetailsModal(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-indigo-500/20 rounded-lg">
                        <TypeIcon className="h-7 w-7 text-indigo-400" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-white">
                            {exam.examTitle || 'Exame Forense'}
                          </h4>
                          {getStatusBadge(exam.status)}
                          {getPriorityBadge(exam.priority)}
                          {exam.aiEnabled && (
                            <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              <Brain className="h-3 w-3 mr-1" />
                              IA
                            </Badge>
                          )}
                          {exam.mlAnalysis && (
                            <Badge className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              <Sparkles className="h-3 w-3 mr-1" />
                              ML
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300 mb-3">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-indigo-400" />
                            <span>{exam.examId || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-400" />
                            <span>{exam.caseNumber || 'Caso'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-400" />
                            <span>{exam.examDate ? new Date(exam.examDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-indigo-400" />
                            <span>{exam.requestor || 'Solicitante'}</span>
                          </div>
                        </div>

                        {exam.objectives && (
                          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                            {exam.objectives}
                          </p>
                        )}

                        {/* Technical details */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {exam.serialNumber && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              <Key className="h-3 w-3 mr-1" />
                              S/N: {exam.serialNumber}
                            </Badge>
                          )}
                          {exam.hashAlgorithm && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              <Fingerprint className="h-3 w-3 mr-1" />
                              {exam.hashAlgorithm}
                            </Badge>
                          )}
                          {exam.imagingTool && (
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                              <Settings className="h-3 w-3 mr-1" />
                              {exam.imagingTool}
                            </Badge>
                          )}
                          {exam.storageSize && (
                            <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                              <Database className="h-3 w-3 mr-1" />
                              {exam.storageSize}
                            </Badge>
                          )}
                        </div>

                        {/* Progress bar */}
                        {exam.progress !== undefined && exam.status !== 'completed' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-400">Progresso</span>
                              <span className="text-xs text-indigo-400 font-semibold">{exam.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${exam.progress}%` }}
                              />
                            </div>
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
              );
            })}
          </div>
        )}
      </StandardCard>

      {/* Modal - Novo Exame */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-700 my-8">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Microscope className="h-7 w-7 text-indigo-400" />
                Novo Exame Forense Enhanced
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
                  <FileSearch className="h-5 w-5 text-indigo-400" />
                  Identificação do Exame
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ID do Exame *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.examId}
                      onChange={(e) => setFormData({...formData, examId: e.target.value})}
                      placeholder="EXM-2024-001"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Exame *
                    </label>
                    <select
                      value={formData.examType}
                      onChange={(e) => setFormData({...formData, examType: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      {examTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Título do Exame *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.examTitle}
                      onChange={(e) => setFormData({...formData, examTitle: e.target.value})}
                      placeholder="Ex: Clonagem Forense - HD Notebook Dell"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Número do Caso
                    </label>
                    <input
                      type="text"
                      value={formData.caseNumber}
                      onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
                      placeholder="CASO-2024-123"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome do Caso
                    </label>
                    <input
                      type="text"
                      value={formData.caseName}
                      onChange={(e) => setFormData({...formData, caseName: e.target.value})}
                      placeholder="Nome descritivo"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Solicitante
                    </label>
                    <input
                      type="text"
                      value={formData.requestor}
                      onChange={(e) => setFormData({...formData, requestor: e.target.value})}
                      placeholder="Nome do solicitante"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Laboratório
                    </label>
                    <input
                      type="text"
                      value={formData.laboratory}
                      onChange={(e) => setFormData({...formData, laboratory: e.target.value})}
                      placeholder="Local do exame"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Data do Exame
                    </label>
                    <input
                      type="date"
                      value={formData.examDate}
                      onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prioridade
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Evidência */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-indigo-400" />
                  Detalhes da Evidência
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Evidência *
                    </label>
                    <select
                      value={formData.evidenceType}
                      onChange={(e) => setFormData({...formData, evidenceType: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="computer">Computador/Notebook</option>
                      <option value="mobile">Smartphone/Tablet</option>
                      <option value="storage">HD/SSD/Pen Drive</option>
                      <option value="memory">Memória RAM</option>
                      <option value="network">Captura de Rede</option>
                      <option value="cloud">Dados em Nuvem</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={formData.deviceBrand}
                      onChange={(e) => setFormData({...formData, deviceBrand: e.target.value})}
                      placeholder="Ex: Dell, Apple, Samsung"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
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
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
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
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
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
                      placeholder="Ex: Windows 11, macOS, Linux"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tamanho do Armazenamento
                    </label>
                    <input
                      type="text"
                      value={formData.storageSize}
                      onChange={(e) => setFormData({...formData, storageSize: e.target.value})}
                      placeholder="Ex: 1TB, 512GB"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Metodologia */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-indigo-400" />
                  Metodologia e Ferramentas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Metodologia
                    </label>
                    <select
                      value={formData.methodology}
                      onChange={(e) => setFormData({...formData, methodology: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      {methodologies.map((method, idx) => (
                        <option key={idx} value={method.toLowerCase().replace(/\s/g, '_')}>{method}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Algoritmo de Hash
                    </label>
                    <select
                      value={formData.hashAlgorithm}
                      onChange={(e) => setFormData({...formData, hashAlgorithm: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="MD5">MD5</option>
                      <option value="SHA-1">SHA-1</option>
                      <option value="SHA-256">SHA-256</option>
                      <option value="SHA-512">SHA-512</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ferramenta de Imageamento
                    </label>
                    <select
                      value={formData.imagingTool}
                      onChange={(e) => setFormData({...formData, imagingTool: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      {imagingTools.map((tool, idx) => (
                        <option key={idx} value={tool.replace(/\s/g, '_')}>{tool}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Objetivos */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-400" />
                  Objetivos do Exame
                </h3>
                <textarea
                  value={formData.objectives}
                  onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                  placeholder="Descreva os objetivos específicos do exame forense..."
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Advanced Features */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  Recursos Avançados
                </h3>
                
                <label className="flex items-center space-x-3 cursor-pointer bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-4 rounded-lg border border-indigo-500/30">
                  <input
                    type="checkbox"
                    checked={formData.aiEnabled}
                    onChange={(e) => setFormData({...formData, aiEnabled: e.target.checked})}
                    className="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-indigo-400" />
                      <span className="text-white font-semibold">Análise com Inteligência Artificial</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      IA para análise automática de evidências e geração de insights
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 rounded-lg border border-purple-500/30">
                  <input
                    type="checkbox"
                    checked={formData.mlAnalysis}
                    onChange={(e) => setFormData({...formData, mlAnalysis: e.target.checked})}
                    className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      <span className="text-white font-semibold">Machine Learning Avançado</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Detecção de padrões, anomalias e comportamentos suspeitos
                    </p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-4 rounded-lg border border-cyan-500/30">
                  <input
                    type="checkbox"
                    checked={formData.autoReport}
                    onChange={(e) => setFormData({...formData, autoReport: e.target.checked})}
                    className="w-5 h-5 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-cyan-400" />
                      <span className="text-white font-semibold">Relatório Automático</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Geração automática de relatório técnico ao concluir o exame
                    </p>
                  </div>
                </label>
              </div>

              {/* Upload */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-indigo-400" />
                  Arquivos de Evidência
                </h3>
                <input
                  type="file"
                  multiple
                  accept="*/*"
                  onChange={(e) => setFormData({...formData, evidenceFiles: Array.from(e.target.files)})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Todos os formatos (Múltiplos arquivos - Imagens, Logs, Capturas, etc.)
                </p>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Notas Adicionais</h3>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Observações técnicas, particularidades do exame..."
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
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
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Clock className="h-5 w-5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <Microscope className="h-5 w-5" />
                      <span>Iniciar Exame</span>
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

export default ForensicsEnhanced;
