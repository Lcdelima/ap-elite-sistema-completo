import React, { useState, useEffect } from 'react';
import { Scale, Plus, Search, FileText, Shield, AlertTriangle, CheckCircle, Clock, Hash, Brain, Download, Eye, Link } from 'lucide-react';
import StandardModuleLayout from '../../components/StandardModuleLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const AnaliseProcessualProfissional = () => {
  const [analises, setAnalises] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnalise, setSelectedAnalise] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    cnj: '',
    comarca: '',
    vara: '',
    tipo_processo: 'penal',
    partes: {
      autor: '',
      reu: ''
    },
    legal_basis: 'mandato',
    prioridade: 2,
    prazo: '',
    objetivo: '',
    responsavel: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, analisesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/processo/stats`, { headers }),
        fetch(`${BACKEND_URL}/api/processo/analises`, { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (analisesRes.ok) {
        const data = await analisesRes.json();
        setAnalises(data.items || []);
      } else {
        setError('Erro ao carregar análises');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erro ao carregar análises');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const dataToSend = {
        ...formData,
        responsavel: user.name || formData.responsavel || 'Advogado Responsável'
      };

      const response = await fetch(`${BACKEND_URL}/api/processo/analises`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert('Análise criada com sucesso!');
        setShowModal(false);
        setFormData({
          cnj: '',
          comarca: '',
          vara: '',
          tipo_processo: 'penal',
          partes: { autor: '', reu: '' },
          legal_basis: 'mandato',
          prioridade: 2,
          prazo: '',
          objetivo: '',
          responsavel: ''
        });
        fetchData();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail || 'Erro ao criar análise'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao criar análise');
    }
  };

  const viewDetails = async (analiseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/processo/analises/${analiseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const analise = await response.json();
        setSelectedAnalise(analise);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateReport = async (analiseId, pades = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/processo/analises/${analiseId}/relatorio?pades=${pades}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const report = await response.json();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${analiseId}_${Date.now()}.json`;
        a.click();
        
        alert('Relatório gerado com sucesso!');
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao gerar relatório');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'em_analise': { color: 'bg-yellow-500', icon: Clock, text: 'Em Análise' },
      'concluida': { color: 'bg-green-500', icon: CheckCircle, text: 'Concluída' },
      'cancelada': { color: 'bg-gray-500', icon: AlertTriangle, text: 'Cancelada' }
    };
    
    const badge = badges[status] || badges['em_analise'];
    const Icon = badge.icon;
    
    return (
      <span className={`${badge.color} text-white px-3 py-1 rounded-full text-xs flex items-center gap-1`}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  const getPrioridadeBadge = (prioridade) => {
    const colors = {
      1: 'bg-gray-500',
      2: 'bg-blue-500',
      3: 'bg-orange-500',
      4: 'bg-red-500'
    };
    
    const labels = {
      1: 'Baixa',
      2: 'Normal',
      3: 'Alta',
      4: 'Urgente'
    };
    
    return (
      <span className={`${colors[prioridade] || colors[2]} text-white px-2 py-1 rounded text-xs`}>
        {labels[prioridade] || 'Normal'}
      </span>
    );
  };

  return (
    <StandardModuleLayout>
      <div className="p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Scale size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Análise Processual Profissional</h1>
                <p className="text-blue-100">Sistema avançado de análise jurídica com IA - Jurisprudência, Riscos e Desfechos</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
            >
              <Plus size={20} />
              Iniciar Análise
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6 flex items-center gap-3">
            <AlertTriangle />
            <span>{error}</span>
            <button onClick={fetchData} className="ml-auto bg-white/20 px-4 py-2 rounded hover:bg-white/30">
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Análises</p>
                <p className="text-3xl font-bold text-white">{stats.total || 0}</p>
              </div>
              <Brain className="text-blue-400" size={32} />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Concluídas</p>
                <p className="text-3xl font-bold text-white">{stats.concluidas || 0}</p>
              </div>
              <CheckCircle className="text-green-400" size={32} />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Em Análise</p>
                <p className="text-3xl font-bold text-white">{stats.em_analise || 0}</p>
              </div>
              <Clock className="text-yellow-400" size={32} />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Alto Risco</p>
                <p className="text-3xl font-bold text-white">{stats.alto_risco || 0}</p>
              </div>
              <AlertTriangle className="text-red-400" size={32} />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por número ou título do processo..."
              className="w-full bg-slate-800 text-white rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Analyses List */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Scale size={20} />
              Análises Realizadas
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-400">Carregando...</div>
          ) : analises.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Nenhuma análise encontrada</p>
              <p className="text-sm mb-4">Inicie uma nova análise processual com IA para começar</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Iniciar Análise
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-semibold">CNJ</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Comarca/Vara</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Tipo</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Status</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Prioridade</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Responsável</th>
                    <th className="text-center p-4 text-gray-300 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {analises.map((analise, index) => (
                    <tr key={analise.id} className={`${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'} hover:bg-slate-700 transition`}>
                      <td className="p-4 text-white font-mono text-sm">{analise.cnj || 'N/A'}</td>
                      <td className="p-4 text-white text-sm">
                        {analise.comarca}<br/>
                        <span className="text-gray-400 text-xs">{analise.vara}</span>
                      </td>
                      <td className="p-4 text-gray-300 text-sm">{analise.tipo_processo}</td>
                      <td className="p-4">{getStatusBadge(analise.status)}</td>
                      <td className="p-4">{getPrioridadeBadge(analise.prioridade)}</td>
                      <td className="p-4 text-gray-300 text-sm">{analise.responsavel}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => viewDetails(analise.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
                            title="Ver Detalhes"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => generateReport(analise.id, false)}
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition"
                            title="Gerar Relatório"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Scale />
                  Nova Análise Processual
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Número CNJ</label>
                    <input
                      type="text"
                      value={formData.cnj}
                      onChange={(e) => setFormData({...formData, cnj: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 0001234-56.2024.8.26.0100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Tipo de Processo *</label>
                    <select
                      required
                      value={formData.tipo_processo}
                      onChange={(e) => setFormData({...formData, tipo_processo: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="penal">Penal</option>
                      <option value="civil">Civil</option>
                      <option value="trabalhista">Trabalhista</option>
                      <option value="administrativo">Administrativo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Comarca *</label>
                    <input
                      type="text"
                      required
                      value={formData.comarca}
                      onChange={(e) => setFormData({...formData, comarca: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Vara *</label>
                    <input
                      type="text"
                      required
                      value={formData.vara}
                      onChange={(e) => setFormData({...formData, vara: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 1ª Vara Criminal"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Autor/Requerente *</label>
                    <input
                      type="text"
                      required
                      value={formData.partes.autor}
                      onChange={(e) => setFormData({...formData, partes: {...formData.partes, autor: e.target.value}})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome do autor"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Réu/Requerido *</label>
                    <input
                      type="text"
                      required
                      value={formData.partes.reu}
                      onChange={(e) => setFormData({...formData, partes: {...formData.partes, reu: e.target.value}})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome do réu"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Base Legal *</label>
                    <select
                      required
                      value={formData.legal_basis}
                      onChange={(e) => setFormData({...formData, legal_basis: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="mandato">Mandato Judicial</option>
                      <option value="ordem_judicial">Ordem Judicial</option>
                      <option value="consentimento">Consentimento da Parte</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Prioridade</label>
                    <select
                      value={formData.prioridade}
                      onChange={(e) => setFormData({...formData, prioridade: parseInt(e.target.value)})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">Baixa</option>
                      <option value="2">Normal</option>
                      <option value="3">Alta</option>
                      <option value="4">Urgente</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-gray-300 mb-2">Prazo/Data Limite</label>
                    <input
                      type="datetime-local"
                      value={formData.prazo}
                      onChange={(e) => setFormData({...formData, prazo: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Objetivo da Análise</label>
                  <textarea
                    value={formData.objetivo}
                    onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                    className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    placeholder="Descreva os objetivos da análise processual..."
                  />
                </div>
                
                {/* Compliance Gate Notice */}
                <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="text-purple-300 mt-1" size={20} />
                    <div>
                      <p className="text-white font-semibold mb-1">Compliance Gate</p>
                      <p className="text-purple-200 text-sm">
                        Esta análise requer base legal anexada. Certifique-se de ter o mandato, ordem judicial ou termo de consentimento
                        antes de prosseguir com upload de documentos.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Criar Análise
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedAnalise && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 z-10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText />
                  Detalhes da Análise
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Info Geral */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Informações do Processo
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-750 p-4 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">CNJ</p>
                      <p className="text-white font-mono">{selectedAnalise.cnj || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Tipo</p>
                      <p className="text-white">{selectedAnalise.tipo_processo}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Comarca</p>
                      <p className="text-white">{selectedAnalise.comarca}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Vara</p>
                      <p className="text-white">{selectedAnalise.vara}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedAnalise.status)}</div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Prioridade</p>
                      <div className="mt-1">{getPrioridadeBadge(selectedAnalise.prioridade)}</div>
                    </div>
                  </div>
                </div>

                {/* Partes */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Partes</h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-750 p-4 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">Autor/Requerente</p>
                      <p className="text-white">{selectedAnalise.partes?.autor}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Réu/Requerido</p>
                      <p className="text-white">{selectedAnalise.partes?.reu}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                {selectedAnalise.timeline && selectedAnalise.timeline.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Clock size={20} />
                      Timeline de Eventos
                    </h3>
                    <div className="space-y-2">
                      {selectedAnalise.timeline.map((event, index) => (
                        <div key={index} className="bg-slate-750 p-3 rounded-lg flex items-start gap-3">
                          <div className="bg-blue-600 rounded-full p-2">
                            <Clock size={14} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{event.evento || event.ato}</p>
                            <p className="text-gray-400 text-xs">{event.detalhes || event.description}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(event.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </StandardModuleLayout>
  );
};

export default AnaliseProcessualProfissional;
