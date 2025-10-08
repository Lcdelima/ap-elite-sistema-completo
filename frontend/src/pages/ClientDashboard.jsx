import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Download, 
  Eye, 
  LogOut, 
  User,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ClientDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  // Sample client data - in real app this would come from API
  const [clientData, setClientData] = useState({
    profile: {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      clientSince: '2023-05-15',
      totalCases: 3
    },
    cases: [
      {
        id: 1,
        title: 'Perícia Digital - Fraude Corporativa',
        service: 'Perícia Digital',
        status: 'completed',
        startDate: '2024-08-15',
        completionDate: '2024-09-10',
        description: 'Análise forense de dispositivos móveis em caso de fraude corporativa.',
        documents: [
          { name: 'Laudo Pericial Final.pdf', size: '2.3 MB', date: '2024-09-10' },
          { name: 'Relatório Técnico.pdf', size: '1.8 MB', date: '2024-09-08' }
        ]
      },
      {
        id: 2,
        title: 'Advocacia Criminal - Processo 123456',
        service: 'Advocacia Criminal',
        status: 'in_progress',
        startDate: '2024-09-20',
        completionDate: null,
        description: 'Defesa em processo criminal de crimes contra o patrimônio.',
        documents: [
          { name: 'Petição Inicial.pdf', size: '1.2 MB', date: '2024-09-22' }
        ]
      },
      {
        id: 3,
        title: 'Consultoria Técnica - Análise de Evidências',
        service: 'Consultoria Técnica',
        status: 'pending',
        startDate: '2024-10-01',
        completionDate: null,
        description: 'Consultoria para análise técnica de evidências em processo judicial.',
        documents: []
      }
    ],
    appointments: [
      {
        id: 1,
        service: 'Consulta de Acompanhamento',
        date: '2024-10-15',
        time: '14:00',
        status: 'confirmed',
        type: 'presencial',
        notes: 'Discussão sobre andamento do processo criminal'
      },
      {
        id: 2,
        service: 'Reunião Técnica',
        date: '2024-10-20',
        time: '10:30',
        status: 'pending',
        type: 'online',
        notes: 'Apresentação dos resultados da perícia digital'
      }
    ]
  });

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('ap_elite_user');
    const token = localStorage.getItem('ap_elite_token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'client') {
      toast.error('Acesso não autorizado');
      navigate('/login');
      return;
    }
    
    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ap_elite_user');
    localStorage.removeItem('ap_elite_token');
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': { label: 'Concluído', className: 'bg-green-500 text-white', icon: CheckCircle },
      'in_progress': { label: 'Em Andamento', className: 'bg-blue-500 text-white', icon: Clock },
      'pending': { label: 'Aguardando', className: 'bg-yellow-500 text-white', icon: AlertCircle },
      'confirmed': { label: 'Confirmado', className: 'bg-green-500 text-white', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.className} flex items-center space-x-1`}>
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatFileSize = (size) => {
    return size;
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
            <Badge className="bg-blue-500 text-white">Cliente</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-slate-300">Olá, {user.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-slate-300 border-slate-600 hover:bg-slate-700"
              data-testid="client-logout-button"
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
              <User className="h-5 w-5" />
              <span>Meus Dados</span>
            </button>
            
            <button
              onClick={() => setActiveTab('cases')}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeTab === 'cases' ? 'bg-cyan-500 bg-opacity-20 text-cyan-400' : 'text-slate-300 hover:bg-slate-700'
              }`}
              data-testid="nav-cases"
            >
              <FileText className="h-5 w-5" />
              <span>Meus Casos</span>
              <Badge className="bg-slate-600 text-white ml-auto">
                {clientData.cases.length}
              </Badge>
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
              <Badge className="bg-slate-600 text-white ml-auto">
                {clientData.appointments.length}
              </Badge>
            </button>
            
            <button
              onClick={() => setActiveTab('documents')}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                activeTab === 'documents' ? 'bg-cyan-500 bg-opacity-20 text-cyan-400' : 'text-slate-300 hover:bg-slate-700'
              }`}
              data-testid="nav-documents"
            >
              <Download className="h-5 w-5" />
              <span>Documentos</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">Meu Portal</h1>
              
              {/* Profile Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Informações Pessoais</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-400 text-sm">Nome Completo</label>
                        <p className="text-white font-medium">{clientData.profile.name}</p>
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm">E-mail</label>
                        <p className="text-white font-medium">{clientData.profile.email}</p>
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm">Telefone</label>
                        <p className="text-white font-medium">{clientData.profile.phone}</p>
                      </div>
                      <div>
                        <label className="text-slate-400 text-sm">Cliente desde</label>
                        <p className="text-white font-medium">{formatDate(clientData.profile.clientSince)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Resumo da Conta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Total de Casos</span>
                        <span className="text-2xl font-bold text-cyan-400">{clientData.profile.totalCases}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Casos Ativos</span>
                        <span className="text-lg font-semibold text-yellow-400">
                          {clientData.cases.filter(c => c.status === 'in_progress' || c.status === 'pending').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Concluídos</span>
                        <span className="text-lg font-semibold text-green-400">
                          {clientData.cases.filter(c => c.status === 'completed').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="btn-primary flex items-center justify-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Novo Agendamento</span>
                    </Button>
                    <Button variant="outline" className="btn-secondary flex items-center justify-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Enviar Mensagem</span>
                    </Button>
                    <Button variant="outline" className="btn-secondary flex items-center justify-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Contato Direto</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">Meus Casos</h1>
              
              <div className="space-y-4">
                {clientData.cases.map((case_item) => (
                  <Card key={case_item.id} className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white mb-2">{case_item.title}</CardTitle>
                          <p className="text-slate-400">{case_item.service}</p>
                        </div>
                        {getStatusBadge(case_item.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 mb-4">{case_item.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <label className="text-slate-400">Data de Início</label>
                          <p className="text-white">{formatDate(case_item.startDate)}</p>
                        </div>
                        {case_item.completionDate && (
                          <div>
                            <label className="text-slate-400">Data de Conclusão</label>
                            <p className="text-white">{formatDate(case_item.completionDate)}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-slate-400">Documentos</label>
                          <p className="text-white">{case_item.documents.length} arquivo(s)</p>
                        </div>
                      </div>

                      {case_item.documents.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-white font-medium mb-2">Documentos Disponíveis:</h4>
                          <div className="space-y-2">
                            {case_item.documents.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-cyan-400" />
                                  <div>
                                    <p className="text-white text-sm">{doc.name}</p>
                                    <p className="text-slate-400 text-xs">{formatFileSize(doc.size)} • {formatDate(doc.date)}</p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" className="text-slate-300 border-slate-600">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" className="btn-primary">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Meus Agendamentos</h1>
                <Button className="btn-primary">
                  <Calendar className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
              
              <div className="space-y-4">
                {clientData.appointments.map((appointment) => (
                  <Card key={appointment.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{appointment.service}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-cyan-400" />
                              <span className="text-slate-300">{formatDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-cyan-400" />
                              <span className="text-slate-300">{appointment.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-300">{appointment.type === 'online' ? '🌐 Online' : '📍 Presencial'}</span>
                            </div>
                          </div>
                          {appointment.notes && (
                            <p className="text-slate-400 text-sm mt-2">{appointment.notes}</p>
                          )}
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white">Meus Documentos</h1>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-center py-12 text-slate-400">
                    <Download className="h-12 w-12 mx-auto mb-4" />
                    <p>Visualização centralizada de documentos em desenvolvimento</p>
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

export default ClientDashboard;