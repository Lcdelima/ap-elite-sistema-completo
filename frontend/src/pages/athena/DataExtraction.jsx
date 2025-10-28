import React, { useState, useEffect } from 'react';
import { HardDrive, Upload, Download, Search, CheckCircle, Clock, Database } from 'lucide-react';
import AthenaLayout from '../../components/AthenaLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const DataExtraction = () => {
  const [extractions, setExtractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    device_type: 'smartphone',
    device_model: '',
    imei: '',
    case_id: '',
    extraction_tool: 'UFED',
    notes: ''
  });

  const deviceTypes = ['smartphone', 'tablet', 'computer', 'hd_externo', 'pendrive', 'cartao_sd'];
  const extractionTools = ['UFED', 'XRY', 'Oxygen', 'MOBILedit', 'Magnet AXIOM', 'FTK Imager'];

  useEffect(() => {
    fetchExtractions();
    fetchStats();
  }, []);

  const fetchExtractions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/data-extraction/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setExtractions(data.extractions || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStats = async () => {
    setStats({
      total: 0,
      completed: 0,
      in_progress: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/data-extraction/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Extração criada com sucesso!");
        setShowModal(false);
        setFormData({
          device_type: 'smartphone', device_model: '', imei: '',
          case_id: '', extraction_tool: 'UFED', notes: ''
        });
        fetchExtractions();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <AthenaLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <HardDrive className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold mb-1">Extração de Dados</h1>
                <p className="text-purple-100">Extração forense de dispositivos e mídias</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Nova Extração
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total</p>
              <Database className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{extractions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Em Progresso</p>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {extractions.filter(e => e.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Concluídas</p>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {extractions.filter(e => e.status === 'completed').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Extrações em Andamento</h2>
          {extractions.length === 0 ? (
            <div className="text-center py-12">
              <HardDrive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma extração cadastrada</p>
              <p className="text-sm text-gray-500 mt-2">Crie uma nova extração para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {extractions.map((extraction) => (
                <div key={extraction.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {extraction.device_model || extraction.device_type}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Ferramenta: {extraction.extraction_tool} • IMEI: {extraction.imei || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Caso: {extraction.case_id || 'N/A'} • 
                        Criado: {new Date(extraction.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm ${
                      extraction.status === 'completed' ? 'bg-green-100 text-green-700' :
                      extraction.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {extraction.status === 'completed' ? 'Concluída' :
                       extraction.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
                    </span>
                  </div>
                  {extraction.progress !== undefined && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${extraction.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Nova Extração de Dados</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Dispositivo*</label>
                  <select
                    value={formData.device_type}
                    onChange={(e) => setFormData({...formData, device_type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    {deviceTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Modelo do Dispositivo*</label>
                  <input
                    type="text"
                    required
                    value={formData.device_model}
                    onChange={(e) => setFormData({...formData, device_model: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: iPhone 13 Pro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">IMEI/Serial</label>
                  <input
                    type="text"
                    value={formData.imei}
                    onChange={(e) => setFormData({...formData, imei: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ferramenta de Extração*</label>
                  <select
                    value={formData.extraction_tool}
                    onChange={(e) => setFormData({...formData, extraction_tool: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    {extractionTools.map(tool => (
                      <option key={tool} value={tool}>{tool}</option>
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
                <div>
                  <label className="block text-sm font-medium mb-1">Observações</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="3"
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
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Criar Extração
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

export default DataExtraction;