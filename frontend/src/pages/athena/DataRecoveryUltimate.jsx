import React, { useState, useEffect } from 'react';
import { HardDrive, Plus, Search, Download, AlertCircle, CheckCircle, Clock, FileText, Activity, Database, Cpu, Layers, Zap } from 'lucide-react';
import StandardModuleLayout from '../../components/StandardModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const DataRecoveryUltimate = () => {
  const [recoveries, setRecoveries] = useState([]);
  const [stats, setStats] = useState({});
  const [systems, setSystems] = useState([]);
  const [mediaTypes, setMediaTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('recoveries');
  const [formData, setFormData] = useState({
    caso_id: '',
    sistema_operacional: 'windows',
    tipo_midia: 'hdd',
    capacidade_gb: 500,
    tipo_recuperacao: 'deleted_files',
    filesystem: 'ntfs',
    scan_profundidade: 'profunda',
    tipos_arquivo: ['all'],
    prioridade: 'media'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, recoveriesRes, systemsRes, mediaTypesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/data-recovery-ultimate/stats`, { headers }),
        fetch(`${BACKEND_URL}/api/data-recovery-ultimate/recoveries`, { headers }),
        fetch(`${BACKEND_URL}/api/data-recovery-ultimate/supported-systems`, { headers }),
        fetch(`${BACKEND_URL}/api/data-recovery-ultimate/supported-media-types`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (recoveriesRes.ok) {
        const data = await recoveriesRes.json();
        setRecoveries(data.recoveries || []);
      }
      if (systemsRes.ok) {
        const data = await systemsRes.json();
        setSystems(data.systems || []);
      }
      if (mediaTypesRes.ok) {
        const data = await mediaTypesRes.json();
        setMediaTypes(data.media_types || []);
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
      const response = await fetch(`${BACKEND_URL}/api/data-recovery-ultimate/recoveries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("🔄 Scan de recuperação iniciado!");
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.success("Erro ao iniciar recuperação");
    }
  };

  const simulateProgress = async (recoveryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/data-recovery-ultimate/recoveries/${recoveryId}/simulate-progress`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scanning': return 'bg-blue-100 text-blue-800';
      case 'recovered': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <StandardModuleLayout title="Data Recovery Ultimate" icon={HardDrive}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </StandardModuleLayout>
    );
  }

  return (
    <StandardModuleLayout 
      title="Data Recovery Ultimate" 
      icon={HardDrive}
      subtitle="Recuperação de Dados Revolucionária • Windows, Linux, macOS, Android, iOS"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nova Recuperação</span>
        </button>
      }
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <HardDrive className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">TOTAL</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.total_recoveries || 0}</div>
          <div className="text-sm opacity-90">Total de Scans</div>
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
            <Database className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">DADOS</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.total_data_recovered_gb || 0} GB</div>
          <div className="text-sm opacity-90">Dados Recuperados</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">ARQUIVOS</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.total_files_recovered?.toLocaleString() || 0}</div>
          <div className="text-sm opacity-90">Arquivos Recuperados</div>
        </div>
      </div>

      {/* Support Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl p-6 mb-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-lg p-3">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">🌐 Suporte Universal</h3>
              <p className="text-sm opacity-90">
                5 Sistemas • 10 Filesystems • 6 Tipos de Mídia • RAID Support • 61+ Extensões
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-xs">Sistemas</div>
              <div className="text-lg font-bold">{stats.supported_systems || 5}</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-xs">Filesystems</div>
              <div className="text-lg font-bold">{stats.supported_filesystems || 10}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        {[
          { id: 'recoveries', label: 'Recuperações', icon: HardDrive },
          { id: 'systems', label: 'Sistemas', icon: Cpu },
          { id: 'media', label: 'Tipos de Mídia', icon: Layers }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-gray-600 hover:text-green-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-semibold">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Recoveries Tab */}
      {activeTab === 'recoveries' && (
        <div className="space-y-4">
          {recoveries.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <HardDrive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nenhuma recuperação ainda</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Iniciar Primeira Recuperação
              </button>
            </div>
          ) : (
            recoveries.map((recovery) => (
              <div key={recovery.recovery_id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 text-white">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{recovery.tipo_midia.toUpperCase()} - {recovery.capacidade_gb}GB</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{recovery.sistema_operacional}</span>
                        <span>•</span>
                        <span>{recovery.filesystem}</span>
                        <span>•</span>
                        <span>{recovery.scan_profundidade}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(recovery.status)}`}>
                    {recovery.status === 'scanning' ? 'Scaneando' : recovery.status === 'completed' ? 'Concluído' : recovery.status}
                  </span>
                </div>

                {/* Progress Bar */}
                {recovery.progresso !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Progresso</span>
                      <span className="text-sm font-bold text-green-600">{recovery.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${recovery.progresso}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Scan Info */}
                {recovery.scan_info && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Setores</div>
                        <div className="text-lg font-bold text-blue-600">
                          {recovery.scan_info.setores_escaneados?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Velocidade</div>
                        <div className="text-lg font-bold text-purple-600">{recovery.scan_info.velocidade_scan || '0 MB/s'}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Tempo</div>
                        <div className="text-lg font-bold text-orange-600">{recovery.scan_info.tempo_decorrido || '00:00:00'}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Est. Total</div>
                        <div className="text-lg font-bold text-red-600">{recovery.estimated_time_hours}h</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Files Found */}
                {recovery.arquivos_encontrados && recovery.dados_recuperados && (
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Arquivos Encontrados</h4>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-xs">
                      {Object.entries(recovery.arquivos_encontrados).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-lg font-bold text-green-600">{value}</div>
                          <div className="text-gray-600 capitalize">{key}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">Total Recuperável:</span>
                        <span className="text-lg font-bold text-green-600">
                          {recovery.dados_recuperados.arquivos_recuperaveis?.toLocaleString()} arquivos ({recovery.dados_recuperados.tamanho_total_gb} GB)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => simulateProgress(recovery.recovery_id)}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 text-sm font-semibold"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Simular Progresso</span>
                  </button>
                  {recovery.status === 'completed' && (
                    <button
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2 text-sm font-semibold"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar Arquivos</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Systems Tab */}
      {activeTab === 'systems' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system) => (
            <div key={system.os} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-t-4 border-green-500">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 text-white">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{system.name}</h3>
                  <span className="text-xs text-gray-500">{system.os}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-gray-600 font-semibold mb-1">Filesystems:</div>
                  <div className="flex flex-wrap gap-1">
                    {system.filesystems.map((fs, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                        {fs}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Types Tab */}
      {activeTab === 'media' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaTypes.map((media) => (
            <div key={media.type} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-t-4 border-purple-500">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-3 text-white">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{media.name}</h3>
                  <span className="text-xs text-gray-500">{media.type}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Capacidade Máx:</span>
                  <span className="font-semibold text-blue-600">{media.max_capacity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Dificuldade:</span>
                  <span className="font-semibold text-orange-600">{media.recovery_difficulty}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Recovery Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center space-x-3">
                <HardDrive className="w-8 h-8" />
                <span>Nova Recuperação de Dados</span>
              </h2>
              <p className="text-sm opacity-90 mt-2">Sistema revolucionário de recuperação universal</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ID do Caso *</label>
                  <input
                    type="text"
                    required
                    value={formData.caso_id}
                    onChange={(e) => setFormData({...formData, caso_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sistema Operacional *</label>
                  <select
                    value={formData.sistema_operacional}
                    onChange={(e) => setFormData({...formData, sistema_operacional: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="windows">Windows</option>
                    <option value="linux">Linux</option>
                    <option value="macos">macOS</option>
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Mídia *</label>
                  <select
                    value={formData.tipo_midia}
                    onChange={(e) => setFormData({...formData, tipo_midia: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="hdd">HDD (Hard Disk)</option>
                    <option value="ssd">SSD (Solid State)</option>
                    <option value="usb">USB Flash Drive</option>
                    <option value="sd_card">SD/microSD Card</option>
                    <option value="memory_card">Memory Card</option>
                    <option value="raid">RAID Array</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Capacidade (GB) *</label>
                  <input
                    type="number"
                    required
                    value={formData.capacidade_gb}
                    onChange={(e) => setFormData({...formData, capacidade_gb: parseFloat(e.target.value)})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Filesystem *</label>
                  <select
                    value={formData.filesystem}
                    onChange={(e) => setFormData({...formData, filesystem: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="ntfs">NTFS (Windows)</option>
                    <option value="fat32">FAT32</option>
                    <option value="exfat">exFAT</option>
                    <option value="ext4">ext4 (Linux)</option>
                    <option value="ext3">ext3 (Linux)</option>
                    <option value="hfs+">HFS+ (Mac)</option>
                    <option value="apfs">APFS (Mac)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profundidade de Scan *</label>
                  <select
                    value={formData.scan_profundidade}
                    onChange={(e) => setFormData({...formData, scan_profundidade: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="rapida">Rápida (1-2h)</option>
                    <option value="normal">Normal (2-5h)</option>
                    <option value="profunda">Profunda (5-10h)</option>
                    <option value="extrema">Extrema (10-20h)</option>
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
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold shadow-lg"
                >
                  Iniciar Scan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StandardModuleLayout>
  );
};

export default DataRecoveryUltimate;
