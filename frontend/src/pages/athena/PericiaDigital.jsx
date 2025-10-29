import React, { useState, useEffect } from 'react';
import { Microscope, Plus, Search, FileText, Shield, Hash, Clock, CheckCircle, AlertTriangle, Upload, Download, Eye } from 'lucide-react';
import StandardModuleLayout from '../../components/StandardModuleLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PericiaDigital = () => {
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    case_number: '',
    legal_basis: 'mandado',
    device_type: 'smartphone',
    device_brand: '',
    device_model: '',
    device_serial: '',
    responsible: '',
    description: '',
    priority: 'normal'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, examsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/forensics/digital/stats`, { headers }),
        fetch(`${BACKEND_URL}/api/forensics/digital/exams`, { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (examsRes.ok) {
        const data = await examsRes.json();
        setExams(Array.isArray(data) ? data : []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const dataToSend = {
        ...formData,
        responsible: user.name || formData.responsible || 'Perito Responsável'
      };

      const response = await fetch(`${BACKEND_URL}/api/forensics/digital/exams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        alert('Análise criada com sucesso!');
        setShowModal(false);
        setFormData({
          title: '',
          case_number: '',
          legal_basis: 'mandado',
          device_type: 'smartphone',
          device_brand: '',
          device_model: '',
          device_serial: '',
          responsible: '',
          description: '',
          priority: 'normal'
        });
        fetchData();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail || 'Erro ao criar análise'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao criar análise');
    }
  };

  const viewDetails = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/forensics/digital/exams/${examId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const exam = await response.json();
        setSelectedExam(exam);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateReport = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/forensics/digital/exams/${examId}/report?format=json`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const report = await response.json();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laudo_${examId}_${Date.now()}.json`;
        a.click();
        
        alert('Laudo gerado com sucesso!');
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao gerar laudo');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'aberto': { color: 'bg-blue-500', icon: Clock, text: 'Aberto' },
      'em_processamento': { color: 'bg-yellow-500', icon: AlertTriangle, text: 'Em Processamento' },
      'concluído': { color: 'bg-green-500', icon: CheckCircle, text: 'Concluído' }
    };
    
    const badge = badges[status] || badges['aberto'];
    const Icon = badge.icon;
    
    return (
      <span className={`${badge.color} text-white px-3 py-1 rounded-full text-xs flex items-center gap-1`}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'baixa': 'bg-gray-500',
      'normal': 'bg-blue-500',
      'alta': 'bg-orange-500',
      'urgente': 'bg-red-500'
    };
    
    return (
      <span className={`${colors[priority] || colors['normal']} text-white px-2 py-1 rounded text-xs`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  return (
    <StandardModuleLayout>
      <div className="p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Microscope size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Perícia Digital</h1>
                <p className="text-teal-100">Análise forense especializada de dispositivos digitais</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition flex items-center gap-2"
            >
              <Plus size={20} />
              Nova Análise
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-3xl font-bold text-white">{stats.total_exams || 0}</p>
              </div>
              <FileText className="text-teal-400" size={32} />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Abertos</p>
                <p className="text-3xl font-bold text-white">{stats.abertos || 0}</p>
              </div>
              <Clock className="text-blue-400" size={32} />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Em Processo</p>
                <p className="text-3xl font-bold text-white">{stats.em_processamento || 0}</p>
              </div>
              <AlertTriangle className="text-yellow-400" size={32} />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Concluídos</p>
                <p className="text-3xl font-bold text-white">{stats.concluidos || 0}</p>
              </div>
              <CheckCircle className="text-green-400" size={32} />
            </div>
          </div>
        </div>

        {/* Compliance Banner */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-4 mb-6 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <Shield className="text-purple-300" size={24} />
            <div className="flex-1">
              <p className="text-white font-semibold">Compliance Forense</p>
              <p className="text-gray-300 text-sm">ISO 27037 • ISO 27042 • NIST 800-86 • LGPD • CPP Art. 158-184</p>
            </div>
          </div>
        </div>

        {/* Exams List */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">Análises Periciais</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-400">Carregando...</div>
          ) : exams.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Microscope size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhuma análise pericial cadastrada</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-teal-400 hover:text-teal-300"
              >
                Criar primeira análise
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="text-left p-4 text-gray-300 font-semibold">Caso</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Título</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Dispositivo</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Status</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Prioridade</th>
                    <th className="text-left p-4 text-gray-300 font-semibold">Data</th>
                    <th className="text-center p-4 text-gray-300 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam, index) => (
                    <tr key={exam.id} className={`${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'} hover:bg-slate-700 transition`}>
                      <td className="p-4 text-white font-mono text-sm">{exam.case_number}</td>
                      <td className="p-4 text-white">{exam.title}</td>
                      <td className="p-4 text-gray-300 text-sm">
                        {exam.device_type}
                        {exam.device_brand && ` - ${exam.device_brand}`}
                        {exam.device_model && ` ${exam.device_model}`}
                      </td>
                      <td className="p-4">{getStatusBadge(exam.status)}</td>
                      <td className="p-4">{getPriorityBadge(exam.priority)}</td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(exam.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => viewDetails(exam.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
                            title="Ver Detalhes"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => generateReport(exam.id)}
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded transition"
                            title="Gerar Laudo"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Microscope />
                  Nova Análise Pericial
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Título da Análise *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ex: Perícia em Smartphone Samsung"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Número do Caso *</label>
                    <input
                      type="text"
                      required
                      value={formData.case_number}
                      onChange={(e) => setFormData({...formData, case_number: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ex: 2024.0001.0000-0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Base Legal *</label>
                    <select
                      required
                      value={formData.legal_basis}
                      onChange={(e) => setFormData({...formData, legal_basis: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="mandado">Mandado Judicial</option>
                      <option value="ordem_judicial">Ordem Judicial</option>
                      <option value="termo_consentimento">Termo de Consentimento</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Tipo de Dispositivo *</label>
                    <select
                      required
                      value={formData.device_type}
                      onChange={(e) => setFormData({...formData, device_type: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="smartphone">Smartphone</option>
                      <option value="computador">Computador</option>
                      <option value="tablet">Tablet</option>
                      <option value="hd_externo">HD Externo</option>
                      <option value="pendrive">Pendrive</option>
                      <option value="servidor">Servidor</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Marca do Dispositivo</label>
                    <input
                      type="text"
                      value={formData.device_brand}
                      onChange={(e) => setFormData({...formData, device_brand: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ex: Samsung, Apple, Dell"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Modelo do Dispositivo</label>
                    <input
                      type="text"
                      value={formData.device_model}
                      onChange={(e) => setFormData({...formData, device_model: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ex: Galaxy S21, iPhone 13 Pro"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">Número de Série</label>
                    <input
                      type="text"
                      value={formData.device_serial}
                      onChange={(e) => setFormData({...formData, device_serial: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ex: SN123456789"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Prioridade</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="normal">Normal</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Descrição / Objetivos da Perícia</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 h-24"
                    placeholder="Descreva os objetivos da perícia, materiais a serem analisados, etc."
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Criar Análise
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedExam && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText />
                  Detalhes da Análise
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Info Geral */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Informações Gerais
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-slate-750 p-4 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">Título</p>
                      <p className="text-white font-semibold">{selectedExam.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Número do Caso</p>
                      <p className="text-white font-mono">{selectedExam.case_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Base Legal</p>
                      <p className="text-white">{selectedExam.legal_basis}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Responsável</p>
                      <p className="text-white">{selectedExam.responsible}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedExam.status)}</div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Prioridade</p>
                      <div className="mt-1">{getPriorityBadge(selectedExam.priority)}</div>
                    </div>
                  </div>
                </div>

                {/* Dispositivo */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Microscope size={20} />
                    Dispositivo Periciado
                  </h3>
                  <div className="grid grid-cols-3 gap-4 bg-slate-750 p-4 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">Tipo</p>
                      <p className="text-white">{selectedExam.device_type}</p>
                    </div>
                    {selectedExam.device_brand && (
                      <div>
                        <p className="text-gray-400 text-sm">Marca</p>
                        <p className="text-white">{selectedExam.device_brand}</p>
                      </div>
                    )}
                    {selectedExam.device_model && (
                      <div>
                        <p className="text-gray-400 text-sm">Modelo</p>
                        <p className="text-white">{selectedExam.device_model}</p>
                      </div>
                    )}
                    {selectedExam.device_serial && (
                      <div>
                        <p className="text-gray-400 text-sm">Número de Série</p>
                        <p className="text-white font-mono text-sm">{selectedExam.device_serial}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hashes */}
                {selectedExam.hash_sha256 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Hash size={20} />
                      Hashes Criptográficos
                    </h3>
                    <div className="bg-slate-750 p-4 rounded-lg space-y-2">
                      <div>
                        <p className="text-gray-400 text-xs">SHA-256</p>
                        <p className="text-green-400 font-mono text-xs break-all">{selectedExam.hash_sha256}</p>
                      </div>
                      {selectedExam.hash_sha512 && (
                        <div>
                          <p className="text-gray-400 text-xs">SHA-512</p>
                          <p className="text-green-400 font-mono text-xs break-all">{selectedExam.hash_sha512}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cadeia de Custódia */}
                {selectedExam.custody_chain && selectedExam.custody_chain.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Shield size={20} />
                      Cadeia de Custódia
                    </h3>
                    <div className="space-y-2">
                      {selectedExam.custody_chain.map((act, index) => (
                        <div key={index} className="bg-slate-750 p-4 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-white font-semibold">{act.ato}</p>
                              <p className="text-gray-400 text-sm mt-1">{act.description}</p>
                              <p className="text-gray-500 text-xs mt-2">
                                {new Date(act.timestamp).toLocaleString('pt-BR')} - {act.responsible}
                              </p>
                            </div>
                            {act.hash_curr && (
                              <div className="ml-4">
                                <p className="text-gray-400 text-xs">Hash</p>
                                <p className="text-green-400 font-mono text-xs">{act.hash_curr}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {selectedExam.timeline && selectedExam.timeline.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Clock size={20} />
                      Timeline de Eventos
                    </h3>
                    <div className="space-y-2">
                      {selectedExam.timeline.map((event, index) => (
                        <div key={index} className="bg-slate-750 p-3 rounded-lg flex items-start gap-3">
                          <div className="bg-teal-600 rounded-full p-2">
                            <Clock size={14} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{event.event}</p>
                            <p className="text-gray-400 text-xs">{event.details}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(event.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </StandardModuleLayout>
  );
};

export default PericiaDigital;
