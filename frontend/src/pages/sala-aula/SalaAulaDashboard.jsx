import React from 'react';
import { Link } from 'react-router-dom';
import { useEntitlements } from '../../contexts/EntitlementsContext';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const SalaAulaDashboard = () => {
  const { hasAccess } = useEntitlements();

  const modules = [
    { id: 'courses', name: 'Cursos e Treinamentos', icon: '🎓', path: '/athena/courses' },
    { id: 'mentoring', name: 'Mentorias 1:1', icon: '🧑‍🏫', path: '/athena/mentoring' },
    { id: 'certificates', name: 'Certificados', icon: '🎖️', path: '/athena/certificates' },
    { id: 'content', name: 'Biblioteca de Conteúdo', icon: '📚', path: '/athena/content-library' },
    { id: 'assessments', name: 'Provas e Avaliações', icon: '📝', path: '/athena/assessments' },
    { id: 'progress', name: 'Dashboard de Progresso', icon: '📊', path: '/athena/progress' }
  ];

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            <span className="text-elite-accent">Sala de Aula</span> Elite 🎓
          </h1>
          <p className="text-elite-metal">
            Plataforma de educação jurídica e forense
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">47</div>
            <div className="text-sm text-elite-metal">Cursos Disponíveis</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">342</div>
            <div className="text-sm text-elite-metal">Alunos Ativos</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">1,847</div>
            <div className="text-sm text-elite-metal">Certificados Emitidos</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-success mb-2">94%</div>
            <div className="text-sm text-elite-metal">Taxa de Conclusão</div>
          </CipherGlassCard>
        </div>

        {/* Modules Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link key={module.id} to={module.path}>
              <CipherGlassCard 
                category="sala"
                className="p-6 text-center hover:scale-105 transition-all cursor-pointer"
              >
                <div className="text-5xl mb-4">{module.icon}</div>
                <h3 className="text-lg font-title text-elite-text mb-2">
                  {module.name}
                </h3>
                <div className="mt-4">
                  {hasAccess('sala-aula') ? (
                    <div className="category-badge badge-sala text-xs">ATIVO</div>
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

export default SalaAulaDashboard;
