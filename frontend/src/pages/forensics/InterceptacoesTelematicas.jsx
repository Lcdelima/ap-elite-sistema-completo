import React, { useState, useEffect } from 'react';
import { Radio, Plus, ChevronLeft, Mic, FileAudio, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const InterceptacoesTelematicas = () => {
  const navigate = useNavigate();
  const [interceptacoes, setInterceptacoes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInterceptacoes();
    fetchStats();
  }, []);

  const fetchInterceptacoes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/interceptacoes/`);
      setInterceptacoes(response.data.interceptacoes || []);
    } catch (error) {
      toast.error('Erro');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/interceptacoes/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro');
    }
  };

  const analisarIA = async (interceptId) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/interceptacoes/${interceptId}/analisar-ia`);
      if (response.data.success) {
        toast.success('Análise IA concluída!');
        // Mostrar resultados
      }
    } catch (error) {
      toast.error('Erro na análise IA');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 hover:text-red-100">
            <ChevronLeft size={20} />Voltar
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Radio size={40} />
              <div>
                <h1 className="text-3xl font-bold">Interceptações Telemáticas</h1>
                <p className="text-red-100">Transcrição, Diarização, IA Jurídica</p>
              </div>
            </div>
            
            <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 flex items-center gap-2">
              <Plus size={20} />Nova Interceptação
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Total</p>
              <p className="text-3xl font-bold mt-1">{stats.total || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Ativas</p>
              <p className="text-3xl font-bold mt-1">{stats.ativas || 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Interceptações</h2>
          
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div></div>
          ) : interceptacoes.length === 0 ? (
            <div className="text-center py-12">
              <Mic size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Nenhuma interceptação</p>
            </div>
          ) : (
            <div className="space-y-3">
              {interceptacoes.map((int) => (
                <div key={int.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-white">{int.alvo_nome}</p>
                      <p className="text-sm text-gray-400">{int.alvo_telefone} • {int.tipo}</p>
                      <p className="text-xs text-gray-500">Ordem: {int.numero_ordem}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        int.status === 'ativa' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>{int.status}</span>
                      <button onClick={() => analisarIA(int.id)} className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 flex items-center gap-1">
                        <Brain size={12} />Analisar IA
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterceptacoesTelematicas;
