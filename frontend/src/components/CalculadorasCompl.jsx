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

// Componente para exibir os componentes consolidados
export const CalculadorasCompletas = {
  PenaUniversal
};
