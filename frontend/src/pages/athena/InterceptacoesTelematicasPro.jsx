import React, { useState, useEffect } from 'react';
import { Radio, Plus, Search, MapPin, Phone, MessageSquare, Activity, Play, Pause, Download, Eye, Globe, AlertTriangle } from 'lucide-react';
import StandardModuleLayout from '../../components/StandardModuleLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const InterceptacoesTelematicasPro = () => {
  const [interceptacoes, setInterceptacoes] = useState([]);
  const [stats, setStats] = useState({});
  const [tiposInterceptacao, setTiposInterceptacao] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInterceptacao, setSelectedInterceptacao] = useState(null);
  const [eventosRealtime, setEventosRealtime] = useState([]);
  const [geolocalizacao, setGeolocalizacao] = useState([]);
  const [formData, setFormData] = useState({
    alvo_nome: '',
    alvo_telefone: '',
    alvo_email: '',
    tipo_interceptacao: 'telefonica',
    mandado_judicial: '',
    validade_inicio: '',
    validade_fim: '',
    motivo: '',
    prioridade: 'media'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, interceptacoesRes, tiposRes, equipamentosRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/interceptacoes-pro/stats`, { headers }),
        fetch(`${BACKEND_URL}/api/interceptacoes-pro/interceptacoes`, { headers }),
        fetch(`${BACKEND_URL}/api/interceptacoes-pro/tipos-interceptacao`, { headers }),
        fetch(`${BACKEND_URL}/api/interceptacoes-pro/equipamentos`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (interceptacoesRes.ok) {
        const data = await interceptacoesRes.json();
        setInterceptacoes(data.interceptacoes || []);
      }
      if (tiposRes.ok) {
        const data = await tiposRes.json();
        setTiposInterceptacao(data.tipos || []);
      }
      if (equipamentosRes.ok) {
        const data = await equipamentosRes.json();
        setEquipamentos(data.equipamentos || []);
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
      const response = await fetch(`${BACKEND_URL}/api/interceptacoes-pro/interceptacoes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Interceptação iniciada com sucesso! Captura em tempo real ATIVADA.');
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao iniciar interceptação');
    }
  };

  const visualizarEventos = async (interceptacaoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/interceptacoes-pro/interceptacoes/${interceptacaoId}/eventos-realtime`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setEventosRealtime(data.eventos || []);
        setSelectedInterceptacao(interceptacaoId);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const visualizarGeolocalizacao = async (interceptacaoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/interceptacoes-pro/interceptacoes/${interceptacaoId}/geolocalizacao`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setGeolocalizacao(data.localizacoes || []);
        setSelectedInterceptacao(interceptacaoId);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const pararInterceptacao = async (interceptacaoId) => {
    if (!confirm('Tem certeza que deseja parar esta interceptação?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/interceptacoes-pro/interceptacoes/${interceptacaoId}/parar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Interceptação parada com sucesso!');
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <StandardModuleLayout
      title="Interceptações Telemáticas Profissional"
      subtitle="Sistema avançado de interceptação e monitoramento em tempo real"
      icon={Radio}
      category="Perícia e Investigação"
      categoryColor="bg-red-600"
      primaryAction={{
        label: 'Nova Interceptação',
        icon: Plus,
        onClick: () => setShowModal(true)
      }}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Total</p>
            <Radio className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold">{stats.total || 0}</p>
          <p className="text-xs mt-2 opacity-75">Interceptações</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Ativas</p>
            <Activity className="w-6 h-6 opacity-80 animate-pulse" />
          </div>
          <p className="text-4xl font-bold">{stats.ativas || 0}</p>
          <p className="text-xs mt-2 opacity-75">Em tempo real</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Concluídas</p>
            <Phone className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold">{stats.concluidas || 0}</p>
          <p className="text-xs mt-2 opacity-75">Finalizadas</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Eventos Hoje</p>
            <MessageSquare className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold">{stats.eventos_hoje || 0}</p>
          <p className="text-xs mt-2 opacity-75">Capturados</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Capturas RT</p>
            <Globe className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold">{stats.capturas_realtime || 0}</p>
          <p className="text-xs mt-2 opacity-75">Em andamento</p>
        </div>
      </div>

      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 border-l-4 border-red-600 p-4 mb-8 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300 mr-3" />
          <div>
            <h4 className="font-bold text-red-900 dark:text-red-100">Sistema de Interceptação Profissional</h4>
            <p className="text-sm text-red-800 dark:text-red-200">
              Todas as interceptações são realizadas com autorização judicial e registro completo de cadeia de custódia.
            </p>
          </div>
        </div>
      </div>

      {/* Interceptações List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Interceptações Ativas</h2>
          <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
            <Search className="w-4 h-4 inline mr-2" />
            Filtrar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Carregando interceptações...</p>
          </div>
        ) : interceptacoes.length === 0 ? (
          <div className="text-center py-12">
            <Radio className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">Nenhuma interceptação ativa</p>
            <p className="text-sm text-gray-500 mt-2">Inicie uma nova interceptação com autorização judicial</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interceptacoes.map((interceptacao) => (
              <div key={interceptacao.interceptacao_id} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-xl transition-all bg-gradient-to-r from-white to-gray-50 dark:from-slate-800 dark:to-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <Radio className="w-6 h-6 text-red-600 dark:text-red-300" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {interceptacao.alvo_nome}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4 inline mr-1" />
                          {interceptacao.alvo_telefone}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full font-semibold uppercase">
                        {interceptacao.tipo_interceptacao}
                      </span>
                      {interceptacao.status === 'ativa' && (
                        <span className="flex items-center px-3 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full font-semibold">
                          <Activity className="w-3 h-3 mr-1 animate-pulse" />
                          CAPTURANDO
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="bg-gray-100 dark:bg-slate-900 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mandado</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{interceptacao.mandado_judicial}</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-slate-900 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Validade</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(interceptacao.validade_fim).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="bg-gray-100 dark:bg-slate-900 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Prioridade</p>
                        <p className="font-semibold text-gray-900 dark:text-white uppercase">{interceptacao.prioridade}</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-slate-900 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</p>
                        <p className="font-semibold text-gray-900 dark:text-white uppercase">{interceptacao.status}</p>
                      </div>
                    </div>

                    {interceptacao.captura_realtime && (
                      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4 rounded-lg mb-4">
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <p className="text-xs text-green-700 dark:text-green-300 mb-1">Protocolo</p>
                            <p className="font-bold text-green-900 dark:text-green-100">{interceptacao.captura_realtime.protocolo}</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-700 dark:text-green-300 mb-1">Codec</p>
                            <p className="font-bold text-green-900 dark:text-green-100">{interceptacao.captura_realtime.codec}</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-700 dark:text-green-300 mb-1">Qualidade</p>
                            <p className="font-bold text-green-900 dark:text-green-100">{interceptacao.captura_realtime.qualidade_audio}</p>
                          </div>
                          <div className="flex items-center">
                            <Activity className="w-4 h-4 text-green-600 mr-2 animate-pulse" />
                            <span className="font-bold text-green-900 dark:text-green-100">Captura Ativa</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {interceptacao.estatisticas && (
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{interceptacao.estatisticas.chamadas_capturadas}</p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">Chamadas</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{interceptacao.estatisticas.mensagens_capturadas}</p>
                          <p className="text-xs text-purple-700 dark:text-purple-300">Mensagens</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">{interceptacao.estatisticas.dados_capturados_mb} MB</p>
                          <p className="text-xs text-orange-700 dark:text-orange-300">Dados</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{interceptacao.estatisticas.localizacoes_registradas}</p>
                          <p className="text-xs text-green-700 dark:text-green-300">Localizações</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => visualizarEventos(interceptacao.interceptacao_id)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Eventos RT
                    </button>
                    <button
                      onClick={() => visualizarGeolocalizacao(interceptacao.interceptacao_id)}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Geo
                    </button>
                    {interceptacao.status === 'ativa' && (
                      <button
                        onClick={() => pararInterceptacao(interceptacao.interceptacao_id)}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <Pause className="w-4 h-4" />
                        Parar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Nova Interceptação Telemática</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Alvo*</label>
                  <input
                    type="text"
                    required
                    value={formData.alvo_nome}
                    onChange={(e) => setFormData({...formData, alvo_nome: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone do Alvo*</label>
                  <input
                    type="text"
                    required
                    value={formData.alvo_telefone}
                    onChange={(e) => setFormData({...formData, alvo_telefone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="+55 11 91234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-mail do Alvo</label>
                <input
                  type="email"
                  value={formData.alvo_email}
                  onChange={(e) => setFormData({...formData, alvo_email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Interceptação*</label>
                  <select
                    value={formData.tipo_interceptacao}
                    onChange={(e) => setFormData({...formData, tipo_interceptacao: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {tiposInterceptacao.map(tipo => (
                      <option key={tipo.tipo} value={tipo.tipo}>{tipo.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Número do Mandado Judicial*</label>
                  <input
                    type="text"
                    required
                    value={formData.mandado_judicial}
                    onChange={(e) => setFormData({...formData, mandado_judicial: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Início da Validade*</label>
                  <input
                    type="date"
                    required
                    value={formData.validade_inicio}
                    onChange={(e) => setFormData({...formData, validade_inicio: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fim da Validade*</label>
                  <input
                    type="date"
                    required
                    value={formData.validade_fim}
                    onChange={(e) => setFormData({...formData, validade_fim: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prioridade</label>
                <select
                  value={formData.prioridade}
                  onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Motivo da Interceptação*</label>
                <textarea
                  required
                  value={formData.motivo}
                  onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Descreva o motivo e objetivo da interceptação..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-lg"
                >
                  Iniciar Interceptação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StandardModuleLayout>
  );
};

export default InterceptacoesTelematicasPro;
