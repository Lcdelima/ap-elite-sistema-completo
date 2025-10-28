import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Zap, FileText, Users, Briefcase, Database } from 'lucide-react';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const loadHistory = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/search/history?limit=10`);
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/search/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
    }
  };

  const executeSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/search/global`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          limit: 10
        })
      });

      const data = await response.json();
      setResults(data);
      loadHistory();
      loadStats();
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (module) => {
    const icons = {
      cases: Briefcase,
      clients: Users,
      documents: FileText,
      evidence: Database,
      workflows: Filter,
      fees: FileText
    };
    return icons[module] || Search;
  };

  const getModuleColor = (module) => {
    const colors = {
      cases: 'from-blue-500 to-blue-700',
      clients: 'from-green-500 to-green-700',
      documents: 'from-purple-500 to-purple-700',
      evidence: 'from-red-500 to-red-700',
      workflows: 'from-yellow-500 to-yellow-700',
      fees: 'from-pink-500 to-pink-700'
    };
    return colors[module] || 'from-gray-500 to-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Search className="w-10 h-10" />
            Busca Global Unificada
          </h1>
          <p className="text-gray-300">
            Busque em todos os módulos simultaneamente
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Search className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_searches}</p>
              <p className="text-gray-300 text-sm">Buscas Realizadas</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Database className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.modules_available?.length || 0}</p>
              <p className="text-gray-300 text-sm">Módulos Disponíveis</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Zap className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-white text-2xl font-bold">Instantânea</p>
              <p className="text-gray-300 text-sm">Busca Paralela</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && executeSearch()}
                placeholder="Buscar em todos os módulos: casos, clientes, documentos, evidências..."
                className="w-full pl-14 pr-4 py-4 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 text-lg"
              />
            </div>

            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setQuery(suggestion);
                      setSuggestions([]);
                    }}
                    className="px-4 py-3 hover:bg-gray-700 cursor-pointer text-white flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={executeSearch}
            disabled={loading || !query.trim()}
            className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 font-semibold text-lg"
          >
            {loading ? 'Buscando...' : 'Buscar em Todos os Módulos'}
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Resultados</h2>
                <span className="px-4 py-2 bg-blue-500/30 text-blue-200 rounded-full font-semibold">
                  {results.total_results} encontrados
                </span>
              </div>
              <p className="text-gray-300">
                Buscando por: <span className="text-white font-semibold">"{results.query}"</span>
              </p>
              <p className="text-gray-400 text-sm">
                {results.modules_searched} módulos pesquisados
              </p>
            </div>

            {results.results.map((moduleResult) => {
              const ModuleIcon = getModuleIcon(moduleResult.module);
              return (
                <div key={moduleResult.module} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getModuleColor(moduleResult.module)}`}>
                      <ModuleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{moduleResult.module_name}</h3>
                      <p className="text-gray-400 text-sm">{moduleResult.count} resultados</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {moduleResult.results.map((item, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-all">
                        <p className="text-white font-medium mb-1">
                          {item.title || item.name || item.filename || 'Item'}
                        </p>
                        {item.description && (
                          <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {item.case_number && (
                            <span className="px-2 py-1 bg-blue-500/30 text-blue-200 rounded text-xs">
                              {item.case_number}
                            </span>
                          )}
                          {item.status && (
                            <span className="px-2 py-1 bg-green-500/30 text-green-200 rounded text-xs">
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* History */}
        {!results && history.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Buscas Recentes
            </h2>
            <div className="space-y-2">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setQuery(item.query)}
                  className="bg-white/5 border border-white/20 rounded-lg p-3 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <p className="text-white font-medium">{item.query}</p>
                  <p className="text-gray-400 text-sm">
                    {item.total_results} resultados | {new Date(item.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;