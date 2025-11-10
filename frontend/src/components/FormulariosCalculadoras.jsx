import React from 'react';

// ==================== PENAIS ====================

export const FormPrescricaoIntercorrente = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">⏳ Prescrição Intercorrente (art. 110 CP)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Pena Aplicada (anos)</label>
        <input type="number" defaultValue="6" id="pena_intercorrente" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Data Recebimento Denúncia</label>
        <input type="date" defaultValue="2020-01-01" id="data_rec" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Data Última Movimentação</label>
        <input type="date" defaultValue="2021-01-01" id="data_ult" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/criminal/prescricao-intercorrente', {
        pena_aplicada_anos: parseInt(document.getElementById('pena_intercorrente').value),
        data_recebimento_denuncia: document.getElementById('data_rec').value + 'T00:00:00Z',
        data_ultima_movimentacao: document.getElementById('data_ult').value + 'T00:00:00Z'
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '⏳ CALCULAR'}
      </button>
    </div>
  );
};

export const FormUnificacaoPenas = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <h3 className="text-purple-400 font-semibold mb-2">🔗 Unificação de Penas (art. 111 LEP)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Penas Anteriores (meses, separadas por vírgula)</label>
        <input type="text" placeholder="48,36,24" id="penas_ant" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Nova Pena (meses)</label>
        <input type="number" defaultValue="60" id="nova_pena" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/criminal/unificacao-penas', {
        penas_anteriores_meses: document.getElementById('penas_ant').value.split(',').map(p => parseInt(p.trim())),
        nova_pena_meses: parseInt(document.getElementById('nova_pena').value)
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '🔗 UNIFICAR PENAS'}
      </button>
    </div>
  );
};

// ==================== TRIBUTÁRIAS ====================

export const FormITCMD = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <h3 className="text-yellow-400 font-semibold mb-2">🏠 ITCMD / ITBI</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor Venal (R$)</label>
        <input type="number" step="0.01" defaultValue="500000" id="valor_venal" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Alíquota (%)</label>
        <input type="number" step="0.1" defaultValue="4" id="aliquota_itcmd" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>


export const FormLivramento = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
        <h3 className="text-cyan-400 font-semibold mb-2">🔓 Livramento Condicional (art. 83 CP)</h3>
        <p className="text-gray-400 text-sm">1/3 primário, 1/2 reincidente, 2/3 hediondo</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Pena Total (meses)</label>
        <input type="number" defaultValue="120" id="pena_livramento" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Tempo Cumprido (meses)</label>
        <input type="number" defaultValue="50" id="tempo_cumprido_livramento" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-2">
          <input type="checkbox" id="reincidente_liv" className="rounded border-gray-700 bg-gray-800" />
          <span className="text-gray-300 text-sm">Reincidente</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" id="hediondo_liv" className="rounded border-gray-700 bg-gray-800" />
          <span className="text-gray-300 text-sm">Crime Hediondo</span>
        </label>
      </div>
      <button onClick={() => onCalcular('/criminal/livramento-condicional', {
        pena_total_meses: parseInt(document.getElementById('pena_livramento').value),
        tempo_cumprido_meses: parseInt(document.getElementById('tempo_cumprido_livramento').value),
        reincidente: document.getElementById('reincidente_liv').checked,
        crime_hediondo: document.getElementById('hediondo_liv').checked
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '🔓 CALCULAR LIVRAMENTO'}
      </button>
    </div>
  );
};

export const FormHonorarios = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">⚖️ Honorários Advocatícios (CPC art. 85)</h3>
        <p className="text-gray-400 text-sm">10% a 20% conforme fase processual</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor da Causa (R$)</label>
        <input type="number" step="0.01" defaultValue="50000" id="valor_causa_hon" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Fase Processual</label>
        <select id="fase_hon" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
          <option value="conhecimento">Conhecimento (10-20%)</option>
          <option value="recursal">Recursal (15-20%)</option>
          <option value="execucao">Execução (10-20%)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Percentual (%)</label>
        <input type="number" step="0.1" defaultValue="15" id="percentual_hon" min="10" max="20" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const pct = parseFloat(document.getElementById('percentual_hon').value);
        onCalcular('/civil/honorarios-advocaticios', {
          valor_causa: parseFloat(document.getElementById('valor_causa_hon').value),
          fase_processual: document.getElementById('fase_hon').value,
          percentual_minimo: pct,
          percentual_maximo: pct,
          sucumbencia: 'total'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '⚖️ CALCULAR HONORÁRIOS'}
      </button>
    </div>
  );
};

        <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo</label>
        <select id="tipo_itcmd" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
          <option value="ITCMD">ITCMD (Herança/Doação)</option>
          <option value="ITBI">ITBI (Transmissão Imobiliária)</option>
        </select>
      </div>
      <button onClick={() => onCalcular('/tributario/itcmd-itbi', {
        valor_venal: parseFloat(document.getElementById('valor_venal').value),
        aliquota_percentual: parseFloat(document.getElementById('aliquota_itcmd').value),
        tipo: document.getElementById('tipo_itcmd').value,
        uf: 'SP'
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '🏠 CALCULAR'}
      </button>
    </div>
  );
};

