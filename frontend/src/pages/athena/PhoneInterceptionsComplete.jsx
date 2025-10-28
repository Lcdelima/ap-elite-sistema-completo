import React, { useState, useEffect } from 'react';
import { Phone, Plus, ChevronLeft, Upload, Brain, Mic, FileAudio, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PhoneInterceptionsComplete = () => {
  const navigate = useNavigate();
  const [interceptacoes, setInterceptacoes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [formData, setFormData] = useState({ numero_ordem: '', alvo_nome: '', alvo_telefone: '', tipo: 'voz', data_inicio: '', data_fim: '' });
  const [arquivosUpload, setArquivosUpload] = useState([]);

  useEffect(() => {
    fetchInterceptacoes();
    fetchStats();
  }, []);

  const fetchInterceptacoes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/interceptacoes/`);
      setInterceptacoes(response.data.interceptacoes || []);
    } catch (error) {
      toast.error('Erro');
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

  const handleSubmit = async () => {
    if (!formData.numero_ordem || !formData.alvo_nome) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/interceptacoes/`, formData);
      if (response.data.success) {
        const interceptId = response.data.intercept_id;
        toast.success('Interceptação registrada!');
        
        if (arquivosUpload.length > 0) {
          for (const file of arquivosUpload) {
            const fd = new FormData();
            fd.append('file', file);
            await axios.post(`${BACKEND_URL}/api/interceptacoes/${interceptId}/upload-audio`, fd);
          }
          toast.success('Áudios enviados!');
        }
        
        setShowWizard(false);
        setFormData({ numero_ordem: '', alvo_nome: '', alvo_telefone: '', tipo: 'voz', data_inicio: '', data_fim: '' });
        setArquivosUpload([]);
        fetchInterceptacoes();
        fetchStats();
      }
    } catch (error) {
      toast.error('Erro');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4"><ChevronLeft size={20} />Voltar</button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Phone size={40} />
              <div>
                <h1 className="text-3xl font-bold">Intercepções Telefônicas Concluídas</h1>
                <p className="text-red-100">Transcrição IA, Diarização, Análise Jurídica - Lei 9.296/96</p>
              </div>
            </div>
            <button onClick={() => setShowWizard(true)} className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 flex items-center gap-2">
              <Plus size={20} />Nova Intercepção
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-lg text-white">
              <p className="text-sm opacity-90">Total</p>
              <p className="text-3xl font-bold mt-1">{stats.total || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
              <p className="text-sm opacity-90">Ativas</p>
              <p className="text-3xl font-bold mt-1">{stats.ativas || 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-gray-800 rounded-xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Intercepções</h2>
          {loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div></div> : interceptacoes.length === 0 ? <div className="text-center py-12"><Mic size={64} className="mx-auto text-gray-600 mb-4" /><p className="text-gray-400">Nenhuma intercepção</p></div> : <div className="space-y-3">{interceptacoes.map((int) => <div key={int.id} className="bg-gray-700 border border-gray-600 rounded-xl p-5"><div className="flex justify-between"><div><p className="font-semibold text-white">{int.alvo_nome}</p><p className="text-sm text-gray-400">{int.alvo_telefone} • {int.tipo}</p></div><span className={`px-3 py-1 rounded text-xs font-semibold ${int.status === 'ativa' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{int.status}</span></div></div>)}</div>}
        </div>
      </div>

      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-3xl">
            <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">Nova Intercepção</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-300 mb-2">Número Ordem*</label><input type="text" required value={formData.numero_ordem} onChange={(e) => setFormData({...formData, numero_ordem: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" /></div>
                <div><label className="block text-sm font-semibold text-gray-300 mb-2">Nome do Alvo*</label><input type="text" required value={formData.alvo_nome} onChange={(e) => setFormData({...formData, alvo_nome: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-300 mb-2">Telefone*</label><input type="text" required value={formData.alvo_telefone} onChange={(e) => setFormData({...formData, alvo_telefone: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" /></div>
                <div><label className="block text-sm font-semibold text-gray-300 mb-2">Tipo*</label><select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"><option value="voz">Voz</option><option value="sms">SMS</option><option value="voip">VoIP</option></select></div>
              </div>
              <div className="border-2 border-dashed border-red-500/50 rounded-xl p-6 bg-red-500/5">
                <FileAudio size={40} className="mx-auto text-red-400 mb-3" />
                <input type="file" multiple accept="audio/*" onChange={(e) => setArquivosUpload(Array.from(e.target.files))} className="hidden" id="audio-up" />
                <label htmlFor="audio-up" className="block w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center cursor-pointer font-semibold">Selecionar Áudios</label>
              </div>
            </div>
            <div className="bg-gray-700 px-6 py-4 flex justify-between rounded-b-xl">
              <button onClick={() => setShowWizard(false)} className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold">Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInterceptionsComplete;
