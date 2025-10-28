import React, { useState, useEffect } from 'react';
import { MapPin, Plus, ChevronLeft, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const AnaliseERBs = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/erbs/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4">
            <ChevronLeft size={20} />Voltar
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MapPin size={40} />
              <div>
                <h1 className="text-3xl font-bold">Análise de ERBs</h1>
                <p className="text-green-100">CDR, Geolocalização, Triangulação</p>
              </div>
            </div>
            
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 flex items-center gap-2">
              <Plus size={20} />Importar CDR/ERB
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Registros ERB</p>
              <p className="text-3xl font-bold mt-1">{stats.total_registros || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Importações</p>
              <p className="text-3xl font-bold mt-1">{stats.total_imports || 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Timeline Geográfica</h2>
          
          <div className="text-center py-12">
            <Map size={64} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Importe CDR/ERB para visualizar timeline</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnaliseERBs;