export const FormDecadencia = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <h3 className="text-yellow-400 font-semibold mb-2">⏰ Decadência Tributária (CTN art. 173)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Data do Fato Gerador</label>
        <input type="date" defaultValue="2020-01-01" id="data_fg" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/tributario/decadencia', {
        data_fato_gerador: document.getElementById('data_fg').value + 'T00:00:00Z'
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '⏰ CALCULAR DECADÊNCIA'}
      </button>
    </div>
  );
};

export const FormPlanejamento = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-green-400 font-semibold mb-2">📊 Planejamento Tributário</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Faturamento Anual (R$)</label>
        <input type="number" step="0.01" defaultValue="1000000" id="faturamento" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Despesas Anuais (R$)</label>
        <input type="number" step="0.01" defaultValue="600000" id="despesas" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Funcionários</label>
        <input type="number" defaultValue="10" id="funcionarios" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/tributario/planejamento', {
        faturamento_anual: parseFloat(document.getElementById('faturamento').value),
        despesas_anuais: parseFloat(document.getElementById('despesas').value),
        funcionarios: parseInt(document.getElementById('funcionarios').value)
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '📊 CALCULAR PLANEJAMENTO'}
      </button>
    </div>
  );
};

// ==================== TRABALHISTAS ====================

export const FormRescisao = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-green-400 font-semibold mb-2">📋 Rescisão Trabalhista Completa</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Salário Mensal (R$)</label>
        <input type="number" step="0.01" defaultValue="5000" id="salario_resc" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Tempo de Serviço (meses)</label>
        <input type="number" defaultValue="36" id="tempo_servico" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/trabalhista/rescisao-completa', {
        salario_mensal: parseFloat(document.getElementById('salario_resc').value),
        tempo_servico_meses: parseInt(document.getElementById('tempo_servico').value),
        aviso_previo_indenizado: true,
        ferias_vencidas: 0,
        tipo_rescisao: 'sem_justa_causa'
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '📋 CALCULAR RESCISÃO'}
      </button>
    </div>
  );
};

export const FormDiferencaSalarial = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">💼 Diferença Salarial / Equiparação</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Salário Recebido (R$)</label>
        <input type="number" step="0.01" defaultValue="3000" id="sal_recebido" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Salário Devido (R$)</label>
        <input type="number" step="0.01" defaultValue="4500" id="sal_devido" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Meses de Diferença</label>
        <input type="number" defaultValue="24" id="meses_dif" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/trabalhista/diferenca-salarial', {
        salario_recebido: parseFloat(document.getElementById('sal_recebido').value),
        salario_devido: parseFloat(document.getElementById('sal_devido').value),
        meses_diferenca: parseInt(document.getElementById('meses_dif').value)
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '💼 CALCULAR DIFERENÇA'}
      </button>
    </div>
  );
};

export const FormPrescricaoTrabalhista = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <h3 className="text-yellow-400 font-semibold mb-2">⏱️ Prescrição Trabalhista (Bienal/Quinquenal)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Data Término do Contrato</label>
        <input type="date" defaultValue="2022-01-01" id="data_termino" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/trabalhista/prescricao-trabalhista', {
        data_termino_contrato: document.getElementById('data_termino').value + 'T00:00:00Z'
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '⏱️ CALCULAR PRESCRIÇÃO'}
      </button>
    </div>
  );
};

// ==================== FINANCEIRAS ====================

export const FormJurosCompostos = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
        <h3 className="text-teal-400 font-semibold mb-2">📈 Juros Compostos</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Capital (R$)</label>
        <input type="number" step="0.01" defaultValue="10000" id="capital" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Taxa Mensal (%)</label>
        <input type="number" step="0.01" defaultValue="1.5" id="taxa_mensal" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Período (meses)</label>
        <input type="number" defaultValue="12" id="meses_juros" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/financeiro/juros-compostos', {
        capital: parseFloat(document.getElementById('capital').value),
        taxa_mensal: parseFloat(document.getElementById('taxa_mensal').value),
        meses: parseInt(document.getElementById('meses_juros').value)
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '📈 CALCULAR JUROS'}
      </button>
    </div>
  );
};

export const FormVPVF = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
        <h3 className="text-cyan-400 font-semibold mb-2">💎 Valor Presente / Futuro</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor (R$)</label>
        <input type="number" step="0.01" defaultValue="50000" id="valor_vpvf" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Taxa Mensal (%)</label>
        <input type="number" step="0.01" defaultValue="1" id="taxa_vpvf" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Períodos (meses)</label>
        <input type="number" defaultValue="12" id="periodos_vpvf" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo</label>
        <select id="tipo_vpvf" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
          <option value="futuro">Valor Futuro</option>
          <option value="presente">Valor Presente</option>
        </select>
      </div>
      <button onClick={() => onCalcular('/financeiro/valor-presente-futuro', {
        valor: parseFloat(document.getElementById('valor_vpvf').value),
        taxa_mensal: parseFloat(document.getElementById('taxa_vpvf').value),
        periodos: parseInt(document.getElementById('periodos_vpvf').value),
        tipo: document.getElementById('tipo_vpvf').value
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '💎 CALCULAR VP/VF'}
      </button>
    </div>
  );
};

