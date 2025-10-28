import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, BarChart3, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const ProcessAnalysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    process_number: '',
    case_type: 'civil',
    parties: '',
    description: ''
  });

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/athena/processes/list`);
      setAnalyses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      setError('Erro ao carregar análises');
      toast.error('Erro ao carregar análises');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${BACKEND_URL}/api/athena/processes/create`, {
        collection: 'process_analyses',
        data: {
          ...formData,
          status: 'pending',
          created_by: localStorage.getItem('ap_elite_user') ? JSON.parse(localStorage.getItem('ap_elite_user')).name : 'Usuário'
        }
      });
      
      toast.success('Análise processual criada com sucesso!');
      setShowModal(false);
      setFormData({ process_number: '', case_type: 'civil', parties: '', description: '' });
      fetchAnalyses();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao criar análise');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: analyses.length,
    completed: analyses.filter(a => a.data?.status === 'completed').length,
    in_progress: analyses.filter(a => a.data?.status === 'in_progress').length,
    high_risk: analyses.filter(a => a.data?.risk_level === 'high').length
  };

  return (
    <UniversalModuleLayout
      title="Análise Processual Profissional"
      subtitle="Sistema avançado de análise jurídica com IA"
      icon={Brain}
      headerAction={
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-full md:w-auto"
        >
          Iniciar Análise
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total de Análises</p>
            <BarChart3 className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Concluídas</p>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Em Análise</p>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.in_progress}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Alto Risco</p>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.high_risk}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <input
          type="text"
          placeholder="Buscar análises..."
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Analyses List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Análises Realizadas</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando análises...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchAnalyses}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Tentar Novamente
            </button>
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma análise processual encontrada</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Iniciar Primeira Análise
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{analysis.data?.process_number || 'Sem número'}</h3>
                    <p className="text-sm text-gray-600">{analysis.data?.description || 'Sem descrição'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    analysis.data?.status === 'completed' ? 'bg-green-100 text-green-800' :
                    analysis.data?.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {analysis.data?.status === 'completed' ? 'Concluída' :
                     analysis.data?.status === 'in_progress' ? 'Em Análise' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nova Análise Processual</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Número do Processo*</label>
                <input
                  type="text"
                  required
                  value={formData.process_number}
                  onChange={(e) => setFormData({...formData, process_number: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ex: 0000000-00.0000.0.00.0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Processo*</label>
                <select
                  value={formData.case_type}
                  onChange={(e) => setFormData({...formData, case_type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="civil">Cível</option>
                  <option value="criminal">Criminal</option>
                  <option value="labor">Trabalhista</option>
                  <option value="family">Família</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Partes Envolvidas</label>
                <input
                  type="text"
                  value={formData.parties}
                  onChange={(e) => setFormData({...formData, parties: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ex: João Silva vs Maria Santos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Breve descrição do processo..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Criar Análise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UniversalModuleLayout>
  );
};

export default ProcessAnalysis;