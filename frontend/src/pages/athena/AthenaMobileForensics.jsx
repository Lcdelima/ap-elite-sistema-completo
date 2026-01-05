import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Shield, Database, Cpu, AlertTriangle, CheckCircle, 
  Clock, FileText, Lock, Unlock, Activity, Hash, Play, Eye 
} from 'lucide-react';
import axios from 'axios';

const AthenaMobileForensics = () => {
  const [extractions, setExtractions] = useState([]);
  const [selectedExtraction, setSelectedExtraction] = useState(null);
  const [stats, setStats] = useState(null);
  const [methods, setMethods] = useState([]);
  const [artifactTypes, setArtifactTypes] = useState([]);
  const [exploits, setExploits] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, methodsRes, artifactsRes, extractionsRes, exploitsRes] = await Promise.all([
        axios.get(`${API_URL}/api/athena-mobile/stats`, getAuthHeader()),
        axios.get(`${API_URL}/api/athena-mobile/extraction-methods`, getAuthHeader()),
        axios.get(`${API_URL}/api/athena-mobile/artifact-types`, getAuthHeader()),
        axios.get(`${API_URL}/api/athena-mobile/extractions`, getAuthHeader()),
        axios.get(`${API_URL}/api/athena-mobile/exploits/list`, getAuthHeader())
      ]);
      
      setStats(statsRes.data.stats);
      setMethods(methodsRes.data.methods);
      setArtifactTypes(artifactsRes.data.artifact_types);
      setExtractions(extractionsRes.data.extractions);
      setExploits(exploitsRes.data.exploits);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const createExtraction = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/athena-mobile/extractions/create`,
        formData,
        getAuthHeader()
      );
      
      alert('✅ Extração criada com sucesso!');
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      alert('❌ Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const executeExtraction = async (extractionId) => {
    if (!confirm('Confirma execução da extração forense?')) return;
    
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/athena-mobile/extractions/${extractionId}/execute`,
        {},
        getAuthHeader()
      );
      
      alert('✅ Extração iniciada! Acompanhe o progresso.');
      loadData();
    } catch (error) {
      alert('❌ Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk) => {
    const badges = {
      'LOW': { color: 'bg-green-500', text: 'Baixo' },
      'MEDIUM': { color: 'bg-yellow-500', text: 'Médio' },
      'HIGH': { color: 'bg-orange-500', text: 'Alto' },
      'CRITICAL': { color: 'bg-red-500', text: 'Crítico' }
    };
    const badge = badges[risk] || badges['MEDIUM'];
    return (
      <span className={`px-2 py-1 rounded text-xs text-white ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const badges = {
      'CRIADO': { color: 'bg-blue-500', icon: Clock },
      'EM_EXECUCAO': { color: 'bg-yellow-500', icon: Activity },
      'EXTRAINDO_ARTEFATOS': { color: 'bg-purple-500', icon: Database },
      'PROCESSANDO': { color: 'bg-indigo-500', icon: Cpu },
      'CONCLUIDO': { color: 'bg-green-500', icon: CheckCircle },
      'FALHOU': { color: 'bg-red-500', icon: AlertTriangle }
    };
    const badge = badges[status] || badges['CRIADO'];
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-elite-accent" />
            <h1 className="text-4xl font-title text-elite-text">
              Athena <span className="text-elite-accent">Mobile Forensics</span>
            </h1>
          </div>
          <p className="text-elite-metal">
            Motor de Perícia Digital Profissional - Superior ao Cellebrite e Oxygen
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-surface-01 border border-elite-metal/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-500" />
                <span className="text-elite-metal text-sm">Total</span>
              </div>
              <div className="text-2xl font-bold text-elite-text">{stats.total_extractions}</div>
            </div>
            
            <div className="bg-surface-01 border border-elite-metal/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-elite-metal text-sm">Concluídas</span>
              </div>
              <div className="text-2xl font-bold text-elite-text">{stats.completed}</div>
            </div>
            
            <div className="bg-surface-01 border border-elite-metal/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-yellow-500" />
                <span className="text-elite-metal text-sm">Em Progresso</span>
              </div>
              <div className="text-2xl font-bold text-elite-text">{stats.in_progress}</div>
            </div>
            
            <div className="bg-surface-01 border border-elite-metal/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-purple-500" />
                <span className="text-elite-metal text-sm">Artefatos</span>
              </div>
              <div className="text-2xl font-bold text-elite-text">{stats.total_artifacts.toLocaleString()}</div>
            </div>
            
            <div className="bg-surface-01 border border-elite-metal/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-cyan-500" />
                <span className="text-elite-metal text-sm">Taxa Sucesso</span>
              </div>
              <div className="text-2xl font-bold text-elite-text">{stats.success_rate}%</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Extrações */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-01 border border-elite-metal/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-title text-elite-text">Extrações Forenses</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-elite-accent text-elite-bg rounded hover:bg-elite-accent/90"
                >
                  <Smartphone className="w-4 h-4" />
                  Nova Extração
                </button>
              </div>

              <div className="space-y-3">
                {extractions.map((ext) => (
                  <div
                    key={ext.id}
                    onClick={() => setSelectedExtraction(ext)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedExtraction?.id === ext.id
                        ? 'border-elite-accent bg-surface-02'
                        : 'border-elite-metal/20 hover:border-elite-metal/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-8 h-8 text-elite-accent" />
                        <div>
                          <div className="font-semibold text-elite-text">
                            {ext.dispositivo.marca} {ext.dispositivo.modelo}
                          </div>
                          <div className="text-xs text-elite-metal">
                            {ext.dispositivo.sistema_operacional} | Serial: {ext.dispositivo.numero_serie || 'N/A'}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(ext.status)}
                    </div>

                    {/* Progress Bar */}
                    {ext.progresso > 0 && ext.status !== 'CONCLUIDO' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-elite-metal mb-1">
                          <span>Progresso</span>
                          <span>{ext.progresso}%</span>
                        </div>
                        <div className="w-full bg-surface-03 rounded-full h-2">
                          <div
                            className="bg-elite-accent h-2 rounded-full transition-all"
                            style={{ width: `${ext.progresso}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Info */}
                    <div className="mt-3 flex items-center gap-4 text-xs text-elite-metal">
                      <span>Modo: {ext.modo_selecionado}</span>
                      {ext.artifacts_extraidos > 0 && (
                        <span>✅ {ext.artifacts_extraidos.toLocaleString()} artefatos</span>
                      )}
                      <span>{new Date(ext.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                ))}

                {extractions.length === 0 && (
                  <div className="text-center py-12 text-elite-metal">
                    <Smartphone className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma extração criada</p>
                    <p className="text-xs mt-2">Clique em "Nova Extração" para começar</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detalhes da Extração Selecionada */}
            {selectedExtraction && (
              <div className="bg-surface-01 border border-elite-metal/30 rounded-lg p-6">
                <h3 className="text-lg font-title text-elite-accent mb-4">Detalhes da Extração</h3>
                
                {/* Device Profile */}
                <div className="mb-6 p-4 bg-surface-02 rounded border border-elite-accent/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-4 h-4 text-elite-accent" />
                    <span className="text-sm font-semibold text-elite-text">Perfil Forense</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-elite-metal">Fabricante:</span>
                      <span className="text-elite-text ml-2 font-semibold">
                        {selectedExtraction.profile?.manufacturer}
                      </span>
                    </div>
                    <div>
                      <span className="text-elite-metal">Modelo:</span>
                      <span className="text-elite-text ml-2 font-semibold">
                        {selectedExtraction.profile?.model}
                      </span>
                    </div>
                    <div>
                      <span className="text-elite-metal">OS:</span>
                      <span className="text-elite-text ml-2 font-semibold">
                        {selectedExtraction.profile?.os_version}
                      </span>
                    </div>
                    <div>
                      <span className="text-elite-metal">Criptografia:</span>
                      <span className="text-elite-text ml-2 font-semibold">
                        {selectedExtraction.profile?.encryption_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-elite-metal">Bootloader:</span>
                      <span className="text-elite-text ml-2 flex items-center gap-1">
                        {selectedExtraction.profile?.bootloader_status === 'LOCKED' ? 
                          <Lock className="w-3 h-3 text-red-500" /> : 
                          <Unlock className="w-3 h-3 text-green-500" />
                        }
                        {selectedExtraction.profile?.bootloader_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-elite-metal">Risco Forense:</span>
                      <span className="ml-2">
                        {getRiskBadge(selectedExtraction.profile?.forensic_risk_level)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedExtraction.status === 'CRIADO' && (
                  <button
                    onClick={() => executeExtraction(selectedExtraction.id)}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-elite-accent text-elite-bg rounded hover:bg-elite-accent/90 disabled:opacity-50"
                  >
                    <Play className="w-5 h-5" />
                    Executar Extração Forense
                  </button>
                )}

                {/* Artifacts */}
                {selectedExtraction.artifacts_detalhes && selectedExtraction.artifacts_detalhes.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-elite-text mb-3">Artefatos Extraídos</h4>
                    <div className="space-y-2">
                      {selectedExtraction.artifacts_detalhes.map((artifact, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-surface-02 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-elite-accent" />
                            <span className="text-sm text-elite-text">{artifact.artifact_type}</span>
                          </div>
                          <div className="text-sm font-semibold text-elite-accent">
                            {artifact.count.toLocaleString()} registros
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Methods & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Extraction Methods */}
            <div className="bg-surface-01 border border-elite-metal/30 rounded-lg p-4">
              <h3 className="text-sm font-title text-elite-accent mb-3 uppercase">
                Métodos de Extração
              </h3>
              <div className="space-y-2">
                {methods.map((method) => (
                  <div key={method.id} className="p-3 bg-surface-02 rounded border border-elite-metal/20">
                    <div className="font-semibold text-elite-text text-sm mb-1">
                      {method.name}
                    </div>
                    <div className="text-xs text-elite-metal mb-2">
                      {method.description}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-elite-metal">Invasividade:</span>
                      <span className={`font-semibold ${
                        method.invasiveness === 'Baixa' ? 'text-green-500' :
                        method.invasiveness === 'Média' ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {method.invasiveness}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-elite-metal">Recuperação:</span>
                      <span className="text-elite-accent font-semibold">{method.data_recovered}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exploits */}
            <div className="bg-surface-01 border border-elite-metal/30 rounded-lg p-4">
              <h3 className="text-sm font-title text-elite-accent mb-3 uppercase">
                Exploits Disponíveis
              </h3>
              <div className="space-y-2">
                {exploits.slice(0, 5).map((exploit) => (
                  <div key={exploit.id} className="p-3 bg-surface-02 rounded border border-elite-metal/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-elite-text text-xs">
                        {exploit.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        exploit.severity === 'CRITICAL' ? 'bg-red-500' :
                        exploit.severity === 'HIGH' ? 'bg-orange-500' :
                        exploit.severity === 'MEDIUM' ? 'bg-yellow-500' :
                        'bg-green-500'
                      } text-white`}>
                        {exploit.severity}
                      </span>
                    </div>
                    <div className="text-xs text-elite-metal">
                      {exploit.target}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Criar Extração */}
        {showCreateModal && (
          <CreateExtractionModal
            onClose={() => setShowCreateModal(false)}
            onCreate={createExtraction}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

const CreateExtractionModal = ({ onClose, onCreate, loading }) => {
  const [formData, setFormData] = useState({
    caso_id: '',
    dispositivo_tipo: 'Android',
    dispositivo_marca: '',
    dispositivo_modelo: '',
    numero_serie: '',
    imei: '',
    sistema_operacional: '',
    modo_extracao: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface-01 border border-elite-accent rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-title text-elite-text mb-6">Nova Extração Forense</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-elite-text text-sm font-semibold mb-2">
              ID do Caso
            </label>
            <input
              type="text"
              value={formData.caso_id}
              onChange={(e) => setFormData({...formData, caso_id: e.target.value})}
              className="w-full bg-surface-02 border border-elite-metal/30 rounded px-4 py-2 text-elite-text focus:border-elite-accent focus:outline-none"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-elite-text text-sm font-semibold mb-2">
                Tipo de Dispositivo
              </label>
              <select
                value={formData.dispositivo_tipo}
                onChange={(e) => setFormData({...formData, dispositivo_tipo: e.target.value})}
                className="w-full bg-surface-02 border border-elite-metal/30 rounded px-4 py-2 text-elite-text focus:border-elite-accent focus:outline-none"
              >
                <option>Android</option>
                <option>iOS</option>
                <option>Windows Mobile</option>
              </select>
            </div>

            <div>
              <label className="block text-elite-text text-sm font-semibold mb-2">
                Marca
              </label>
              <input
                type="text"
                value={formData.dispositivo_marca}
                onChange={(e) => setFormData({...formData, dispositivo_marca: e.target.value})}
                className="w-full bg-surface-02 border border-elite-metal/30 rounded px-4 py-2 text-elite-text focus:border-elite-accent focus:outline-none"
                placeholder="Samsung, Apple, Xiaomi..."
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-elite-text text-sm font-semibold mb-2">
                Modelo
              </label>
              <input
                type="text"
                value={formData.dispositivo_modelo}
                onChange={(e) => setFormData({...formData, dispositivo_modelo: e.target.value})}
                className="w-full bg-surface-02 border border-elite-metal/30 rounded px-4 py-2 text-elite-text focus:border-elite-accent focus:outline-none"
                placeholder="Galaxy S23, iPhone 14 Pro..."
                required
              />
            </div>

            <div>
              <label className="block text-elite-text text-sm font-semibold mb-2">
                Sistema Operacional
              </label>
              <input
                type="text"
                value={formData.sistema_operacional}
                onChange={(e) => setFormData({...formData, sistema_operacional: e.target.value})}
                className="w-full bg-surface-02 border border-elite-metal/30 rounded px-4 py-2 text-elite-text focus:border-elite-accent focus:outline-none"
                placeholder="Android 13, iOS 17..."
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-elite-text text-sm font-semibold mb-2">
                Número de Série (opcional)
              </label>
              <input
                type="text"
                value={formData.numero_serie}
                onChange={(e) => setFormData({...formData, numero_serie: e.target.value})}
                className="w-full bg-surface-02 border border-elite-metal/30 rounded px-4 py-2 text-elite-text focus:border-elite-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-elite-text text-sm font-semibold mb-2">
                IMEI (opcional)
              </label>
              <input
                type="text"
                value={formData.imei}
                onChange={(e) => setFormData({...formData, imei: e.target.value})}
                className="w-full bg-surface-02 border border-elite-metal/30 rounded px-4 py-2 text-elite-text focus:border-elite-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-surface-02 text-elite-text rounded hover:bg-surface-03"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-elite-accent text-elite-bg rounded hover:bg-elite-accent/90 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Extração'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AthenaMobileForensics;
