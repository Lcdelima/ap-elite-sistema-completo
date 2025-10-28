import React, { useState, useEffect } from 'react';
import { Shield, Plus, AlertTriangle, CheckCircle, FileSearch } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Forensics = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    examTitle: '',
    caseNumber: '',
    deviceInfo: '',
    examType: '',
    priority: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/athena/forensics/list`);
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
      await axios.post(`${BACKEND_URL}/api/athena/forensics/create`, {
        collection: 'forensics',
        data: formData
      });
      
      toast.success('Exame pericial criado com sucesso!');
      setShowModal(false);
      setFormData({
        examTitle: '',
        caseNumber: '',
        deviceInfo: '',
        examType: '',
        priority: ''
      });
      fetchItems();
    } catch (error) {
      console.error('Erro ao criar item:', error);
      toast.error('Erro ao criar exame');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModuleLayout
      title="Perícia Digital"
      subtitle="Análise forense avançada de dispositivos"
      icon={Shield}
      headerAction={
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Exame
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total</p>
              <p className="text-3xl font-bold mt-1">{items.length}</p>
            </div>
            <Shield size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Concluídos</p>
              <p className="text-3xl font-bold mt-1">{items.filter(i => i.status === 'completed').length}</p>
            </div>
            <CheckCircle size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Urgentes</p>
              <p className="text-3xl font-bold mt-1">{items.filter(i => i.priority === 'urgente').length}</p>
            </div>
            <AlertTriangle size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Exames Periciais</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchItems}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Tentar Novamente
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <FileSearch size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhum exame pericial registrado</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Criar Primeiro Exame
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{item.examTitle || 'Exame Pericial'}</p>
                    <p className="text-sm text-gray-600">{item.caseNumber || 'Caso não especificado'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.deviceInfo || 'Dispositivo não especificado'} • Tipo: {item.examType || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.priority === 'urgente' ? 'bg-red-100 text-red-800' :
                      item.priority === 'alta' ? 'bg-orange-100 text-orange-800' :
                      item.priority === 'média' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.priority || 'Normal'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'completed' ? 'Concluído' :
                       item.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                    </span>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-2">Novo Exame Pericial</h3>
            <p className="text-gray-600 mb-6">Inicie um novo exame de perícia digital</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título do Exame*</label>
                <input
                  type="text"
                  required
                  value={formData.examTitle}
                  onChange={(e) => setFormData({...formData, examTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Exame Pericial 001/2024"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número do Caso*</label>
                  <input
                    type="text"
                    required
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: CASO-2024-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Informações do Dispositivo*</label>
                  <input
                    type="text"
                    required
                    value={formData.deviceInfo}
                    onChange={(e) => setFormData({...formData, deviceInfo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Samsung Galaxy S21"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Exame*</label>
                  <select
                    required
                    value={formData.examType}
                    onChange={(e) => setFormData({...formData, examType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="completo">Completo</option>
                    <option value="parcial">Parcial</option>
                    <option value="emergencial">Emergencial</option>
                    <option value="remoto">Remoto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prioridade*</label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="baixa">Baixa</option>
                    <option value="média">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      examTitle: '',
                      caseNumber: '',
                      deviceInfo: '',
                      examType: '',
                      priority: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Criando Exame...' : 'Criar Exame'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UniversalModuleLayout>
  );
};

export default Forensics;