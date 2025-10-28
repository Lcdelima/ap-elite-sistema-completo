import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AthenaLayout from '../../components/AthenaLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BarChart3, Brain, TrendingUp, AlertCircle, Activity, Map } from 'lucide-react';
import { toast } from 'sonner';

const IntelligentDashboards = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/intelligent-dashboards/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDashboard(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <AthenaLayout title="Dashboards Inteligentes" subtitle="Analytics com IA">
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-cyan-500 to-blue-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Brain className="h-12 w-12 text-white" />
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Inteligência Artificial</h3>
                <p className="text-white text-opacity-90">Análises preditivas e insights automáticos</p>
              </div>
              <Badge className="bg-white text-cyan-600 ml-auto">IA Powered</Badge>
            </div>
          </CardContent>
        </Card>

        {!loading && dashboard && (
          <>
            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <BarChart3 className="h-8 w-8 text-cyan-400 mb-2" />
                  <p className="text-slate-400 text-sm">Total de Casos</p>
                  <p className="text-3xl font-bold text-white">{dashboard.overview.total_cases}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <Activity className="h-8 w-8 text-green-400 mb-2" />
                  <p className="text-slate-400 text-sm">Casos Ativos</p>
                  <p className="text-3xl font-bold text-white">{dashboard.overview.active_cases}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <TrendingUp className="h-8 w-8 text-purple-400 mb-2" />
                  <p className="text-slate-400 text-sm">Taxa de Sucesso</p>
                  <p className="text-3xl font-bold text-white">{dashboard.overview.success_rate}%</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <AlertCircle className="h-8 w-8 text-yellow-400 mb-2" />
                  <p className="text-slate-400 text-sm">Alertas</p>
                  <p className="text-3xl font-bold text-white">{dashboard.ai_insights.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            {dashboard.ai_insights && dashboard.ai_insights.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-purple-400" />
                    Insights da IA
                  </h3>
                  <div className="space-y-3">
                    {dashboard.ai_insights.map((insight, idx) => (
                      <div key={idx} className="p-4 bg-slate-700 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 mt-2 rounded-full ${
                            insight.priority === 'critical' ? 'bg-red-500' :
                            insight.priority === 'high' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-white font-medium">{insight.category}</p>
                              <Badge className={
                                insight.type === 'alert' ? 'bg-red-500' :
                                insight.type === 'warning' ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }>
                                {insight.type}
                              </Badge>
                            </div>
                            <p className="text-slate-300 text-sm">{insight.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Geographic Activity */}
            {dashboard.geographic_activity && dashboard.geographic_activity.total_locations > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Map className="h-5 w-5 mr-2 text-green-400" />
                    Atividade Geográfica
                  </h3>
                  <div className="text-center py-8">
                    <p className="text-4xl font-bold text-white mb-2">
                      {dashboard.geographic_activity.total_locations}
                    </p>
                    <p className="text-slate-400">Localizações rastreadas</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Investigations */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Investigações Ativas</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <p className="text-3xl font-bold text-white">{dashboard.active_investigations.interceptions}</p>
                    <p className="text-slate-400 text-sm mt-2">Interceptações</p>
                  </div>
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <p className="text-3xl font-bold text-white">{dashboard.active_investigations.extractions}</p>
                    <p className="text-slate-400 text-sm mt-2">Extrações</p>
                  </div>
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <p className="text-3xl font-bold text-white">{dashboard.active_investigations.iped_projects}</p>
                    <p className="text-slate-400 text-sm mt-2">Projetos IPED</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AthenaLayout>
  );
};

export default IntelligentDashboards;