import React, { useState } from 'react';
import { toast } from 'sonner';

// ==================== COMPONENTE UNIVERSAL DE PENA ====================

export const PenaInputCompleto = ({ label, valorMeses, onChange, className = "" }) => {
  const [unidade, setUnidade] = useState('meses');
  const [valorDisplay, setValorDisplay] = useState(valorMeses || 0);

  const converterParaMeses = (val, unit) => {
    if (unit === 'dias') return val / 30;
    if (unit === 'meses') return val;
    if (unit === 'anos') return val * 12;
    return val;
  };

  const handleChange = (val) => {
    setValorDisplay(val);
    const meses = converterParaMeses(val, unidade);
    onChange(meses);
  };

  const handleUnidadeChange = (novaUnidade) => {
    // Converte o valor atual para a nova unidade
    const meses = converterParaMeses(valorDisplay, unidade);
    let novoValor = meses;
    if (novaUnidade === 'dias') novoValor = meses * 30;
    else if (novaUnidade === 'anos') novoValor = meses / 12;
    
    setUnidade(novaUnidade);
    setValorDisplay(parseFloat(novoValor.toFixed(2)));
  };

  const meses = converterParaMeses(valorDisplay, unidade);
  const conversoes = {
    dias: (meses * 30).toFixed(0),
    meses: meses.toFixed(2),
    anos: (meses / 12).toFixed(2)
  };

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
      <div className="flex gap-2">
        <input
          type="number"
          step="any"
          value={valorDisplay}
          onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
          className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500"
        />
        <select
          value={unidade}
          onChange={(e) => handleUnidadeChange(e.target.value)}
          className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-3 text-white font-semibold"
        >
          <option value="dias">Dias</option>
          <option value="meses">Meses</option>
          <option value="anos">Anos</option>
        </select>
      </div>
      {/* Conversões automáticas visíveis */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded px-2 py-1">
          <span className="text-gray-400">Dias:</span>
          <span className="text-cyan-400 font-mono ml-1 font-semibold">{conversoes.dias}</span>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded px-2 py-1">
          <span className="text-gray-400">Meses:</span>
          <span className="text-blue-400 font-mono ml-1 font-semibold">{conversoes.meses}</span>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded px-2 py-1">
          <span className="text-gray-400">Anos:</span>
          <span className="text-purple-400 font-mono ml-1 font-semibold">{conversoes.anos}</span>
        </div>
      </div>
    </div>
  );
};

// ==================== DOSIMETRIA DE PENA COMPLETA ====================

