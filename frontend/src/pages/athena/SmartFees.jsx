import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, Split, FileText, TrendingUp, Download } from 'lucide-react';

const SmartFees = () => {
  const [caseType, setCaseType] = useState('criminal_defense');
  const [complexity, setComplexity] = useState('medium');
  const [hours, setHours] = useState(40);
  const [hourlyRate, setHourlyRate] = useState(250);
  const [successFee, setSuccessFee] = useState(0);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [forecast, setForecast] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    loadStats();
    loadForecast();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/fees/statistics`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadForecast = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/fees/forecast?months=6`);
      const data = await response.json();
      setForecast(data);
    } catch (error) {
      console.error('Erro ao carregar previsão:', error);
    }
  };

  const calculateFee = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/fees/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: 'CASE_' + Date.now(),
          case_type: caseType,
          complexity: complexity,
          estimated_hours: parseFloat(hours),
          hourly_rate: parseFloat(hourlyRate),
          success_fee: parseFloat(successFee) || null
        })
      });

      const data = await response.json();
      setResult(data);
      loadStats();
    } catch (error) {
      console.error('Erro ao calcular:', error);
    }
  };

  const caseTypes = {
    criminal_defense: 'Defesa Criminal',
    digital_forensics: 'Perícia Digital',
    osint_investigation: 'Investigação OSINT',
    litigation: 'Litigação'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <DollarSign className="w-10 h-10" />
            Gestão Inteligente de Honorários
          </h1>
          <p className="text-green-200">Cálculo automático, split e previsão financeira</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <Calculator className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_calculations}</p>
              <p className="text-gray-300 text-sm">Cálculos Realizados</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <FileText className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white text-2xl font-bold">{stats.total_invoices}</p>
              <p className="text-gray-300 text-sm">Notas Fiscais</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-white text-2xl font-bold">R$ {forecast?.total_forecast?.toLocaleString('pt-BR') || '0'}</p>
              <p className="text-gray-300 text-sm">Previsão 6 Meses</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6" />
              Calculadora de Honorários
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-green-200 mb-2">Tipo de Caso</label>
                <select value={caseType} onChange={(e) => setCaseType(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white">
                  {Object.entries(caseTypes).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-200 mb-2">Complexidade</label>
                <select value={complexity} onChange={(e) => setComplexity(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white">
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-200 mb-2">Horas Estimadas</label>
                <input type="number" value={hours} onChange={(e) => setHours(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-200 mb-2">Valor Hora (R$)</label>
                <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-200 mb-2">Taxa de Êxito (R$) - Opcional</label>
                <input type="number" value={successFee} onChange={(e) => setSuccessFee(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
                />
              </div>

              <button onClick={calculateFee}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-semibold">
                <Calculator className="w-5 h-5 inline mr-2" />
                Calcular Honorário
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-6">
            {result && (
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
                <h2 className="text-2xl font-bold text-white mb-6">Resultado do Cálculo</h2>

                <div className="bg-white/10 rounded-lg p-6 mb-6">
                  <p className="text-green-200 text-sm mb-2">Total de Honorários</p>
                  <p className="text-white text-4xl font-bold">R$ {result.total_fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Honorário Base</span>
                    <span className="text-white font-semibold">R$ {result.breakdown.base.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Componente por Hora</span>
                    <span className="text-white font-semibold">R$ {result.breakdown.hourly.toLocaleString('pt-BR')}</span>
                  </div>
                  {result.breakdown.success > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Taxa de Êxito</span>
                      <span className="text-white font-semibold">R$ {result.breakdown.success.toLocaleString('pt-BR')}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/20 pt-4">
                  <h3 className="text-white font-semibold mb-3">Parcelas Sugeridas</h3>
                  {result.installments.map((inst, idx) => (
                    <div key={idx} className="flex justify-between py-2">
                      <span className="text-gray-300">{inst.number}ª Parcela - {inst.due}</span>
                      <span className="text-white font-semibold">R$ {inst.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {forecast && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Previsão de Receita
                </h3>
                <div className="space-y-2">
                  {forecast.monthly_forecast.map((month) => (
                    <div key={month.month} className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-gray-300">Mês {month.month}</span>
                      <span className="text-white font-semibold">R$ {month.forecast.toLocaleString('pt-BR')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-3 border-t-2 border-white/30 mt-2">
                    <span className="text-white font-bold">Total 6 Meses</span>
                    <span className="text-green-400 font-bold text-lg">R$ {forecast.total_forecast.toLocaleString('pt-BR')}</span>
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

export default SmartFees;