import React, { useState, useEffect } from 'react';
import { ChevronLeft, Check, Clock, AlertTriangle, Upload, FileText, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PlaybookRun = () => {
  const navigate = useNavigate();
  const { runId } = useParams();
  const [run, setRun] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [completionData, setCompletionData] = useState({
    evidencias: [],
    observacoes: ''
  });

  useEffect(() => {
    if (runId) {
      fetchRun();
    }
  }, [runId]);

  const fetchRun = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/playbooks/run/${runId}`);
      
      if (response.data.success) {
        setRun(response.data.run);
        setSteps(response.data.steps || []);
      }
    } catch (error) {
      toast.error('Erro ao carregar execução');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStep = async (stepId) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/playbooks/run/${runId}/step/${stepId}/complete`,
        completionData
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        setSelectedStep(null);
        setCompletionData({ evidencias: [], observacoes: '' });
        fetchRun();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao completar etapa');
    }
  };

  const handleBlockStep = async (stepId, motivo) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/playbooks/run/${runId}/step/${stepId}/block`,
        null,
        { params: { motivo } }
      );
      
      if (response.data.success) {
        toast.warning(response.data.message);
        fetchRun();
      }
    } catch (error) {
      toast.error('Erro ao bloquear etapa');
    }
  };

  const addEvidencia = () => {
    const novaEvidencia = {
      file_id: `file_${Date.now()}`,
      sha256: '',
      descricao: ''
    };
    setCompletionData({
      ...completionData,
      evidencias: [...completionData.evidencias, novaEvidencia]
    });
  };

  if (loading && !run) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 hover:text-teal-100">
            <ChevronLeft size={20} />Voltar
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{run?.playbook_titulo || 'Execução de Playbook'}</h1>
              <p className="text-teal-100">Status: {run?.status || 'N/A'} • Progresso: {run?.progresso || 0}%</p>
            </div>
            
            <div className="text-right">
              <div className="text-5xl font-bold">{run?.progresso || 0}%</div>
              <div className="text-teal-100 text-sm">Completude</div>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${run?.progresso || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Etapas da Execução</h2>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className={`border-2 rounded-lg p-6 transition-all ${
                  step.status === 'ok' ? 'border-green-300 bg-green-50' :
                  step.status === 'bloqueado' ? 'border-red-300 bg-red-50' :
                  'border-gray-300 bg-white hover:shadow-md'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          step.status === 'ok' ? 'bg-green-600 text-white' :
                          step.status === 'bloqueado' ? 'bg-red-600 text-white' :
                          'bg-gray-300 text-gray-700'
                        }`}>
                          {step.status === 'ok' ? <Check size={20} /> :
                           step.status === 'bloqueado' ? <AlertTriangle size={20} /> :
                           step.ordem}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{step.titulo}</h3>
                          <p className="text-sm text-gray-600">{step.descricao}</p>
                        </div>
                      </div>
                      
                      <div className="ml-13 mt-2 flex gap-2 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                          {step.responsavel_role}
                        </span>
                        
                        {step.due_at && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(step.due_at).toLocaleDateString()}
                          </span>
                        )}
                        
                        {step.validacao?.requires_hash && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Requer Hash</span>
                        )}
                        
                        {step.status === 'ok' && step.hash_curr && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-mono">
                            Hash: {step.hash_curr.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                      
                      {step.observacoes && (
                        <div className="ml-13 mt-3 text-sm text-gray-600 italic">
                          💬 {step.observacoes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {step.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => setSelectedStep(step)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => {
                              const motivo = prompt('Motivo do bloqueio:');
                              if (motivo) handleBlockStep(step.id, motivo);
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                          >
                            Bloquear
                          </button>
                        </>
                      )}
                      
                      {step.status === 'ok' && (
                        <div className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold text-center">
                          ✓ Concluída
                        </div>
                      )}
                      
                      {step.status === 'bloqueado' && (
                        <div className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold text-center">
                          ⚠ Bloqueada
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Completar Step */}
      {selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <h3 className="text-2xl font-bold mb-4">Completar Etapa: {selectedStep.titulo}</h3>
            
            {selectedStep.validacao?.requires_hash && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">⚠️ Esta etapa exige upload de evidências com hash SHA-256/SHA-512</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Evidências / Anexos</label>
                {completionData.evidencias.map((ev, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={ev.file_id} onChange={(e) => {
                      const newEv = [...completionData.evidencias];
                      newEv[i].file_id = e.target.value;
                      setCompletionData({...completionData, evidencias: newEv});
                    }} className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="ID do arquivo" />
                    <input type="text" value={ev.sha256} onChange={(e) => {
                      const newEv = [...completionData.evidencias];
                      newEv[i].sha256 = e.target.value;
                      setCompletionData({...completionData, evidencias: newEv});
                    }} className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono" placeholder="SHA-256" />
                  </div>
                ))}
                <button onClick={addEvidencia} className="text-sm text-teal-600 hover:underline">+ Adicionar Evidência</button>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Observações</label>
                <textarea value={completionData.observacoes} onChange={(e) => setCompletionData({...completionData, observacoes: e.target.value})} rows="3" className="w-full px-3 py-2 border rounded-lg" placeholder="Notas sobre a execução..." />
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <button onClick={() => setSelectedStep(null)} className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button onClick={() => handleCompleteStep(selectedStep.id)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Confirmar Conclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookRun;
