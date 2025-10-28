import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, Filter, Eye, FileText, Calendar, User } from 'lucide-react';
import AthenaLayout from '../../components/AthenaLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Processes = () => {
  const [processes, setProcesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    client_name: '',
    court: '',
    status: 'active',
    priority: 'medium',
    description: ''
  });

  const statuses = ['active', 'pending', 'suspended', 'archived', 'completed'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/athena/processes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProcesses(data.processes || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert('Processo criado! (Backend em desenvolvimento)');
    setShowModal(false);
  };

  const filteredProcesses = processes.filter(p => {
    const matchSearch = p.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      suspended: 'bg-orange-100 text-orange-700',
      archived: 'bg-gray-100 text-gray-700',
      completed: 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  };

  return (
    <AthenaLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-slate-700 to-gray-800 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Briefcase className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold mb-1">Gestão de Processos</h1>
                <p className="text-slate-200">Gerenciamento completo de processos jurídicos</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Processo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{processes.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Ativos</p>
            <p className="text-3xl font-bold text-green-600">
              {processes.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Pendentes</p>
            <p className="text-3xl font-bold text-yellow-600">
              {processes.filter(p => p.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Concluídos</p>
            <p className="text-3xl font-bold text-blue-600">
              {processes.filter(p => p.status === 'completed').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número, título ou cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Todos os status</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="p-6">
            {filteredProcesses.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum processo encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProcesses.map((process) => (
                  <div key={process.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{process.number}</h3>
                          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(process.status)}`}>
                            {process.status?.toUpperCase()}
                          </span>
                          <span className={`text-sm font-medium ${getPriorityColor(process.priority)}`}>
                            ●
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{process.title}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {process.client_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {process.court || 'N/A'}
                          </span>
                          {process.created_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(process.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Novo Processo</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Número do Processo*</label>
                    <input
                      type="text"
                      required
                      value={formData.number}
                      onChange={(e) => setFormData({...formData, number: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="0000000-00.0000.0.00.0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cliente*</label>
                    <input
                      type="text"
                      required
                      value={formData.client_name}
                      onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                      placeholder="Nome do cliente"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Título/Assunto*</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Ação de Cobrança, Investigação Criminal..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tribunal/Vara</label>
                  <input
                    type="text"
                    value={formData.court}
                    onChange={(e) => setFormData({...formData, court: e.target.value})}
                    placeholder="Ex: 1ª Vara Cível - São Paulo"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                    </select>
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
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descreva os detalhes do processo, partes envolvidas, pedidos principais..."
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
                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
                  >
                    Criar Processo
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

export default Processes;