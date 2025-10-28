import React, { useState, useEffect } from 'react';
import { Microscope, Upload, FileText, Search, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Forensics = () => {
  const [analyses, setAnalyses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'hardware',
    device_description: '',
    case_id: '',
    priority: 'medium',
    notes: ''
  });

  const analysisTypes = ['hardware', 'software', 'network', 'mobile', 'cloud', 'memory'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/athena/forensics/analyses`);
      setAnalyses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast.error('Erro ao carregar análises');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${BACKEND_URL}/api/athena/forensics/analyses`, {
        ...formData,
        status: 'pending'
      });
      
      toast.success('Análise forense criada com sucesso!');
      setShowModal(false);
      setFormData({
        title: '',
        type: 'hardware',
        device_description: '',
        case_id: '',
        priority: 'medium',
        notes: ''
      });
      fetchAnalyses();
    } catch (error) {
      console.error('Error creating analysis:', error);
      toast.error('Erro ao criar análise forense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModuleLayout
      title="Perícia Digital"
      subtitle="Análise forense especializada"
      icon={Microscope}
      headerAction={
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-full md:w-auto"
        >
          Nova Análise
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total</p>
              <FileText className="w-5 h-5 text-teal-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analyses.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Em Andamento</p>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {analyses.filter(a => a.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Concluídas</p>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {analyses.filter(a => a.status === 'completed').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Análises Forenses</h2>
          {analyses.length === 0 ? (
            <div className="text-center py-12">
              <Microscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma análise forense cadastrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900">{analysis.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{analysis.device_description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Nova Análise Forense</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Título da Análise*</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ex: Análise de Disco HD Samsung 500GB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Análise*</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="hardware">HARDWARE - Dispositivos físicos</option>
                    <option value="software">SOFTWARE - Aplicações e logs</option>
                    <option value="network">NETWORK - Tráfego de rede</option>
                    <option value="mobile">MOBILE - Smartphones e tablets</option>
                    <option value="cloud">CLOUD - Armazenamento em nuvem</option>
                    <option value="memory">MEMORY - Análise de memória RAM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição do Dispositivo/Evidência*</label>
                  <textarea
                    required
                    value={formData.device_description}
                    onChange={(e) => setFormData({...formData, device_description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows="3"
                    placeholder="Descreva o dispositivo ou evidência a ser analisada..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ID do Caso (Opcional)</label>
                  <input
                    type="text"
                    value={formData.case_id}
                    onChange={(e) => setFormData({...formData, case_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Ex: CASO-2025-0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="low">BAIXA - Análise de rotina</option>
                    <option value="medium">MÉDIA - Análise padrão</option>
                    <option value="high">ALTA - Análise prioritária</option>
                    <option value="urgent">URGENTE - Análise imediata</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Observações Adicionais</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows="2"
                    placeholder="Informações relevantes sobre a análise..."
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Criando...' : 'Criar Análise'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
                  <label className="block text-sm font-medium mb-1">ID do Caso</label>
                  <input
                    type="text"
                    value={formData.case_id}
                    onChange={(e) => setFormData({...formData, case_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Criar
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