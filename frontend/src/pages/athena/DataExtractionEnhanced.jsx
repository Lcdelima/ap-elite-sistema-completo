import React, { useState, useEffect } from 'react';
import { HardDrive, Plus, Search, Download, AlertCircle, CheckCircle, Clock, Cpu, Smartphone, Server, FileText } from 'lucide-react';
import StandardModuleLayout from '../../components/StandardModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const DataExtractionEnhanced = () => {
  const [extractions, setExtractions] = useState([]);
  const [stats, setStats] = useState({});
  const [tools, setTools] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    device_type: 'smartphone',
    device_model: '',
    device_brand: '',
    imei: '',
    serial_number: '',
    case_id: '',
    extraction_tool: 'Cellebrite UFED',
    extraction_method: 'logical',
    notes: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch stats
      const statsRes = await fetch(`${BACKEND_URL}/api/data-extraction/stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch extractions
      const extractionsRes = await fetch(`${BACKEND_URL}/api/data-extraction/extractions`, { headers });
      if (extractionsRes.ok) {
        const extractionsData = await extractionsRes.json();
        setExtractions(extractionsData.extractions || []);
      }

      // Fetch tools
      const toolsRes = await fetch(`${BACKEND_URL}/api/data-extraction/tools`, { headers });
      if (toolsRes.ok) {
        const toolsData = await toolsRes.json();
        setTools(toolsData.tools || []);
      }

      // Fetch device types
      const devicesRes = await fetch(`${BACKEND_URL}/api/data-extraction/device-types`, { headers });
      if (devicesRes.ok) {
        const devicesData = await devicesRes.json();
        setDeviceTypes(devicesData.device_types || []);
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
      const response = await fetch(`${BACKEND_URL}/api/data-extraction/extractions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Extração criada com sucesso!");
        setShowModal(false);
        setFormData({
          device_type: 'smartphone',
          device_model: '',
          device_brand: '',
          imei: '',
          serial_number: '',
          case_id: '',
          extraction_tool: 'Cellebrite UFED',
          extraction_method: 'logical',
          notes: '',
          priority: 'medium'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.success("Erro ao criar extração");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pendente',
      'in_progress': 'Em Progresso',
      'completed': 'Concluída',
      'failed': 'Falhou'
    };
    return statusMap[status] || status;
  };

  return (
    <StandardModuleLayout
      title="Extração de Dados"
      subtitle="Extração forense profissional de dispositivos digitais"
      icon={HardDrive}
      category="Perícia e Investigação"
      categoryColor="bg-purple-500"
      primaryAction={{
        label: 'Nova Extração',
        icon: Plus,
        onClick: () => setShowModal(true)
      }}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
            <HardDrive className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Extrações registradas</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Em Progresso</p>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.in_progress || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Extrações ativas</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Concluídas</p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.completed || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Extrações finalizadas</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Falhas</p>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.failed || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Extrações com erro</p>
        </div>
      </div>

      {/* Extractions List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Extrações em Andamento</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
              <Search className="w-4 h-4 inline mr-2" />
              Filtrar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Carregando extrações...</p>
          </div>
        ) : extractions.length === 0 ? (
          <div className="text-center py-12">
            <HardDrive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhuma extração cadastrada</p>
            <p className="text-sm text-gray-500 mt-2">Crie uma nova extração para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {extractions.map((extraction) => (
              <div key={extraction.extraction_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(extraction.status)}
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {extraction.device_brand} {extraction.device_model}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                        {extraction.device_type}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <div>
                        <span className="font-medium">Ferramenta:</span> {extraction.extraction_tool}
                      </div>
                      <div>
                        <span className="font-medium">Método:</span> {extraction.extraction_method}
                      </div>
                      <div>
                        <span className="font-medium">Caso:</span> {extraction.case_id}
                      </div>
                      <div>
                        <span className="font-medium">Prioridade:</span> 
                        <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                          extraction.priority === 'high' || extraction.priority === 'critical' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {extraction.priority}
                        </span>
                      </div>
                    </div>
                    {extraction.imei && (
                      <p className="text-sm text-gray-500 mt-2">IMEI: {extraction.imei}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    extraction.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    extraction.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    extraction.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {getStatusText(extraction.status)}
                  </span>
                </div>
                {extraction.progress !== undefined && extraction.status === 'in_progress' && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${extraction.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Nova Extração de Dados</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tipo de Dispositivo*</label>
                  <select
                    value={formData.device_type}
                    onChange={(e) => setFormData({...formData, device_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    required
                  >
                    {deviceTypes.map(type => (
                      <option key={type.type} value={type.type}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Ferramenta de Extração*</label>
                  <select
                    value={formData.extraction_tool}
                    onChange={(e) => setFormData({...formData, extraction_tool: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    required
                  >
                    {tools.filter(t => t.type === 'mobile' || t.type === 'multi').map(tool => (
                      <option key={tool.name} value={tool.name}>{tool.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Marca do Dispositivo*</label>
                  <input
                    type="text"
                    required
                    value={formData.device_brand}
                    onChange={(e) => setFormData({...formData, device_brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Ex: Samsung, Apple, Motorola"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Modelo do Dispositivo*</label>
                  <input
                    type="text"
                    required
                    value={formData.device_model}
                    onChange={(e) => setFormData({...formData, device_model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Ex: Galaxy S21, iPhone 13 Pro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">IMEI/Serial</label>
                  <input
                    type="text"
                    value={formData.imei}
                    onChange={(e) => setFormData({...formData, imei: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Número IMEI ou Serial"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Número de Série</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Número de série do dispositivo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ID do Caso*</label>
                  <input
                    type="text"
                    required
                    value={formData.case_id}
                    onChange={(e) => setFormData({...formData, case_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="Ex: CASO-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Método de Extração*</label>
                  <select
                    value={formData.extraction_method}
                    onChange={(e) => setFormData({...formData, extraction_method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="physical">Física</option>
                    <option value="logical">Lógica</option>
                    <option value="filesystem">Sistema de Arquivos</option>
                    <option value="cloud">Nuvem</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Prioridade</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Informações adicionais sobre a extração"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 font-medium text-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-lg"
                >
                  Criar Extração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StandardModuleLayout>
  );
};

export default DataExtractionEnhanced;
