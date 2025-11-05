import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SectionHeader from '../../components/SectionHeader';
import '../../styles/elite-forensic.css';

const SyncJudicial = () => {
  const [status, setStatus] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState({
    tribunal: '',
    sistema: '',
    username: '',
    password: ''
  });
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/sync-judicial/status`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setStatus(response.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const configurarTribunal = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/sync-judicial/config`,
        {
          tribunal: configForm.tribunal,
          sistema: configForm.sistema,
          credenciais: {
            username: configForm.username,
            password: configForm.password
          },
          ativo: true
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      
      alert('✅ Tribunal configurado!');
      setShowConfig(false);
      loadStatus();
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    }
  };

  const sincronizarProcesso = async () => {
    const cnj = prompt('Digite o número CNJ do processo:');
    if (!cnj) return;

    setSyncInProgress(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/sync-judicial/sync/${cnj}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      
      alert(`✅ ${response.data.andamentos_baixados} andamentos sincronizados!`);
      loadStatus();
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSyncInProgress(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'conectado': '✅',
      'erro': '❌',
      'sincronizando': '🔄',
      'desconhecido': '⚠️'
    };
    return icons[status] || '❓';
  };

  const getStatusColor = (status) => {
    const colors = {
      'conectado': '#27AE60',
      'erro': '#E74C3C',
      'sincronizando': '#E67E22',
      'desconhecido': '#B3B8C2'
    };
    return colors[status] || '#B3B8C2';
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <SectionHeader
          title={<span><span style={{ color: '#00A3C4' }}>Sync</span> Judicial</span>}
          subtitle="Sincronização automática com tribunais brasileiros"
          breadcrumbs={['Advocacia', 'Sync Judicial']}
          actions={
            <>
              <button 
                onClick={sincronizarProcesso}
                disabled={syncInProgress}
                className="btn-elite btn-elite-secondary text-sm"
              >
                {syncInProgress ? '🔄 Sincronizando...' : '🔄 Sync Manual'}
              </button>
              <button 
                onClick={() => setShowConfig(!showConfig)} 
                className="btn-elite btn-elite-primary text-sm"
              >
                {showConfig ? '✕ Cancelar' : '⚙️ Configurar Tribunal'}
              </button>
            </>
          }
        />

        {/* Config Form */}
        {showConfig && (
          <div className="cipher-glass p-6 mb-6">
            <h3 className="text-xl font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
              Configurar Conexão com Tribunal
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Tribunal
                </label>
                <select
                  className="input-elite"
                  value={configForm.tribunal}
                  onChange={(e) => setConfigForm({...configForm, tribunal: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  <option value="TJSP">TJSP - Tribunal de Justiça de SP</option>
                  <option value="TJRJ">TJRJ - Tribunal de Justiça do RJ</option>
                  <option value="TJMG">TJMG - Tribunal de Justiça de MG</option>
                  <option value="TRF1">TRF1 - Tribunal Regional Federal 1ª Região</option>
                  <option value="TRF2">TRF2 - Tribunal Regional Federal 2ª Região</option>
                  <option value="STJ">STJ - Superior Tribunal de Justiça</option>
                  <option value="STF">STF - Supremo Tribunal Federal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Sistema
                </label>
                <select
                  className="input-elite"
                  value={configForm.sistema}
                  onChange={(e) => setConfigForm({...configForm, sistema: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  <option value="PJe">PJe</option>
                  <option value="e-SAJ">e-SAJ</option>
                  <option value="e-proc">e-proc</option>
                  <option value="Projudi">Projudi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Usuário/OAB
                </label>
                <input
                  type="text"
                  className="input-elite"
                  value={configForm.username}
                  onChange={(e) => setConfigForm({...configForm, username: e.target.value})}
                  placeholder="OAB123456"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Senha
                </label>
                <input
                  type="password"
                  className="input-elite"
                  value={configForm.password}
                  onChange={(e) => setConfigForm({...configForm, password: e.target.value})}
                />
              </div>
            </div>

            <button onClick={configurarTribunal} className="btn-elite btn-elite-primary w-full mt-4">
              💾 Salvar Configuração
            </button>
          </div>
        )}

        {/* Status dos Tribunais */}
        {status && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {status.tribunais.map((tribunal) => (
              <div key={tribunal.tribunal} className="cipher-glass p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xl font-title font-bold" style={{ color: '#E4E6EB' }}>
                      {tribunal.tribunal}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>
                      {tribunal.sistema}
                    </div>
                  </div>
                  <div className="text-3xl">
                    {getStatusIcon(tribunal.status)}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(228,230,235,0.7)' }}>Status:</span>
                    <span className="font-semibold" style={{ color: getStatusColor(tribunal.status) }}>
                      {tribunal.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(228,230,235,0.7)' }}>Processos:</span>
                    <span style={{ color: '#00A3C4' }}>{tribunal.processos_monitorados}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(228,230,235,0.7)' }}>Andamentos:</span>
                    <span style={{ color: '#00A3C4' }}>{tribunal.andamentos_baixados}</span>
                  </div>
                  {tribunal.ultima_sync && (
                    <div className="flex justify-between">
                      <span style={{ color: 'rgba(228,230,235,0.7)' }}>Última sync:</span>
                      <span className="text-xs" style={{ color: '#E4E6EB' }}>
                        {new Date(tribunal.ultima_sync).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="cipher-glass p-6">
          <h3 className="text-xl font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
            Sobre o Sync Judicial
          </h3>
          <div className="space-y-3 text-sm" style={{ color: 'rgba(228,230,235,0.8)' }}>
            <div className="flex gap-2">
              <span style={{ color: '#00A3C4' }}>✓</span>
              <span>Sincronização automática com PJe, e-SAJ, e-proc e Projudi</span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: '#00A3C4' }}>✓</span>
              <span>Download de andamentos com hash de integridade (SHA-256/512)</span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: '#00A3C4' }}>✓</span>
              <span>Detecção automática de prazos e criação de alertas</span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: '#00A3C4' }}>✓</span>
              <span>Cadeia de custódia forense de cada documento baixado</span>
            </div>
            <div className="flex gap-2">
              <span style={{ color: '#00A3C4' }}>✓</span>
              <span>Conformidade ISO/IEC 27037 e LGPD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncJudicial;
