import React, { useState, useEffect } from 'react';
import { FileText, Plus, Scale, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const GestaoProcessos = () => {
  const navigate = useNavigate();
  const [processos, setProcessos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    numero: '', juizo: '', vara: '', classe: '', fase: 'inicial', status: 'ativo'
  });

  useEffect(() => {
    fetchProcessos();
  }, []);

  const fetchProcessos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/juridico/processos/`);
      setProcessos(response.data.data || []);
    } catch (error) {
      toast.error('Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}/api/juridico/processos/`, formData);
      if (response.data.success) {
        toast.success('Processo criado!');
        setShowModal(false);
        setFormData({ numero: '', juizo: '', vara: '', classe: '', fase: 'inicial', status: 'ativo' });
        fetchProcessos();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4">← Voltar</button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Scale size={40} />
              <div>
                <h1 className="text-3xl font-bold">Gestão de Processos</h1>
                <p className="text-cyan-100">Timeline, Prazos D-3/D-1, Vinculação</p>
              </div>
            </div>
            
            <button onClick={() => setShowModal(true)} className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 flex items-center gap-2">
              <Plus size={20} />Novo Processo
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Processos</h2>
          
          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div></div>
          ) : processos.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={64} className="mx-auto text-gray-400 mb-4" />
              <p>Nenhum processo cadastrado</p>
              <button onClick={() => setShowModal(true)} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg">Cadastrar Primeiro</button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Juízo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Fase</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {processos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 border-b">
                    <td className="px-6 py-4 font-mono text-sm">{p.numero}</td>
                    <td className="px-6 py-4">{p.juizo}</td>
                    <td className="px-6 py-4">{p.fase}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-2xl font-bold mb-4">Novo Processo</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Número do Processo*</label>
                  <input type="text" required value={formData.numero} onChange={(e) => setFormData({...formData, numero: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="0001234-56.2024.8.26.0100" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Juízo*</label>
                  <input type="text" required value={formData.juizo} onChange={(e) => setFormData({...formData, juizo: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="São Paulo" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Vara*</label>
                  <input type="text" required value={formData.vara} onChange={(e) => setFormData({...formData, vara: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="1ª Vara Criminal" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Classe*</label>
                  <input type="text" required value={formData.classe} onChange={(e) => setFormData({...formData, classe: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Ação Penal" />
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Criar Processo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoProcessos;
