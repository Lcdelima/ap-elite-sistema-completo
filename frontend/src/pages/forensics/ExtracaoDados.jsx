import React, { useState, useEffect } from 'react';
import { HardDrive, Plus, ChevronLeft, Upload, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const ExtracaoDados = () => {
  const navigate = useNavigate();
  const [extracoes, setExtracoes] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchExtracoes();
    fetchStats();
  }, []);

  const fetchExtracoes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/extracao/`);
      setExtracoes(response.data.extracoes || []);
    } catch (error) {
      toast.error('Erro');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/extracao/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4">
            <ChevronLeft size={20} />Voltar
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <HardDrive size={40} />
              <div>
                <h1 className="text-3xl font-bold">Extração de Dados Avançada</h1>
                <p className="text-cyan-100">UFED, Oxygen, Magnet, XRY, ADB</p>
              </div>
            </div>
            
            <button className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-cyan-50 flex items-center gap-2">
              <Plus size={20} />Nova Extração
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Total</p>
              <p className="text-3xl font-bold mt-1">{stats.total || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Concluídas</p>
              <p className="text-3xl font-bold mt-1">{stats.concluidas || 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Extrações</h2>
          
          {extracoes.length === 0 ? (
            <div className="text-center py-12">
              <Database size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Nenhuma extração</p>
            </div>
          ) : (
            <div className="space-y-3">
              {extracoes.map((ext) => (
                <div key={ext.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-white">{ext.dispositivo_nome}</p>
                      <p className="text-sm text-gray-400">{ext.ferramenta} • {ext.metodo}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">Mensagens: {ext.dados_extraidos?.mensagens || 0}</span>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Fotos: {ext.dados_extraidos?.fotos || 0}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold h-fit ${
                      ext.status === 'extraido' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>{ext.status}</span>
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

export default ExtracaoDados;
