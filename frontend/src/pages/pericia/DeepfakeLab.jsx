import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const DeepfakeLab = () => {
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState('video');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeMedia = async () => {
    if (!file) {
      alert('Selecione um arquivo');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('media_type', mediaType);

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/deepfake/analyze`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );

      setAnalysis(response.data);
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score < 30) return '#27AE60';
    if (score < 70) return '#E67E22';
    return '#E74C3C';
  };

  const getVerdictText = (verdict) => {
    const map = {
      'authentic': 'Autêntico',
      'suspicious': 'Suspeito',
      'deepfake': 'Deepfake Detectado'
    };
    return map[verdict] || verdict;
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            Media Authenticity <span style={{ color: '#00A3C4' }}>Lab</span> 🕵️
          </h1>
          <p className="subtitle text-sm mt-2" style={{ color: 'rgba(228,230,235,0.6)' }}>
            Detecção de deepfakes e análise de autenticidade de mídia
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload e Config */}
          <div className="cipher-glass p-6">
            <h3 className="text-xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
              Analisar Mídia
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Tipo de Mídia
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['video', 'audio'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setMediaType(type)}
                      className="p-3 rounded-lg capitalize font-semibold transition-all"
                      style={{
                        background: mediaType === type ? '#00A3C4' : 'rgba(255,255,255,0.06)',
                        color: mediaType === type ? '#000' : '#E4E6EB',
                        border: `1px solid ${mediaType === type ? 'transparent' : 'rgba(199,190,183,0.2)'}'
                      }}
                    >
                      {type === 'video' ? '🎥 Vídeo' : '🎙️ Áudio'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Selecionar Arquivo
                </label>
                <input
                  type="file"
                  accept={mediaType === 'video' ? 'video/*' : 'audio/*'}
                  onChange={(e) => setFile(e.target.files[0])}
                  className="input-elite"
                />
                {file && (
                  <div className="mt-2 text-xs" style={{ color: '#00A3C4' }}>
                    ✔️ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <button
                onClick={analyzeMedia}
                disabled={loading || !file}
                className="btn-elite btn-elite-primary w-full"
              >
                {loading ? '🔍 Analisando...' : '🔬 Iniciar Análise'}
              </button>
            </div>
          </div>

          {/* Resultados */}
          <div className="cipher-glass p-6">
            <h3 className="text-xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
              Resultado da Análise
            </h3>
            
            {!analysis ? (
              <div className="text-center py-20" style={{ color: 'rgba(228,230,235,0.6)' }}>
                <div className="text-6xl mb-4">🕵️</div>
                <p>Selecione um arquivo e clique em "Iniciar Análise"</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Veredicto */}
                <div 
                  className="p-6 rounded-lg border-2 text-center"
                  style={{
                    borderColor: getRiskColor((analysis.deepfake_probability || analysis.voice_cloning_probability || 0) * 100),
                    background: getRiskColor((analysis.deepfake_probability || analysis.voice_cloning_probability || 0) * 100) + '15'
                  }}
                >
                  <div className="text-3xl font-title font-bold mb-2" style={{ color: getRiskColor((analysis.deepfake_probability || analysis.voice_cloning_probability || 0) * 100) }}>
                    {getVerdictText(analysis.verdict)}
                  </div>
                  <div className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>
                    Confiança: {(analysis.confidence * 100).toFixed(1)}%
                  </div>
                </div>

                {/* Indicadores */}
                <div>
                  <h4 className="font-bold mb-3" style={{ color: '#00A3C4' }}>Indicadores Técnicos</h4>
                  <div className="space-y-3">
                    {Object.entries(analysis.indicators).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-1 text-sm">
                          <span style={{ color: '#E4E6EB' }}>{key.replace(/_/g, ' ')}</span>
                          <span style={{ color: '#00A3C4' }}>{(value * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${value * 100}%`,
                              background: 'linear-gradient(90deg, #00A3C4, #27AE60)'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recomendações */}
                <div>
                  <h4 className="font-bold mb-3" style={{ color: '#00A3C4' }}>Recomendações</h4>
                  <div className="space-y-2">
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex gap-2 text-sm" style={{ color: '#E4E6EB' }}>
                        <span style={{ color: '#27AE60' }}>✓</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3">
                  <button className="btn-elite btn-elite-primary flex-1 text-sm">
                    📥 Download Laudo
                  </button>
                  <button className="btn-elite btn-elite-secondary flex-1 text-sm">
                    📊 Ver Detalhes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepfakeLab;