export const FormAmortizacao = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">🏦 Amortização (SAC / PRICE)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor Financiado (R$)</label>
        <input type="number" step="0.01" defaultValue="100000" id="valor_fin" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Taxa Mensal (%)</label>
        <input type="number" step="0.01" defaultValue="1.5" id="taxa_amort" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Prazo (meses)</label>
        <input type="number" defaultValue="24" id="prazo_amort" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Sistema</label>
        <select id="sistema_amort" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
          <option value="SAC">SAC (amortização constante)</option>
          <option value="PRICE">PRICE (parcela constante)</option>
        </select>
      </div>
      <button onClick={() => onCalcular('/financeiro/amortizacao-sac-price', {
        valor_financiado: parseFloat(document.getElementById('valor_fin').value),
        taxa_mensal: parseFloat(document.getElementById('taxa_amort').value),
        prazo_meses: parseInt(document.getElementById('prazo_amort').value),
        sistema: document.getElementById('sistema_amort').value
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '🏦 CALCULAR AMORTIZAÇÃO'}
      </button>
    </div>
  );
};

export const FormPayback = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <h3 className="text-purple-400 font-semibold mb-2">📊 Payback / VPL / TIR</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Investimento Inicial (R$)</label>
        <input type="number" step="0.01" defaultValue="100000" id="invest_inicial" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Fluxos de Caixa Mensais (separados por vírgula)</label>
        <input type="text" placeholder="5000,5500,6000,6500,7000" id="fluxos" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/financeiro/payback-vpn-tir', {
        investimento_inicial: parseFloat(document.getElementById('invest_inicial').value),
        fluxos_caixa_mensais: document.getElementById('fluxos').value.split(',').map(f => parseFloat(f.trim()))
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '📊 CALCULAR PAYBACK'}
      </button>
    </div>
  );


// ==================== PENAIS RESTANTES (6) ====================

export const FormDetracao = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-green-400 font-semibold mb-2">⏱️ Detração (art. 42 CP)</h3>
        <p className="text-gray-400 text-sm">Desconto do tempo de prisão provisória</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Pena Final (meses)</label>
        <input type="number" defaultValue="120" id="pena_detracao" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Tempo Já Cumprido (meses)</label>
        <input type="number" defaultValue="24" id="tempo_cumprido_det" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const pena = parseInt(document.getElementById('pena_detracao').value);
        const cumprido = parseInt(document.getElementById('tempo_cumprido_det').value);
        const resultado = {
          pena_final_meses: pena,
          tempo_cumprido_meses: cumprido,
          pena_a_executar_meses: Math.max(pena - cumprido, 0),
          pena_a_executar_anos: ((pena - cumprido) / 12).toFixed(2),
          fundamentacao: 'Art. 42 CP - Detração do tempo de prisão provisória'
        };
        onCalcular(null, resultado);
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '⏱️ CALCULAR DETRAÇÃO'}
      </button>
    </div>
  );
};

export const FormPrescricaoExecutoria = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <h3 className="text-purple-400 font-semibold mb-2">⚖️ Prescrição Executória</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Pena Aplicada (anos)</label>
        <input type="number" defaultValue="8" id="pena_exec" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Data Trânsito em Julgado</label>
        <input type="date" defaultValue="2020-01-01" id="data_transito" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/criminal/prescricao', {
        pena_maxima_anos: parseInt(document.getElementById('pena_exec').value),
        data_fato: document.getElementById('data_transito').value + 'T00:00:00Z',
        marcos_interruptivos: []
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '⚖️ CALCULAR'}
      </button>
    </div>
  );
};

export const FormComutacao = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <h3 className="text-yellow-400 font-semibold mb-2">🎗️ Comutação / Indulto</h3>
        <p className="text-gray-400 text-sm">Verificação de requisitos conforme decreto anual</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Pena Total (meses)</label>
        <input type="number" defaultValue="60" id="pena_comut" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Tempo Cumprido (meses)</label>
        <input type="number" defaultValue="40" id="tempo_comut" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center space-x-2">
          <input type="checkbox" id="bom_comp" defaultChecked className="rounded" />
          <span className="text-gray-300 text-sm">Bom Comportamento</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" id="primario" defaultChecked className="rounded" />
          <span className="text-gray-300 text-sm">Primário</span>
        </label>
      </div>
      <button onClick={() => {
        const pena = parseInt(document.getElementById('pena_comut').value);
        const cumprido = parseInt(document.getElementById('tempo_comut').value);
        const elegivel = cumprido >= (pena * 0.4) && document.getElementById('bom_comp').checked;
        onCalcular(null, {
          pena_total_meses: pena,
          tempo_cumprido_meses: cumprido,
          elegivel: elegivel,
          percentual_necessario: 40,
          status: elegivel ? 'ELEGÍVEL PARA COMUTAÇÃO' : 'NÃO ELEGÍVEL',
          fundamentacao: 'Decreto presidencial anual - Requisitos verificados'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '🎗️ VERIFICAR ELEGIBILIDADE'}
      </button>
    </div>
  );
};

export const FormPenaMulta = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <h3 className="text-red-400 font-semibold mb-2">💸 Pena de Multa (art. 49-51 CP)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Dias-Multa</label>
        <input type="number" defaultValue="100" min="10" max="360" id="dias_multa" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor do Dia-Multa (R$)</label>
        <input type="number" step="0.01" defaultValue="50" id="valor_dia_multa" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const dias = parseInt(document.getElementById('dias_multa').value);
        const valor = parseFloat(document.getElementById('valor_dia_multa').value);
        onCalcular(null, {
          dias_multa: dias,
          valor_dia: valor,
          total: dias * valor,
          fundamentacao: 'Art. 49-51 CP - Pena de multa'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '💸 CALCULAR MULTA'}
      </button>
    </div>
  );
};

