import React, { useState } from 'react';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const MarketplaceIntegracoes = () => {
  const [installedIntegrations, setInstalledIntegrations] = useState(['s3', 'whisper']);

  const integrations = [
    {
      id: 's3',
      name: 'AWS S3',
      category: 'Storage',
      icon: '☁️',
      description: 'Armazenamento seguro na Amazon Web Services',
      status: 'installed',
      provider: 'Amazon',
      pricing: 'Pay-as-you-go'
    },
    {
      id: 'gdrive',
      name: 'Google Drive',
      category: 'Storage',
      icon: '📁',
      description: 'Integração com Google Drive e Workspace',
      status: 'available',
      provider: 'Google',
      pricing: 'Incluído'
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      category: 'Storage',
      icon: '💼',
      description: 'Microsoft OneDrive for Business',
      status: 'available',
      provider: 'Microsoft',
      pricing: 'Incluído'
    },
    {
      id: 'whisper',
      name: 'OpenAI Whisper',
      category: 'AI',
      icon: '🎤',
      description: 'Transcrição de áudio/vídeo de alta precisão',
      status: 'installed',
      provider: 'OpenAI',
      pricing: '$0.006/min'
    },
    {
      id: 'google-speech',
      name: 'Google Speech',
      category: 'AI',
      icon: '🗣️',
      description: 'Speech-to-Text do Google Cloud',
      status: 'available',
      provider: 'Google',
      pricing: '$0.006/min'
    },
    {
      id: 'assemblyai',
      name: 'AssemblyAI',
      category: 'AI',
      icon: '🧠',
      description: 'Transcrição especializada em legal/compliance',
      status: 'available',
      provider: 'AssemblyAI',
      pricing: '$0.015/min'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'Payments',
      icon: '💳',
      description: 'Gateway de pagamentos internacional',
      status: 'available',
      provider: 'Stripe',
      pricing: '4.99% + R$ 0.69'
    },
    {
      id: 'pagbank',
      name: 'PagBank',
      category: 'Payments',
      icon: '🏦',
      description: 'Pagamentos no Brasil (PIX, boleto, cartão)',
      status: 'available',
      provider: 'PagSeguro',
      pricing: '3-5%'
    },
    {
      id: 'iped',
      name: 'IPED',
      category: 'Forensics',
      icon: '🗄️',
      description: 'Indexador e Processador de Evidências Digitais',
      status: 'installed',
      provider: 'MPF',
      pricing: 'Gratuito'
    },
    {
      id: 'chromadb',
      name: 'ChromaDB',
      category: 'AI',
      icon: '🧬',
      description: 'Vector database para RAG jurídico',
      status: 'available',
      provider: 'Chroma',
      pricing: 'Gratuito'
    },
    {
      id: 'blockchain',
      name: 'Polygon',
      category: 'Blockchain',
      icon: '⛓️',
      description: 'Cadeia de custódia em blockchain',
      status: 'available',
      provider: 'Polygon',
      pricing: '$0.01/tx'
    }
  ];

  const categories = ['All', 'Storage', 'AI', 'Payments', 'Forensics', 'Blockchain'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredIntegrations = activeCategory === 'All' 
    ? integrations 
    : integrations.filter(i => i.category === activeCategory);

  const installIntegration = (integrationId) => {
    alert(`Instalando ${integrationId}... (Em desenvolvimento)`);
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            <span className="text-elite-accent">Marketplace</span> de Integrações 🔌
          </h1>
          <p className="text-elite-metal">
            Conecte serviços externos e expanda as capacidades da plataforma
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-elite-accent text-elite-bg font-semibold'
                  : 'bg-surface-01 text-elite-metal hover:bg-surface-02'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <CipherGlassCard key={integration.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{integration.icon}</div>
                <div className={`category-badge ${
                  integration.status === 'installed' ? 'badge-admin' : 'badge-diversos'
                } text-xs`}>
                  {integration.status === 'installed' ? 'INSTALADO' : 'DISPONÍVEL'}
                </div>
              </div>

              <h3 className="text-xl font-title text-elite-text mb-2">
                {integration.name}
              </h3>
              
              <div className="text-sm text-elite-metal mb-4">
                {integration.description}
              </div>

              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-elite-metal">Provider:</span>
                  <span className="text-elite-text font-semibold">{integration.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-elite-metal">Categoria:</span>
                  <span className="text-elite-text font-semibold">{integration.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-elite-metal">Preço:</span>
                  <span className="text-elite-accent font-semibold">{integration.pricing}</span>
                </div>
              </div>

              {integration.status === 'installed' ? (
                <button className="btn-elite btn-elite-secondary w-full" disabled>
                  ✅ Instalado
                </button>
              ) : (
                <button 
                  onClick={() => installIntegration(integration.id)}
                  className="btn-elite btn-elite-primary w-full"
                >
                  📥 Instalar
                </button>
              )}
            </CipherGlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceIntegracoes;
