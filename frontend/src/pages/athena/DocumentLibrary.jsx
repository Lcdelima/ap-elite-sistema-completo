import React, { useState, useEffect } from 'react';
import { FileText, Upload, Search, Download, Trash2, Eye, Brain, Filter, BarChart3 } from 'lucide-react';

const DocumentLibrary = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [stats, setStats] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadCategories();
    loadDocuments();
    loadStats();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/library/categories`);
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadDocuments = async (category = '', search = '') => {
    try {
      let url = `${backendUrl}/api/library/documents?limit=50`;
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${search}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/library/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('category', selectedCategory || 'forensics');
    formData.append('description', 'Documento técnico');

    try {
      const response = await fetch(`${backendUrl}/api/library/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Documento enviado com sucesso!');
        setUploadFile(null);
        loadDocuments();
        loadStats();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar documento');
    }
  };

  const analyzeDocument = async (documentId) => {
    setAnalyzing(true);
    try {
      const response = await fetch(`${backendUrl}/api/library/documents/${documentId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: documentId,
          analysis_type: 'comprehensive'
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Análise concluída! Verifique os detalhes do documento.');
        loadDocuments();
      }
    } catch (error) {
      console.error('Erro na análise:', error);
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
      const response = await fetch(`${backendUrl}/api/library/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Documento removido com sucesso!');
        loadDocuments();
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao remover documento:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-10 h-10" />
            Biblioteca de Documentos Técnicos
          </h1>
          <p className="text-blue-200">
            Repositório de PDFs técnicos sobre perícia, investigação e cibersegurança
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Total de Documentos</p>
                  <p className="text-3xl font-bold text-white">{stats.total_documents}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-400" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm">Indexados</p>
                  <p className="text-3xl font-bold text-white">{stats.indexed_documents}</p>
                </div>
                <Brain className="w-12 h-12 text-green-400" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Análises</p>
                  <p className="text-3xl font-bold text-white">{stats.total_analyses}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-purple-400" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-200 text-sm">Categorias</p>
                  <p className="text-3xl font-bold text-white">{Object.keys(categories).length}</p>
                </div>
                <Filter className="w-12 h-12 text-yellow-400" />
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Upload de Documento
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
                >
                  <option value="">Selecione...</option>
                  {Object.entries(categories).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Arquivo PDF
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!uploadFile || !selectedCategory}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar Documento
            </button>
          </form>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Buscar Documento
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  loadDocuments(selectedCategory, e.target.value);
                }}
                placeholder="Nome do documento..."
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Filtrar por Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  loadDocuments(e.target.value, searchQuery);
                }}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
              >
                <option value="">Todas as Categorias</option>
                {Object.entries(categories).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Documentos ({documents.length})
          </h2>

          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white/5 border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {doc.filename}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-sm">
                        {categories[doc.category] || doc.category}
                      </span>
                      {doc.indexed && (
                        <span className="px-3 py-1 bg-green-500/30 text-green-200 rounded-full text-sm flex items-center gap-1">
                          <Brain className="w-4 h-4" />
                          Indexado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">
                      Tamanho: {(doc.file_size / 1024 / 1024).toFixed(2)} MB | 
                      Upload: {new Date(doc.upload_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => analyzeDocument(doc.id)}
                      disabled={analyzing}
                      className="p-2 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg text-purple-200 transition-colors"
                      title="Analisar com IA"
                    >
                      <Brain className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => downloadDocument(doc.id)}
                      className="p-2 bg-blue-500/30 hover:bg-blue-500/50 rounded-lg text-blue-200 transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-red-200 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {documents.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  Nenhum documento encontrado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentLibrary;
