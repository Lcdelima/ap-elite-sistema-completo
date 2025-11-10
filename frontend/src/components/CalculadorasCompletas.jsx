import React, { useState } from 'react';
import { toast } from 'sonner';

// ==================== COMPONENTE PENA INPUT UNIVERSAL ====================
export const PenaUniversal = ({ label, valorMeses, onChange }) => {
  const [unidade, setUnidade] = useState('meses');
  const [valor, setValor] = useState(valorMeses || 0);

  const handleChange = (v, u) => {
    setValor(v);
    let meses = 0;
    if (u === 'dias') meses = v / 30;
    else if (u === 'meses') meses = v;
    else if (u === 'anos') meses = v * 12;
    onChange(meses);
  };

  const meses = unidade === 'dias' ? valor / 30 : unidade === 'anos' ? valor * 12 : valor;

  return (
    <div>
      <label className="block text-sm font-bold text-gray-300 mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          step="any"
          value={valor}
          onChange={(e) => handleChange(parseFloat(e.target.value) || 0, unidade)}
          className="flex-1 bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-bold"
        />
        <select
          value={unidade}
          onChange={(e) => {
            setUnidade(e.target.value);
            handleChange(valor, e.target.value);
          }}
          className="bg-purple-600 border-2 border-purple-500 rounded-lg px-4 py-3 text-white font-bold"
        >
          <option value="dias">Dias</option>
          <option value="meses">Meses</option>
          <option value="anos">Anos</option>
        </select>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs font-bold">
        <div className="bg-cyan-500/20 border border-cyan-500 rounded px-2 py-1 text-center">
          <span className="text-cyan-400">{(meses * 30).toFixed(0)}</span> <span className="text-gray-400">dias</span>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded px-2 py-1 text-center">
          <span className="text-blue-400">{meses.toFixed(2)}</span> <span className="text-gray-400">meses</span>
        </div>
        <div className="bg-purple-500/20 border border-purple-500 rounded px-2 py-1 text-center">
          <span className="text-purple-400">{(meses / 12).toFixed(2)}</span> <span className="text-gray-400">anos</span>
        </div>
      </div>
    </div>
  );
};

// ==================== PRESCRIÇÃO PENAL COMPLETA ====================
export const PrescricaoPenalCompleta = ({ onCalcular, loading }) => {
  const [crimes, setCrimes] = useState([{ id: 1, penaMaxima: 96, dataFato: '2020-01-01', marcosInterruptivos: [], tipo: '' }]);
  const [crimeAtivo, setCrimeAtivo] = useState(1);

  const adicionarCrime = () => {
    const novoId = Math.max(...crimes.map(c => c.id)) + 1;
    setCrimes([...crimes, { id: novoId, penaMaxima: 96, dataFato: '2020-01-01', marcosInterruptivos: [], tipo: '' }]);
    setCrimeAtivo(novoId);
    toast.success(`Crime ${novoId} adicionado`);
  };

  const crimeAtual = crimes.find(c => c.id === crimeAtivo);

  return (
    <div className="space-y-6">
      {/* Gestão de Crimes */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-blue-400">📚 Crimes para Verificar Prescrição ({crimes.length})</h3>
          <button onClick={adicionarCrime} className="px-4 py-2 bg-green-600/30 border-2 border-green-600 text-green-400 rounded-lg font-bold">
            ➕ Adicionar Crime
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {crimes.map((c) => (
            <button
              key={c.id}
              onClick={() => setCrimeAtivo(c.id)}
              className={`px-6 py-3 rounded-xl font-bold ${
                crimeAtivo === c.id ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Crime {c.id} {c.tipo && `- ${c.tipo}`}
              {crimes.length > 1 && c.id !== 1 && (
                <button onClick={(e) => { e.stopPropagation(); setCrimes(crimes.filter(cr => cr.id !== c.id)); }} className="ml-2 text-red-400">×</button>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Formulário do Crime Ativo */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-blue-400 mb-4">📅 Crime {crimeAtivo} - Prescrição Penal (art. 109 CP)</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Tipo Penal</label>
            <input
              type="text"
              value={crimeAtual?.tipo || ''}
              onChange={(e) => {
                setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, tipo: e.target.value} : c));
              }}
              placeholder="Ex: Roubo majorado, Homicídio qualificado"
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <PenaUniversal
            label="Pena Máxima em Abstrato"
            valorMeses={crimeAtual?.penaMaxima || 96}
            onChange={(meses) => {
              setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, penaMaxima: meses} : c));
            }}
          />

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Data do Fato</label>
            <input
              type="date"
              value={crimeAtual?.dataFato || '2020-01-01'}
              onChange={(e) => {
                setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, dataFato: e.target.value} : c));
              }}
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </div>

          {/* Marcos Interruptivos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-gray-300">Marcos Interruptivos</label>
              <button
                onClick={() => {
                  const novosMarcos = [...(crimeAtual?.marcosInterruptivos || []), new Date().toISOString().split('T')[0]];
                  setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, marcosInterruptivos: novosMarcos} : c));
                }}
                className="px-3 py-1 bg-blue-600/20 border border-blue-600 text-blue-400 rounded text-xs"
              >
                + Adicionar Marco
              </button>
            </div>
            {(crimeAtual?.marcosInterruptivos || []).map((marco, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={marco}
                  onChange={(e) => {
                    const novosMarcos = [...crimeAtual.marcosInterruptivos];
                    novosMarcos[idx] = e.target.value;
                    setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, marcosInterruptivos: novosMarcos} : c));
                  }}
                  className="flex-1 bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-white"
                />
                <button
                  onClick={() => {
                    const novosMarcos = crimeAtual.marcosInterruptivos.filter((_, i) => i !== idx);
                    setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, marcosInterruptivos: novosMarcos} : c));
                  }}
                  className="px-3 text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => onCalcular('/criminal/prescricao', {
            pena_maxima_anos: Math.round(crimeAtual.penaMaxima / 12),
            data_fato: crimeAtual.dataFato + 'T00:00:00Z',
            marcos_interruptivos: (crimeAtual.marcosInterruptivos || []).map(m => m + 'T00:00:00Z')
          })}
          disabled={loading}
          className="w-full mt-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl rounded-xl"
        >
          {loading ? 'Calculando...' : `📅 CALCULAR PRESCRIÇÃO - Crime ${crimeAtivo}`}
        </button>
      </div>

      {/* Resumo de Todos os Crimes */}
      {crimes.length > 1 && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
          <h4 className="text-lg font-bold text-gray-300 mb-3">📋 Resumo de Todos os Crimes</h4>
          <div className="grid gap-2">
            {crimes.map(c => (
              <div key={c.id} className="bg-gray-800/50 rounded p-3 flex justify-between items-center">
                <div>
                  <span className="text-white font-bold">Crime {c.id}</span>
                  {c.tipo && <span className="text-gray-400 ml-2">- {c.tipo}</span>}
                </div>
                <div className="text-gray-400 text-sm">
                  Pena máx: {(c.penaMaxima / 12).toFixed(2)} anos
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default { PenaUniversal, PrescricaoPenalCompleta };
