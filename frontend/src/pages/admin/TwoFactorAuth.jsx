import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/elite-forensic.css';

const TwoFactorAuth = () => {
  const [step, setStep] = useState(1); // 1: enable, 2: verify
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);

  const enable2FA = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'test-user';
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/2fa/enable`,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );

      setQrCode(response.data.qr_code);
      setSecret(response.data.secret);
      setStep(2);
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    }
  };

  const verifyAndActivate = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'test-user';
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/2fa/verify-and-enable`,
        { user_id: userId, token },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );

      // Gerar códigos de backup
      const backupResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/2fa/backup-codes/${userId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );

      setBackupCodes(backupResponse.data.backup_codes);
      setStep(3);
      alert('✅ 2FA ativado com sucesso!');
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
            Autenticação de <span style={{ color: '#00A3C4' }}>Dois Fatores</span> 🔐
          </h1>
          <p className="subtitle text-sm mt-2" style={{ color: 'rgba(228,230,235,0.6)' }}>
            Proteja sua conta com Google Authenticator ou Authy
          </p>
        </div>

        <div className="cipher-glass p-8">
          {/* Step 1: Habilitar */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-title font-bold" style={{ color: '#E4E6EB' }}>
                Habilitar 2FA
              </h2>
              <p className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>
                Adicione uma camada extra de segurança à sua conta
              </p>
              <button onClick={enable2FA} className="btn-elite btn-elite-primary">
                🚀 Começar Configuração
              </button>
            </div>
          )}

          {/* Step 2: Escanear QR e Verificar */}
          {step === 2 && qrCode && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-title font-bold mb-4" style={{ color: '#E4E6EB' }}>
                  Escaneie o QR Code
                </h2>
                <div className="inline-block p-4 rounded-lg" style={{ background: '#fff' }}>
                  <img src={qrCode} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                </div>
                
                <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(0,163,196,0.1)' }}>
                  <div className="text-xs mb-1" style={{ color: '#00A3C4' }}>Secret Key (manual):</div>
                  <div className="font-mono text-sm" style={{ color: '#E4E6EB' }}>{secret}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#E4E6EB' }}>
                  Digite o código de 6 dígitos
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="input-elite text-center text-2xl font-mono"
                  placeholder="000000"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <button 
                onClick={verifyAndActivate}
                disabled={token.length !== 6}
                className="btn-elite btn-elite-primary w-full"
              >
                ✔️ Verificar e Ativar
              </button>
            </div>
          )}

          {/* Step 3: Códigos de Backup */}
          {step === 3 && backupCodes.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-title font-bold mb-2" style={{ color: '#27AE60' }}>
                  2FA Ativado!
                </h2>
                <p className="text-sm" style={{ color: 'rgba(228,230,235,0.7)' }}>
                  Sua conta agora está protegida com autenticação de dois fatores
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-3" style={{ color: '#E67E22' }}>
                  ⚠️ Códigos de Backup (Guarde em Local Seguro)
                </h3>
                <div className="grid grid-cols-2 gap-2 p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="font-mono text-sm p-2 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#00A3C4' }}>
                      {code}
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: 'rgba(228,230,235,0.5)' }}>
                  Use estes códigos caso perca acesso ao autenticador
                </p>
              </div>

              <button className="btn-elite btn-elite-primary w-full">
                ✔️ Concluído
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
