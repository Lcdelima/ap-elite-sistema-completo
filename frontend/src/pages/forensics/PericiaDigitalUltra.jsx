import React, { useState, useEffect } from 'react';
import { Shield, Plus, ChevronLeft, QrCode, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PericiaDigitalUltra = () => {
  const navigate = useNavigate();
  const [exames, setExames] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '', caso_numero: '', dispositivo_tipo: '', dispositivo_modelo: '',
    imei: '', serial: '', metodo_extracao: '', base_legal: '', lacre_numero: ''
  });

  useEffect(() => {
    fetchExames();
    fetchStats();
  }, []);

  const fetchExames = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/pericia-ultra/exames`);
      setExames(response.data.exames || []);
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
    try {
      const response = await axios.post(`${BACKEND_URL}/api/pericia-ultra/exames`, formData);
      if (response.data.success) {
        toast.success('Exame criado! QR Code gerado.');
        setShowModal(false);
        setFormData({
          titulo: '', caso_numero: '', dispositivo_tipo: '', dispositivo_modelo: '',
          imei: '', serial: '', metodo_extracao: '', base_legal: '', lacre_numero: ''
        });
        fetchExames();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 text-purple-100 hover:text-white">
            <ChevronLeft size={20} />Voltar
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield size={40} />
              <div>
                <h1 className="text-3xl font-bold">Perícia Digital Ultra</h1>
                <p className="text-purple-100">Extração, Análise, Custódia - ISO 27037</p>
              </div>
            </div>
            
            <button onClick={() => setShowModal(true)} className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 flex items-center gap-2">
              <Plus size={20} />Novo Exame
            </button>
          </div>
        </div>
      </div>

      {stats && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Total Exames</p>
              <p className="text-3xl font-bold mt-1">{stats.total || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Concluídos</p>
              <p className="text-3xl font-bold mt-1">{stats.concluidos || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
              <p className="text-sm opacity-90">Em Andamento</p>
              <p className="text-3xl font-bold mt-1">{stats.em_andamento || 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Exames Forenses</h2>
          
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div></div>
          ) : exames.length === 0 ? (
            <div className="text-center py-12">
              <Shield size={64} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Nenhum exame registrado</p>
              <button onClick={() => setShowModal(true)} className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg">
                Criar Primeiro Exame
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {exames.map((ex) => (
                <div key={ex.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-purple-600 text-white px-3 py-1 rounded font-mono text-sm">{ex.codigo}</span>
                        {ex.qr_code && <QrCode size={16} className="text-purple-400" />}
                      </div>
                      <p className="font-semibold text-white">{ex.titulo}</p>
                      <p className="text-sm text-gray-400">{ex.dispositivo_tipo} - {ex.dispositivo_modelo}</p>
                      <p className="text-xs text-gray-500 mt-1">Lacre: {ex.lacre_numero} • Método: {ex.metodo_extracao}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ex.status === 'concluido' ? 'bg-green-500/20 text-green-400' :
                        ex.status === 'iniciado' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>{ex.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-4">Novo Exame Forense</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Título do Exame*</label>
                <input type="text" required value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" placeholder="Ex: Exame Pericial 001/2024" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Número do Caso*</label>
                  <input type="text" required value={formData.caso_numero} onChange={(e) => setFormData({...formData, caso_numero: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Dispositivo*</label>
                  <select required value={formData.dispositivo_tipo} onChange={(e) => setFormData({...formData, dispositivo_tipo: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg">
                    <option value="">Selecione...</option>
                    <option value="smartphone">Smartphone</option>
                    <option value="tablet">Tablet</option>
                    <option value="computer">Computador</option>
                    <option value="storage">Storage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Método de Extração*</label>
                  <select required value={formData.metodo_extracao} onChange={(e) => setFormData({...formData, metodo_extracao: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg">
                    <option value="">Selecione...</option>
                    <option value="logica">Lógica</option>
                    <option value="fisica">Física</option>
                    <option value="chip_off">Chip-Off</option>
                    <option value="jtag">JTAG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Número do Lacre*</label>
                  <input type="text" required value={formData.lacre_numero} onChange={(e) => setFormData({...formData, lacre_numero: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Base Legal*</label>
                <select required value={formData.base_legal} onChange={(e) => setFormData({...formData, base_legal: e.target.value})} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg">
                  <option value="">Selecione...</option>
                  <option value="ordem_judicial">Ordem Judicial</option>
                  <option value="consentimento">Consentimento</option>
                  <option value="exercicio_regular">Exercício Regular</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-700">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">Criar Exame</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PericiaDigitalUltra;
