import React, { useState, useEffect } from 'react';
import { Microscope, Plus, Search, Download, AlertCircle, CheckCircle, Clock, FileText, Shield, Cpu, Hash, Activity } from 'lucide-react';
import StandardModuleLayout from '../../components/StandardModuleLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PericiaDigitalPro = () => {
  const [pericias, setPericias] = useState([]);
  const [stats, setStats] = useState({});
  const [metodologias, setMetodologias] = useState([]);
  const [ferramentas, setFerramentas] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    caso_id: '',
    dispositivo_tipo: 'smartphone',
    dispositivo_marca: '',
    dispositivo_modelo: '',
    numero_serie: '',
    imei: '',
    sistema_operacional: '',
    capacidade_armazenamento: '',
    objetivo_pericia: '',
    metodologia: 'extracao_logica',
    prioridade: 'media'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, periciasRes, metodologiasRes, ferramentasRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/pericia-digital-pro/stats`, { headers }),
        fetch(`${BACKEND_URL}/api/pericia-digital-pro/pericias`, { headers }),
        fetch(`${BACKEND_URL}/api/pericia-digital-pro/metodologias`, { headers }),
        fetch(`${BACKEND_URL}/api/pericia-digital-pro/ferramentas`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (periciasRes.ok) {
        const data = await periciasRes.json();
        setPericias(data.pericias || []);
      }
      if (metodologiasRes.ok) {
        const data = await metodologiasRes.json();
        setMetodologias(data.metodologias || []);
      }
      if (ferramentasRes.ok) {
        const data = await ferramentasRes.json();
        setFerramentas(data.ferramentas || {});
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
      const response = await fetch(`${BACKEND_URL}/api/pericia-digital-pro/pericias`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Perícia criada com sucesso!');
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao criar perícia');
    }
  };

  const extrairDados = async (periciaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/pericia-digital-pro/pericias/${periciaId}/extrair-dados`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Extração de dados iniciada com sucesso!');
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const gerarRelatorio = async (periciaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/pericia-digital-pro/pericias/${periciaId}/gerar-relatorio`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Relatório pericial gerado com sucesso!');
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <StandardModuleLayout
      title="Perícia Digital Profissional"
      subtitle="Sistema avançado de perícia digital forense"
      icon={Microscope}
      category="Perícia e Investigação"
      categoryColor="bg-teal-600"
      primaryAction={{
        label: 'Nova Perícia',
        icon: Plus,
        onClick: () => setShowModal(true)
      }}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Total de Perícias</p>
            <Microscope className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold">{stats.total || 0}</p>
          <p className="text-xs mt-2 opacity-75">Casos registrados</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Em Andamento</p>
            <Activity className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold">{stats.em_andamento || 0}</p>
          <p className="text-xs mt-2 opacity-75">Perícias ativas</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Concluídas</p>
            <CheckCircle className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold">{stats.concluidas || 0}</p>
          <p className="text-xs mt-2 opacity-75">Perícias finalizadas</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium opacity-90">Críticas</p>
            <AlertCircle className="w-6 h-6 opacity-80" />
          </div>
          <p className="text-4xl font-bold">{stats.criticas || 0}</p>
          <p className="text-xs mt-2 opacity-75">Alta prioridade</p>
        </div>
      </div>

      {/* Pericias List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Perícias em Andamento</h2>
          <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
            <Search className="w-4 h-4 inline mr-2" />
            Filtrar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Carregando perícias...</p>
          </div>
        ) : pericias.length === 0 ? (
          <div className="text-center py-12">
            <Microscope className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">Nenhuma perícia registrada</p>
            <p className="text-sm text-gray-500 mt-2">Crie uma nova perícia para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pericias.map((pericia) => (
              <div key={pericia.pericia_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-xl transition-shadow bg-gradient-to-r from-white to-gray-50 dark:from-slate-800 dark:to-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Cpu className="w-6 h-6 text-teal-600" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {pericia.dispositivo_marca} {pericia.dispositivo_modelo}
                      </h3>
                      <span className="px-3 py-1 text-xs bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full font-semibold">
                        {pericia.dispositivo_tipo}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3">
                      <div>
                        <span className="font-semibold">Caso:</span> {pericia.caso_id}
                      </div>
                      <div>
                        <span className="font-semibold">Metodologia:</span> {pericia.metodologia}
                      </div>
                      <div>
                        <span className="font-semibold">SO:</span> {pericia.sistema_operacional}
                      </div>
                      <div>
                        <span className="font-semibold">IMEI:</span> {pericia.imei || 'N/A'}
                      </div>
                    </div>
                    {pericia.dados_extraidos && (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4 p-4 bg-gray-100 dark:bg-slate-900 rounded-lg">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{pericia.dados_extraidos.contatos}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Contatos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{pericia.dados_extraidos.mensagens}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Mensagens</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{pericia.dados_extraidos.chamadas}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Chamadas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-pink-600">{pericia.dados_extraidos.fotos}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Fotos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{pericia.dados_extraidos.videos}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Vídeos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-teal-600">{pericia.dados_extraidos.documentos}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Docs</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                      pericia.status === 'concluida' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      pericia.status === 'em_andamento' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      pericia.status === 'extracao_concluida' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {pericia.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex gap-2">
                      {pericia.status !== 'extracao_concluida' && pericia.status !== 'concluida' && (
                        <button
                          onClick={() => extrairDados(pericia.pericia_id)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Extrair Dados
                        </button>
                      )}
                      {pericia.status === 'extracao_concluida' && (
                        <button
                          onClick={() => gerarRelatorio(pericia.pericia_id)}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Gerar Relatório
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {pericia.progresso !== undefined && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-4">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all flex items-center justify-center text-xs text-white font-bold"
                      style={{ width: `${pericia.progresso}%` }}
                    >
                      {pericia.progresso}%
                    </div>
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
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Nova Perícia Digital</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ID do Caso*</label>
                  <input
                    type="text"
                    required
                    value={formData.caso_id}
                    onChange={(e) => setFormData({...formData, caso_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="CASO-2024-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Dispositivo*</label>
                  <select
                    value={formData.dispositivo_tipo}
                    onChange={(e) => setFormData({...formData, dispositivo_tipo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="smartphone">Smartphone</option>
                    <option value="computador">Computador</option>
                    <option value="tablet">Tablet</option>
                    <option value="servidor">Servidor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Marca*</label>
                  <input
                    type="text"
                    required
                    value={formData.dispositivo_marca}
                    onChange={(e) => setFormData({...formData, dispositivo_marca: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Samsung, Apple, etc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Modelo*</label>
                  <input
                    type="text"
                    required
                    value={formData.dispositivo_modelo}
                    onChange={(e) => setFormData({...formData, dispositivo_modelo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Galaxy S21, iPhone 13"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Número de Série</label>
                  <input
                    type="text"
                    value={formData.numero_serie}
                    onChange={(e) => setFormData({...formData, numero_serie: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">IMEI</label>
                  <input
                    type="text"
                    value={formData.imei}
                    onChange={(e) => setFormData({...formData, imei: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Armazenamento*</label>
                  <input
                    type="text"
                    required
                    value={formData.capacidade_armazenamento}
                    onChange={(e) => setFormData({...formData, capacidade_armazenamento: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="128GB"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sistema Operacional*</label>
                <input
                  type="text"
                  required
                  value={formData.sistema_operacional}
                  onChange={(e) => setFormData({...formData, sistema_operacional: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Android 12, iOS 16"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Metodologia*</label>
                  <select
                    value={formData.metodologia}
                    onChange={(e) => setFormData({...formData, metodologia: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {metodologias.map(m => (
                      <option key={m.id} value={m.id}>{m.nome}</option>
                    ))}
                  </select>
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Objetivo da Perícia*</label>
                <textarea
                  required
                  value={formData.objetivo_pericia}
                  onChange={(e) => setFormData({...formData, objetivo_pericia: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Descreva o objetivo da perícia digital..."
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
                  className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium shadow-lg"
                >
                  Criar Perícia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StandardModuleLayout>
  );
};

export default PericiaDigitalPro;