import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const CryptoForensics = () => {
  const [blockchain, setBlockchain] = useState('bitcoin');
  const [address, setAddress] = useState('');
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);

  const trackAddress = async () => {
    if (!address) {
      alert('Digite um endereço');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/crypto-forensics/track-address`,
        { blockchain, address, depth: 3 },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setTracking(response.data);
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            Criptoativos & <span style={{ color: '#00A3C4' }}>Blockchain</span> Analytics ₿
          </h1>
          <p className="subtitle text-sm mt-2" style={{ color: 'rgba(228,230,235,0.6)' }}>
            Rastreamento e análise forense de criptomoedas
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="cipher-glass p-6">
            <h3 className="text-xl font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>Rastrear Endereço</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>Blockchain</label>
                <select className="input-elite" value={blockchain} onChange={(e) => setBlockchain(e.target.value)}>
                  <option value="bitcoin">Bitcoin (BTC)</option>
                  <option value="ethereum">Ethereum (ETH)</option>
                  <option value="tether">Tether (USDT)</option>
                  <option value="bnb">BNB Chain</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>Endereço</label>
                <input
                  type="text"
                  className="input-elite font-mono text-sm"
                  placeholder="1A1zP1eP5QGefi2DMPTfTL..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <button onClick={trackAddress} disabled={loading} className="btn-elite btn-elite-primary w-full">
                {loading ? 'Rastreando...' : '🔍 Rastrear'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {!tracking ? (
              <div className="cipher-glass p-20 text-center" style={{ color: 'rgba(228,230,235,0.6)' }}>
                <div className="text-6xl mb-4">₿</div>
                <p>Digite um endereço e clique em "Rastrear"</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="cipher-glass p-6 text-center">
                    <div className="text-2xl font-title font-bold mb-2" style={{ color: '#00A3C4' }}>
                      {tracking.balance.current}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(228,230,235,0.7)' }}>{tracking.balance.currency}</div>
                    <div className="text-xs mt-1" style={{ color: '#27AE60' }}>$ {tracking.balance.usd_value.toLocaleString()}</div>
                  </div>
                  <div className="cipher-glass p-6 text-center">
                    <div className="text-2xl font-title font-bold mb-2" style={{ color: '#00A3C4' }}>
                      {tracking.transactions.total}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(228,230,235,0.7)' }}>Transações</div>
                  </div>
                  <div className="cipher-glass p-6 text-center">
                    <div className="text-2xl font-title font-bold mb-2" style={{ 
                      color: tracking.risk_indicators.risk_score > 50 ? '#E74C3C' : '#27AE60' 
                    }}>
                      {tracking.risk_indicators.risk_score}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(228,230,235,0.7)' }}>Risk Score</div>
                  </div>
                </div>

                <div className="cipher-glass p-6">
                  <h4 className="font-bold mb-4" style={{ color: '#E4E6EB' }}>Indicadores de Risco</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'rgba(228,230,235,0.7)' }}>Uso de Mixer:</span>
                      <span style={{ color: tracking.risk_indicators.mixer_usage ? '#E74C3C' : '#27AE60' }}>
                        {tracking.risk_indicators.mixer_usage ? '⚠️ Sim' : '✔️ Não'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'rgba(228,230,235,0.7)' }}>Conexão Darknet:</span>
                      <span style={{ color: tracking.risk_indicators.darknet_connection ? '#E74C3C' : '#27AE60' }}>
                        {tracking.risk_indicators.darknet_connection ? '⚠️ Sim' : '✔️ Não'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'rgba(228,230,235,0.7)' }}>Depósitos em Exchanges:</span>
                      <span style={{ color: '#00A3C4' }}>{tracking.risk_indicators.exchange_deposits}</span>
                    </div>
                  </div>
                </div>

                <div className="cipher-glass p-6">
                  <h4 className="font-bold mb-4" style={{ color: '#E4E6EB' }}>Endereços Conectados</h4>
                  <div className="space-y-2">
                    {tracking.connected_addresses.map((addr, idx) => (
                      <div key={idx} className="p-3 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <div className="font-mono text-xs mb-1" style={{ color: '#00A3C4' }}>
                          {addr.address}
                        </div>
                        <div className="flex justify-between text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>
                          <span>{addr.relationship}</span>
                          <span>{addr.amount} {tracking.balance.currency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoForensics;
