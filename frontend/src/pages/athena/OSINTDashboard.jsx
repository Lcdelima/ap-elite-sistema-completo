import React, { useState, useEffect } from 'react';
import { Search, Globe, Shield, Users, Building2, MapPin, Cpu, Car, Briefcase, Moon, History, Brain } from 'lucide-react';

const OSINTDashboard = () => {
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [personName, setPersonName] = useState('');
  const [personCPF, setPersonCPF] = useState('');
  const [companyCNPJ, setCompanyCNPJ] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadCategories();
    loadHistory();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/osint/categories`);
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/osint/history`);
      const data = await response.json();
      setHistory(data.queries || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const executeQuery = async () => {
    if (!queryText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/osint/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText,
          sources: selectedCategory ? [selectedCategory] : [],
          use_ai_analysis: true
        })
      });

      const data = await response.json();
      setResults(data);
      loadHistory();
    } catch (error) {
      console.error('Erro na consulta:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzePerson = async () => {
    if (!personName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/osint/analyze-person?name=${encodeURIComponent(personName)}&cpf=${personCPF}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCompany = async () => {
    if (!companyCNPJ.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/osint/analyze-company?cnpj=${companyCNPJ}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      government: Shield,
      social_media: Users,
      legal: Briefcase,
      companies: Building2,
      geospatial: MapPin,
      technical: Cpu,
      vehicles: Car,
      utilities: Globe,
      professional: Briefcase,
      darkweb: Moon
    };
    return icons[category] || Globe;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Globe className="w-10 h-10" />
            OSINT - Inteligência de Fontes Abertas
          </h1>
          <p className="text-blue-200">
            Sistema avançado de investigação com fontes abertas brasileiras e internacionais
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(categories).map(([key, category]) => {
            const Icon = getCategoryIcon(key);
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedCategory === key
                    ? 'bg-blue-500/30 border-blue-400'
                    : 'bg-white/10 border-white/20 hover:bg-white/20'
                }`}
              >
                <Icon className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white text-sm text-center font-medium">
                  {category.name}
                </p>
                <p className="text-gray-300 text-xs text-center mt-1">
                  {category.sources.length} fontes
                </p>
              </button>
            );
          })}
        </div>

        {/* Query Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 mb-8">
          <div className="border-b border-white/20">
            <div className="flex gap-4 p-4">
              <button
                onClick={() => setResults(null)}
                className="px-4 py-2 bg-blue-500/30 text-white rounded-lg hover:bg-blue-500/50"
              >
                <Search className="w-4 h-4 inline mr-2" />
                Busca Geral
              </button>
              <button
                onClick={() => setResults(null)}
                className="px-4 py-2 bg-green-500/30 text-white rounded-lg hover:bg-green-500/50"
              >
                <Users className="w-4 h-4 inline mr-2" />
                Análise de Pessoa
              </button>
              <button
                onClick={() => setResults(null)}
                className="px-4 py-2 bg-purple-500/30 text-white rounded-lg hover:bg-purple-500/50"
              >
                <Building2 className="w-4 h-4 inline mr-2" />
                Análise de Empresa
              </button>
            </div>
          </div>

          {/* General Search */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-4">Busca Geral OSINT</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Consulta
                </label>
                <input
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="Digite sua consulta de investigação..."
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && executeQuery()}
                />
              </div>

              <button
                onClick={executeQuery}
                disabled={loading || !queryText.trim()}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processando com IA...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Executar Busca OSINT
                  </>
                )}
              </button>
            </div>

            {/* Person Analysis */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Análise de Pessoa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Nome completo..."
                  className="px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
                />
                <input
                  type="text"
                  value={personCPF}
                  onChange={(e) => setPersonCPF(e.target.value)}
                  placeholder="CPF (opcional)..."
                  className="px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
                />
              </div>
              <button
                onClick={analyzePerson}
                disabled={loading || !personName.trim()}
                className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 disabled:opacity-50"
              >
                <Users className="w-5 h-5 inline mr-2" />
                Analisar Pessoa (Multi-IA)
              </button>
            </div>

            {/* Company Analysis */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Análise de Empresa</h3>
              <input
                type="text"
                value={companyCNPJ}
                onChange={(e) => setCompanyCNPJ(e.target.value)}
                placeholder="CNPJ da empresa..."
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
              />
              <button
                onClick={analyzeCompany}
                disabled={loading || !companyCNPJ.trim()}
                className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50"
              >
                <Building2 className="w-5 h-5 inline mr-2" />
                Analisar Empresa
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Resultados da Análise
            </h2>

            {/* Sources */}
            {results.sources && results.sources.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Fontes Consultadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.sources.slice(0, 6).map((source, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/20 rounded-lg p-3">
                      <p className="text-white font-medium">{source.name}</p>
                      <p className="text-gray-300 text-sm">{source.description}</p>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 text-sm hover:underline mt-1 inline-block"
                      >
                        Acessar fonte →
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {results.ai_analysis && (
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Análise de Inteligência Artificial
                </h3>
                <div className="text-gray-200 whitespace-pre-wrap">
                  {results.ai_analysis}
                </div>
              </div>
            )}

            {/* Multi-Provider Analysis */}
            {results.multi_provider_analysis && (
              <div className="space-y-4">
                {results.multi_provider_analysis.results.map((result, idx) => {
                  if (!result.success) return null;
                  return (
                    <div key={idx} className="bg-white/5 border border-white/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain className="w-5 h-5 text-blue-400" />
                        <h4 className="text-white font-semibold">
                          {result.provider} ({result.model})
                        </h4>
                      </div>
                      <div className="text-gray-300 whitespace-pre-wrap">
                        {result.response}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <History className="w-6 h-6" />
              Histórico de Consultas
            </h2>
            <div className="space-y-2">
              {history.slice(0, 10).map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/20 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{item.query}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(item.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => setQueryText(item.query)}
                    className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-lg hover:bg-blue-500/50 text-sm"
                  >
                    Repetir
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OSINTDashboard;
