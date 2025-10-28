import React, { useState, useEffect } from 'react';
import { HardDrive, Plus, Database, Zap } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const UltraExtractionPro = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ deviceName: '', deviceType: '', extractionLevel: '', aiEnabled: false, capacity: '', targetData: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BACKEND_URL}/api/athena/ultraextractionpro/list`);
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
      await axios.post(`${BACKEND_URL}/api/athena/ultraextractionpro/create`, { collection: 'ultraextractionpro', data: formData });
      toast.success('Extração Ultra criada!');
      setShowModal(false);
      setFormData({ deviceName: '', deviceType: '', extractionLevel: '', aiEnabled: false, capacity: '', targetData: '' });
      fetchItems();
    } catch (error) {
      toast.error('Erro ao criar extração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModuleLayout title="Ultra Extraction Pro" subtitle="Extração ultra-avançada com IA" icon={HardDrive} headerAction={<button onClick={() => setShowModal(true)} className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors flex items-center gap-2"><Plus size={20} />Nova Extração Ultra</button>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Total</p><p className="text-3xl font-bold mt-1">{items.length}</p></div><HardDrive size={40} className="opacity-80" /></div></div>
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Com IA</p><p className="text-3xl font-bold mt-1">{items.filter(i => i.aiEnabled).length}</p></div><Zap size={40} className="opacity-80" /></div></div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Dados (GB)</p><p className="text-3xl font-bold mt-1">{items.reduce((sum, i) => sum + (parseInt(i.capacity) || 0), 0)}</p></div><Database size={40} className="opacity-80" /></div></div>
      </div>
      <div className="bg-white rounded-lg shadow p-6"><h2 className="text-xl font-bold text-gray-900 mb-4">Extrações Ultra</h2>{loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div><p className="text-gray-600 mt-4">Carregando...</p></div> : error ? <div className="text-center py-12"><p className="text-red-600">{error}</p><button onClick={fetchItems} className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-lg">Tentar Novamente</button></div> : items.length === 0 ? <div className="text-center py-12"><Database size={48} className="mx-auto text-gray-400 mb-4" /><p className="text-gray-600">Nenhuma extração registrada</p><button onClick={() => setShowModal(true)} className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-lg">Criar Primeira Extração</button></div> : <div className="space-y-3">{items.map((item) => <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition"><div className="flex justify-between"><div><p className="font-semibold text-lg">{item.deviceName}</p><p className="text-sm text-gray-600">{item.deviceType} • {item.extractionLevel}</p>{item.aiEnabled && <span className="text-xs bg-violet-100 text-violet-800 px-2 py-1 rounded mt-1 inline-block">IA Ativada</span>}</div></div></div>)}</div>}</div>
      {showModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"><h3 className="text-2xl font-bold mb-2">Nova Extração Ultra</h3><p className="text-gray-600 mb-6">Extração avançada com IA</p><form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold text-gray-700 mb-2">Dispositivo*</label><input type="text" required value={formData.deviceName} onChange={(e) => setFormData({...formData, deviceName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500" placeholder="Nome do dispositivo" /></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Tipo*</label><select required value={formData.deviceType} onChange={(e) => setFormData({...formData, deviceType: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"><option value="">Selecione...</option><option value="smartphone">Smartphone</option><option value="hdd">HDD</option><option value="ssd">SSD</option><option value="cloud">Cloud</option></select></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold text-gray-700 mb-2">Nível*</label><select required value={formData.extractionLevel} onChange={(e) => setFormData({...formData, extractionLevel: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"><option value="">Selecione...</option><option value="basico">Básico</option><option value="avancado">Avançado</option><option value="ultra">Ultra</option></select></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Capacidade (GB)</label><input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500" placeholder="Ex: 256" /></div></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Dados Alvo</label><input type="text" value={formData.targetData} onChange={(e) => setFormData({...formData, targetData: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500" placeholder="Ex: Mensagens, Fotos, Vídeos" /></div><div className="flex items-center"><input type="checkbox" checked={formData.aiEnabled} onChange={(e) => setFormData({...formData, aiEnabled: e.target.checked})} className="h-4 w-4 text-violet-600 rounded" /><label className="ml-2 text-sm text-gray-700">Ativar Análise com IA</label></div><div className="flex gap-2 pt-4 border-t"><button type="button" onClick={() => { setShowModal(false); setFormData({ deviceName: '', deviceType: '', extractionLevel: '', aiEnabled: false, capacity: '', targetData: '' }); }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50" disabled={loading}>Cancelar</button><button type="submit" className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700" disabled={loading}>{loading ? 'Criando...' : 'Criar Extração'}</button></div></form></div></div>}
    </UniversalModuleLayout>
  );
};

export default UltraExtractionPro;