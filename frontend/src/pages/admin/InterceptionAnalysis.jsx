import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Play,
  FileAudio,
  FileVideo,
  Clock,
  Users,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

const InterceptionAnalysis = () => {
  const [cases, setCases] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState('');
  const [analysisType, setAnalysisType] = useState('phone');
  const [uploading, setUploading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch cases
      const casesRes = await axios.get(`${BACKEND_URL}/api/cases`, config);
      setCases(casesRes.data);

      // Fetch analyses
      fetchAnalyses();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const fetchAnalyses = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      // Note: You'd need to add an endpoint to list all analyses
      // For now, we'll keep the state as is
      setAnalyses([]);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    }
  };

  const fetchEvidences = async (caseId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const res = await axios.get(`${BACKEND_URL}/api/evidence/case/${caseId}`, config);
      setEvidences(res.data);
    } catch (error) {
      console.error('Error fetching evidences:', error);
      toast.error('Erro ao carregar evidências');
    }
  };

  const handleCaseChange = (caseId) => {
    setSelectedCase(caseId);
    setSelectedEvidence('');
    if (caseId) {
      fetchEvidences(caseId);
    } else {
      setEvidences([]);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!selectedCase || !selectedEvidence) {
      toast.error('Selecione um caso e evidência primeiro');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('case_id', selectedCase);
      formData.append('evidence_id', selectedEvidence);
      formData.append('analysis_type', analysisType);

      const res = await axios.post(
        `${BACKEND_URL}/api/advanced/interception/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Arquivo enviado com sucesso!');
      
      // Start transcription automatically
      await startTranscription(res.data.analysis_id);
      
      fetchAnalyses();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
    }
  }, [selectedCase, selectedEvidence, analysisType]);

  const startTranscription = async (analysisId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      toast.info('Iniciando transcrição...');
      
      const res = await axios.post(
        `${BACKEND_URL}/api/advanced/interception/transcribe/${analysisId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Transcrição concluída!');
      setSelectedAnalysis(res.data.results);
      setShowResults(true);
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Erro na transcrição');
    }
  };

  const viewAnalysis = async (analysisId) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('ap_elite_token');
      
      const res = await axios.get(
        `${BACKEND_URL}/api/advanced/interception/analysis/${analysisId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSelectedAnalysis(res.data.results);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast.error('Erro ao carregar análise');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac'],
      'video/*': ['.mp4', '.avi', '.mov']
    },
    maxFiles: 1,
    disabled: !selectedCase || !selectedEvidence || uploading
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Análise de Interceptação</h1>
            <p className="text-slate-400 mt-1">Sistema de análise telefônica e telemática</p>
          </div>
          <Badge className="bg-purple-500 text-white">IA Powered</Badge>
        </div>

      {/* Upload Section */}
      {!showResults ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Configuração</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Selecionar Caso
                </label>
                <select
                  value={selectedCase}
                  onChange={(e) => handleCaseChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Selecione um caso...</option>
                  {cases.map((case_item) => (
                    <option key={case_item.id} value={case_item.id}>
                      {case_item.case_number} - {case_item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Selecionar Evidência
                </label>
                <select
                  value={selectedEvidence}
                  onChange={(e) => setSelectedEvidence(e.target.value)}
                  disabled={!selectedCase}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                >
                  <option value="">Selecione uma evidência...</option>
                  {evidences.map((evidence) => (
                    <option key={evidence.id} value={evidence.id}>
                      {evidence.evidence_number} - {evidence.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo de Análise
                </label>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="phone">Telefônica</option>
                  <option value="telematics">Telemática</option>
                  <option value="email">Email</option>
                  <option value="messaging">Mensagens</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Upload Area */}
          <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Upload de Arquivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-cyan-500 bg-cyan-500 bg-opacity-10'
                    : 'border-slate-600 hover:border-slate-500'
                } ${
                  !selectedCase || !selectedEvidence || uploading
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mb-4" />
                    <p className="text-white font-medium">Enviando arquivo...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-white font-medium mb-2">
                      {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo ou clique para selecionar'}
                    </p>
                    <p className="text-slate-400 text-sm">
                      Formatos suportados: MP3, WAV, M4A, MP4, AVI, MOV
                    </p>
                    {(!selectedCase || !selectedEvidence) && (
                      <p className="text-yellow-400 text-sm mt-2">
                        Selecione um caso e evidência primeiro
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* File Type Icons */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                  <FileAudio className="h-8 w-8 text-cyan-400" />
                  <div>
                    <p className="text-white font-medium">Áudio</p>
                    <p className="text-slate-400 text-xs">MP3, WAV, M4A, FLAC</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                  <FileVideo className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Vídeo</p>
                    <p className="text-slate-400 text-xs">MP4, AVI, MOV</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Resultados da Análise</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResults(false)}
                  className="text-slate-300 border-slate-600"
                >
                  Nova Análise
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-cyan-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Contatos Extraídos</p>
                      <p className="text-2xl font-bold text-white">
                        {selectedAnalysis?.extracted_contacts?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-8 w-8 text-purple-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Eventos na Linha do Tempo</p>
                      <p className="text-2xl font-bold text-white">
                        {selectedAnalysis?.timeline?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-slate-400 text-sm">Confiança</p>
                      <p className="text-2xl font-bold text-white">
                        {((selectedAnalysis?.confidence_score || 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transcription */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Transcrição</h3>
                <div className="p-4 bg-slate-700 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                    {selectedAnalysis?.transcription || 'Nenhuma transcrição disponível'}
                  </pre>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Linha do Tempo</h3>
                <div className="space-y-2">
                  {selectedAnalysis?.timeline?.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700 rounded-lg">
                      <Clock className="h-5 w-5 text-cyan-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">{event.event}</p>
                          <Badge className={
                            event.relevance === 'high' ? 'bg-red-500' :
                            event.relevance === 'medium' ? 'bg-yellow-500' :
                            'bg-slate-500'
                          }>
                            {event.relevance}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Contacts */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Contatos Identificados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedAnalysis?.extracted_contacts?.map((contact, index) => (
                    <div key={index} className="p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-cyan-400" />
                        <div>
                          <p className="text-white font-medium">{contact.name}</p>
                          <p className="text-slate-400 text-sm">{contact.phone}</p>
                          <Badge className="mt-1 bg-purple-500 text-xs">{contact.role}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Summary */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Análise Detalhada</h3>
                <div className="p-4 bg-slate-700 rounded-lg">
                  <p className="text-slate-300 whitespace-pre-wrap">
                    {selectedAnalysis?.analysis || 'Nenhuma análise disponível'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default InterceptionAnalysis;
