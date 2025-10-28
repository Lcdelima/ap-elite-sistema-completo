import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, Activity, FileText, AlertTriangle, TrendingUp,
  Eye, Target, Shield, Zap, Users, Database, Clock
} from 'lucide-react';
import { 
  AthenaNavigationBar, 
  AthenaEmptyState, 
  AthenaLoadingSkeleton 
} from '../../components/AthenaComponents';

/**
 * 🧠 BEHAVIORAL FORENSICS - BAU
 * Análise comportamental estilo Criminal Minds
 */

const BehavioralForensics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const createProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/cisai/behavior/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alvo_tipo: 'suspeito',
          alvo_id: `S${Date.now()}`,
          texto_analise: 'Texto de análise comportamental...',
          contexto: 'Investigação criminal'
        })
      });
      const data = await response.json();
      setProfiles([data.data, ...profiles]);
      setSelectedProfile(data.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <AthenaNavigationBar 
        title="Behavioral Forensics"
        subtitle="Análise Comportamental - Criminal Minds BAU"
        backDestination="/admin/athena"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Unidade de Análise Comportamental</h2>
            <p className="text-neutral-400 mt-2">Sistema de perfilação psicológica forense</p>
          </div>
          
          <motion.button
            onClick={createProfile}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl
              bg-gradient-to-r from-cyan-500 to-blue-600
              text-white font-medium shadow-lg hover:shadow-cyan-500/50
              transition-all duration-300 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain size={20} />
            Novo Perfil
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="text-cyan-400" />}
            label="Perfis Ativos"
            value={profiles.length}
            color="cyan"
          />
          <StatCard
            icon={<Activity className="text-blue-400" />}
            label="Análises Hoje"
            value="12"
            color="blue"
          />
          <StatCard
            icon={<AlertTriangle className="text-orange-400" />}
            label="Risco Alto"
            value="3"
            color="orange"
          />
          <StatCard
            icon={<TrendingUp className="text-green-400" />}
            label="Taxa Precisão"
            value="87%"
            color="green"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profiles List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Perfis Recentes</h3>
            
            {loading ? (
              <AthenaLoadingSkeleton lines={3} />
            ) : profiles.length === 0 ? (
              <AthenaEmptyState
                icon="🧠"
                title="Nenhum perfil criado"
                subtitle="Crie um novo perfil comportamental"
                actionLabel="Criar Perfil"
                onAction={createProfile}
              />
            ) : (
              profiles.map((profile, index) => (
                <ProfileCard
                  key={index}
                  profile={profile}
                  onClick={() => setSelectedProfile(profile)}
                  isSelected={selectedProfile?.profile_id === profile.profile_id}
                />
              ))
            )}
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            {selectedProfile ? (
              <ProfileDetails profile={selectedProfile} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <AthenaEmptyState
                  icon="👈"
                  title="Selecione um perfil"
                  subtitle="Escolha um perfil para ver os detalhes"
                />
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <FeatureCard
            icon={<FileText className="text-cyan-400" />}
            title="Simulador de Audiência"
            description="Preveja reações em julgamentos"
            onClick={() => navigate('/admin/cisai/audience-sim')}
          />
          <FeatureCard
            icon={<Target className="text-blue-400" />}
            title="Roteiro de Perguntas"
            description="Gere perguntas éticas estratégicas"
            onClick={() => navigate('/admin/cisai/questions')}
          />
          <FeatureCard
            icon={<Shield className="text-purple-400" />}
            title="Stress Test Jurídico"
            description="Teste fragilidades em peças"
            onClick={() => navigate('/admin/cisai/stress-test')}
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <motion.div
    className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700
      hover:border-cyan-500/50 transition-all duration-300"
    whileHover={{ scale: 1.02, y: -2 }}
  >
    <div className="flex items-center justify-between mb-2">
      {icon}
      <span className={`text-${color}-400 text-sm font-medium`}>+12%</span>
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-neutral-400">{label}</div>
  </motion.div>
);

const ProfileCard = ({ profile, onClick, isSelected }) => (
  <motion.div
    onClick={onClick}
    className={`p-4 rounded-xl cursor-pointer transition-all duration-300
      ${isSelected 
        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-500' 
        : 'bg-neutral-800/50 border-neutral-700 hover:border-cyan-500/50'
      } border`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-start justify-between mb-2">
      <div>
        <h4 className="text-white font-semibold">{profile.alvo_tipo}</h4>
        <p className="text-sm text-neutral-400">{profile.profile_id.slice(0, 8)}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium
        ${profile.score_risco > 7 ? 'bg-red-500/20 text-red-400' :
          profile.score_risco > 4 ? 'bg-orange-500/20 text-orange-400' :
          'bg-green-500/20 text-green-400'}`}>
        Risco: {profile.score_risco}/10
      </span>
    </div>
    
    <div className="text-xs text-neutral-500">
      {new Date(profile.created_at).toLocaleString('pt-BR')}
    </div>
  </motion.div>
);

const ProfileDetails = ({ profile }) => (
  <div className="space-y-6">
    <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
      <h3 className="text-2xl font-bold text-white mb-4">Análise Comportamental</h3>
      
      {/* Score de Risco */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-neutral-400">Score de Risco</span>
          <span className="text-2xl font-bold text-cyan-400">{profile.score_risco}/10</span>
        </div>
        <div className="w-full bg-neutral-700 rounded-full h-3">
          <div 
            className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
            style={{ width: `${profile.score_risco * 10}%` }}
          />
        </div>
        <p className="text-sm text-neutral-400 mt-2">{profile.classificacao}</p>
      </div>

      {/* Análise Linguística */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Brain size={20} className="text-cyan-400" />
          Análise Linguística
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="Tom" value={profile.linguagem?.tom} />
          <InfoItem label="Coerência" value={`${profile.linguagem?.coerencia}/10`} />
          <InfoItem label="Complexidade" value={profile.linguagem?.complexidade_lexical} />
          <InfoItem label="1ª Pessoa" value={profile.linguagem?.uso_primeira_pessoa} />
        </div>
      </div>

      {/* Padrões Comportamentais */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Activity size={20} className="text-blue-400" />
          Padrões Comportamentais
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="Consistência" value={`${profile.padroes?.consistencia_narrativa}/10`} />
          <InfoItem label="Contradições" value={profile.padroes?.contradições_detectadas} />
          <InfoItem label="Timeline" value={profile.padroes?.timeline_coerente ? 'Coerente' : 'Incoerente'} />
        </div>
      </div>

      {/* Recomendações */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Target size={20} className="text-purple-400" />
          Recomendações Técnicas
        </h4>
        <ul className="space-y-2">
          {profile.recomendacoes?.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2 text-neutral-300">
              <Zap size={16} className="text-cyan-400 mt-1 flex-shrink-0" />
              <span className="text-sm">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Metadata */}
    <div className="p-4 rounded-xl bg-neutral-800/30 border border-neutral-700">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-400">Analisado por: {profile.analise_por}</span>
        <span className="text-neutral-400">Confiança: {(profile.confianca * 100).toFixed(0)}%</span>
      </div>
    </div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="p-3 rounded-lg bg-neutral-900/50">
    <div className="text-xs text-neutral-500 mb-1">{label}</div>
    <div className="text-white font-medium">{value}</div>
  </div>
);

const FeatureCard = ({ icon, title, description, onClick }) => (
  <motion.div
    onClick={onClick}
    className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700
      hover:border-cyan-500/50 cursor-pointer transition-all duration-300"
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-neutral-400">{description}</p>
  </motion.div>
);

export default BehavioralForensics;