export const DosimetriaCompleta = ({ 
  crimes, 
  crimeAtivo, 
  setCrimeAtivo,
  adicionarCrime,
  removerCrime,
  calcularCrime,
  calcularConcurso,
  loading,
  conversor,
  converterTempo,
  resultado
}) => {
  const [dados, setDados] = useState({
    tipo_penal: '',
    minimo_meses: 48,
    maximo_meses: 120,
    vetores: {
      culpabilidade: 0, antecedentes: 0, conduta_social: 0, personalidade: 0,
      motivos: 0, circunstancias: 0, consequencias: 0, comportamento_vitima: 0
    },
    agravantes: [],
    atenuantes: [],
    majorantes: [],
    minorantes: [],
    continuidade: null,
    reincidente: false,
    tempo_cumprido: 0
  });

  const [mostrarFase2, setMostrarFase2] = useState(false);
  const [mostrarFase3, setMostrarFase3] = useState(false);

  return (
    <div className="space-y-6">
      {/* Conversor Universal */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">
          🔄 Conversor Universal de Tempo (Dias ↔ Meses ↔ Anos)
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-semibold">Dias</label>
            <input
              type="number"
              value={conversor.dias}
              onChange={(e) => converterTempo('dias', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white text-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-semibold">Meses</label>
            <input
              type="number"
              value={conversor.meses}
              onChange={(e) => converterTempo('meses', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-900/50 border border-blue-500/30 rounded-lg px-4 py-3 text-white text-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2 font-semibold">Anos</label>
            <input
              type="number"
              value={conversor.anos}
              onChange={(e) => converterTempo('anos', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-900/50 border border-purple-500/30 rounded-lg px-4 py-3 text-white text-lg font-mono"
            />
          </div>
        </div>
        
        {/* Tabela de Conversões */}
        <div className="bg-gray-900/80 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400 mb-3 font-semibold">📊 Todas as Conversões Automáticas:</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="text-cyan-400 font-bold mb-2">De Anos →</div>
              <div className="bg-cyan-500/10 rounded p-2">
                <span className="text-gray-400">Meses:</span>
                <span className="text-white font-mono ml-2 font-bold">{(conversor.anos * 12).toFixed(2)}</span>
              </div>
              <div className="bg-cyan-500/10 rounded p-2">
                <span className="text-gray-400">Dias:</span>
                <span className="text-white font-mono ml-2 font-bold">{(conversor.anos * 365).toFixed(0)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-blue-400 font-bold mb-2">De Meses →</div>
              <div className="bg-blue-500/10 rounded p-2">
                <span className="text-gray-400">Anos:</span>
                <span className="text-white font-mono ml-2 font-bold">{(conversor.meses / 12).toFixed(2)}</span>
              </div>
              <div className="bg-blue-500/10 rounded p-2">
                <span className="text-gray-400">Dias:</span>
                <span className="text-white font-mono ml-2 font-bold">{(conversor.meses * 30).toFixed(0)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-purple-400 font-bold mb-2">De Dias →</div>
              <div className="bg-purple-500/10 rounded p-2">
                <span className="text-gray-400">Meses:</span>
                <span className="text-white font-mono ml-2 font-bold">{(conversor.dias / 30).toFixed(2)}</span>
              </div>
              <div className="bg-purple-500/10 rounded p-2">
                <span className="text-gray-400">Anos:</span>
                <span className="text-white font-mono ml-2 font-bold">{(conversor.dias / 365).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gestão de Crimes Múltiplos */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-purple-400">
            📚 Gestão de Crimes - Análise Individual ({crimes.length} {crimes.length === 1 ? 'crime' : 'crimes'})
          </h3>
          <div className="flex gap-3">
            <button
              onClick={adicionarCrime}
              className="px-4 py-2 bg-green-600/30 border-2 border-green-600 text-green-400 rounded-lg font-semibold hover:bg-green-600/40 transition-all"
            >
              ➕ Adicionar Crime
            </button>
            <button
              onClick={calcularConcurso}
              disabled={crimes.filter(c => c.resultado).length < 2}
              className="px-4 py-2 bg-blue-600/30 border-2 border-blue-600 text-blue-400 rounded-lg font-semibold hover:bg-blue-600/40 disabled:opacity-50 transition-all"
            >
              ∑ Somar Todos (Concurso Material)
            </button>
          </div>
        </div>
        
        {/* Tabs de Crimes */}
        <div className="flex flex-wrap gap-3 mb-4">
          {crimes.map((crime) => (
            <div key={crime.id} className="relative">
              <button
                onClick={() => setCrimeAtivo(crime.id)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  crimeAtivo === crime.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50 scale-105'
                    : crime.resultado
                    ? 'bg-green-600/20 border-2 border-green-600 text-green-400'
                    : 'bg-gray-700/50 border-2 border-gray-600 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{crime.nome || `Crime ${crime.id}`}</span>
                  {crime.resultado && <span className="text-xl">✓</span>}
                </div>
                {crime.resultado && (
                  <div className="text-xs mt-1">
                    Pena: {crime.resultado.resumo?.pena_final_anos_meses || `${crime.resultado.pena_final_meses || 0} meses`}
                  </div>
                )}
              </button>
              {crimes.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removerCrime(crime.id);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center justify-center font-bold"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Contador */}
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <span className="text-gray-400 text-sm">Crimes calculados:</span>
          <span className="text-white font-bold text-lg ml-2">
            {crimes.filter(c => c.resultado).length} / {crimes.length}
          </span>
          {crimes.filter(c => c.resultado).length >= 2 && (
            <span className="ml-3 px-3 py-1 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-full text-xs">
              Pronto para Concurso Material ∑
            </span>
          )}
        </div>
      </div>

      {/* Informação do Crime Ativo */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-2 border-purple-500/40 rounded-xl p-5">
        <h3 className="text-2xl font-bold text-purple-400 mb-2">
          📋 {crimes.find(c => c.id === crimeAtivo)?.nome || `Crime ${crimeAtivo}`}
        </h3>
        <p className="text-gray-400">
          Análise individual completa - Método trifásico (art. 68 CP) com todas as fases, vetores e fundamentações legais
        </p>
      </div>

      {/* Tipo Penal */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo Penal</label>
        <input
          type="text"
          value={dados.tipo_penal}
          onChange={(e) => setDados({...dados, tipo_penal: e.target.value})}
          placeholder="Ex: Art. 157 §2º-A, I (Roubo majorado com arma de fogo)"
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
        />
      </div>

      {/* Pena Abstrata com PenaInput */}
      <div className="grid grid-cols-2 gap-4">
        <PenaInputCompleto
          label="Pena Mínima Abstrata"
          valorMeses={dados.minimo_meses}
          onChange={(meses) => setDados({...dados, minimo_meses: meses})}
        />
        <PenaInputCompleto
          label="Pena Máxima Abstrata"
          valorMeses={dados.maximo_meses}
          onChange={(meses) => setDados({...dados, maximo_meses: meses})}
        />
      </div>

      {/* Fase 1: Vetores do art. 59 */}
      <div className="border-2 border-cyan-500/40 rounded-xl p-5 bg-cyan-500/5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-bold text-cyan-400">📊 FASE 1: Pena-base (art. 59 CP)</h4>
          <span className="px-3 py-1 bg-cyan-600/20 border border-cyan-600 text-cyan-400 rounded-full text-xs font-semibold">
            8 Vetores Obrigatórios
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(dados.vetores).map((vetor) => (
            <div key={vetor} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
              <label className="block text-xs text-gray-400 mb-2 font-semibold capitalize">
                {vetor.replace(/_/g, ' ')}
              </label>
              <input
                type="number"
                min="-2"
                max="2"
                value={dados.vetores[vetor]}
                onChange={(e) => setDados({
                  ...dados,
                  vetores: { ...dados.vetores, [vetor]: parseInt(e.target.value) }
                })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-center text-lg font-bold"
              />
              <div className="text-xs text-center mt-1">
                {dados.vetores[vetor] > 0 && <span className="text-red-400">Desfavorável</span>}
                {dados.vetores[vetor] < 0 && <span className="text-green-400">Favorável</span>}
                {dados.vetores[vetor] === 0 && <span className="text-gray-500">Neutro</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-gray-900/50 rounded p-3">
          <p className="text-xs text-gray-400">
            <strong className="text-white">Escala:</strong> -2 (muito favorável) | -1 (favorável) | 0 (neutro) | +1 (desfavorável) | +2 (muito desfavorável)
          </p>
        </div>
      </div>

      {/* Fase 2: Atenuantes/Agravantes */}
      <div className="border-2 border-blue-500/40 rounded-xl p-5 bg-blue-500/5">
        <button
          onClick={() => setMostrarFase2(!mostrarFase2)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h4 className="text-xl font-bold text-blue-400">⚡ FASE 2: Atenuantes/Agravantes (art. 61-66 CP)</h4>
          <span className="text-2xl text-blue-400">{mostrarFase2 ? '▼' : '▶'}</span>
        </button>
        
        {mostrarFase2 && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="text-green-400 font-semibold mb-3 text-sm">✅ ATENUANTES (Reduzem a pena)</h5>
              <div className="space-y-2">
                {['confissao', 'menoridade_relativa', 'reparacao_dano', 'coacao_resistivel', 'sob_influencia_emocao', 'arrependimento_posterior'].map(at => (
                  <label key={at} className="flex items-center space-x-3 p-2 bg-gray-900/50 rounded hover:bg-gray-900/70">
                    <input
                      type="checkbox"
                      checked={dados.atenuantes.includes(at)}
                      onChange={(e) => {
                        const novo = e.target.checked 
                          ? [...dados.atenuantes, at]
                          : dados.atenuantes.filter(a => a !== at);
                        setDados({ ...dados, atenuantes: novo });
                      }}
                      className="w-5 h-5 rounded border-gray-600"
                    />
                    <span className="text-gray-300 capitalize">{at.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-red-400 font-semibold mb-3 text-sm">⚠️ AGRAVANTES (Aumentam a pena)</h5>
              <div className="space-y-2">
                {['reincidencia', 'meio_cruel', 'contra_ascendente', 'crianca_adolescente', 'traicao_emboscada', 'recurso_dificulta_defesa'].map(ag => (
                  <label key={ag} className="flex items-center space-x-3 p-2 bg-gray-900/50 rounded hover:bg-gray-900/70">
                    <input
                      type="checkbox"
                      checked={dados.agravantes.includes(ag)}
                      onChange={(e) => {
                        const novo = e.target.checked
                          ? [...dados.agravantes, ag]
                          : dados.agravantes.filter(a => a !== ag);
                        setDados({ ...dados, agravantes: novo });
                      }}
                      className="w-5 h-5 rounded border-gray-600"
                    />
                    <span className="text-gray-300 capitalize">{ag.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fase 3: Majorantes/Minorantes */}
      <div className="border-2 border-purple-500/40 rounded-xl p-5 bg-purple-500/5">
        <button
          onClick={() => setMostrarFase3(!mostrarFase3)}
          className="w-full flex items-center justify-between mb-4"
        >
          <h4 className="text-xl font-bold text-purple-400">🔺 FASE 3: Majorantes e Minorantes</h4>
          <span className="text-2xl text-purple-400">{mostrarFase3 ? '▼' : '▶'}</span>
        </button>
        
        {mostrarFase3 && (
          <div className="grid grid-cols-2 gap-6">
            {/* Majorantes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-red-400 font-semibold text-sm">🔺 MAJORANTES (Causas de aumento)</h5>
                <button
                  onClick={() => setDados({
                    ...dados,
                    majorantes: [...dados.majorantes, { nome: '', fracao: 0.2 }]
                  })}
                  className="px-2 py-1 bg-red-600/20 border border-red-600 text-red-400 rounded text-xs"
                >
                  + Adicionar
                </button>
              </div>
              {dados.majorantes.map((maj, idx) => (
                <div key={idx} className="flex gap-2 mb-3 bg-gray-900/50 p-3 rounded">
                  <input
                    type="text"
                    value={maj.nome}
                    onChange={(e) => {
                      const novo = [...dados.majorantes];
                      novo[idx].nome = e.target.value;
                      setDados({ ...dados, majorantes: novo });
                    }}
                    placeholder="Ex: arma_de_fogo"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={maj.fracao}
                    onChange={(e) => {
                      const novo = [...dados.majorantes];
                      novo[idx].fracao = parseFloat(e.target.value);
                      setDados({ ...dados, majorantes: novo });
                    }}
                    className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white text-center font-mono"
                  />
                  <button
                    onClick={() => setDados({
                      ...dados,
                      majorantes: dados.majorantes.filter((_, i) => i !== idx)
                    })}
                    className="px-3 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Minorantes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-green-400 font-semibold text-sm">🔻 MINORANTES (Causas de diminuição)</h5>
                <button
                  onClick={() => setDados({
                    ...dados,
                    minorantes: [...dados.minorantes, { nome: '', fracao: 0.333 }]
                  })}
                  className="px-2 py-1 bg-green-600/20 border border-green-600 text-green-400 rounded text-xs"
                >
                  + Adicionar
                </button>
              </div>
              {dados.minorantes.map((min, idx) => (
                <div key={idx} className="flex gap-2 mb-3 bg-gray-900/50 p-3 rounded">
                  <input
                    type="text"
                    value={min.nome}
                    onChange={(e) => {
                      const novo = [...dados.minorantes];
                      novo[idx].nome = e.target.value;
                      setDados({ ...dados, minorantes: novo });
                    }}
                    placeholder="Ex: tentativa"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    max="1"
                    value={min.fracao}
                    onChange={(e) => {
                      const novo = [...dados.minorantes];
                      novo[idx].fracao = parseFloat(e.target.value);
                      setDados({ ...dados, minorantes: novo });
                    }}
                    className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-2 text-white text-center font-mono"
                  />
                  <button
                    onClick={() => setDados({
                      ...dados,
                      minorantes: dados.minorantes.filter((_, i) => i !== idx)
                    })}
                    className="px-3 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botão Calcular Crime Atual */}
      <button
        onClick={() => calcularCrime(dados)}
        disabled={loading}
        className="w-full py-5 bg-gradient-to-r from-purple-500 via-blue-600 to-cyan-500 text-white font-bold text-xl rounded-xl hover:from-purple-600 hover:via-blue-700 hover:to-cyan-600 disabled:opacity-50 shadow-2xl shadow-purple-500/30 transition-all"
      >
        {loading ? '⚙️ Calculando...' : `⚖️ CALCULAR ${crimes.find(c => c.id === crimeAtivo)?.nome || 'CRIME ' + crimeAtivo}`}
      </button>
    </div>
  );
};

export default { PenaInputCompleto, DosimetriaCompleta };
