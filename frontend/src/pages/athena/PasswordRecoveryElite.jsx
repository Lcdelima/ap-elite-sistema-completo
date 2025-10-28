import React, { useState, useEffect } from 'react';
import { Key, Plus, Search, Download, AlertCircle, CheckCircle, Clock, Shield, Zap, Lock, Cpu, Activity, Hash, TrendingUp } from 'lucide-react';
import StandardModuleLayout from '../../components/StandardModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PasswordRecoveryElite = () => {
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState({});
  const [methods, setMethods] = useState([]);
  const [fileTypes, setFileTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('attempts');
  const [formData, setFormData] = useState({
    caso_id: '',
    arquivo_tipo: 'windows',
    arquivo_nome: '',
    metodo_ataque: 'dictionary',
    complexidade: 'media',
    prioridade: 'media',
    charset: 'all',
    min_length: 1,
    max_length: 16,
    use_gpu: false,
    enable_ai_optimization: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, attemptsRes, methodsRes, fileTypesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/password-recovery-elite/stats`, { headers }),
        fetch(`${BACKEND_URL}/api/password-recovery-elite/recovery-attempts`, { headers }),
        fetch(`${BACKEND_URL}/api/password-recovery-elite/attack-methods`, { headers }),
        fetch(`${BACKEND_URL}/api/password-recovery-elite/supported-file-types`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (attemptsRes.ok) {
        const data = await attemptsRes.json();
        setAttempts(data.attempts || []);
      }
      if (methodsRes.ok) {
        const data = await methodsRes.json();
        setMethods(data.methods || []);
      }
      if (fileTypesRes.ok) {
        const data = await fileTypesRes.json();
        setFileTypes(data.file_types || {});
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
      const response = await fetch(`${BACKEND_URL}/api/password-recovery-elite/recovery-attempts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("🔓 Recuperação de senha iniciada!");
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.success("Erro ao iniciar recuperação");
    }
  };

  const simulateProgress = async (attemptId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/password-recovery-elite/recovery-attempts/${attemptId}/simulate-progress`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.recovered) {
          alert(`✅ Senha recuperada: ${data.password}`);
        }
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'recovered': return 'bg-green-100 text-green-800';
      case 'recovering': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <StandardModuleLayout title="Password Recovery Elite" icon={Key}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </StandardModuleLayout>
    );
  }

  return (
    <StandardModuleLayout 
      title="Password Recovery Elite" 
      icon={Key}
      subtitle="Recuperação de Senhas Revolucionária • Superior a TODOS os Softwares"
      actions={
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all flex items-center space-x-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Nova Recuperação</span>
        </button>
      }
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Key className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">TOTAL</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.total_attempts || 0}</div>
          <div className="text-sm opacity-90">Total de Tentativas</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">SUCESSO</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.recuperadas || 0}</div>
          <div className="text-sm opacity-90">Senhas Recuperadas</div>
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
            <TrendingUp className="w-8 h-8 opacity-80" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-xs font-bold">TAXA</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.success_rate || 0}%</div>
          <div className="text-sm opacity-90">Taxa de Sucesso</div>
        </div>
      </div>

      {/* GPU & AI Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl p-6 mb-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-lg p-3">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">⚡ GPU Accelerated + AI Optimization</h3>
              <p className="text-sm opacity-90">
                100M-1B passwords/sec • 6 Métodos de Ataque • Rainbow Tables • IA para padrões
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-xs">GPU</div>
              <div className="text-lg font-bold">✓ Enabled</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-xs">AI</div>
              <div className="text-lg font-bold">✓ Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        {[
          { id: 'attempts', label: 'Tentativas', icon: Key },
          { id: 'methods', label: 'Métodos', icon: Shield },
          { id: 'file-types', label: 'Tipos Suportados', icon: Lock }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-red-500 text-red-600 bg-red-50'
                : 'border-transparent text-gray-600 hover:text-red-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-semibold">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Attempts Tab */}
      {activeTab === 'attempts' && (
        <div className="space-y-4">
          {attempts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nenhuma tentativa de recuperação ainda</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Iniciar Primeira Recuperação
              </button>
            </div>
          ) : (
            attempts.map((attempt) => (
              <div key={attempt.attempt_id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg p-3 text-white">
                      <Key className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{attempt.arquivo_nome}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center space-x-1">
                          <Lock className="w-4 h-4" />
                          <span>{attempt.arquivo_tipo}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Shield className="w-4 h-4" />
                          <span>{attempt.metodo_ataque}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{attempt.tempo_decorrido || '00:00:00'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(attempt.status)}`}>
                    {attempt.status === 'recovering' ? 'Recuperando' : attempt.status === 'recovered' ? 'Recuperada' : attempt.status}
                  </span>
                </div>

                {/* Progress Bar */}
                {attempt.progresso !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Progresso</span>
                      <span className="text-sm font-bold text-red-600">{attempt.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-pink-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${attempt.progresso}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Tentativas</div>
                      <div className="text-lg font-bold text-red-600">{attempt.tentativas_realizadas?.toLocaleString() || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Velocidade</div>
                      <div className="text-lg font-bold text-blue-600">{attempt.velocidade_atual || '0 p/s'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Tempo Est.</div>
                      <div className="text-lg font-bold text-purple-600">{attempt.estimated_time_hours}h</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Complexidade</div>
                      <div className="text-lg font-bold text-orange-600">{attempt.complexidade}</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {attempt.use_gpu && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-semibold">
                      ⚡ GPU Accelerated
                    </span>
                  )}
                  {attempt.ai_optimization_enabled && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                      🤖 AI Optimization
                    </span>
                  )}
                  <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                    Charset: {attempt.charset}
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">
                    {attempt.min_length}-{attempt.max_length} chars
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => simulateProgress(attempt.attempt_id)}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 text-sm font-semibold"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Simular Progresso</span>
                  </button>
                  {attempt.status === 'recovered' && (
                    <button
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center space-x-2 text-sm font-semibold"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Ver Senha</span>
                    </button>
                  )}
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
            <div key={method.method} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-t-4 border-red-500">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg p-3 text-white">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{method.name}</h3>
                  <span className="text-xs text-gray-500">{method.method}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{method.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Velocidade:</span>
                  <span className="font-semibold text-blue-600">{method.speed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taxa Sucesso:</span>
                  <span className="font-semibold text-green-600">{method.success_rate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tempo Est.:</span>
                  <span className="font-semibold text-purple-600">{method.time_estimate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Types Tab */}
      {activeTab === 'file-types' && (
        <div className="space-y-6">
          {Object.entries(fileTypes).map(([category, items]) => (
            <div key={category} className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize">{category.replace('_', ' ')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lock className="w-4 h-4 text-red-500" />
                      <h4 className="font-semibold text-gray-700">{item.name}</h4>
                    </div>
                    {item.versions && (
                      <p className="text-xs text-gray-600">Versões: {item.versions.join(', ')}</p>
                    )}
                    {item.formats && (
                      <p className="text-xs text-gray-600">Formatos: {item.formats.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Recovery Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center space-x-3">
                <Key className="w-8 h-8" />
                <span>Nova Recuperação de Senha</span>
              </h2>
              <p className="text-sm opacity-90 mt-2">Sistema revolucionário com GPU e IA</p>
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: CASO-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Arquivo *</label>
                  <select
                    value={formData.arquivo_tipo}
                    onChange={(e) => setFormData({...formData, arquivo_tipo: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="windows">Windows (SAM, AD, NTLM)</option>
                    <option value="pdf">PDF</option>
                    <option value="zip">ZIP</option>
                    <option value="rar">RAR</option>
                    <option value="7z">7-Zip</option>
                    <option value="office_word">Microsoft Word</option>
                    <option value="office_excel">Microsoft Excel</option>
                    <option value="office_powerpoint">Microsoft PowerPoint</option>
                    <option value="office_access">Microsoft Access</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Arquivo *</label>
                  <input
                    type="text"
                    required
                    value={formData.arquivo_nome}
                    onChange={(e) => setFormData({...formData, arquivo_nome: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                    placeholder="Ex: documento_protegido.pdf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Método de Ataque *</label>
                  <select
                    value={formData.metodo_ataque}
                    onChange={(e) => setFormData({...formData, metodo_ataque: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="dictionary">Dictionary Attack</option>
                    <option value="brute_force">Brute Force</option>
                    <option value="mask_attack">Mask Attack</option>
                    <option value="rainbow_tables">Rainbow Tables</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="gpu_accelerated">GPU Accelerated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Complexidade *</label>
                  <select
                    value={formData.complexidade}
                    onChange={(e) => setFormData({...formData, complexidade: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="baixa">Baixa (1-6 chars)</option>
                    <option value="media">Média (7-10 chars)</option>
                    <option value="alta">Alta (11-14 chars)</option>
                    <option value="extrema">Extrema (15+ chars)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prioridade *</label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Opções Avançadas</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.use_gpu}
                      onChange={(e) => setFormData({...formData, use_gpu: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <Zap className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-800">Usar Aceleração GPU (100-1000x mais rápido)</span>
                  </label>
                  <label className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enable_ai_optimization}
                      onChange={(e) => setFormData({...formData, enable_ai_optimization: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <Cpu className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">Otimização com IA (detecção de padrões)</span>
                  </label>
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
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all font-semibold shadow-lg"
                >
                  Iniciar Recuperação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StandardModuleLayout>
  );
};

export default PasswordRecoveryElite;
