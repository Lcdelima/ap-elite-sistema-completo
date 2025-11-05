import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const ForensicToolsHub = () => {
  const [availableTools, setAvailableTools] = useState(null);
  const [activeTab, setActiveTab] = useState('mobile');
  const [extractionStatus, setExtractionStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkTools();
  }, []);

  const checkTools = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/forensic-tools/available`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setAvailableTools(response.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const startMobileExtraction = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/forensic-tools/extract-device`,
        {
          device_path: '/dev/android',
          device_type: 'android',
          output_name: `extraction_${Date.now()}`,
          tool: 'auto'
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      
      setExtractionStatus(response.data);
      
      if (response.data.status === 'started') {
        alert('✅ Extração iniciada! Acompanhe o progresso.');
      } else {
        alert(`⚠️ ${response.data.message}`);
      }
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const startDiskImaging = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/forensic-tools/create-disk-image`,
        {
          source_drive: '/dev/sda',
          image_name: `disk_image_${Date.now()}`,
          format: 'E01'
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      
      setExtractionStatus(response.data);
      alert(response.data.message || '✅ Imaging iniciado');
    } catch (error) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            Forensic <span style={{ color: '#00A3C4' }}>Tools Hub</span> 🔧
          </h1>
          <p className="subtitle text-sm mt-2" style={{ color: 'rgba(228,230,235,0.6)' }}>
            Central de ferramentas forenses especializadas
          </p>
        </div>

        {/* Tools Status */}
        {availableTools && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {Object.entries(availableTools.available_tools).map(([tool, available]) => (
              <div key={tool} className="cipher-glass p-6 text-center">
                <div className="text-4xl mb-3">
                  {available ? '✅' : '⚠️'}
                </div>
                <div className="font-bold mb-1 capitalize" style={{ color: '#E4E6EB' }}>
                  {tool.replace('_', ' ')}
                </div>
                <div className="text-xs" style={{ color: available ? '#27AE60' : '#E67E22' }}>
                  {available ? 'Disponível' : 'Não configurado'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['mobile', 'disk', 'analysis'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg capitalize transition-all"
              style={{
                background: activeTab === tab ? '#00A3C4' : 'rgba(255,255,255,0.06)',
                color: activeTab === tab ? '#000' : '#E4E6EB',
                fontWeight: activeTab === tab ? 700 : 500
              }}
            >
              {tab === 'mobile' && '📱 Dispositivos Móveis'}
              {tab === 'disk' && '💾 Discos'}
              {tab === 'analysis' && '🔍 Análise'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Actions */}
          <div className="cipher-glass p-6">
            <h3 className="text-xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
              {activeTab === 'mobile' && 'Extração de Dispositivo Móvel'}
              {activeTab === 'disk' && 'Criação de Imagem Forense'}
              {activeTab === 'analysis' && 'Análise Forense'}
            </h3>

            {activeTab === 'mobile' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ background: 'rgba(0,163,196,0.1)', border: '1px solid rgba(0,163,196,0.3)' }}>
                  <div className="text-sm mb-2" style={{ color: '#00A3C4' }}>Ferramentas Disponíveis:</div>
                  <div className="text-xs" style={{ color: '#E4E6EB' }}>
                    {availableTools?.available_tools.cellebrite && '✅ Cellebrite Physical Analyzer'}
                    {availableTools?.available_tools.ufed && ' • UFED'}
                    {!availableTools?.available_tools.cellebrite && !availableTools?.available_tools.ufed && '⚠️ Configure Cellebrite ou UFED'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Tipo de Dispositivo
                  </label>
                  <select className="input-elite">
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                    <option value="feature_phone">Feature Phone</option>
                  </select>
                </div>

                <button
                  onClick={startMobileExtraction}
                  disabled={loading}
                  className="btn-elite btn-elite-primary w-full"
                >
                  {loading ? '🔄 Iniciando...' : '📱 Iniciar Extração'}
                </button>

                <div className="text-xs p-3 rounded" style={{ background: 'rgba(230,126,34,0.1)', color: '#E67E22' }}>
                  ⚠️ Requer dispositivo conectado fisicamente ou arquivo de backup
                </div>
              </div>
            )}

            {activeTab === 'disk' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Disco de Origem
                  </label>
                  <input type="text" className="input-elite" placeholder="/dev/sda" />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                    Formato de Imagem
                  </label>
                  <select className="input-elite">
                    <option value="E01">E01 (EnCase)</option>
                    <option value="DD">DD (Raw)</option>
                    <option value="AFF">AFF (Advanced Forensic Format)</option>
                  </select>
                </div>

                <button
                  onClick={startDiskImaging}
                  disabled={loading}
                  className="btn-elite btn-elite-primary w-full"
                >
                  {loading ? '🔄 Criando...' : '💾 Criar Imagem Forense'}
                </button>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-4">
                <div className="text-center py-8" style={{ color: 'rgba(228,230,235,0.6)' }}>
                  <div className="text-5xl mb-4">🔍</div>
                  <p>Use IPED Integration ou Autopsy para análise completa</p>
                  <div className="flex gap-3 justify-center mt-6">
                    <a href="/athena/iped" className="btn-elite btn-elite-primary text-sm">
                      IPED Integration
                    </a>
                    <button className="btn-elite btn-elite-secondary text-sm">
                      Autopsy (Manual)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="cipher-glass p-6">
            <h3 className="text-xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
              Status de Processamento
            </h3>

            {!extractionStatus ? (
              <div className="text-center py-20" style={{ color: 'rgba(228,230,235,0.6)' }}>
                <div className="text-5xl mb-4">⏳</div>
                <p>Nenhum processo ativo</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ 
                  background: extractionStatus.status === 'started' ? 'rgba(0,163,196,0.1)' : 
                              extractionStatus.status === 'not_available' ? 'rgba(230,126,34,0.1)' : 
                              'rgba(231,76,60,0.1)',
                  border: `1px solid ${
                    extractionStatus.status === 'started' ? 'rgba(0,163,196,0.3)' :
                    extractionStatus.status === 'not_available' ? 'rgba(230,126,34,0.3)' :
                    'rgba(231,76,60,0.3)'
                  }`
                }}>
                  <div className="font-bold mb-2" style={{ color: '#E4E6EB' }}>
                    Status: {extractionStatus.status.toUpperCase()}
                  </div>
                  <div className="text-sm" style={{ color: 'rgba(228,230,235,0.8)' }}>
                    {extractionStatus.message}
                  </div>
                </div>

                {extractionStatus.output_path && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span style={{ color: '#00A3C4' }}>Output: </span>
                      <span className="font-mono text-xs" style={{ color: '#E4E6EB' }}>
                        {extractionStatus.output_path}
                      </span>
                    </div>
                    {extractionStatus.started_at && (
                      <div>
                        <span style={{ color: '#00A3C4' }}>Iniciado: </span>
                        <span style={{ color: '#E4E6EB' }}>
                          {new Date(extractionStatus.started_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="cipher-glass p-6">
            <h4 className="font-bold mb-3" style={{ color: '#00A3C4' }}>📱 Cellebrite</h4>
            <p className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>
              Extração avançada de smartphones iOS/Android com desbloqueio e recuperação de dados deletados
            </p>
          </div>

          <div className="cipher-glass p-6">
            <h4 className="font-bold mb-3" style={{ color: '#00A3C4' }}>💾 FTK Imager</h4>
            <p className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>
              Criação de imagens forenses em E01/DD com verificação de integridade e suporte a RAID
            </p>
          </div>

          <div className="cipher-glass p-6">
            <h4 className="font-bold mb-3" style={{ color: '#00A3C4' }}>🔍 Autopsy</h4>
            <p className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>
              Análise completa com timeline, keyword search, file carving e hash matching
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicToolsHub;
