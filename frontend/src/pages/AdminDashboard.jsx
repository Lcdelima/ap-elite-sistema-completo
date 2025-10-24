import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus,
  Eye,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Real data from API
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalAppointments: 0,
      pendingAppointments: 0,
      totalClients: 0,
      totalCases: 0,
      activeCases: 0,
      totalDocuments: 0,
      unreadMessages: 0
    },
    recentAppointments: [],
    recentMessages: [],
    recentCases: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('ap_elite_user');
    const token = localStorage.getItem('ap_elite_token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'administrator') {
      toast.error('Acesso não autorizado');
      navigate('/login');
      return;
    }
    
    setUser(parsedUser);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const API = `${BACKEND_URL}/api`;
      const token = localStorage.getItem('ap_elite_token');
      
      if (!token) {
        toast.error('Token não encontrado');
        navigate('/login');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch statistics with better error handling
      let statsData = {
        totalAppointments: 0,
        pendingAppointments: 0,
        totalClients: 0,
        totalCases: 0,
        activeCases: 0,
        totalDocuments: 0,
        unreadMessages: 0
      };

      try {
        const statsResponse = await axios.get(`${API}/admin/stats`, { headers });
        statsData = { ...statsData, ...statsResponse.data };
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }

      // Fetch appointments
      let appointmentsData = [];
      try {
        const appointmentsResponse = await axios.get(`${API}/appointments`, { headers });
        appointmentsData = Array.isArray(appointmentsResponse.data) 
          ? appointmentsResponse.data.slice(0, 5)
          : [];
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
      }
      
      // Fetch messages
      let messagesData = [];
      try {
        const messagesResponse = await axios.get(`${API}/contact`, { headers });
        messagesData = Array.isArray(messagesResponse.data) 
          ? messagesResponse.data.slice(0, 5)
          : [];
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
      }
      
      // Fetch cases
      let casesData = [];
      try {
        const casesResponse = await axios.get(`${API}/cases`, { headers });
        casesData = Array.isArray(casesResponse.data) 
          ? casesResponse.data.slice(0, 5)
          : [];
      } catch (error) {
        console.error('Erro ao carregar casos:', error);
      }

      setDashboardData({
        stats: statsData,
        recentAppointments: appointmentsData,
        recentMessages: messagesData,
        recentCases: casesData
      });
      
      // Show success message only on first load
      if (loading) {
        toast.success('Dados carregados com sucesso');
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do painel');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ap_elite_user');
    localStorage.removeItem('ap_elite_token');
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'confirmed': { label: 'Confirmado', className: 'bg-green-500 text-white' },
      'pending': { label: 'Pendente', className: 'bg-yellow-500 text-white' },
      'cancelled': { label: 'Cancelado', className: 'bg-red-500 text-white' },
      'completed': { label: 'Concluído', className: 'bg-blue-500 text-white' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) {
      return 'R$ 0,00';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-white">
              <span className="text-cyan-400">AP</span> Elite
            </div>
            <Badge className="bg-purple-500 text-white">Admin</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-slate-300">Bem-vinda, {user.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
              data-testid="admin-logout-button"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 min-h-screen p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeTab === 'overview' ? 'bg-cyan-500 bg-opacity-20 text-cyan-400' : 'text-slate-300 hover:bg-slate-700'
              }`}
              data-testid="nav-overview"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Visão Geral</span>
            </button>
            
            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeTab === 'appointments' ? 'bg-cyan-500 bg-opacity-20 text-cyan-400' : 'text-slate-300 hover:bg-slate-700'
              }`}
              data-testid="nav-appointments"
            >
              <Calendar className="h-5 w-5" />
              <span>Agendamentos</span>
              {dashboardData.stats.pendingAppointments > 0 && (
                <Badge className="bg-red-500 text-white ml-auto">
                  {dashboardData.stats.pendingAppointments}
                </Badge>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('clients')}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeTab === 'clients' ? 'bg-cyan-500 bg-opacity-20 text-cyan-400' : 'text-slate-300 hover:bg-slate-700'
              }`}
              data-testid="nav-clients"
            >
              <Users className="h-5 w-5" />
              <span>Clientes</span>
            </button>
            
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeTab === 'messages' ? 'bg-cyan-500 bg-opacity-20 text-cyan-400' : 'text-slate-300 hover:bg-slate-700'
              }`}
              data-testid="nav-messages"
            >
              <Mail className="h-5 w-5" />
              <span>Mensagens</span>
              {dashboardData.stats.newMessages > 0 && (
                <Badge className="bg-red-500 text-white ml-auto">
                  {dashboardData.stats.newMessages}
                </Badge>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeTab === 'reports' ? 'bg-cyan-500 bg-opacity-20 text-cyan-400' : 'text-slate-300 hover:bg-slate-700'
              }`}
              data-testid="nav-reports"
            >
              <FileText className="h-5 w-5" />
              <span>Relatórios</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
                <Badge className="bg-purple-500 text-white">ERP v2.0</Badge>
              </div>

              {/* ATHENA - 18 Módulos Completos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Elite Athena - Sistema Completo</h2>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white animate-pulse">18 Módulos</Badge>
                </div>
                
                <Card className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 border-0 cursor-pointer hover:scale-105 transition-transform mb-6" onClick={() => navigate('/athena')}>
                  <CardContent className="p-8 text-center">
                    <div className="flex items-center justify-center space-x-4">
                      <BarChart3 className="h-16 w-16 text-white" />
                      <div className="text-left">
                        <h3 className="text-3xl font-bold text-white mb-2">ACESSAR ATHENA</h3>
                        <p className="text-white text-lg mb-2">Sistema Jurídico Completo com 18 Módulos</p>
                        <div className="flex space-x-2">
                          <Badge className="bg-white text-purple-600">E2E Encryption</Badge>
                          <Badge className="bg-white text-cyan-600">Google Maps</Badge>
                          <Badge className="bg-white text-green-600">IA Preditiva</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <h2 className="text-xl font-semibold text-white mb-4">Acesso Rápido - Módulos ERP</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 border-0 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/admin/smart-dashboard')}>
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="h-8 w-8 text-white mx-auto mb-2" />
                      <p className="text-white font-semibold">Dashboard Inteligente</p>
                      <Badge className="mt-2 bg-white text-cyan-600 text-xs">Analytics</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/admin/interception')}>
                    <CardContent className="p-4 text-center">
                      <Phone className="h-8 w-8 text-white mx-auto mb-2" />
                      <p className="text-white font-semibold">Análise de Interceptação</p>
                      <Badge className="mt-2 bg-white text-purple-600 text-xs">IA Powered</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500 to-teal-600 border-0 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/admin/forensics')}>
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 text-white mx-auto mb-2" />
                      <p className="text-white font-semibold">Perícia Digital</p>
                      <Badge className="mt-2 bg-white text-green-600 text-xs">IPED</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 border-0 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/admin/communications')}>
                    <CardContent className="p-4 text-center">
                      <Mail className="h-8 w-8 text-white mx-auto mb-2" />
                      <p className="text-white font-semibold">Comunicações</p>
                      <Badge className="mt-2 bg-white text-yellow-600 text-xs">Integrado</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Agendamentos</p>
                        <p className="text-2xl font-bold text-white">{dashboardData.stats.totalAppointments}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-cyan-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Pendentes</p>
                        <p className="text-2xl font-bold text-yellow-400">{dashboardData.stats.pendingAppointments}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-yellow-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Clientes</p>
                        <p className="text-2xl font-bold text-white">{dashboardData.stats.totalClients}</p>
                      </div>
                      <Users className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Receita Mensal</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(dashboardData.stats.monthlyRevenue)}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-cyan-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Appointments */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      Agendamentos Recentes
                      <Button size="sm" className="btn-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-white">{appointment.clientName}</p>
                            <p className="text-sm text-slate-400">{appointment.service}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span className="text-xs text-slate-400">
                                {formatDate(appointment.date)} às {appointment.time}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(appointment.status)}
                            <Button size="sm" variant="outline" className="text-slate-300 border-slate-600">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Messages */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Mensagens Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentMessages.map((message) => (
                        <div key={message.id} className="p-3 bg-slate-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-white">{message.name}</p>
                            <div className="flex items-center space-x-2">
                              {!message.read && (
                                <Badge className="bg-red-500 text-white text-xs">Nova</Badge>
                              )}
                              <span className="text-xs text-slate-400">{formatDate(message.date)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{message.subject}</p>
                          <p className="text-xs text-slate-400 line-clamp-2">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Gerenciar Agendamentos</h1>
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-center py-12 text-slate-400">
                    <Calendar className="h-12 w-12 mx-auto mb-4" />
                    <p>Sistema de gerenciamento de agendamentos em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Gerenciar Clientes</h1>
                <Button className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Cliente
                </Button>
              </div>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-center py-12 text-slate-400">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <p>Sistema de gerenciamento de clientes em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">Mensagens de Contato</h1>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-center py-12 text-slate-400">
                    <Mail className="h-12 w-12 mx-auto mb-4" />
                    <p>Sistema de gerenciamento de mensagens em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">Relatórios e Analytics</h1>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-center py-12 text-slate-400">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Sistema de relatórios em desenvolvimento</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;