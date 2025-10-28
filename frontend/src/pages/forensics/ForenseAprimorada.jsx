import React, { useState, useEffect } from 'react';
import { FileSearch, Plus, ChevronLeft, Upload, Brain, AlertTriangle, CheckCircle, Download, Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const ForenseAprimorada = () => {
  const navigate = useNavigate();
  const [analises, setAnalises] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedAnalise, setSelectedAnalise] = useState(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    caso_numero: '',
    tipo_analise: 'completa',
    base_legal: '',
    dispositivo_origem: ''
  });
  
  const [uploadFiles, setUploadFiles] = useState([]);

  useEffect(() => {
    fetchAnalises();
    fetchStats();
  }, []);

  const fetchAnalises = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/forense-avancada/analises`);
      setAnalises(response.data.analises || []);
    } catch (error) {
      toast.error('Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/forense-avancada/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro stats');
    }
  };

  const handleCreateAnalise = async () => {
    if (!formData.titulo || !formData.base_legal) {
      toast.error('Preencha Título e Base Legal');
      return;
    }
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/forense-avancada/analises`, formData);
      
      if (response.data.success) {
        const analiseId = response.data.analise_id;
        
        toast.success(`Análise ${response.data.codigo} criada!`);
        
        // Upload de arquivos
        if (uploadFiles.length > 0) {
          toast.info(`Enviando ${uploadFiles.length} arquivo(s)...`);
          
          for (const file of uploadFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chunk_number', '0');
            formData.append('total_chunks', '1');
            
            try {
              await axios.post(`${BACKEND_URL}/api/forense-avancada/analises/${analiseId}/upload`, formData);
            } catch (err) {
              console.error('Erro upload:', err);
            }
          }
          
          toast.success('Arquivos enviados! Processamento iniciado.');
        }
        
        setShowWizard(false);
        setFormData({
          titulo: '', caso_numero: '', tipo_analise: 'completa',
          base_legal: '', dispositivo_origem: ''
        });
        setUploadFiles([]);
        fetchAnalises();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro');
    }
  };

  const analisarComIA = async (analiseId) => {
    try {
      toast.info('Athena Forensic Brain analisando...');
      const response = await axios.post(`${BACKEND_URL}/api/forense-avancada/analises/${analiseId}/ai/analyze`);
      
      if (response.data.success) {
        toast.success('Análise IA concluída!');
        // Mostrar resultados
        setSelectedAnalise(response.data.analise);
      }
    } catch (error) {
      toast.error('Erro na análise IA');
    }
  };

  const gerarLaudo = async (analiseId) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/forense-avancada/analises/${analiseId}/laudo`);
      
      if (response.data.success) {
        toast.success('Laudo técnico gerado! JSON probatório disponível.');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao gerar laudo');
    }
  };

  const exportar = async (analiseId, formato) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/forense-avancada/analises/${analiseId}/export?formato=${formato}`);
      
      if (response.data.success) {
        toast.success(`Exportação ${formato.toUpperCase()} concluída!`);
      }
    } catch (error) {
      toast.error('Erro ao exportar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-purple-100 hover:text-white">
            <ChevronLeft size={20} />Voltar
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileSearch size={40} />
              <div>
                <h1 className="text-3xl font-bold">Forense Aprimorada - Athena CISAI 3.0</h1>
                <p className="text-purple-100">Carving, IA, Antiforense, Timeline 3D - Até 4TB+</p>
              </div>
            </div>
            
            <button onClick={() => setShowWizard(true)} className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 flex items-center gap-2 shadow-lg">
              <Plus size={20} />Nova Análise
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Análises</p>
                  <p className="text-3xl font-bold mt-1">{stats.total_analises || 0}</p>
                </div>
                <FileSearch size={40} className="opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Processadas</p>
                  <p className="text-3xl font-bold mt-1">{stats.processadas || 0}</p>
                </div>
                <CheckCircle size={40} className="opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Em Andamento</p>
                  <p className="text-3xl font-bold mt-1">{stats.em_andamento || 0}</p>
                </div>
                <AlertTriangle size={40} className="opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Arquivos Processados</p>
                  <p className="text-3xl font-bold mt-1">{stats.total_arquivos || 0}</p>
                </div>
                <Upload size={40} className="opacity-80" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Análises */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Análises Forenses</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
                Atualizar
              </button>
              <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm">
                Exportar
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Carregando...</p>
            </div>
          ) : analises.length === 0 ? (
            <div className="text-center py-12">
              <FileSearch size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg mb-2">Nenhuma análise forense registrada</p>
              <p className="text-gray-500 text-sm mb-4">Crie a primeira análise para começar</p>
              <button onClick={() => setShowWizard(true)} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700">
                Criar Primeira Análise
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {analises.map((analise) => (
                <div key={analise.id} className="bg-gray-700 border border-gray-600 rounded-xl p-5 hover:shadow-lg transition-all hover:border-purple-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-purple-600 text-white px-3 py-1 rounded-lg font-mono text-sm font-semibold">
                          {analise.codigo}
                        </span>
                        
                        {analise.bloqueado && (
                          <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs flex items-center gap-1">
                            <Lock size={14} />BLOQUEADO
                          </span>
                        )}
                        
                        {analise.ia_analisado && (
                          <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-lg text-xs flex items-center gap-1">
                            <Brain size={14} />IA
                          </span>
                        )}
                      </div>
                      
                      <p className="font-semibold text-white text-lg">{analise.titulo}</p>
                      <p className="text-sm text-gray-400 mt-1">Caso: {analise.caso_numero} • Tipo: {analise.tipo_analise}</p>
                      
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {analise.antiforense_flags && analise.antiforense_flags.length > 0 && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                            <AlertTriangle size={12} className="inline mr-1" />
                            {analise.antiforense_flags.length} flags antiforense
                          </span>
                        )}
                        
                        {analise.carving_results && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                            Carving: {analise.carving_results.arquivos_recuperados} arquivos
                          </span>
                        )}
                        
                        {analise.timeline && analise.timeline.length > 0 && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            Timeline: {analise.timeline.length} eventos
                          </span>
                        )}
                      </div>
                      
                      {/* Barra de progresso */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progresso</span>
                          <span>{analise.progresso || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${analise.progresso || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <span className={`px-4 py-2 rounded-lg text-xs font-semibold text-center ${
                        analise.status === 'concluido' ? 'bg-green-500/20 text-green-400' :
                        analise.status === 'processado' ? 'bg-blue-500/20 text-blue-400' :
                        analise.status === 'processando' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-gray-600 text-gray-300'
                      }`}>
                        {analise.status}
                      </span>
                      
                      <button
                        onClick={() => analisarComIA(analise.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Brain size={14} />Analisar IA
                      </button>
                      
                      {analise.status === 'processado' && (
                        <button
                          onClick={() => gerarLaudo(analise.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-semibold"
                        >
                          Gerar Laudo
                        </button>
                      )}
                      
                      <div className="relative group">
                        <button className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-xs font-semibold flex items-center justify-center gap-1">
                          <Download size={14} />Exportar
                        </button>
                        
                        <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl p-2 w-48 z-10">
                          <button onClick={() => exportar(analise.id, 'pdf')} className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-600 rounded text-xs">PDF (PAdES)</button>
                          <button onClick={() => exportar(analise.id, 'docx')} className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-600 rounded text-xs">DOCX</button>
                          <button onClick={() => exportar(analise.id, 'csv')} className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-600 rounded text-xs">CSV/XLSX</button>
                          <button onClick={() => exportar(analise.id, 'json')} className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-600 rounded text-xs">JSON Probatório</button>
                          <button onClick={() => exportar(analise.id, 'zip')} className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-600 rounded text-xs">ZIP Criptografado</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-4xl border border-gray-700">
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">Nova Análise Forense Avançada</h2>
              <p className="text-purple-100 text-sm mt-1">Suporta TODOS os formatos - Até 4TB+ com chunks automáticos</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Título da Análise*</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                  placeholder="Ex: Análise Forense Completa - Caso 001/2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Número do Caso*</label>
                  <input
                    type="text"
                    required
                    value={formData.caso_numero}
                    onChange={(e) => setFormData({...formData, caso_numero: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                    placeholder="CASO-2024-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Análise*</label>
                  <select
                    value={formData.tipo_analise}
                    onChange={(e) => setFormData({...formData, tipo_analise: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                  >
                    <option value="completa">Completa (Carving + IA + Timeline)</option>
                    <option value="carving">Carving Avançado</option>
                    <option value="antiforense">Detecção Antiforense</option>
                    <option value="timeline">Timeline 3D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Base Legal* (LGPD/CPP)</label>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-2">
                  <p className="text-yellow-400 text-xs">⚖️ Base legal obrigatória. Sem isso a análise não inicia.</p>
                </div>
                <select
                  required
                  value={formData.base_legal}
                  onChange={(e) => setFormData({...formData, base_legal: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                >
                  <option value="">Selecione...</option>
                  <option value="ordem_judicial">Ordem Judicial</option>
                  <option value="consentimento">Consentimento do Titular</option>
                  <option value="exercicio_regular">Exercício Regular de Direito</option>
                  <option value="mandato">Mandato (Advocacia/Perícia)</option>
                </select>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-purple-500/50 rounded-xl p-8 bg-purple-500/5">
                <Upload size={48} className="mx-auto text-purple-400 mb-3" />
                <p className="text-white font-semibold text-center mb-2">Upload de Evidências</p>
                <p className="text-gray-400 text-sm text-center mb-4">
                  E01, RAW, UFDR, OXY, XRY, ZIP, PDF, MP4, etc - Até 4TB+ com chunks
                </p>
                
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setUploadFiles(files);
                    toast.success(`${files.length} arquivo(s) selecionado(s)`);
                  }}
                  className="hidden"
                  id="forense-upload"
                />
                
                <label
                  htmlFor="forense-upload"
                  className="block w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center cursor-pointer font-semibold"
                >
                  Selecionar Arquivos
                </label>
                
                {uploadFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-semibold">{file.name}</p>
                          <p className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          onClick={() => setUploadFiles(uploadFiles.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features incluídas */}
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Shield size={18} className="text-purple-400" />
                  Recursos Incluídos Automaticamente
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle size={14} className="text-green-400" />
                    Hashing (SHA-256/SHA-512/BLAKE3)
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle size={14} className="text-green-400" />
                    Carving de arquivos deletados
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle size={14} className="text-green-400" />
                    Detecção antiforense (YARA + IA)
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle size={14} className="text-green-400" />
                    Timeline interativa 3D
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle size={14} className="text-green-400" />
                    Análise EXIF/GPS + Shadow
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle size={14} className="text-green-400" />
                    Cadeia de custódia blockchain
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle size={14} className="text-green-400" />
                    Athena Forensic Brain (IA)
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle size={14} className="text-green-400" />
                    Export multi-formato (PDF/DOCX/JSON)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 px-6 py-4 flex justify-between rounded-b-xl border-t border-gray-600">
              <button
                onClick={() => {
                  setShowWizard(false);
                  setFormData({
                    titulo: '', caso_numero: '', tipo_analise: 'completa',
                    base_legal: '', dispositivo_origem: ''
                  });
                  setUploadFiles([]);
                }}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600 font-semibold"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleCreateAnalise}
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Criando...' : (
                  <>
                    <CheckCircle size={18} />
                    Criar Análise
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForenseAprimorada;
