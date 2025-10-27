import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import AthenaLayout from '../../components/AthenaLayout';
import {
  Radio,
  Upload,
  Play,
  Pause,
  Download,
  FileAudio,
  Clock,
  User,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const PhoneInterceptions = () => {
  const [interceptions, setInterceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInterceptions();
  }, []);

  const fetchInterceptions = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(`${BACKEND_URL}/api/athena/phone-interceptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setInterceptions(res.data.interceptions || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching phone interceptions:', error);
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
        `${BACKEND_URL}/api/athena/phone-interceptions/upload`,
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

  return (
    <AthenaLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Radio className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Interceptações Telefônicas</h1>
                <p className="text-slate-400">Análise de chamadas com IA</p>
              </div>
            </div>
          </div>
          <Badge className="bg-purple-500 text-white">
            <Sparkles className="h-4 w-4 mr-1" />
            IA Preditiva
          </Badge>
        </div>

        {/* Upload Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Upload de Áudio</h2>
              <Upload className="h-5 w-5 text-slate-400" />
            </div>

            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg"
                onChange={handleFileUpload}
                className="hidden"
                id="phone-upload"
                disabled={processing}
              />
              <label htmlFor="phone-upload" className="cursor-pointer">
                <FileAudio className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">
                  {processing ? 'Processando...' : 'Clique para fazer upload'}
                </p>
                <p className="text-slate-400 text-sm">
                  Formatos: MP3, WAV, M4A, OGG (máx. 500MB)
                </p>
              </label>
            </div>

            {uploadFile && (
              <div className="mt-4 p-3 bg-slate-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileAudio className="h-5 w-5 text-orange-500" />
                  <span className="text-white text-sm">{uploadFile.name}</span>
                </div>
                {processing && (
                  <div className="animate-spin h-5 w-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total de Interceptações</p>
                  <p className="text-white text-2xl font-bold">{interceptions.length}</p>
                </div>
                <Radio className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Processadas</p>
                  <p className="text-white text-2xl font-bold">
                    {interceptions.filter(i => i.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Em Processamento</p>
                  <p className="text-white text-2xl font-bold">
                    {interceptions.filter(i => i.status === 'processing').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Alertas Críticos</p>
                  <p className="text-white text-2xl font-bold">
                    {interceptions.filter(i => i.priority === 'high').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interceptions List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Interceptações Recentes</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-slate-400 mt-3">Carregando...</p>
              </div>
            ) : interceptions.length === 0 ? (
              <div className="text-center py-12">
                <Radio className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Nenhuma interceptação registrada</p>
                <p className="text-slate-500 text-sm mt-2">Faça upload de um arquivo de áudio para começar</p>
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
                        <div className="w-10 h-10 bg-orange-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <FileAudio className="h-5 w-5 text-orange-500" />
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-white font-medium">{interception.filename || 'Áudio sem nome'}</p>
                            {interception.status === 'completed' && (
                              <Badge className="bg-green-500 text-white text-xs">Concluído</Badge>
                            )}
                            {interception.status === 'processing' && (
                              <Badge className="bg-yellow-500 text-white text-xs">Processando</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {interception.duration || '00:00'}
                            </span>
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {interception.participants || 2} participantes
                            </span>
                            {interception.location && (
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {interception.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors">
                          <Play className="h-4 w-4 text-white" />
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Features Info */}
        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-0">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Sparkles className="h-8 w-8 text-white flex-shrink-0" />
              <div>
                <h3 className="text-white font-bold text-lg mb-2">Recursos de IA Disponíveis</h3>
                <ul className="text-white text-opacity-90 space-y-1 text-sm">
                  <li>• Transcrição automática com reconhecimento de voz</li>
                  <li>• Identificação de participantes e análise de sentimento</li>
                  <li>• Extração de informações relevantes (nomes, locais, datas)</li>
                  <li>• Detecção de palavras-chave e padrões suspeitos</li>
                  <li>• Análise de risco e geração de alertas automáticos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AthenaLayout>
  );
};

export default PhoneInterceptions;
