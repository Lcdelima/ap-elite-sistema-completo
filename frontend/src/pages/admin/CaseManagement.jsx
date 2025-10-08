import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign,
  Users, 
  Clock, 
  AlertCircle,
  CheckCircle,
  FileText,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CaseManagement = ({ currentUser }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.get(`${API}/cases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Erro ao carregar casos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { label: 'Ativo', className: 'bg-green-500', icon: CheckCircle },
      'completed': { label: 'Concluído', className: 'bg-blue-500', icon: CheckCircle },
      'suspended': { label: 'Suspenso', className: 'bg-yellow-500', icon: Clock },
      'cancelled': { label: 'Cancelado', className: 'bg-red-500', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || statusConfig['active'];
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.className} text-white flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'low': { label: 'Baixa', className: 'bg-gray-500' },
      'normal': { label: 'Normal', className: 'bg-blue-500' },
      'high': { label: 'Alta', className: 'bg-orange-500' },
      'urgent': { label: 'Urgente', className: 'bg-red-500' }
    };
    
    const config = priorityConfig[priority] || priorityConfig['normal'];
    
    return (
      <Badge className={`${config.className} text-white`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const filteredCases = cases.filter(case_item => {
    const matchesSearch = case_item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_item.case_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || case_item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const updateCaseStatus = async (caseId, newStatus) => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      await axios.put(`${API}/cases/${caseId}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await fetchCases();
      toast.success('Status do caso atualizado com sucesso');
    } catch (error) {
      console.error('Error updating case status:', error);
      toast.error('Erro ao atualizar status do caso');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white">Carregando casos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Casos</h1>
          <p className="text-slate-400">Gerencie todos os casos e processos</p>
        </div>
        <Button 
          className="btn-primary flex items-center space-x-2"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Novo Caso</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total de Casos</p>
                <p className="text-2xl font-bold text-white">{cases.length}</p>
              </div>
              <FileText className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Casos Ativos</p>
                <p className="text-2xl font-bold text-green-400">
                  {cases.filter(c => c.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Casos Urgentes</p>
                <p className="text-2xl font-bold text-red-400">
                  {cases.filter(c => c.priority === 'urgent').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Receita Total</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {formatCurrency(cases.reduce((sum, c) => sum + (c.fee || 0), 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar casos por título ou número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white px-3 py-2 rounded-md"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="completed">Concluídos</option>
                <option value="suspended">Suspensos</option>
                <option value="cancelled">Cancelados</option>
              </select>
              
              <Button variant="outline" className="btn-secondary">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Lista de Casos ({filteredCases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCases.map((case_item) => (
              <div key={case_item.id} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-white font-semibold">{case_item.title}</h3>
                      <Badge className="bg-slate-600 text-white">{case_item.case_number}</Badge>
                      {getStatusBadge(case_item.status)}
                      {getPriorityBadge(case_item.priority)}
                    </div>
                    
                    <p className="text-slate-300 text-sm mb-3">{case_item.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Tipo de Serviço:</span>
                        <p className="text-white">{case_item.service_type}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Data de Início:</span>
                        <p className="text-white">{formatDate(case_item.start_date)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Evidências:</span>
                        <p className="text-white">{case_item.evidence_count || 0} itens</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Valor:</span>
                        <p className="text-white">{formatCurrency(case_item.fee)}</p>
                      </div>
                    </div>
                    
                    {case_item.estimated_completion && (
                      <div className="mt-2">
                        <span className="text-slate-400 text-sm">Previsão de conclusão:</span>
                        <p className="text-cyan-400 text-sm">{formatDate(case_item.estimated_completion)}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-slate-300 border-slate-600"
                      onClick={() => setSelectedCase(case_item)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-slate-300 border-slate-600"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    {case_item.status === 'active' && (
                      <select
                        onChange={(e) => updateCaseStatus(case_item.id, e.target.value)}
                        className="bg-slate-600 border-slate-500 text-white px-2 py-1 rounded text-xs"
                        defaultValue=""
                      >
                        <option value="" disabled>Alterar Status</option>
                        <option value="completed">Concluir</option>
                        <option value="suspended">Suspender</option>
                        <option value="cancelled">Cancelar</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {filteredCases.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Nenhum caso encontrado com os filtros aplicados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{selectedCase.title}</h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCase(null)}
                  className="text-slate-300 border-slate-600"
                >
                  Fechar
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Informações do Caso</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400">Número do Caso:</span>
                      <p className="text-white">{selectedCase.case_number}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Tipo de Serviço:</span>
                      <p className="text-white">{selectedCase.service_type}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <div className="mt-1">{getStatusBadge(selectedCase.status)}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Prioridade:</span>
                      <div className="mt-1">{getPriorityBadge(selectedCase.priority)}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400">Data de Início:</span>
                      <p className="text-white">{formatDate(selectedCase.start_date)}</p>
                    </div>
                    {selectedCase.estimated_completion && (
                      <div>
                        <span className="text-slate-400">Previsão de Conclusão:</span>
                        <p className="text-white">{formatDate(selectedCase.estimated_completion)}</p>
                      </div>
                    )}
                    {selectedCase.completion_date && (
                      <div>
                        <span className="text-slate-400">Data de Conclusão:</span>
                        <p className="text-white">{formatDate(selectedCase.completion_date)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Descrição</h3>
                <p className="text-slate-300">{selectedCase.description}</p>
              </div>
              
              {selectedCase.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Observações</h3>
                  <p className="text-slate-300">{selectedCase.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagement;