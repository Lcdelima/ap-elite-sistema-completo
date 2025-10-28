import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, BarChart3, Brain, Activity, Zap } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const PredictiveAnalytics = () => {
  const [caseType, setCaseType] = useState('criminal_defense');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [evidenceQuality, setEvidenceQuality] = useState('medium');
  const [experience, setExperience] = useState(5);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [stats, setStats] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/predictive/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const predict = async () => {
    setPredicting(true);
    try {
      const response = await fetch(`${backendUrl}/api/predictive/predict-outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_type: caseType,
          evidence_quality: evidenceQuality,
          lawyer_experience: parseInt(experience)
        })
      });

      const data = await response.json();
      setPrediction(data);
      loadStats();
    } catch (error) {
      console.error('Erro na predição:', error);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900 to-orange-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="w-10 h-10" />
            Análise Preditiva com Machine Learning
          </h1>
          <p className="text-amber-200">Predição de resultados e recomendações estratégicas</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Target className="w-8 h-8 text-amber-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_predictions}</p>
              <p className="text-gray-300 text-sm">Predições Realizadas</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Activity className="w-8 h-8 text-orange-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.models_available?.length || 0}</p>
              <p className="text-gray-300 text-sm">Modelos Disponíveis</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Zap className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.algorithms?.length || 0}</p>
              <p className="text-gray-300 text-sm">Algoritmos ML</p>
            </div>
          </div>
        )}

        {/* Prediction Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Prever Resultado de Caso</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amber-200 mb-2">Tipo de Caso</label>
              <select value={caseType} onChange={(e) => setCaseType(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white">
                <option value="criminal_defense">Defesa Criminal</option>
                <option value="digital_forensics">Perícia Digital</option>
                <option value="osint_investigation">Investigação OSINT</option>
                <option value="litigation">Litigação</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-200 mb-2">Qualidade das Evidências</label>
              <select value={evidenceQuality} onChange={(e) => setEvidenceQuality(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white">
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-200 mb-2">Experiência do Advogado (anos)</label>
              <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)}
                min="0" max="50"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white" />
            </div>

            <button onClick={predict} disabled={predicting}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 font-semibold">
              {predicting ? 'Analisando com ML...' : 'Prever Resultado'}
            </button>
          </div>
        </div>

        {/* Prediction Result */}
        {prediction && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Resultado da Predição</h2>

            {/* Success Probability */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-lg p-8 mb-6 text-center">
              <p className="text-amber-200 text-sm mb-2">Probabilidade de Sucesso</p>
              <p className="text-white text-6xl font-bold mb-2">{prediction.success_probability}%</p>
              <p className="text-gray-300 text-sm">Intervalo de Confiança: {prediction.confidence_interval[0]}% - {prediction.confidence_interval[1]}%</p>
            </div>

            {/* Key Factors */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4">Fatores Chave</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Qualidade das Evidências</span>
                    <span className="text-white font-semibold">{(prediction.key_factors.evidence_quality * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{width: `${prediction.key_factors.evidence_quality * 100}%`}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Experiência do Advogado</span>
                    <span className="text-white font-semibold">{(prediction.key_factors.lawyer_experience * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: `${prediction.key_factors.lawyer_experience * 100}%`}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            {prediction.ai_insights && (
              <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Insights de IA
                </h3>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{prediction.ai_insights}</p>
              </div>
            )}
          </div>
        )}

        {/* Models & Algorithms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-bold mb-4">Modelos Disponíveis</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              {stats?.models_available?.map((model, idx) => (
                <li key={idx}>✓ {model}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-bold mb-4">Algoritmos de ML</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              {stats?.algorithms?.map((algo, idx) => (
                <li key={idx}>✓ {algo}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;