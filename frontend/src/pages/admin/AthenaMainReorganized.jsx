import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  LayoutDashboard, Users, Scale, MessageSquare, Calendar, Link2, Video,
  Shield, Radio, Wifi, Database, HardDrive, FileSearch, Layers, FileText,
  DollarSign, BarChart3, TrendingUp, Lock, Zap, Search, Network, Brain,
  Calculator, Activity, ScanText, Film, Workflow, Bot, Share2, Users2,
  LineChart, CheckCircle2, FileBarChart, LogOut, Clock, ChevronRight,
  Briefcase, Gavel, ShieldCheck, Building2, FileSpreadsheet, Settings,
  Globe, Target, Eye, AlertTriangle, Hash, Folder, BookOpen, Link as LinkIcon,
  PhoneCall, Smartphone, MapPin, Menu, X, Home, ArrowLeft, FileCheck
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const AthenaMainReorganized = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMetrics(res.data);
    } catch (error) {
      console.log('Metrics not available');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ap_elite_token');
    localStorage.removeItem('ap_elite_user');
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  // ==================== CATEGORIAS E MÓDULOS ====================
  
  const categories = {
    dashboard: {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      color: 'cyan',
      gradient: 'from-cyan-600 to-cyan-800',
      description: 'Visão geral e métricas principais',
      modules: [
        { name: 'Dashboard Principal', icon: LayoutDashboard, route: '/athena/dashboard', description: 'Visão geral completa do sistema' },
        { name: 'Dashboard Executivo', icon: TrendingUp, route: '/athena/executive-dashboard', description: 'KPIs e métricas estratégicas' },
        { name: 'Dashboard Inteligente', icon: Brain, route: '/admin/smart-dashboard', description: 'Análises com IA' },
        { name: 'Dashboard Unificado', icon: Activity, route: '/athena/unified-dashboard', description: 'Visão consolidada de todos os sistemas' }
      ]
    },
    
    juridico: {
      id: 'juridico',
      name: 'Jurídico & Processos',
      icon: Gavel,
      color: 'blue',
      gradient: 'from-blue-600 to-blue-800',
      description: 'Gestão jurídica e processual',
      modules: [
        { name: 'Gestão de Processos', icon: Scale, route: '/athena/processes', description: 'Controle completo de processos judiciais' },
        { name: 'Integração com Tribunais', icon: Building2, route: '/athena/integracao-tribunais', description: '🏛️ Sincronização TJ/STJ/STF/CNJ - PJe, SEEU, ePoC, Projudi' },
        { name: 'Análise Processual Profissional', icon: Brain, route: '/athena/analise-processual', description: 'Sistema avançado de análise jurídica com IA' },
        { name: 'Análise Processual', icon: FileSearch, route: '/athena/process-analysis', description: 'Análise detalhada de processos' },
        { name: 'Análise Processual Pro', icon: BarChart3, route: '/athena/process-analysis-pro', description: 'Análise avançada com IA' },
        { name: 'Gerador de Contratos', icon: FileText, route: '/athena/contract-generator', description: 'Criação automática de contratos' },
        { name: 'Gerador de Documentos', icon: FileBarChart, route: '/athena/document-generator', description: 'Templates e documentos jurídicos' },
        { name: 'Gerador de Templates', icon: Layers, route: '/athena/template-generator', description: 'Criação de templates personalizados' },
        { name: 'Biblioteca de Documentos', icon: BookOpen, route: '/athena/document-library', description: 'Repositório de documentos' },
        { name: 'Relatórios Avançados', icon: FileBarChart, route: '/athena/reports-export', description: 'Geração de relatórios complexos' },
        { name: 'Relatórios Automatizados', icon: Zap, route: '/athena/automated-reports', description: 'Relatórios automáticos agendados' }
      ]
    },
    
    pericia: {
      id: 'pericia',
      name: 'Perícia & Investigação',
      icon: Shield,
      color: 'purple',
      gradient: 'from-purple-600 to-purple-800',
      description: 'Perícia forense e investigação',
      modules: [
        { name: 'Perícia Digital', icon: Shield, route: '/athena/pericia-digital', description: 'Análise forense de dispositivos digitais' },
        { name: 'Perícia Digital Enhanced', icon: ShieldCheck, route: '/athena/forensics-enhanced', description: 'Perícia digital avançada' },
        { name: 'Interceptações Telefônicas', icon: PhoneCall, route: '/athena/phone-interceptions', description: 'Gestão de interceptações telefônicas' },
        { name: 'Interceptações Telemáticas', icon: Wifi, route: '/athena/data-interceptions', description: 'Interceptação de dados' },
        { name: 'Extração de Dados', icon: Database, route: '/athena/data-extraction', description: 'Extração de dados de dispositivos' },
        { name: 'Extração de Dados Enhanced', icon: HardDrive, route: '/athena/data-extraction-enhanced', description: 'Extração avançada com IA' },
        { name: 'Análise de ERBs', icon: Radio, route: '/athena/erbs', description: 'Análise de Estações Rádio Base' },
        { name: 'ERBs Enhanced', icon: MapPin, route: '/athena/erbs-enhanced', description: 'Análise geoespacial de ERBs' },
        { name: 'IPED Integration', icon: Layers, route: '/athena/iped', description: 'Integração com IPED' },
        { name: 'Processamento de Evidências', icon: FileCheck, route: '/athena/evidence-processing', description: 'Gestão de cadeia de custódia' },
        { name: 'Processamento Enhanced', icon: CheckCircle2, route: '/athena/evidence-processing-enhanced', description: 'Processamento avançado de evidências' },
        { name: 'Análise de Evidências IA', icon: Brain, route: '/athena/evidence-analysis', description: 'Análise com inteligência artificial' }
      ]
    },
    
    inteligencia: {
      id: 'inteligencia',
      name: 'Inteligência & OSINT',
      icon: Eye,
      color: 'indigo',
      gradient: 'from-indigo-600 to-indigo-800',
      description: 'Inteligência e investigação aberta',
      modules: [
        { name: 'Investigação Defensiva', icon: Target, route: '/athena/defensive-investigation', description: 'Investigação defensiva estratégica' },
        { name: 'Investigação Avançada', icon: Search, route: '/athena/advanced-investigation', description: 'Técnicas avançadas de investigação' },
        { name: 'OSINT Avançado', icon: Globe, route: '/athena/osint-dashboard', description: 'Open Source Intelligence' },
        { name: 'Mapeamento de Redes', icon: Network, route: '/athena/relationship-mapping', description: 'Análise de relacionamentos' },
        { name: 'Monitoramento Social', icon: Share2, route: '/athena/social-monitor', description: 'Monitoramento de redes sociais' },
        { name: 'Busca Global', icon: Search, route: '/athena/global-search', description: 'Busca unificada em todos os sistemas' }
      ]
    },
    
    tecnologia: {
      id: 'tecnologia',
      name: 'Tecnologia & IA',
      icon: Brain,
      color: 'pink',
      gradient: 'from-pink-600 to-pink-800',
      description: 'Tecnologias avançadas e IA',
      modules: [
        { name: 'OCR Avançado', icon: ScanText, route: '/athena/ocr-dashboard', description: 'Reconhecimento óptico de caracteres' },
        { name: 'Análise de Mídia', icon: Film, route: '/athena/media-analysis', description: 'Análise de áudio e vídeo' },
        { name: 'RAG System', icon: Database, route: '/athena/rag-system', description: 'Retrieval-Augmented Generation' },
        { name: 'Assistente IA', icon: Bot, route: '/athena/chatbot-interface', description: 'Chatbot inteligente' },
        { name: 'Analytics Preditiva', icon: LineChart, route: '/athena/predictive-analytics', description: 'Análise preditiva com IA' },
        { name: 'Automação de Workflows', icon: Workflow, route: '/athena/workflow-manager', description: 'Automação de processos' }
      ]
    },
    
    gestao: {
      id: 'gestao',
      name: 'Gestão & Administração',
      icon: Briefcase,
      color: 'green',
      gradient: 'from-green-600 to-green-800',
      description: 'Gestão administrativa e financeira',
      modules: [
        { name: 'Gestão de Clientes', icon: Users, route: '/athena/clients', description: 'Cadastro e gestão de clientes' },
        { name: 'Clientes Enhanced', icon: Users2, route: '/athena/clients-enhanced', description: 'Gestão avançada de clientes' },
        { name: 'Gerenciamento de Usuários', icon: Users, route: '/athena/user-management', description: 'Controle de usuários e permissões' },
        { name: 'Gestão Financeira', icon: DollarSign, route: '/athena/financial', description: 'Controle financeiro completo' },
        { name: 'Gestão Financeira Enhanced', icon: Calculator, route: '/athena/financial-management', description: 'Financeiro avançado com IA' },
        { name: 'Honorários Inteligentes', icon: Calculator, route: '/athena/smart-fees', description: 'Cálculo inteligente de honorários' },
        { name: 'Gerenciador de Prazos', icon: Clock, route: '/athena/deadline-manager', description: 'Controle de prazos D-3/D-1' }
      ]
    },
    
    comunicacao: {
      id: 'comunicacao',
      name: 'Comunicação & Colaboração',
      icon: MessageSquare,
      color: 'orange',
      gradient: 'from-orange-600 to-orange-800',
      description: 'Comunicação e trabalho em equipe',
      modules: [
        { name: 'Comunicação Corporativa', icon: MessageSquare, route: '/athena/communications', description: 'Central de comunicações' },
        { name: 'Comunicação Enhanced', icon: MessageSquare, route: '/athena/communications-enhanced', description: 'Comunicação avançada' },
        { name: 'Calendário', icon: Calendar, route: '/athena/calendar', description: 'Agenda e compromissos' },
        { name: 'Calendário Enhanced', icon: Calendar, route: '/athena/calendar-enhanced', description: 'Calendário com sincronização' },
        { name: 'Videoconferência', icon: Video, route: '/athena/video', description: 'Reuniões por vídeo' },
        { name: 'Videoconferência Enhanced', icon: Video, route: '/athena/video-conference-enhanced', description: 'Videoconferência avançada' },
        { name: 'Gerador de Links', icon: Link2, route: '/athena/meeting-links', description: 'Links de reunião' },
        { name: 'Links Enhanced', icon: LinkIcon, route: '/athena/meeting-links-enhanced', description: 'Gestão avançada de links' },
        { name: 'Hub de Colaboração', icon: Share2, route: '/athena/collaboration-hub', description: 'Trabalho em equipe em tempo real' }
      ]
    },
    
    compliance: {
      id: 'compliance',
      name: 'Compliance & Segurança',
      icon: Lock,
      color: 'red',
      gradient: 'from-red-600 to-red-800',
      description: 'Conformidade e segurança',
      modules: [
        { name: 'Centro de Compliance', icon: ShieldCheck, route: '/athena/compliance-center', description: 'Gestão de conformidade LGPD' },
        { name: 'Blockchain Custódia', icon: Lock, route: '/athena/blockchain-custody', description: 'Cadeia de custódia blockchain' }
      ]
    }
  };

  // ==================== COMPONENTES ====================

  const CategoryCard = ({ category }) => {
    const CategoryIcon = category.icon;
    const isActive = activeCategory === category.id;
    
    return (
      <button
        onClick={() => setActiveCategory(category.id)}
        className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
          isActive 
            ? `bg-gradient-to-br ${category.gradient} shadow-lg shadow-${category.color}-500/30 border-2 border-${category.color}-400` 
            : 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600 hover:bg-gray-750'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${isActive ? 'bg-white/20' : `bg-${category.color}-500/20`}`}>
            <CategoryIcon className={`w-6 h-6 ${isActive ? 'text-white' : `text-${category.color}-400`}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base">{category.name}</h3>
            <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
              {category.modules.length} módulos
            </p>
          </div>
          {isActive && (
            <ChevronRight className="w-5 h-5 text-white" />
          )}
        </div>
      </button>
    );
  };

  const ModuleCard = ({ module, categoryColor }) => {
    const ModuleIcon = module.icon;
    
    return (
      <Card 
        className="bg-gray-800 border-gray-700 hover:border-cyan-500 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1"
        onClick={() => navigate(module.route)}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-${categoryColor}-500/20 group-hover:bg-${categoryColor}-500/30 transition-all`}>
              <ModuleIcon className={`w-7 h-7 text-${categoryColor}-400 group-hover:scale-110 transition-transform`} />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-base mb-1 group-hover:text-cyan-400 transition-colors">
                {module.name}
              </h3>
              <p className="text-gray-400 text-sm">
                {module.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const MetricsOverview = () => {
    if (!metrics) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-cyan-600 to-cyan-800 border-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-xs font-semibold uppercase">Casos</p>
                <p className="text-3xl font-bold text-white mt-1">{metrics.total_cases || 0}</p>
              </div>
              <Scale className="w-10 h-10 text-cyan-200 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-semibold uppercase">Clientes</p>
                <p className="text-3xl font-bold text-white mt-1">{metrics.total_clients || 0}</p>
              </div>
              <Users className="w-10 h-10 text-purple-200 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-800 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-semibold uppercase">Receita</p>
                <p className="text-2xl font-bold text-white mt-1">
                  R$ {(metrics.monthly_revenue || 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-200 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600 to-orange-800 border-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-semibold uppercase">Interceptações</p>
                <p className="text-3xl font-bold text-white mt-1">{metrics.active_interceptions || 0}</p>
              </div>
              <PhoneCall className="w-10 h-10 text-orange-200 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const activeCategoryData = categories[activeCategory];

  // ==================== RENDER ====================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors lg:hidden"
              >
                {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Shield className="w-8 h-8 text-cyan-400" />
                  AP Elite ATHENA
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">PRO</Badge>
                </h1>
                <p className="text-gray-400 text-sm">Sistema Jurídico Completo com 18 Módulos</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard Admin</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Categories */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} lg:w-80 bg-gray-900/30 backdrop-blur-sm border-r border-gray-700 transition-all duration-300 overflow-hidden`}>
          <div className="p-6 space-y-3">
            <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              Categorias
            </h2>
            
            {Object.values(categories).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Metrics */}
          <MetricsOverview />

          {/* Category Header */}
          {activeCategoryData && (
            <>
              <div className={`mb-6 p-6 rounded-2xl bg-gradient-to-br ${activeCategoryData.gradient} border border-${activeCategoryData.color}-500/30`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                    <activeCategoryData.icon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">
                      {activeCategoryData.name}
                    </h2>
                    <p className="text-white/80 text-lg">
                      {activeCategoryData.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {activeCategoryData.modules.length} Módulos Disponíveis
                  </Badge>
                </div>
              </div>

              {/* Modules Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeCategoryData.modules.map((module, index) => (
                  <ModuleCard 
                    key={index} 
                    module={module} 
                    categoryColor={activeCategoryData.color}
                  />
                ))}
              </div>
            </>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Carregando módulos...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AthenaMainReorganized;
