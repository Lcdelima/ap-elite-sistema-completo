import React, { useState, useEffect } from 'react';
import { Shield, FileAudio, Upload, CheckCircle, Clock, AlertCircle, FileText, Users } from 'lucide-react';
import axios from 'axios';

const AegisModule = () => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // URL da API Aegis (ajustar conforme deployment)
  const AEGIS_API = process.env.REACT_APP_AEGIS_URL || 'http://localhost:8002';
  const ACTOR_ID = 'delegado@policia.gov.br'; // Trocar por autenticação real

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    if (selectedCase) {
      loadEvidences(selectedCase.id);
    }
  }, [selectedCase]);

  const loadCases = async () => {
    try {
      const response = await axios.get(`${AEGIS_API}/cases`, {
        headers: { 'X-Actor-Id': ACTOR_ID }
      });
      setCases(response.data);
    } catch (error) {
      console.error('Erro ao carregar casos:', error);
    }
  };

  const loadEvidences = async (caseId) => {
    try {
      const response = await axios.get(`${AEGIS_API}/cases/${caseId}/evidences`, {
        headers: { 'X-Actor-Id': ACTOR_ID }
      });
      setEvidences(response.data);
    } catch (error) {
      console.error('Erro ao carregar evidências:', error);
    }
  };

  const createCase = async () => {
    const name = prompt('Nome do caso:');
    if (!name) return;

    try {
      const response = await axios.post(
        `${AEGIS_API}/cases`,
        { name },
        { headers: { 'X-Actor-Id': ACTOR_ID } }
      );
      setCases([...cases, response.data]);
      alert('Caso criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar caso: ' + error.message);
    }
  };

  const uploadAudio = async (caseId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setLoading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(
          `${AEGIS_API}/cases/${caseId}/evidences/audio`,
          formData,
          {
            headers: {
              'X-Actor-Id': ACTOR_ID,
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          }
        );
        
        alert('✅ Áudio enviado! Transcrição em andamento...');
        loadEvidences(caseId);
      } catch (error) {
        alert('❌ Erro no upload: ' + (error.response?.data?.detail || error.message));
      } finally {
        setLoading(false);
        setUploadProgress(0);
      }
    };

    input.click();
  };

  const getStatusBadge = (status) => {
    const badges = {
      'RECEIVED': { color: 'bg-blue-500', icon: Clock, text: 'Recebido' },
      'PROCESSING': { color: 'bg-yellow-500', icon: Clock, text: 'Processando' },
      'PROCESSED': { color: 'bg-green-500', icon: CheckCircle, text: 'Processado' },
      'FAILED': { color: 'bg-red-500', icon: AlertCircle, text: 'Falhou' }
    };
    const badge = badges[status] || badges['RECEIVED'];
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-white ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-elite-accent" />
            <h1 className="text-4xl font-title text-elite-text">
              Aegis <span className="text-elite-accent">Thanatos</span>
            </h1>
          </div>
          <p className="text-elite-metal">
            Sistema de Interceptação Legal e Evidências Forenses
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar - Casos */}
          <div className="lg:col-span-1">
            <div className="bg-surface-01 border border-elite-metal/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-title text-elite-text">Casos</h2>
                <button
                  onClick={createCase}
                  className="px-3 py-1 bg-elite-accent text-elite-bg text-sm rounded hover:bg-elite-accent/90"
                >
                  + Novo
                </button>
              </div>

              <div className="space-y-2">
                {cases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`w-full text-left p-3 rounded transition-all ${
                      selectedCase?.id === c.id
                        ? 'bg-elite-accent text-elite-bg'
                        : 'bg-surface-02 text-elite-text hover:bg-surface-03'
                    }`}
                  >
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs opacity-70">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </button>
                ))}

                {cases.length === 0 && (
                  <div className="text-center py-8 text-elite-metal">
                    <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum caso criado</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main - Evidências */}
          <div className="lg:col-span-2">
            {selectedCase ? (
              <div className="bg-surface-01 border border-elite-metal/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-title text-elite-text">{selectedCase.name}</h2>
                    <p className="text-sm text-elite-metal">
                      Status: {selectedCase.status} | Criado: {new Date(selectedCase.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => uploadAudio(selectedCase.id)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-elite-accent text-elite-bg rounded hover:bg-elite-accent/90 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Áudio
                  </button>
                </div>

                {loading && (
                  <div className="mb-4 p-4 bg-surface-02 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 animate-spin text-elite-accent" />
                      <span className="text-elite-text">Enviando... {uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-surface-03 rounded-full h-2">
                      <div 
                        className="bg-elite-accent h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Lista de Evidências */}
                <div className="space-y-3">
                  {evidences.map((evidence) => (
                    <div key={evidence.id} className="bg-surface-02 border border-elite-metal/20 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <FileAudio className="w-8 h-8 text-elite-accent" />
                          <div>
                            <div className="font-semibold text-elite-text">{evidence.original_filename}</div>
                            <div className="text-xs text-elite-metal">
                              {(evidence.size_bytes / 1024 / 1024).toFixed(2)} MB | 
                              SHA256: {evidence.sha256.substring(0, 16)}...
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(evidence.status)}
                      </div>

                      {evidence.transcription && (
                        <div className="mt-3 p-3 bg-surface-03 rounded border-l-4 border-elite-accent">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-elite-accent" />
                            <span className="text-sm font-semibold text-elite-text">Transcrição:</span>
                          </div>
                          <p className="text-sm text-elite-metal whitespace-pre-wrap">
                            {evidence.transcription}
                          </p>
                        </div>
                      )}

                      {evidence.status === 'PROCESSING' && (
                        <div className="mt-3 text-sm text-yellow-500 flex items-center gap-2">
                          <Clock className="w-4 h-4 animate-spin" />
                          Transcrição em andamento...
                        </div>
                      )}
                    </div>
                  ))}

                  {evidences.length === 0 && (
                    <div className="text-center py-12 text-elite-metal">
                      <FileAudio className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma evidência adicionada</p>
                      <p className="text-xs mt-2">Clique em "Upload Áudio" para começar</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-surface-01 border border-elite-metal/30 rounded-lg p-12 text-center">
                <Shield className="w-20 h-20 mx-auto mb-4 text-elite-metal opacity-50" />
                <h3 className="text-xl font-title text-elite-text mb-2">
                  Selecione um caso
                </h3>
                <p className="text-elite-metal">
                  Escolha um caso à esquerda ou crie um novo para começar
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-surface-01 border border-elite-accent/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-elite-accent flex-shrink-0 mt-0.5" />
            <div className="text-sm text-elite-metal">
              <strong className="text-elite-text">Nota:</strong> O módulo Aegis/Thanatos requer PostgreSQL + TimescaleDB rodando.
              Certifique-se de que a API está acessível em <code className="text-elite-accent">{AEGIS_API}</code>.
              Consulte <code className="text-elite-accent">/app/aegis/README.md</code> para instruções de deployment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AegisModule;
