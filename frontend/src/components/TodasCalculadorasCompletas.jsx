import React, { useState } from 'react';
import { toast } from 'sonner';
import { PenaUniversal } from './CalculadorasCompletas';

// ==================== PROGRESSÃO DE REGIME COMPLETA ====================
export const ProgressaoRegimeCompleta = ({ onCalcular, loading }) => {
  const [crimes, setCrimes] = useState([{ id: 1, penaTotal: 120, regime: 'fechado', reincidente: false, tipo: '' }]);
  const [crimeAtivo, setCrimeAtivo] = useState(1);

  const adicionarCrime = () => {
    const novoId = Math.max(...crimes.map(c => c.id)) + 1;
    setCrimes([...crimes, { id: novoId, penaTotal: 120, regime: 'fechado', reincidente: false, tipo: '' }]);
    setCrimeAtivo(novoId);
    toast.success(`Crime ${novoId} adicionado`);
  };

  const crimeAtual = crimes.find(c => c.id === crimeAtivo);

  return (
    <div className="space-y-6">
      {/* Gestão de Crimes */}
      <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border-2 border-green-500/30 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-green-400">📚 Crimes para Verificar Progressão ({crimes.length})</h3>
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
                crimeAtivo === c.id ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
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

      {/* Formulário */}
      <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border-2 border-green-500/30 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-green-400 mb-2">📈 Crime {crimeAtivo} - Progressão de Regime</h3>
        <p className="text-gray-400 mb-6">LEP art. 112 - Cálculo do tempo necessário para progressão (1/6, 2/5 ou 3/5)</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Tipo Penal</label>
            <input
              type="text"
              value={crimeAtual?.tipo || ''}
              onChange={(e) => setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, tipo: e.target.value} : c))}
              placeholder="Ex: Roubo majorado, Tráfico de drogas"
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <PenaUniversal
            label="Pena Total Aplicada"
            valorMeses={crimeAtual?.penaTotal || 120}
            onChange={(meses) => setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, penaTotal: meses} : c))}
          />

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Regime Inicial</label>
            <select
              value={crimeAtual?.regime || 'fechado'}
              onChange={(e) => setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, regime: e.target.value} : c))}
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white font-bold"
            >
              <option value="fechado">Fechado</option>
              <option value="semiaberto">Semiaberto</option>
              <option value="aberto">Aberto</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg border-2 border-gray-700">
              <input
                type="checkbox"
                checked={crimeAtual?.reincidente || false}
                onChange={(e) => setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, reincidente: e.target.checked} : c))}
                className="w-6 h-6 rounded"
              />
              <span className="text-white font-bold">Reincidente (3/5 = 60%)</span>
            </label>
            <label className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg border-2 border-gray-700">
              <input
                type="checkbox"
                defaultChecked
                className="w-6 h-6 rounded"
              />
              <span className="text-white font-bold">Bom Comportamento</span>
            </label>
          </div>
        </div>

        <button
          onClick={() => onCalcular('/criminal/progressao', {
            pena_total_meses: crimeAtual.penaTotal,
            regime_inicial: crimeAtual.regime,
            reincidente: crimeAtual.reincidente,
            bom_comportamento: true
          })}
          disabled={loading}
          className="w-full mt-6 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold text-xl rounded-xl"
        >
          {loading ? 'Calculando...' : `📈 CALCULAR PROGRESSÃO - Crime ${crimeAtivo}`}
        </button>
      </div>
    </div>
  );
};

