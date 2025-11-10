// Formulários adicionais para calculadoras
// Este arquivo será importado em CalculadorasCompletas.jsx

export const renderPrescricaoPenal = (setPrescricao, prescricao, calcular, loading) => (
  <div className="space-y-4">
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
      <h3 className="text-blue-400 font-semibold mb-2">📅 Prescrição da Pretensão Punitiva (art. 109 CP)</h3>
      <p className="text-gray-400 text-sm">Calcula o prazo prescricional conforme a pena máxima em abstrato</p>
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Pena Máxima (anos)</label>
      <input
        type="number"
        value={prescricao.pena_maxima_anos || 8}
        onChange={(e) => setPrescricao({...prescricao, pena_maxima_anos: parseInt(e.target.value)})}
        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Data do Fato</label>
      <input
        type="date"
        value={prescricao.data_fato || '2020-01-01'}
        onChange={(e) => setPrescricao({...prescricao, data_fato: e.target.value + 'T00:00:00Z'})}
        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
      />
    </div>

    <button
      onClick={calcular}
      disabled={loading}
      className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
    >
      {loading ? 'Calculando...' : '📅 CALCULAR PRESCRIÇÃO'}
    </button>
  </div>
);

export const renderProgressaoRegime = (setProgressao, progressao, calcular, loading) => (
  <div className="space-y-4">
    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
      <h3 className="text-green-400 font-semibold mb-2">📈 Progressão de Regime (LEP art. 112)</h3>
      <p className="text-gray-400 text-sm">Calcula tempo necessário para progressão (1/6, 2/5 ou 3/5)</p>
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Pena Total (meses)</label>
      <input
        type="number"
        value={progressao.pena_total_meses || 120}
        onChange={(e) => setProgressao({...progressao, pena_total_meses: parseInt(e.target.value)})}
        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Regime Inicial</label>
      <select
        value={progressao.regime_inicial || 'fechado'}
        onChange={(e) => setProgressao({...progressao, regime_inicial: e.target.value})}
        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
      >
        <option value="fechado">Fechado</option>
        <option value="semiaberto">Semiaberto</option>
        <option value="aberto">Aberto</option>
      </select>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={progressao.reincidente || false}
          onChange={(e) => setProgressao({...progressao, reincidente: e.target.checked})}
          className="rounded border-gray-700 bg-gray-800"
        />
        <span className="text-gray-300">Reincidente (3/5)</span>
      </label>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={progressao.bom_comportamento !== false}
          onChange={(e) => setProgressao({...progressao, bom_comportamento: e.target.checked})}
          className="rounded border-gray-700 bg-gray-800"
        />
        <span className="text-gray-300">Bom Comportamento</span>
      </label>
    </div>

    <button
      onClick={calcular}
      disabled={loading}
      className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-teal-700 disabled:opacity-50"
    >
      {loading ? 'Calculando...' : '📈 CALCULAR PROGRESSÃO'}
    </button>
  </div>
);

export const renderHorasExtras = (setHoras, horas, calcular, loading) => (
  <div className="space-y-4">
    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
      <h3 className="text-green-400 font-semibold mb-2">⏰ Horas Extras e Reflexos (CLT art. 59)</h3>
      <p className="text-gray-400 text-sm">Calcula horas extras com reflexos em 13º, férias e FGTS</p>
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Salário Mensal (R$)</label>
      <input
        type="number"
        value={horas.salario_mensal || 3000}
        onChange={(e) => setHoras({...horas, salario_mensal: parseFloat(e.target.value)})}
        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Horas Extras por Mês</label>
      <input
        type="number"
        value={horas.horas_mensais || 20}
        onChange={(e) => setHoras({...horas, horas_mensais: parseInt(e.target.value)})}
        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Percentual Extra</label>
      <select
        value={horas.percentual_extra || 50}
        onChange={(e) => setHoras({...horas, percentual_extra: parseInt(e.target.value)})}
        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
      >
        <option value="50">50% (dias úteis)</option>
        <option value="100">100% (domingos e feriados)</option>
      </select>
    </div>

    <button
      onClick={calcular}
      disabled={loading}
      className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
    >
      {loading ? 'Calculando...' : '⏰ CALCULAR HORAS EXTRAS'}
    </button>
  </div>
);

export const renderCorrecaoMonetaria = (setCorrecao, correcao, calcular, loading) => (
  <div className="space-y-4">
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
      <h3 className="text-yellow-400 font-semibold mb-2">💰 Correção Monetária (art. 389 CC)</h3>
      <p className="text-gray-400 text-sm">Atualiza valores por IPCA, INPC, IGPM ou SELIC</p>
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Valor Principal (R$)</label>
      <input
        type="number"
        step="0.01"
        value={correcao.valor_principal || 10000}
        onChange={(e) => setCorrecao({...correcao, valor_principal: parseFloat(e.target.value)})}
        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Data Inicial</label>
        <input
          type="date"
          value={correcao.data_inicial || '2020-01-01'}
          onChange={(e) => setCorrecao({...correcao, data_inicial: e.target.value})}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Data Final</label>
        <input
          type="date"
          value={correcao.data_final || new Date().toISOString().split('T')[0]}
          onChange={(e) => setCorrecao({...correcao, data_final: e.target.value})}
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">Índice</label>
      <select
        value={correcao.indice || 'INPC'}
        onChange={(e) => setCorrecao({...correcao, indice: e.target.value})}
        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white"
      >
        <option value="INPC">INPC</option>
        <option value="IPCA">IPCA</option>
        <option value="IGPM">IGP-M</option>
        <option value="SELIC">SELIC</option>
      </select>
    </div>

    <button
      onClick={calcular}
      disabled={loading}
      className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-700 disabled:opacity-50"
    >
      {loading ? 'Calculando...' : '💰 CALCULAR CORREÇÃO'}
    </button>
  </div>
);

export const renderResultadoGenerico = (result) => {
  if (!result) return null;

  return (
    <div className="mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
      <h3 className="text-xl font-bold text-green-400 mb-4">✅ Resultado</h3>
      <div className="bg-gray-900/50 rounded-lg p-4">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
};
