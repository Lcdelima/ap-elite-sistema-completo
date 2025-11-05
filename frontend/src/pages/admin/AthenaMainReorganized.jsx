import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/elite-forensic.css';
import EliteWatermark from '../../components/EliteWatermark';

const AthenaMainReorganized = () => {
  const navigate = useNavigate();

  const mainModules = [
    {
      id: 'advocacia',
      name: 'Advocacia',
      description: 'Gestão jurídica completa',
      icon: '⚖️',
      path: '/athena/advocacia-dashboard',
      gradient: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)'
    },
    {
      id: 'pericia',
      name: 'Perícia Digital',
      description: 'Ferramentas forenses',
      icon: '🔬',
      path: '/athena/pericia-dashboard',
      gradient: 'linear-gradient(135deg, #5B21B6 0%, #8B5CF6 100%)'
    },
    {
      id: 'admin',
      name: 'Administração',
      description: 'Gestão e governança',
      icon: '🏢',
      path: '/athena/admin-dashboard',
      gradient: 'linear-gradient(135deg, #047857 0%, #10B981 100%)'
    },
    {
      id: 'comunicacao',
      name: 'Comunicação',
      description: 'Chat, vídeo e colaboração',
      icon: '💬',
      path: '/athena/comunicacao-dashboard',
      gradient: 'linear-gradient(135deg, #C2410C 0%, #F97316 100%)'
    },
    {
      id: 'sala-aula',
      name: 'Sala de Aula',
      description: 'Cursos e mentorias',
      icon: '🎓',
      path: '/athena/sala-aula-dashboard',
      gradient: 'linear-gradient(135deg, #A21CAF 0%, #E879F9 100%)'
    },
    {
      id: 'diversos',
      name: 'Diversos',
      description: 'Calculadoras e ferramentas',
      icon: '🧰',
      path: '/athena/diversos-dashboard',
      gradient: 'linear-gradient(135deg, #0E7490 0%, #06B6D4 100%)'
    }
  ];

  return (
    <div className="min-h-screen bg-elite">
      <EliteWatermark />
      
      {/* Header Elite */}
      <header className="header-elite">
        <div className="mx-auto max-w-screen-xl px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border" style={{
              background: 'rgba(0,163,196,0.15)',
              borderColor: 'rgba(0,163,196,0.3)'
            }}></div>
            <div>
              <div className="logo-elite" style={{ fontSize: '1.5rem', color: '#E4E6EB' }}>
                ELITE <span className="accent">ATHENA</span>
              </div>
              <div className="text-xs" style={{ color: 'rgba(228,230,235,0.5)' }}>
                Sistema Jurídico-Forense Completo
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/athena/portal-cliente" className="btn-elite btn-elite-secondary text-sm">
              👤 Minha Conta
            </Link>
            <button 
              onClick={() => {
                localStorage.clear();
                navigate('/');
              }}
              className="btn-elite btn-elite-secondary text-sm"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-12 px-6">
        <div className="mx-auto max-w-screen-xl">
          {/* Welcome */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
              Bem-vinda ao <span style={{ color: '#00A3C4' }}>Elite Athena</span>
            </h1>
            <p className="subtitle text-lg" style={{ color: 'rgba(228,230,235,0.7)' }}>
              Selecione um módulo para começar
            </p>
          </div>

          {/* Módulos Grid - 6 Principais */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {mainModules.map((module) => (
              <Link
                key={module.id}
                to={module.path}
                className="cipher-glass p-8 group cursor-pointer relative overflow-hidden"
                style={{ minHeight: '240px' }}
              >
                {/* Gradient Background on Hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                  style={{ background: module.gradient }}
                ></div>

                <div className="relative z-10">
                  <div className="text-6xl mb-6 transition-transform group-hover:scale-110 duration-300">
                    {module.icon}
                  </div>
                  
                  <h2 className="text-2xl font-title font-bold mb-3" style={{ color: '#E4E6EB' }}>
                    {module.name}
                  </h2>
                  
                  <p className="text-sm" style={{ color: 'rgba(228,230,235,0.6)' }}>
                    {module.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm" style={{ color: '#00A3C4' }}>
                    <span>Acessar</span>
                    <span className="transition-transform group-hover:translate-x-2">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Access */}
          <div className="mt-16 max-w-6xl mx-auto">
            <h3 className="text-2xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
              Acesso Rápido
            </h3>
            
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { name: 'Evidence Vault', path: '/athena/evidence-vault', icon: '🔐' },
                { name: 'Transcrição VFT', path: '/athena/transcription-vft', icon: '🎙️' },
                { name: 'Calculadoras', path: '/athena/calculadoras', icon: '🧮' },
                { name: 'Elite Seal', path: '/athena/elite-seal', icon: '🔒' },
                { name: 'Chat EliteLex', path: '/athena/chat-elitelex', icon: '🧠' },
                { name: 'Analytics', path: '/athena/analytics', icon: '📊' },
                { name: 'Marketplace', path: '/athena/marketplace', icon: '🔌' },
                { name: 'Publicações', path: '/athena/publicacoes', icon: '📰' }
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="cipher-glass p-4 group cursor-pointer hover:scale-105 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{item.icon}</div>
                    <div className="text-sm font-semibold" style={{ color: '#E4E6EB' }}>
                      {item.name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthenaMainReorganized;
