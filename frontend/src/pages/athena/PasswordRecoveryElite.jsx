import React, { useState, useEffect } from 'react';
import { Key, Plus, Lock, Unlock, Cpu } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const PasswordRecoveryElite = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fileName: '', fileType: '', attackMethod: '', useGPU: false, complexity: '', estimatedTime: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/athena/passwordrecoveryelite/list`);
      setItems(response.data.data || []);
    } catch (error) {
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
      await axios.post(`${BACKEND_URL}/api/athena/passwordrecoveryelite/create`, { collection: 'passwordrecoveryelite', data: formData });
      toast.success('Recuperação iniciada!');
      setShowModal(false);
      setFormData({ fileName: '', fileType: '', attackMethod: '', useGPU: false, complexity: '', estimatedTime: '' });
      fetchItems();
    } catch (error) {
      toast.error('Erro ao iniciar recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModuleLayout title="Password Recovery Elite" subtitle="Recuperação avançada de senhas com GPU" icon={Key} headerAction={<button onClick={() => setShowModal(true)} className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 flex items-center gap-2"><Plus size={20} />Nova Recuperação</button>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Total</p><p className="text-3xl font-bold mt-1">{items.length}</p></div><Key size={40} className="opacity-80" /></div></div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Recuperadas</p><p className="text-3xl font-bold mt-1">{items.filter(i => i.status === 'recovered').length}</p></div><Unlock size={40} className="opacity-80" /></div></div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Com GPU</p><p className="text-3xl font-bold mt-1">{items.filter(i => i.useGPU).length}</p></div><Cpu size={40} className="opacity-80" /></div></div>
      </div>
      <div className="bg-white rounded-lg shadow p-6"><h2 className="text-xl font-bold mb-4">Recuperações de Senha</h2>{loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div><p className="mt-4">Carregando...</p></div> : items.length === 0 ? <div className="text-center py-12"><Lock size={48} className="mx-auto text-gray-400 mb-4" /><p>Nenhuma recuperação iniciada</p><button onClick={() => setShowModal(true)} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg">Iniciar Recuperação</button></div> : <div className="space-y-3">{items.map((item) => <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition"><p className="font-semibold">{item.fileName}</p><p className="text-sm text-gray-600">{item.fileType} • {item.attackMethod}</p>{item.useGPU && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded mt-1 inline-block">GPU Acelerado</span>}</div>)}</div>}</div>
      {showModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-lg p-6 w-full max-w-2xl"><h3 className="text-2xl font-bold mb-2">Nova Recuperação</h3><p className="text-gray-600 mb-6">Recupere senhas com algoritmos avançados</p><form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold mb-2">Arquivo*</label><input type="text" required value={formData.fileName} onChange={(e) => setFormData({...formData, fileName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500" placeholder="documento.pdf" /></div><div><label className="block text-sm font-semibold mb-2">Tipo*</label><select required value={formData.fileType} onChange={(e) => setFormData({...formData, fileType: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Selecione...</option><option value="pdf">PDF</option><option value="zip">ZIP/RAR</option><option value="office">Office</option><option value="database">Database</option></select></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold mb-2">Método*</label><select required value={formData.attackMethod} onChange={(e) => setFormData({...formData, attackMethod: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Selecione...</option><option value="dictionary">Dicionário</option><option value="brute_force">Força Bruta</option><option value="mask">Máscara</option><option value="hybrid">Híbrido</option></select></div><div><label className="block text-sm font-semibold mb-2">Complexidade</label><select value={formData.complexity} onChange={(e) => setFormData({...formData, complexity: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Selecione...</option><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option></select></div></div><div><label className="block text-sm font-semibold mb-2">Tempo Estimado</label><input type="text" value={formData.estimatedTime} onChange={(e) => setFormData({...formData, estimatedTime: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: 2 horas" /></div><div className="flex items-center"><input type="checkbox" checked={formData.useGPU} onChange={(e) => setFormData({...formData, useGPU: e.target.checked})} className="h-4 w-4 text-red-600 rounded" /><label className="ml-2 text-sm">Usar Aceleração GPU</label></div><div className="flex gap-2 pt-4 border-t"><button type="button" onClick={() => { setShowModal(false); setFormData({ fileName: '', fileType: '', attackMethod: '', useGPU: false, complexity: '', estimatedTime: '' }); }} className="flex-1 px-4 py-2 border rounded-lg" disabled={loading}>Cancelar</button><button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg" disabled={loading}>{loading ? 'Iniciando...' : 'Iniciar Recuperação'}</button></div></form></div></div>}
    </UniversalModuleLayout>
  );
};

export default PasswordRecoveryElite;