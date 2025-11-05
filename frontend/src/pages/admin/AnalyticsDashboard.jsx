import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';
import { Line, Bar, Doughnut } from 'recharts';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    revenue: 0,
    evidences: 0,
    transcriptions: 0,
    calculations: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    // TODO: Implementar API de analytics
    // Mock data por enquanto
    setAnalytics({
      totalUsers: 127,
      activeSubscriptions: 98,
      revenue: 487230.50,
      evidences: 1847,
      transcriptions: 423,
      calculations: 3291
    });
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            <span className="text-elite-accent">Analytics</span> Dashboard 📊
          </h1>
          <p className="text-elite-metal">
            Métricas e indicadores de performance do sistema
          </p>
        </div>

        {/* KPIs Principais */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <CipherGlassCard className="p-6 text-center">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-3xl font-title text-elite-accent mb-2">
              {analytics.totalUsers}
            </div>
            <div className="text-sm text-elite-metal">Usuários Totais</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-title text-elite-accent mb-2">
              {analytics.activeSubscriptions}
            </div>
            <div className="text-sm text-elite-metal">Assinaturas Ativas</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-2xl font-title text-elite-accent mb-2">
              R$ {(analytics.revenue / 1000).toFixed(0)}k
            </div>
            <div className="text-sm text-elite-metal">Receita Mês</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-4xl mb-2">🔐</div>
            <div className="text-3xl font-title text-elite-accent mb-2">
              {analytics.evidences}
            </div>
            <div className="text-sm text-elite-metal">Evidências</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-4xl mb-2">🎤</div>
            <div className="text-3xl font-title text-elite-accent mb-2">
              {analytics.transcriptions}
            </div>
            <div className="text-sm text-elite-metal">Transcrições</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-4xl mb-2">🧮</div>
            <div className="text-3xl font-title text-elite-accent mb-2">
              {analytics.calculations}
            </div>
            <div className="text-sm text-elite-metal">Cálculos</div>
          </CipherGlassCard>
        </div>

        {/* Uso por Módulo */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <CipherGlassCard className="p-6">
            <h3 className="text-xl font-title text-elite-text mb-6">Uso por Módulo</h3>
            <div className="space-y-4">
              {[
                { name: 'Advocacia', usage: 87, color: 'bg-blue-500' },
                { name: 'Perícia', usage: 94, color: 'bg-purple-500' },
                { name: 'Admin', usage: 62, color: 'bg-green-500' },
                { name: 'Diversos', usage: 78, color: 'bg-cyan-500' }
              ].map((module) => (
                <div key={module.name}>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-elite-text">{module.name}</span>
                    <span className="text-elite-accent font-semibold">{module.usage}%</span>
                  </div>
                  <div className="h-2 bg-surface-02 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${module.color} transition-all duration-1000`}
                      style={{ width: `${module.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CipherGlassCard>

          <CipherGlassCard className="p-6">
            <h3 className="text-xl font-title text-elite-text mb-6">Distribuição de Planos</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { plan: 'Basic', count: 23, color: 'badge-diversos' },
                { plan: 'Pro', count: 45, color: 'badge-advocacia' },
                { plan: 'Elite', count: 28, color: 'badge-pericia' },
                { plan: 'Corporate', count: 2, color: 'badge-admin' }
              ].map((item) => (
                <div key={item.plan} className="p-4 bg-surface-01 rounded-lg text-center">
                  <div className="text-2xl font-title text-elite-accent mb-2">
                    {item.count}
                  </div>
                  <div className={`category-badge ${item.color} text-xs`}>
                    {item.plan}
                  </div>
                </div>
              ))}
            </div>
          </CipherGlassCard>
        </div>

        {/* Atividade Recente */}
        <CipherGlassCard className="p-6">
          <h3 className="text-xl font-title text-elite-text mb-6">Atividade Recente</h3>
          <div className="space-y-3">
            {[
              { action: 'Evidência registrada', module: 'Evidence Vault', time: '2 min atrás', icon: '🔐' },
              { action: 'Transcrição concluída', module: 'VFT Pack', time: '15 min atrás', icon: '🎤' },
              { action: 'Processo analisado', module: 'Análise Processual', time: '1 hora atrás', icon: '⚖️' },
              { action: 'Elite Seal criado', module: 'Elite Seal', time: '2 horas atrás', icon: '🔒' },
              { action: 'Cálculo realizado', module: 'Calculadoras', time: '3 horas atrás', icon: '🧮' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface-01 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{activity.icon}</div>
                  <div>
                    <div className="text-elite-text font-semibold text-sm">{activity.action}</div>
                    <div className="text-elite-metal text-xs">{activity.module}</div>
                  </div>
                </div>
                <div className="text-elite-metal text-xs">{activity.time}</div>
              </div>
            ))}
          </div>
        </CipherGlassCard>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
