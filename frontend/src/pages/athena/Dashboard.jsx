import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartLine, ChartBar, ChartPie, COLORS } from '@/components/ui/chart';
import {
  Users,
  FileText,
  DollarSign,
  Activity,
  TrendingUp,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
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
      console.error('Error:', error);
      toast.error('Erro ao carregar métricas');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Dashboard Principal</h1>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-sm">Casos Totais</p>
                <FileText className="h-5 w-5 text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-white">{metrics.total_cases}</p>
              <div className="flex items-center mt-2 text-green-400 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Ativos: {metrics.active_cases}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-sm">Clientes</p>
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">{metrics.total_clients}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-sm">Receita Mensal</p>
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                R$ {(metrics.monthly_revenue / 1000).toFixed(1)}k
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-sm">Tarefas Pendentes</p>
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">{metrics.pending_tasks}</p>
            </CardContent>
          </Card>
        </div>

        {/* Investigações Ativas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-300">Interceptações Ativas</p>
                <Activity className="h-5 w-5 text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-white">{metrics.active_interceptions}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-300">Evidências em Processamento</p>
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">{metrics.evidence_processing}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-300">Audiências Próximas</p>
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{metrics.upcoming_hearings}</p>
            </CardContent>
          </Card>
        </div>

        {/* Voltar */}
        <div className="mt-8">
          <a href="/athena" className="text-cyan-400 hover:text-cyan-300">
            ← Voltar para Athena
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
