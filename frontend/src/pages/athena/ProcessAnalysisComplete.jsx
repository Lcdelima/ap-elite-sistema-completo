import React, { useState, useEffect } from 'react';
import { FileSearch, Plus, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const ProcessAnalysisComplete = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    processNumber: '',
    processType: '',
    court: '',
    analysisType: '',
    priority: '',
    deadline: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/athena/processanalysiscomplete/list`);
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${BACKEND_URL}/api/athena/processanalysiscomplete/create`, {
        collection: 'processanalysiscomplete',
        data: formData
      });
      
      toast.success('Análise criada com sucesso!');
      setShowModal(false);
      setFormData({
        processNumber: '',
        processType: '',
        court: '',
        analysisType: '',
        priority: '',
        deadline: ''
      });
      fetchItems();
    } catch (error) {
      console.error('Erro ao criar item:', error);
      toast.error('Erro ao criar análise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModuleLayout
      title="Análise de Processo Concluída"
      subtitle="Análise completa de processos judiciais"
      icon={FileSearch}
      headerAction={
        <button
          onClick={() => setShowModal(true)}
          className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Análise
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Análises</p>
              <p className="text-3xl font-bold mt-1">{items.length}</p>
            </div>
            <FileSearch size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Concluídas</p>
              <p className="text-3xl font-bold mt-1">{items.filter(i => i.status === 'completed').length}</p>
            </div>
            <CheckCircle size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Urgentes</p>
              <p className="text-3xl font-bold mt-1">{items.filter(i => i.priority === 'urgente').length}</p>
            </div>
            <AlertTriangle size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Análises de Processos</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button onClick={fetchItems} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Tentar Novamente</button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhuma análise registrada</p>
            <button onClick={() => setShowModal(true)} className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">Criar Primeira Análise</button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{item.processNumber || 'Processo'}</p>
                    <p className="text-sm text-gray-600">{item.court || 'Comarca não especificada'}</p>
                    <p className="text-xs text-gray-500 mt-1">Tipo: {item.processType || 'N/A'} • Análise: {item.analysisType || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.priority === 'urgente' ? 'bg-red-100 text-red-800' :
                      item.priority === 'alta' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.priority || 'Normal'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-2">Nova Análise de Processo</h3>
            <p className="text-gray-600 mb-6">Preencha os dados para análise processual</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número do Processo*</label>
                  <input type="text" required value={formData.processNumber} onChange={(e) => setFormData({...formData, processNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" placeholder="Ex: 0001234-56.2024.8.26.0100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Processo*</label>
                  <select required value={formData.processType} onChange={(e) => setFormData({...formData, processType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                    <option value="">Selecione...</option>
                    <option value="civil">Cível</option>
                    <option value="criminal">Criminal</option>
                    <option value="trabalhista">Trabalhista</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Comarca*</label>
                  <input type="text" required value={formData.court} onChange={(e) => setFormData({...formData, court: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" placeholder="Ex: São Paulo - Capital" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Análise*</label>
                  <select required value={formData.analysisType} onChange={(e) => setFormData({...formData, analysisType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                    <option value="">Selecione...</option>
                    <option value="completa">Completa</option>
                    <option value="preliminar">Preliminar</option>
                    <option value="pericial">Pericial</option>
                    <option value="documental">Documental</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prioridade*</label>
                  <select required value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                    <option value="">Selecione...</option>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prazo*</label>
                  <input type="date" required value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="button" onClick={() => { setShowModal(false); setFormData({ processNumber: '', processType: '', court: '', analysisType: '', priority: '', deadline: '' }); }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold" disabled={loading}>Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 font-semibold" disabled={loading}>{loading ? 'Criando...' : 'Criar Análise'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UniversalModuleLayout>
  );
};

export default ProcessAnalysisComplete;