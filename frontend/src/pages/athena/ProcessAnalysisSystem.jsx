import React, { useState, useEffect } from 'react';
import { Scale, Plus, ChevronLeft, ChevronRight, Check, Upload, Brain, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const ProcessAnalysisSystem = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [wizardData, setWizardData] = useState({
    // ETAPA 1: Identificação
    cnj: '',
    comarca: '',
    vara: '',
    tipo_processo: '',
    tipo_analise: '',
    prioridade: 'P2',
    prazo: '',
    legal: { basis: '', evidence_id: '', purpose: '' },
    partes: {},
    
    // ETAPA 2: Provas
    documentos: [],
    uploading: false,
    
    // ETAPA 3: Conclusões
    ai_enabled: true
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchAnalyses();
    fetchStats();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/analysis/list`);
      setAnalyses(response.data.analyses || []);
    } catch (error) {
      toast.error('Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/analysis/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro stats');
    }
  };

  const formatCNJ = (value) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara NNNNNNN-NN.NNNN.N.NN.NNNN
    if (numbers.length <= 7) return numbers;
    if (numbers.length <= 9) return `${numbers.slice(0,7)}-${numbers.slice(7)}`;
    if (numbers.length <= 13) return `${numbers.slice(0,7)}-${numbers.slice(7,9)}.${numbers.slice(9)}`;
    if (numbers.length <= 14) return `${numbers.slice(0,7)}-${numbers.slice(7,9)}.${numbers.slice(9,13)}.${numbers.slice(13)}`;
    if (numbers.length <= 16) return `${numbers.slice(0,7)}-${numbers.slice(7,9)}.${numbers.slice(9,13)}.${numbers.slice(13,14)}.${numbers.slice(14)}`;
    
    return `${numbers.slice(0,7)}-${numbers.slice(7,9)}.${numbers.slice(9,13)}.${numbers.slice(13,14)}.${numbers.slice(14,16)}.${numbers.slice(16,20)}`;
  };

  const handleCNJChange = (e) => {
    const formatted = formatCNJ(e.target.value);
    setWizardData({...wizardData, cnj: formatted});
    
    // Autocomplete comarca e vara do CNJ
    if (formatted.length === 25) {
      const match = formatted.match(/\d{7}-\d{2}\.(\d{4})\.(\d{1})\.(\d{2})\.(\d{4})/);
      if (match) {
        const [_, ano, segmento, tribunal, origem] = match;
        
        // Autocomplete baseado no código do tribunal
        if (tribunal === '26') {
          setWizardData({
            ...wizardData,
            cnj: formatted,
            comarca: 'São Paulo - Capital',
            vara: 'A definir'
          });
          toast.success('Comarca preenchida automaticamente!');
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!wizardData.cnj || !wizardData.tipo_analise || !wizardData.legal.basis) {
      toast.error('Preencha CNJ, Tipo de Análise e Base Legal');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/analysis/case`, wizardData);
      
      if (response.data.success) {
        const analysisId = response.data.analysis_id;
        
        // Upload de arquivos se houver
        if (selectedFiles.length > 0) {
          toast.info(`Enviando ${selectedFiles.length} arquivo(s)...`);
          
          for (const file of selectedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('tipo', 'documento');
            
            try {
              await axios.post(`${BACKEND_URL}/api/analysis/${analysisId}/ingest`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
            } catch (uploadError) {
              console.error('Erro no upload:', uploadError);
            }
          }
        }
        
        toast.success('Análise criada! Prazos D-3 e D-1 agendados.');
        setShowWizard(false);
        setCurrentStep(1);
        setSelectedFiles([]);
        setWizardData({
          cnj: '', comarca: '', vara: '', tipo_processo: '', tipo_analise: '',
          prioridade: 'P2', prazo: '', legal: { basis: '', evidence_id: '', purpose: '' },
          partes: {}, documentos: [], uploading: false, ai_enabled: true
        });
        fetchAnalyses();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar análise');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
    toast.success(`${files.length} arquivo(s) selecionado(s)`);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const executarIA = async (analysisId, tipo) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/analysis/${analysisId}/ai/${tipo}`);
      if (response.data.success) {
        toast.success(`Análise ${tipo} concluída!`);
        // Mostrar resultado em modal ou expandir
      }
    } catch (error) {
      toast.error(`Erro na análise ${tipo}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 hover:text-blue-100">
            <ChevronLeft size={20} />Voltar
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Scale size={40} />
              <div>
                <h1 className="text-3xl font-bold">Análise de Processos</h1>
                <p className="text-blue-100">Sistema inteligente com IA - CPP/CP/LGPD</p>
              </div>
            </div>
            
            <button onClick={() => setShowWizard(true)} className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 flex items-center gap-2">
              <Plus size={20} />Nova Análise
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Total</p>
              <p className="text-3xl font-bold mt-1">{stats.total || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Concluídas</p>
              <p className="text-3xl font-bold mt-1">{stats.concluidas || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Em Análise</p>
              <p className="text-3xl font-bold mt-1">{stats.em_analise || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Urgentes</p>
              <p className="text-3xl font-bold mt-1">{stats.urgentes || 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Análises</h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div></div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-12">
                <Scale size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-lg">Nenhuma análise</p>
                <button onClick={() => setShowWizard(true)} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg">
                  Criar Primeira Análise
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">CNJ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Prazo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Ações IA</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 border-b">
                      <td className="px-6 py-4 font-mono text-sm">{a.cnj}</td>
                      <td className="px-6 py-4">{a.tipo_analise}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          a.status === 'concluida' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>{a.status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">{new Date(a.prazo).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => executarIA(a.id, 'prescricao')} className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-xs hover:bg-purple-200">
                            Prescrição
                          </button>
                          <button onClick={() => executarIA(a.id, 'cadeia')} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200">
                            Cadeia
                          </button>
                          <button onClick={() => executarIA(a.id, 'resumo')} className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200">
                            Resumo
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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <h2 className="text-2xl font-bold mb-4">Nova Análise de Processo</h2>
              
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                <div className="flex-1 flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-white text-blue-600' : 'bg-white/20'}`}>
                    {currentStep > 1 ? <Check size={20} /> : '1'}
                  </div>
                  <span className="font-semibold text-sm">Identificação</span>
                </div>
                
                <div className="w-12 h-1 bg-white/30"></div>
                
                <div className="flex-1 flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-white text-blue-600' : 'bg-white/20'}`}>
                    {currentStep > 2 ? <Check size={20} /> : '2'}
                  </div>
                  <span className="font-semibold text-sm">Provas</span>
                </div>
                
                <div className="w-12 h-1 bg-white/30"></div>
                
                <div className="flex-1 flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-white text-blue-600' : 'bg-white/20'}`}>3</div>
                  <span className="font-semibold text-sm">Conclusões</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* ETAPA 1 */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4">Identificação & Escopo</h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">Use o formato CNJ. Validamos automaticamente.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Número do Processo (CNJ)*</label>
                    <input
                      type="text"
                      required
                      value={wizardData.cnj}
                      onChange={handleCNJChange}
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                      placeholder="0001234-56.2024.8.26.0100"
                      maxLength="25"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Comarca*</label>
                      <input type="text" required value={wizardData.comarca} onChange={(e) => setWizardData({...wizardData, comarca: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="São Paulo - Capital" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Vara</label>
                      <input type="text" value={wizardData.vara} onChange={(e) => setWizardData({...wizardData, vara: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="1ª Vara Criminal" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Tipo de Processo*</label>
                      <select required value={wizardData.tipo_processo} onChange={(e) => setWizardData({...wizardData, tipo_processo: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                        <option value="">Selecione...</option>
                        <option value="Criminal">Criminal</option>
                        <option value="Cível">Cível</option>
                        <option value="Trabalhista">Trabalhista</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">Tipo de Análise*</label>
                      <select required value={wizardData.tipo_analise} onChange={(e) => setWizardData({...wizardData, tipo_analise: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                        <option value="">Selecione...</option>
                        <option value="Nulidades">Nulidades</option>
                        <option value="Insuficiência Probatória">Insuficiência Probatória</option>
                        <option value="Prescrição">Prescrição</option>
                        <option value="Dosimetria">Dosimetria</option>
                        <option value="Execução/Detração">Execução/Detração</option>
                        <option value="Habeas Corpus">Habeas Corpus</option>
                        <option value="Sentença e Recursos">Sentença e Recursos</option>
                        <option value="Cumprimento de Medidas">Cumprimento de Medidas</option>
                        <option value="Cadeia de Custódia">Cadeia de Custódia</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Prioridade/SLA*</label>
                      <select value={wizardData.prioridade} onChange={(e) => setWizardData({...wizardData, prioridade: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                        <option value="P1">🔴 P1 - Urgente (24h)</option>
                        <option value="P2">🟡 P2 - Normal (7 dias)</option>
                        <option value="P3">🟢 P3 - Baixa (30 dias)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">Prazo Final*</label>
                      <input type="date" required value={wizardData.prazo} onChange={(e) => setWizardData({...wizardData, prazo: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                      <p className="text-xs text-gray-500 mt-1">Gera D-3 e D-1 automaticamente</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 font-semibold">⚖️ Base Legal Obrigatória (LGPD/CPP)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Base Legal*</label>
                      <select required value={wizardData.legal.basis} onChange={(e) => setWizardData({...wizardData, legal: {...wizardData.legal, basis: e.target.value}})} className="w-full px-3 py-2 border rounded-lg">
                        <option value="">Selecione...</option>
                        <option value="regular_direito">Exercício Regular de Direito</option>
                        <option value="mandato">Mandato (Advocacia)</option>
                        <option value="ordem_judicial">Ordem Judicial</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">ID Documento Comprobatório</label>
                      <input type="text" value={wizardData.legal.evidence_id} onChange={(e) => setWizardData({...wizardData, legal: {...wizardData.legal, evidence_id: e.target.value}})} className="w-full px-3 py-2 border rounded-lg" placeholder="UUID do documento" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Finalidade (LGPD)*</label>
                    <textarea required value={wizardData.legal.purpose} onChange={(e) => setWizardData({...wizardData, legal: {...wizardData.legal, purpose: e.target.value}})} rows="2" className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Defesa técnica no processo..." />
                  </div>
                </div>
              )}

              {/* ETAPA 2 */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4">Provas & Síntese</h3>
                  
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-blue-50">
                    <Upload size={48} className="mx-auto text-blue-600 mb-3" />
                    <p className="text-blue-900 font-semibold mb-2 text-center">Upload de Documentos</p>
                    <p className="text-sm text-blue-700 mb-4 text-center">Sentença, Denúncia, RA, Mídias - Com OCR + Hash automático</p>
                    
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    
                    <label
                      htmlFor="file-upload"
                      className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center cursor-pointer font-semibold"
                    >
                      Selecionar Arquivos
                    </label>
                  </div>

                  {/* Lista de arquivos selecionados */}
                  {selectedFiles.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">📎 Arquivos Selecionados ({selectedFiles.length})</h4>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText size={20} className="text-blue-600" />
                              <div>
                                <p className="text-sm font-semibold">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:bg-red-50 p-2 rounded"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-3">🤖 Ferramentas IA Disponíveis</h4>
                    <p className="text-sm text-purple-700 mb-3">
                      Após criar a análise e fazer upload dos documentos, você poderá executar:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm flex items-center justify-center gap-2">
                        <Brain size={16} />Detectar Prescrição (CP 109/115)
                      </div>
                      <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm flex items-center justify-center gap-2">
                        <FileText size={16} />Checar Cadeia (CPP 158-A/F)
                      </div>
                      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm flex items-center justify-center gap-2">
                        <Brain size={16} />Análise de Dosimetria
                      </div>
                      <div className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm flex items-center justify-center gap-2">
                        <FileText size={16} />Resumo Executivo
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>ℹ️ Processamento Automático:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
                      <li>✓ Cálculo de hash SHA-256 e SHA-512</li>
                      <li>✓ OCR automático para PDFs e imagens</li>
                      <li>✓ Indexação para busca semântica</li>
                      <li>✓ Extração de datas e marcos processuais</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* ETAPA 3 */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold mb-4">Conclusões & Entregáveis</h3>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✓ Pronto para Criação</h4>
                    <div className="text-sm text-green-800 space-y-1">
                      <p>• CNJ: {wizardData.cnj || 'Não preenchido'}</p>
                      <p>• Tipo: {wizardData.tipo_analise || 'Não selecionado'}</p>
                      <p>• Prazo: {wizardData.prazo || 'Não definido'}</p>
                      <p>• Base Legal: {wizardData.legal.basis || 'Não informada'}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Brain size={20} />
                      IA será executada após criação
                    </h4>
                    <p className="text-sm text-blue-800">
                      Você poderá executar: Análise de Prescrição, Cadeia de Custódia, Dosimetria e Resumo Executivo
                    </p>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={wizardData.ai_enabled}
                      onChange={(e) => setWizardData({...wizardData, ai_enabled: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm font-semibold">Habilitar análises com IA (recomendado)</span>
                  </label>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-between border-t">
              <button onClick={() => currentStep === 1 ? setShowWizard(false) : setCurrentStep(currentStep - 1)} className="px-6 py-2 border text-gray-700 rounded-lg hover:bg-gray-100 font-semibold flex items-center gap-2">
                <ChevronLeft size={20} />{currentStep === 1 ? 'Cancelar' : 'Voltar'}
              </button>
              
              {currentStep < 3 ? (
                <button onClick={() => setCurrentStep(currentStep + 1)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2">
                  Próximo<ChevronRight size={20} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2">
                  {loading ? 'Criando...' : <><Check size={20} />Criar Análise</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessAnalysisSystem;
