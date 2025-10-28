import React, { useState, useEffect } from 'react';
import { Users, FileText, MessageCircle, CheckSquare, Clock, Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const CollaborationHub = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [stats, setStats] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/collaboration/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const createDocument = async () => {
    if (!title || !content) return;

    try {
      const response = await fetch(`${backendUrl}/api/collaboration/documents/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, content,
          doc_type: 'document',
          created_by: 'user_' + Date.now()
        })
      });

      if (response.ok) {
        toast.success("Documento criado!");
        setTitle('');
        setContent('');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-rose-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10" />
            Colaboração em Tempo Real
          </h1>
          <p className="text-rose-200">Edição colaborativa de documentos com WebSocket</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <FileText className="w-8 h-8 text-rose-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_documents}</p>
              <p className="text-gray-300 text-sm">Documentos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <MessageCircle className="w-8 h-8 text-pink-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_comments}</p>
              <p className="text-gray-300 text-sm">Comentários</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <CheckSquare className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.pending_approvals}</p>
              <p className="text-gray-300 text-sm">Aprovações Pendentes</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Users className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.active_connections}</p>
              <p className="text-gray-300 text-sm">Usuários Online</p>
            </div>
          </div>
        )}

        {/* Create Document */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6" />
            Criar Documento Colaborativo
          </h2>
          <div className="space-y-4">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do documento"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400" />
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Conteúdo do documento..."
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 h-40" />
            <button onClick={createDocument} disabled={!title || !content}
              className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 font-semibold">
              Criar Documento
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Funcionalidades de Colaboração</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.features?.map((feature, idx) => (
              <div key={idx} className="bg-white/5 border border-white/20 rounded-lg p-4 flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-rose-400" />
                <span className="text-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationHub;