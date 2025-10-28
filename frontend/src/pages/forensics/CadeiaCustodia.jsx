import React, { useState, useEffect } from 'react';
import { Lock, ChevronLeft, Link2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const CadeiaCustodia = () => {
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState('');
  const [cadeia, setCadeia] = useState([]);
  const [integridade, setIntegridade] = useState('OK');

  const fetchCadeia = async (examId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/custody/chain/${examId}`);
      setCadeia(response.data.atos || []);
      setIntegridade(response.data.integridade || 'OK');
    } catch (error) {
      toast.error('Erro ao carregar cadeia');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4">
            <ChevronLeft size={20} />Voltar
          </button>
          
          <div className="flex items-center gap-4">
            <Lock size={40} />
            <div>
              <h1 className="text-3xl font-bold">Cadeia de Custódia</h1>
              <p className="text-amber-100">Hash Blockchain, Logs Imutáveis, Auditoria</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {integridade === 'OK' ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
            <p className="text-green-400 font-semibold flex items-center gap-2">
              <Lock size={20} />
              🜢 Integridade da Cadeia: OK
            </p>
          </div>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 font-semibold flex items-center gap-2">
              <AlertTriangle size={20} />
              ⚠️ FALHA DE INTEGRIDADE - Revisar cadeia
            </p>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Atos da Cadeia</h2>
          
          {cadeia.length === 0 ? (
            <div className="text-center py-12">
              <Link2 size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Selecione um exame para visualizar a cadeia</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-purple-500/30"></div>
              
              <div className="space-y-4">
                {cadeia.map((ato, index) => (
                  <div key={ato.id} className="relative pl-16">
                    <div className="absolute left-5 top-3 w-6 h-6 rounded-full bg-purple-600 border-4 border-gray-900"></div>
                    
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded font-semibold uppercase">
                            {ato.tipo}
                          </span>
                          <p className="text-white font-semibold mt-2">{ato.descricao}</p>
                          <p className="text-sm text-gray-400 mt-1">{new Date(ato.timestamp).toLocaleString()}</p>
                        </div>
                        
                        {ato.hash_curr && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-mono">Hash: {ato.hash_curr.substring(0, 12)}...</p>
                          </div>
                        )}
                      </div>
                      
                      {ato.lacre && (
                        <p className="text-xs text-gray-500 mt-2">Lacre: {ato.lacre}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CadeiaCustodia;
