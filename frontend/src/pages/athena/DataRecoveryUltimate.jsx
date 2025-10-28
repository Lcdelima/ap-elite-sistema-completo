import React, { useState, useEffect } from 'react';
import { RefreshCcw, Plus, HardDrive, CheckCircle, AlertCircle } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const DataRecoveryUltimate = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ driveName: '', driveType: '', capacity: '', filesystem: '', scanType: '', damageLevel: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/athena/datarecoveryultimate/list`);
      setItems(response.data.data || []);
    } catch (error) {
      setError('Erro ao carregar');
      toast.error('Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/athena/datarecoveryultimate/create`, { collection: 'datarecoveryultimate', data: formData });
      toast.success('Recuperação iniciada!');
      setShowModal(false);
      setFormData({ driveName: '', driveType: '', capacity: '', filesystem: '', scanType: '', damageLevel: '' });
      fetchItems();
    } catch (error) {
      toast.error('Erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModuleLayout title="Data Recovery Ultimate" subtitle="Recuperação avançada de dados" icon={RefreshCcw} headerAction={<button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 flex items-center gap-2"><Plus size={20} />Nova Recuperação</button>}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Total</p><p className="text-3xl font-bold mt-1">{items.length}</p></div><RefreshCcw size={40} className="opacity-80" /></div></div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Concluídas</p><p className="text-3xl font-bold mt-1">{items.filter(i => i.status === 'completed').length}</p></div><CheckCircle size={40} className="opacity-80" /></div></div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-lg shadow-lg text-white"><div className="flex items-center justify-between"><div><p className="text-sm opacity-90">Em Processo</p><p className="text-3xl font-bold mt-1">{items.filter(i => i.status === 'processing').length}</p></div><HardDrive size={40} className="opacity-80" /></div></div>
      </div>
      <div className="bg-white rounded-lg shadow p-6"><h2 className="text-xl font-bold mb-4">Recuperações</h2>{loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div></div> : items.length === 0 ? <div className="text-center py-12"><HardDrive size={48} className="mx-auto text-gray-400 mb-4" /><p>Nenhuma recuperação</p><button onClick={() => setShowModal(true)} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg">Iniciar</button></div> : <div className="space-y-3">{items.map((item) => <div key={item.id} className="border rounded-lg p-4"><p className="font-semibold">{item.driveName}</p><p className="text-sm text-gray-600">{item.driveType} • {item.capacity}GB • {item.filesystem}</p></div>)}</div>}</div>
      {showModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-lg p-6 w-full max-w-2xl"><h3 className="text-2xl font-bold mb-2">Nova Recuperação</h3><form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold mb-2">Nome*</label><input type="text" required value={formData.driveName} onChange={(e) => setFormData({...formData, driveName: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="HD Externo" /></div><div><label className="block text-sm font-semibold mb-2">Tipo*</label><select required value={formData.driveType} onChange={(e) => setFormData({...formData, driveType: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Selecione...</option><option value="hdd">HDD</option><option value="ssd">SSD</option><option value="usb">USB</option><option value="sd">SD Card</option></select></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold mb-2">Capacidade (GB)*</label><input type="number" required value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="500" /></div><div><label className="block text-sm font-semibold mb-2">Sistema de Arquivos*</label><select required value={formData.filesystem} onChange={(e) => setFormData({...formData, filesystem: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Selecione...</option><option value="ntfs">NTFS</option><option value="fat32">FAT32</option><option value="exfat">exFAT</option><option value="ext4">EXT4</option></select></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold mb-2">Tipo de Scan*</label><select required value={formData.scanType} onChange={(e) => setFormData({...formData, scanType: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Selecione...</option><option value="quick">Rápido</option><option value="deep">Profundo</option><option value="complete">Completo</option></select></div><div><label className="block text-sm font-semibold mb-2">Nível de Dano</label><select value={formData.damageLevel} onChange={(e) => setFormData({...formData, damageLevel: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Selecione...</option><option value="baixo">Baixo</option><option value="medio">Médio</option><option value="alto">Alto</option><option value="critico">Crítico</option></select></div></div><div className="flex gap-2 pt-4 border-t"><button type="button" onClick={() => { setShowModal(false); setFormData({ driveName: '', driveType: '', capacity: '', filesystem: '', scanType: '', damageLevel: '' }); }} className="flex-1 px-4 py-2 border rounded-lg" disabled={loading}>Cancelar</button><button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg" disabled={loading}>{loading ? 'Iniciando...' : 'Iniciar'}</button></div></form></div></div>}
    </UniversalModuleLayout>
  );
};

export default DataRecoveryUltimate;