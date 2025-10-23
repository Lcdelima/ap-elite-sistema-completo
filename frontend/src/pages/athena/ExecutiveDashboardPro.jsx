import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AthenaLayout from '@/components/AthenaLayout';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Briefcase,
  AlertCircle, CheckCircle, Clock, FileText, Phone, Mail, Calendar,
  Target, Award, Zap, Activity, ArrowUp, ArrowDown, Filter, Download,
  RefreshCw, Eye, PieChart, LineChart
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const ExecutiveDashboardPro = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // week, month, quarter, year
  const [data, setData] = useState({
    kpis: {
      revenue: { current: 0, previous: 0, target: 0 },
      cases: { active: 0, completed: 0, new: 0 },
      clients: { total: 0, new: 0, active: 0 },
      deadlines: { upcoming: 0, overdue: 0, completed: 0 },
      interceptions: { total: 0, critical: 0, analyzed: 0 },
      documents: { received: 0, pending: 0, sent: 0 },
      payments: { received: 0, pending: 0, overdue: 0 },
      team: { utilization: 0, tasks: 0, productivity: 0 }
    },
    trends: {
      revenue: [],
      cases: [],
      clients: []
    },
    alerts: [],
    recentActivity: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(
        `${BACKEND_URL}/api/athena/dashboard/executive?period=${period}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      // Mock data for demonstration
      setData({
        kpis: {
          revenue: { current: 285000, previous: 245000, target: 300000 },
          cases: { active: 34, completed: 12, new: 8 },
          clients: { total: 156, new: 12, active: 89 },
          deadlines: { upcoming: 23, overdue: 2, completed: 45 },
          interceptions: { total: 67, critical: 5, analyzed: 52 },
          documents: { received: 234, pending: 12, sent: 189 },
          payments: { received: 185000, pending: 45000, overdue: 15000 },
          team: { utilization: 87, tasks: 156, productivity: 92 }
        },
        trends: {
          revenue: [180, 210, 245, 285],
          cases: [28, 31, 34, 38],
          clients: [142, 148, 156, 164]
        },
        alerts: [
          { type: 'critical', message: '2 prazos vencidos pendentes', link: '/athena/deadlines' },
          { type: 'warning', message: 'R$ 15.000 em atraso (3 clientes)', link: '/athena/financial' },
          { type: 'info', message: '5 interceptações críticas aguardando análise', link: '/athena/phone-interceptions' }
        ],
        recentActivity: [
          { type: 'case', message: 'Novo caso aberto: Investigação XYZ', time: '15 min atrás' },
          { type: 'payment', message: 'Pagamento recebido: R$ 12.000', time: '1h atrás' },
          { type: 'document', message: 'Laudo pericial concluído', time: '2h atrás' },
          { type: 'deadline', message: 'Petição protocolada no prazo', time: '3h atrás' }
        ]
      });
      setLoading(false);
    }
  };

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getAlertColor = (type) => {
    const colors = {
      critical: 'bg-red-500',
      warning: 'bg-orange-500',
      info: 'bg-blue-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <AthenaLayout title="Dashboard Executivo" subtitle="Visão geral e KPIs">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-12 w-12 animate-spin text-cyan-500" />
        </div>
      </AthenaLayout>
    );
  }

  const { kpis, trends, alerts, recentActivity } = data;
  const revenueGrowth = calculateGrowth(kpis.revenue.current, kpis.revenue.previous);
  const revenueProgress = (kpis.revenue.current / kpis.revenue.target * 100).toFixed(1);

  return (
    <AthenaLayout title="Dashboard Executivo" subtitle="Visão 360° da operação">
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
        
        {/* Period Selector & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {['week', 'month', 'quarter', 'year'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  period === p
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : p === 'quarter' ? 'Trimestre' : 'Ano'}
              </button>
            ))}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={fetchDashboardData}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Atualizar</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`${getAlertColor(alert.type)} bg-opacity-10 border-l-4 ${getAlertColor(alert.type).replace('bg-', 'border-')} p-4 rounded-lg flex items-center justify-between hover:bg-opacity-20 transition-all cursor-pointer`}
                onClick={() => window.location.href = alert.link}
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className={`h-5 w-5 ${getAlertColor(alert.type).replace('bg-', 'text-')}`} />
                  <span className="text-white font-medium">{alert.message}</span>
                </div>
                <Eye className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </div>
        )}

        {/* Primary KPIs - Row 1: Financeiro */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-400" />
            Financeiro
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-90">Receita Atual</span>
                  <DollarSign className="h-8 w-8 opacity-80" />
                </div>
                <p className="text-4xl font-bold mb-2">{formatCurrency(kpis.revenue.current)}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {parseFloat(revenueGrowth) >= 0 ? (
                      <ArrowUp className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 mr-1" />
                    )}
                    <span>{Math.abs(revenueGrowth)}% vs período anterior</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Meta: {formatCurrency(kpis.revenue.target)}</span>
                    <span>{revenueProgress}%</span>
                  </div>
                  <div className="w-full bg-green-800 rounded-full h-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all"
                      style={{ width: `${Math.min(revenueProgress, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-400">Recebimentos</span>
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(kpis.payments.received)}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Pendente:</span>
                    <span className="text-yellow-400">{formatCurrency(kpis.payments.pending)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Atrasado:</span>
                    <span className="text-red-400">{formatCurrency(kpis.payments.overdue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-400">Inadimplência</span>
                  <AlertCircle className="h-6 w-6 text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">
                  {((kpis.payments.overdue / (kpis.payments.received + kpis.payments.pending + kpis.payments.overdue)) * 100).toFixed(1)}%
                </p>
                <div className="text-sm text-slate-400">
                  Total em atraso: {formatCurrency(kpis.payments.overdue)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Row 2: Operacional */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-blue-400" />
            Operacional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Casos Ativos</span>
                  <Briefcase className="h-6 w-6 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white">{kpis.cases.active}</p>
                <div className="flex items-center space-x-4 text-xs mt-2">
                  <span className="text-green-400">Novos: {kpis.cases.new}</span>
                  <span className="text-gray-400">Concluídos: {kpis.cases.completed}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Clientes</span>
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white">{kpis.clients.total}</p>
                <div className="flex items-center space-x-4 text-xs mt-2">
                  <span className="text-green-400">Novos: {kpis.clients.new}</span>
                  <span className="text-blue-400">Ativos: {kpis.clients.active}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Prazos</span>
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-white">{kpis.deadlines.upcoming}</p>
                <div className="flex items-center space-x-4 text-xs mt-2">
                  <span className="text-red-400">Vencidos: {kpis.deadlines.overdue}</span>
                  <span className="text-green-400">OK: {kpis.deadlines.completed}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Documentos</span>
                  <FileText className="h-6 w-6 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white">{kpis.documents.received}</p>
                <div className="flex items-center space-x-4 text-xs mt-2">
                  <span className="text-yellow-400">Pendentes: {kpis.documents.pending}</span>
                  <span className="text-gray-400">Enviados: {kpis.documents.sent}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Row 3: Perícia e Investigação */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-orange-400" />
            Perícia e Investigação
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Interceptações</span>
                  <Phone className="h-6 w-6 text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-white">{kpis.interceptions.total}</p>
                <div className="flex items-center space-x-4 text-xs mt-2">
                  <span className="text-red-400">Críticas: {kpis.interceptions.critical}</span>
                  <span className="text-green-400">Analisadas: {kpis.interceptions.analyzed}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Utilização Equipe</span>
                  <Activity className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white">{kpis.team.utilization}%</p>
                <div className="text-xs text-slate-400 mt-2">
                  {kpis.team.tasks} tarefas ativas
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Produtividade</span>
                  <Zap className="h-6 w-6 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-white">{kpis.team.productivity}%</p>
                <div className="text-xs text-green-400 mt-2">
                  +5% vs mês anterior
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-cyan-400" />
              Atividade Recente
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'case' ? 'bg-blue-400' :
                      activity.type === 'payment' ? 'bg-green-400' :
                      activity.type === 'document' ? 'bg-purple-400' : 'bg-yellow-400'
                    }`} />
                    <span className="text-white">{activity.message}</span>
                  </div>
                  <span className="text-sm text-slate-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </AthenaLayout>
  );
};

export default ExecutiveDashboardPro;