export const FormConversaoPena = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
        <h3 className="text-cyan-400 font-semibold mb-2">🔄 Conversão/Substituição (art. 44 CP)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Pena Privativa (meses)</label>
        <input type="number" defaultValue="36" id="pena_conv" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const pena = parseInt(document.getElementById('pena_conv').value);
        const possivel = pena <= 48;
        onCalcular(null, {
          pena_privativa_meses: pena,
          substituicao_possivel: possivel,
          tipo_substituicao: possivel ? 'Duas restritivas de direitos' : 'Não aplicável (pena > 4 anos)',
          sugestoes: possivel ? ['Prestação de serviços', 'Prestação pecuniária'] : [],
          fundamentacao: 'Art. 44 CP - Substituição por restritivas'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '🔄 VERIFICAR CONVERSÃO'}
      </button>
    </div>
  );
};

export const FormSursis = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">⏸️ Sursis (art. 77 CP)</h3>
        <p className="text-gray-400 text-sm">Suspensão condicional da pena</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Pena Aplicada (meses)</label>
        <input type="number" defaultValue="18" id="pena_sursis" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const pena = parseInt(document.getElementById('pena_sursis').value);
        const possivel = pena <= 24;
        onCalcular(null, {
          pena_meses: pena,
          sursis_possivel: possivel,
          tipo: possivel ? 'Suspensão condicional (2-4 anos)' : 'Não aplicável (pena > 2 anos)',
          prazo_anos: possivel ? '2 a 4 anos' : 'N/A',
          fundamentacao: 'Art. 77 CP - Sursis'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '⏸️ VERIFICAR SURSIS'}
      </button>
    </div>
  );
};

// ==================== CÍVEIS RESTANTES (5) ====================

export const FormMultaContratual = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
        <h3 className="text-orange-400 font-semibold mb-2">📋 Multa Contratual / Cláusula Penal</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor do Contrato (R$)</label>
        <input type="number" step="0.01" defaultValue="100000" id="valor_contrato" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Percentual da Multa (%)</label>
        <input type="number" step="0.1" defaultValue="10" id="pct_multa" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const valor = parseFloat(document.getElementById('valor_contrato').value);
        const pct = parseFloat(document.getElementById('pct_multa').value);
        onCalcular(null, {
          valor_contrato: valor,
          percentual_multa: pct,
          valor_multa: valor * (pct / 100),
          fundamentacao: 'CC art. 408-416 - Cláusula penal'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '📋 CALCULAR MULTA'}
      </button>
    </div>
  );
};

export const FormDanoMoral = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
        <h3 className="text-pink-400 font-semibold mb-2">😢 Dano Moral (Parâmetro Jurisprudencial)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Dano</label>
        <select id="tipo_dano" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
          <option value="leve">Leve (R$ 1.000 - R$ 5.000)</option>
          <option value="medio">Médio (R$ 5.000 - R$ 20.000)</option>
          <option value="grave">Grave (R$ 20.000 - R$ 100.000)</option>
          <option value="gravissimo">Gravíssimo (R$ 100.000+)</option>
        </select>
      </div>
      <button onClick={() => {
        const valores = { leve: 3000, medio: 12000, grave: 50000, gravissimo: 150000 };
        const tipo = document.getElementById('tipo_dano').value;
        onCalcular(null, {
          tipo_dano: tipo,
          valor_sugerido: valores[tipo],
          faixa: tipo === 'leve' ? 'R$ 1.000 - R$ 5.000' : tipo === 'medio' ? 'R$ 5.000 - R$ 20.000' : tipo === 'grave' ? 'R$ 20.000 - R$ 100.000' : 'R$ 100.000+',
          fundamentacao: 'Parâmetros jurisprudenciais STJ'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '😢 CALCULAR DANO MORAL'}
      </button>
    </div>
  );
};

export const FormAstreintes = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <h3 className="text-red-400 font-semibold mb-2">⚠️ Astreintes (art. 537 CPC)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor Diário (R$)</label>
        <input type="number" step="0.01" defaultValue="1000" id="valor_diario" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Dias em Atraso</label>
        <input type="number" defaultValue="30" id="dias_atraso" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const valor_dia = parseFloat(document.getElementById('valor_diario').value);
        const dias = parseInt(document.getElementById('dias_atraso').value);
        onCalcular(null, {
          valor_diario: valor_dia,
          dias_atraso: dias,
          total_multa: valor_dia * dias,
          fundamentacao: 'CPC art. 537 - Multa coercitiva'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '⚠️ CALCULAR ASTREINTES'}
      </button>
    </div>
  );
};

