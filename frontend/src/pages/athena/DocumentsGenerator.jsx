/**
 * Documents Generator - Elite Gravitas™
 * Gerador de Documentos Jurídicos com templates profissionais
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardModuleLayout from '../../components/StandardModuleLayout';
import { BackBar } from '../../components/BackBar';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  PenTool,
  Scale,
  FileSignature,
  File
} from 'lucide-react';

const DocumentsGenerator = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    } else {
      fetchDocuments();
      fetchStats();
    }
  }, [activeTab, selectedCategory]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = selectedCategory
        ? `${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/documents/templates?category=${selectedCategory}`
        : `${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/documents/templates`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = selectedCategory
        ? `${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/documents?category=${selectedCategory}`
        : `${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/documents`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/documents/stats/overview`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'peticao': Scale,
      'procuracao': PenTool,
      'declaracao': File,
      'contrato': FileSignature,
      'recurso': FileText
    };
    return icons[category] || FileText;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'peticao': 'cyan',
      'procuracao': 'purple',
      'declaracao': 'blue',
      'contrato': 'green',
      'recurso': 'orange'
    };
    return colors[category] || 'gray';
  };

  const getStatusBadge = (status) => {
    const config = {
      'generated': { icon: CheckCircle, text: 'Gerado', color: 'green' },
      'pending_signature': { icon: Clock, text: 'Aguardando Assinatura', color: 'yellow' },
      'signed': { icon: CheckCircle, text: 'Assinado', color: 'blue' }
    };
    const { icon: Icon, text, color } = config[status] || config.generated;
    return (
      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${color}-500/20 text-${color}-300 border border-${color}-500/30`}>
        <Icon size={12} />
        {text}
      </span>
    );
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = documents.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StandardModuleLayout>
      <BackBar
        trail={['ATHENA', 'Gerador de Documentos']}
        actions={
          activeTab === 'documents' && (
            <button
              onClick={() => setActiveTab('templates')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20"
            >
              <Plus size={18} />
              Novo Documento
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="bg-slate-900/50 border-b border-slate-700/50">
        <div className="flex gap-1 px-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${
              activeTab === 'templates'
                ? 'border-cyan-500 text-cyan-300 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <FileText size={18} />
            <span className="font-medium">Templates</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${
              activeTab === 'documents'
                ? 'border-cyan-500 text-cyan-300 bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <File size={18} />
            <span className="font-medium">Documentos Gerados</span>
            {stats.total_documents > 0 && (
              <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
                {stats.total_documents}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Filters & Search */}
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Categoria</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Todas</option>
                <option value="peticao">Petições</option>
                <option value="procuracao">Procurações</option>
                <option value="declaracao">Declarações</option>
                <option value="contrato">Contratos</option>
                <option value="recurso">Recursos</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Digite para buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TAB: Templates */}
        {activeTab === 'templates' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Templates Disponíveis</h2>
              <p className="text-slate-400">
                Selecione um template para gerar seu documento profissional
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Carregando templates...</div>
            ) : filteredTemplates.length === 0 ? (
              <div className="bg-slate-800/50 p-12 rounded-lg border border-slate-700/50 text-center">
                <FileText size={64} className="mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum template encontrado</h3>
                <p className="text-slate-400">Tente ajustar os filtros</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filteredTemplates.map(template => {
                  const Icon = getCategoryIcon(template.category);
                  const color = getCategoryColor(template.category);
                  return (
                    <div
                      key={template.id}
                      className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition-all group cursor-pointer"
                      onClick={() => navigate(`/athena/documents/generate/${template.id}`)}
                    >
                      <div className={`w-16 h-16 rounded-lg bg-${color}-500/20 border border-${color}-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`text-${color}-300`} size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-3 py-1 rounded-full bg-${color}-500/20 text-${color}-300 capitalize`}>
                          {template.category}
                        </span>
                        <button className="text-cyan-300 hover:text-cyan-200 text-sm font-medium flex items-center gap-1">
                          Gerar
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: Documentos Gerados */}
        {activeTab === 'documents' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Documentos Gerados</h2>
              <p className="text-slate-400">
                Seus documentos criados e gerenciados
              </p>
            </div>

            {/* Stats */}
            {stats.by_status && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-4 rounded-lg border border-green-500/30">
                  <div className="text-2xl font-bold text-white">{stats.by_status.generated || 0}</div>
                  <div className="text-xs text-green-300">Gerados</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 p-4 rounded-lg border border-yellow-500/30">
                  <div className="text-2xl font-bold text-white">{stats.by_status.pending_signature || 0}</div>
                  <div className="text-xs text-yellow-300">Aguardando Assinatura</div>
                </div>
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-4 rounded-lg border border-blue-500/30">
                  <div className="text-2xl font-bold text-white">{stats.by_status.signed || 0}</div>
                  <div className="text-xs text-blue-300">Assinados</div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-slate-400">Carregando documentos...</div>
            ) : filteredDocuments.length === 0 ? (
              <div className="bg-slate-800/50 p-12 rounded-lg border border-slate-700/50 text-center">
                <File size={64} className="mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum documento gerado</h3>
                <p className="text-slate-400 mb-6">Comece criando seu primeiro documento</p>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium"
                >
                  <Plus size={18} className="inline mr-2" />
                  Criar Primeiro Documento
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredDocuments.map(doc => {
                  const Icon = getCategoryIcon(doc.category);
                  const color = getCategoryColor(doc.category);
                  return (
                    <div
                      key={doc.id}
                      className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-lg bg-${color}-500/20 border border-${color}-500/30 flex items-center justify-center`}>
                            <Icon className={`text-${color}-300`} size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{doc.title}</h3>
                              {getStatusBadge(doc.status)}
                            </div>
                            <div className="text-sm text-slate-400">
                              {doc.template_name} • {new Date(doc.created_at).toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/documents/${doc.id}/preview`, '_blank')}
                            className="p-2 bg-slate-700/50 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-lg border border-slate-600 hover:border-cyan-500/30 transition-all"
                            title="Visualizar"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => window.open(`${import.meta.env.VITE_BACKEND_URL || process.env.REACT_APP_BACKEND_URL}/api/documents/${doc.id}/download`, '_blank')}
                            className="p-2 bg-slate-700/50 hover:bg-green-500/20 text-slate-300 hover:text-green-300 rounded-lg border border-slate-600 hover:border-green-500/30 transition-all"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                          {doc.status !== 'signed' && (
                            <button
                              className="p-2 bg-slate-700/50 hover:bg-red-500/20 text-slate-300 hover:text-red-300 rounded-lg border border-slate-600 hover:border-red-500/30 transition-all"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-700/50 text-sm">
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Categoria</div>
                          <div className={`text-${color}-300 capitalize font-medium`}>{doc.category}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Formato</div>
                          <div className="text-white uppercase">{doc.format}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Tamanho</div>
                          <div className="text-white">{(doc.size_bytes / 1024).toFixed(2)} KB</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Hash SHA-256</div>
                          <div className="text-white font-mono text-xs">{doc.sha256?.substring(0, 16)}...</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </StandardModuleLayout>
  );
};

export default DocumentsGenerator;
