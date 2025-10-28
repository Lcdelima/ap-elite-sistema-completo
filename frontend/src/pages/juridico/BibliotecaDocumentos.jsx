import React, { useState, useEffect } from 'react';
import { Folder, Plus, Upload, Search, Tag, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const BibliotecaDocumentos = () => {
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    fetchDocumentos();
  }, [filtroTipo]);

  const fetchDocumentos = async () => {
    try {
      setLoading(true);
      const params = filtroTipo ? `?tipo=${filtroTipo}` : '';
      const response = await axios.get(`${BACKEND_URL}/api/juridico/biblioteca/${params}`);
      setDocumentos(response.data.documentos || []);
    } catch (error) {
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 hover:text-purple-100">
            ← Voltar
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Folder size={40} />
              <div>
                <h1 className="text-3xl font-bold">Biblioteca de Documentos</h1>
                <p className="text-purple-100">OCR, Tags, Busca Semântica, RBAC</p>
              </div>
            </div>
            
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 flex items-center gap-2">
              <Upload size={20} />Upload Documento
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">Filtrar por Tipo</label>
              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Todos</option>
                <option value="sentenca">Sentença</option>
                <option value="denuncia">Denúncia</option>
                <option value="ra">RA</option>
                <option value="laudo">Laudo</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">Buscar</label>
              <input type="text" placeholder="Buscar documentos..." className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div></div>
          ) : documentos.length === 0 ? (
            <div className="text-center py-12">
              <Folder size={64} className="mx-auto text-gray-400 mb-4" />
              <p>Nenhum documento na biblioteca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {documentos.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm truncate">{doc.filename}</p>
                      <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Download size={18} className="text-gray-400 hover:text-purple-600 cursor-pointer" />
                  </div>
                  
                  <div className="flex gap-1 flex-wrap mt-2">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{doc.tipo}</span>
                    {doc.ocr && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">OCR</span>}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 font-mono truncate" title={doc.sha256}>
                    SHA: {doc.sha256?.substring(0, 12)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BibliotecaDocumentos;
