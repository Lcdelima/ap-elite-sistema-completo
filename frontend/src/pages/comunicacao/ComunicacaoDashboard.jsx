import React from 'react';
import { Link } from 'react-router-dom';
import { useEntitlements } from '../../contexts/EntitlementsContext';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const ComunicacaoDashboard = () => {
  const { hasAccess } = useEntitlements();

  const modules = [
    { id: 'chat', name: 'Chat Corporativo E2EE', icon: '💬', path: '/athena/collaboration' },
    { id: 'video', name: 'Videoconferência', icon: '📹', path: '/athena/video' },
    { id: 'calendar', name: 'Calendário', icon: '📅', path: '/athena/calendar' },
    { id: 'email', name: 'Email Integration', icon: '📧', path: '/athena/email' },
    { id: 'social', name: 'Social Listening', icon: '📱', path: '/athena/social-monitor' },
    { id: 'meetings', name: 'Meeting Links', icon: '🔗', path: '/athena/meeting-links' }
  ];

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            <span className="text-elite-accent">Comunicação</span> e Colaboração 💬
          </h1>
          <p className="text-elite-metal">
            Plataforma de comunicação segura com criptografia E2EE
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">1,247</div>
            <div className="text-sm text-elite-metal">Mensagens Hoje</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">23</div>
            <div className="text-sm text-elite-metal">Reuniões Agendadas</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-success mb-2">E2EE</div>
            <div className="text-sm text-elite-metal">Criptografia Ativa</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">47</div>
            <div className="text-sm text-elite-metal">Usuários Online</div>
          </CipherGlassCard>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link key={module.id} to={module.path}>
              <CipherGlassCard 
                category="comunicacao"
                className="p-6 text-center hover:scale-105 transition-all cursor-pointer"
              >
                <div className="text-5xl mb-4">{module.icon}</div>
                <h3 className="text-lg font-title text-elite-text mb-2">
                  {module.name}
                </h3>
                <div className="mt-4">
                  {hasAccess('comunicacao') ? (
                    <div className="category-badge badge-comunicacao text-xs">ATIVO</div>
                  ) : (
                    <div className="text-xs text-elite-warn">🔒 Bloqueado</div>
                  )}
                </div>
              </CipherGlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComunicacaoDashboard;
