import React, { useState } from 'react';
import { toast } from 'sonner';

// ==================== COMPONENTE UNIVERSAL DE PENA ====================
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
          onChange={(e) => { setUnidade(e.target.value); handleChange(valor, e.target.value); }}
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

// ==================== CONTAINER DE MÚLTIPLOS ITENS ====================
export const GestaoMultiplosItens = ({ itens, setItens, ativo, setAtivo, adicionar, tipo = 'Crime', corPrincipal = 'blue' }) => {
  return (
    <div className={`bg-gradient-to-r from-${corPrincipal}-500/10 to-purple-500/10 border-2 border-${corPrincipal}-500/30 rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold text-${corPrincipal}-400`}>
          📚 {tipo}s para Análise ({itens.length})
        </h3>
        <button onClick={adicionar} className={`px-4 py-2 bg-green-600/30 border-2 border-green-600 text-green-400 rounded-lg font-bold hover:bg-green-600/40`}>
          ➕ Adicionar {tipo}
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {itens.map((item) => (
          <button
            key={item.id}
            onClick={() => setAtivo(item.id)}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              ativo === item.id ? `bg-${corPrincipal}-600 text-white shadow-lg` : item.resultado ? 'bg-green-600/20 border-2 border-green-600 text-green-400' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <div>
              {tipo} {item.id} {item.nome && `- ${item.nome}`}
              {item.resultado && ' ✓'}
            </div>
            {itens.length > 1 && item.id !== 1 && (
              <button onClick={(e) => { e.stopPropagation(); setItens(itens.filter(i => i.id !== item.id)); }} className="ml-2 text-red-400 hover:text-red-300 text-xl">×</button>
            )}
          </button>
        ))}
      </div>
      <div className="mt-3 bg-gray-900/50 rounded p-2 text-center text-sm">
        <span className="text-gray-400">Calculados:</span>
        <span className="text-white font-bold ml-2">{itens.filter(i => i.resultado).length} / {itens.length}</span>
      </div>
    </div>
  );
};

export default { PenaUniversal, GestaoMultiplosItens };
