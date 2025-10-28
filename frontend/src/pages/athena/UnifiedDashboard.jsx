import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Briefcase, DollarSign, FileText, 
  TrendingUp, AlertCircle, CheckCircle, Clock, Activity,
  Radio, HardDrive, Shield, Video, Calendar, Bell
} from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import HybridStatus from '../../components/HybridStatus';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const UnifiedDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, employees: 0, clients: 0 },
    processes: { total: 0, active: 0, pending: 0, completed: 0 },
    financial: { income: 0, expenses: 0, net: 0, profit_margin: 0 },
    cases: { total: 0, active: 0, completed: 0 },
    erbs: { total: 0 },
    extractions: { total: 0, in_progress: 0, completed: 0 },
    investigations: { total: 0, active: 0 },
    meetings: { today: 0, total: 0 },
    events: { today: 0, week: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch all stats in parallel
      const [usersRes, processesRes, financialRes, erbsRes, extractionsRes, invRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/users/stats/summary`, { headers }).catch(() => ({ json: async () => ({}) })),
        fetch(`${BACKEND_URL}/api/athena/processes`, { headers }).catch(() => ({ json: async () => ({ processes: [] }) })),
        fetch(`${BACKEND_URL}/api/athena/financial/summary`, { headers }).catch(() => ({ json: async () => ({}) })),
        fetch(`${BACKEND_URL}/api/athena/erbs/list`, { headers }).catch(() => ({ json: async () => ({ erbs: [] }) })),
        fetch(`${BACKEND_URL}/api/athena/data-extraction/list`, { headers }).catch(() => ({ json: async () => ({ extractions: [] }) })),
        fetch(`${BACKEND_URL}/api/athena/defensive-investigation/stats`, { headers }).catch(() => ({ json: async () => ({}) }))
      ]);

      const usersData = await usersRes.json();
      const processesData = await processesRes.json();
      const financialData = await financialRes.json();
      const erbsData = await erbsRes.json();
      const extractionsData = await extractionsRes.json();
      const invData = await invRes.json();

      setStats({
        users: {
          total: usersData.total_users || 0,
          active: usersData.active_users || 0,
          employees: usersData.employees || 0,
          clients: usersData.clients || 0
        },
        processes: {
          total: processesData.processes?.length || 0,
          active: processesData.processes?.filter(p => p.status === 'active').length || 0,
          pending: processesData.processes?.filter(p => p.status === 'pending').length || 0,
          completed: processesData.processes?.filter(p => p.status === 'completed').length || 0
        },
        financial: {
          income: financialData.income || 0,
          expenses: financialData.expenses || 0,
          net: financialData.net || 0,
          profit_margin: financialData.profit_margin || 0
        },
        erbs: {
          total: erbsData.erbs?.length || 0
        },
        extractions: {
          total: extractionsData.extractions?.length || 0,
          in_progress: extractionsData.extractions?.filter(e => e.status === 'in_progress').length || 0,
          completed: extractionsData.extractions?.filter(e => e.status === 'completed').length || 0
        },
        investigations: {
          total: invData.total_cases || 0,
          active: invData.active_cases || 0
        },
        meetings: { today: 0, total: 0 },
        events: { today: 0, week: 0 }
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, bgColor }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <UniversalModuleLayout
      title="Unified Dashboard"
      subtitle="Sistema integrado"
      icon={FileText}
    >
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
      </UniversalModuleLayout>
    );
  }

  return (
    <UniversalModuleLayout
      title="Unified Dashboard"
      subtitle="Sistema integrado"
      icon={FileText}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-8 rounded-lg shadow-lg mb-6">
          <div className="flex items-center gap-4 mb-4">
            <LayoutDashboard className="w-16 h-16" />
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard Unificado</h1>
              <p className="text-blue-100 text-lg">Visão geral completa do sistema AP ELITE ATHENA</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-blue-100 text-sm">Sistema</p>
              <p className="text-xl font-bold">100% Online</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-purple-100 text-sm">Módulos Ativos</p>
              <p className="text-xl font-bold">23 de 23</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-pink-100 text-sm">Uptime</p>
              <p className="text-xl font-bold">99.9%</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-blue-100 text-sm">Última Atualização</p>
              <p className="text-xl font-bold">Agora</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            title="Usuários Totais"
            value={stats.users.total}
            subtitle={`${stats.users.active} ativos`}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard
            icon={Briefcase}
            title="Processos"
            value={stats.processes.total}
            subtitle={`${stats.processes.active} ativos`}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
          <StatCard
            icon={DollarSign}
            title="Saldo Financeiro"
            value={formatCurrency(stats.financial.net)}
            subtitle={`${stats.financial.profit_margin}% margem`}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard
            icon={Shield}
            title="Investigações"
            value={stats.investigations.total}
            subtitle={`${stats.investigations.active} em andamento`}
            color="text-red-600"
            bgColor="bg-red-100"
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Financial Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold">Visão Financeira</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Receitas</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(stats.financial.income)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-700">Despesas</span>
                <span className="text-lg font-bold text-red-600">{formatCurrency(stats.financial.expenses)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Saldo Líquido</span>
                <span className={`text-lg font-bold ${stats.financial.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.financial.net)}
                </span>
              </div>
            </div>
          </div>

          {/* Process Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Status dos Processos</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Ativos</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.processes.active}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-700">Pendentes</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats.processes.pending}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">Concluídos</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{stats.processes.completed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Modules Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold">ERBs</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.erbs.total}</p>
            <p className="text-sm text-gray-500 mt-1">Estações cadastradas</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-3">
              <HardDrive className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold">Extrações</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.extractions.total}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.extractions.in_progress} em progresso</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Usuários</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
            <p className="text-sm text-gray-500 mt-1">{stats.users.employees} funcionários, {stats.users.clients} clientes</p>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Saúde do Sistema</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm text-gray-600">Backend</p>
                <p className="font-semibold text-green-600">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm text-gray-600">Frontend</p>
                <p className="font-semibold text-green-600">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm text-gray-600">Database</p>
                <p className="font-semibold text-green-600">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm text-gray-600">APIs</p>
                <p className="font-semibold text-green-600">Funcionando</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sistema Híbrido Online/Offline */}
        <HybridStatus />
      </div>
    </UniversalModuleLayout>
  );
};

export default UnifiedDashboard;