import React from 'react';
import { Link } from 'react-router-dom';
import { useEntitlements } from '../../contexts/EntitlementsContext';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const PericiaDashboard = () => {
  const { hasAccess } = useEntitlements();

  const modules = [
    { id: 'forensics', name: 'Perícia Digital Complete', icon: '🔬', path: '/athena/digital-forensics' },
    { id: 'vault', name: 'Evidence Vault', icon: '🔐', path: '/athena/evidence-vault' },
    { id: 'seal', name: 'Elite Seal™', icon: '🔒', path: '/athena/elite-seal' },
    { id: 'interceptions', name: 'Interceptações', icon: '📞', path: '/athena/phone-interceptions-pro' },
    { id: 'extraction', name: 'Ultra Extraction Pro', icon: '📱', path: '/athena/ultra-extraction-pro' },
    { id: 'password', name: 'Password Recovery', icon: '🔓', path: '/athena/password-recovery-elite' },
    { id: 'recovery', name: 'Data Recovery', icon: '💾', path: '/athena/data-recovery-ultimate' },
    { id: 'usb', name: 'USB Forensics', icon: '🔌', path: '/athena/usb-forensics-pro' },
    { id: 'browser', name: 'Browser Forensics', icon: '🌐', path: '/athena/browser-forensics' },
    { id: 'media', name: 'Análise de Mídia', icon: '🎥', path: '/athena/media-analysis' },
    { id: 'ocr', name: 'OCR Avançado', icon: '📄', path: '/athena/ocr-dashboard' },
    { id: 'iped', name: 'IPED Integration', icon: '🗄️', path: '/athena/iped' }
  ];

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            <span className="text-elite-accent">Perícia</span> Digital Dashboard
          </h1>
          <p className="text-elite-metal">
            Ferramentas forenses de nível enterprise com cadeia de custódia
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">342</div>
            <div className="text-sm text-elite-metal">Evidências Registradas</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">98%</div>
            <div className="text-sm text-elite-metal">Integridade Verificada</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">156</div>
            <div className="text-sm text-elite-metal">Elite Seals Criados</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">2.3TB</div>
            <div className="text-sm text-elite-metal">Dados Processados</div>
          </CipherGlassCard>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
            <Link key={module.id} to={module.path}>
              <CipherGlassCard 
                category="pericia"
                className="p-6 text-center hover:scale-105 transition-all cursor-pointer"
              >
                <div className="text-5xl mb-4">{module.icon}</div>
                <h3 className="text-lg font-title text-elite-text mb-2">
                  {module.name}
                </h3>
                <div className="mt-4">
                  {hasAccess('pericia') ? (
                    <div className="category-badge badge-pericia text-xs">ATIVO</div>
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

export default PericiaDashboard;
