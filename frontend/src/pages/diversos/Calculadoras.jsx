import React, { useState } from 'react';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';
import axios from 'axios';

const Calculadoras = () => {
  const [activeCalc, setActiveCalc] = useState('pena-trifasico');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados para diferentes calculadoras
  const [penaTrifasico, setPenaTrifasico] = useState({
    pena_base_meses: 60,
    atenuantes: 0,
    agravantes: 0,
    majorantes_percentual: 0,
    minorantes_percentual: 0
  });

  const calculadoras = [
    { id: 'pena-trifasico', nome: 'Cálculo de Pena (Trifásico)', categoria: 'Criminal', color: 'pericia' },
    { id: 'progressao', nome: 'Progressão de Regime', categoria: 'Criminal', color: 'pericia' },
    { id: 'remicao', nome: 'Remição', categoria: 'Criminal', color: 'pericia' },
    { id: 'prazo-civil', nome: 'Prazos Processuais', categoria: 'Cível', color: 'advocacia' },
    { id: 'honorarios', nome: 'Honorários', categoria: 'Cível', color: 'advocacia' },
    { id: 'ferias', nome: 'Férias', categoria: 'Trabalhista', color: 'admin' },
    { id: '13-salario', nome: '13º Salário', categoria: 'Trabalhista', color: 'admin' },
    { id: 'tempo-contribuicao', nome: 'Tempo de Contribuição', categoria: 'Previdenciário', color: 'diversos' },
    { id: 'juros', nome: 'Juros Compostos', categoria: 'Tributário', color: 'comunicacao' }
  ];

  const calcularPenaTrifasico = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/calculadoras/criminal/pena-trifasico`,
        penaTrifasico
      );
      setResult(response.data);
    } catch (error) {
      alert('Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            Calculadoras <span className="text-elite-accent">Jurídicas</span> 🧮
          </h1>
          <p className="text-elite-metal">
            Ferramentas especializadas para todas as áreas do direito
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar de calculadoras */}
          <div className="lg:col-span-1">
            <CipherGlassCard className="p-4">
              <h3 className="text-lg font-title text-elite-text mb-4">Categorias</h3>
              <div className="space-y-2">
                {calculadoras.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => setActiveCalc(calc.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeCalc === calc.id
                        ? 'bg-surface-02 border border-elite-accent'
                        : 'hover:bg-surface-01 border border-transparent'
                    }`}
                  >
                    <div className={`category-badge badge-${calc.color} text-xs mb-1`}>
                      {calc.categoria}
                    </div>
                    <div className="text-elite-text text-sm font-semibold">
                      {calc.nome}
                    </div>
                  </button>
                ))}
              </div>
            </CipherGlassCard>
          </div>

          {/* Calculadora Ativa */}
          <div className="lg:col-span-3">
            <CipherGlassCard className="p-6">
              <h2 className="text-2xl font-title text-elite-text mb-6">
                {calculadoras.find(c => c.id === activeCalc)?.nome}
              </h2>

              {/* PENA TRIFÁSICO */}
              {activeCalc === 'pena-trifasico' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-elite-text text-sm font-semibold mb-2">
                        Pena Base (meses)
                      </label>
                      <input
                        type="number"
                        className="input-elite"
                        value={penaTrifasico.pena_base_meses}
                        onChange={(e) => setPenaTrifasico({...penaTrifasico, pena_base_meses: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-elite-text text-sm font-semibold mb-2">
                        Atenuantes (quantidade)
                      </label>
                      <input
                        type="number"
                        className="input-elite"
                        value={penaTrifasico.atenuantes}
                        onChange={(e) => setPenaTrifasico({...penaTrifasico, atenuantes: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-elite-text text-sm font-semibold mb-2">
                        Agravantes (quantidade)
                      </label>
                      <input
                        type="number"
                        className="input-elite"
                        value={penaTrifasico.agravantes}
                        onChange={(e) => setPenaTrifasico({...penaTrifasico, agravantes: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-elite-text text-sm font-semibold mb-2">
                        Majorantes (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="input-elite"
                        value={penaTrifasico.majorantes_percentual}
                        onChange={(e) => setPenaTrifasico({...penaTrifasico, majorantes_percentual: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-elite-text text-sm font-semibold mb-2">
                      Minorantes (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-elite"
                      value={penaTrifasico.minorantes_percentual}
                      onChange={(e) => setPenaTrifasico({...penaTrifasico, minorantes_percentual: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <button
                    onClick={calcularPenaTrifasico}
                    disabled={loading}
                    className="btn-elite btn-elite-primary w-full"
                  >
                    {loading ? 'Calculando...' : '🧮 Calcular Pena'}
                  </button>

                  {/* Resultado */}
                  {result && (
                    <div className="p-6 bg-surface-02 rounded-lg border border-elite-accent/50">
                      <h3 className="text-elite-accent font-semibold mb-4">Resultado</h3>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-elite-metal">1ª Fase (Base):</span>
                          <span className="text-elite-text font-semibold">{result.pena_base_meses} meses</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-elite-metal">2ª Fase (Atenuantes/Agravantes):</span>
                          <span className="text-elite-text font-semibold">{result.pena_segunda_fase_meses} meses</span>
                        </div>
                        
                        <div className="h-px bg-white/20 my-3"></div>
                        
                        <div className="flex justify-between text-lg">
                          <span className="text-elite-accent font-bold">Pena Final:</span>
                          <span className="text-elite-accent font-bold">
                            {result.pena_final_meses} meses ({result.pena_final_anos} anos)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Outras calculadoras - Placeholder */}
              {activeCalc !== 'pena-trifasico' && (
                <div className="text-center py-12 text-elite-metal">
                  <div className="text-4xl mb-4">🚧</div>
                  <p>Calculadora em desenvolvimento</p>
                </div>
              )}
            </CipherGlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculadoras;
