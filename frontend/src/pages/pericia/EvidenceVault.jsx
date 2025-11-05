import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const EvidenceVault = () => {
  const [uploading, setUploading] = useState(false);
  const [evidence, setEvidence] = useState([]);
  const [selectedCase, setSelectedCase] = useState('');
  const [formData, setFormData] = useState({
    case_id: '',
    evidence_type: 'document',
    description: '',
    location: '',
    tags: '',
    collected_by: localStorage.getItem('user_name') || 'Unknown'
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('case_id', formData.case_id);
      formDataUpload.append('evidence_type', formData.evidence_type);
      formDataUpload.append('description', formData.description);
      formDataUpload.append('collected_by', formData.collected_by);
      formDataUpload.append('location', formData.location);
      formDataUpload.append('tags', formData.tags);

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/evidence-vault/upload`,
        formDataUpload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('elite_token')}`
          }
        }
      );

      alert('Evidência registrada com sucesso!');
      console.log('Hashes:', response.data.hashes);
      
      // Reload evidence list
      if (formData.case_id) {
        loadCaseEvidence(formData.case_id);
      }
    } catch (error) {
      alert('Erro ao fazer upload: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  }, [formData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1
  });

  const loadCaseEvidence = async (caseId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/evidence-vault/case/${caseId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
        }
      );
      setEvidence(response.data.evidence || []);
    } catch (error) {
      console.error('Erro ao carregar evidências:', error);
    }
  };

  const verifyIntegrity = async (evidenceId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/evidence-vault/${evidenceId}/verify`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
        }
      );
      
      if (response.data.integrity_verified) {
        alert('✅ Integridade verificada! Todos os hashes conferem.');
      } else {
        alert('⚠️ ALERTA: Integridade comprometida! Hashes não conferem.');
      }
    } catch (error) {
      alert('Erro ao verificar integridade: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            Evidence <span className="text-elite-accent">Vault</span> 🔐
          </h1>
          <p className="text-elite-metal">
            Cofre de evidências com cadeia de custódia e assinatura Elite Seal™
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <CipherGlassCard className="p-6">
              <h2 className="text-2xl font-title text-elite-text mb-6">Registrar Nova Evidência</h2>
              
              {/* Form */}
              <div className="space-y-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-elite-text text-sm font-semibold mb-2">
                      ID do Caso *
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
                      Tipo de Evidência
                    </label>
                    <select
                      className="input-elite"
                      value={formData.evidence_type}
                      onChange={(e) => setFormData({...formData, evidence_type: e.target.value})}
                    >
                      <option value="document">Documento</option>
                      <option value="image">Imagem</option>
                      <option value="audio">Áudio</option>
                      <option value="video">Vídeo</option>
                      <option value="file">Arquivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-elite-text text-sm font-semibold mb-2">
                    Descrição *
                  </label>
                  <textarea
                    className="input-elite"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descreva a evidência..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-elite-text text-sm font-semibold mb-2">
                      Local de Coleta
                    </label>
                    <input
                      type="text"
                      className="input-elite"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Ex: Escritório, Residência..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-elite-text text-sm font-semibold mb-2">
                      Tags (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      className="input-elite"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="urgente, digital, confidencial"
                    />
                  </div>
                </div>
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                  isDragActive 
                    ? 'border-elite-accent bg-surface-02' 
                    : 'border-white/20 hover:border-elite-accent hover:bg-surface-01'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-6xl mb-4">📁</div>
                {uploading ? (
                  <p className="text-elite-accent font-semibold">Processando...</p>
                ) : (
                  <div>
                    <p className="text-elite-text font-semibold mb-2">
                      {isDragActive ? 'Solte o arquivo aqui' : 'Arraste o arquivo ou clique para selecionar'}
                    </p>
                    <p className="text-elite-metal text-sm">
                      Suporta: documentos, imagens, áudio, vídeo
                    </p>
                  </div>
                )}
              </div>
            </CipherGlassCard>
          </div>

          {/* Evidence List */}
          <div>
            <CipherGlassCard className="p-6">
              <h3 className="text-xl font-title text-elite-text mb-4">Evidências do Caso</h3>
              
              <div className="mb-4">
                <input
                  type="text"
                  className="input-elite"
                  placeholder="ID do caso"
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                />
                <button
                  onClick={() => loadCaseEvidence(selectedCase)}
                  className="btn-elite btn-elite-primary w-full mt-2"
                >
                  Carregar
                </button>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {evidence.length === 0 ? (
                  <p className="text-elite-metal text-sm text-center py-8">
                    Nenhuma evidência encontrada
                  </p>
                ) : (
                  evidence.map((item) => (
                    <div key={item.id} className="p-3 bg-surface-01 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-elite-text font-semibold text-sm">
                          {item.filename}
                        </div>
                        <div className="category-badge badge-pericia text-xs">
                          {item.evidence_type}
                        </div>
                      </div>
                      
                      <p className="text-elite-metal text-xs mb-2">
                        {item.description}
                      </p>
                      
                      <div className="text-xs text-elite-metal space-y-1">
                        <div>Hash: {item.hash_sha256?.substring(0, 16)}...</div>
                        <div>Coletado: {new Date(item.collected_at).toLocaleDateString('pt-BR')}</div>
                      </div>
                      
                      <button
                        onClick={() => verifyIntegrity(item.id)}
                        className="btn-elite btn-elite-secondary w-full mt-3 text-xs py-1"
                      >
                        Verificar Integridade
                      </button>
                    </div>
                  ))
                )}
              </div>
            </CipherGlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceVault;
