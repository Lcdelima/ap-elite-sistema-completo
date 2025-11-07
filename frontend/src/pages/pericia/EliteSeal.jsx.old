import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const EliteSeal = () => {
  const [evidenceId, setEvidenceId] = useState('');
  const [seal, setSeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const createSeal = async () => {
    if (!evidenceId) {
      alert('Digite o ID da evidência');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/elite-seal/create`,
        {
          evidence_id: evidenceId,
          signed_by: localStorage.getItem('user_name') || 'Unknown',
          purpose: 'export'
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
        }
      );

      setSeal(response.data.manifest);
      alert('✅ Elite Seal criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar Elite Seal: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const verifySeal = async (sealId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/elite-seal/${sealId}/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
        }
      );

      setVerificationResult(response.data);
    } catch (error) {
      alert('Erro ao verificar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadManifest = () => {
    if (!seal) return;

    const dataStr = JSON.stringify(seal, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `elite_seal_${seal.seal_id}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            Elite <span className="text-elite-accent">Seal</span>™ 🔒
          </h1>
          <p className="text-elite-metal">
            Manifesto de Custódia com Assinatura Digital RSA-2048
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Create Seal */}
          <CipherGlassCard className="p-6">
            <h2 className="text-2xl font-title text-elite-text mb-6">Criar Elite Seal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-elite-text text-sm font-semibold mb-2">
                  ID da Evidência
                </label>
                <input
                  type="text"
                  className="input-elite"
                  value={evidenceId}
                  onChange={(e) => setEvidenceId(e.target.value)}
                  placeholder="evidence-uuid-here"
                />
              </div>

              <button
                onClick={createSeal}
                disabled={loading}
                className="btn-elite btn-elite-primary w-full"
              >
                {loading ? 'Criando...' : '🔒 Criar Elite Seal'}
              </button>

              {seal && (
                <div className="mt-6 p-4 bg-surface-02 rounded-lg border border-elite-accent/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-elite-accent font-semibold">✅ Seal Criado</div>
                    <button
                      onClick={downloadManifest}
                      className="btn-elite btn-elite-secondary text-xs py-1 px-3"
                    >
                      📥 Download
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-xs text-elite-metal">
                    <div><strong>Seal ID:</strong> {seal.seal_id?.substring(0, 24)}...</div>
                    <div><strong>Timestamp:</strong> {new Date(seal.timestamp).toLocaleString('pt-BR')}</div>
                    <div><strong>Assinado por:</strong> {seal.seal?.signed_by}</div>
                    <div><strong>Propósito:</strong> {seal.seal?.purpose}</div>
                  </div>
                </div>
              )}
            </div>
          </CipherGlassCard>

          {/* Manifest Preview */}
          {seal && (
            <CipherGlassCard className="p-6">
              <h3 className="text-xl font-title text-elite-text mb-4">Manifesto</h3>
              
              <div className="bg-elite/50 p-4 rounded-lg border border-white/10 max-h-[600px] overflow-y-auto">
                <pre className="text-elite-metal text-xs">
                  {JSON.stringify(seal, null, 2)}
                </pre>
              </div>

              {seal.seal_id && (
                <button
                  onClick={() => verifySeal(seal.seal_id)}
                  className="btn-elite btn-elite-primary w-full mt-4"
                >
                  ✔️ Verificar Assinatura
                </button>
              )}

              {verificationResult && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  verificationResult.signature_valid
                    ? 'bg-green-500/10 border-green-500/50'
                    : 'bg-red-500/10 border-red-500/50'
                }`}>
                  <div className={`font-semibold mb-2 ${
                    verificationResult.signature_valid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {verificationResult.signature_valid ? '✅ Assinatura Válida' : '❌ Assinatura Inválida'}
                  </div>
                  <p className="text-elite-metal text-sm">
                    {verificationResult.message}
                  </p>
                </div>
              )}
            </CipherGlassCard>
          )}
        </div>

        {/* Info Section */}
        <CipherGlassCard className="mt-6 p-6">
          <h3 className="text-xl font-title text-elite-text mb-4">Sobre o Elite Seal™</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-elite-metal">
            <div>
              <div className="text-elite-accent font-semibold mb-2">🔐 Assinatura Digital</div>
              <p>RSA-2048 com PSS padding, garantindo autenticidade e integridade do manifesto.</p>
            </div>
            <div>
              <div className="text-elite-accent font-semibold mb-2">📋 Cadeia de Custódia</div>
              <p>Timeline completa de eventos, com hashes SHA-256/512 de todas as etapas.</p>
            </div>
            <div>
              <div className="text-elite-accent font-semibold mb-2">⚖️ Conformidade</div>
              <p>Compatível com ISO/IEC 27037, ISO 27001 e ABNT NBR para admissibilidade judicial.</p>
            </div>
          </div>
        </CipherGlassCard>
      </div>
    </div>
  );
};

export default EliteSeal;
