import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const ChatEliteLex = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState('prescricao');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat/elite-lex`,
        {
          query: input,
          analysis_type: analysisType
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.data.result
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'error',
        content: 'Erro: ' + (error.response?.data?.detail || error.message)
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            <span className="text-elite-accent">EliteLex</span> - Chat Jurídico 🧠
          </h1>
          <p className="text-elite-metal">
            Assistente jurídico com IA - Jurisprudência e análise processual
          </p>
        </div>

        {/* Analysis Type Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { id: 'prescricao', name: 'Prescrição', icon: '⏰' },
              { id: 'nulidades', name: 'Nulidades', icon: '⚠️' },
              { id: 'dosimetria', name: 'Dosimetria', icon: '⚖️' },
              { id: 'jurisprudencia', name: 'Jurisprudência', icon: '📚' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setAnalysisType(type.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  analysisType === type.id
                    ? 'bg-elite-accent text-elite-bg'
                    : 'bg-surface-01 text-elite-metal hover:bg-surface-02'
                }`}
              >
                {type.icon} {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <CipherGlassCard className="p-6 mb-6" variant="strong">
          <div className="h-[500px] overflow-y-auto space-y-4 mb-6">
            {messages.length === 0 ? (
              <div className="text-center py-20 text-elite-metal">
                <div className="text-6xl mb-4">🧠</div>
                <p>Faça uma pergunta jurídica ou descreva um caso</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-elite-accent text-elite-bg'
                        : msg.role === 'error'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : 'bg-surface-02 text-elite-text'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-02 text-elite-text p-4 rounded-lg">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-elite-accent rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-elite-accent rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-elite-accent rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex space-x-3">
            <input
              type="text"
              className="input-elite flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua pergunta jurídica..."
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="btn-elite btn-elite-primary px-6"
            >
              💬 Enviar
            </button>
          </div>
        </CipherGlassCard>

        {/* Exemplos */}
        <div className="grid md:grid-cols-2 gap-4">
          <CipherGlassCard className="p-4">
            <div className="text-elite-text font-semibold mb-3 text-sm">Exemplos de Consulta:</div>
            <div className="space-y-2 text-xs text-elite-metal">
              <div>• "Qual a jurisprudência sobre prescrição em crimes patrimoniais?"</div>
              <div>• "Analise nulidades em processo sem intimação do defensor"</div>
              <div>• "Como calcular dosimetria em caso de furto qualificado?"</div>
            </div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-4">
            <div className="text-elite-accent font-semibold mb-3 text-sm">IA Jurídica Avançada:</div>
            <div className="space-y-2 text-xs text-elite-metal">
              <div>✓ Análise de prescrição penal</div>
              <div>✓ Identificação de nulidades</div>
              <div>✓ Cálculo de dosimetria</div>
              <div>✓ Busca de jurisprudência STF/STJ</div>
            </div>
          </CipherGlassCard>
        </div>
      </div>
    </div>
  );
};

export default ChatEliteLex;
