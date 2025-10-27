import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import AthenaLayout from '../../components/AthenaLayout';
import {
  Wifi,
  Upload,
  Database,
  Globe,
  MessageSquare,
  Image,
  FileText,
  Download,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  Shield
} from 'lucide-react';
import axios from 'axios';

const DataInterceptions = () => {
  const [interceptions, setInterceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [uploadFile, setUploadFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInterceptions();
  }, []);

  const fetchInterceptions = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/data-interceptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setInterceptions(res.data.interceptions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data interceptions:', error);
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadFile(file);
    setProcessing(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');

      await axios.post(
        `${BACKEND_URL}/api/athena/data-interceptions/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      fetchInterceptions();
      setProcessing(false);
      setUploadFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      setProcessing(false);
    }
  };

  const dataTypes = [
    { type: 'messages', label: 'Mensagens', icon: MessageSquare, count: 1247, color: 'text-blue-500' },
    { type: 'images', label: 'Imagens', icon: Image, count: 589, color: 'text-green-500' },
    { type: 'documents', label: 'Documentos', icon: FileText, count: 234, color: 'text-purple-500' },
    { type: 'web', label: 'Navegação Web', icon: Globe, count: 892, color: 'text-orange-500' }
  ];

  return (
    <AthenaLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-600 rounded-lg flex items-center justify-center">
                <Wifi className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Interceptações Telemáticas</h1>
                <p className="text-slate-400">Análise de dados digitais com IA</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-purple-500 text-white">
              <Sparkles className="h-4 w-4 mr-1" />
              IA Avançada
            </Badge>
            <Badge className="bg-green-500 text-white">
              <Shield className="h-4 w-4 mr-1" />
              E2E Seguro
            </Badge>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Upload de Dados</h2>
              <Upload className="h-5 w-5 text-slate-400" />
            </div>

            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
              <input
                type="file"
                accept=".json,.csv,.xml,.txt,.zip"
                onChange={handleFileUpload}
                className="hidden"
                id="data-upload"
                disabled={processing}
              />
              <label htmlFor="data-upload" className="cursor-pointer">
                <Database className="h-12 w-12 text-teal-500 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">
                  {processing ? 'Processando...' : 'Clique para fazer upload'}
                </p>
                <p className="text-slate-400 text-sm">
                  Formatos: JSON, CSV, XML, TXT, ZIP (máx. 1GB)
                </p>
              </label>
            </div>

            {uploadFile && (
              <div className="mt-4 p-3 bg-slate-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-teal-500" />
                  <span className="text-white text-sm">{uploadFile.name}</span>
                </div>
                {processing && (
                  <div className="animate-spin h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full"></div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Type Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {dataTypes.map((dataType) => {
            const Icon = dataType.icon;
            return (
              <Card key={dataType.type} className="bg-slate-800 border-slate-700 hover:border-teal-500 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{dataType.label}</p>
                      <p className="text-white text-2xl font-bold">{dataType.count.toLocaleString()}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${dataType.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters and Search */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'all' ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter('messages')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'messages' ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Mensagens
                </button>
                <button
                  onClick={() => setFilter('media')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'media' ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Mídia
                </button>
                <button
                  onClick={() => setFilter('documents')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'documents' ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Documentos
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    className="bg-slate-700 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                </div>
                <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                  <Filter className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interceptions List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Interceptações Recentes</h2>
              <Badge className="bg-teal-500 text-white">{interceptions.length} registros</Badge>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-slate-400 mt-3">Carregando...</p>
              </div>
            ) : interceptions.length === 0 ? (
              <div className="text-center py-12">
                <Wifi className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Nenhuma interceptação registrada</p>
                <p className="text-slate-500 text-sm mt-2">Faça upload de dados para começar a análise</p>
              </div>
            ) : (
              <div className="space-y-3">
                {interceptions.map((interception, index) => (
                  <div
                    key={index}
                    className="bg-slate-700 rounded-lg p-4 hover:bg-slate-650 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-teal-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <Database className="h-5 w-5 text-teal-500" />
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-white font-medium">{interception.source || 'Fonte desconhecida'}</p>
                            {interception.status === 'completed' && (
                              <Badge className="bg-green-500 text-white text-xs">Processado</Badge>
                            )}
                            {interception.status === 'processing' && (
                              <Badge className="bg-yellow-500 text-white text-xs">Processando</Badge>
                            )}
                            {interception.priority === 'high' && (
                              <Badge className="bg-red-500 text-white text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Prioridade Alta
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {interception.timestamp || 'Agora mesmo'}
                            </span>
                            <span className="flex items-center">
                              <Database className="h-4 w-4 mr-1" />
                              {interception.dataSize || '0 MB'}
                            </span>
                            <span className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {interception.itemsCount || 0} itens
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors">
                          <Search className="h-4 w-4 text-white" />
                        </button>
                        <button className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors">
                          <Download className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    </div>

                    {interception.analysis && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <div className="flex items-center space-x-2 mb-2">
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          <span className="text-purple-400 text-sm font-medium">Análise IA</span>
                        </div>
                        <p className="text-slate-300 text-sm">{interception.analysis}</p>
                        
                        {interception.findings && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {interception.findings.map((finding, idx) => (
                              <Badge key={idx} className="bg-purple-500 bg-opacity-20 text-purple-300 border border-purple-500">
                                {finding}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Sparkles className="h-8 w-8 text-white flex-shrink-0" />
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">Análise IA Avançada</h3>
                  <ul className="text-white text-opacity-90 space-y-1 text-sm">
                    <li>• Extração automática de metadados</li>
                    <li>• Análise de padrões de comunicação</li>
                    <li>• Identificação de contatos e relacionamentos</li>
                    <li>• Detecção de anomalias e comportamentos suspeitos</li>
                    <li>• Timeline inteligente de eventos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-teal-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 text-white flex-shrink-0" />
                <div>
                  <h3 className="text-white font-bold text-lg mb-2">Segurança e Conformidade</h3>
                  <ul className="text-white text-opacity-90 space-y-1 text-sm">
                    <li>• Criptografia E2E em repouso e trânsito</li>
                    <li>• Cadeia de custódia digital completa</li>
                    <li>• Auditoria detalhada de acessos</li>
                    <li>• Conformidade com LGPD e Marco Civil</li>
                    <li>• Backup automático criptografado</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AthenaLayout>
  );
};

export default DataInterceptions;
