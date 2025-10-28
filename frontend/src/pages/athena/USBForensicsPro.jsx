import React, { useState, useEffect } from 'react';
import { Usb, Plus, Search, AlertCircle, CheckCircle, Shield, Activity, Clock, TrendingUp, Bug } from 'lucide-react';
import StandardModuleLayout from '../../components/StandardModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const USBForensicsPro = () => {
  const [analyses, setAnalyses] = useState([]);
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('analyses');
  const [formData, setFormData] = useState({
    caso_id: '',
    computer_name: '',
    tipo_analise: 'history',
    profundidade: 'completa'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, analysesRes, devicesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/usb-forensics-pro/stats`, { headers }),
        fetch(`${BACKEND_URL}/api/usb-forensics-pro/analyses`, { headers }),
        fetch(`${BACKEND_URL}/api/usb-forensics-pro/devices`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (analysesRes.ok) {
        const data = await analysesRes.json();
        setAnalyses(data.analyses || []);
      }
      if (devicesRes.ok) {
        const data = await devicesRes.json();
        setDevices(data.devices || []);
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
      const response = await fetch(`${BACKEND_URL}/api/usb-forensics-pro/analyses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("🔍 Análise USB iniciada!");
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.success("Erro ao iniciar análise");
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <StandardModuleLayout title="USB Forensics Pro" icon={Usb}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </StandardModuleLayout>
    );
  }

  return (
    <StandardModuleLayout 
      title="USB Forensics Pro" 
      icon={Usb}
      subtitle="Análise Forense Completa de USB • Histórico, Timeline, Malware Detection"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nova Análise USB</span>
        </button>
      }
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Usb className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">TOTAL</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.total_analyses || 0}</div>
          <div className="text-sm opacity-90">Análises Realizadas</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">DISPOSITIVOS</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.dispositivos_detectados || 0}</div>
          <div className="text-sm opacity-90">Dispositivos Detectados</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">SUSPEITOS</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.dispositivos_suspeitos || 0}</div>
          <div className="text-sm opacity-90">Dispositivos Suspeitos</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Bug className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">MALWARE</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.malware_detected || 0}</div>
          <div className="text-sm opacity-90">Malware Detectado</div>
        </div>
      </div>

      {/* Features Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-6 mb-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-lg p-3">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">🔍 Análise Forense Completa</h3>
              <p className="text-sm opacity-90">
                Registry Analysis • Event Logs • Timeline Completa • Malware Detection • Risk Assessment
              </p>
            </div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-xs">Features</div>
            <div className="text-2xl font-bold">{stats.features_active || 4}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        {[
          { id: 'analyses', label: 'Análises', icon: Search },
          { id: 'devices', label: 'Dispositivos', icon: Usb },
          { id: 'suspicious', label: 'Suspeitos', icon: AlertCircle }
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

      {/* Analyses Tab */}
      {activeTab === 'analyses' && (
        <div className="space-y-4">
          {analyses.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <Usb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nenhuma análise USB ainda</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Iniciar Primeira Análise
              </button>
            </div>
          ) : (
            analyses.map((analysis) => (
              <div key={analysis.analysis_id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-cyan-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg p-3 text-white">
                      <Usb className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{analysis.computer_name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{analysis.tipo_analise}</span>
                        <span>•</span>
                        <span>{analysis.profundidade}</span>
                        <span>•</span>
                        <span>{new Date(analysis.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Concluída
                  </span>
                </div>

                {/* Results Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Dispositivos</div>
                      <div className="text-lg font-bold text-cyan-600">{analysis.devices_found || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Suspeitos</div>
                      <div className="text-lg font-bold text-orange-600">{analysis.suspicious_devices || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Malware</div>
                      <div className="text-lg font-bold text-red-600">{analysis.malware_detected || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Timeline Events</div>
                      <div className="text-lg font-bold text-purple-600">{analysis.timeline_events?.length || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Registry Analysis */}
                {analysis.registry_analysis && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Registry Analysis</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Keys Analyzed</div>
                        <div className="font-bold text-blue-600">{analysis.registry_analysis.keys_analyzed}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Suspicious</div>
                        <div className="font-bold text-orange-600">{analysis.registry_analysis.suspicious_keys}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Deleted Entries</div>
                        <div className="font-bold text-purple-600">{analysis.registry_analysis.deleted_entries_found}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          {devices.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <Usb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum dispositivo detectado</p>
            </div>
          ) : (
            devices.map((device) => (
              <div key={device.serial_number} className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${
                device.risk_level === 'critical' ? 'border-red-500' :
                device.risk_level === 'high' ? 'border-orange-500' :
                device.risk_level === 'medium' ? 'border-yellow-500' :
                'border-green-500'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`rounded-lg p-3 text-white ${
                      device.risk_level === 'critical' ? 'bg-red-500' :
                      device.risk_level === 'high' ? 'bg-orange-500' :
                      device.risk_level === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}>
                      <Usb className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{device.device_name}</h3>
                      <div className="text-sm text-gray-600">
                        {device.vendor} • SN: {device.serial_number}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getRiskColor(device.risk_level)}`}>
                      {device.risk_level.toUpperCase()}
                    </span>
                    {device.malware_detected && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        ⚠️ Malware
                      </span>
                    )}
                  </div>
                </div>

                {/* Device Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Tipo</div>
                      <div className="font-semibold">{device.device_type}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Capacidade</div>
                      <div className="font-semibold">{device.capacity_gb || 'N/A'} GB</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Conexões</div>
                      <div className="font-semibold">{device.total_connections}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Última Conexão</div>
                      <div className="font-semibold">{new Date(device.last_connected).toLocaleDateString('pt-BR')}</div>
                    </div>
                  </div>
                </div>

                {/* Suspicious Activities */}
                {device.suspicious_activities && device.suspicious_activities.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Atividades Suspeitas</span>
                    </h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      {device.suspicious_activities.map((activity, idx) => (
                        <li key={idx}>• {activity}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Suspicious Tab */}
      {activeTab === 'suspicious' && (
        <div className="space-y-4">
          {devices.filter(d => ['high', 'critical'].includes(d.risk_level)).length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum dispositivo suspeito detectado</p>
            </div>
          ) : (
            devices.filter(d => ['high', 'critical'].includes(d.risk_level)).map((device) => (
              <div key={device.serial_number} className="bg-red-50 rounded-xl shadow-md p-6 border-2 border-red-300">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-red-500 rounded-lg p-3 text-white">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800">{device.device_name}</h3>
                    <div className="text-sm text-red-600">
                      Risk Level: {device.risk_level.toUpperCase()} • {device.malware_detected ? 'Malware Detected' : 'No Malware'}
                    </div>
                  </div>
                </div>

                {device.suspicious_activities && (
                  <div className="space-y-1">
                    {device.suspicious_activities.map((activity, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-sm text-red-700">
                        <span>⚠️</span>
                        <span>{activity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Analysis Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center space-x-3">
                <Usb className="w-8 h-8" />
                <span>Nova Análise USB Forense</span>
              </h2>
              <p className="text-sm opacity-90 mt-2">Sistema completo de análise forense USB</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ID do Caso *</label>
                  <input
                    type="text"
                    required
                    value={formData.caso_id}
                    onChange={(e) => setFormData({...formData, caso_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Ex: CASO-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Computador *</label>
                  <input
                    type="text"
                    required
                    value={formData.computer_name}
                    onChange={(e) => setFormData({...formData, computer_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Ex: DESKTOP-ABC123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Análise *</label>
                  <select
                    value={formData.tipo_analise}
                    onChange={(e) => setFormData({...formData, tipo_analise: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="history">Histórico USB Completo</option>
                    <option value="live_detection">Detecção em Tempo Real</option>
                    <option value="malware_scan">Scan de Malware USB</option>
                    <option value="data_extraction">Extração de Dados USB</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profundidade *</label>
                  <select
                    value={formData.profundidade}
                    onChange={(e) => setFormData({...formData, profundidade: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="basica">Básica</option>
                    <option value="completa">Completa</option>
                    <option value="profunda">Profunda</option>
                  </select>
                </div>
              </div>

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
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-semibold shadow-lg"
                >
                  Iniciar Análise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StandardModuleLayout>
  );
};

export default USBForensicsPro;
