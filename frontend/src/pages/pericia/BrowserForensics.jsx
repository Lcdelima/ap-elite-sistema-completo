// Browser and Database Forensics - Elite Athena
import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const BrowserForensics = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [browserType, setBrowserType] = useState('chrome');

  const analyzeBrowser = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/browser-forensics/analyze`,
        { browser_type: browserType },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
        }
      );
      setAnalysis(response.data);
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const mockData = {
    history: [
      { url: 'https://example.com', visits: 47, last_visit: '2025-01-15T10:30:00Z' },
      { url: 'https://evidence-site.com', visits: 23, last_visit: '2025-01-15T09:20:00Z' }
    ],
    passwords: [
      { site: 'gmail.com', username: 'user@email.com', encrypted: true }
    ],
    cookies: 142,
    downloads: 23
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            Browser & Database <span className="text-elite-accent">Forensics</span> 🌐
          </h1>
          <p className="text-elite-metal">
            Análise forense de navegadores e bancos de dados
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1">
            <CipherGlassCard className="p-6">
              <h3 className="text-xl font-title text-elite-text mb-4">Configuração</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-elite-text text-sm font-semibold mb-2">
                    Navegador
                  </label>
                  <select
                    className="input-elite"
                    value={browserType}
                    onChange={(e) => setBrowserType(e.target.value)}
                  >
                    <option value="chrome">Google Chrome</option>
                    <option value="firefox">Mozilla Firefox</option>
                    <option value="edge">Microsoft Edge</option>
                    <option value="safari">Safari</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="history" defaultChecked />
                    <label htmlFor="history" className="text-elite-text text-sm">Histórico de navegação</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="passwords" defaultChecked />
                    <label htmlFor="passwords" className="text-elite-text text-sm">Senhas salvas</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="cookies" defaultChecked />
                    <label htmlFor="cookies" className="text-elite-text text-sm">Cookies</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="downloads" defaultChecked />
                    <label htmlFor="downloads" className="text-elite-text text-sm">Downloads</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="cache" />
                    <label htmlFor="cache" className="text-elite-text text-sm">Cache</label>
                  </div>
                </div>

                <button
                  onClick={analyzeBrowser}
                  disabled={loading}
                  className="btn-elite btn-elite-primary w-full"
                >
                  {loading ? 'Analisando...' : '🔍 Iniciar Análise'}
                </button>
              </div>
            </CipherGlassCard>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <CipherGlassCard className="p-6">
              <h3 className="text-xl font-title text-elite-text mb-6">Resultados da Análise</h3>
              
              {!analysis && !loading ? (
                <div className="text-center py-20 text-elite-metal">
                  <div className="text-6xl mb-4">🌐</div>
                  <p>Selecione as opções e clique em "Iniciar Análise"</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Histórico */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-elite-accent font-semibold">Histórico de Navegação</h4>
                      <div className="category-badge badge-pericia text-xs">
                        {mockData.history.length} registros
                      </div>
                    </div>
                    <div className="space-y-2">
                      {mockData.history.map((item, idx) => (
                        <div key={idx} className="p-3 bg-surface-01 rounded-lg border border-white/10">
                          <div className="text-elite-text text-sm font-semibold">{item.url}</div>
                          <div className="text-elite-metal text-xs mt-1">
                            {item.visits} visitas • Última: {new Date(item.last_visit).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Senhas */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-elite-accent font-semibold">Senhas Salvas</h4>
                      <div className="category-badge badge-pericia text-xs">
                        {mockData.passwords.length} encontradas
                      </div>
                    </div>
                    <div className="space-y-2">
                      {mockData.passwords.map((item, idx) => (
                        <div key={idx} className="p-3 bg-surface-01 rounded-lg border border-white/10">
                          <div className="text-elite-text text-sm font-semibold">{item.site}</div>
                          <div className="text-elite-metal text-xs mt-1">
                            Usuário: {item.username} • {item.encrypted ? '🔒 Criptografado' : '🔓 Texto claro'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-01 rounded-lg text-center">
                      <div className="text-2xl font-title text-elite-accent mb-2">{mockData.cookies}</div>
                      <div className="text-sm text-elite-metal">Cookies Encontrados</div>
                    </div>
                    <div className="p-4 bg-surface-01 rounded-lg text-center">
                      <div className="text-2xl font-title text-elite-accent mb-2">{mockData.downloads}</div>
                      <div className="text-sm text-elite-metal">Downloads Registrados</div>
                    </div>
                  </div>
                </div>
              )}
            </CipherGlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserForensics;
