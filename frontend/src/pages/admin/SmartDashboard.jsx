import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ChartLine, ChartBar, ChartPie, ChartArea, ChartMultiBar, COLORS } from '../../components/ui/chart';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const SmartDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch analytics overview
      const analyticsRes = await axios.get(`${BACKEND_URL}/api/advanced/analytics/overview`, config);
      setAnalyticsData(analyticsRes.data);

      // Fetch KPIs
      const kpisRes = await axios.get(`${BACKEND_URL}/api/advanced/analytics/kpis`, config);
      setKpis(kpisRes.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, trend }) => {
    const isPositive = trend === 'up';
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-sm">{title}</p>
            <Icon className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{value}</p>
              {change !== undefined && (
                <div className={`flex items-center mt-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  <TrendIcon className="h-4 w-4 mr-1" />
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading || !analyticsData || !kpis) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white">Carregando dashboard...</div>
      </div>
    );
  }

  // Prepare chart data
  const casesByStatus = analyticsData.charts.cases_by_status.map(item => ({
    name: item._id,
    value: item.count
  }));

  const casesTimeline = analyticsData.charts.cases_timeline.map(item => ({
    name: item._id,
    count: item.count
  }));

  const evidenceByType = analyticsData.charts.evidence_by_type.map(item => ({
    name: item._id,
    value: item.count
  }));

  // Process financial data for multi-bar chart
  const financialData = {};
  analyticsData.charts.financial_timeline.forEach(item => {
    const month = item._id.month;
    if (!financialData[month]) {
      financialData[month] = { name: month, income: 0, expenses: 0 };
    }
    if (item._id.type === 'income' || item._id.type === 'fee') {
      financialData[month].income += item.total;
    } else if (item._id.type === 'expense' || item._id.type === 'cost') {
      financialData[month].expenses += item.total;
    }
  });
  
  const financialTimeline = Object.values(financialData);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Dashboard Inteligente</h1>
          <Badge className="bg-cyan-500 text-white">Analytics Avançados</Badge>
        </div>

      {/* KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Casos Este Mês"
          value={kpis.cases.current_month}
          change={kpis.cases.growth_percentage}
          trend={kpis.cases.growth_percentage >= 0 ? 'up' : 'down'}
          icon={FileText}
        />
        <StatCard
          title="Receita Mensal"
          value={`R$ ${(kpis.revenue.current_month / 1000).toFixed(1)}k`}
          change={kpis.revenue.growth_percentage}
          trend={kpis.revenue.growth_percentage >= 0 ? 'up' : 'down'}
          icon={DollarSign}
        />
        <StatCard
          title="Taxa de Conclusão"
          value={`${kpis.efficiency.completion_rate}%`}
          icon={CheckCircle}
        />
        <StatCard
          title="Duração Média (dias)"
          value={kpis.efficiency.avg_case_duration}
          icon={Clock}
        />
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">Total de Casos</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.total_cases}</p>
              </div>
              <FileText className="h-8 w-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">Casos Ativos</p>
                <p className="text-2xl font-bold text-green-400">{analyticsData.overview.active_cases}</p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">Total de Evidências</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.total_evidence}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs">Análises Realizadas</p>
                <p className="text-2xl font-bold text-white">{analyticsData.overview.total_analysis}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases Timeline */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Casos ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartLine data={casesTimeline} dataKey="count" xKey="name" color={COLORS.primary} />
          </CardContent>
        </Card>

        {/* Cases by Status */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Casos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartPie data={casesByStatus} />
          </CardContent>
        </Card>

        {/* Financial Timeline */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Análise Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartMultiBar 
              data={financialTimeline} 
              dataKeys={['income', 'expenses']} 
              xKey="name"
            />
          </CardContent>
        </Card>

        {/* Evidence by Type */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Evidências por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartBar data={evidenceByType} dataKey="value" xKey="name" color={COLORS.secondary} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Casos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.recent_activity.cases.slice(0, 5).map((case_item) => (
                <div key={case_item.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-white">{case_item.title}</p>
                    <p className="text-sm text-slate-400">{case_item.case_number}</p>
                  </div>
                  <Badge className={
                    case_item.status === 'active' ? 'bg-green-500' :
                    case_item.status === 'completed' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }>
                    {case_item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Evidências Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.recent_activity.evidence.slice(0, 5).map((evidence) => (
                <div key={evidence.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-white">{evidence.name}</p>
                    <p className="text-sm text-slate-400">{evidence.evidence_number} - {evidence.type}</p>
                  </div>
                  <Badge className={
                    evidence.analysis_status === 'completed' ? 'bg-green-500' :
                    evidence.analysis_status === 'analyzing' ? 'bg-yellow-500' :
                    'bg-slate-500'
                  }>
                    {evidence.analysis_status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminLayout>
  );
};

export default SmartDashboard;
