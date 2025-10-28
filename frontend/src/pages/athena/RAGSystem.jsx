import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Brain, History, Upload, TrendingUp } from 'lucide-react';

const RAGSystem = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [provider, setProvider] = useState('openai');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadStats();
    loadHistory();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/rag/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/rag/history?limit=10`);
      const data = await response.json();
      setHistory(data.queries || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          top_k: 5,
          use_context: true,
          provider: provider
        })
      });

      const data = await response.json();
      setResults(data);
      loadHistory();
      loadStats();
    } catch (error) {
      console.error('Erro na consulta:', error);
    } finally {
      setLoading(false);
    }
  };

  const indexLibrary = async () => {
    try {
      await fetch(`${backendUrl}/api/rag/batch-index-library?limit=10`, {
        method: 'POST'
      });
      alert('Indexação iniciada! Os documentos serão processados em segundo plano.');
      loadStats();
    } catch (error) {
      console.error('Erro ao indexar:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10" />
            RAG System - Busca Inteligente
          </h1>
          <p className="text-purple-200">
            Sistema de Recuperação Aumentada por Geração com IA
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <BookOpen className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.indexed_documents}</p>
              <p className="text-gray-300 text-sm">Documentos Indexados</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_chunks}</p>
              <p className="text-gray-300 text-sm">Chunks Processados</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Search className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_queries}</p>
              <p className="text-gray-300 text-sm">Consultas Realizadas</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Brain className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.embedding_dimensions}</p>
              <p className="text-gray-300 text-sm">Dimensões Embedding</p>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Search className="w-6 h-6" />
            Busca Contextual
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Provedor de IA
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
              >
                <option value="openai">OpenAI GPT-5</option>
                <option value="anthropic">Claude Sonnet 4</option>
                <option value="gemini">Gemini 2.5 Pro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Sua Consulta
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Quais são as melhores práticas para análise de malware em investigações criminais?"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 h-32"
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && executeQuery()}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={executeQuery}
                disabled={loading || !query.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Buscar com IA
                  </>
                )}
              </button>

              <button
                onClick={indexLibrary}
                className="px-6 py-3 bg-blue-500/30 hover:bg-blue-500/50 text-white rounded-lg flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Indexar Biblioteca
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Resultados</h2>

            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Resposta da IA</h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-sm">
                    {results.provider}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-sm">
                    Confiança: {(results.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-gray-200 whitespace-pre-wrap">{results.answer}</p>
            </div>

            {results.sources && results.sources.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Fontes Relevantes</h3>
                <div className="space-y-3">
                  {results.sources.map((source, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/20 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-white font-medium">{source.document}</p>
                        <span className="text-green-400 text-sm">Relevância: {(source.relevance * 100).toFixed(0)}%</span>
                      </div>
                      <p className="text-gray-400 text-sm">Página {source.page}</p>
                      <p className="text-gray-300 text-sm mt-2">{source.excerpt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <History className="w-6 h-6" />
              Histórico Recente
            </h2>
            <div className="space-y-2">
              {history.map((item, idx) => (
                <div key={idx} className="bg-white/5 border border-white/20 rounded-lg p-3 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => setQuery(item.query)}>
                  <p className="text-white font-medium">{item.query}</p>
                  <p className="text-gray-400 text-sm">Provedor: {item.provider} | {new Date(item.timestamp).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RAGSystem;