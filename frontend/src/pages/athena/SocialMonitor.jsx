import React, { useState, useEffect } from 'react';
import { Bell, TrendingUp, Users, AlertCircle, Activity, Eye } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const SocialMonitor = () => {
  const [entityName, setEntityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [entityType, setEntityType] = useState('person');
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/social-listening/alerts`);
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/social-listening/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const analyzeReputation = async () => {
    if (!entityName) return;

    setAnalyzing(true);
    try {
      const response = await fetch(`${backendUrl}/api/social-listening/reputation/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_name: entityName,
          entity_type: entityType
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10" />
            Social Listening - Monitoramento
          </h1>
          <p className="text-violet-200">Monitoramento de reputação e menções em tempo real</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Bell className="w-8 h-8 text-violet-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_alerts}</p>
              <p className="text-gray-300 text-sm">Alertas Ativos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_reputation_analyses}</p>
              <p className="text-gray-300 text-sm">Análises de Reputação</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Eye className="w-8 h-8 text-pink-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.platforms?.length || 0}</p>
              <p className="text-gray-300 text-sm">Plataformas Monitoradas</p>
            </div>
          </div>
        )}

        {/* Analysis Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Analisar Reputação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input type="text" value={entityName} onChange={(e) => setEntityName(e.target.value)}
              placeholder="Nome da pessoa ou empresa..."
              className="px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400" />
            <select value={entityType} onChange={(e) => setEntityType(e.target.value)}
              className="px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white">
              <option value="person">Pessoa</option>
              <option value="company">Empresa</option>
              <option value="brand">Marca</option>
            </select>
          </div>
          <button onClick={analyzeReputation} disabled={!entityName || analyzing}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 font-semibold">
            {analyzing ? 'Analisando...' : 'Analisar Reputação Online'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Resultado da Análise</h2>
              <div className="text-center">
                <p className={`text-4xl font-bold ${getScoreColor(result.reputation_score)}`}>
                  {result.reputation_score}
                </p>
                <p className="text-gray-400 text-sm">Score de Reputação</p>
              </div>
            </div>

            {/* Sentiment Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 text-center">
                <p className="text-green-400 text-2xl font-bold">{result.sentiment_breakdown.positive}</p>
                <p className="text-gray-300 text-sm">Positivo</p>
              </div>
              <div className="bg-gray-500/20 border border-gray-400/30 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-2xl font-bold">{result.sentiment_breakdown.neutral}</p>
                <p className="text-gray-300 text-sm">Neutro</p>
              </div>
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 text-center">
                <p className="text-red-400 text-2xl font-bold">{result.sentiment_breakdown.negative}</p>
                <p className="text-gray-300 text-sm">Negativo</p>
              </div>
            </div>

            {/* Mentions */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Menções Recentes ({result.total_mentions})</h3>
              <div className="space-y-2">
                {result.mentions.map((mention, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/20 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-white font-medium">{mention.platform}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        mention.sentiment === 'positive' ? 'bg-green-500/30 text-green-200' :
                        mention.sentiment === 'negative' ? 'bg-red-500/30 text-red-200' :
                        'bg-gray-500/30 text-gray-200'
                      }`}>{mention.sentiment}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{mention.content}</p>
                    <p className="text-gray-500 text-xs mt-1">{new Date(mention.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            {result.ai_analysis && (
              <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-3">Análise de IA</h3>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{result.ai_analysis}</p>
              </div>
            )}
          </div>
        )}

        {/* Active Alerts */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Alertas Ativos
          </h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-medium">Palavras-chave: {alert.keywords.join(', ')}</p>
                    <p className="text-gray-400 text-sm">Plataformas: {alert.platforms.join(', ')}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/30 text-green-200 rounded-full text-xs">
                    {alert.status}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">Frequência: {alert.alert_frequency}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMonitor;