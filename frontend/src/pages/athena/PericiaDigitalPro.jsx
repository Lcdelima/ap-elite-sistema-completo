import React, { useState, useEffect } from 'react';
import { Smartphone, Plus, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PericiaDigitalPro = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceBrand: '',
    deviceModel: '',
    osVersion: '',
    examType: '',
    caseNumber: ''
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/athena/periciadigitalpro/list`);
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/athena/periciadigitalpro/create`, { collection: 'periciadigitalpro', data: formData });
      toast.success('Perícia criada com sucesso!');
      setShowModal(false);
      setFormData({ deviceName: '', deviceBrand: '', deviceModel: '', osVersion: '', examType: '', caseNumber: '' });
      fetchItems();
    } catch (error) {
      console.error('Erro ao criar item:', error);
      toast.error('Erro ao criar perícia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModuleLayout title="Perícia Digital Pro" subtitle="Perícia forense profissional de dispositivos móveis" icon={Smartphone} headerAction={<button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"><Plus size={20} />Nova Perícia</button>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Total</p><p className="text-3xl font-bold mt-1">{items.length}</p></div><Smartphone size={40} className="opacity-80" /></div></div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Concluídas</p><p className="text-3xl font-bold mt-1">{items.filter(i => i.status === 'completed').length}</p></div><CheckCircle size={40} className="opacity-80" /></div></div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Em Andamento</p><p className="text-3xl font-bold mt-1">{items.filter(i => i.status === 'in_progress').length}</p></div><Activity size={40} className="opacity-80" /></div></div>
      </div>
      <div className="bg-white rounded-lg shadow p-6"><h2 className="text-xl font-bold text-gray-900 mb-4">Perícias Registradas</h2>{loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div><p className="text-gray-600 mt-4">Carregando...</p></div> : error ? <div className="text-center py-12"><p className="text-red-600">{error}</p><button onClick={fetchItems} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Tentar Novamente</button></div> : items.length === 0 ? <div className="text-center py-12"><Smartphone size={48} className="mx-auto text-gray-400 mb-4" /><p className="text-gray-600">Nenhuma perícia registrada</p><button onClick={() => setShowModal(true)} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Criar Primeira Perícia</button></div> : <div className="space-y-3">{items.map((item) => <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"><div className="flex items-center justify-between"><div><p className="font-semibold text-lg">{item.deviceName || 'Dispositivo'}</p><p className="text-sm text-gray-600">{item.deviceBrand} {item.deviceModel}</p><p className="text-xs text-gray-500 mt-1">Caso: {item.caseNumber || 'N/A'} • Tipo: {item.examType || 'N/A'}</p></div></div></div>)}</div>}</div>
      {showModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"><h3 className="text-2xl font-bold mb-2">Nova Perícia Digital</h3><p className="text-gray-600 mb-6">Registre um novo exame pericial</p><form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Dispositivo*</label><input type="text" required value={formData.deviceName} onChange={(e) => setFormData({...formData, deviceName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ex: iPhone de João Silva" /></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Marca*</label><input type="text" required value={formData.deviceBrand} onChange={(e) => setFormData({...formData, deviceBrand: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Apple, Samsung, Motorola" /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-semibold text-gray-700 mb-2">Modelo*</label><input type="text" required value={formData.deviceModel} onChange={(e) => setFormData({...formData, deviceModel: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ex: iPhone 13 Pro" /></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Versão do SO</label><input type="text" value={formData.osVersion} onChange={(e) => setFormData({...formData, osVersion: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ex: iOS 17.2" /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Exame*</label><select required value={formData.examType} onChange={(e) => setFormData({...formData, examType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"><option value="">Selecione...</option><option value="completo">Completo</option><option value="rapido">Rápido</option><option value="avancado">Avançado</option><option value="forense">Forense</option></select></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Número do Caso*</label><input type="text" required value={formData.caseNumber} onChange={(e) => setFormData({...formData, caseNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ex: CASO-2024-001" /></div></div><div className="flex gap-2 pt-4 border-t"><button type="button" onClick={() => { setShowModal(false); setFormData({ deviceName: '', deviceBrand: '', deviceModel: '', osVersion: '', examType: '', caseNumber: '' }); }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold" disabled={loading}>Cancelar</button><button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold" disabled={loading}>{loading ? 'Criando...' : 'Criar Perícia'}</button></div></form></div></div>}
    </UniversalModuleLayout>
  );
};

export default PericiaDigitalPro;