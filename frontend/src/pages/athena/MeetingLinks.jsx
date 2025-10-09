import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Plus, Copy, ExternalLink, Video, Trash2, Edit } from 'lucide-react';
import AthenaLayout from '../../components/AthenaLayout';

const MeetingLinks = () => {
  const [links, setLinks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'jitsi',
    recurring: false
  });

  const platforms = [
    { value: 'jitsi', label: 'Jitsi Meet', url: 'https://meet.jit.si/' },
    { value: 'google', label: 'Google Meet', url: 'https://meet.google.com/' },
    { value: 'zoom', label: 'Zoom', url: 'https://zoom.us/j/' },
    { value: 'teams', label: 'Microsoft Teams', url: 'https://teams.microsoft.com/' }
  ];

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = () => {
    const saved = localStorage.getItem('meeting_links');
    if (saved) {
      setLinks(JSON.parse(saved));
    }
  };

  const saveLinks = (newLinks) => {
    localStorage.setItem('meeting_links', JSON.stringify(newLinks));
    setLinks(newLinks);
  };

  const generateLink = (platform) => {
    const roomId = `APElite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const platformData = platforms.find(p => p.value === platform);
    return `${platformData.url}${roomId}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLink = {
      id: Date.now().toString(),
      ...formData,
      link: generateLink(formData.platform),
      created_at: new Date().toISOString(),
      usage_count: 0
    };
    const updatedLinks = [newLink, ...links];
    saveLinks(updatedLinks);
    alert('Link criado com sucesso!');
    setShowModal(false);
    setFormData({ title: '', description: '', platform: 'jitsi', recurring: false });
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('Link copiado!');
  };

  const deleteLink = (id) => {
    if (window.confirm('Deseja realmente excluir este link?')) {
      const updated = links.filter(l => l.id !== id);
      saveLinks(updated);
    }
  };

  return (
    <AthenaLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <LinkIcon className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold mb-1">Gerador de Links</h1>
                <p className="text-violet-100">Links permanentes para videoconferências</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-violet-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Link
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Total de Links</p>
            <p className="text-3xl font-bold text-gray-900">{links.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Links Ativos</p>
            <p className="text-3xl font-bold text-green-600">{links.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Uso Total</p>
            <p className="text-3xl font-bold text-purple-600">
              {links.reduce((acc, l) => acc + (l.usage_count || 0), 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Links de Reunião</h2>
          {links.length === 0 ? (
            <div className="text-center py-12">
              <LinkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum link criado</p>
              <p className="text-sm text-gray-500 mt-2">Crie links permanentes para suas reuniões</p>
            </div>
          ) : (
            <div className="space-y-4">
              {links.map((link) => (
                <div key={link.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-5 h-5 text-violet-600" />
                        <h3 className="font-semibold text-gray-900 text-lg">{link.title}</h3>
                        {link.recurring && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                            Recorrente
                          </span>
                        )}
                      </div>
                      {link.description && (
                        <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Plataforma: {platforms.find(p => p.value === link.platform)?.label} • 
                        Criado: {new Date(link.created_at).toLocaleDateString('pt-BR')} •
                        Usado: {link.usage_count || 0}x
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-violet-50 rounded-lg">
                    <LinkIcon className="w-4 h-4 text-violet-600" />
                    <code className="flex-1 text-sm text-violet-800 truncate">{link.link}</code>
                    <button
                      onClick={() => copyLink(link.link)}
                      className="text-violet-600 hover:text-violet-800 p-2"
                      title="Copiar link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:text-violet-800 p-2"
                      title="Abrir link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Novo Link de Reunião</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título*</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Ex: Sala de Reunião Principal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="2"
                    placeholder="Para que será usado este link?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Plataforma*</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    {platforms.map(platform => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({...formData, recurring: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="recurring" className="text-sm text-gray-700">
                    Link recorrente (mesmo link para múltiplas reuniões)
                  </label>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ Um link único será gerado automaticamente para esta sala
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  >
                    Gerar Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AthenaLayout>
  );
};

export default MeetingLinks;