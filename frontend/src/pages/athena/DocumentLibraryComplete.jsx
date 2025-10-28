import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  StandardModuleLayout,
  ActionButton,
  StandardCard,
  StandardSearchBar,
  StandardEmptyState,
  StandardAlert
} from '../../components/StandardModuleLayout';
import { Badge } from '../../components/ui/badge';
import {
  FileText, Upload, Download, Trash2, Brain, Filter, BarChart3,
  Search, Plus, Eye, FolderOpen, Database, CheckCircle, Clock,
  Tag, FileCheck, Sparkles, Archive, Bookmark, Share
} from 'lucide-react';
import { toast } from 'sonner';

const DocumentLibraryComplete = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [stats, setStats] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    category: '',
    description: '',
    tags: ''
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  const token = localStorage.getItem('ap_elite_token');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([
      loadCategories(),
      loadDocuments(),
      loadStats()
    ]);
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/library/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data.categories || {});
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  const loadDocuments = async (category = '', search = '') => {
    try {
      let url = `${backendUrl}/api/library/documents?limit=50`;
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${search}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast.error('Erro ao carregar documentos');
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/library/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Selecione um arquivo');
      return;
    }

    if (!uploadForm.category) {
      toast.error('Selecione uma categoria');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('category', uploadForm.category);
    formData.append('description', uploadForm.description || 'Documento técnico');
    formData.append('tags', uploadForm.tags);

    try {
      await axios.post(`${backendUrl}/api/library/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Documento enviado com sucesso!');
      setUploadFile(null);
      setUploadForm({ category: '', description: '', tags: '' });
      setShowUploadModal(false);
      loadDocuments();
      loadStats();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error(error.response?.data?.detail || 'Erro ao enviar documento');
    }
  };

  const analyzeDocument = async (documentId) => {
    setAnalyzing(true);
    try {
      await axios.post(
        `${backendUrl}/api/library/documents/${documentId}/analyze`,
        {
          document_id: documentId,
          analysis_type: 'comprehensive'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Análise concluída! Verifique os detalhes do documento.');
      loadDocuments();
    } catch (error) {
      console.error('Erro na análise:', error);
      toast.error('Erro ao analisar documento');
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadDocument = (documentId) => {
    window.open(`${backendUrl}/api/library/documents/${documentId}/download`, '_blank');
  };

  const deleteDocument = async (documentId) => {
    if (!window.confirm('Tem certeza que deseja remover este documento?')) return;

    try {
      await axios.delete(`${backendUrl}/api/library/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Documento removido com sucesso!');
      loadDocuments();
      loadStats();
    } catch (error) {
      console.error('Erro ao remover documento:', error);
      toast.error('Erro ao remover documento');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const headerActions = [
    {
      label: 'Novo Documento',
      icon: Plus,
      onClick: () => setShowUploadModal(true),
      variant: 'primary'
    },
    {
      label: 'Indexar Todos',
      icon: Database,
      onClick: () => toast.info('Indexação iniciada em background'),
      variant: 'default'
    }
  ];

  return (
    <StandardModuleLayout
      title="Biblioteca de Documentos Técnicos"
      subtitle="Repositório completo de PDFs técnicos sobre perícia, investigação e cibersegurança"
      icon={FolderOpen}
      color="cyan"
      category="Documentação"
      actions={headerActions}
      loading={loading}
    >
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StandardCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total de Documentos</p>
                <p className="text-3xl font-bold text-white">{stats.total_documents || 0}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-400" />
            </div>
          </StandardCard>

          <StandardCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Indexados com IA</p>
                <p className="text-3xl font-bold text-white">{stats.indexed_documents || 0}</p>
              </div>
              <Brain className="h-10 w-10 text-green-400" />
            </div>
          </StandardCard>

          <StandardCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Análises Realizadas</p>
                <p className="text-3xl font-bold text-white">{stats.total_analyses || 0}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-purple-400" />
            </div>
          </StandardCard>

          <StandardCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Categorias</p>
                <p className="text-3xl font-bold text-white">{Object.keys(categories).length}</p>
              </div>
              <Filter className="h-10 w-10 text-yellow-400" />
            </div>
          </StandardCard>
        </div>
      )}

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <StandardSearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              loadDocuments(selectedCategory, value);
            }}
            placeholder="Buscar documentos por nome..."
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              loadDocuments(e.target.value, searchQuery);
            }}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="">Todas as Categorias</option>
            {Object.entries(categories).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents List */}
      <StandardCard
        title={`Documentos (${filteredDocuments.length})`}
        icon={FileText}
      >
        {filteredDocuments.length === 0 ? (
          <StandardEmptyState
            icon={FileText}
            title="Nenhum documento encontrado"
            description="Faça upload de documentos PDF para começar"
            action={{
              label: 'Upload de Documento',
              icon: Upload,
              onClick: () => setShowUploadModal(true),
              variant: 'primary'
            }}
          />
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-6 w-6 text-cyan-400" />
                      <h3 className="text-lg font-semibold text-white">
                        {doc.filename}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {categories[doc.category] || doc.category}
                      </Badge>
                      {doc.indexed && (
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          Indexado
                        </Badge>
                      )}
                      {doc.tags && doc.tags.split(',').map((tag, idx) => (
                        <Badge key={idx} className="bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-400">
                      Tamanho: {(doc.file_size / 1024 / 1024).toFixed(2)} MB | 
                      Upload: {new Date(doc.upload_date).toLocaleDateString('pt-BR')}
                    </p>
                    {doc.description && (
                      <p className="text-sm text-gray-400 mt-2">{doc.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <ActionButton
                      icon={Brain}
                      onClick={() => analyzeDocument(doc.id)}
                      disabled={analyzing}
                      variant="default"
                      tooltip="Analisar com IA"
                    />
                    <ActionButton
                      icon={Download}
                      onClick={() => downloadDocument(doc.id)}
                      variant="primary"
                      tooltip="Download"
                    />
                    <ActionButton
                      icon={Trash2}
                      onClick={() => deleteDocument(doc.id)}
                      variant="danger"
                      tooltip="Remover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </StandardCard>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Upload className="h-7 w-7 text-cyan-400" />
                Upload de Documento
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Plus className="h-6 w-6 text-white rotate-45" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria *
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  required
                >
                  <option value="">Selecione uma categoria...</option>
                  {Object.entries(categories).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Breve descrição do documento"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                  placeholder="perícia, forense, digital"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Arquivo PDF *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Formatos aceitos: PDF (Máximo 50MB)
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <Upload className="h-5 w-5" />
                  <span>Enviar Documento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StandardModuleLayout>
  );
};

export default DocumentLibraryComplete;
