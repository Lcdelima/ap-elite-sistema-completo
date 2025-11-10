import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

const CalculadorasCompletas = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('penal');
  const [activeCalc, setActiveCalc] = useState('dosimetria');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [calculadorasList, setCalculadorasList] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [crimes, setCrimes] = useState([{ id: 1, nome: 'Crime 1', resultado: null }]);
  const [crimeAtivo, setCrimeAtivo] = useState(1);

  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Conversor de tempo
  const [conversor, setConversor] = useState({ dias: 0, meses: 0, anos: 0 });

  // Estados para Dosimetria
  const [dosimetria, setDosimetria] = useState({
    tipo_penal: '',
    minimo_meses: 48,
    maximo_meses: 120,
    fase1_vetores: {
      culpabilidade: 0,
      antecedentes: 0,
      conduta_social: 0,
      personalidade: 0,
      motivos: 0,
      circunstancias: 0,
      consequencias: 0,
      comportamento_vitima: 0,
      justificativas: {}
    },
    fase2: {
      agravantes: [],
      atenuantes: [],
      sumula_231_ativa: true
    },
    minorantes: [],
    majorantes: [],
    continuidade: null,
    concurso: null,
    multa: {
      dias_min: 10,
      dias_max: 360,
      valor_dia_salarios_minimos: 1.5,
      fundamentacao_socioecon: ''
    },
    reincidente: false,
    tempo_cumprido_meses: 0
  });

  useEffect(() => {
    loadCalculadorasList();
    loadHistorico();
  }, []);

  const loadCalculadorasList = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/calculadoras-completas/list`);
      setCalculadorasList(response.data);
    } catch (error) {
      console.error('Error loading calculadoras:', error);
    }
  };

  const loadHistorico = async () => {
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.get(
        `${API_BASE}/api/calculadoras-completas/historico`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setHistorico(response.data.calculos || []);
    } catch (error) {
      console.error('Error loading historico:', error);
    }
  };

  // Conversor de tempo
  const converterTempo = (tipo, valor) => {
    if (tipo === 'dias') {
      setConversor({
        dias: valor,
        meses: (valor / 30).toFixed(2),
        anos: (valor / 365).toFixed(2)
      });
    } else if (tipo === 'meses') {
      setConversor({
        dias: (valor * 30).toFixed(0),
        meses: valor,
        anos: (valor / 12).toFixed(2)
      });
    } else if (tipo === 'anos') {
      setConversor({
        dias: (valor * 365).toFixed(0),
        meses: (valor * 12).toFixed(2),
        anos: valor
      });
    }
  };

  const categorias = [
    { id: 'penal', nome: 'Direito Penal', icon: '⚖️', color: 'purple', total: 14 },
    { id: 'civil', nome: 'Direito Civil', icon: '📜', color: 'blue', total: 8 },
    { id: 'tributario', nome: 'Direito Tributário', icon: '💰', color: 'yellow', total: 7 },
    { id: 'trabalhista', nome: 'Direito Trabalhista', icon: '👔', color: 'green', total: 7 },
    { id: 'financeiro', nome: 'Financeiro', icon: '📊', color: 'teal', total: 8 },
    { id: 'pericial', nome: 'Pericial', icon: '🔬', color: 'pink', total: 6 },
    { id: 'diversas', nome: 'Diversas', icon: '🔧', color: 'gray', total: 4 }
  ];

  const calculadorasPorCategoria = {
    penal: [
      { id: 'dosimetria', nome: 'Dosimetria de Pena (Trifásico Completo)', endpoint: '/dosimetria/calcular' },
      { id: 'prescricao', nome: 'Prescrição Penal', endpoint: '/criminal/prescricao' },
      { id: 'prescricao-intercorrente', nome: 'Prescrição Intercorrente', endpoint: '/criminal/prescricao-intercorrente' },
      { id: 'livramento', nome: 'Livramento Condicional', endpoint: '/criminal/livramento-condicional' },
      { id: 'unificacao', nome: 'Unificação de Penas', endpoint: '/criminal/unificacao-penas' },
      { id: 'progressao', nome: 'Progressão de Regime', endpoint: '/criminal/progressao' },
      { id: 'remicao', nome: 'Remição de Pena', endpoint: '/criminal/remicao' },
      { id: 'detracao', nome: 'Detração', endpoint: '/criminal/detracao' }
    ],
    civil: [
      { id: 'correcao', nome: 'Correção Monetária', endpoint: '/civil/correcao-monetaria' },
      { id: 'juros-mora', nome: 'Juros de Mora', endpoint: '/civil/juros-mora' },
      { id: 'honorarios', nome: 'Honorários Advocatícios', endpoint: '/civil/honorarios-advocaticios' }
    ],
    tributario: [
      { id: 'ipva', nome: 'IPVA Atrasado', endpoint: '/tributario/ipva-atrasado' },
      { id: 'itcmd', nome: 'ITCMD/ITBI', endpoint: '/tributario/itcmd-itbi' },
      { id: 'decadencia', nome: 'Decadência Tributária', endpoint: '/tributario/decadencia' },
      { id: 'planejamento', nome: 'Planejamento Tributário', endpoint: '/tributario/planejamento' }
    ],
    trabalhista: [
      { id: 'horas-extras', nome: 'Horas Extras e Reflexos', endpoint: '/trabalhista/horas-extras' },
      { id: 'rescisao', nome: 'Rescisão Completa', endpoint: '/trabalhista/rescisao-completa' },
      { id: 'diferenca-salarial', nome: 'Diferença Salarial', endpoint: '/trabalhista/diferenca-salarial' },
      { id: 'prescricao-trab', nome: 'Prescrição Trabalhista', endpoint: '/trabalhista/prescricao-trabalhista' }
    ],
    financeiro: [
      { id: 'juros-compostos', nome: 'Juros Compostos', endpoint: '/financeiro/juros-compostos' },
      { id: 'vp-vf', nome: 'Valor Presente/Futuro', endpoint: '/financeiro/valor-presente-futuro' },
      { id: 'amortizacao', nome: 'Amortização SAC/PRICE', endpoint: '/financeiro/amortizacao-sac-price' },
      { id: 'payback', nome: 'Payback/VPL/TIR', endpoint: '/financeiro/payback-vpn-tir' }
    ],
    pericial: [
      { id: 'erro-percentual', nome: 'Erro Percentual', endpoint: '/pericial/erro-percentual' },
      { id: 'desvio-padrao', nome: 'Desvio Padrão e Variância', endpoint: '/pericial/desvio-padrao-variancia' },
      { id: 'media-ponderada', nome: 'Média Ponderada', endpoint: '/pericial/media-ponderada' },
      { id: 'probabilidade', nome: 'Probabilidade Forense', endpoint: '/pericial/probabilidade-forense' }
    ],
    diversas: [
      { id: 'prescricao-civel', nome: 'Prescrição Cível', endpoint: '/diversos/prescricao-civel' },
      { id: 'conversao-unidades', nome: 'Conversão de Unidades Forenses', endpoint: '/diversos/conversao-unidades-forenses' },
      { id: 'custas', nome: 'Custas Processuais', endpoint: '/diversos/custas-processuais' }
    ]
  };

  const calcularDosimetria = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.post(
        `${API_BASE}/api/calculadoras-completas/dosimetria/calcular`,
        dosimetria,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Atualizar crime ativo com resultado
      setCrimes(crimes.map(c => 
        c.id === crimeAtivo ? { ...c, resultado: response.data, nome: dosimetria.tipo_penal || c.nome } : c
      ));
      
      setResult(response.data);
      toast.success('Cálculo realizado com sucesso!');
      await loadHistorico();
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao calcular: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const adicionarCrime = () => {
    const novoId = Math.max(...crimes.map(c => c.id)) + 1;
    setCrimes([...crimes, { id: novoId, nome: `Crime ${novoId}`, resultado: null }]);
    setCrimeAtivo(novoId);
    setResult(null);
    toast.success(`Crime ${novoId} adicionado`);
  };

  const removerCrime = (id) => {
    if (crimes.length === 1) {
      toast.error('Deve haver pelo menos 1 crime');
      return;
    }
    setCrimes(crimes.filter(c => c.id !== id));
    if (crimeAtivo === id) {
      setCrimeAtivo(crimes[0].id);
    }
    toast.success('Crime removido');
  };

  const calcularConcursoMaterial = () => {
    const crimesCalculados = crimes.filter(c => c.resultado);
    if (crimesCalculados.length < 2) {
      toast.error('Calcule pelo menos 2 crimes para somar');
      return;
    }

    const penasIndividuais = crimesCalculados.map(c => ({
      crime: c.nome,
      pena_meses: c.resultado.resumo.pena_final_meses,
      regime: c.resultado.regime_inicial.regime
    }));

    const soma_total_meses = penasIndividuais.reduce((acc, p) => acc + p.pena_meses, 0);
    const soma_anos_meses = converterMesesParaAnosMeses(soma_total_meses);

    // Determinar regime mais gravoso
    const regimes_ordem = { 'fechado': 3, 'semiaberto': 2, 'aberto': 1 };
    const regime_mais_gravoso = penasIndividuais.reduce((prev, curr) => 
      regimes_ordem[curr.regime] > regimes_ordem[prev.regime] ? curr : prev
    ).regime;

    const resultadoConcurso = {
      tipo: 'concurso_material',
      crimes: penasIndividuais,
      soma_total_meses: soma_total_meses,
      soma_total_formatado: soma_anos_meses,
      regime_final: regime_mais_gravoso,
      quantidade_crimes: crimesCalculados.length
    };

    setResult(resultadoConcurso);
    toast.success(`Concurso material calculado: ${soma_anos_meses}`);
  };

  const converterMesesParaAnosMeses = (totalMeses) => {
    const anos = Math.floor(totalMeses / 12);
    const meses = Math.floor(totalMeses % 12);
    const dias = Math.floor((totalMeses % 1) * 30);
    
    let resultado = [];
    if (anos > 0) resultado.push(`${anos} ano${anos !== 1 ? 's' : ''}`);
    if (meses > 0) resultado.push(`${meses} ${meses !== 1 ? 'meses' : 'mês'}`);
    if (dias > 0) resultado.push(`${dias} dia${dias !== 1 ? 's' : ''}`);
    
    return resultado.length > 0 ? resultado.join(' e ') : '0 dias';
  };

  const renderDosimetriaForm = () => (
    <div className="space-y-6">
      {/* Conversor de Tempo */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3">
          🔄 Conversor de Tempo (Dias ↔ Meses ↔ Anos)
        </h3>
        <div className="grid grid-cols-3 gap-4">
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
      </div>

      {/* Gestão de Crimes Múltiplos */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-purple-400">
            📚 Crimes ({crimes.length})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={adicionarCrime}
              className="px-3 py-1 bg-green-600/20 border border-green-600 text-green-400 rounded-lg text-sm hover:bg-green-600/30"
            >
              ➕ Adicionar Crime
            </button>
            <button
              onClick={calcularConcursoMaterial}
              disabled={crimes.filter(c => c.resultado).length < 2}
              className="px-3 py-1 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 disabled:opacity-50"
            >
              ∑ Somar Todos (Concurso Material)
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {crimes.map((crime) => (
            <button
              key={crime.id}
              onClick={() => {
                setCrimeAtivo(crime.id);
                if (crime.resultado) setResult(crime.resultado);
              }}
              className={`px-4 py-2 rounded-lg transition-all ${
                crimeAtivo === crime.id
                  ? 'bg-purple-600 text-white'
                  : crime.resultado
                  ? 'bg-green-600/20 border border-green-600 text-green-400'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {crime.nome}
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
      </div>

      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-400 mb-2">
          📋 {crimes.find(c => c.id === crimeAtivo)?.nome || 'Crime 1'}
        </h3>
        <p className="text-gray-400 text-sm">
          Método trifásico (art. 68 CP) com todas as fases, vetores e fundamentações legais
        </p>
      </div>

      {/* Tipo Penal */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Tipo Penal
        </label>
        <input
          type="text"
          value={dosimetria.tipo_penal}
          onChange={(e) => setDosimetria({...dosimetria, tipo_penal: e.target.value})}
          placeholder="Ex: Art. 157 §2º-A, I (Roubo majorado)"
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Pena Abstrata */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Pena Mínima (meses)
          </label>
          <input
            type="number"
            value={dosimetria.minimo_meses}
            onChange={(e) => setDosimetria({...dosimetria, minimo_meses: parseInt(e.target.value)})}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="text-xs text-gray-500 mt-1">
            = {converterMesesParaAnosMeses(dosimetria.minimo_meses)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Pena Máxima (meses)
          </label>
          <input
            type="number"
            value={dosimetria.maximo_meses}
            onChange={(e) => setDosimetria({...dosimetria, maximo_meses: parseInt(e.target.value)})}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="text-xs text-gray-500 mt-1">
            = {converterMesesParaAnosMeses(dosimetria.maximo_meses)}
          </div>
        </div>
      </div>

      {/* Fase 1: Vetores do art. 59 */}
      <div className="border border-cyan-500/30 rounded-lg p-4">
        <h4 className="text-cyan-400 font-semibold mb-4">📊 Fase 1: Pena-base (art. 59 CP)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(dosimetria.fase1_vetores).filter(k => k !== 'justificativas').map((vetor) => (
            <div key={vetor}>
              <label className="block text-xs text-gray-400 mb-1 capitalize">
                {vetor.replace(/_/g, ' ')}
              </label>
              <input
                type="number"
                min="-2"
                max="2"
                value={dosimetria.fase1_vetores[vetor]}
                onChange={(e) => setDosimetria({
                  ...dosimetria,
                  fase1_vetores: {
                    ...dosimetria.fase1_vetores,
                    [vetor]: parseInt(e.target.value)
                  }
                })}
                className="w-full bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-white text-center"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Escala: -2 (muito favorável) a +2 (muito desfavorável)
        </p>
      </div>

      {/* Fase 2: Atenuantes/Agravantes */}
      <div className="border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-semibold mb-4">⚡ Fase 2: Atenuantes/Agravantes (art. 61-66)</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Atenuantes</label>
            <div className="space-y-2">
              {['confissao', 'menoridade_relativa', 'reparacao_dano', 'coacao_resistivel'].map(at => (
                <label key={at} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={dosimetria.fase2.atenuantes.includes(at)}
                    onChange={(e) => {
                      const newAt = e.target.checked 
                        ? [...dosimetria.fase2.atenuantes, at]
                        : dosimetria.fase2.atenuantes.filter(a => a !== at);
                      setDosimetria({
                        ...dosimetria,
                        fase2: { ...dosimetria.fase2, atenuantes: newAt }
                      });
                    }}
                    className="rounded border-gray-700 bg-gray-800"
                  />
                  <span className="text-gray-300 text-sm capitalize">{at.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Agravantes</label>
            <div className="space-y-2">
              {['reincidencia', 'meio_cruel', 'contra_ascendente', 'crianca_adolescente'].map(ag => (
                <label key={ag} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={dosimetria.fase2.agravantes.includes(ag)}
                    onChange={(e) => {
                      const newAg = e.target.checked
                        ? [...dosimetria.fase2.agravantes, ag]
                        : dosimetria.fase2.agravantes.filter(a => a !== ag);
                      setDosimetria({
                        ...dosimetria,
                        fase2: { ...dosimetria.fase2, agravantes: newAg }
                      });
                    }}
                    className="rounded border-gray-700 bg-gray-800"
                  />
                  <span className="text-gray-300 text-sm capitalize">{ag.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={dosimetria.fase2.sumula_231_ativa}
              onChange={(e) => setDosimetria({
                ...dosimetria,
                fase2: { ...dosimetria.fase2, sumula_231_ativa: e.target.checked }
              })}
              className="rounded border-gray-700 bg-gray-800"
            />
            <span className="text-gray-300 text-sm">Aplicar Súmula 231 STJ (não reduz abaixo do mínimo)</span>
          </label>
        </div>
      </div>

      {/* Fase 3: Majorantes/Minorantes */}
      <div className="border border-purple-500/30 rounded-lg p-4">
        <h4 className="text-purple-400 font-semibold mb-4">🔺 Fase 3: Majorantes e Minorantes</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Majorantes (causas de aumento)</label>
            <button
              onClick={() => {
                setDosimetria({
                  ...dosimetria,
                  majorantes: [...dosimetria.majorantes, { nome: 'nova_majorante', fracao: 0.2 }]
                });
              }}
              className="w-full mb-2 px-3 py-2 bg-red-600/20 border border-red-600 text-red-400 rounded text-sm hover:bg-red-600/30"
            >
              ➕ Adicionar Majorante
            </button>
            {dosimetria.majorantes.map((maj, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={maj.nome}
                  onChange={(e) => {
                    const newMaj = [...dosimetria.majorantes];
                    newMaj[idx].nome = e.target.value;
                    setDosimetria({ ...dosimetria, majorantes: newMaj });
                  }}
                  placeholder="Ex: arma_de_fogo"
                  className="flex-1 bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                />
                <input
                  type="number"
                  step="0.1"
                  value={maj.fracao}
                  onChange={(e) => {
                    const newMaj = [...dosimetria.majorantes];
                    newMaj[idx].fracao = parseFloat(e.target.value);
                    setDosimetria({ ...dosimetria, majorantes: newMaj });
                  }}
                  className="w-20 bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-white text-sm text-center"
                />
                <button
                  onClick={() => {
                    setDosimetria({
                      ...dosimetria,
                      majorantes: dosimetria.majorantes.filter((_, i) => i !== idx)
                    });
                  }}
                  className="px-2 text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Minorantes (causas de diminuição)</label>
            <button
              onClick={() => {
                setDosimetria({
                  ...dosimetria,
                  minorantes: [...dosimetria.minorantes, { nome: 'nova_minorante', fracao: 0.333 }]
                });
              }}
              className="w-full mb-2 px-3 py-2 bg-green-600/20 border border-green-600 text-green-400 rounded text-sm hover:bg-green-600/30"
            >
              ➕ Adicionar Minorante
            </button>
            {dosimetria.minorantes.map((min, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={min.nome}
                  onChange={(e) => {
                    const newMin = [...dosimetria.minorantes];
                    newMin[idx].nome = e.target.value;
                    setDosimetria({ ...dosimetria, minorantes: newMin });
                  }}
                  placeholder="Ex: tentativa"
                  className="flex-1 bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                />
                <input
                  type="number"
                  step="0.1"
                  max="1"
                  value={min.fracao}
                  onChange={(e) => {
                    const newMin = [...dosimetria.minorantes];
                    newMin[idx].fracao = parseFloat(e.target.value);
                    setDosimetria({ ...dosimetria, minorantes: newMin });
                  }}
                  className="w-20 bg-gray-800/50 border border-gray-700 rounded px-2 py-1 text-white text-sm text-center"
                />
                <button
                  onClick={() => {
                    setDosimetria({
                      ...dosimetria,
                      minorantes: dosimetria.minorantes.filter((_, i) => i !== idx)
                    });
                  }}
                  className="px-2 text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Continuidade Delitiva */}
      <div className="border border-yellow-500/30 rounded-lg p-4">
        <h4 className="text-yellow-400 font-semibold mb-3">🔗 Continuidade Delitiva (art. 71 CP)</h4>
        <label className="flex items-center space-x-2 mb-3">
          <input
            type="checkbox"
            checked={dosimetria.continuidade !== null}
            onChange={(e) => {
              setDosimetria({
                ...dosimetria,
                continuidade: e.target.checked ? {
                  quantidade_crimes: 2,
                  fracao: 0.1667,
                  fundamentacao: ''
                } : null
              });
            }}
            className="rounded border-gray-700 bg-gray-800"
          />
          <span className="text-gray-300">Aplicar continuidade delitiva</span>
        </label>
        {dosimetria.continuidade && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Quantidade de Crimes</label>
              <input
                type="number"
                min="2"
                max="10"
                value={dosimetria.continuidade.quantidade_crimes}
                onChange={(e) => setDosimetria({
                  ...dosimetria,
                  continuidade: { ...dosimetria.continuidade, quantidade_crimes: parseInt(e.target.value) }
                })}
                className="w-full bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fração (1/6 = 0.1667, 1/3 = 0.333)</label>
              <select
                value={dosimetria.continuidade.fracao}
                onChange={(e) => setDosimetria({
                  ...dosimetria,
                  continuidade: { ...dosimetria.continuidade, fracao: parseFloat(e.target.value) }
                })}
                className="w-full bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option value="0.1667">1/6 (16.67%)</option>
                <option value="0.2">1/5 (20%)</option>
                <option value="0.25">1/4 (25%)</option>
                <option value="0.333">1/3 (33.3%)</option>
                <option value="0.5">1/2 (50%)</option>
                <option value="0.6667">2/3 (66.67%)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Reincidência e Detração */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-red-500/30 rounded-lg p-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={dosimetria.reincidente}
              onChange={(e) => setDosimetria({ ...dosimetria, reincidente: e.target.checked })}
              className="rounded border-gray-700 bg-gray-800"
            />
            <span className="text-red-400 font-semibold">⚠️ Reincidente</span>
          </label>
        </div>
        <div className="border border-green-500/30 rounded-lg p-4">
          <label className="block text-xs text-gray-400 mb-1">Tempo Cumprido (Detração - meses)</label>
          <input
            type="number"
            min="0"
            value={dosimetria.tempo_cumprido_meses}
            onChange={(e) => setDosimetria({ ...dosimetria, tempo_cumprido_meses: parseInt(e.target.value) || 0 })}
            className="w-full bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-white"
          />
        </div>
      </div>

      {/* Botão Calcular */}
      <button
        onClick={calcularDosimetria}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-purple-500 via-blue-600 to-cyan-500 text-white font-bold text-lg rounded-lg hover:from-purple-600 hover:via-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 shadow-lg"
      >
        {loading ? 'Calculando...' : '⚖️ CALCULAR DOSIMETRIA'}
      </button>

      {/* Resultado */}
      {result && result.tipo !== 'concurso_material' && (
        <div className="mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-400 mb-4">✅ Resultado do Cálculo</h3>
          
          <div className="space-y-4">
            {/* Resumo */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-cyan-400 font-semibold mb-3">📋 Resumo Executivo</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Pena Final:</span>
                  <span className="text-white font-bold ml-2">{result.resumo?.pena_final_anos_meses}</span>
                </div>
                <div>
                  <span className="text-gray-400">Regime:</span>
                  <span className="text-white font-bold ml-2">{result.regime_inicial?.regime}</span>
                </div>
                {result.resumo?.pena_a_executar_anos_meses !== result.resumo?.pena_final_anos_meses && (
                  <div>
                    <span className="text-gray-400">Pena a Executar (após detração):</span>
                    <span className="text-white font-bold ml-2">{result.resumo?.pena_a_executar_anos_meses}</span>
                  </div>
                )}
                {result.multa && (
                  <div>
                    <span className="text-gray-400">Multa:</span>
                    <span className="text-white font-bold ml-2">
                      {result.multa.dias_multa} dias × R$ {result.multa.valor_dia_reais} = R$ {result.multa.valor_total_reais.toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
                {result.resumo?.substituicao_possivel && (
                  <div className="col-span-2">
                    <span className="px-3 py-1 bg-green-600/20 border border-green-600 text-green-400 rounded-full text-xs">
                      ✅ Possível substituição por restritivas (art. 44)
                    </span>
                  </div>
                )}
                {result.resumo?.sursis_possivel && (
                  <div className="col-span-2">
                    <span className="px-3 py-1 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-full text-xs">
                      ✅ Possível sursis (art. 77)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Fases */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <div className="text-purple-400 text-xs font-semibold mb-1">Fase 1: Pena-base</div>
                <div className="text-white text-xl font-bold">{result.fase1_pena_base?.pena_anos} anos</div>
                <div className="text-gray-400 text-xs mt-1">{result.fase1_pena_base?.pena_meses} meses</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-400 text-xs font-semibold mb-1">Fase 2: Intermediária</div>
                <div className="text-white text-xl font-bold">{result.fase2_intermediaria?.pena_anos} anos</div>
                <div className="text-gray-400 text-xs mt-1">{result.fase2_intermediaria?.pena_meses} meses</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                <div className="text-cyan-400 text-xs font-semibold mb-1">Fase 3: Final</div>
                <div className="text-white text-xl font-bold">{result.fase3_final?.pena_anos} anos</div>
                <div className="text-gray-400 text-xs mt-1">{result.fase3_final?.pena_meses} meses</div>
              </div>
            </div>

            {/* Detalhamento */}
            {result.continuidade_delitiva && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="text-yellow-400 text-sm font-semibold mb-2">🔗 Continuidade Delitiva</div>
                <div className="text-gray-300 text-xs">
                  {result.continuidade_delitiva.quantidade_crimes} crimes × fração {(result.continuidade_delitiva.fracao * 100).toFixed(1)}% = +{result.continuidade_delitiva.aumento_meses} meses
                </div>
              </div>
            )}

            {/* Hash */}
            <div className="text-xs">
              <span className="text-gray-400">Hash SHA-256:</span>
              <span className="text-gray-500 font-mono ml-2 text-[10px]">{result.hash_sha256}</span>
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                  toast.success('Resultado copiado!');
                }}
                className="flex-1 px-4 py-2 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-lg hover:bg-blue-600/30"
              >
                📋 Copiar JSON
              </button>
              <button
                onClick={() => toast.info('Exportação PDF em desenvolvimento')}
                className="flex-1 px-4 py-2 bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/30"
              >
                📄 Exportar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resultado Concurso Material */}
      {result && result.tipo === 'concurso_material' && (
        <div className="mt-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-orange-400 mb-4">∑ Concurso Material (art. 69 CP)</h3>
          
          <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white mb-2">
                PENA TOTAL: {result.soma_total_formatado}
              </div>
              <div className="text-gray-400 text-sm">
                {result.quantidade_crimes} crimes somados
              </div>
              <div className="text-gray-400 text-sm">
                Regime final: <span className="text-white font-bold">{result.regime_final.toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-orange-400 font-semibold text-sm">Crimes individuais:</h4>
              {result.crimes.map((crime, idx) => (
                <div key={idx} className="bg-gray-800/30 rounded p-3 flex justify-between items-center">
                  <span className="text-gray-300 text-sm">{crime.crime}</span>
                  <div className="text-right">
                    <div className="text-white font-semibold">{converterMesesParaAnosMeses(crime.pena_meses)}</div>
                    <div className="text-gray-500 text-xs">Regime: {crime.regime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Histórico */}
      {historico.length > 0 && (
        <div className="mt-6 border border-gray-700 rounded-lg p-4">
          <h4 className="text-gray-300 font-semibold mb-3">📚 Histórico de Cálculos (últimos 5)</h4>
          <div className="space-y-2">
            {historico.slice(0, 5).map((calc, idx) => (
              <div key={idx} className="bg-gray-800/30 rounded p-3 text-sm">
                <div className="text-white font-semibold">{calc.input_data?.tipo_penal || 'Cálculo'}</div>
                <div className="text-gray-400 text-xs">
                  {calc.resultado?.pena_final_anos_meses || `${calc.resultado?.pena_final_meses} meses`} - {new Date(calc.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0A0E12] to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/athena')}
            className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center"
          >
            ← Voltar para Athena
          </button>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
            Calculadoras Jurídicas Elite 🧮
          </h1>
          <p className="text-gray-400 text-lg">
            54 calculadoras especializadas com conversores, múltiplos crimes e concurso material
          </p>
        </div>

        {/* Categorias */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setActiveCalc(calculadorasPorCategoria[cat.id][0]?.id);
                setResult(null);
              }}
              className={`p-4 rounded-xl transition-all ${
                activeCategory === cat.id
                  ? 'bg-purple-500/20 border-2 border-purple-500'
                  : 'bg-white/5 border border-gray-700 hover:bg-white/10'
              }`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className={`text-sm font-semibold ${activeCategory === cat.id ? 'text-purple-400' : 'text-gray-300'}`}>
                {cat.nome}
              </div>
              <div className="text-xs text-gray-500 mt-1">{cat.total} calculadoras</div>
            </button>
          ))}
        </div>

        {/* Layout Principal */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar de Calculadoras */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">
                Calculadoras
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {calculadorasPorCategoria[activeCategory]?.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => {
                      setActiveCalc(calc.id);
                      setResult(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeCalc === calc.id
                        ? 'bg-purple-500/20 border border-purple-500'
                        : 'bg-gray-800/30 border border-gray-700 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="text-white text-sm font-medium">
                      {calc.nome}
                    </div>
                  </button>
                ))}
              </div>

              {/* Info */}
              {calculadorasList && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-4">
                  <div className="text-blue-400 font-semibold mb-1 text-sm">📊 Sistema</div>
                  <div className="text-xs text-gray-300">
                    Total: {calculadorasList.total} calculadoras
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {crimes.filter(c => c.resultado).length} crimes calculados
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Área Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {calculadorasPorCategoria[activeCategory]?.find(c => c.id === activeCalc)?.nome}
              </h2>

              {/* Renderizar formulário conforme calculadora ativa */}
              {activeCalc === 'dosimetria' && renderDosimetriaForm()}

              {/* Placeholder para outras calculadoras */}
              {activeCalc !== 'dosimetria' && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚧</div>
                  <p className="text-gray-400 text-lg mb-2">
                    Calculadora "{calculadorasPorCategoria[activeCategory]?.find(c => c.id === activeCalc)?.nome}"
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    Backend implementado e funcional. Interface em desenvolvimento.
                  </p>
                  <div className="mt-4 text-xs text-gray-600">
                    Endpoint: /api/calculadoras-completas{calculadorasPorCategoria[activeCategory]?.find(c => c.id === activeCalc)?.endpoint}
                  </div>
                  <button
                    onClick={() => toast.info('Interface em desenvolvimento. Backend 100% funcional.')}
                    className="mt-4 px-6 py-2 bg-purple-600/20 border border-purple-600 text-purple-400 rounded-lg hover:bg-purple-600/30"
                  >
                    📋 Ver Documentação da API
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculadorasCompletas;


  const categorias = [
    { id: 'penal', nome: 'Direito Penal', icon: '⚖️', color: 'purple', total: 14 },
    { id: 'civil', nome: 'Direito Civil', icon: '📜', color: 'blue', total: 8 },
    { id: 'tributario', nome: 'Direito Tributário', icon: '💰', color: 'yellow', total: 7 },
    { id: 'trabalhista', nome: 'Direito Trabalhista', icon: '👔', color: 'green', total: 7 },
    { id: 'financeiro', nome: 'Financeiro', icon: '📊', color: 'teal', total: 8 },
    { id: 'pericial', nome: 'Pericial', icon: '🔬', color: 'pink', total: 6 },
    { id: 'diversas', nome: 'Diversas', icon: '🔧', color: 'gray', total: 4 }
  ];

  const calculadorasPorCategoria = {
    penal: [
      { id: 'dosimetria', nome: 'Dosimetria de Pena (Trifásico Completo)', endpoint: '/dosimetria/calcular' },
      { id: 'prescricao', nome: 'Prescrição Penal', endpoint: '/criminal/prescricao' },
      { id: 'prescricao-intercorrente', nome: 'Prescrição Intercorrente', endpoint: '/criminal/prescricao-intercorrente' },
      { id: 'livramento', nome: 'Livramento Condicional', endpoint: '/criminal/livramento-condicional' },
      { id: 'unificacao', nome: 'Unificação de Penas', endpoint: '/criminal/unificacao-penas' },
      { id: 'progressao', nome: 'Progressão de Regime', endpoint: '/criminal/progressao' },
      { id: 'remicao', nome: 'Remição de Pena', endpoint: '/criminal/remicao' },
      { id: 'detracao', nome: 'Detração', endpoint: '/criminal/detracao' }
    ],
    civil: [
      { id: 'correcao', nome: 'Correção Monetária', endpoint: '/civil/correcao-monetaria' },
      { id: 'juros-mora', nome: 'Juros de Mora', endpoint: '/civil/juros-mora' },
      { id: 'honorarios', nome: 'Honorários Advocatícios', endpoint: '/civil/honorarios-advocaticios' }
    ],
    tributario: [
      { id: 'ipva', nome: 'IPVA Atrasado', endpoint: '/tributario/ipva-atrasado' },
      { id: 'itcmd', nome: 'ITCMD/ITBI', endpoint: '/tributario/itcmd-itbi' },
      { id: 'decadencia', nome: 'Decadência Tributária', endpoint: '/tributario/decadencia' },
      { id: 'planejamento', nome: 'Planejamento Tributário', endpoint: '/tributario/planejamento' }
    ],
    trabalhista: [
      { id: 'horas-extras', nome: 'Horas Extras e Reflexos', endpoint: '/trabalhista/horas-extras' },
      { id: 'rescisao', nome: 'Rescisão Completa', endpoint: '/trabalhista/rescisao-completa' },
      { id: 'diferenca-salarial', nome: 'Diferença Salarial', endpoint: '/trabalhista/diferenca-salarial' },
      { id: 'prescricao-trab', nome: 'Prescrição Trabalhista', endpoint: '/trabalhista/prescricao-trabalhista' }
    ],
    financeiro: [
      { id: 'juros-compostos', nome: 'Juros Compostos', endpoint: '/financeiro/juros-compostos' },
      { id: 'vp-vf', nome: 'Valor Presente/Futuro', endpoint: '/financeiro/valor-presente-futuro' },
      { id: 'amortizacao', nome: 'Amortização SAC/PRICE', endpoint: '/financeiro/amortizacao-sac-price' },
      { id: 'payback', nome: 'Payback/VPL/TIR', endpoint: '/financeiro/payback-vpn-tir' }
    ],
    pericial: [
      { id: 'erro-percentual', nome: 'Erro Percentual', endpoint: '/pericial/erro-percentual' },
      { id: 'desvio-padrao', nome: 'Desvio Padrão e Variância', endpoint: '/pericial/desvio-padrao-variancia' },
      { id: 'media-ponderada', nome: 'Média Ponderada', endpoint: '/pericial/media-ponderada' },
      { id: 'probabilidade', nome: 'Probabilidade Forense', endpoint: '/pericial/probabilidade-forense' }
    ],
    diversas: [
      { id: 'prescricao-civel', nome: 'Prescrição Cível', endpoint: '/diversos/prescricao-civel' },
      { id: 'conversao-unidades', nome: 'Conversão de Unidades Forenses', endpoint: '/diversos/conversao-unidades-forenses' },
      { id: 'custas', nome: 'Custas Processuais', endpoint: '/diversos/custas-processuais' }
    ]
  };

  const calcularDosimetria = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('ap_elite_token');
      const response = await axios.post(
        `${API_BASE}/api/calculadoras-completas/dosimetria/calcular`,
        dosimetria,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setResult(response.data);
      toast.success('Cálculo realizado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao calcular: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const renderDosimetriaForm = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-400 mb-2">
          📋 Calculadora de Dosimetria de Pena Completa
        </h3>
        <p className="text-gray-400 text-sm">
          Método trifásico (art. 68 CP) com todas as fases, vetores e fundamentações legais
        </p>
      </div>

      {/* Tipo Penal */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Tipo Penal
        </label>
        <input
          type="text"
          value={dosimetria.tipo_penal}
          onChange={(e) => setDosimetria({...dosimetria, tipo_penal: e.target.value})}
          placeholder="Ex: Art. 157 §2º-A, I (Roubo majorado)"
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Pena Abstrata */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Pena Mínima (meses)
          </label>
          <input
            type="number"
            value={dosimetria.minimo_meses}
            onChange={(e) => setDosimetria({...dosimetria, minimo_meses: parseInt(e.target.value)})}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Pena Máxima (meses)
          </label>
          <input
            type="number"
            value={dosimetria.maximo_meses}
            onChange={(e) => setDosimetria({...dosimetria, maximo_meses: parseInt(e.target.value)})}
            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Fase 1: Vetores do art. 59 */}
      <div className="border border-cyan-500/30 rounded-lg p-4">
        <h4 className="text-cyan-400 font-semibold mb-4">📊 Fase 1: Pena-base (art. 59 CP)</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(dosimetria.fase1_vetores).filter(k => k !== 'justificativas').map((vetor) => (
            <div key={vetor}>
              <label className="block text-xs text-gray-400 mb-1 capitalize">
                {vetor.replace('_', ' ')}
              </label>
              <input
                type="number"
                min="-2"
                max="2"
                value={dosimetria.fase1_vetores[vetor]}
                onChange={(e) => setDosimetria({
                  ...dosimetria,
                  fase1_vetores: {
                    ...dosimetria.fase1_vetores,
                    [vetor]: parseInt(e.target.value)
                  }
                })}
                className="w-full bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-white text-center"
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Escala: -2 (muito favorável) a +2 (muito desfavorável)
        </p>
      </div>

      {/* Fase 2: Atenuantes/Agravantes */}
      <div className="border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-semibold mb-4">⚡ Fase 2: Atenuantes/Agravantes (art. 61-66)</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Atenuantes</label>
            <div className="space-y-2">
              {['confissao', 'menoridade_relativa', 'reparacao_dano'].map(at => (
                <label key={at} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={dosimetria.fase2.atenuantes.includes(at)}
                    onChange={(e) => {
                      const newAt = e.target.checked 
                        ? [...dosimetria.fase2.atenuantes, at]
                        : dosimetria.fase2.atenuantes.filter(a => a !== at);
                      setDosimetria({
                        ...dosimetria,
                        fase2: { ...dosimetria.fase2, atenuantes: newAt }
                      });
                    }}
                    className="rounded border-gray-700 bg-gray-800"
                  />
                  <span className="text-gray-300 text-sm capitalize">{at.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Agravantes</label>
            <div className="space-y-2">
              {['reincidencia', 'meio_cruel', 'contra_ascendente'].map(ag => (
                <label key={ag} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={dosimetria.fase2.agravantes.includes(ag)}
                    onChange={(e) => {
                      const newAg = e.target.checked
                        ? [...dosimetria.fase2.agravantes, ag]
                        : dosimetria.fase2.agravantes.filter(a => a !== ag);
                      setDosimetria({
                        ...dosimetria,
                        fase2: { ...dosimetria.fase2, agravantes: newAg }
                      });
                    }}
                    className="rounded border-gray-700 bg-gray-800"
                  />
                  <span className="text-gray-300 text-sm capitalize">{ag.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botão Calcular */}
      <button
        onClick={calcularDosimetria}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-purple-500 via-blue-600 to-cyan-500 text-white font-bold text-lg rounded-lg hover:from-purple-600 hover:via-blue-700 hover:to-cyan-600 transition-all disabled:opacity-50 shadow-lg"
      >
        {loading ? 'Calculando...' : '⚖️ CALCULAR DOSIMETRIA'}
      </button>

      {/* Resultado */}
      {result && (
        <div className="mt-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-green-400 mb-4">✅ Resultado do Cálculo</h3>
          
          <div className="space-y-4">
            {/* Resumo */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <h4 className="text-cyan-400 font-semibold mb-3">📋 Resumo Executivo</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Pena Final:</span>
                  <span className="text-white font-bold ml-2">{result.resumo?.pena_final_anos_meses}</span>
                </div>
                <div>
                  <span className="text-gray-400">Regime:</span>
                  <span className="text-white font-bold ml-2">{result.regime_inicial?.regime}</span>
                </div>
                {result.multa && (
                  <div>
                    <span className="text-gray-400">Multa:</span>
                    <span className="text-white font-bold ml-2">
                      R$ {result.multa.valor_total_reais.toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Fases */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <div className="text-purple-400 text-xs font-semibold mb-1">Fase 1: Pena-base</div>
                <div className="text-white text-xl font-bold">{result.fase1_pena_base?.pena_anos} anos</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-400 text-xs font-semibold mb-1">Fase 2: Intermediária</div>
                <div className="text-white text-xl font-bold">{result.fase2_intermediaria?.pena_anos} anos</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                <div className="text-cyan-400 text-xs font-semibold mb-1">Fase 3: Final</div>
                <div className="text-white text-xl font-bold">{result.fase3_final?.pena_anos} anos</div>
              </div>
            </div>

            {/* Hash */}
            <div className="text-xs">
              <span className="text-gray-400">Hash SHA-256:</span>
              <span className="text-gray-500 font-mono ml-2">{result.hash_sha256}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0A0E12] to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/athena')}
            className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center"
          >
            ← Voltar para Athena
          </button>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
            Calculadoras Jurídicas Elite 🧮
          </h1>
          <p className="text-gray-400 text-lg">
            54 calculadoras especializadas para todas as áreas do direito
          </p>
        </div>

        {/* Categorias */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setActiveCalc(calculadorasPorCategoria[cat.id][0]?.id);
                setResult(null);
              }}
              className={`p-4 rounded-xl transition-all ${
                activeCategory === cat.id
                  ? `bg-${cat.color}-500/20 border-2 border-${cat.color}-500`
                  : 'bg-white/5 border border-gray-700 hover:bg-white/10'
              }`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className={`text-sm font-semibold ${activeCategory === cat.id ? `text-${cat.color}-400` : 'text-gray-300'}`}>
                {cat.nome}
              </div>
              <div className="text-xs text-gray-500 mt-1">{cat.total} calculadoras</div>
            </button>
          ))}
        </div>

        {/* Layout Principal */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar de Calculadoras */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">
                Calculadoras
              </h3>
              <div className="space-y-2">
                {calculadorasPorCategoria[activeCategory]?.map((calc) => (
                  <button
                    key={calc.id}
                    onClick={() => {
                      setActiveCalc(calc.id);
                      setResult(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      activeCalc === calc.id
                        ? 'bg-purple-500/20 border border-purple-500'
                        : 'bg-gray-800/30 border border-gray-700 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="text-white text-sm font-medium">
                      {calc.nome}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            {calculadorasList && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mt-4">
                <div className="text-blue-400 font-semibold mb-2">📊 Estatísticas</div>
                <div className="text-sm text-gray-300">
                  Total: {calculadorasList.total} calculadoras
                </div>
              </div>
            )}
          </div>

          {/* Área Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {calculadorasPorCategoria[activeCategory]?.find(c => c.id === activeCalc)?.nome}
              </h2>

              {/* Renderizar formulário conforme calculadora ativa */}
              {activeCalc === 'dosimetria' && renderDosimetriaForm()}

              {/* Placeholder para outras calculadoras */}
              {activeCalc !== 'dosimetria' && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚧</div>
                  <p className="text-gray-400 text-lg mb-2">
                    Calculadora "{calculadorasPorCategoria[activeCategory]?.find(c => c.id === activeCalc)?.nome}"
                  </p>
                  <p className="text-gray-500 text-sm">
                    Backend implementado e funcional. Interface em desenvolvimento.
                  </p>
                  <div className="mt-4 text-xs text-gray-600">
                    Endpoint: /api/calculadoras-completas{calculadorasPorCategoria[activeCategory]?.find(c => c.id === activeCalc)?.endpoint}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculadorasCompletas;
