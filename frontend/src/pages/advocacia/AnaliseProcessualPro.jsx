import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const AnaliseProcessualProFrontend = () => {
  const [processoId, setProcessoId] = useState('');
  const [analise, setAnalise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('resumo');

  const analisarProcesso = async () => {
    if (!processoId) {
      alert('Digite o ID do processo');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/analises/${processoId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setAnalise(response.data);
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const gerarAnaliseIA = async (tipo) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/analises/${processoId}/ai/${tipo}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      
      // Recarregar análise
      setAnalise(response.data);
      alert(`✅ Análise de ${tipo} concluída!`);
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const exportParecer = async () => {
    if (!analise) return;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/analises/${processoId}/export-parecer`,
        { 
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `parecer_${processoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Erro ao exportar: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            Análise Processual <span style={{ color: '#00A3C4' }}>Pro</span> 🧠
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(228,230,235,0.6)' }}>
            Análise jurídica assistida por IA com fundamentação legal
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input e Ações */}
          <div>
            <div className="cipher-glass p-6 mb-6">
              <h3 className="text-xl font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
                Selecionar Processo
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    ID do Processo
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    placeholder="processo-uuid"
                    value={processoId}
                    onChange={(e) => setProcessoId(e.target.value)}
                  />
                </div>

                <button
                  onClick={analisarProcesso}
                  disabled={loading}
                  className="btn-elite btn-elite-primary w-full"
                >
                  {loading ? 'Carregando...' : '🔍 Carregar Análise'}
                </button>
              </div>
            </div>

            {analise && (
              <div className="cipher-glass p-6">
                <h3 className="text-lg font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
                  Ações de IA
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => gerarAnaliseIA('resumo')}
                    disabled={loading}
                    className="btn-elite btn-elite-secondary w-full text-sm"
                  >
                    📝 Gerar Resumo
                  </button>
                  
                  <button
                    onClick={() => gerarAnaliseIA('prescricao')}
                    disabled={loading}
                    className="btn-elite btn-elite-secondary w-full text-sm"
                  >
                    ⏰ Analisar Prescrição
                  </button>
                  
                  <button
                    onClick={() => gerarAnaliseIA('nulidades')}
                    disabled={loading}
                    className="btn-elite btn-elite-secondary w-full text-sm"
                  >
                    ⚠️ Identificar Nulidades
                  </button>
                  
                  <button
                    onClick={() => gerarAnaliseIA('dosimetria')}
                    disabled={loading}
                    className="btn-elite btn-elite-secondary w-full text-sm"
                  >
                    ⚖️ Calcular Dosimetria
                  </button>

                  <button
                    onClick={exportParecer}
                    className="btn-elite btn-elite-primary w-full text-sm mt-4"
                  >
                    📥 Export Parecer PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resultado da Análise */}
          <div className="lg:col-span-2">
            {!analise ? (
              <div className="cipher-glass p-12 text-center">
                <div className="text-6xl mb-4">📂</div>
                <p style={{ color: 'rgba(228,230,235,0.6)' }}>
                  Digite o ID do processo e clique em "Carregar Análise"
                </p>
              </div>
            ) : (
              <div className="cipher-glass p-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                  {['resumo', 'prescricao', 'nulidades', 'dosimetria', 'timeline'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="px-4 py-2 rounded-lg capitalize transition-all"
                      style={{
                        background: activeTab === tab ? '#00A3C4' : 'transparent',
                        color: activeTab === tab ? '#000' : '#E4E6EB',
                        fontWeight: activeTab === tab ? 700 : 500
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="prose prose-invert max-w-none">
                  {activeTab === 'resumo' && analise.ai_resumo && (
                    <div>
                      <h3 className="text-xl font-bold mb-4" style={{ color: '#00A3C4' }}>Resumo do Processo</h3>
                      <div className="text-sm leading-relaxed" style={{ color: '#E4E6EB' }}>
                        {analise.ai_resumo}
                      </div>
                    </div>
                  )}

                  {activeTab === 'prescricao' && analise.ai_prescricao && (
                    <div>
                      <h3 className="text-xl font-bold mb-4" style={{ color: '#00A3C4' }}>Análise de Prescrição</h3>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#E4E6EB' }}>
                        {analise.ai_prescricao}
                      </div>
                    </div>
                  )}

                  {activeTab === 'nulidades' && analise.ai_nulidades && (
                    <div>
                      <h3 className="text-xl font-bold mb-4" style={{ color: '#00A3C4' }}>Nulidades Identificadas</h3>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#E4E6EB' }}>
                        {analise.ai_nulidades}
                      </div>
                    </div>
                  )}

                  {activeTab === 'dosimetria' && analise.ai_dosimetria && (
                    <div>
                      <h3 className="text-xl font-bold mb-4" style={{ color: '#00A3C4' }}>Cálculo de Dosimetria</h3>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#E4E6EB' }}>
                        {analise.ai_dosimetria}
                      </div>
                    </div>
                  )}

                  {activeTab === 'timeline' && analise.timeline && (
                    <div>
                      <h3 className="text-xl font-bold mb-4" style={{ color: '#00A3C4' }}>Timeline de Eventos</h3>
                      <div className="space-y-3">
                        {analise.timeline.map((event, idx) => (
                          <div key={idx} className="flex gap-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <div className="text-xs" style={{ color: '#00A3C4' }}>
                              {new Date(event.timestamp).toLocaleString('pt-BR')}
                            </div>
                            <div className="flex-1 text-sm" style={{ color: '#E4E6EB' }}>
                              <strong>{event.action}</strong>
                              {event.details && <div className="text-xs mt-1" style={{ color: 'rgba(228,230,235,0.6)' }}>{event.details}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnaliseProcessualProFrontend;
