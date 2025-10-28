import React, { useState, useEffect } from 'react';
import { Package, ChevronLeft, Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const IPEDIntegration = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/iped/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4">
            <ChevronLeft size={20} />Voltar
          </button>
          
          <div className="flex items-center gap-4">
            <Package size={40} />
            <div>
              <h1 className="text-3xl font-bold">Integração IPED</h1>
              <p className="text-indigo-100">Corpus, Queries, Hits, Reprodutibilidade</p>
            </div>
          </div>
        </div>
      </div>

      {stats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Total Casos</p>
              <p className="text-3xl font-bold mt-1">{stats.total || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Concluídos</p>
              <p className="text-3xl font-bold mt-1">{stats.concluidos || 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Casos IPED</h2>
          
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Nenhum caso IPED processado</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPEDIntegration;
