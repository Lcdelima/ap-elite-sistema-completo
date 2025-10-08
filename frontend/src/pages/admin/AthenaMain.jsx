import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Scale,
  MessageSquare,
  Calendar,
  Link2,
  Video,
  Shield,
  Radio,
  Wifi,
  Database,
  HardDrive,
  FileSearch,
  Layers,
  FileText,
  DollarSign,
  BarChart3,
  Lock,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const AthenaMain = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/dashboard/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMetrics(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setLoading(false);
    }
  };

  const modules = [
    {
      id: 1,
      title: 'Dashboard Principal',
      subtitle: 'Visão geral completa',
      icon: LayoutDashboard,
      path: '/athena/dashboard',
      color: 'from-cyan-500 to-blue-600',
      badge: 'Métricas',
      badgeColor: 'bg-cyan-500'
    },
    {
      id: 2,
      title: 'Gestão de Clientes',
      subtitle: 'CRM Completo',
      icon: Users,
      path: '/athena/clients',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 3,
      title: 'Gestão de Processos',
      subtitle: 'Processos Jurídicos',
      icon: Scale,
      path: '/athena/processes',
      color: 'from-green-500 to-teal-600'
    },
    {
      id: 4,
      title: 'Comunicação Corporativa',
      subtitle: 'Chat E2E Seguro',
      icon: MessageSquare,
      path: '/athena/communications',
      color: 'from-yellow-500 to-orange-600',
      badge: 'E2E',
      badgeColor: 'bg-green-500'
    },
    {
      id: 5,
      title: 'Calendário Corporativo',
      subtitle: 'Agenda e compromissos',
      icon: Calendar,
      path: '/athena/calendar',
      color: 'from-red-500 to-pink-600'
    },
    {
      id: 6,
      title: 'Gerador de Links',
      subtitle: 'Links de reunião',
      icon: Link2,
      path: '/athena/meeting-links',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 7,
      title: 'Videoconferência',
      subtitle: 'Jitsi Meet E2E',
      icon: Video,
      path: '/athena/video',
      color: 'from-blue-500 to-cyan-600',
      badge: 'Jitsi',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 8,
      title: 'Perícia Digital',
      subtitle: 'Análise forense',
      icon: Shield,
      path: '/athena/forensics',
      color: 'from-slate-500 to-gray-600'
    },
    {
      id: 9,
      title: 'Interceptações Telefônicas',
      subtitle: 'Análise de chamadas',
      icon: Radio,
      path: '/athena/phone-interceptions',
      color: 'from-orange-500 to-red-600',
      badge: 'IA',
      badgeColor: 'bg-purple-500'
    },
    {
      id: 10,
      title: 'Interceptações Telemáticas',
      subtitle: 'Análise de dados',
      icon: Wifi,
      path: '/athena/data-interceptions',
      color: 'from-teal-500 to-green-600',
      badge: 'IA',
      badgeColor: 'bg-purple-500'
    },
    {
      id: 11,
      title: 'Extração de Dados',
      subtitle: 'Cellebrite, UFED',
      icon: Database,
      path: '/athena/data-extraction',
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 12,
      title: 'ERBs',
      subtitle: 'Estações Rádio Base',
      icon: HardDrive,
      path: '/athena/erbs',
      color: 'from-amber-500 to-yellow-600',
      badge: 'Maps',
      badgeColor: 'bg-green-500'
    },
    {
      id: 13,
      title: 'IPED',
      subtitle: 'Indexação forense',
      icon: FileSearch,
      path: '/athena/iped',
      color: 'from-lime-500 to-green-600'
    },
    {
      id: 14,
      title: 'Processamento de Evidências',
      subtitle: 'Chain of custody',
      icon: Layers,
      path: '/athena/evidence-processing',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 15,
      title: 'Análise Processual',
      subtitle: 'IA Preditiva',
      icon: FileText,
      path: '/athena/process-analysis',
      color: 'from-violet-500 to-purple-600',
      badge: 'IA',
      badgeColor: 'bg-purple-500'
    },
    {
      id: 16,
      title: 'Relatórios Avançados',
      subtitle: 'PDF com gráficos',
      icon: FileText,
      path: '/athena/reports',
      color: 'from-fuchsia-500 to-pink-600'
    },
    {
      id: 17,
      title: 'Gestão Financeira',
      subtitle: 'Controle completo',
      icon: DollarSign,
      path: '/athena/financial',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 18,
      title: 'Dashboards Inteligentes',
      subtitle: 'Analytics IA',
      icon: BarChart3,
      path: '/athena/intelligent-dashboards',
      color: 'from-cyan-500 to-blue-600',
      badge: 'IA',
      badgeColor: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Zap className="h-7 w-7 text-cyan-500" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Elite Athena</h1>
                  <p className="text-blue-100">Sistema Jurídico Completo</p>
                </div>
              </div>
              <p className="text-white text-lg">
                18 Módulos Integrados | Segurança E2E | IA Preditiva
              </p>
            </div>
            
            {metrics && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <p className="text-white text-2xl font-bold">{metrics.total_cases}</p>
                  <p className="text-blue-100 text-sm">Casos Totais</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
                  <p className="text-white text-2xl font-bold">{metrics.active_cases}</p>
                  <p className="text-blue-100 text-sm">Casos Ativos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Features Banner */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Lock className="h-8 w-8 text-white" />
            <div>
              <p className="text-white font-semibold">Segurança Militar</p>
              <p className="text-green-100 text-sm">
                Criptografia E2E • AES-256-GCM • Zero-Knowledge • PFS
              </p>
            </div>
          </div>
          <Badge className="bg-white text-green-600 font-bold">
            Mais Seguro que Signal & WhatsApp
          </Badge>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Módulos do Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.id}
                className={`bg-gradient-to-br ${module.color} border-0 cursor-pointer hover:scale-105 transition-transform duration-200 group`}
                onClick={() => navigate(module.path)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="h-8 w-8 text-white" />
                    {module.badge && (
                      <Badge className={`${module.badgeColor} text-white text-xs`}>
                        {module.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-white font-bold text-lg mb-1 group-hover:underline">
                    {module.title}
                  </h3>
                  <p className="text-white text-opacity-90 text-sm">
                    {module.subtitle}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                    <p className="text-white text-opacity-75 text-xs">
                      Módulo {module.id} de 18
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <Lock className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Criptografia E2E</p>
              <p className="text-slate-400 text-sm">Signal Protocol + AES-256</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <Zap className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-semibold">IA Preditiva</p>
              <p className="text-slate-400 text-sm">Machine Learning Avançado</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <Database className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Cloud Híbrida</p>
              <p className="text-slate-400 text-sm">Google • Azure • AWS</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AthenaMain;
