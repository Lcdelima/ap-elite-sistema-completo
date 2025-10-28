import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, ChevronLeft, ChevronRight, Check, AlertCircle, PlayCircle, Copy, Download, Archive, Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PlaybookSystem = () => {
  const navigate = useNavigate();
  const [playbooks, setPlaybooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [wizardData, setWizardData] = useState({
    titulo: '', tipo: '', categoria: '', processo_id: '', cliente_id: '',
    prioridade: 'P2', validade: '', steps: [], templates: [],
    base_legal: { basis: '', evidence_id: '', purpose: '', processo_numero: '' },
    nivel_sigilo: 'CONF', observacoes: ''
  });

  const [newStep, setNewStep] = useState({
    ordem: 1, titulo: '', descricao: '', responsavel_role: 'ADV',
    prazo_relativo: { days: 0, anchor: 'inicio' },
    validacao: { requires_hash: false, requires_upload: false },
    automacoes: [], tags: []
  });

  useEffect(() => {
    fetchPlaybooks();
    fetchStats();
  }, []);

  const fetchPlaybooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/playbooks/list`);
      setPlaybooks(response.data.playbooks || []);
    } catch (error) {
      toast.error('Erro ao carregar playbooks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/playbooks/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar stats');
    }
  };

  const handleAddStep = () => {
    if (!newStep.titulo) {
      toast.error('Título da etapa obrigatório');
      return;
    }
    
    setWizardData({
      ...wizardData,
      steps: [...wizardData.steps, { ...newStep, ordem: wizardData.steps.length + 1 }]
    });
    
    setNewStep({
      ordem: wizardData.steps.length + 2,
      titulo: '', descricao: '', responsavel_role: 'ADV',
      prazo_relativo: { days: 0, anchor: 'inicio' },
      validacao: { requires_hash: false, requires_upload: false },
      automacoes: [], tags: []
    });
    
    toast.success('Etapa adicionada!');
  };

  const handleRemoveStep = (index) => {
    const newSteps = wizardData.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, ordem: i + 1 }));
    setWizardData({ ...wizardData, steps: newSteps });
  };

  const handleMoveStep = (index, direction) => {
    const newSteps = [...wizardData.steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSteps.length) return;
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setWizardData({ ...wizardData, steps: newSteps.map((s, i) => ({ ...s, ordem: i + 1 })) });
  };

  const handleSubmitPlaybook = async () => {
    if (!wizardData.titulo || !wizardData.tipo || !wizardData.categoria) {
      toast.error('Preencha Título, Tipo e Categoria');
      return;
    }
    
    if (wizardData.steps.length === 0) {
      toast.error('Adicione pelo menos 1 etapa');
      return;
    }
    
    if (!wizardData.base_legal.basis || !wizardData.base_legal.purpose) {
      toast.error('Base legal e finalidade obrigatórios');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/playbooks/create`, wizardData);
      
      if (response.data.success) {
        toast.success(`Playbook '${wizardData.titulo}' criado!`);
        setShowWizard(false);
        setCurrentStep(1);
        setWizardData({
          titulo: '', tipo: '', categoria: '', processo_id: '', cliente_id: '',
          prioridade: 'P2', validade: '', steps: [], templates: [],
          base_legal: { basis: '', evidence_id: '', purpose: '', processo_numero: '' },
          nivel_sigilo: 'CONF', observacoes: ''
        });
        fetchPlaybooks();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar playbook');
    } finally {
      setLoading(false);
    }
  };

  const executarPlaybook = async (id, titulo) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/playbooks/run`, { playbook_id: id, context: {} });
      if (response.data.success) {
        toast.success(`Execução de '${titulo}' iniciada!`);
        navigate(`/athena/playbook-run/${response.data.run_id}`);
      }
    } catch (error) {
      toast.error('Erro ao executar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/90 hover:text-white mb-4">
            <ChevronLeft size={20} />Voltar
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BookOpen size={40} />
              <div>
                <h1 className="text-3xl font-bold">Playbooks Forenses</h1>
                <p className="text-teal-100">Sistema de processos padronizados ISO/IEC 27037</p>
              </div>
            </div>
            
            <button onClick={() => setShowWizard(true)} className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 flex items-center gap-2">
              <Plus size={20} />Criar Playbook
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Total Playbooks</p>
              <p className="text-3xl font-bold mt-1">{stats.playbooks?.total || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Concluídos</p>
              <p className="text-3xl font-bold mt-1">{stats.execucoes?.concluidos || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Em Andamento</p>
              <p className="text-3xl font-bold mt-1">{stats.execucoes?.em_andamento || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Progresso Médio</p>
              <p className="text-3xl font-bold mt-1">{stats.execucoes?.progresso_medio || 0}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Playbooks</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              </div>
            ) : playbooks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
                <p>Nenhum playbook</p>
                <button onClick={() => setShowWizard(true)} className="mt-4 px-6 py-3 bg-teal-600 text-white rounded-lg">
                  Criar Primeiro
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">SLA</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Steps</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {playbooks.map((pb) => (
                    <tr key={pb.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{pb.titulo}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pb.tipo === 'JURIDICO' ? 'bg-blue-100 text-blue-800' :
                          pb.tipo === 'PERICIA' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{pb.tipo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pb.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>{pb.status}</span>
                      </td>
                      <td className="px-6 py-4"><span className="text-xs font-bold">{pb.prioridade}</span></td>
                      <td className="px-6 py-4">{pb.steps_count || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => executarPlaybook(pb.id, pb.titulo)} className="p-2 text-green-600 hover:bg-green-50 rounded" title="Executar">
                            <PlayCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* WIZARD */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Criar Novo Playbook</h2>
              
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <div className="flex-1 flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-white text-teal-600' : 'bg-white/20'}`}>
                    {currentStep > 1 ? <Check size={20} /> : '1'}
                  </div>
                  <span className="font-semibold text-sm">Metadados</span>
                </div>
                
                <div className="w-12 h-1 bg-white/30"></div>
                
                <div className="flex-1 flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-white text-teal-600' : 'bg-white/20'}`}>
                    {currentStep > 2 ? <Check size={20} /> : '2'}
                  </div>
                  <span className="font-semibold text-sm">Conteúdo</span>
                </div>
                
                <div className="w-12 h-1 bg-white/30"></div>
                
                <div className="flex-1 flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-white text-teal-600' : 'bg-white/20'}`}>3</div>
                  <span className="font-semibold text-sm">Conformidade</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4">Metadados</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Título*</label>
                    <input type="text" required value={wizardData.titulo} onChange={(e) => setWizardData({...wizardData, titulo: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: RA - Defesa Técnica" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Tipo*</label>
                      <select required value={wizardData.tipo} onChange={(e) => setWizardData({...wizardData, tipo: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                        <option value="">Selecione...</option>
                        <option value="JURIDICO">JURÍDICO</option>
                        <option value="PERICIA">PERÍCIA</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="OSINT">OSINT</option>
                        <option value="GEO">GEO/REDES</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">Categoria*</label>
                      <select required value={wizardData.categoria} onChange={(e) => setWizardData({...wizardData, categoria: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                        <option value="">Selecione...</option>
                        <option value="Resposta à Acusação">Resposta à Acusação</option>
                        <option value="Cadeia de Custódia">Cadeia de Custódia</option>
                        <option value="Audiência">Audiência</option>
                        <option value="Habeas Corpus">Habeas Corpus</option>
                        <option value="Laudo Digital">Laudo Digital</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Prioridade/SLA*</label>
                      <select value={wizardData.prioridade} onChange={(e) => setWizardData({...wizardData, prioridade: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                        <option value="P1">P1 - Urgente (24h)</option>
                        <option value="P2">P2 - Normal (7d)</option>
                        <option value="P3">P3 - Baixa (30d)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">Validade</label>
                      <input type="date" value={wizardData.validade} onChange={(e) => setWizardData({...wizardData, validade: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold">Etapas do Playbook</h3>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {wizardData.steps.map((step, i) => (
                      <div key={i} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">{step.ordem}</span>
                              <h4 className="font-semibold">{step.titulo}</h4>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{step.responsavel_role}</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-10">{step.descricao}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <button onClick={() => handleMoveStep(i, 'up')} disabled={i === 0} className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30">↑</button>
                            <button onClick={() => handleMoveStep(i, 'down')} disabled={i === wizardData.steps.length - 1} className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30">↓</button>
                            <button onClick={() => handleRemoveStep(i)} className="p-1 text-red-600 hover:bg-red-50 rounded">✕</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-2 border-dashed border-teal-300 rounded-lg p-4 bg-teal-50">
                    <h4 className="font-semibold mb-3">➕ Adicionar Etapa</h4>
                    
                    <div className="space-y-3">
                      <input type="text" value={newStep.titulo} onChange={(e) => setNewStep({...newStep, titulo: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Título da etapa" />
                      <textarea value={newStep.descricao} onChange={(e) => setNewStep({...newStep, descricao: e.target.value})} rows="2" className="w-full px-3 py-2 border rounded-lg" placeholder="Descrição" />
                      
                      <div className="grid grid-cols-3 gap-3">
                        <select value={newStep.responsavel_role} onChange={(e) => setNewStep({...newStep, responsavel_role: e.target.value})} className="px-3 py-2 border rounded-lg text-sm">
                          <option value="ADV">Advogada</option>
                          <option value="PERITA">Perita</option>
                          <option value="ADM">Admin</option>
                        </select>
                        
                        <input type="number" value={newStep.prazo_relativo.days} onChange={(e) => setNewStep({...newStep, prazo_relativo: {...newStep.prazo_relativo, days: parseInt(e.target.value) || 0}})} className="px-3 py-2 border rounded-lg text-sm" placeholder="Dias" />
                        <input type="text" value={newStep.prazo_relativo.anchor} onChange={(e) => setNewStep({...newStep, prazo_relativo: {...newStep.prazo_relativo, anchor: e.target.value}})} className="px-3 py-2 border rounded-lg text-sm" placeholder="Âncora" />
                      </div>
                      
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={newStep.validacao.requires_hash} onChange={(e) => setNewStep({...newStep, validacao: {...newStep.validacao, requires_hash: e.target.checked}})} />
                          Requer Hash
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={newStep.validacao.requires_upload} onChange={(e) => setNewStep({...newStep, validacao: {...newStep.validacao, requires_upload: e.target.checked}})} />
                          Requer Upload
                        </label>
                      </div>
                      
                      <button onClick={handleAddStep} className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4">Conformidade</h3>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">⚖️ Base legal obrigatória (LGPD, CPP 158-A/159)</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Base Legal*</label>
                      <select required value={wizardData.base_legal.basis} onChange={(e) => setWizardData({...wizardData, base_legal: {...wizardData.base_legal, basis: e.target.value}})} className="w-full px-3 py-2 border rounded-lg">
                        <option value="">Selecione...</option>
                        <option value="consent">Consentimento</option>
                        <option value="contrato">Contrato</option>
                        <option value="exercicio_regular">Exercício Regular</option>
                        <option value="ordem_judicial">Ordem Judicial</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">Sigilo*</label>
                      <select value={wizardData.nivel_sigilo} onChange={(e) => setWizardData({...wizardData, nivel_sigilo: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                        <option value="CONF">Confidencial</option>
                        <option value="ULTRA">Ultra-secreto</option>
                        <option value="RESTRITO">Restrito</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Finalidade* (LGPD)</label>
                    <textarea required value={wizardData.base_legal.purpose} onChange={(e) => setWizardData({...wizardData, base_legal: {...wizardData.base_legal, purpose: e.target.value}})} rows="2" className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Defesa técnica no processo..." />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Observações</label>
                    <textarea value={wizardData.observacoes} onChange={(e) => setWizardData({...wizardData, observacoes: e.target.value})} rows="3" className="w-full px-3 py-2 border rounded-lg" />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Shield size={20} />Resumo
                    </h4>
                    <div className="text-sm text-blue-800">
                      <p>✓ Etapas: {wizardData.steps.length}</p>
                      <p>✓ Base Legal: {wizardData.base_legal.basis || 'Não definida'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-between border-t">
              <button onClick={() => currentStep === 1 ? setShowWizard(false) : setCurrentStep(currentStep - 1)} className="px-6 py-2 border text-gray-700 rounded-lg hover:bg-gray-100 font-semibold flex items-center gap-2">
                <ChevronLeft size={20} />{currentStep === 1 ? 'Cancelar' : 'Voltar'}
              </button>
              
              {currentStep < 3 ? (
                <button onClick={() => setCurrentStep(currentStep + 1)} className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold flex items-center gap-2">
                  Próximo<ChevronRight size={20} />
                </button>
              ) : (
                <button onClick={handleSubmitPlaybook} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2">
                  {loading ? 'Criando...' : <><Check size={20} />Criar Playbook</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaybookSystem;
