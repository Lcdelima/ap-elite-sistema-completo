import React, { useState } from 'react';

// Componente de Input de Pena com conversão automática
export const PenaInput = ({ label, value, onChange, id }) => {
  const [unidade, setUnidade] = useState('meses');
  const [valorDisplay, setValorDisplay] = useState(value || 0);

  const handleChange = (val, unit) => {
    setValorDisplay(val);
    // Sempre converte para meses (padrão do backend)
    let meses = 0;
    if (unit === 'dias') meses = val / 30;
    else if (unit === 'meses') meses = val;
    else if (unit === 'anos') meses = val * 12;
    
    onChange(meses);
  };

  const getConversoes = () => {
    let meses = 0;
    if (unidade === 'dias') meses = valorDisplay / 30;
    else if (unidade === 'meses') meses = valorDisplay;
    else if (unidade === 'anos') meses = valorDisplay * 12;

    return {
      dias: (meses * 30).toFixed(0),
      meses: meses.toFixed(2),
      anos: (meses / 12).toFixed(2)
    };
  };

  const conv = getConversoes();

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={valorDisplay}
          onChange={(e) => handleChange(parseFloat(e.target.value) || 0, unidade)}
          className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
        />
        <select
          value={unidade}
          onChange={(e) => {
            setUnidade(e.target.value);
            handleChange(valorDisplay, e.target.value);
          }}
          className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
        >
          <option value="dias">Dias</option>
          <option value="meses">Meses</option>
          <option value="anos">Anos</option>
        </select>
      </div>
      <div className="text-xs text-gray-500 mt-1 grid grid-cols-3 gap-2">
        <span>= {conv.dias} dias</span>
        <span>= {conv.meses} meses</span>
        <span>= {conv.anos} anos</span>
      </div>
    </div>
  );
};

// Formulário de Dosimetria com suporte a múltiplos crimes
export const FormDosimetriaMultipla = ({ 
  crimes, 
  crimeAtivo, 
  setCrimeAtivo,
  adicionarCrime,
  removerCrime,
  calcularCrime,
  calcularConcurso,
  dosimetria,
  setDosimetria,
  loading,
  conversor,
  converterTempo
}) => {
  
  return (
    <div className="space-y-6">
      {/* Conversor Universal */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">
          🔄 Conversor Universal de Tempo
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Dias</label>
            <input
              type="number"
              value={conversor.dias}
              onChange={(e) => converterTempo('dias', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Meses</label>
            <input
              type="number"
              value={conversor.meses}
              onChange={(e) => converterTempo('meses', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Anos</label>
            <input
              type="number"
              value={conversor.anos}
              onChange={(e) => converterTempo('anos', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-white"
            />
          </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-2 font-semibold">📊 Todas as Conversões:</div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-cyan-400 font-semibold mb-1">Anos →</div>
              <div className="text-gray-300">Meses: <span className="text-white font-mono">{(conversor.anos * 12).toFixed(2)}</span></div>
              <div className="text-gray-300">Dias: <span className="text-white font-mono">{(conversor.anos * 365).toFixed(0)}</span></div>
            </div>
            <div>
              <div className="text-blue-400 font-semibold mb-1">Meses →</div>
              <div className="text-gray-300">Anos: <span className="text-white font-mono">{(conversor.meses / 12).toFixed(2)}</span></div>
              <div className="text-gray-300">Dias: <span className="text-white font-mono">{(conversor.meses * 30).toFixed(0)}</span></div>
            </div>
            <div>
              <div className="text-purple-400 font-semibold mb-1">Dias →</div>
              <div className="text-gray-300">Meses: <span className="text-white font-mono">{(conversor.dias / 30).toFixed(2)}</span></div>
              <div className="text-gray-300">Anos: <span className="text-white font-mono">{(conversor.dias / 365).toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Gestão de Crimes */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-purple-400">
            📚 Crimes ({crimes.length}) - Análise Individual
          </h3>
          <div className="flex gap-2">
            <button
              onClick={adicionarCrime}
              className="px-3 py-1 bg-green-600/20 border border-green-600 text-green-400 rounded-lg text-sm hover:bg-green-600/30"
            >
              ➕ Adicionar Crime
            </button>
            <button
              onClick={calcularConcurso}
              disabled={crimes.filter(c => c.resultado).length < 2}
              className="px-3 py-1 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 disabled:opacity-50"
            >
              ∑ Somar (Concurso Material)
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {crimes.map((crime) => (
            <button
              key={crime.id}
              onClick={() => {
                setCrimeAtivo(crime.id);
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                crimeAtivo === crime.id
                  ? 'bg-purple-600 text-white'
                  : crime.resultado
                  ? 'bg-green-600/20 border border-green-600 text-green-400'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {crime.nome || `Crime ${crime.id}`}
              {crime.resultado && ' ✓'}
              {crimes.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removerCrime(crime.id);
                  }}
                  className="ml-2 text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              )}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          ✓ Crimes calculados: {crimes.filter(c => c.resultado).length} / {crimes.length}
        </div>
      </div>

      {/* Informações do Crime Ativo */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-400 mb-2">
          📋 {crimes.find(c => c.id === crimeAtivo)?.nome || `Crime ${crimeAtivo}`}
        </h3>
        <p className="text-gray-400 text-sm">
          Análise individual - Método trifásico (art. 68 CP)
        </p>
      </div>

      {/* Resto do formulário de dosimetria... */}
    </div>
  );
};

export default { PenaInput, FormDosimetriaMultipla };
