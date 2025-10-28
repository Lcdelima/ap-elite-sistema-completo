import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Brain, Target, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { AthenaNavigationBar, AthenaEmptyState } from '../../components/AthenaComponents';

const TrialScience = () => {
  const [activeTab, setActiveTab] = useState('judge-profile');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const tabs = [
    { id: 'judge-profile', label: 'Perfil do Juiz', icon: <Scale size={20} /> },
    { id: 'narrative', label: 'Narrativa Tática', icon: <FileText size={20} /> },
    { id: 'stress-test', label: 'Stress Test', icon: <AlertCircle size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      <AthenaNavigationBar 
        title="Trial Science"
        subtitle="Ciência do Julgamento - Dr. Bull Strategy"
        backDestination="/admin/athena"
      />

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Scale className="text-cyan-400" size={36} />
          <div>
            <h2 className="text-3xl font-bold text-white">Trial Science Center</h2>
            <p className="text-neutral-400 mt-1">Estratégia e persuasão processual baseada em ciência</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-neutral-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 flex items-center gap-2 font-medium transition-all
                ${activeTab === tab.id 
                  ? 'text-cyan-400 border-b-2 border-cyan-400' 
                  : 'text-neutral-400 hover:text-neutral-200'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'judge-profile' && <JudgeProfile />}
        {activeTab === 'narrative' && <TacticalNarrative />}
        {activeTab === 'stress-test' && <StressTest />}
      </div>
    </div>
  );
};

const JudgeProfile = () => (
  <div className="space-y-6">
    <div className="p-6 rounded-xl bg-neutral-800/50 border border-neutral-700">
      <h3 className="text-xl font-bold text-white mb-4">Perfil de Magistrado</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-neutral-400 mb-2 block">Vara/Juízo</label>
          <input type="text" className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white" placeholder="Ex: 1ª Vara Criminal" />
        </div>
        <div>
          <label className="text-sm text-neutral-400 mb-2 block">Nome do Magistrado</label>
          <input type="text" className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white" placeholder="Opcional" />
        </div>
      </div>
      <button className="mt-4 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium">Analisar Perfil</button>
    </div>
  </div>
);

const TacticalNarrative = () => (
  <div className="space-y-6">
    <AthenaEmptyState icon="📖" title="Construção de Narrativa" subtitle="Em desenvolvimento" />
  </div>
);

const StressTest = () => (
  <div className="space-y-6">
    <AthenaEmptyState icon="🔍" title="Stress Test de Peça" subtitle="Em desenvolvimento" />
  </div>
);

export default TrialScience;