import React, { useState, useEffect } from 'react';
import { Database, Plus, Search, Download, AlertCircle, CheckCircle, Clock, FileText, Shield, Cpu, Hash, Activity, HardDrive, Smartphone, Laptop, Cloud, Zap, Lock, Bug, Eye, Layers, ChevronRight } from 'lucide-react';
import StandardModuleLayout from '../../components/StandardModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const UltraExtractionPro = () => {
  const [extractions, setExtractions] = useState([]);
  const [stats, setStats] = useState({});
  const [methods, setMethods] = useState([]);
  const [devices, setDevices] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExtraction, setSelectedExtraction] = useState(null);
  const [activeTab, setActiveTab] = useState('extractions'); // extractions, methods, devices, categories
  const [formData, setFormData] = useState({
    caso_id: '',
    dispositivo_tipo: 'smartphone',
    dispositivo_marca: '',
    dispositivo_modelo: '',
    sistema_operacional: '',
    imei: '',
    numero_serie: '',
    metodo_extracao: 'physical',
    nivel_extracao: 'completo',
    prioridade: 'media',
    enable_ai_analysis: true,
    enable_deleted_recovery: true,
    enable_encrypted_analysis: true,
    enable_malware_scan: true,
    enable_timeline_reconstruction: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, extractionsRes, methodsRes, devicesRes, categoriesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/ultra-extraction-pro/stats`, { headers }),
        fetch(`${BACKEND_URL}/api/ultra-extraction-pro/extractions`, { headers }),
        fetch(`${BACKEND_URL}/api/ultra-extraction-pro/extraction-methods`, { headers }),
        fetch(`${BACKEND_URL}/api/ultra-extraction-pro/supported-devices`, { headers }),
        fetch(`${BACKEND_URL}/api/ultra-extraction-pro/data-categories`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (extractionsRes.ok) {
        const data = await extractionsRes.json();
        setExtractions(data.extractions || []);
      }
      if (methodsRes.ok) {
        const data = await methodsRes.json();
        setMethods(data.methods || []);
      }
      if (devicesRes.ok) {
        const data = await devicesRes.json();
        setDevices(data.devices || {});
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/ultra-extraction-pro/extractions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("🚀 Extração Ultra Avançada iniciada com IA!");
        setShowModal(false);
        fetchData();
        setFormData({
          caso_id: '',
          dispositivo_tipo: 'smartphone',
          dispositivo_marca: '',
          dispositivo_modelo: '',
          sistema_operacional: '',
          imei: '',
          numero_serie: '',
          metodo_extracao: 'physical',
          nivel_extracao: 'completo',
          prioridade: 'media',
          enable_ai_analysis: true,
          enable_deleted_recovery: true,
          enable_encrypted_analysis: true,
          enable_malware_scan: true,
          enable_timeline_reconstruction: true
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.success("Erro ao iniciar extração");
    }
  };

  const simulateProgress = async (extractionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/ultra-extraction-pro/extractions/${extractionId}/simulate-progress`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Progresso simulado!");
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateReport = async (extractionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/ultra-extraction-pro/extractions/${extractionId}/generate-report`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("📄 Relatório Ultra Completo gerado com sucesso!");
        console.log('Report:', data.report);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const viewDetails = async (extractionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/ultra-extraction-pro/extractions/${extractionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedExtraction(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'extracting': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'extracting': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'physical': return <HardDrive className="w-5 h-5" />;
      case 'logical': return <Database className="w-5 h-5" />;
      case 'filesystem': return <Layers className="w-5 h-5" />;
      case 'chip-off': return <Cpu className="w-5 h-5" />;
      case 'jtag': return <Zap className="w-5 h-5" />;
      case 'isp': return <Activity className="w-5 h-5" />;
      case 'cloud': return <Cloud className="w-5 h-5" />;
      default: return <Database className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <StandardModuleLayout title="Ultra Extraction Pro" icon={Database}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </StandardModuleLayout>
    );
  }

  return (
    <StandardModuleLayout 
      title="Ultra Extraction Pro" 
      icon={Database}
      subtitle="Extração de Dados Revolucionária • Superior ao Cellebrite, Oxygen e Avila"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nova Extração Ultra</span>
        </button>
      }
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Database className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">TOTAL</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.total_extractions || 0}</div>
          <div className="text-sm opacity-90">Total de Extrações</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">SUCESSO</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.concluidas || 0}</div>
          <div className="text-sm opacity-90">Concluídas com Sucesso</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">ATIVO</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.em_andamento || 0}</div>
          <div className="text-sm opacity-90">Em Andamento</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <HardDrive className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">DADOS</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.total_data_extracted_gb || 0} GB</div>
          <div className="text-sm opacity-90">Dados Extraídos</div>
        </div>
      </div>

      {/* AI-Powered Features Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl p-6 mb-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-lg p-3">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">🚀 Powered by AI - Análise Revolucionária</h3>
              <p className="text-sm opacity-90">
                IA Multi-Modelo • Recuperação Avançada de Deletados • Análise de Criptografia • Detecção de Malware • Timeline Reconstruction
              </p>
            </div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-2xl font-bold">{stats.ai_powered_analyses || 0}</div>
            <div className="text-xs">Análises IA</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        {[
          { id: 'extractions', label: 'Extrações', icon: Database },
          { id: 'methods', label: 'Métodos', icon: Layers },
          { id: 'devices', label: 'Dispositivos', icon: Smartphone },
          { id: 'categories', label: 'Categorias de Dados', icon: FileText }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-cyan-500 text-cyan-600 bg-cyan-50'
                : 'border-transparent text-gray-600 hover:text-cyan-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-semibold">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Extractions Tab */}
      {activeTab === 'extractions' && (
        <div className="space-y-4">
          {extractions.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nenhuma extração ainda</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Criar Primeira Extração Ultra
              </button>
            </div>
          ) : (
            extractions.map((extraction) => (
              <div key={extraction.extraction_id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-cyan-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg p-3 text-white">
                      {getMethodIcon(extraction.metodo_extracao)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {extraction.dispositivo_marca} {extraction.dispositivo_modelo}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center space-x-1">
                          <Smartphone className="w-4 h-4" />
                          <span>{extraction.dispositivo_tipo}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Layers className="w-4 h-4" />
                          <span>{extraction.metodo_extracao}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(extraction.created_at).toLocaleDateString('pt-BR')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(extraction.status)}`}>
                      {getStatusIcon(extraction.status)}
                      <span>{extraction.status === 'extracting' ? 'Extraindo' : extraction.status === 'completed' ? 'Concluído' : 'Falhou'}</span>
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {extraction.progresso !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Progresso</span>
                      <span className="text-sm font-bold text-cyan-600">{extraction.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${extraction.progresso}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* AI Features Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {extraction.ai_analysis_enabled && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                      <Cpu className="w-3 h-3" />
                      <span>IA Analysis</span>
                    </span>
                  )}
                  {extraction.deleted_recovery_enabled && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                      <Database className="w-3 h-3" />
                      <span>Recuperação Deletados</span>
                    </span>
                  )}
                  {extraction.encrypted_analysis_enabled && (
                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Análise Criptografia</span>
                    </span>
                  )}
                  {extraction.malware_scan_enabled && (
                    <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                      <Bug className="w-3 h-3" />
                      <span>Scan Malware</span>
                    </span>
                  )}
                  {extraction.timeline_reconstruction_enabled && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>Timeline</span>
                    </span>
                  )}
                </div>

                {/* Data Extracted Summary */}
                {extraction.dados_extraidos && extraction.dados_extraidos_total && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Contatos</div>
                        <div className="text-lg font-bold text-cyan-600">{extraction.dados_extraidos.contatos || 0}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Mensagens</div>
                        <div className="text-lg font-bold text-blue-600">
                          {(extraction.dados_extraidos.mensagens_whatsapp || 0) + (extraction.dados_extraidos.mensagens_sms || 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Fotos</div>
                        <div className="text-lg font-bold text-green-600">{extraction.dados_extraidos.fotos || 0}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Total (GB)</div>
                        <div className="text-lg font-bold text-purple-600">{extraction.dados_extraidos_total.tamanho_total_gb || 0}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => viewDetails(extraction.extraction_id)}
                    className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-lg hover:bg-cyan-200 transition-colors flex items-center space-x-2 text-sm font-semibold"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Detalhes</span>
                  </button>
                  <button
                    onClick={() => simulateProgress(extraction.extraction_id)}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 text-sm font-semibold"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Simular Progresso</span>
                  </button>
                  <button
                    onClick={() => generateReport(extraction.extraction_id)}
                    className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2 text-sm font-semibold"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Gerar Relatório</span>
                  </button>
                  <button
                    onClick={() => toast.success("Função de download em desenvolvimento");}
                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-2 text-sm font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Dados</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Methods Tab */}
      {activeTab === 'methods' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method) => (
            <div key={method.method} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-t-4 border-cyan-500">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg p-3 text-white">
                  {getMethodIcon(method.method)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{method.name}</h3>
                  <span className="text-xs text-gray-500">{method.method}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{method.description}</p>
              
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">✅ Vantagens:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {method.advantages.slice(0, 3).map((adv, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <ChevronRight className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-600">Duração</div>
                      <div className="font-semibold text-cyan-600">{method.duration}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Taxa Recuperação</div>
                      <div className="font-semibold text-green-600">{method.data_recovery}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          {Object.entries(devices).map(([category, categoryDevices]) => (
            <div key={category} className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-cyan-500" />
                <span>{category.replace('_', ' ')}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(categoryDevices).map(([subcategory, items]) => (
                  <div key={subcategory} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-700 mb-3 capitalize">{subcategory.replace('_', ' ')}</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {items.slice(0, 5).map((device, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <ChevronRight className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                          <span>{device.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.category} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-3 text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-800">{cat.name}</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {cat.subcategories.slice(0, 8).map((sub, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>{sub}</span>
                  </li>
                ))}
                {cat.subcategories.length > 8 && (
                  <li className="text-xs text-gray-500 italic">+{cat.subcategories.length - 8} mais...</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Create Extraction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center space-x-3">
                <Database className="w-8 h-8" />
                <span>Nova Extração Ultra Avançada</span>
              </h2>
              <p className="text-sm opacity-90 mt-2">Sistema revolucionário com IA, superior ao Cellebrite, Oxygen e Avila</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Device Information */}
              <div className="border-l-4 border-cyan-500 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-cyan-500" />
                  <span>Informações do Dispositivo</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ID do Caso *</label>
                    <input
                      type="text"
                      required
                      value={formData.caso_id}
                      onChange={(e) => setFormData({...formData, caso_id: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ex: CASO-2024-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Dispositivo *</label>
                    <select
                      value={formData.dispositivo_tipo}
                      onChange={(e) => setFormData({...formData, dispositivo_tipo: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="smartphone">Smartphone</option>
                      <option value="tablet">Tablet</option>
                      <option value="computer">Computador</option>
                      <option value="storage">Armazenamento</option>
                      <option value="iot">IoT Device</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Marca *</label>
                    <input
                      type="text"
                      required
                      value={formData.dispositivo_marca}
                      onChange={(e) => setFormData({...formData, dispositivo_marca: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ex: Samsung, Apple, Xiaomi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo *</label>
                    <input
                      type="text"
                      required
                      value={formData.dispositivo_modelo}
                      onChange={(e) => setFormData({...formData, dispositivo_modelo: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ex: Galaxy S24, iPhone 15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sistema Operacional *</label>
                    <input
                      type="text"
                      required
                      value={formData.sistema_operacional}
                      onChange={(e) => setFormData({...formData, sistema_operacional: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ex: Android 14, iOS 17"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">IMEI</label>
                    <input
                      type="text"
                      value={formData.imei}
                      onChange={(e) => setFormData({...formData, imei: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="15 dígitos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Série</label>
                    <input
                      type="text"
                      value={formData.numero_serie}
                      onChange={(e) => setFormData({...formData, numero_serie: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ex: ABC123XYZ456"
                    />
                  </div>
                </div>
              </div>

              {/* Extraction Configuration */}
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-blue-500" />
                  <span>Configuração da Extração</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Método de Extração *</label>
                    <select
                      value={formData.metodo_extracao}
                      onChange={(e) => setFormData({...formData, metodo_extracao: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="physical">Physical (Completo)</option>
                      <option value="logical">Logical (Rápido)</option>
                      <option value="filesystem">Filesystem</option>
                      <option value="chip-off">Chip-Off</option>
                      <option value="jtag">JTAG</option>
                      <option value="isp">ISP</option>
                      <option value="cloud">Cloud</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nível *</label>
                    <select
                      value={formData.nivel_extracao}
                      onChange={(e) => setFormData({...formData, nivel_extracao: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="completo">Completo</option>
                      <option value="seletivo">Seletivo</option>
                      <option value="rapido">Rápido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prioridade *</label>
                    <select
                      value={formData.prioridade}
                      onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* AI Features */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-purple-500" />
                  <span>Recursos Ultra Avançados com IA</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'enable_ai_analysis', label: 'Análise com IA (Multi-Modelo)', icon: Cpu, color: 'purple' },
                    { key: 'enable_deleted_recovery', label: 'Recuperação Avançada de Deletados', icon: Database, color: 'blue' },
                    { key: 'enable_encrypted_analysis', label: 'Análise de Arquivos Criptografados', icon: Lock, color: 'green' },
                    { key: 'enable_malware_scan', label: 'Scan de Malware e Ameaças', icon: Bug, color: 'red' },
                    { key: 'enable_timeline_reconstruction', label: 'Reconstrução de Timeline', icon: Activity, color: 'yellow' }
                  ].map((feature) => (
                    <label key={feature.key} className={`flex items-center space-x-3 p-4 bg-${feature.color}-50 rounded-lg cursor-pointer hover:bg-${feature.color}-100 transition-colors border border-${feature.color}-200`}>
                      <input
                        type="checkbox"
                        checked={formData[feature.key]}
                        onChange={(e) => setFormData({...formData, [feature.key]: e.target.checked})}
                        className="w-5 h-5 text-cyan-600"
                      />
                      <feature.icon className={`w-5 h-5 text-${feature.color}-600`} />
                      <span className="font-semibold text-gray-800">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold shadow-lg flex items-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Iniciar Extração Ultra</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedExtraction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Detalhes da Extração</h2>
              <p className="text-sm opacity-90 mt-1">ID: {selectedExtraction.extraction_id}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Device Info */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Informações do Dispositivo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Marca/Modelo</div>
                    <div className="font-semibold">{selectedExtraction.dispositivo_marca} {selectedExtraction.dispositivo_modelo}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">SO</div>
                    <div className="font-semibold">{selectedExtraction.sistema_operacional}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">IMEI</div>
                    <div className="font-semibold">{selectedExtraction.imei || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Método</div>
                    <div className="font-semibold">{selectedExtraction.metodo_extracao}</div>
                  </div>
                </div>
              </div>

              {/* Extracted Data */}
              {selectedExtraction.dados_extraidos && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Dados Extraídos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {Object.entries(selectedExtraction.dados_extraidos).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</div>
                        <div className="text-lg font-bold text-cyan-600">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedExtraction(null)}
                className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </StandardModuleLayout>
  );
};

export default UltraExtractionPro;
