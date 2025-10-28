import React, { useState, useEffect } from 'react';
import { Upload, FileText, Eye, Download, CheckCircle, AlertTriangle, Image, Scan } from 'lucide-react';

const OCRDashboard = () => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [provider, setProvider] = useState('google');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadResults();
    loadStats();
  }, []);

  const loadResults = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/ocr/results?limit=10`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/ocr/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const processOCR = async () => {
    if (!file) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${backendUrl}/api/ocr/process?provider=${provider}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResult(data);
      setFile(null);
      loadResults();
      loadStats();
    } catch (error) {
      console.error('Erro no OCR:', error);
      alert('Erro ao processar documento');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Scan className="w-10 h-10" />
            OCR Dashboard - Reconhecimento Óptico
          </h1>
          <p className="text-cyan-200">Extraia texto de imagens e documentos com IA</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <FileText className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_processed}</p>
              <p className="text-gray-300 text-sm">Documentos Processados</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.providers ? Object.keys(stats.providers).length : 0}</p>
              <p className="text-gray-300 text-sm">Provedores Disponíveis</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Eye className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.capabilities?.length || 0}</p>
              <p className="text-gray-300 text-sm">Capacidades</p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Processar Documento</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-200 mb-2">Provedor OCR</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white">
                <option value="auto">Auto (Melhor Disponível)</option>
                <option value="google">Google Vision AI</option>
                <option value="aws">AWS Textract</option>
                <option value="azure">Azure Form Recognizer</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
              {file ? (
                <div className="space-y-4">
                  <Image className="w-16 h-16 text-blue-400 mx-auto" />
                  <p className="text-white font-semibold">{file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                  <button onClick={() => setFile(null)}
                    className="text-red-400 hover:text-red-300 text-sm">Remover</button>
                </div>
              ) : (
                <div>
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Arraste um arquivo ou clique para selecionar</p>
                  <p className="text-gray-400 text-sm mb-4">Suporta: JPG, PNG, PDF</p>
                  <input type="file" onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden" id="file-upload" />
                  <label htmlFor="file-upload"
                    className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer">
                    Selecionar Arquivo
                  </label>
                </div>
              )}
            </div>

            <button onClick={processOCR} disabled={!file || processing}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 font-semibold">
              {processing ? 'Processando...' : 'Processar com OCR'}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Resultado</h2>
              <span className="px-4 py-2 bg-green-500/30 text-green-200 rounded-full">
                Confiança: {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="bg-black/20 rounded-lg p-6">
              <p className="text-gray-300 whitespace-pre-wrap">{result.text}</p>
            </div>
            {result.ai_analysis && (
              <div className="mt-4 bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Análise de IA</h3>
                <p className="text-gray-300 text-sm">{result.ai_analysis}</p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Histórico de Processamento</h2>
          <div className="space-y-3">
            {results.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">{item.filename}</p>
                    <p className="text-gray-400 text-sm mb-2">Provedor: {item.provider}</p>
                    <p className="text-gray-300 text-sm line-clamp-2">{item.ocr_text?.substring(0, 150)}...</p>
                  </div>
                  <span className="text-gray-400 text-xs">{new Date(item.processed_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRDashboard;