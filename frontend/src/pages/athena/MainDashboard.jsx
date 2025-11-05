// Dashboard Principal Modular - Elite Athena
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEntitlements } from '../../contexts/EntitlementsContext';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const MainDashboard = () => {
  const { planType, modules, hasAccess, getDaysUntilExpiration } = useEntitlements();

  const mainModules = [
    {
      id: 'advocacia',
      name: 'Advocacia',
      icon: '⚖️',
      color: 'advocacia',
      path: '/athena/advocacia-dashboard',
      description: 'Gestão de processos, clientes e peças jurídicas'
    },
    {
      id: 'pericia',
      name: 'Perícia Digital',
      icon: '🔬',
      color: 'pericia',
      path: '/athena/pericia-dashboard',
      description: 'Ferramentas forenses e cadeia de custódia'
    },
    {
      id: 'admin',
      name: 'Administração',
      icon: '🏢',
      color: 'admin',
      path: '/athena/admin-dashboard',
      description: 'Gestão financeira, usuários e governança'
    },
    {
      id: 'comunicacao',
      name: 'Comunicação',
      icon: '💬',
      color: 'comunicacao',
      path: '/athena/comunicacao-dashboard',
      description: 'Chat, vídeo, email e colaboração'
    },
    {
      id: 'sala-aula',
      name: 'Sala de Aula',
      icon: '🎓',
      color: 'sala',
      path: '/athena/sala-aula-dashboard',
      description: 'Cursos, mentorias e certificações'
    },
    {
      id: 'diversos',
      name: 'Diversos',
      icon: '🧰',
      color: 'diversos',
      path: '/athena/diversos-dashboard',
      description: 'Calculadoras, transcrição e modelos'
    }
  ];

  return (
    <div className="min-h-screen bg-elite p-6">
      {/* Header */}
      <div className="container mx-auto max-w-7xl mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-title text-elite-text mb-2">
              <span className="text-elite-accent">ELITE</span> ATHENA
            </h1>
            <p className="text-elite-metal">
              Sistema Jurídico-Forense Integrado | Plano: <span className="text-elite-accent capitalize">{planType || 'Nenhum'}</span>
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/athena/portal-cliente" className="btn-elite btn-elite-secondary">
              👤 Minha Conta
            </Link>
            <Link to="/athena/analytics" className="btn-elite btn-elite-secondary">
              📊 Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Command Palette Info */}
      <div className="container mx-auto max-w-7xl mb-6">
        <CipherGlassCard className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-elite-metal">
              🔍 Pressione <kbd className="px-2 py-1 bg-surface-02 rounded text-elite-accent font-mono">Ctrl+K</kbd> para busca rápida
            </div>
            <div className="flex items-center space-x-4 text-elite-metal">
              <div>✅ {Object.keys(modules).length} módulos ativos</div>
              <div>🔒 Sessão segura</div>
            </div>
          </div>
        </CipherGlassCard>
      </div>

      {/* Main Modules */}
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mainModules.map((module) => {
            const hasModuleAccess = hasAccess(module.id) || planType === 'corporate';
            const daysRemaining = getDaysUntilExpiration(module.id);
            
            return (
              <Link key={module.id} to={hasModuleAccess ? module.path : '#'}>
                <CipherGlassCard
                  category={module.color}
                  className={`p-8 transition-all ${
                    hasModuleAccess
                      ? 'hover:scale-105 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">{module.icon}</div>
                    <h2 className="text-2xl font-title text-elite-text mb-3">
                      {module.name}
                    </h2>
                    <p className="text-elite-metal text-sm mb-4">
                      {module.description}
                    </p>
                    
                    {hasModuleAccess ? (
                      <div>
                        <div className={`category-badge badge-${module.color} text-xs mb-2`}>
                          ATIVO
                        </div>
                        {daysRemaining !== null && daysRemaining <= 7 && (
                          <div className="text-xs text-elite-warn mt-2">
                            ⚠️ Expira em {daysRemaining} dias
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs text-elite-warn mb-2">
                          🔒 Módulo bloqueado
                        </div>
                        <Link to="/athena/portal-cliente">
                          <button className="btn-elite btn-elite-primary text-xs py-1 px-3 mt-2">
                            Fazer Upgrade
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CipherGlassCard>
              </Link>
            );
          })}
        </div>

        {/* Quick Access */}
        <div>
          <h3 className="text-2xl font-title text-elite-text mb-6">Acesso Rápido</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: 'Evidence Vault', path: '/athena/evidence-vault', icon: '🔐' },
              { name: 'Transcrição VFT', path: '/athena/transcription-vft', icon: '🎤' },
              { name: 'Calculadoras', path: '/athena/calculadoras', icon: '🧮' },
              { name: 'Elite Seal', path: '/athena/elite-seal', icon: '🔒' },
              { name: 'Storage Config', path: '/athena/storage-config', icon: '☁️' },
              { name: 'Chat EliteLex', path: '/athena/chat-elitelex', icon: '🧠' },
              { name: 'Marketplace', path: '/athena/marketplace', icon: '🔌' },
              { name: 'Analytics', path: '/athena/analytics', icon: '📊' }
            ].map((item) => (
              <Link key={item.path} to={item.path}>
                <CipherGlassCard className="p-4 hover:scale-105 transition-all cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{item.icon}</div>
                    <div className="text-elite-text font-semibold text-sm">
                      {item.name}
                    </div>
                  </div>
                </CipherGlassCard>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
