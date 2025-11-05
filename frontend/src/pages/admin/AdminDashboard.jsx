import React from 'react';
import { Link } from 'react-router-dom';
import { useEntitlements } from '../../contexts/EntitlementsContext';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const AdminDashboard = () => {
  const { hasAccess } = useEntitlements();

  const modules = [
    { id: 'financial', name: 'Gestão Financeira', icon: '💰', path: '/athena/financial' },
    { id: 'users', name: 'Usuários e Permissões', icon: '👥', path: '/athena/user-management' },
    { id: 'billing', name: 'Faturamento e NF-e', icon: '🧯', path: '/athena/portal-cliente' },
    { id: 'storage', name: 'Storage Config', icon: '☁️', path: '/athena/storage-config' },
    { id: 'compliance', name: 'Compliance LGPD', icon: '✔️', path: '/athena/compliance' },
    { id: 'analytics', name: 'Analytics', icon: '📊', path: '/athena/analytics' },
    { id: 'marketplace', name: 'Marketplace', icon: '🔌', path: '/athena/marketplace' },
    { id: 'backup', name: 'Backup e Restore', icon: '💾', path: '/athena/backup' }
  ];

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            <span className="text-elite-accent">Administração</span> e Governança 🏢
          </h1>
          <p className="text-elite-metal">
            Gestão financeira, usuários e compliance ISO 27001
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">R$ 487k</div>
            <div className="text-sm text-elite-metal">Receita Mensal</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">127</div>
            <div className="text-sm text-elite-metal">Usuários Ativos</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-success mb-2">98%</div>
            <div className="text-sm text-elite-metal">Compliance</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">2.3TB</div>
            <div className="text-sm text-elite-metal">Storage Total</div>
          </CipherGlassCard>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
            <Link key={module.id} to={module.path}>
              <CipherGlassCard 
                category="admin"
                className="p-6 text-center hover:scale-105 transition-all cursor-pointer"
              >
                <div className="text-5xl mb-4">{module.icon}</div>
                <h3 className="text-lg font-title text-elite-text mb-2">
                  {module.name}
                </h3>
                <div className="mt-4">
                  {hasAccess('admin') ? (
                    <div className="category-badge badge-admin text-xs">ATIVO</div>
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

export default AdminDashboard;
