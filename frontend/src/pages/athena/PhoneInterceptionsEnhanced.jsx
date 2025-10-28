import React, { useState, useEffect } from 'react';
import { Phone, Plus, Radio, Mic, MapPin } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PhoneInterceptionsEnhanced = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ targetName: '', phoneNumber: '', interceptType: '', caseNumber: '', authorization: '', startDate: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/athena/phoneinterceptionsenhanced/list`);
      setItems(response.data.data || []);
    } catch (error) {
      toast.error('Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/athena/phoneinterceptionsenhanced/create`, { collection: 'phoneinterceptionsenhanced', data: formData });
      toast.success('Intercepção criada!');
      setShowModal(false);
      setFormData({ targetName: '', phoneNumber: '', interceptType: '', caseNumber: '', authorization: '', startDate: '' });
      fetchItems();
    } catch (error) {
      toast.error('Erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModuleLayout title="Intercepções Telefônicas" subtitle="Monitoramento e interceptação avançada" icon={Phone} headerAction={<button onClick={() => setShowModal(true)} className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2"><Plus size={20} />Nova Intercepção</button>}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Total</p><p className="text-3xl font-bold mt-1">{items.length}</p></div><Phone size={40} className="opacity-80" /></div></div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Ativas</p><p className="text-3xl font-bold mt-1">{items.filter(i => i.status === 'active').length}</p></div><Radio size={40} className="opacity-80" /></div></div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Com Geolocal.</p><p className="text-3xl font-bold mt-1">{items.filter(i => i.hasGeo).length}</p></div><MapPin size={40} className="opacity-80" /></div></div>
      </div>
      <div className="bg-white rounded-lg shadow p-6"><h2 className="text-xl font-bold mb-4">Intercepções</h2>{loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div></div> : items.length === 0 ? <div className="text-center py-12"><Mic size={48} className="mx-auto text-gray-400 mb-4" /><p>Nenhuma intercepção</p><button onClick={() => setShowModal(true)} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg">Criar</button></div> : <div className="space-y-3">{items.map((item) => <div key={item.id} className="border rounded-lg p-4"><p className="font-semibold">{item.targetName}</p><p className="text-sm text-gray-600">{item.phoneNumber} • {item.interceptType}</p></div>)}</div>}</div>
      {showModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-lg p-6 w-full max-w-2xl"><h3 className="text-2xl font-bold mb-2">Nova Intercepção</h3><form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold mb-2">Nome do Alvo*</label><input type="text" required value={formData.targetName} onChange={(e) => setFormData({...formData, targetName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="João Silva" /></div><div><label className="block text-sm font-semibold mb-2">Telefone*</label><input type="text" required value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="+55 11 99999-9999" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold mb-2">Tipo*</label><select required value={formData.interceptType} onChange={(e) => setFormData({...formData, interceptType: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Selecione...</option><option value="voz">Voz</option><option value="dados">Dados</option><option value="sms">SMS</option><option value="completo">Completo</option></select></div><div><label className="block text-sm font-semibold mb-2">Número do Caso*</label><input type="text" required value={formData.caseNumber} onChange={(e) => setFormData({...formData, caseNumber: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="CASO-2024-001" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold mb-2">Autorização Judicial*</label><input type="text" required value={formData.authorization} onChange={(e) => setFormData({...formData, authorization: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Mandado número..." /></div><div><label className="block text-sm font-semibold mb-2">Data de Início*</label><input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div></div><div className="flex gap-2 pt-4 border-t"><button type="button" onClick={() => { setShowModal(false); setFormData({ targetName: '', phoneNumber: '', interceptType: '', caseNumber: '', authorization: '', startDate: '' }); }} className="flex-1 px-4 py-2 border rounded-lg" disabled={loading}>Cancelar</button><button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg" disabled={loading}>Criar</button></div></form></div></div>}
    </UniversalModuleLayout>
  );
};

export default PhoneInterceptionsEnhanced;