export const FormLucrosCessantes = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <h3 className="text-yellow-400 font-semibold mb-2">📉 Lucros Cessantes / Dano Material</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Lucro Mensal Médio (R$)</label>
        <input type="number" step="0.01" defaultValue="10000" id="lucro_mensal" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Meses Prejudicados</label>
        <input type="number" defaultValue="12" id="meses_prejuizo" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const lucro = parseFloat(document.getElementById('lucro_mensal').value);
        const meses = parseInt(document.getElementById('meses_prejuizo').value);
        onCalcular(null, {
          lucro_mensal: lucro,
          meses_prejudicados: meses,
          total_lucros_cessantes: lucro * meses,
          fundamentacao: 'CC art. 402 - Lucros cessantes'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '📉 CALCULAR LUCROS CESSANTES'}
      </button>
    </div>
  );
};

export const FormHonorariosSucumbenciais = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
        <h3 className="text-indigo-400 font-semibold mb-2">⚖️ Honorários Sucumbenciais (CPC art. 85 §3º)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor da Condenação (R$)</label>
        <input type="number" step="0.01" defaultValue="100000" id="valor_cond" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Percentual (10-20%)</label>
        <input type="number" step="0.5" defaultValue="15" min="10" max="20" id="pct_sucumb" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const valor = parseFloat(document.getElementById('valor_cond').value);
        const pct = parseFloat(document.getElementById('pct_sucumb').value);
        onCalcular(null, {
          valor_condenacao: valor,
          percentual: pct,
          honorarios_sucumbenciais: valor * (pct / 100),
          fundamentacao: 'CPC art. 85 §3º - Honorários de sucumbência'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '⚖️ CALCULAR SUCUMBENCIAIS'}
      </button>
    </div>
  );
};

// ==================== TRIBUTÁRIAS RESTANTES (3) ====================

export const FormPrescricaoTributaria = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <h3 className="text-red-400 font-semibold mb-2">⏰ Prescrição Tributária (CTN art. 174)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Data do Lançamento</label>
        <input type="date" defaultValue="2019-01-01" id="data_lanc" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const dataLanc = new Date(document.getElementById('data_lanc').value);
        const dataLimite = new Date(dataLanc);
        dataLimite.setFullYear(dataLimite.getFullYear() + 5);
        const diasRestantes = Math.floor((dataLimite - new Date()) / (1000 * 60 * 60 * 24));
        onCalcular(null, {
          data_lancamento: dataLanc.toISOString(),
          prazo_anos: 5,
          data_prescricao: dataLimite.toISOString(),
          dias_restantes: diasRestantes,
          prescrito: diasRestantes < 0,
          status: diasRestantes < 0 ? 'PRESCRITO' : 'EM PRAZO',
          fundamentacao: 'CTN art. 174 - Prescrição em 5 anos'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '⏰ CALCULAR PRESCRIÇÃO'}
      </button>
    </div>
  );
};

export const FormMultaFiscal = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <h3 className="text-red-400 font-semibold mb-2">💸 Multa Fiscal / Mora</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor do Tributo (R$)</label>
        <input type="number" step="0.01" defaultValue="5000" id="valor_tributo" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Meses de Atraso</label>
        <input type="number" defaultValue="6" id="meses_atraso_fiscal" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const valor = parseFloat(document.getElementById('valor_tributo').value);
        const meses = parseInt(document.getElementById('meses_atraso_fiscal').value);
        const multa = valor * 0.20; // 20% multa base
        const juros = valor * 0.01 * meses; // 1% ao mês
        onCalcular(null, {
          valor_tributo: valor,
          meses_atraso: meses,
          multa_20: multa,
          juros_mora: juros,
          total: valor + multa + juros,
          fundamentacao: 'CTN art. 161 - Multa e juros de mora'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '💸 CALCULAR MULTA'}
      </button>
    </div>
  );
};

export const FormRestituicao = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-green-400 font-semibold mb-2">💚 Restituição Tributária (Repetição do Indébito)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor Pago Indevidamente (R$)</label>
        <input type="number" step="0.01" defaultValue="10000" id="valor_rest" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Meses desde Pagamento</label>
        <input type="number" defaultValue="24" id="meses_rest" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const valor = parseFloat(document.getElementById('valor_rest').value);
        const meses = parseInt(document.getElementById('meses_rest').value);
        const juros_selic = valor * 0.01 * meses; // Aprox 1% ao mês
        onCalcular(null, {
          valor_pago: valor,
          meses: meses,
          juros_selic: juros_selic,
          valor_restituir: valor + juros_selic,
          fundamentacao: 'CTN art. 165-168 - Restituição com juros SELIC'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '💚 CALCULAR RESTITUIÇÃO'}
      </button>
    </div>
  );
};

// ==================== TRABALHISTAS RESTANTES (3) ====================

