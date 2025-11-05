import React from 'react';
import { Link } from 'react-router-dom';
import { useEntitlements } from '../../contexts/EntitlementsContext';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const DiversosDashboard = () => {
  const { hasAccess } = useEntitlements();

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            <span className="text-elite-accent">Diversos</span> - Ferramentas
          </h1>
          <p className="text-elite-metal">
            Calculadoras, modelos e ferramentas de produtividade jurídica
          </p>
        </div>

        {/* Calculadoras */}
        <div className="mb-8">
          <h2 className="text-2xl font-title text-elite-text mb-4">Calculadoras Jurídicas</h2>
          <Link to="/athena/calculadoras">
            <CipherGlassCard category="diversos" className="p-8 hover:scale-102 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl mb-2">🧮</div>
                  <h3 className="text-2xl font-title text-elite-text mb-2">Calculadoras Jurídicas</h3>
                  <p className="text-elite-metal">
                    27+ calculadoras para todas as áreas: Criminal, Cível, Trabalhista, Previdenciário, Tributário, etc.
                  </p>
                </div>
                <div className="text-6xl text-elite-accent">→</div>
              </div>
            </CipherGlassCard>
          </Link>
        </div>

        {/* Transcrição */}
        <div className="mb-8">
          <h2 className="text-2xl font-title text-elite-text mb-4">Transcrição Forense</h2>
          <Link to="/athena/transcription-vft">
            <CipherGlassCard category="diversos" className="p-8 hover:scale-102 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl mb-2">🎤</div>
                  <h3 className="text-2xl font-title text-elite-text mb-2">VFT Pack™ - Transcrição</h3>
                  <p className="text-elite-metal">
                    Transcrição de áudio, vídeo, URL e interceptações com manifesto forense
                  </p>
                  <div className="flex space-x-2 mt-3">
                    <div className="category-badge badge-diversos text-xs">Whisper</div>
                    <div className="category-badge badge-diversos text-xs">Google</div>
                    <div className="category-badge badge-diversos text-xs">AssemblyAI</div>
                  </div>
                </div>
                <div className="text-6xl text-elite-accent">→</div>
              </div>
            </CipherGlassCard>
          </Link>
        </div>

        {/* Modelos e Formulários */}
        <div className="mb-8">
          <h2 className="text-2xl font-title text-elite-text mb-4">Modelos e Formulários</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/athena/template-generator">
              <CipherGlassCard category="diversos" className="p-6 hover:scale-105 transition-all cursor-pointer">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-xl font-title text-elite-text mb-2">Templates</h3>
                <p className="text-elite-metal text-sm">Modelos customizáveis</p>
              </CipherGlassCard>
            </Link>
            
            <Link to="/athena/document-library">
              <CipherGlassCard category="diversos" className="p-6 hover:scale-105 transition-all cursor-pointer">
                <div className="text-4xl mb-3">📚</div>
                <h3 className="text-xl font-title text-elite-text mb-2">Biblioteca</h3>
                <p className="text-elite-metal text-sm">Peças e formulários prontos</p>
              </CipherGlassCard>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiversosDashboard;
