import React, { useState, useEffect } from 'react';
import { Package, Plus, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const EvidenceProcessing = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    evidenceName: '',
    evidenceType: '',
    caseNumber: '',
    description: '',
    collectionDate: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/athena/evidence/list`);
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
      await axios.post(`${BACKEND_URL}/api/athena/evidence/create`, {
        collection: 'evidence',
        data: formData
      });
      
      toast.success('Evidência criada com sucesso!');
      setShowModal(false);
      setFormData({
        evidenceName: '',
        evidenceType: '',
        caseNumber: '',
        description: '',
        collectionDate: ''
      });
      fetchItems();
    } catch (error) {
      console.error('Erro ao criar item:', error);
      toast.error('Erro ao criar evidência');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModuleLayout
      title="Processamento de Evidências"
      subtitle="Gerenciamento e análise de evidências digitais"
      icon={Package}
      headerAction={
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Evidência
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total</p>
              <p className="text-3xl font-bold mt-1">{items.length}</p>
            </div>
            <Package size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Processadas</p>
              <p className="text-3xl font-bold mt-1">{items.filter(i => i.status === 'processed').length}</p>
            </div>
            <CheckCircle size={40} className="opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pendentes</p>
              <p className="text-3xl font-bold mt-1">{items.filter(i => i.status === 'pending').length}</p>
            </div>
            <AlertTriangle size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Evidências Registradas</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchItems}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhuma evidência registrada</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Registrar Primeira Evidência
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">{item.evidenceName || 'Evidência'}</p>
                    <p className="text-sm text-gray-600">{item.caseNumber || 'Caso não especificado'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tipo: {item.evidenceType || 'Não especificado'} • Data: {item.collectionDate || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'processed' ? 'bg-green-100 text-green-800' :
                      item.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'processed' ? 'Processada' :
                       item.status === 'pending' ? 'Pendente' : 'Aguardando'}
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
            <h3 className="text-2xl font-bold mb-2">Nova Evidência</h3>
            <p className="text-gray-600 mb-6">Registre uma nova evidência digital</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Evidência*</label>
                  <input
                    type="text"
                    required
                    value={formData.evidenceName}
                    onChange={(e) => setFormData({...formData, evidenceName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Evidência_001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Evidência*</label>
                  <select
                    required
                    value={formData.evidenceType}
                    onChange={(e) => setFormData({...formData, evidenceType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="digital">Digital</option>
                    <option value="physical">Física</option>
                    <option value="document">Documento</option>
                    <option value="media">Mídia</option>
                    <option value="network">Rede</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Número do Caso*</label>
                  <input
                    type="text"
                    required
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: CASO-2024-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Coleta*</label>
                  <input
                    type="date"
                    required
                    value={formData.collectionDate}
                    onChange={(e) => setFormData({...formData, collectionDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva a evidência..."
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      evidenceName: '',
                      evidenceType: '',
                      caseNumber: '',
                      description: '',
                      collectionDate: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Registrar Evidência'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </UniversalModuleLayout>
  );
};

export default EvidenceProcessing;