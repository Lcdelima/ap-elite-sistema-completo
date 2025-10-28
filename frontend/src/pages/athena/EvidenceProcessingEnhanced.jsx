import React, { useState, useEffect } from 'react';
import { Shield, Plus, Search, AlertCircle, CheckCircle, Clock, Database, FileText, Hash } from 'lucide-react';
import StandardModuleLayout from '../../components/StandardModuleLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const EvidenceProcessingEnhanced = () => {
  const [evidence, setEvidence] = useState([]);
  const [stats, setStats] = useState({});
  const [evidenceTypes, setEvidenceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    evidence_name: '',
    evidence_type: 'digital_image',
    case_id: '',
    source: '',
    description: '',
    priority: 'medium',
    hash_algorithm: 'SHA-256'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const statsRes = await fetch(`${BACKEND_URL}/api/evidence/stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const evidenceRes = await fetch(`${BACKEND_URL}/api/evidence/evidence`, { headers });
      if (evidenceRes.ok) {
        const evidenceData = await evidenceRes.json();
        setEvidence(evidenceData.evidence || []);
      }

      const typesRes = await fetch(`${BACKEND_URL}/api/evidence/evidence-types`, { headers });
      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setEvidenceTypes(typesData.evidence_types || []);
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
      const response = await fetch(`${BACKEND_URL}/api/evidence/evidence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Evidência criada com sucesso!');
        setShowModal(false);
        setFormData({
          evidence_name: '',
          evidence_type: 'digital_image',
          case_id: '',
          source: '',
          description: '',
          priority: 'medium',
          hash_algorithm: 'SHA-256'
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao criar evidência');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Pendente',
      'processing': 'Processando',
      'completed': 'Concluída',
      'failed': 'Falhou'
    };
    return statusMap[status] || status;
  };

  return (
    <StandardModuleLayout
      title="Processamento de Evidências"
      subtitle="Gestão e processamento profissional de evidências digitais"
      icon={Shield}
      category="Perícia e Investigação"
      categoryColor="bg-cyan-500"
      primaryAction={{
        label: 'Nova Evidência',
        icon: Plus,
        onClick: () => setShowModal(true)
      }}
    >
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
            <Database className="w-5 h-5 text-cyan-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Evidências processadas</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Aguardando processamento</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processando</p>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.processing || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Em processamento</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Concluídas</p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.completed || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Processamento finalizado</p>
        </div>
      </div>

      {/* Evidence List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Evidências em Processamento</h2>
          <button className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
            <Search className="w-4 h-4 inline mr-2" />
            Filtrar
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Carregando evidências...</p>
          </div>
        ) : evidence.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhuma evidência em processamento</p>
            <p className="text-sm text-gray-500 mt-2">Adicione evidências para começar o processamento</p>
          </div>
        ) : (
          <div className="space-y-4">
            {evidence.map((item) => (
              <div key={item.evidence_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(item.status)}
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.evidence_name}</h3>
                      <span className="px-2 py-1 text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 rounded">
                        {item.evidence_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{item.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div><span className="font-medium">Caso:</span> {item.case_id}</div>
                      <div><span className="font-medium">Fonte:</span> {item.source}</div>
                      <div><span className="font-medium">Hash:</span> {item.hash_algorithm}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    item.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                    item.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                    item.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {getStatusText(item.status)}
                  </span>
                </div>
                {item.progress !== undefined && item.status === 'processing' && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                    <div
                      className="bg-cyan-600 h-2 rounded-full transition-all"
                      style={{ width: `${item.progress}%` }}
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
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Nova Evidência</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nome da Evidência*</label>
                <input
                  type="text"
                  required
                  value={formData.evidence_name}
                  onChange={(e) => setFormData({...formData, evidence_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Disco rígido do suspeito"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tipo de Evidência*</label>
                  <select
                    value={formData.evidence_type}
                    onChange={(e) => setFormData({...formData, evidence_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    required
                  >
                    {evidenceTypes.map(type => (
                      <option key={type.type} value={type.type}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ID do Caso*</label>
                  <input
                    type="text"
                    required
                    value={formData.case_id}
                    onChange={(e) => setFormData({...formData, case_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="CASO-2024-001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Fonte*</label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Ex: Apreensão policial"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Algoritmo de Hash*</label>
                  <select
                    value={formData.hash_algorithm}
                    onChange={(e) => setFormData({...formData, hash_algorithm: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="SHA-256">SHA-256</option>
                    <option value="SHA-512">SHA-512</option>
                    <option value="MD5">MD5</option>
                    <option value="SHA-1">SHA-1</option>
                  </select>
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
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Informações adicionais sobre a evidência"
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
                  className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-medium shadow-lg"
                >
                  Criar Evidência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StandardModuleLayout>
  );
};

export default EvidenceProcessingEnhanced;