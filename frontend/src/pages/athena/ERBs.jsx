import React, { useState, useEffect } from 'react';
import { Radio, MapPin, Plus, Search, Filter, Download, Eye } from 'lucide-react';
import AthenaLayout from '../../components/AthenaLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const ERBs = () => {
  const [erbs, setErbs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    erb_id: '',
    operator: 'VIVO',
    latitude: '',
    longitude: '',
    address: '',
    case_id: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const operators = ['VIVO', 'CLARO', 'TIM', 'OI', 'ALGAR'];

  useEffect(() => {
    fetchERBs();
    fetchStats();
  }, []);

  const fetchERBs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/erbs/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setErbs(data.erbs || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStats = async () => {
    setStats({
      total_erbs: 0,
      total_operators: 5,
      total_cases: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/erbs/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("ERB adicionada com sucesso!");
        setShowModal(false);
        setFormData({
          erb_id: '', operator: 'VIVO', latitude: '', longitude: '',
          address: '', case_id: '', date: new Date().toISOString().split('T')[0], notes: ''
        });
        fetchERBs();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.success("Erro ao adicionar ERB");
    }
  };

  const filteredERBs = erbs.filter(erb => 
    erb.erb_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    erb.operator?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    erb.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AthenaLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Radio className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold mb-1">ERBs - Estações Rádio Base</h1>
                <p className="text-orange-100">Gestão de antenas e localização celular</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nova ERB
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total de ERBs</p>
              <Radio className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{erbs.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Operadoras</p>
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.total_operators || 5}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Casos Vinculados</p>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.total_cases || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar ERB por ID, operadora ou endereço..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>

          <div className="p-6">
            {filteredERBs.length === 0 ? (
              <div className="text-center py-12">
                <Radio className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma ERB cadastrada</p>
                <p className="text-sm text-gray-500 mt-2">Adicione ERBs para rastreamento e análise</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID ERB</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operadora</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Localização</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coordenadas</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredERBs.map((erb) => (
                      <tr key={erb.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{erb.erb_id}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700">
                            {erb.operator}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{erb.address || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {erb.latitude && erb.longitude 
                            ? `${erb.latitude}, ${erb.longitude}`
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {erb.date ? new Date(erb.date).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Ver Mapa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Nova ERB</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ID da ERB*</label>
                    <input
                      type="text"
                      required
                      value={formData.erb_id}
                      onChange={(e) => setFormData({...formData, erb_id: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Ex: ERB123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Operadora*</label>
                    <select
                      value={formData.operator}
                      onChange={(e) => setFormData({...formData, operator: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      {operators.map(op => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Latitude</label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="-23.5505"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Longitude</label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="-46.6333"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Endereço</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium mb-1">Data*</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
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
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Adicionar ERB
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

export default ERBs;