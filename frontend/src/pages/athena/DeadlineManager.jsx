import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AthenaLayout from '@/components/AthenaLayout';
import {
  Clock, AlertCircle, CheckCircle, Calendar, Plus, X, Bell,
  FileText, User, Building, Filter, Download, RefreshCw,
  ChevronRight, Zap, Archive, Eye, Edit, Trash2, CheckSquare
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const DeadlineManager = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, d-3, d-1, overdue, completed
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    processNumber: '',
    processTitle: '',
    client: '',
    court: '',
    type: 'petition', // petition, appeal, manifestation, hearing
    deadline: '',
    description: '',
    responsible: 'advogada',
    priority: 'high',
    documents: [],
    autoAlerts: true,
    alertD3: true,
    alertD1: true,
    notes: ''
  });

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const fetchDeadlines = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/deadlines`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDeadlines(res.data.deadlines || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      // Mock data
      setDeadlines([
        {
          id: '1',
          processNumber: '1234567-89.2024.8.26.0100',
          processTitle: 'Ação de Cobrança',
          client: 'João Silva',
          court: 'TJSP - 1ª Vara Cível',
          type: 'petition',
          deadline: '2025-10-18',
          daysUntil: 3,
          description: 'Contestação',
          responsible: 'advogada',
          priority: 'high',
          status: 'd-3',
          alerts: { d3: true, d1: true },
          completed: false
        },
        {
          id: '2',
          processNumber: '9876543-21.2024.8.26.0200',
          processTitle: 'Investigação Criminal',
          client: 'Maria Santos',
          court: 'TJSP - 2ª Vara Criminal',
          type: 'appeal',
          deadline: '2025-10-16',
          daysUntil: 1,
          description: 'Recurso em Sentido Estrito',
          responsible: 'advogada',
          priority: 'critical',
          status: 'd-1',
          alerts: { d3: true, d1: true },
          completed: false
        },
        {
          id: '3',
          processNumber: '5555555-55.2024.8.26.0300',
          processTitle: 'Ação Trabalhista',
          client: 'Pedro Costa',
          court: 'TRT - 2ª Região',
          type: 'manifestation',
          deadline: '2025-10-14',
          daysUntil: -1,
          description: 'Manifestação sobre laudo',
          responsible: 'advogada',
          priority: 'high',
          status: 'overdue',
          alerts: { d3: true, d1: true },
          completed: false
        }
      ]);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.post(
        `${BACKEND_URL}/api/athena/deadlines`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Prazo cadastrado com sucesso!');
      setShowModal(false);
      fetchDeadlines();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao cadastrar prazo');
    }
  };

  const resetForm = () => {
    setFormData({
      processNumber: '', processTitle: '', client: '', court: '',
      type: 'petition', deadline: '', description: '', responsible: 'advogada',
      priority: 'high', documents: [], autoAlerts: true, alertD3: true,
      alertD1: true, notes: ''
    });
  };

  const markAsCompleted = async (id) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      await axios.patch(
        `${BACKEND_URL}/api/athena/deadlines/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Prazo marcado como concluído!');
      fetchDeadlines();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao atualizar prazo');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      'd-3': { color: 'bg-yellow-500', text: 'D-3', icon: Bell },
      'd-1': { color: 'bg-orange-500', text: 'D-1', icon: AlertCircle },
      'overdue': { color: 'bg-red-500', text: 'Vencido', icon: AlertCircle },
      'completed': { color: 'bg-green-500', text: 'Concluído', icon: CheckCircle }
    };
    
    const { color, text, icon: Icon } = config[status] || config['d-3'];
    
    return (
      <Badge className={`${color} text-white flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{text}</span>
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      critical: 'bg-red-600',
      high: 'bg-orange-600',
      medium: 'bg-blue-600',
      low: 'bg-gray-600'
    };
    
    return (
      <Badge className={`${colors[priority]} text-white text-xs`}>
        {priority === 'critical' ? 'Crítico' :
         priority === 'high' ? 'Alto' :
         priority === 'medium' ? 'Médio' : 'Baixo'}
      </Badge>
    );
  };

  const getTypeLabel = (type) => {
    const labels = {
      petition: 'Petição',
      appeal: 'Recurso',
      manifestation: 'Manifestação',
      hearing: 'Audiência'
    };
    return labels[type] || type;
  };

  const filteredDeadlines = deadlines.filter(d => {
    const matchFilter = filter === 'all' || d.status === filter;
    const matchSearch = !searchTerm ||
      d.processNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.processTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchFilter && matchSearch;
  });

  const stats = {
    total: deadlines.length,
    d3: deadlines.filter(d => d.status === 'd-3').length,
    d1: deadlines.filter(d => d.status === 'd-1').length,
    overdue: deadlines.filter(d => d.status === 'overdue').length,
    completed: deadlines.filter(d => d.completed).length
  };

  return (
    <AthenaLayout title="Gestão de Prazos" subtitle="Controle D-3 e D-1 - Dupla checagem obrigatória">
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">D-3</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.d3}</p>
                </div>
                <Bell className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">D-1</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.d1}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-500/20 border-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-200">Vencidos</p>
                  <p className="text-2xl font-bold text-red-400">{stats.overdue}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/20 border-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-200">Concluídos</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {['all', 'd-3', 'd-1', 'overdue', 'completed'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      filter === f
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {f === 'all' ? 'Todos' :
                     f === 'd-3' ? 'D-3' :
                     f === 'd-1' ? 'D-1' :
                     f === 'overdue' ? 'Vencidos' : 'Concluídos'}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por processo, cliente..."
                  className="flex-1 md:w-64 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all font-semibold whitespace-nowrap"
                >
                  <Plus className="h-5 w-5" />
                  <span>Novo Prazo</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deadlines List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-cyan-400" />
              Prazos Processuais
            </h3>

            {loading ? (
              <div className="text-center py-12 text-slate-400">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin" />
                <p>Carregando prazos...</p>
              </div>
            ) : filteredDeadlines.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum prazo encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className={`p-4 rounded-lg border-l-4 transition-all ${
                      deadline.status === 'overdue'
                        ? 'bg-red-900/20 border-red-500'
                        : deadline.status === 'd-1'
                        ? 'bg-orange-900/20 border-orange-500'
                        : deadline.status === 'd-3'
                        ? 'bg-yellow-900/20 border-yellow-500'
                        : 'bg-green-900/20 border-green-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-bold text-white">
                            {deadline.processTitle}
                          </h4>
                          {getStatusBadge(deadline.status)}
                          {getPriorityBadge(deadline.priority)}
                          <Badge className="bg-slate-600 text-white text-xs">
                            {getTypeLabel(deadline.type)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-slate-300 mb-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-cyan-400" />
                            <span>{deadline.processNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-cyan-400" />
                            <span>{deadline.client}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-cyan-400" />
                            <span>{deadline.court}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-cyan-400" />
                            <span>{new Date(deadline.deadline).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-400">
                          {deadline.description}
                        </p>

                        {deadline.alerts && (
                          <div className="flex items-center space-x-2 mt-2">
                            {deadline.alerts.d3 && (
                              <Badge className="bg-yellow-500 text-white text-xs">
                                <Bell className="h-3 w-3 mr-1" />
                                Alerta D-3
                              </Badge>
                            )}
                            {deadline.alerts.d1 && (
                              <Badge className="bg-orange-500 text-white text-xs">
                                <Bell className="h-3 w-3 mr-1" />
                                Alerta D-1
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!deadline.completed && (
                          <button
                            onClick={() => markAsCompleted(deadline.id)}
                            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                            title="Marcar como concluído"
                          >
                            <CheckSquare className="h-4 w-4 text-white" />
                          </button>
                        )}
                        <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                          <Eye className="h-4 w-4 text-white" />
                        </button>
                        <button className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors">
                          <Edit className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal - Novo Prazo */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Clock className="h-6 w-6 mr-3 text-cyan-400" />
                  Novo Prazo Processual
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Número do Processo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.processNumber}
                      onChange={(e) => setFormData({...formData, processNumber: e.target.value})}
                      placeholder="0000000-00.0000.0.00.0000"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.client}
                      onChange={(e) => setFormData({...formData, client: e.target.value})}
                      placeholder="Nome do cliente"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Título/Assunto do Processo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.processTitle}
                      onChange={(e) => setFormData({...formData, processTitle: e.target.value})}
                      placeholder="Ex: Ação de Cobrança, Recurso Criminal..."
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tribunal/Vara *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.court}
                      onChange={(e) => setFormData({...formData, court: e.target.value})}
                      placeholder="Ex: TJSP - 1ª Vara Cível"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tipo de Prazo *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="petition">Petição</option>
                      <option value="appeal">Recurso</option>
                      <option value="manifestation">Manifestação</option>
                      <option value="hearing">Audiência</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Data Limite *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Prioridade *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="critical">Crítico</option>
                      <option value="high">Alto</option>
                      <option value="medium">Médio</option>
                      <option value="low">Baixo</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Descrição/Objeto *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Ex: Contestação, Réplica, Alegações Finais..."
                      rows="2"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Alertas Automáticos
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.alertD3}
                          onChange={(e) => setFormData({...formData, alertD3: e.target.checked})}
                          className="w-5 h-5 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                        />
                        <span className="text-slate-300">Alerta D-3 (3 dias antes)</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.alertD1}
                          onChange={(e) => setFormData({...formData, alertD1: e.target.checked})}
                          className="w-5 h-5 text-cyan-600 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500"
                        />
                        <span className="text-slate-300">Alerta D-1 (1 dia antes)</span>
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Observações
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Informações adicionais sobre o prazo..."
                      rows="2"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all font-semibold"
                  >
                    Cadastrar Prazo
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

export default DeadlineManager;