export const FormAtrasoSalarial = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <h3 className="text-yellow-400 font-semibold mb-2">💰 Atraso Salarial (art. 459 CLT)</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Salário Mensal (R$)</label>
        <input type="number" step="0.01" defaultValue="4000" id="sal_atraso" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Meses em Atraso</label>
        <input type="number" defaultValue="3" id="meses_atraso_sal" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const salario = parseFloat(document.getElementById('sal_atraso').value);
        const meses = parseInt(document.getElementById('meses_atraso_sal').value);
        const multa = salario * 0.01 * meses; // 1% ao mês
        onCalcular(null, {
          salario_mensal: salario,
          meses_atraso: meses,
          total_atrasado: salario * meses,
          multa_mora: multa,
          total_devido: (salario * meses) + multa,
          fundamentacao: 'CLT art. 459 - Atraso salarial com multa'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '💰 CALCULAR ATRASO'}
      </button>
    </div>
  );
};

export const FormFGTS = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-green-400 font-semibold mb-2">🏦 Multa FGTS 40%</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Salário Médio (R$)</label>
        <input type="number" step="0.01" defaultValue="4000" id="sal_fgts" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Tempo de Serviço (meses)</label>
        <input type="number" defaultValue="36" id="tempo_fgts" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const salario = parseFloat(document.getElementById('sal_fgts').value);
        const meses = parseInt(document.getElementById('tempo_fgts').value);
        const fgts_depositado = salario * 0.08 * meses;
        const multa_40 = fgts_depositado * 0.40;
        onCalcular(null, {
          salario_medio: salario,
          tempo_servico_meses: meses,
          fgts_depositado: fgts_depositado,
          multa_40_porcento: multa_40,
          total: fgts_depositado + multa_40,
          fundamentacao: 'CLT art. 18 §1º - FGTS + Multa 40%'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '🏦 CALCULAR FGTS'}
      </button>
    </div>
  );
};

export const FormPerdasDanos = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <h3 className="text-red-400 font-semibold mb-2">⚠️ Perdas e Danos Trabalhistas</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor da Condenação (R$)</label>
        <input type="number" step="0.01" defaultValue="20000" id="valor_pd" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Data da Sentença</label>
        <input type="date" defaultValue="2022-01-01" id="data_sent" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/civil/correcao-monetaria', {
        valor_principal: parseFloat(document.getElementById('valor_pd').value),
        data_inicial: document.getElementById('data_sent').value,
        data_final: new Date().toISOString().split('T')[0],
        indice: 'IPCA'
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '⚠️ CALCULAR PERDAS'}
      </button>
    </div>
  );
};

// ==================== FINANCEIRAS RESTANTES (4) ====================

export const FormJurosSimples = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
        <h3 className="text-teal-400 font-semibold mb-2">📊 Juros Simples</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Capital (R$)</label>
        <input type="number" step="0.01" defaultValue="10000" id="capital_js" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Taxa Mensal (%)</label>
        <input type="number" step="0.01" defaultValue="1.5" id="taxa_js" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Período (meses)</label>
        <input type="number" defaultValue="12" id="periodo_js" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const C = parseFloat(document.getElementById('capital_js').value);
        const i = parseFloat(document.getElementById('taxa_js').value) / 100;
        const t = parseInt(document.getElementById('periodo_js').value);
        const J = C * i * t;
        onCalcular(null, {
          capital: C,
          taxa_mensal: i * 100,
          periodo_meses: t,
          juros: J,
          montante: C + J,
          formula: 'J = C × i × t'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '📊 CALCULAR JUROS SIMPLES'}
      </button>
    </div>
  );
};

export const FormLucroReal = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-400 font-semibold mb-2">📈 Lucro Real / Presumido</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Receita Bruta (R$)</label>
        <input type="number" step="0.01" defaultValue="1000000" id="receita_bruta" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Despesas (R$)</label>
        <input type="number" step="0.01" defaultValue="600000" id="despesas_lr" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/tributario/planejamento', {
        faturamento_anual: parseFloat(document.getElementById('receita_bruta').value),
        despesas_anuais: parseFloat(document.getElementById('despesas_lr').value),
        funcionarios: 10
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '📈 CALCULAR LUCRO'}
      </button>
    </div>
  );
};

export const FormEBITDA = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <h3 className="text-purple-400 font-semibold mb-2">💹 EBITDA / Margem de Contribuição</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Receita (R$)</label>
        <input type="number" step="0.01" defaultValue="1000000" id="receita_ebitda" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Custos Operacionais (R$)</label>
        <input type="number" step="0.01" defaultValue="400000" id="custos_ebitda" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const receita = parseFloat(document.getElementById('receita_ebitda').value);
        const custos = parseFloat(document.getElementById('custos_ebitda').value);
        const ebitda = receita - custos;
        onCalcular(null, {
          receita: receita,
          custos_operacionais: custos,
          ebitda: ebitda,
          margem_ebitda: ((ebitda / receita) * 100).toFixed(2) + '%',
          fundamentacao: 'EBITDA = Receita - Custos Operacionais'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '💹 CALCULAR EBITDA'}
      </button>
    </div>
  );
};