// ==================== REMIÇÃO COMPLETA ====================
export const RemicaoCompleta = ({ onCalcular, loading }) => {
  const [crimes, setCrimes] = useState([{ id: 1, diasTrabalhados: 90, diasEstudados: 0, tipo: '' }]);
  const [crimeAtivo, setCrimeAtivo] = useState(1);

  const crimeAtual = crimes.find(c => c.id === crimeAtivo);

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-2 border-teal-500/30 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-teal-400 mb-2">📚 Remição de Pena (art. 126 LEP)</h3>
        <p className="text-gray-400 mb-6">3 dias trabalhados = 1 dia remido | 12 horas estudo = 1 dia remido</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Tipo Penal</label>
            <input
              type="text"
              value={crimeAtual?.tipo || ''}
              onChange={(e) => setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, tipo: e.target.value} : c))}
              placeholder="Ex: Furto qualificado"
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Dias Trabalhados</label>
            <input
              type="number"
              value={crimeAtual?.diasTrabalhados || 90}
              onChange={(e) => setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, diasTrabalhados: parseInt(e.target.value)} : c))}
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-bold"
            />
            <div className="mt-2 bg-green-500/10 border border-green-500 rounded p-2">
              <span className="text-gray-400 text-sm">Dias remidos (trabalho):</span>
              <span className="text-green-400 font-bold ml-2">{((crimeAtual?.diasTrabalhados || 0) / 3).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Horas de Estudo</label>
            <input
              type="number"
              value={crimeAtual?.diasEstudados || 0}
              onChange={(e) => setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, diasEstudados: parseInt(e.target.value)} : c))}
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-bold"
            />
            <div className="mt-2 bg-blue-500/10 border border-blue-500 rounded p-2">
              <span className="text-gray-400 text-sm">Dias remidos (estudo):</span>
              <span className="text-blue-400 font-bold ml-2">{((crimeAtual?.diasEstudados || 0) / 12).toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500 rounded-lg p-4">
            <div className="text-purple-400 font-bold mb-2">Total de Dias Remidos:</div>
            <div className="text-white text-3xl font-bold">
              {(((crimeAtual?.diasTrabalhados || 0) / 3) + ((crimeAtual?.diasEstudados || 0) / 12)).toFixed(2)} dias
            </div>
            <div className="text-gray-400 text-sm mt-1">
              = {(((crimeAtual?.diasTrabalhados || 0) / 3) + ((crimeAtual?.diasEstudados || 0) / 12) / 30).toFixed(2)} meses
            </div>
          </div>
        </div>

        <button
          onClick={() => onCalcular('/criminal/remicao', {
            dias_trabalhados: crimeAtual.diasTrabalhados
          })}
          disabled={loading}
          className="w-full mt-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold text-xl rounded-xl"
        >
          {loading ? 'Calculando...' : `📚 CALCULAR REMIÇÃO - Crime ${crimeAtivo}`}
        </button>
      </div>
    </div>
  );
};

