import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const PeticoesIA = () => {
  const [tipoPéticao, setTipoPeticao] = useState('inicial');
  const [dadosProcesso, setDadosProcesso] = useState({
    tipo_acao: '',
    fatos: '',
    pedidos: '',
    fundamentacao: ''
  });
  const [peticaoGerada, setPeticaoGerada] = useState('');
  const [loading, setLoading] = useState(false);

  const templatesPeticoes = {
    inicial: 'Petição Inicial',
    contestacao: 'Contestação',
    recurso: 'Recurso',
    agravo: 'Agravo de Instrumento',
    apelacao: 'Apelação',
    embargos: 'Embargos de Declaração',
    habeas_corpus: 'Habeas Corpus',
    mandado_seguranca: 'Mandado de Segurança'
  };

  const gerarPeticaoComIA = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/peticoes/gerar-ia`,
        {
          tipo: tipoPeticao,
          dados: dadosProcesso
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      
      setPeticaoGerada(response.data.peticao);
      alert('✅ Petição gerada com sucesso!');
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/peticoes/export-pdf`,
        { content: peticaoGerada },
        { 
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `peticao_${Date.now()}.pdf`);
      link.click();
    } catch (error) {
      alert('Erro ao exportar: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            Geração de <span style={{ color: '#00A3C4' }}>Petições</span> com IA 🧠
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(228,230,235,0.6)' }}>
            Templates jurídicos assistidos por GPT-4o
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuração */}
          <div>
            <div className="cipher-glass p-6">
              <h3 className="text-xl font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
                Configurar Petição
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Tipo de Petição
                  </label>
                  <select
                    className="input-elite"
                    value={tipoPeticao}
                    onChange={(e) => setTipoPeticao(e.target.value)}
                  >
                    {Object.entries(templatesPeticoes).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Tipo de Ação
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    placeholder="Ex: Ação de Indenização"
                    value={dadosProcesso.tipo_acao}
                    onChange={(e) => setDadosProcesso({...dadosProcesso, tipo_acao: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Fatos (resumo)
                  </label>
                  <textarea
                    className="input-elite"
                    rows={4}
                    placeholder="Descreva os fatos relevantes..."
                    value={dadosProcesso.fatos}
                    onChange={(e) => setDadosProcesso({...dadosProcesso, fatos: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Pedidos
                  </label>
                  <textarea
                    className="input-elite"
                    rows={3}
                    placeholder="Liste os pedidos..."
                    value={dadosProcesso.pedidos}
                    onChange={(e) => setDadosProcesso({...dadosProcesso, pedidos: e.target.value})}
                  />
                </div>

                <button
                  onClick={gerarPeticaoComIA}
                  disabled={loading}
                  className="btn-elite btn-elite-primary w-full"
                >
                  {loading ? '🧠 Gerando...' : '✨ Gerar com IA'}
                </button>
              </div>
            </div>
          </div>

          {/* Preview da Petição */}
          <div className="lg:col-span-2">
            <div className="cipher-glass p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-title font-bold" style={{ color: '#E4E6EB' }}>
                  {templatesPeticoes[tipoPeticao]}
                </h3>
                {peticaoGerada && (
                  <button onClick={downloadPDF} className="btn-elite btn-elite-primary text-sm">
                    📥 Download PDF
                  </button>
                )}
              </div>

              {!peticaoGerada ? (
                <div className="text-center py-20" style={{ color: 'rgba(228,230,235,0.6)' }}>
                  <div className="text-6xl mb-4">📝</div>
                  <p>Configure os dados e clique em "Gerar com IA"</p>
                </div>
              ) : (
                <div 
                  className="p-6 rounded-lg overflow-y-auto"
                  style={{ 
                    background: '#fff', 
                    color: '#000',
                    maxHeight: '700px',
                    minHeight: '600px'
                  }}
                >
                  <div 
                    dangerouslySetInnerHTML={{ __html: peticaoGerada }}
                    style={{ 
                      fontFamily: 'Georgia, serif',
                      lineHeight: '1.8',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeticoesIA;
