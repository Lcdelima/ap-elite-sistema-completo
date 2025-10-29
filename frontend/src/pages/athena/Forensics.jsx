import React, { useState, useEffect } from 'react';
import { Shield, Plus, ChevronLeft, QrCode, Upload, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const Forensics = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    examTitle: '',
    caseNumber: '',
    deviceInfo: '',
    deviceBrand: '',
    deviceModel: '',
    imei: '',
    serial: '',
    examType: '',
    baseLegal: '',
    priority: ''
  });
  const [uploadFiles, setUploadFiles] = useState([]);

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/pericia-ultra/exames`);
      setItems(response.data.exames || []);
    } catch (error) {
      toast.error('Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/pericia-ultra/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro stats');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.baseLegal) {
      toast.error('Base legal obrigatória!');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/pericia-ultra/exames`, {
        titulo: formData.examTitle,
        caso_numero: formData.caseNumber,
        dispositivo_tipo: formData.deviceInfo,
        dispositivo_modelo: `${formData.deviceBrand} ${formData.deviceModel}`,
        imei: formData.imei,
        serial: formData.serial,
        metodo_extracao: formData.examType,
        base_legal: formData.baseLegal,
        lacre_numero: `LACRE-${Date.now()}`
      });
      
      if (response.data.success) {
        const examId = response.data.exam_id;
        
        toast.success(`Exame ${response.data.codigo} criado! QR Code gerado.`);
        
        // Upload evidências
        if (uploadFiles.length > 0) {
          toast.info('Enviando evidências...');
          
          for (const file of uploadFiles) {
            const fd = new FormData();
            fd.append('file', file);
            
            try {
              await axios.post(`${BACKEND_URL}/api/pericia-ultra/exames/${examId}/ingest`, fd);
            } catch (err) {
              console.error('Erro upload:', err);
            }
          }
          
          toast.success('Evidências enviadas com hash calculado!');
        }
        
        setShowModal(false);
        setFormData({
          examTitle: '', caseNumber: '', deviceInfo: '', deviceBrand: '',
          deviceModel: '', imei: '', serial: '', examType: '', baseLegal: '', priority: ''
        });
        setUploadFiles([]);
        fetchItems();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Dark */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-purple-100 hover:text-white">
            <ChevronLeft size={20} />Voltar
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield size={40} />
              <div>
                <h1 className="text-3xl font-bold">Perícia Digital</h1>
                <p className="text-purple-100">Análise forense avançada de dispositivos - ISO/IEC 27037</p>
              </div>
            </div>
            
            <button onClick={() => setShowModal(true)} className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-50 flex items-center gap-2 shadow-lg">
              <Plus size={20} />Novo Exame
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total</p>
                  <p className="text-3xl font-bold mt-1">{stats.total || 0}</p>
                </div>
                <Shield size={40} className="opacity-80" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Concluídos</p>
                  <p className="text-3xl font-bold mt-1">{stats.concluidos || 0}</p>
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
          </div>
        </div>
      )}

      {/* Lista */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Exames Periciais</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Shield size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Nenhum exame pericial</p>
              <button onClick={() => setShowModal(true)} className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl">
                Criar Primeiro Exame
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-700 border border-gray-600 rounded-xl p-5 hover:shadow-lg transition hover:border-purple-500">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-purple-600 text-white px-3 py-1 rounded font-mono">{item.codigo}</span>
                        {item.qr_code && <QrCode size={16} className="text-purple-400" />}
                      </div>
                      <p className="font-semibold text-white text-lg">{item.titulo}</p>
                      <p className="text-sm text-gray-400">{item.dispositivo_tipo} • {item.metodo_extracao}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-semibold h-fit ${
                      item.status === 'concluido' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Dark */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-3xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">Novo Exame Pericial</h2>
              <p className="text-purple-100 text-sm mt-1">ISO/IEC 27037 - Cadeia de Custódia Automática</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 text-sm font-semibold">⚖️ Base Legal Obrigatória (LGPD + CPP 159)</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Título do Exame*</label>
                <input type="text" required value={formData.examTitle} onChange={(e) => setFormData({...formData, examTitle: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" placeholder="Ex: Exame Pericial 001/2024" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Número do Caso*</label>
                  <input type="text" required value={formData.caseNumber} onChange={(e) => setFormData({...formData, caseNumber: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Base Legal*</label>
                  <select required value={formData.baseLegal} onChange={(e) => setFormData({...formData, baseLegal: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg">
                    <option value="">Selecione...</option>
                    <option value="ordem_judicial">Ordem Judicial</option>
                    <option value="mandato">Mandato</option>
                    <option value="consentimento">Consentimento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo Dispositivo*</label>
                  <select required value={formData.deviceInfo} onChange={(e) => setFormData({...formData, deviceInfo: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg">
                    <option value="">Selecione...</option>
                    <option value="smartphone">Smartphone</option>
                    <option value="tablet">Tablet</option>
                    <option value="computer">Computador</option>
                    <option value="storage">Storage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Método Extração*</label>
                  <select required value={formData.examType} onChange={(e) => setFormData({...formData, examType: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg">
                    <option value="">Selecione...</option>
                    <option value="logica">Lógica</option>
                    <option value="fisica">Física</option>
                    <option value="jtag">JTAG</option>
                    <option value="chip_off">Chip-Off</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">IMEI</label>
                  <input type="text" value={formData.imei} onChange={(e) => setFormData({...formData, imei: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" placeholder="15 dígitos" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Serial</label>
                  <input type="text" value={formData.serial} onChange={(e) => setFormData({...formData, serial: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" />
                </div>
              </div>

              {/* Upload */}
              <div className="border-2 border-dashed border-purple-500/50 rounded-xl p-6 bg-purple-500/5">
                <Upload size={40} className="mx-auto text-purple-400 mb-3" />
                <p className="text-white font-semibold text-center mb-2">Upload de Evidências</p>
                <p className="text-gray-400 text-sm text-center mb-4">E01, UFDR, OXY, ZIP, RAW - Com OCR e Hash automático</p>
                
                <input type="file" multiple onChange={(e) => { setUploadFiles(Array.from(e.target.files)); toast.success(`${e.target.files.length} arquivo(s)`); }} className="hidden" id="evidence-upload" />
                
                <label htmlFor="evidence-upload" className="block w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center cursor-pointer font-semibold">
                  Selecionar Evidências
                </label>
                
                {uploadFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadFiles.map((f, i) => (
                      <div key={i} className="flex justify-between bg-gray-700 p-3 rounded">
                        <span className="text-white text-sm">{f.name}</span>
                        <button onClick={() => setUploadFiles(uploadFiles.filter((_, idx) => idx !== i))} className="text-red-400">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-purple-400" />Recursos Automáticos
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300"><CheckCircle size={14} className="text-green-400" />QR Code + Lacre</div>
                  <div className="flex items-center gap-2 text-gray-300"><CheckCircle size={14} className="text-green-400" />Hash SHA-256/SHA-512</div>
                  <div className="flex items-center gap-2 text-gray-300"><CheckCircle size={14} className="text-green-400" />OCR Tesseract</div>
                  <div className="flex items-center gap-2 text-gray-300"><CheckCircle size={14} className="text-green-400" />Parser UFDR/OXY</div>
                  <div className="flex items-center gap-2 text-gray-300"><CheckCircle size={14} className="text-green-400" />Cadeia Custódia</div>
                  <div className="flex items-center gap-2 text-gray-300"><CheckCircle size={14} className="text-green-400" />Prazos D-3/D-1</div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => { setShowModal(false); setUploadFiles([]); }} className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 font-semibold">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-50">
                  {loading ? 'Criando...' : 'Criar Exame'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forensics;