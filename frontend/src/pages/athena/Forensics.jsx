import React, { useState, useEffect } from 'react';
import { Microscope, Upload, FileText, Search, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import AthenaLayout from '../../components/AthenaLayout';
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
    <AthenaLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Microscope className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold mb-1">Perícia Digital</h1>
                <p className="text-teal-100">Análise forense especializada</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Nova Análise
            </button>
          </div>
        </div>

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
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Nova Análise Forense</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título*</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Análise*</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {analysisTypes.map(type => (
                      <option key={type} value={type}>
                        {type.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição do Dispositivo*</label>
                  <textarea
                    required
                    value={formData.device_description}
                    onChange={(e) => setFormData({...formData, device_description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {priorities.map(p => (
                      <option key={p} value={p}>{p.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div>
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
      </div>
    </AthenaLayout>
  );
};

export default Forensics;