export const FormFluxoCaixa = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
        <h3 className="text-cyan-400 font-semibold mb-2">💵 Fluxo de Caixa Projetado</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Saldo Inicial (R$)</label>
        <input type="number" step="0.01" defaultValue="50000" id="saldo_inicial" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Entradas Mensais (R$)</label>
        <input type="number" step="0.01" defaultValue="30000" id="entradas" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Saídas Mensais (R$)</label>
        <input type="number" step="0.01" defaultValue="25000" id="saidas" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const saldo = parseFloat(document.getElementById('saldo_inicial').value);
        const entradas = parseFloat(document.getElementById('entradas').value);
        const saidas = parseFloat(document.getElementById('saidas').value);
        const fluxo_mensal = entradas - saidas;
        onCalcular(null, {
          saldo_inicial: saldo,
          entradas_mensais: entradas,
          saidas_mensais: saidas,
          fluxo_liquido_mensal: fluxo_mensal,
          saldo_final_12_meses: saldo + (fluxo_mensal * 12),
          fundamentacao: 'Projeção de fluxo de caixa mensal'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '💵 CALCULAR FLUXO'}
      </button>
    </div>
  );
};

// ==================== PERICIAIS RESTANTES (2) ====================

export const FormAmplitude = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
        <h3 className="text-indigo-400 font-semibold mb-2">📏 Amplitude Total</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valores (separados por vírgula)</label>
        <input type="text" placeholder="10,15,8,20,12" id="valores_amp" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => {
        const valores = document.getElementById('valores_amp').value.split(',').map(v => parseFloat(v.trim()));
        const max = Math.max(...valores);
        const min = Math.min(...valores);
        onCalcular(null, {
          valores: valores,
          valor_maximo: max,
          valor_minimo: min,
          amplitude: max - min,
          fundamentacao: 'Amplitude = Máximo - Mínimo'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '📏 CALCULAR AMPLITUDE'}
      </button>
    </div>
  );
};

export const FormEntropia = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
        <h3 className="text-pink-400 font-semibold mb-2">🔐 Entropia de Hash</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Hash SHA-256</label>
        <input type="text" placeholder="Digite um hash SHA-256" id="hash_entropia" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-xs" />
      </div>
      <button onClick={() => {
        const hash = document.getElementById('hash_entropia').value;
        const comprimento = hash.length;
        const caracteres_unicos = new Set(hash).size;
        const entropia = Math.log2(caracteres_unicos) * comprimento;
        onCalcular(null, {
          hash: hash,
          comprimento: comprimento,
          caracteres_unicos: caracteres_unicos,
          entropia_estimada: entropia.toFixed(2),
          qualidade: entropia > 200 ? 'ALTA' : entropia > 100 ? 'MÉDIA' : 'BAIXA',
          fundamentacao: 'Análise de entropia criptográfica'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '🔐 CALCULAR ENTROPIA'}
      </button>
    </div>
  );
};

// ==================== DIVERSAS RESTANTE (1) ====================

export const FormConversaoMoedas = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-green-400 font-semibold mb-2">💱 Conversão de Moedas</h3>
        <p className="text-gray-400 text-sm">Cotação aproximada (valores de referência)</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor (R$)</label>
        <input type="number" step="0.01" defaultValue="1000" id="valor_moeda" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Moeda Destino</label>
        <select id="moeda_destino" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
          <option value="USD">Dólar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
          <option value="GBP">Libra (GBP)</option>
          <option value="BTC">Bitcoin (BTC)</option>
        </select>
      </div>
      <button onClick={() => {
        const valor = parseFloat(document.getElementById('valor_moeda').value);
        const moeda = document.getElementById('moeda_destino').value;
        const cotacoes = { USD: 5.0, EUR: 5.5, GBP: 6.3, BTC: 250000 };
        const resultado = valor / cotacoes[moeda];
        onCalcular(null, {
          valor_reais: valor,
          moeda_destino: moeda,
          cotacao: cotacoes[moeda],
          valor_convertido: resultado.toFixed(moeda === 'BTC' ? 8 : 2),
          fundamentacao: 'Cotação de referência (valores aproximados)'
        });
      }} disabled={loading} className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '💱 CONVERTER'}
      </button>
    </div>
  );
};

};

// ==================== PERICIAIS ====================

export const FormErroPercentual = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
        <h3 className="text-pink-400 font-semibold mb-2">🔬 Erro Percentual</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor Real</label>
        <input type="number" step="0.0001" defaultValue="100.5" id="val_real" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor Medido</label>
        <input type="number" step="0.0001" defaultValue="102.3" id="val_medido" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/pericial/erro-percentual', {
        valor_real: parseFloat(document.getElementById('val_real').value),
        valor_medido: parseFloat(document.getElementById('val_medido').value)
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '🔬 CALCULAR ERRO'}
      </button>
    </div>
  );
};

export const FormDesvioPadrao = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
        <h3 className="text-purple-400 font-semibold mb-2">📊 Desvio Padrão e Variância</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valores (separados por vírgula)</label>
        <input type="text" placeholder="10.5,12.3,11.8,13.2,10.9" id="valores_dp" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/pericial/desvio-padrao-variancia', {
        valores: document.getElementById('valores_dp').value.split(',').map(v => parseFloat(v.trim()))
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '📊 CALCULAR DESVIO PADRÃO'}
      </button>
    </div>
  );
};