// ==================== LIVRAMENTO CONDICIONAL COMPLETO ====================
export const LivramentoCondicionalCompleto = ({ onCalcular, loading }) => {
  const [crimes, setCrimes] = useState([{ id: 1, penaTotal: 120, tempoCumprido: 50, reincidente: false, hediondo: false, tipo: '' }]);
  const [crimeAtivo, setCrimeAtivo] = useState(1);

  const crimeAtual = crimes.find(c => c.id === crimeAtivo);
  const fracao = crimeAtual?.hediondo ? 2/3 : crimeAtual?.reincidente ? 1/2 : 1/3;
  const tempoNecessario = (crimeAtual?.penaTotal || 0) * fracao;

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/30 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-cyan-400 mb-2">🔓 Livramento Condicional (art. 83 CP)</h3>
        <p className="text-gray-400 mb-6">1/3 primário | 1/2 reincidente | 2/3 crime hediondo</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Tipo Penal</label>
            <input
              type="text"
              value={crimeAtual?.tipo || ''}
              onChange={(e) => setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, tipo: e.target.value} : c))}
              placeholder="Ex: Homicídio simples, Roubo"
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <PenaUniversal
            label="Pena Total Aplicada"
            valorMeses={crimeAtual?.penaTotal || 120}
            onChange={(meses) => setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, penaTotal: meses} : c))}
          />

          <PenaUniversal
            label="Tempo Já Cumprido"
            valorMeses={crimeAtual?.tempoCumprido || 50}
            onChange={(meses) => setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, tempoCumprido: meses} : c))}
          />

          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg border-2 border-gray-700">
              <input
                type="checkbox"
                checked={crimeAtual?.reincidente || false}
                onChange={(e) => setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, reincidente: e.target.checked} : c))}
                className="w-6 h-6 rounded"
              />
              <span className="text-white font-bold">Reincidente (1/2)</span>
            </label>
            <label className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-lg border-2 border-gray-700">
              <input
                type="checkbox"
                checked={crimeAtual?.hediondo || false}
                onChange={(e) => setCrimes(crimes.map(c => c.id === crimeAtivo ? {...c, hediondo: e.target.checked} : c))}
                className="w-6 h-6 rounded"
              />
              <span className="text-white font-bold">Crime Hediondo (2/3)</span>
            </label>
          </div>

          {/* Preview do Cálculo */}
          <div className="bg-cyan-500/10 border-2 border-cyan-500 rounded-lg p-4">
            <div className="text-cyan-400 font-bold mb-2">📊 Preview do Cálculo:</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Fração necessária:</span>
                <span className="text-white font-bold ml-2">{(fracao * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-gray-400">Tempo necessário:</span>
                <span className="text-white font-bold ml-2">{tempoNecessario.toFixed(0)} meses</span>
              </div>
              <div>
                <span className="text-gray-400">Tempo faltante:</span>
                <span className={`font-bold ml-2 ${tempoNecessario - (crimeAtual?.tempoCumprido || 0) <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.max(tempoNecessario - (crimeAtual?.tempoCumprido || 0), 0).toFixed(0)} meses
                </span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <span className={`font-bold ml-2 ${(crimeAtual?.tempoCumprido || 0) >= tempoNecessario ? 'text-green-400' : 'text-red-400'}`}>
                  {(crimeAtual?.tempoCumprido || 0) >= tempoNecessario ? 'ELEGÍVEL' : 'NÃO ELEGÍVEL'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => onCalcular('/criminal/livramento-condicional', {
            pena_total_meses: crimeAtual.penaTotal,
            tempo_cumprido_meses: crimeAtual.tempoCumprido,
            reincidente: crimeAtual.reincidente,
            crime_hediondo: crimeAtual.hediondo
          })}
          disabled={loading}
          className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xl rounded-xl"
        >
          {loading ? 'Calculando...' : `🔓 CALCULAR LIVRAMENTO - Crime ${crimeAtivo}`}
        </button>
      </div>
    </div>
  );
};

// ==================== CORREÇÃO MONETÁRIA COMPLETA ====================
export const CorrecaoMonetariaCompleta = ({ onCalcular, loading }) => {
  const [calculos, setCalculos] = useState([{ id: 1, valor: 10000, dataInicial: '2020-01-01', dataFinal: new Date().toISOString().split('T')[0], indice: 'INPC', descricao: '' }]);
  const [ativo, setAtivo] = useState(1);

  const calculoAtual = calculos.find(c => c.id === ativo);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-yellow-400 mb-2">💰 Correção Monetária (art. 389 CC)</h3>
        <p className="text-gray-400 mb-6">Atualização de valores por índices oficiais (INPC, IPCA, IGPM, SELIC)</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Descrição do Valor</label>
            <input
              type="text"
              value={calculoAtual?.descricao || ''}
              onChange={(e) => setCalculos(calculos.map(c => c.id === ativo ? {...c, descricao: e.target.value} : c))}
              placeholder="Ex: Indenização por danos morais, Dívida trabalhista"
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Valor Principal (R$)</label>
            <input
              type="number"
              step="0.01"
              value={calculoAtual?.valor || 10000}
              onChange={(e) => setCalculos(calculos.map(c => c.id === ativo ? {...c, valor: parseFloat(e.target.value)} : c))}
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-bold"
            />
            <div className="mt-2 text-sm text-gray-400">
              Por extenso: R$ {(calculoAtual?.valor || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Data Inicial</label>
              <input
                type="date"
                value={calculoAtual?.dataInicial || '2020-01-01'}
                onChange={(e) => setCalculos(calculos.map(c => c.id === ativo ? {...c, dataInicial: e.target.value} : c))}
                className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Data Final</label>
              <input
                type="date"
                value={calculoAtual?.dataFinal || new Date().toISOString().split('T')[0]}
                onChange={(e) => setCalculos(calculos.map(c => c.id === ativo ? {...c, dataFinal: e.target.value} : c))}
                className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Índice de Correção</label>
            <select
              value={calculoAtual?.indice || 'INPC'}
              onChange={(e) => setCalculos(calculos.map(c => c.id === ativo ? {...c, indice: e.target.value} : c))}
              className="w-full bg-gray-800/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white font-bold"
            >
              <option value="INPC">INPC (Consumidor)</option>
              <option value="IPCA">IPCA (Inflação Oficial)</option>
              <option value="IGPM">IGP-M (Geral de Preços)</option>
              <option value="SELIC">SELIC (Taxa Básica)</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => onCalcular('/civil/correcao-monetaria', {
            valor_principal: calculoAtual.valor,
            data_inicial: calculoAtual.dataInicial,
            data_final: calculoAtual.dataFinal,
            indice: calculoAtual.indice
          })}
          disabled={loading}
          className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold text-xl rounded-xl"
        >
          {loading ? 'Calculando...' : '💰 CALCULAR CORREÇÃO MONETÁRIA'}
        </button>
      </div>
    </div>
  );
};

export { PenaUniversal };
