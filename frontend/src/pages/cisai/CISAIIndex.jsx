import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, Shield, Globe, Scale, Bell, Smartphone,
  ArrowRight, Zap, Target, Lock, Eye, Network
} from 'lucide-react';
import { AthenaNavigationBar } from '../../components/AthenaComponents';

/**
 * 🦅 ATHENA ELITE CISAI - INDEX
 * Central de Inteligência e Análise
 */

const CISAIIndex = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'behavioral',
      title: 'Behavioral Forensics',
      subtitle: 'Análise Comportamental - Criminal Minds BAU',
      description: 'Perfis psicológicos, simulação de audiência e roteiro ético de perguntas',
      icon: <Brain size={32} />,
      color: 'cyan',
      gradient: 'from-cyan-500 to-cyan-600',
      route: '/admin/cisai/behavioral',
      features: ['Perfil Comportamental', 'Simulador de Audiência', 'Roteiro de Perguntas'],
      status: 'operational'
    },
    {
      id: 'command',
      title: 'Forensic Command',
      subtitle: 'War Room - Centro de Comando',
      description: 'Dashboard 360º, integridade de evidências e gestão de prazos',
      icon: <Shield size={32} />,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      route: '/admin/cisai/command',
      features: ['Dashboard 360º', 'Verificação de Integridade', 'Gestão de Prazos'],
      status: 'operational'
    },
    {
      id: 'cyberintel',
      title: 'CyberIntel Fusion',
      subtitle: 'OSINT + Enrichment - NCIS Cyber',
      description: 'Enriquecimento de dados, correlação e grafo de relacionamentos',
      icon: <Globe size={32} />,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      route: '/admin/cisai/cyberintel',
      features: ['Entity Enrichment', 'Network Graph', 'Vazamentos'],
      status: 'operational'
    },
    {
      id: 'trial',
      title: 'Trial Science',
      subtitle: 'Ciência do Julgamento - Dr. Bull',
      description: 'Perfil de juiz, narrativa tática e stress test de peças',
      icon: <Scale size={32} />,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      route: '/admin/cisai/trial-science',
      features: ['Judge Profiling', 'Narrativa Tática', 'Legal Stress Test'],
      status: 'operational'
    },
    {
      id: 'social',
      title: 'Social Sentinel',
      subtitle: 'Monitoramento Reputacional',
      description: 'Análise de sentimento, alertas e dossiê de menções',
      icon: <Bell size={32} />,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      route: '/admin/cisai/social-sentinel',
      features: ['Monitoramento 24/7', 'Análise de Sentimento', 'Dossiê Forense'],
      status: 'operational'
    },
    {
      id: 'mobile',
      title: 'Mobile Forensics',
      subtitle: 'Extração Forense de Celulares',
      description: 'Extração lógica, física, JTAG e chip-off',
      icon: <Smartphone size={32} />,
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      route: '/admin/cisai/mobile-forensics',
      features: ['Extração Lógica', 'JTAG/Chip-off', 'Cadeia de Custódia'],
      status: 'operational'
    }
  ];

  const stats = [
    { label: 'Núcleos Ativos', value: '6', icon: <Target size={20} />, color: 'cyan' },
    { label: 'Análises Hoje', value: '47', icon: <Zap size={20} />, color: 'blue' },
    { label: 'Taxa de Precisão', value: '94%', icon: <Eye size={20} />, color: 'green' },
    { label: 'Integridade', value: '100%', icon: <Lock size={20} />, color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <AthenaNavigationBar 
        title="ATHENA ELITE CISAI"
        subtitle="Centro Integrado de Sistemas de Análise e Inteligência"
        backDestination="/admin/athena"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            <span className="text-cyan-400 font-medium">SISTEMA OPERACIONAL</span>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            🦅 ATHENA ELITE CISAI
          </h1>
          <p className="text-xl text-neutral-300 mb-2">
            Centro Integrado de Sistemas de Análise e Inteligência
          </p>
          <p className="text-neutral-400">
            Inspirado em: Criminal Minds BAU • NCIS Cyber • Dr. Bull • CIA Intelligence
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700
                hover:border-cyan-500/50 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`text-${stat.color}-400`}>{stat.icon}</div>
                <span className="text-green-400 text-sm font-medium">ONLINE</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-neutral-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, idx) => (
            <ModuleCard 
              key={module.id} 
              module={module} 
              index={idx}
              onClick={() => navigate(module.route)}
            />
          ))}
        </div>

        {/* System Info */}
        <motion.div
          className="mt-12 p-6 rounded-xl bg-neutral-800/30 border border-neutral-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Network className="text-cyan-400" size={24} />
              <div>
                <p className="text-white font-medium">ATHENA CISAI v1.0</p>
                <p className="text-sm text-neutral-400">Sistema Pioneiro de Inteligência Forense</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-neutral-400">
              <div>
                <span className="text-neutral-500">Classificação: </span>
                <span className="text-red-400 font-medium">TOP SECRET - CISAI ONLY</span>
              </div>
              <div>
                <span className="text-neutral-500">Uptime: </span>
                <span className="text-green-400 font-medium">99.8%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const ModuleCard = ({ module, index, onClick }) => (
  <motion.div
    className="group relative p-6 rounded-xl bg-neutral-800/50 border border-neutral-700
      hover:border-cyan-500/50 cursor-pointer transition-all duration-300 overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.02, y: -4 }}
    onClick={onClick}
  >
    {/* Gradient Background */}
    <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
    
    {/* Status Badge */}
    <div className="absolute top-4 right-4">
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-green-400 font-medium uppercase">{module.status}</span>
      </div>
    </div>

    {/* Icon */}
    <div className={`mb-4 text-${module.color}-400 transform group-hover:scale-110 transition-transform duration-300`}>
      {module.icon}
    </div>

    {/* Title */}
    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
      {module.title}
    </h3>
    
    {/* Subtitle */}
    <p className="text-sm text-neutral-400 mb-3">
      {module.subtitle}
    </p>

    {/* Description */}
    <p className="text-sm text-neutral-300 mb-4 line-clamp-2">
      {module.description}
    </p>

    {/* Features */}
    <div className="space-y-2 mb-4">
      {module.features.map((feature, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs text-neutral-400">
          <Zap size={12} className={`text-${module.color}-400`} />
          <span>{feature}</span>
        </div>
      ))}
    </div>

    {/* Action */}
    <div className="flex items-center gap-2 text-cyan-400 font-medium text-sm group-hover:gap-3 transition-all">
      <span>Acessar Módulo</span>
      <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
    </div>
  </motion.div>
);

export default CISAIIndex;
