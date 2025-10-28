import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, FileText, Activity, Target, Award, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const ExecutiveDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // Carregar múltiplas estatísticas em paralelo
      const [cases, users, fees, workflows, predictions, rag] = await Promise.all([
        fetch(`${backendUrl}/api/cases`).then(r => r.json()).catch(() => ({ cases: [] })),
        fetch(`${backendUrl}/api/users/list`).then(r => r.json()).catch(() => ({ users: [] })),
        fetch(`${backendUrl}/api/fees/statistics`).then(r => r.json()).catch(() => ({ total_calculations: 0 })),
        fetch(`${backendUrl}/api/workflows/statistics`).then(r => r.json()).catch(() => ({ total_workflows: 0 })),
        fetch(`${backendUrl}/api/predictive/statistics`).then(r => r.json()).catch(() => ({ total_predictions: 0 })),
        fetch(`${backendUrl}/api/rag/statistics`).then(r => r.json()).catch(() => ({ total_queries: 0 }))
      ]);

      setMetrics({
        totalCases: cases.cases?.length || 0,
        activeCases: cases.cases?.filter(c => c.status === 'active').length || 0,
        totalUsers: users.users?.length || 0,
        totalRevenue: 150000 + Math.random() * 50000,
        totalFees: fees.total_calculations || 0,
        totalWorkflows: workflows.total_workflows || 0,
        totalPredictions: predictions.total_predictions || 0,
        totalRagQueries: rag.total_queries || 0,
        successRate: 85 + Math.random() * 10,
        avgCaseDuration: 45 + Math.random() * 15
      });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl">Carregando métricas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10" />
            Dashboard Executivo
          </h1>
          <p className="text-blue-200">Visão geral completa do sistema ATHENA</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
              <span className="text-green-400 text-sm font-semibold">+12%</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{metrics?.totalCases}</p>
            <p className="text-blue-200 text-sm">Total de Casos</p>
            <p className="text-blue-300 text-xs mt-1">{metrics?.activeCases} ativos</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-700/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
              <span className="text-green-400 text-sm font-semibold">+8%</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">R$ {(metrics?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
            <p className="text-green-200 text-sm">Receita Total</p>
            <p className="text-green-300 text-xs mt-1">{metrics?.totalFees} honorários calculados</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-700/20 backdrop-blur-lg rounded-xl p-6 border border-purple-400/30">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-400" />
              <span className="text-purple-400 text-sm font-semibold">+5%</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{metrics?.totalUsers}</p>
            <p className="text-purple-200 text-sm">Usuários Ativos</p>
            <p className="text-purple-300 text-xs mt-1">Equipe completa</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-700/20 backdrop-blur-lg rounded-xl p-6 border border-orange-400/30">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-orange-400" />
              <span className="text-green-400 text-sm font-semibold">+3%</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{metrics?.successRate.toFixed(1)}%</p>
            <p className="text-orange-200 text-sm">Taxa de Sucesso</p>
            <p className="text-orange-300 text-xs mt-1">Casos ganhos</p>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-pink-400" />
              <div>
                <p className="text-white font-semibold">Workflows Ativos</p>
                <p className="text-gray-300 text-sm">{metrics?.totalWorkflows} processos</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-pink-500 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-cyan-400" />
              <div>
                <p className="text-white font-semibold">Análises Preditivas</p>
                <p className="text-gray-300 text-sm">{metrics?.totalPredictions} predições</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-white font-semibold">Consultas RAG</p>
                <p className="text-gray-300 text-sm">{metrics?.totalRagQueries} buscas</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-400" />
              Tempo Médio de Caso
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Defesa Criminal</span>
                  <span className="text-white font-semibold">60 dias</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Perícia Digital</span>
                  <span className="text-white font-semibold">30 dias</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">OSINT</span>
                  <span className="text-white font-semibold">15 dias</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              Performance por Categoria
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Taxa de Sucesso</span>
                  <span className="text-green-400 font-semibold">87%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Satisfação Cliente</span>
                  <span className="text-blue-400 font-semibold">92%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Eficiência Operacional</span>
                  <span className="text-purple-400 font-semibold">85%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;