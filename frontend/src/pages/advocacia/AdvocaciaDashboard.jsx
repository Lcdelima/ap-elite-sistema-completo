import React from 'react';
import { Link } from 'react-router-dom';
import { useEntitlements } from '../../contexts/EntitlementsContext';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const AdvocaciaDashboard = () => {
  const { hasAccess } = useEntitlements();

  const modules = [
    { id: 'clients', name: 'Gestão de Clientes', icon: '👥', path: '/athena/clients' },
    { id: 'processes', name: 'Gestão de Processos', icon: '⚖️', path: '/athena/processes' },
    { id: 'analysis', name: 'Análise Processual Pro', icon: '🧠', path: '/athena/process-analysis-pro' },
    { id: 'contracts', name: 'Gerador de Contratos', icon: '📝', path: '/athena/contracts' },
    { id: 'documents', name: 'Gerador de Documentos', icon: '📄', path: '/athena/documents' },
    { id: 'deadlines', name: 'Prazos e Deadlines', icon: '⏰', path: '/athena/deadlines' },
    { id: 'fees', name: 'Honorários Inteligentes', icon: '💰', path: '/athena/smart-fees' },
    { id: 'reports', name: 'Relatórios Automatizados', icon: '📊', path: '/athena/automated-reports' }
  ];

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            <span className="text-elite-accent">Advocacia</span> Dashboard
          </h1>
          <p className="text-elite-metal">
            Módulo jurídico completo com gestão de processos e IA
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">47</div>
            <div className="text-sm text-elite-metal">Clientes Ativos</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">128</div>
            <div className="text-sm text-elite-metal">Processos</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-warn mb-2">12</div>
            <div className="text-sm text-elite-metal">Prazos Urgentes</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">R$ 487k</div>
            <div className="text-sm text-elite-metal">Receita Mês</div>
          </CipherGlassCard>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
            <Link key={module.id} to={module.path}>
              <CipherGlassCard 
                category="advocacia"
                className="p-6 text-center hover:scale-105 transition-all cursor-pointer"
              >
                <div className="text-5xl mb-4">{module.icon}</div>
                <h3 className="text-lg font-title text-elite-text mb-2">
                  {module.name}
                </h3>
                <div className="mt-4">
                  {hasAccess('advocacia') ? (
                    <div className="category-badge badge-advocacia text-xs">ATIVO</div>
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

export default AdvocaciaDashboard;
