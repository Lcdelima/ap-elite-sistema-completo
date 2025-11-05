"""OSINT Dashboard - Elite Athena"""
import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const OSINTDashboardNew = () => {
  const [searchType, setSearchType] = useState('email');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Mock OSINT data
      const mockResults = {
        email: {
          found: true,
          breaches: 3,
          last_seen: '2024-12-15',
          platforms: ['LinkedIn', 'Twitter', 'Instagram'],
          risk_score: 67
        },
        phone: {
          found: true,
          carrier: 'Vivo',
          type: 'Móvel',
          location: 'São Paulo, SP',
          social_profiles: ['WhatsApp', 'Telegram']
        },
        name: {
          found: true,
          possible_aliases: ['João Silva', 'J. Silva'],
          addresses: ['Rua X, 123 - São Paulo'],
          companies: ['Empresa ABC Ltda'],
          relatives: ['Maria Silva', 'Pedro Silva']
        }
      };

      setResults(mockResults[searchType] || {});
    } catch (error) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            <span className="text-elite-accent">OSINT</span> Dashboard 🕵️
          </h1>
          <p className="text-elite-metal">
            Open Source Intelligence - Inteligência de fontes abertas
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Search Panel */}
          <div>
            <CipherGlassCard className="p-6">
              <h3 className="text-xl font-title text-elite-text mb-4">Nova Busca</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-elite-text text-sm font-semibold mb-2">
                    Tipo de Busca
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['email', 'phone', 'name'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSearchType(type)}
                        className={`p-2 rounded-lg capitalize text-sm ${
                          searchType === type
                            ? 'bg-elite-accent text-elite-bg font-semibold'
                            : 'bg-surface-01 text-elite-metal hover:bg-surface-02'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-elite-text text-sm font-semibold mb-2">
                    {searchType === 'email' ? 'E-mail' : searchType === 'phone' ? 'Telefone' : 'Nome'}
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchType === 'email' ? 'exemplo@email.com' :
                      searchType === 'phone' ? '(11) 99999-9999' :
                      'João da Silva'
                    }
                  />
                </div>

                <button
                  onClick={performSearch}
                  disabled={loading}
                  className="btn-elite btn-elite-primary w-full"
                >
                  {loading ? '🔍 Buscando...' : '🔍 Iniciar Busca OSINT'}
                </button>
              </div>
            </CipherGlassCard>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <CipherGlassCard className="p-6">
              <h3 className="text-xl font-title text-elite-text mb-6">Resultados</h3>
              
              {!results ? (
                <div className="text-center py-20 text-elite-metal">
                  <div className="text-6xl mb-4">🕵️</div>
                  <p>Digite uma consulta e clique em "Iniciar Busca"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchType === 'email' && results.found && (
                    <div>
                      <div className="p-4 bg-surface-01 rounded-lg border border-elite-accent/50 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-elite-accent font-semibold">✅ E-mail Encontrado</div>
                          <div className={`category-badge ${
                            results.risk_score > 70 ? 'badge-conformidade' :
                            results.risk_score > 40 ? 'badge-comunicacao' :
                            'badge-admin'
                          } text-xs`}>
                            Risco: {results.risk_score}%
                          </div>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-elite-metal">Data Breaches:</span>
                            <span className="text-elite-error font-semibold">{results.breaches} encontrados</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-elite-metal">Última Atividade:</span>
                            <span className="text-elite-text">{results.last_seen}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-elite-accent font-semibold mb-3 text-sm">Plataformas Identificadas:</div>
                        <div className="flex flex-wrap gap-2">
                          {results.platforms.map((platform, idx) => (
                            <div key={idx} className="category-badge badge-osint text-xs">
                              {platform}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {searchType === 'phone' && results.found && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-surface-01 rounded-lg">
                          <div className="text-elite-metal text-xs mb-1">Operadora</div>
                          <div className="text-elite-text font-semibold">{results.carrier}</div>
                        </div>
                        <div className="p-4 bg-surface-01 rounded-lg">
                          <div className="text-elite-metal text-xs mb-1">Tipo</div>
                          <div className="text-elite-text font-semibold">{results.type}</div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-surface-01 rounded-lg">
                        <div className="text-elite-metal text-xs mb-1">Localização</div>
                        <div className="text-elite-text font-semibold">{results.location}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CipherGlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSINTDashboardNew;
