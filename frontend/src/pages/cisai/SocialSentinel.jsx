import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, TrendingUp, AlertCircle, Eye, Globe } from 'lucide-react';
import { AthenaNavigationBar } from '../../components/AthenaComponents';

const SocialSentinel = () => {
  const [monitors, setMonitors] = useState([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <AthenaNavigationBar 
        title="Social Sentinel"
        subtitle="Monitoramento Reputacional Inteligente"
        backDestination="/admin/athena"
      />

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="text-cyan-400" size={36} />
          <div>
            <h2 className="text-3xl font-bold text-white">Social Intelligence</h2>
            <p className="text-neutral-400 mt-1">Monitoramento e análise de reputação em tempo real</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<Eye />} label="Monitoramentos Ativos" value="12" color="cyan" />
          <StatCard icon={<TrendingUp />} label="Menções Hoje" value="47" color="blue" />
          <StatCard icon={<AlertCircle />} label="Alertas Críticos" value="3" color="red" />
        </div>

        <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
          <h3 className="text-xl font-bold text-white mb-4">Criar Novo Monitoramento</h3>
          <div className="space-y-4">
            <input type="text" className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white" placeholder="Nome ou empresa para monitorar" />
            <textarea className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white" rows="3" placeholder="Termos-chave (separados por vírgula)"></textarea>
            <button className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium">Ativar Monitoramento</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
    <div className="mb-4">{icon}</div>
    <div className="text-3xl font-bold text-white mb-2">{value}</div>
    <div className="text-sm text-neutral-400">{label}</div>
  </div>
);

export default SocialSentinel;