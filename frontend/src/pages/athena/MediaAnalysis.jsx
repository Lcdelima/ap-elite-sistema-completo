import React, { useState, useEffect } from 'react';
import { Music, Video, Upload, FileAudio, Play, Download, Mic, Film } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const MediaAnalysis = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [transcriptions, setTranscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [type, setType] = useState('audio');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadTranscriptions();
    loadStats();
  }, []);

  const loadTranscriptions = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/media/transcriptions?limit=10`);
      const data = await response.json();
      setTranscriptions(data.transcriptions || []);
    } catch (error) {
      console.error('Erro ao carregar transcrições:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/media/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const processMedia = async () => {
    if (!file) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = type === 'audio' ? '/api/media/transcribe-audio' : '/api/media/analyze-video';
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResult(data);
      setFile(null);
      loadTranscriptions();
      loadStats();
    } catch (error) {
      console.error('Erro no processamento:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Video className="w-10 h-10" />
            Análise de Áudio e Vídeo
          </h1>
          <p className="text-purple-200">Transcrição automática e análise de mídia com IA</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Music className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_transcriptions}</p>
              <p className="text-gray-300 text-sm">Transcrições</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Film className="w-8 h-8 text-pink-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_video_analyses}</p>
              <p className="text-gray-300 text-sm">Análises de Vídeo</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Mic className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.capabilities?.length || 0}</p>
              <p className="text-gray-300 text-sm">Capacidades</p>
            </div>
          </div>
        )}

        {/* Upload */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Processar Mídia</h2>

          <div className="space-y-4">
            <div className="flex gap-4 mb-4">
              <button onClick={() => setType('audio')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${type === 'audio' ? 'bg-purple-500 text-white' : 'bg-white/20 text-gray-300'}`}>
                <Music className="w-5 h-5 inline mr-2" />Áudio
              </button>
              <button onClick={() => setType('video')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${type === 'video' ? 'bg-pink-500 text-white' : 'bg-white/20 text-gray-300'}`}>
                <Video className="w-5 h-5 inline mr-2" />Vídeo
              </button>
            </div>

            <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
              {file ? (
                <div className="space-y-4">
                  {type === 'audio' ? <FileAudio className="w-16 h-16 text-purple-400 mx-auto" /> : <Film className="w-16 h-16 text-pink-400 mx-auto" />}
                  <p className="text-white font-semibold">{file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button onClick={() => setFile(null)} className="text-red-400 hover:text-red-300 text-sm">Remover</button>
                </div>
              ) : (
                <div>
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-white mb-2">Selecione um arquivo de {type === 'audio' ? 'áudio' : 'vídeo'}</p>
                  <p className="text-gray-400 text-sm mb-4">
                    {type === 'audio' ? 'Suporta: MP3, WAV, M4A' : 'Suporta: MP4, AVI, MOV'}
                  </p>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])}
                    accept={type === 'audio' ? 'audio/*' : 'video/*'}
                    className="hidden" id="media-upload" />
                  <label htmlFor="media-upload"
                    className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg cursor-pointer">
                    Selecionar Arquivo
                  </label>
                </div>
              )}
            </div>

            <button onClick={processMedia} disabled={!file || processing}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 font-semibold">
              {processing ? 'Processando...' : `Processar ${type === 'audio' ? 'Áudio' : 'Vídeo'}`}
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Resultado</h2>
            {result.transcription && (
              <div className="bg-black/20 rounded-lg p-6 mb-4">
                <h3 className="text-white font-semibold mb-3">Transcrição</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{result.transcription}</p>
              </div>
            )}
            {result.sentiment && (
              <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Análise de Sentimento</h3>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{result.sentiment}</p>
              </div>
            )}
            {result.faces_detected && (
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mt-4">
                <h3 className="text-white font-semibold mb-2">Faces Detectadas: {result.faces_detected.length}</h3>
                <div className="space-y-2">
                  {result.faces_detected.map((face, idx) => (
                    <div key={idx} className="text-gray-300 text-sm">
                      Face #{face.face_id}: {face.appearances} aparições | {face.gender} | {face.estimated_age}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Histórico</h2>
          <div className="space-y-3">
            {transcriptions.map((item) => (
              <div key={item.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white font-medium">{item.filename}</p>
                  <span className="text-gray-400 text-xs">{new Date(item.processed_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-gray-400 text-sm">Idioma: {item.language} | Falantes: {item.speakers_detected || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaAnalysis;