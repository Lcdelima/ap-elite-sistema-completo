import React, { useState, useEffect } from 'react';
import { Shield, Link, CheckCircle, FileText, Download, AlertTriangle } from 'lucide-react';

const BlockchainCustody = () => {
  const [chain, setChain] = useState([]);
  const [stats, setStats] = useState(null);
  const [evidenceId, setEvidenceId] = useState('');
  const [action, setAction] = useState('');
  const [userId, setUserId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const [verifying, setVerifying] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadChain();
    loadStats();
  }, []);

  const loadChain = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/blockchain/chain?limit=20`);
      const data = await response.json();
      setChain(data.chain || []);
    } catch (error) {
      console.error('Erro ao carregar blockchain:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/blockchain/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const registerEvidence = async () => {
    if (!evidenceId || !action) return;

    try {
      const response = await fetch(`${backendUrl}/api/blockchain/register-evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidence_id: evidenceId,
          action: action,
          user_id: userId,
          metadata: {
            timestamp: new Date().toISOString(),
            location: 'Sistema ATHENA'
          }
        })
      });

      if (response.ok) {
        alert('⛓️ Evidência registrada na blockchain com sucesso!');
        setEvidenceId('');
        setAction('');
        loadChain();
        loadStats();
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
    }
  };

  const verifyIntegrity = async () => {
    setVerifying(true);
    try {
      const response = await fetch(`${backendUrl}/api/blockchain/verify-integrity`);
      const data = await response.json();
      
      if (data.valid) {
        alert('✅ Blockchain íntegra! Todos os blocos estão válidos.');
      } else {
        alert('⚠️ Falha de integridade detectada no bloco ' + data.tampered_block);
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10" />
            Blockchain - Cadeia de Custódia
          </h1>
          <p className="text-indigo-200">
            Registro imutável e criptograficamente seguro de evidências
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Link className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_blocks}</p>
              <p className="text-gray-300 text-sm">Blocos na Cadeia</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <FileText className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_certificates}</p>
              <p className="text-gray-300 text-sm">Certificados Emitidos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Shield className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.blockchain_type}</p>
              <p className="text-gray-300 text-sm">Tipo de Blockchain</p>
            </div>
          </div>
        )}

        {/* Register Evidence */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Registrar Evidência</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={evidenceId}
              onChange={(e) => setEvidenceId(e.target.value)}
              placeholder="ID da Evidência"
              className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
            />
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Ação (coleta, transferência, análise...)"
              className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={registerEvidence}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700"
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Registrar na Blockchain
            </button>
            <button
              onClick={verifyIntegrity}
              disabled={verifying}
              className="px-6 py-3 bg-green-500/30 hover:bg-green-500/50 text-white rounded-lg"
            >
              {verifying ? 'Verificando...' : 'Verificar Integridade'}
            </button>
          </div>
        </div>

        {/* Blockchain */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Link className="w-6 h-6" />
            Cadeia de Blocos ({chain.length})
          </h2>

          <div className="space-y-4">
            {chain.map((block, idx) => (
              <div key={block.index} className="relative">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-400/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/30 rounded-full p-2">
                        <Link className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Bloco #{block.index}</p>
                        <p className="text-gray-400 text-sm">{new Date(block.timestamp).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-gray-400 text-sm">Evidência ID</p>
                      <p className="text-white font-mono text-sm">{block.data?.evidence_id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Ação</p>
                      <p className="text-white">{block.data?.action}</p>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded p-3">
                    <p className="text-gray-400 text-xs mb-1">Hash do Bloco</p>
                    <p className="text-green-400 font-mono text-xs break-all">{block.hash}</p>
                    {block.previous_hash !== '0' && (
                      <>
                        <p className="text-gray-400 text-xs mt-2 mb-1">Hash Anterior</p>
                        <p className="text-blue-400 font-mono text-xs break-all">{block.previous_hash}</p>
                      </>
                    )}
                  </div>
                </div>

                {idx < chain.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400 to-purple-400"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {chain.length === 0 && (
            <div className="text-center py-12">
              <Link className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Nenhum bloco registrado ainda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockchainCustody;