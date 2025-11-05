import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const CloudForensics = () => {
  const [provider, setProvider] = useState('aws');
  const [service, setService] = useState('cloudtrail');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const analyzeCloud = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/cloud-forensics/analyze`,
        {
          provider,
          service,
          start_date: dateRange.start,
          end_date: dateRange.end
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setAnalysis(response.data);
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (score) => {
    if (score > 70) return { bg: '#E74C3C', text: 'ALTO' };
    if (score > 40) return { bg: '#E67E22', text: 'MÉDIO' };
    return { bg: '#27AE60', text: 'BAIXO' };
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            Cloud <span style={{ color: '#00A3C4' }}>Forensics</span> ☁️
          </h1>
          <p className="subtitle text-sm mt-2" style={{ color: 'rgba(228,230,235,0.6)' }}>
            Análise forense de logs AWS, Google Cloud e Azure
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuração */}
          <div className="cipher-glass p-6">
            <h3 className="text-xl font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>Configuração</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>Provider</label>
                <select className="input-elite" value={provider} onChange={(e) => setProvider(e.target.value)}>
                  <option value="aws">AWS</option>
                  <option value="gcp">Google Cloud</option>
                  <option value="azure">Microsoft Azure</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>Serviço</label>
                <select className="input-elite" value={service} onChange={(e) => setService(e.target.value)}>
                  {provider === 'aws' && (
                    <>
                      <option value="cloudtrail">CloudTrail</option>
                      <option value="cloudwatch">CloudWatch</option>
                      <option value="s3_logs">S3 Access Logs</option>
                    </>
                  )}
                  {provider === 'gcp' && (
                    <>
                      <option value="workspace_logs">Workspace Logs</option>
                      <option value="audit_logs">Audit Logs</option>
                    </>
                  )}
                  {provider === 'azure' && (
                    <>
                      <option value="monitor">Azure Monitor</option>
                      <option value="ad_logs">AD Logs</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>Período</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" className="input-elite text-sm" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                  <input type="date" className="input-elite text-sm" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
                </div>
              </div>

              <button onClick={analyzeCloud} disabled={loading} className="btn-elite btn-elite-primary w-full">
                {loading ? 'Analisando...' : '🔍 Analisar Logs'}
              </button>
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-2">
            {!analysis ? (
              <div className="cipher-glass p-20 text-center" style={{ color: 'rgba(228,230,235,0.6)' }}>
                <div className="text-6xl mb-4">☁️</div>
                <p>Configure e clique em "Analisar Logs"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="cipher-glass p-6 text-center">
                    <div className="text-3xl font-title font-bold mb-2" style={{ color: '#00A3C4' }}>
                      {analysis.summary.total_events}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(228,230,235,0.7)' }}>Total de Eventos</div>
                  </div>
                  <div className="cipher-glass p-6 text-center">
                    <div className="text-3xl font-title font-bold mb-2" style={{ color: '#E74C3C' }}>
                      {analysis.summary.high_risk}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(228,230,235,0.7)' }}>Alto Risco</div>
                  </div>
                  <div className="cipher-glass p-6 text-center">
                    <div className="text-3xl font-title font-bold mb-2" style={{ color: '#E67E22' }}>
                      {analysis.summary.medium_risk}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(228,230,235,0.7)' }}>Médio Risco</div>
                  </div>
                </div>

                {/* Eventos */}
                <div className="cipher-glass p-6">
                  <h4 className="font-bold mb-4" style={{ color: '#E4E6EB' }}>Eventos Detectados</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analysis.events.map((event) => {
                      const badge = getRiskBadge(event.risk_score);
                      return (
                        <div key={event.id} className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="flex justify-between mb-2">
                            <div className="font-semibold" style={{ color: '#E4E6EB' }}>
                              {event.event_type.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div className="px-2 py-1 rounded text-xs font-bold" style={{ background: badge.bg, color: '#fff' }}>
                              RISCO {badge.text}
                            </div>
                          </div>
                          <div className="space-y-1 text-xs" style={{ color: 'rgba(228,230,235,0.7)' }}>
                            <div>👤 {event.user}</div>
                            <div>🌐 {event.ip_address}</div>
                            <div>📁 {event.resource}</div>
                            <div>⏰ {new Date(event.timestamp).toLocaleString('pt-BR')}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudForensics;
