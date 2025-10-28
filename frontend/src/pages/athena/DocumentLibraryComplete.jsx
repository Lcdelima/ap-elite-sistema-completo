import React, { useState, useEffect } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import UniversalModuleLayout from '../../components/UniversalModuleLayout';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const DocumentLibraryComplete = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: '', fileType: '', author: '', keywords: '', description: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/athena/documentlibrarycomplete/list`);
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
      await axios.post(`${BACKEND_URL}/api/athena/documentlibrarycomplete/create`, { collection: 'documentlibrarycomplete', data: formData });
      toast.success('Documento adicionado!');
      setShowModal(false);
      setFormData({ title: '', category: '', fileType: '', author: '', keywords: '', description: '' });
      fetchItems();
    } catch (error) {
      toast.error('Erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UniversalModuleLayout title="Biblioteca de Documentos" subtitle="Gestão completa de documentos forenses" icon={BookOpen} headerAction={<button onClick={() => setShowModal(true)} className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 flex items-center gap-2"><Plus size={20} />Novo Documento</button>}>
      <div className="bg-white rounded-lg shadow p-6"><h2 className="text-xl font-bold mb-4">Documentos</h2>{loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div></div> : items.length === 0 ? <div className="text-center py-12"><BookOpen size={48} className="mx-auto text-gray-400 mb-4" /><p>Nenhum documento</p><button onClick={() => setShowModal(true)} className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg">Adicionar</button></div> : <div className="space-y-3">{items.map((item) => <div key={item.id} className="border rounded-lg p-4"><p className="font-semibold">{item.title}</p><p className="text-sm text-gray-600">{item.category} • {item.fileType}</p></div>)}</div>}</div>
      {showModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-lg p-6 w-full max-w-2xl"><h3 className="text-2xl font-bold mb-2">Novo Documento</h3><form onSubmit={handleSubmit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold mb-2">Título*</label><input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Título do documento" /></div><div><label className="block text-sm font-semibold mb-2">Categoria*</label><select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Selecione...</option><option value="forensics">Forense</option><option value="legal">Legal</option><option value="technical">Técnico</option><option value="report">Relatório</option></select></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-semibold mb-2">Tipo de Arquivo*</label><select required value={formData.fileType} onChange={(e) => setFormData({...formData, fileType: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Selecione...</option><option value="pdf">PDF</option><option value="docx">DOCX</option><option value="xlsx">XLSX</option><option value="pptx">PPTX</option></select></div><div><label className="block text-sm font-semibold mb-2">Autor</label><input type="text" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Nome do autor" /></div></div><div><label className="block text-sm font-semibold mb-2">Palavras-chave</label><input type="text" value={formData.keywords} onChange={(e) => setFormData({...formData, keywords: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Separe por vírgula" /></div><div><label className="block text-sm font-semibold mb-2">Descrição</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" className="w-full px-3 py-2 border rounded-lg" placeholder="Descrição do documento" /></div><div className="flex gap-2 pt-4 border-t"><button type="button" onClick={() => { setShowModal(false); setFormData({ title: '', category: '', fileType: '', author: '', keywords: '', description: '' }); }} className="flex-1 px-4 py-2 border rounded-lg" disabled={loading}>Cancelar</button><button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg" disabled={loading}>Adicionar</button></div></form></div></div>}
    </UniversalModuleLayout>
  );
};

export default DocumentLibraryComplete;