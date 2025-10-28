import React, { useState, useEffect } from 'react';
import { FileSignature, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const GeradorContratos = () => {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContratos();
  }, []);

  const fetchContratos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/juridico/contratos/`);
      setContratos(response.data.contratos || []);
    } catch (error) {
      toast.error('Erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4">← Voltar</button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileSignature size={40} />
              <div>
                <h1 className="text-3xl font-bold">Gerador de Contratos</h1>
                <p className="text-green-100">Honorários, Assinatura Digital, Trilha LGPD</p>
              </div>
            </div>
            
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 flex items-center gap-2">
              <Plus size={20} />Novo Contrato
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Contratos</h2>
          
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div></div>
          ) : contratos.length === 0 ? (
            <div className="text-center py-12">
              <FileSignature size={64} className="mx-auto text-gray-400 mb-4" />
              <p>Nenhum contrato gerado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contratos.map((c) => (
                <div key={c.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{c.numero}</p>
                      <p className="text-sm text-gray-600">{c.tipo} - R$ {c.valor_honorarios}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      c.status === 'assinado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{c.status}</span>
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

export default GeradorContratos;
