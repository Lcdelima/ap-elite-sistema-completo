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
