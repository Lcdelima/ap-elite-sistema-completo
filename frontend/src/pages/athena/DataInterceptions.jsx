import React, { useState, useEffect } from 'react';
import { Network, Plus, ChevronLeft, Upload, Brain, Database, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const DataInterceptions = () => {
  const navigate = useNavigate();
  const [interceptacoes, setInterceptacoes] = useState([]);
  const [stats, setStats] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [formData, setFormData] = useState({ titulo: '', tipo: 'telematica', numero_processo: '', base_legal: '', provedor: '' });
  const [arquivos, setArquivos] = useState([]);

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

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4"><ChevronLeft size={20} />Voltar</button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Network size={40} />
              <div>
                <h1 className="text-3xl font-bold">Intercepções de Dados</h1>
                <p className="text-cyan-100">Telemática, Rede, E-mails, Logs, Mensagerias - CISAI 4.0</p>
              </div>
            </div>
            <button onClick={() => setShowWizard(true)} className="bg-white text-cyan-600 px-6 py-3 rounded-xl font-semibold hover:bg-cyan-50 flex items-center gap-2">
              <Plus size={20} />Nova Intercepção
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 rounded-xl shadow-lg text-white">
              <p className="text-sm opacity-90">Total</p>
              <p className="text-3xl font-bold mt-1">{stats.total || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
              <p className="text-sm opacity-90">Ativas</p>
              <p className="text-3xl font-bold mt-1">{stats.ativas || 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-gray-800 rounded-xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Intercepções de Dados</h2>
          <div className="text-center py-12">
            <Database size={64} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Nenhuma intercepção de dados</p>
          </div>
        </div>
      </div>

      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-3xl">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">Nova Intercepção de Dados</h2>
              <p className="text-cyan-100 text-sm mt-1">Lei 9.296/96 - Telemática, Rede, Cloud</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm font-semibold">⚠️ Base Legal Obrigatória</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-300 mb-2">Título*</label><input type="text" required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" placeholder="Ex: Intercepção WhatsApp - Caso 001" /></div>
                <div><label className="block text-sm font-semibold text-gray-300 mb-2">Tipo*</label><select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"><option value="telematica">Telemática</option><option value="rede">Rede</option><option value="email">E-mail</option><option value="mensageria">Mensageria</option><option value="nuvem">Nuvem</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-300 mb-2">Número Processo*</label><input type="text" required value={formData.numero_processo} onChange={(e) => setFormData({...formData, numero_processo: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" /></div>
                <div><label className="block text-sm font-semibold text-gray-300 mb-2">Base Legal*</label><select required value={formData.base_legal} onChange={(e) => setFormData({...formData, base_legal: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"><option value="">Selecione...</option><option value="ordem_judicial">Ordem Judicial</option><option value="consentimento">Consentimento</option></select></div>
              </div>
              <div className="border-2 border-dashed border-cyan-500/50 rounded-xl p-6 bg-cyan-500/5">
                <Database size={40} className="mx-auto text-cyan-400 mb-3" />
                <p className="text-white font-semibold text-center mb-2">Upload de Dados</p>
                <p className="text-gray-400 text-sm text-center mb-4">PCAP, HAR, LOG, EML, PST, CSV, JSON, ZIP - Até 4TB+</p>
                <input type="file" multiple onChange={(e) => setArquivos(Array.from(e.target.files))} className="hidden" id="data-up" />
                <label htmlFor="data-up" className="block w-full px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-center cursor-pointer font-semibold">Selecionar Arquivos</label>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2"><Brain size={18} className="text-cyan-400" />Recursos Automáticos</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300"><CheckCircle size={14} className="text-green-400" />Hash SHA-256/SHA-512</div>
                  <div className="flex items-center gap-2 text-gray-300"><CheckCircle size={14} className="text-green-400" />Parsing automático</div>
                  <div className="flex items-center gap-2 text-gray-300"><CheckCircle size={14} className="text-green-400" />IA Network Intel</div>
                  <div className="flex items-center gap-2 text-gray-300"><CheckCircle size={14} className="text-green-400" />Grafo de comunicações</div>
                  <div className="flex items-center gap-2 text-gray-300"><CheckCircle size={14} className="text-green-400" />SpoofGuard IP</div>
                  <div className="flex items-center gap-2 text-gray-300"><CheckCircle size={14} className="text-green-400" />Export multi-formato</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 px-6 py-4 flex justify-between rounded-b-xl">
              <button onClick={() => setShowWizard(false)} className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg">Cancelar</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-semibold">Criar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataInterceptions;
