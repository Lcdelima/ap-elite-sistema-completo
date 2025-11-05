import React, { useState, useRef } from 'react';
import axios from 'axios';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const TranscriptionVFT = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    case_id: '',
    audio_type: 'audio',
    language: 'pt-BR',
    provider: 'whisper',
    requester: localStorage.getItem('user_name') || 'Unknown'
  });

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const uploadAndTranscribe = async () => {
    if (!file) {
      alert('Selecione um arquivo');
      return;
    }

    setLoading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('case_id', formData.case_id);
      formDataUpload.append('audio_type', formData.audio_type);
      formDataUpload.append('language', formData.language);
      formDataUpload.append('provider', formData.provider);
      formDataUpload.append('enable_diarization', 'true');
      formDataUpload.append('requester', formData.requester);

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/transcription/upload`,
        formDataUpload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('elite_token')}`
          }
        }
      );

      const transcriptionId = response.data.transcription_id;
      
      // Aguardar 2s e processar (simulação)
      setTimeout(async () => {
        try {
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/transcription/${transcriptionId}/process`,
            {},
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
            }
          );
          
          // Carregar resultado
          const resultResponse = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/transcription/${transcriptionId}`,
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
            }
          );
          
          setTranscription(resultResponse.data);
          alert('✅ Transcrição concluída!');
        } catch (error) {
          console.error('Erro no processamento:', error);
        } finally {
          setLoading(false);
        }
      }, 2000);

    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
      setLoading(false);
    }
  };

  const exportVFT = async () => {
    if (!transcription) return;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/transcription/${transcription.transcription_id}/export-vft`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
        }
      );

      const blob = new Blob([JSON.stringify(response.data.vft_pack, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `VFT_Pack_${transcription.transcription_id}.json`;
      link.click();
    } catch (error) {
      alert('Erro ao exportar: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            VFT Pack™ <span className="text-elite-accent">Transcrição Forense</span> 🎤
          </h1>
          <p className="text-elite-metal">
            Verified Forensic Transcript - Transcrição com cadeia de custódia
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload & Config */}
          <CipherGlassCard className="p-6">
            <h2 className="text-2xl font-title text-elite-text mb-6">Nova Transcrição</h2>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-elite-text text-sm font-semibold mb-2">
                    ID do Caso
                  </label>
                  <input
                    type="text"
                    className="input-elite"
                    value={formData.case_id}
                    onChange={(e) => setFormData({...formData, case_id: e.target.value})}
                    placeholder="caso-123"
                  />
                </div>
                
                <div>
                  <label className="block text-elite-text text-sm font-semibold mb-2">
                    Tipo
                  </label>
                  <select
                    className="input-elite"
                    value={formData.audio_type}
                    onChange={(e) => setFormData({...formData, audio_type: e.target.value})}
                  >
                    <option value="audio">Áudio</option>
                    <option value="video">Vídeo</option>
                    <option value="interception">Interceptação</option>
                    <option value="url">URL</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-elite-text text-sm font-semibold mb-2">
                    Idioma
                  </label>
                  <select
                    className="input-elite"
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                  >
                    <option value="pt-BR">Português (BR)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-elite-text text-sm font-semibold mb-2">
                    Provider
                  </label>
                  <select
                    className="input-elite"
                    value={formData.provider}
                    onChange={(e) => setFormData({...formData, provider: e.target.value})}
                  >
                    <option value="whisper">OpenAI Whisper</option>
                    <option value="google">Google Speech</option>
                    <option value="assemblyai">AssemblyAI</option>
                    <option value="custom">Elite Custom</option>
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-elite-accent hover:bg-surface-01 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="text-4xl mb-2">🎧</div>
                {file ? (
                  <div>
                    <p className="text-elite-accent font-semibold">{file.name}</p>
                    <p className="text-elite-metal text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <p className="text-elite-metal">Clique para selecionar arquivo</p>
                )}
              </div>

              <button
                onClick={uploadAndTranscribe}
                disabled={loading || !file}
                className="btn-elite btn-elite-primary w-full"
              >
                {loading ? '🔄 Processando...' : '🎤 Iniciar Transcrição'}
              </button>
            </div>
          </CipherGlassCard>

          {/* Results */}
          <CipherGlassCard className="p-6">
            <h3 className="text-xl font-title text-elite-text mb-4">Resultado</h3>
            
            {!transcription ? (
              <div className="text-center py-12 text-elite-metal">
                <div className="text-4xl mb-4">🎵</div>
                <p>Aguardando transcrição</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-surface-01 rounded-lg border border-elite-accent/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="category-badge badge-diversos">
                      {transcription.status?.toUpperCase()}
                    </div>
                    <button
                      onClick={exportVFT}
                      className="btn-elite btn-elite-secondary text-xs py-1 px-3"
                    >
                      📦 Export VFT Pack
                    </button>
                  </div>
                  
                  <div className="text-sm space-y-2 text-elite-metal">
                    <div><strong>ID:</strong> {transcription.transcription_id?.substring(0, 16)}...</div>
                    <div><strong>Provider:</strong> {transcription.provider}</div>
                    <div><strong>Hash:</strong> {transcription.file_hash_sha256?.substring(0, 24)}...</div>
                  </div>
                </div>

                {/* Transcription Text */}
                {transcription.result && (
                  <div className="p-4 bg-elite/50 rounded-lg border border-white/10 max-h-[400px] overflow-y-auto">
                    <div className="text-elite-text leading-relaxed">
                      {transcription.result.full_text}
                    </div>
                    
                    {transcription.result.segments && (
                      <div className="mt-4 space-y-2">
                        <div className="text-elite-accent font-semibold text-sm">Segmentos:</div>
                        {transcription.result.segments.map((seg, idx) => (
                          <div key={idx} className="text-xs text-elite-metal border-l-2 border-elite-accent/30 pl-3">
                            <div className="font-mono">[{seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s]</div>
                            <div>{seg.text}</div>
                            {seg.speaker && <div className="text-elite-accent">Speaker: {seg.speaker}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CipherGlassCard>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionVFT;
