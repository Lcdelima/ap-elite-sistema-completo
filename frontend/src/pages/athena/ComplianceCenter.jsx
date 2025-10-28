import React, { useState, useEffect } from 'react';
import { Shield, Lock, FileCheck, UserCheck, AlertCircle, Check } from 'lucide-react';

const ComplianceCenter = () => {
  const [text, setText] = useState('');
  const [anonymized, setAnonymized] = useState('');
  const [stats, setStats] = useState(null);
  const [userId, setUserId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [dataTypes, setDataTypes] = useState([]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/compliance/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const anonymizeData = async () => {
    if (!text) return;

    try {
      const response = await fetch(`${backendUrl}/api/compliance/anonymize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          anonymize_names: true,
          anonymize_cpf: true,
          anonymize_emails: true,
          anonymize_phones: true
        })
      });

      const data = await response.json();
      setAnonymized(data.anonymized);
    } catch (error) {
      console.error('Erro na anonimização:', error);
    }
  };

  const registerConsent = async () => {
    if (!userId || !purpose) return;

    try {
      const response = await fetch(`${backendUrl}/api/compliance/consent/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          purpose: purpose,
          data_types: dataTypes,
          retention_period: '1 year'
        })
      });

      if (response.ok) {
        alert('✅ Consentimento registrado conforme LGPD!');
        setUserId('');
        setPurpose('');
        setDataTypes([]);
        loadStats();
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-teal-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10" />
            Compliance Center - LGPD
          </h1>
          <p className="text-green-200">Gestão de consentimentos e proteção de dados pessoais</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <UserCheck className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_consents}</p>
              <p className="text-gray-300 text-sm">Consentimentos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Check className="w-8 h-8 text-teal-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.active_consents}</p>
              <p className="text-gray-300 text-sm">Ativos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <FileCheck className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_dpias}</p>
              <p className="text-gray-300 text-sm">DPIAs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Shield className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.compliance_level}</p>
              <p className="text-gray-300 text-sm">Nível Compliance</p>
            </div>
          </div>
        )}

        {/* Anonymization */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6" />
            Anonimização de Dados
          </h2>
          <div className="space-y-4">
            <textarea value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Cole o texto com dados pessoais..."
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 h-32" />
            <button onClick={anonymizeData} disabled={!text}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 disabled:opacity-50 font-semibold">
              Anonimizar Dados
            </button>
            {anonymized && (
              <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Resultado Anonimizado</h3>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{anonymized}</p>
              </div>
            )}
          </div>
        </div>

        {/* Consent Registration */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Registrar Consentimento LGPD</h2>
          <div className="space-y-4">
            <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)}
              placeholder="ID do Usuário"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400" />
            <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)}
              placeholder="Finalidade do tratamento"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400" />
            <button onClick={registerConsent} disabled={!userId || !purpose}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 font-semibold">
              Registrar Consentimento
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Funcionalidades LGPD</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.features?.map((feature, idx) => (
              <div key={idx} className="bg-white/5 border border-white/20 rounded-lg p-4 flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceCenter;