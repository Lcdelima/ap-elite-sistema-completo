import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import BackBar from '../../components/BackBar';

const EliteSealManager = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [evidenceId, setEvidenceId] = useState('');
  const [evidenceData, setEvidenceData] = useState(null);
  const [enableBlockchain, setEnableBlockchain] = useState(false);
  const [seals, setSeals] = useState([]);
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'history'
  const [selectedSeal, setSelectedSeal] = useState(null);
  const [showManifest, setShowManifest] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    loadSeals();
  }, []);

  const loadSeals = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/elite-seal/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSeals(data.seals || []);
      }
    } catch (error) {
      console.error('Error loading seals:', error);
    }
  };

  const searchEvidence = async () => {
    if (!evidenceId.trim()) {
      toast.error('Informe o ID da evidência');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Try evidence_vault first
      let response = await fetch(`${API_BASE_URL}/api/evidence-vault/${evidenceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Try forensic_evidences
        response = await fetch(`${API_BASE_URL}/api/evidences/${evidenceId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      if (response.ok) {
        const data = await response.json();
        setEvidenceData(data);
        toast.success('Evidência encontrada!');
      } else {
        toast.error('Evidência não encontrada');
        setEvidenceData(null);
      }
    } catch (error) {
      console.error('Error searching evidence:', error);
      toast.error('Erro ao buscar evidência');
      setEvidenceData(null);
    } finally {
      setLoading(false);
    }
  };

  const createSeal = async () => {
    if (!evidenceData) {
      toast.error('Busque uma evidência primeiro');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/api/elite-seal/${evidenceId}?enable_blockchain=${enableBlockchain}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success('✅ Elite Seal™ criado com sucesso!');
        setEvidenceData(null);
        setEvidenceId('');
        setActiveTab('history');
        await loadSeals();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Erro ao criar Elite Seal™');
      }
    } catch (error) {
      console.error('Error creating seal:', error);
      toast.error('Erro ao criar Elite Seal™');
    } finally {
      setLoading(false);
    }
  };

  const downloadManifest = async (sealId, format = 'pdf') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_BASE_URL}/api/elite-seal/manifest/${sealId}?format=${format}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        if (format === 'pdf') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `elite_seal_${sealId}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `elite_seal_${sealId}.json`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        }
        toast.success(`Manifesto ${format.toUpperCase()} baixado!`);
      } else {
        toast.error('Erro ao baixar manifesto');
      }
    } catch (error) {
      console.error('Error downloading manifest:', error);
      toast.error('Erro ao baixar manifesto');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0A0E12] to-gray-900">
      <BackBar 
        title="Elite Seal™" 
        backTo="/athena"
        breadcrumbs={[
          { label: 'Athena', path: '/athena' },
          { label: 'Elite Seal™', path: '/athena/elite-seal' }
        ]}
      />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
            Elite Seal™
          </h1>
          <p className="text-gray-400 text-lg">
            Sistema de Custódia Digital com Assinatura RSA-2048
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-xl font-semibold text-cyan-400 ml-4">Assinatura Digital</h3>
            </div>
            <p className="text-gray-400 text-sm">
              RSA-2048 com PSS padding e SHA-512 digest para máxima segurança
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⛓️</span>
              </div>
              <h3 className="text-xl font-semibold text-blue-400 ml-4">Cadeia de Custódia</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Rastreamento completo de eventos e operações forenses
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-purple-400 ml-4">Conformidade</h3>
            </div>
            <p className="text-gray-400 text-sm">
              ISO/IEC 27037, 27041, 27042 e ABNT NBR ISO/IEC 27001
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="flex border-b border-gray-700/50">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'create'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-b-2 border-cyan-500'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              🔒 Criar Elite Seal™
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-b-2 border-cyan-500'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              📜 Histórico de Selos
            </button>
          </div>

          {/* Create Seal Tab */}
          {activeTab === 'create' && (
            <div className="p-8">
              <div className="max-w-2xl mx-auto">
                {/* Evidence ID Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    ID da Evidência
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={evidenceId}
                      onChange={(e) => setEvidenceId(e.target.value)}
                      placeholder="Digite o ID da evidência"
                      className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                    <button
                      onClick={searchEvidence}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Buscando...' : '🔍 Buscar'}
                    </button>
                  </div>
                </div>

                {/* Evidence Data Display */}
                {evidenceData && (
                  <div className="mb-6 bg-gray-800/30 border border-cyan-500/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">
                      Evidência Encontrada
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Arquivo:</span>
                        <span className="text-white font-mono">{evidenceData.filename}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tamanho:</span>
                        <span className="text-white">{(evidenceData.file_size / 1024).toFixed(2)} KB</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-gray-400">SHA-256:</span>
                        <span className="text-white font-mono text-xs break-all bg-gray-900/50 p-2 rounded">
                          {evidenceData.hash_sha256 || evidenceData.sha256}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-gray-400">SHA-512:</span>
                        <span className="text-white font-mono text-xs break-all bg-gray-900/50 p-2 rounded">
                          {evidenceData.hash_sha512 || evidenceData.sha512 || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Blockchain Option */}
                {evidenceData && (
                  <div className="mb-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableBlockchain}
                        onChange={(e) => setEnableBlockchain(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-700 bg-gray-800 checked:bg-cyan-500 checked:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
                      />
                      <span className="text-gray-300">
                        ⛓️ Registrar na Blockchain (Polygon Mumbai Testnet)
                      </span>
                    </label>
                  </div>
                )}

                {/* Create Seal Button */}
                {evidenceData && (
                  <button
                    onClick={createSeal}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                  >
                    {loading ? 'Criando Selo Digital...' : '🔒 Criar Elite Seal™'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="p-8">
              {seals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔒</div>
                  <p className="text-gray-400 text-lg">Nenhum Elite Seal™ criado ainda</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {seals.map((seal) => (
                    <div
                      key={seal.seal_id}
                      className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-6 hover:border-cyan-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 rounded-full text-xs font-semibold">
                              ✅ SEALED
                            </span>
                            {seal.blockchain_tx && (
                              <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 rounded-full text-xs font-semibold">
                                ⛓️ BLOCKCHAIN
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start gap-3">
                              <span className="text-gray-400 text-sm min-w-[100px]">Seal ID:</span>
                              <span className="text-white font-mono text-sm">{seal.seal_id}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-gray-400 text-sm min-w-[100px]">Evidence ID:</span>
                              <span className="text-white font-mono text-sm">{seal.evidence_id}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-gray-400 text-sm min-w-[100px]">Hash SHA-256:</span>
                              <span className="text-white font-mono text-xs break-all">{seal.hash_sha256}</span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-gray-400 text-sm min-w-[100px]">Data:</span>
                              <span className="text-white text-sm">
                                {new Date(seal.data_emissao).toLocaleString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex items-start gap-3">
                              <span className="text-gray-400 text-sm min-w-[100px]">Emitido por:</span>
                              <span className="text-white text-sm">{seal.emitido_por}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-700/50">
                        <button
                          onClick={() => downloadManifest(seal.seal_id, 'pdf')}
                          className="flex-1 px-4 py-2 bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-600/30 transition-all"
                        >
                          📄 Baixar PDF
                        </button>
                        <button
                          onClick={() => downloadManifest(seal.seal_id, 'json')}
                          className="flex-1 px-4 py-2 bg-blue-600/20 border border-blue-600/50 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all"
                        >
                          📋 Baixar JSON
                        </button>
                        <button
                          onClick={() => window.open(`${API_BASE_URL}/api/elite-seal/verify/${seal.hash_sha256}`, '_blank')}
                          className="flex-1 px-4 py-2 bg-green-600/20 border border-green-600/50 text-green-400 rounded-lg hover:bg-green-600/30 transition-all"
                        >
                          ✅ Verificar Público
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EliteSealManager;