export const FormMediaPonderada = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
        <h3 className="text-cyan-400 font-semibold mb-2">⚖️ Média Ponderada</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valores (separados por vírgula)</label>
        <input type="text" placeholder="8.5,9.0,7.5" id="valores_mp" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Pesos (separados por vírgula)</label>
        <input type="text" placeholder="2,3,1" id="pesos_mp" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/pericial/media-ponderada', {
        valores: document.getElementById('valores_mp').value.split(',').map(v => parseFloat(v.trim())),
        pesos: document.getElementById('pesos_mp').value.split(',').map(p => parseFloat(p.trim()))
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '⚖️ CALCULAR MÉDIA'}
      </button>
    </div>
  );
};

export const FormProbabilidade = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4">
        <h3 className="text-pink-400 font-semibold mb-2">🎯 Probabilidade Forense</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Análise</label>
        <select id="tipo_prob" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
          <option value="DNA">DNA</option>
          <option value="voz">Voz</option>
          <option value="digital">Impressão Digital</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Coincidências</label>
        <input type="number" defaultValue="995" id="coincidencias" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Total de Comparações</label>
        <input type="number" defaultValue="1000" id="total_comp" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/pericial/probabilidade-forense', {
        tipo_analise: document.getElementById('tipo_prob').value,
        coincidencias: parseInt(document.getElementById('coincidencias').value),
        total_comparacoes: parseInt(document.getElementById('total_comp').value)
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '🎯 CALCULAR PROBABILIDADE'}
      </button>
    </div>
  );
};

// ==================== DIVERSAS ====================

export const FormPrescricaoCivel = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
        <h3 className="text-gray-400 font-semibold mb-2">📅 Prescrição Cível</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo de Ação</label>
        <select id="tipo_acao_civel" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
          <option value="cobranca_geral">Cobrança Geral (10 anos)</option>
          <option value="responsabilidade_civil">Responsabilidade Civil (3 anos)</option>
          <option value="reparacao_civil">Reparação Civil (3 anos)</option>
          <option value="seguro">Seguro (1 ano)</option>
          <option value="pretensao_rescisoria">Pretensão Rescisória (2 anos)</option>
          <option value="administrativa">Administrativa (5 anos)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Data do Fato</label>
        <input type="date" defaultValue="2020-01-01" id="data_fato_civel" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <button onClick={() => onCalcular('/diversos/prescricao-civel', {
        tipo_acao: document.getElementById('tipo_acao_civel').value,
        data_fato: document.getElementById('data_fato_civel').value + 'T00:00:00Z'
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-gray-500 to-gray-700 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '📅 CALCULAR PRESCRIÇÃO'}
      </button>
    </div>
  );
};

export const FormConversaoUnidades = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
        <h3 className="text-teal-400 font-semibold mb-2">🔄 Conversão de Unidades Forenses</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor</label>
        <input type="number" step="0.01" defaultValue="1024" id="valor_conv" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">De</label>
          <select id="unidade_origem" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
            <option value="B">Bytes (B)</option>
            <option value="KB">Kilobytes (KB)</option>
            <option value="MB">Megabytes (MB)</option>
            <option value="GB">Gigabytes (GB)</option>
            <option value="TB">Terabytes (TB)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">Para</label>
          <select id="unidade_destino" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
            <option value="B">Bytes (B)</option>
            <option value="KB">Kilobytes (KB)</option>
            <option value="MB">Megabytes (MB)</option>
            <option value="GB">Gigabytes (GB)</option>
            <option value="TB">Terabytes (TB)</option>
          </select>
        </div>
      </div>
      <button onClick={() => onCalcular('/diversos/conversao-unidades-forenses', {
        valor: parseFloat(document.getElementById('valor_conv').value),
        unidade_origem: document.getElementById('unidade_origem').value,
        unidade_destino: document.getElementById('unidade_destino').value
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '🔄 CONVERTER'}
      </button>
    </div>
  );
};

export const FormCustas = ({ onCalcular, loading }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
        <h3 className="text-gray-400 font-semibold mb-2">💰 Custas Processuais</h3>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">Valor da Causa (R$)</label>
        <input type="number" step="0.01" defaultValue="100000" id="valor_causa_custas" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">UF</label>
        <select id="uf_custas" className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white">
          <option value="SP">São Paulo</option>
          <option value="RJ">Rio de Janeiro</option>
          <option value="MG">Minas Gerais</option>
        </select>
      </div>
      <button onClick={() => onCalcular('/diversos/custas-processuais', {
        valor_causa: parseFloat(document.getElementById('valor_causa_custas').value),
        tipo_acao: 'conhecimento',
        uf: document.getElementById('uf_custas').value
      })} disabled={loading} className="w-full py-3 bg-gradient-to-r from-gray-500 to-gray-700 text-white font-bold rounded-lg">
        {loading ? 'Calculando...' : '💰 CALCULAR CUSTAS'}
      </button>
    </div>
  );
};
