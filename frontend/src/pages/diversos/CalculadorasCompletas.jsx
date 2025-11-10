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

  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

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
    reincidente: false
  });

  useEffect(() => {
    loadCalculadorasList();
  }, []);

  const loadCalculadorasList = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/calculadoras-completas/list`);
      setCalculadorasList(response.data);
    } catch (error) {
      console.error('Error loading calculadoras:', error);
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
