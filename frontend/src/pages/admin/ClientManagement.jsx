import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Mail, 
  Phone, 
  Calendar,
  FileText, 
  User, 
  Building,
  MapPin,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ClientManagement = ({ currentUser }) => {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchCases();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const clientUsers = response.data.filter(user => user.role === 'client');
      setClients(clientUsers);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.get(`${API}/cases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const getClientCases = (clientId) => {
    return cases.filter(case_item => case_item.client_id === clientId);
  };

  const getClientStats = (clientId) => {
    const clientCases = getClientCases(clientId);
    return {
      totalCases: clientCases.length,
      activeCases: clientCases.filter(c => c.status === 'active').length,
      completedCases: clientCases.filter(c => c.status === 'completed').length,
      totalValue: clientCases.reduce((sum, c) => sum + (c.fee || 0), 0)
    };
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

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white">Carregando clientes...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Clientes</h1>
          <p className="text-slate-400">Gerencie informações e histórico dos clientes</p>
        </div>
        <Button 
          className="btn-primary flex items-center space-x-2"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Novo Cliente</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total de Clientes</p>
                <p className="text-2xl font-bold text-white">{clients.length}</p>
              </div>
              <User className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Clientes Ativos</p>
                <p className="text-2xl font-bold text-green-400">
                  {clients.filter(c => c.active).length}
                </p>
              </div>
              <Building className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Novos este Mês</p>
                <p className="text-2xl font-bold text-blue-400">
                  {clients.filter(c => {
                    const created = new Date(c.created_at);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Receita Total</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {formatCurrency(
                    clients.reduce((sum, client) => {
                      const stats = getClientStats(client.id);
                      return sum + stats.totalValue;
                    }, 0)
                  )}
                </p>
              </div>
              <FileText className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar clientes por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const stats = getClientStats(client.id);
          return (
            <Card key={client.id} className="bg-slate-800 border-slate-700 card-hover">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 bg-cyan-500">
                    <AvatarFallback className="bg-cyan-500 text-white font-semibold">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">{client.name}</CardTitle>
                    <p className="text-slate-400 text-sm">{client.email}</p>
                  </div>
                  <Badge className={client.active ? 'bg-green-500' : 'bg-red-500'}>
                    {client.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {client.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">{client.phone}</span>
                    </div>
                  )}
                  
                  {client.address && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">{client.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">Cliente desde {formatDate(client.created_at)}</span>
                  </div>
                  
                  {/* Client Stats */}
                  <div className="bg-slate-700 p-3 rounded-lg mt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">{stats.totalCases}</p>
                        <p className="text-slate-400">Total Casos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{stats.activeCases}</p>
                        <p className="text-slate-400">Ativos</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-600">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-white">{formatCurrency(stats.totalValue)}</p>
                        <p className="text-slate-400 text-xs">Valor Total Contratado</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      size="sm" 
                      className="flex-1 btn-primary"
                      onClick={() => setSelectedClient(client)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Detalhes
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="btn-secondary"
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="btn-secondary"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredClients.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-400">Nenhum cliente encontrado</p>
          </CardContent>
        </Card>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 bg-cyan-500">
                    <AvatarFallback className="bg-cyan-500 text-white font-semibold text-xl">
                      {getInitials(selectedClient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
                    <p className="text-slate-400">{selectedClient.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedClient(null)}
                  className="text-slate-300 border-slate-600"
                >
                  Fechar
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client Info */}
                <div className="lg:col-span-1">
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white">Informações do Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <span className="text-slate-400">Nome:</span>
                        <p className="text-white">{selectedClient.name}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">E-mail:</span>
                        <p className="text-white">{selectedClient.email}</p>
                      </div>
                      {selectedClient.phone && (
                        <div>
                          <span className="text-slate-400">Telefone:</span>
                          <p className="text-white">{selectedClient.phone}</p>
                        </div>
                      )}
                      {selectedClient.cpf && (
                        <div>
                          <span className="text-slate-400">CPF:</span>
                          <p className="text-white">{selectedClient.cpf}</p>
                        </div>
                      )}
                      {selectedClient.address && (
                        <div>
                          <span className="text-slate-400">Endereço:</span>
                          <p className="text-white">{selectedClient.address}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400">Cliente desde:</span>
                        <p className="text-white">{formatDate(selectedClient.created_at)}</p>
                      </div>
                      {selectedClient.last_login && (
                        <div>
                          <span className="text-slate-400">Último acesso:</span>
                          <p className="text-white">{formatDate(selectedClient.last_login)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Client Cases */}
                <div className="lg:col-span-2">
                  <Card className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white">Casos do Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getClientCases(selectedClient.id).map((case_item) => (
                          <div key={case_item.id} className="bg-slate-600 p-4 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold">{case_item.title}</h4>
                                <p className="text-slate-300 text-sm mt-1">{case_item.service_type}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm">
                                  <span className="text-slate-400">Início: {formatDate(case_item.start_date)}</span>
                                  <Badge className={`${
                                    case_item.status === 'active' ? 'bg-green-500' :
                                    case_item.status === 'completed' ? 'bg-blue-500' :
                                    case_item.status === 'suspended' ? 'bg-yellow-500' : 'bg-red-500'
                                  } text-white`}>
                                    {case_item.status === 'active' ? 'Ativo' :
                                     case_item.status === 'completed' ? 'Concluído' :
                                     case_item.status === 'suspended' ? 'Suspenso' : 'Cancelado'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-semibold">{formatCurrency(case_item.fee)}</p>
                                <p className="text-slate-400 text-sm">{case_item.case_number}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {getClientCases(selectedClient.id).length === 0 && (
                          <div className="text-center py-8 text-slate-400">
                            <FileText className="h-8 w-8 mx-auto mb-2" />
                            <p>Nenhum caso encontrado para este cliente</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;