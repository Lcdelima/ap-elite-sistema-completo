import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, History, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const ChatbotInterface = () => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    createSession();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/chatbot/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const createSession = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/chatbot/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 'web' })
      });

      const data = await response.json();
      setSessionId(data.session_id);
      setMessages([{ role: 'assistant', content: data.welcome_message, timestamp: new Date().toISOString() }]);
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: input
        })
      });

      const data = await response.json();
      const botMessage = { role: 'assistant', content: data.response, timestamp: new Date().toISOString(), suggestions: data.suggestions };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-cyan-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Bot className="w-10 h-10" />
            Chatbot IA - Atendimento 24/7
          </h1>
          <p className="text-teal-200">Assistente virtual inteligente com IA</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <MessageSquare className="w-8 h-8 text-teal-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_sessions}</p>
              <p className="text-gray-300 text-sm">Sessões Total</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Sparkles className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.active_sessions}</p>
              <p className="text-gray-300 text-sm">Sessões Ativas</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Bot className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.channels?.length || 0}</p>
              <p className="text-gray-300 text-sm">Canais</p>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-blue-500' : 'bg-teal-500'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <div className={`rounded-lg p-4 ${
                      msg.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/20 text-gray-100'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.suggestions.map((sug, i) => (
                          <button key={i} onClick={() => setInput(sug)}
                            className="text-xs px-3 py-1 bg-teal-500/30 hover:bg-teal-500/50 text-teal-200 rounded-full">
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-white/20 p-4">
            <div className="flex gap-3">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400" />
              <button onClick={sendMessage} disabled={!input.trim() || loading}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-bold mb-4">Funcionalidades</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              {stats?.features?.map((feature, idx) => (
                <li key={idx}>✓ {feature}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-bold mb-4">Canais Disponíveis</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              {stats?.channels?.map((channel, idx) => (
                <li key={idx}>✓ {channel}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotInterface;