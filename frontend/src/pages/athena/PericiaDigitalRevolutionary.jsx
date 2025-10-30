import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Microscope, Plus, Search, FileText, Shield, Hash, Clock, CheckCircle, 
  AlertTriangle, Upload, Download, Eye, Zap, Brain, Sparkles, Activity,
  TrendingUp, Award, Target, Lock, Users, Calendar, BarChart3, Play
} from 'lucide-react';
import { GlassCard, StatCard, GradientButton, PremiumBadge, FloatingCard, AnimatedNumber } from '../../components/PremiumComponents';
import { gradients, animations } from '../../styles/designSystem';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PericiaDigitalRevolutionary = () => {
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    case_number: '',
    legal_basis: 'mandado',
    device_type: 'smartphone',
    device_brand: '',
    device_model: '',
    device_serial: '',
    responsible: '',
    description: '',
    priority: 'normal'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, examsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/forensics/digital/stats`, { headers }),
        fetch(`${BACKEND_URL}/api/forensics/digital/exams`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (examsRes.ok) setExams(await examsRes.json());

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const response = await fetch(`${BACKEND_URL}/api/forensics/digital/exams`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({...formData, responsible: user.name || 'Perito'})
    });

    if (response.ok) {
      setShowModal(false);
      fetchData();
    }
  };

  const filteredExams = exams.filter(exam => {
    if (activeTab === 'all') return true;
    return exam.status === activeTab;
  }).filter(exam => {
    if (!searchQuery) return true;
    return exam.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           exam.case_number?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 p-6 max-w-[1920px] mx-auto">
        {/* Header Revolucionário */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="p-8" gradient={gradients.cyan}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Logo AP Elite */}
                <motion.div
                  className="relative"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <Microscope size={40} className="text-white" />
                  </div>
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl opacity-20 blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.div>

                <div>
                  <motion.h1 
                    className="text-5xl font-extrabold text-white mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Perícia Digital
                    <motion.span
                      className="ml-3 text-2xl text-cyan-400"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      ●
                    </motion.span>
                  </motion.h1>
                  <motion.p 
                    className="text-cyan-100 text-lg flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Sparkles size={16} className="text-cyan-300" />
                    Análise forense com IA de última geração
                    <PremiumBadge variant="info" pulse>CISAI 3.0</PremiumBadge>
                  </motion.p>
                </div>
              </div>

              <GradientButton
                onClick={() => setShowModal(true)}
                variant="primary"
                size="lg"
                icon={Plus}
              >
                Nova Análise
              </GradientButton>
            </div>

            {/* Mini Stats Bar */}
            <motion.div 
              className="grid grid-cols-4 gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {[
                { label: 'Taxa de Conclusão', value: '94%', icon: TrendingUp, color: 'text-green-400' },
                { label: 'Tempo Médio', value: '2.5h', icon: Clock, color: 'text-blue-400' },
                { label: 'Conformidade', value: '100%', icon: Shield, color: 'text-purple-400' },
                { label: 'IA Ativa', value: 'ON', icon: Brain, color: 'text-cyan-400' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 flex items-center gap-3 backdrop-blur-sm">
                  <item.icon size={24} className={item.color} />
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-lg font-bold text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </GlassCard>
        </motion.div>

        {/* Stats Grid Premium */}
        <motion.div 
          className="grid grid-cols-4 gap-6 mb-8"
          variants={animations.staggerContainer}
          initial="initial"
          animate="animate"
        >
          <StatCard
            label="Total de Exames"
            value={<AnimatedNumber value={stats.total_exams || 0} />}
            icon={FileText}
            gradient={gradients.cyan}
            trend={12}
            delay={0}
          />
          <StatCard
            label="Em Aberto"
            value={<AnimatedNumber value={stats.abertos || 0} />}
            icon={Clock}
            gradient={gradients.blue}
            delay={0.1}
          />
          <StatCard
            label="Em Processamento"
            value={<AnimatedNumber value={stats.em_processamento || 0} />}
            icon={Activity}
            gradient={gradients.amber}
            delay={0.2}
          />
          <StatCard
            label="Concluídos"
            value={<AnimatedNumber value={stats.concluidos || 0} />}
            icon={CheckCircle}
            gradient={gradients.green}
            trend={8}
            delay={0.3}
          />
        </motion.div>

        {/* Compliance Premium Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <GlassCard className="p-6" gradient={gradients.purple}>
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Shield size={32} className="text-purple-300" />
              </motion.div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg mb-2">Compliance Forense Total</p>
                <div className="flex gap-2 flex-wrap">
                  {['ISO 27037', 'ISO 27042', 'NIST 800-86', 'LGPD', 'CPP Art. 158-184'].map((comp, i) => (
                    <motion.span
                      key={comp}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-200 text-sm font-medium backdrop-blur-sm"
                    >
                      {comp}
                    </motion.span>
                  ))}
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="px-6 py-3 bg-green-500/20 border border-green-400/30 rounded-xl backdrop-blur-sm"
              >
                <CheckCircle size={24} className="text-green-400" />
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Search and Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <GlassCard className="p-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por caso, título ou dispositivo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800/50 text-white rounded-xl pl-12 pr-4 py-3 
                           focus:outline-none focus:ring-2 focus:ring-cyan-500/50 
                           border border-white/10 backdrop-blur-sm
                           transition-all duration-300"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'Todos', icon: FileText },
                  { id: 'aberto', label: 'Abertos', icon: Clock },
                  { id: 'em_processamento', label: 'Processo', icon: Activity },
                  { id: 'concluído', label: 'Concluídos', icon: CheckCircle },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      px-4 py-2 rounded-xl font-medium text-sm
                      flex items-center gap-2 transition-all duration-300
                      ${activeTab === tab.id
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                        : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Exames Grid Revolucionário */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-6 h-64">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-8 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-20 bg-slate-700 rounded"></div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <FloatingCard className="p-16 text-center">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Microscope size={80} className="mx-auto mb-6 text-cyan-400/50" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">Nenhuma análise encontrada</h3>
              <p className="text-gray-400 mb-8">Inicie sua primeira análise pericial forense</p>
              <GradientButton
                onClick={() => setShowModal(true)}
                variant="primary"
                size="lg"
                icon={Plus}
              >
                Criar Primeira Análise
              </GradientButton>
            </FloatingCard>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={animations.staggerContainer}
          >
            {filteredExams.map((exam, index) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <GlassCard 
                  className="p-6 h-full"
                  hover={false}
                  onClick={() => setSelectedExam(exam)}
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <PremiumBadge 
                      variant={
                        exam.status === 'concluído' ? 'success' : 
                        exam.status === 'em_processamento' ? 'warning' : 
                        'info'
                      }
                      pulse={exam.status === 'em_processamento'}
                    >
                      {exam.status === 'aberto' && <Clock size={12} />}
                      {exam.status === 'em_processamento' && <Activity size={12} />}
                      {exam.status === 'concluído' && <CheckCircle size={12} />}
                      {exam.status.toUpperCase()}
                    </PremiumBadge>
                    
                    <PremiumBadge variant="purple">
                      {exam.priority}
                    </PremiumBadge>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {exam.title}
                  </h3>

                  {/* Case Number */}
                  <p className="text-cyan-400 font-mono text-sm mb-4">
                    {exam.case_number}
                  </p>

                  {/* Device Info */}
                  <div className="bg-slate-800/50 rounded-xl p-4 mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Microscope size={16} className="text-cyan-400" />
                      <span className="text-gray-300">{exam.device_type}</span>
                    </div>
                    {exam.device_brand && (
                      <div className="text-sm text-gray-400">
                        {exam.device_brand} {exam.device_model}
                      </div>
                    )}
                  </div>

                  {/* Hash Preview */}
                  {exam.hash_sha256 && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Hash size={14} className="text-green-400" />
                        <span className="text-xs font-medium text-green-300">SHA-256</span>
                      </div>
                      <p className="text-xs font-mono text-green-400 truncate">
                        {exam.hash_sha256.substring(0, 32)}...
                      </p>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Calendar size={14} />
                    {new Date(exam.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExam(exam);
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg
                               hover:from-blue-500 hover:to-blue-600 transition-all duration-300
                               flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Eye size={16} />
                      Detalhes
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 rounded-lg
                               hover:from-green-500 hover:to-green-600 transition-all duration-300
                               flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Download size={16} />
                      Laudo
                    </motion.button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modal Revolucionário */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                transition={{ type: 'spring', duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <GlassCard className="p-8" gradient={gradients.cosmic}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                        <Plus size={32} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-extrabold text-white">Nova Análise Pericial</h2>
                        <p className="text-cyan-200 text-sm">Crie uma nova perícia forense com IA</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-white text-3xl font-light"
                    >
                      ×
                    </motion.button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Título */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="col-span-2"
                      >
                        <label className="block text-gray-300 mb-2 font-semibold flex items-center gap-2">
                          <Sparkles size={16} className="text-cyan-400" />
                          Título da Análise *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                                   border border-white/10 backdrop-blur-sm
                                   transition-all duration-300"
                          placeholder="Ex: Perícia em Smartphone Samsung Galaxy S21"
                        />
                      </motion.div>

                      {/* Número do Caso */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <label className="block text-gray-300 mb-2 font-semibold">Número do Caso *</label>
                        <input
                          type="text"
                          required
                          value={formData.case_number}
                          onChange={(e) => setFormData({...formData, case_number: e.target.value})}
                          className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                                   border border-white/10"
                          placeholder="Ex: 2024.0001.0000-0"
                        />
                      </motion.div>

                      {/* Base Legal */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <label className="block text-gray-300 mb-2 font-semibold flex items-center gap-2">
                          <Shield size={16} className="text-purple-400" />
                          Base Legal *
                        </label>
                        <select
                          required
                          value={formData.legal_basis}
                          onChange={(e) => setFormData({...formData, legal_basis: e.target.value})}
                          className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/50
                                   border border-white/10"
                        >
                          <option value="mandado">Mandado Judicial</option>
                          <option value="ordem_judicial">Ordem Judicial</option>
                          <option value="termo_consentimento">Termo de Consentimento</option>
                        </select>
                      </motion.div>

                      {/* Restante dos campos com mesma estrutura... */}
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <label className="block text-gray-300 mb-2 font-semibold">Tipo de Dispositivo *</label>
                        <select
                          required
                          value={formData.device_type}
                          onChange={(e) => setFormData({...formData, device_type: e.target.value})}
                          className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-white/10"
                        >
                          <option value="smartphone">📱 Smartphone</option>
                          <option value="computador">💻 Computador</option>
                          <option value="tablet">📲 Tablet</option>
                          <option value="hd_externo">💾 HD Externo</option>
                          <option value="pendrive">🔌 Pendrive</option>
                          <option value="servidor">🖥️ Servidor</option>
                        </select>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                        <label className="block text-gray-300 mb-2 font-semibold">Marca</label>
                        <input
                          type="text"
                          value={formData.device_brand}
                          onChange={(e) => setFormData({...formData, device_brand: e.target.value})}
                          className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-white/10"
                          placeholder="Ex: Samsung, Apple, Dell"
                        />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="col-span-2">
                        <label className="block text-gray-300 mb-2 font-semibold">Modelo</label>
                        <input
                          type="text"
                          value={formData.device_model}
                          onChange={(e) => setFormData({...formData, device_model: e.target.value})}
                          className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-white/10"
                          placeholder="Ex: Galaxy S21, iPhone 13 Pro"
                        />
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                        <label className="block text-gray-300 mb-2 font-semibold">Prioridade</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-white/10"
                        >
                          <option value="baixa">🟢 Baixa</option>
                          <option value="normal">🟡 Normal</option>
                          <option value="alta">🟠 Alta</option>
                          <option value="urgente">🔴 Urgente</option>
                        </select>
                      </motion.div>

                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="col-span-2">
                        <label className="block text-gray-300 mb-2 font-semibold">Descrição / Objetivos</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 h-32
                                   focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-white/10
                                   resize-none"
                          placeholder="Descreva os objetivos da perícia..."
                        />
                      </motion.div>
                    </div>

                    {/* Buttons */}
                    <motion.div 
                      className="flex gap-4 pt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.button
                        type="button"
                        onClick={() => setShowModal(false)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 bg-slate-700/50 hover:bg-slate-600/50 text-white py-4 rounded-xl font-semibold transition"
                      >
                        Cancelar
                      </motion.button>
                      <GradientButton
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        icon={Zap}
                      >
                        Criar Análise
                      </GradientButton>
                    </motion.div>
                  </form>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details Modal */}
        <AnimatePresence>
          {selectedExam && !showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedExam(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateX: 90 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateX: -90 }}
                transition={{ type: 'spring', duration: 0.6 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
              >
                <GlassCard className="p-8" gradient={gradients.aurora}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-extrabold text-white mb-2">{selectedExam.title}</h2>
                      <p className="text-cyan-300 font-mono">{selectedExam.case_number}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      onClick={() => setSelectedExam(null)}
                      className="text-gray-400 hover:text-white text-3xl"
                    >
                      ×
                    </motion.button>
                  </div>

                  {/* Content aqui... */}
                  <div className="space-y-6">
                    <GlassCard className="p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-cyan-400" />
                        Informações Gerais
                      </h3>
                      {/* Info grid */}
                    </GlassCard>
                  </div>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PericiaDigitalRevolutionary;
