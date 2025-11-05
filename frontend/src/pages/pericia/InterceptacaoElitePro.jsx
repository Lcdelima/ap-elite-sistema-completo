// Interceptação Elite Pro - Frontend - Elite Athena
import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const InterceptacaoElitePro = () => {
  const [interceptions, setInterceptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadInterceptions = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockData = [
        {
          id: '1',
          type: 'phone',
          date: '2025-01-15T14:30:00Z',
          duration: 180,
          participants: ['Alvo A', 'Contato B'],
          status: 'transcribed',
          has_authorization: true
        },
        {
          id: '2',
          type: 'data',
          date: '2025-01-15T16:45:00Z',
          size_mb: 45.3,
          participants: ['Alvo A'],
          status: 'processing',
          has_authorization: true
        }
      ];
      setInterceptions(mockData);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadInterceptions();
  }, []);

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            Interceptação <span className="text-elite-accent">Elite Pro</span> 📞
          </h1>
          <p className="text-elite-metal">
            Análise avançada de interceptações telemáticas e de dados
          </p>
          
          <div className="mt-4 p-3 bg-elite-warn/10 border border-elite-warn/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="text-elite-warn">⚠️</div>
              <div className="text-elite-warn text-sm font-semibold">
                Este módulo opera exclusivamente em conformidade com autorização judicial e LGPD.
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">47</div>
            <div className="text-sm text-elite-metal">Interceptações Ativas</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">1,247</div>
            <div className="text-sm text-elite-metal">Minutos Analisados</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-success mb-2">100%</div>
            <div className="text-sm text-elite-metal">Com Autorização</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6 text-center">
            <div className="text-3xl font-title text-elite-accent mb-2">89%</div>
            <div className="text-sm text-elite-metal">Taxa de Transcrição</div>
          </CipherGlassCard>
        </div>

        {/* Filters */}
        <div className="mb-6 flex space-x-2">
          {['all', 'phone', 'data', 'transcribed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                filter === f
                  ? 'bg-elite-accent text-elite-bg font-semibold'
                  : 'bg-surface-01 text-elite-metal hover:bg-surface-02'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'phone' ? 'Telefone' : f === 'data' ? 'Dados' : 'Transcritas'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {interceptions.map((item) => (
            <CipherGlassCard key={item.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-2xl">
                      {item.type === 'phone' ? '📞' : '📊'}
                    </div>
                    <h3 className="text-xl font-title text-elite-text">
                      {item.type === 'phone' ? 'Interceptação Telefônica' : 'Interceptação de Dados'}
                    </h3>
                  </div>
                  <div className="text-sm text-elite-metal">
                    {new Date(item.date).toLocaleString('pt-BR')}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className={`category-badge ${
                    item.status === 'transcribed' ? 'badge-admin' :
                    item.status === 'processing' ? 'badge-diversos' :
                    'badge-pericia'
                  } text-xs`}>
                    {item.status.toUpperCase()}
                  </div>
                  {item.has_authorization && (
                    <div className="verified-seal text-xs">
                      ⚖️ Autorizado
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-elite-metal mb-1">Participantes</div>
                  <div className="text-elite-text font-semibold">
                    {item.participants.join(', ')}
                  </div>
                </div>
                
                {item.duration && (
                  <div>
                    <div className="text-elite-metal mb-1">Duração</div>
                    <div className="text-elite-text font-semibold">
                      {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                )}
                
                {item.size_mb && (
                  <div>
                    <div className="text-elite-metal mb-1">Tamanho</div>
                    <div className="text-elite-text font-semibold">
                      {item.size_mb.toFixed(1)} MB
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 mt-4">
                <button className="btn-elite btn-elite-secondary text-sm py-2 px-4">
                  🎧 Ouvir/Ver
                </button>
                <button className="btn-elite btn-elite-secondary text-sm py-2 px-4">
                  📝 Transcrição
                </button>
                <button className="btn-elite btn-elite-secondary text-sm py-2 px-4">
                  📥 Export VFT
                </button>
              </div>
            </CipherGlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InterceptacaoElitePro;
