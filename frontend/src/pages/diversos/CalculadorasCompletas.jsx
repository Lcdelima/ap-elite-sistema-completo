import React, { useState } from 'react';
import { Calculator, Scale, Briefcase, TrendingUp, Shield, Building2, Users, FileText } from 'lucide-react';
import CipherGlassCard from '../../components/ui/CipherGlassCard';
import axios from 'axios';

const CalculadorasCompletas = () => {
  const [activeCalc, setActiveCalc] = useState('pena-trifasico');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  const categorias = [
    { id: 'criminal', nome: 'Criminal', icon: Shield, color: 'text-red-500', count: 10 },
    { id: 'civil', nome: 'Civil', icon: Scale, color: 'text-blue-500', count: 10 },
    { id: 'trabalhista', nome: 'Trabalhista', icon: Briefcase, color: 'text-green-500', count: 10 },
    { id: 'previdenciario', nome: 'Previdenciário', icon: Users, color: 'text-purple-500', count: 6 },
    { id: 'tributario', nome: 'Tributário', icon: TrendingUp, color: 'text-yellow-500', count: 8 },
    { id: 'outras', nome: 'Outras Áreas', icon: Building2, color: 'text-cyan-500', count: 10 }
  ];

  const calculadoras = {
    criminal: [
      { id: 'pena-trifasico', nome: 'Cálculo de Pena (Trifásico)', endpoint: '/criminal/pena-trifasico' },
      { id: 'progressao', nome: 'Progressão de Regime', endpoint: '/criminal/progressao-regime' },
      { id: 'remicao', nome: 'Remição', endpoint: '/criminal/remicao' },
      { id: 'prescricao', nome: 'Prescrição Penal', endpoint: '/criminal/prescricao' },
      { id: 'detracao', nome: 'Detração Penal', endpoint: '/criminal/detracao' },
      { id: 'multa-penal', nome: 'Multa Penal', endpoint: '/criminal/multa-penal' },
      { id: 'sursis', nome: 'Sursis', endpoint: '/criminal/sursis' },
      { id: 'livramento', nome: 'Livramento Condicional', endpoint: '/criminal/livramento-condicional' },
      { id: 'prestacao-servicos', nome: 'Prestação de Serviços', endpoint: '/criminal/prestacao-servicos' },
      { id: 'concurso-delitos', nome: 'Concurso de Crimes', endpoint: '/criminal/concurso-delitos' }
    ],
    civil: [
      { id: 'juros-simples', nome: 'Juros Simples', endpoint: '/civil/juros-simples' },
      { id: 'juros-compostos', nome: 'Juros Compostos', endpoint: '/civil/juros-compostos' },
      { id: 'correcao', nome: 'Correção Monetária', endpoint: '/civil/correcao-monetaria' },
      { id: 'honorarios', nome: 'Honorários Advocatícios', endpoint: '/civil/honorarios' },
      { id: 'prazo-civil', nome: 'Prazo Processual', endpoint: '/civil/prazo-processual' },
      { id: 'pensao', nome: 'Pensão Alimentícia', endpoint: '/civil/pensao-alimentos' },
      { id: 'dano-moral', nome: 'Dano Moral', endpoint: '/civil/dano-moral' },
      { id: 'usucapiao', nome: 'Usucapião', endpoint: '/civil/usucapiao' },
      { id: 'custas', nome: 'Custas Processuais', endpoint: '/civil/custas-processuais' },
      { id: 'multa-processual', nome: 'Multa Processual', endpoint: '/civil/multa-processual' }
    ],
    trabalhista: [
      { id: 'ferias', nome: 'Férias', endpoint: '/trabalhista/ferias' },
      { id: '13-salario', nome: '13º Salário', endpoint: '/trabalhista/13-salario' },
      { id: 'horas-extras', nome: 'Horas Extras', endpoint: '/trabalhista/horas-extras' },
      { id: 'adicional-noturno', nome: 'Adicional Noturno', endpoint: '/trabalhista/adicional-noturno' },
      { id: 'insalubridade', nome: 'Insalubridade', endpoint: '/trabalhista/insalubridade' },
      { id: 'periculosidade', nome: 'Periculosidade', endpoint: '/trabalhista/periculosidade' },
      { id: 'rescisao', nome: 'Rescisão', endpoint: '/trabalhista/rescisao' },
      { id: 'fgts', nome: 'FGTS', endpoint: '/trabalhista/fgts' },
      { id: 'dsr', nome: 'DSR sobre Horas Extras', endpoint: '/trabalhista/dsr-horas-extras' },
      { id: 'aviso-previo', nome: 'Aviso Prévio', endpoint: '/trabalhista/aviso-previo' }
    ],
    previdenciario: [
      { id: 'tempo-contribuicao', nome: 'Tempo de Contribuição', endpoint: '/previdenciario/tempo-contribuicao' },
      { id: 'aposent-idade', nome: 'Aposentadoria por Idade', endpoint: '/previdenciario/aposentadoria-idade' },
      { id: 'aposent-tempo', nome: 'Aposentadoria por Tempo', endpoint: '/previdenciario/aposentadoria-tempo' },
      { id: 'salario-beneficio', nome: 'Salário de Benefício', endpoint: '/previdenciario/salario-beneficio' },
      { id: 'rmi', nome: 'RMI', endpoint: '/previdenciario/rmi' },
      { id: 'fator-prev', nome: 'Fator Previdenciário', endpoint: '/previdenciario/fator-previdenciario' }
    ],
    tributario: [
      { id: 'irpf', nome: 'IRPF', endpoint: '/tributario/irpf' },
      { id: 'irpj', nome: 'IRPJ', endpoint: '/tributario/irpj' },
      { id: 'icms', nome: 'ICMS', endpoint: '/tributario/icms' },
      { id: 'iss', nome: 'ISS', endpoint: '/tributario/iss' },
      { id: 'pis-cofins', nome: 'PIS e COFINS', endpoint: '/tributario/pis-cofins' },
      { id: 'simples', nome: 'Simples Nacional', endpoint: '/tributario/simples-nacional' },
      { id: 'itbi', nome: 'ITBI', endpoint: '/tributario/itbi' },
      { id: 'ipva', nome: 'IPVA', endpoint: '/tributario/ipva' }
    ],
    outras: [
      { id: 'multa-ambiental', nome: 'Multa Ambiental', endpoint: '/ambiental/multa' },
      { id: 'juros-cdc', nome: 'Juros CDC', endpoint: '/consumidor/juros-cdc' },
      { id: 'prazo-eleitoral', nome: 'Prazo Eleitoral', endpoint: '/eleitoral/prazo' },
      { id: 'lucro-presumido', nome: 'Lucro Presumido', endpoint: '/empresarial/lucro-presumido' },
      { id: 'militar', nome: 'Transgressão Militar', endpoint: '/penal-militar/transgressao' },
      { id: 'direito-autoral', nome: 'Direito Autoral', endpoint: '/propriedade-intelectual/direito-autoral' },
      { id: 'partilha', nome: 'Partilha de Bens', endpoint: '/familia/partilha-bens' },
      { id: 'heranca', nome: 'Herança', endpoint: '/familia/heranca' },
      { id: 'desapropriacao', nome: 'Desapropriação', endpoint: '/administrativo/desapropriacao' },
      { id: 'licitacao', nome: 'Licitação', endpoint: '/administrativo/licitacao' }
    ]
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calcular = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const calc = Object.values(calculadoras).flat().find(c => c.id === activeCalc);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/calculadoras${calc.endpoint}`,
        formData
      );
      setResult(response.data);
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (activeCalc) {
      case 'pena-trifasico':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Pena Base (meses)" type="number" field="pena_base_meses" onChange={handleInputChange} />
            <FormField label="Atenuantes" type="number" field="atenuantes" onChange={handleInputChange} />
            <FormField label="Agravantes" type="number" field="agravantes" onChange={handleInputChange} />
            <FormField label="Majorantes (%)" type="number" field="majorantes_percentual" onChange={handleInputChange} />
            <FormField label="Minorantes (%)" type="number" field="minorantes_percentual" onChange={handleInputChange} />
          </div>
        );
      
      case 'progressao':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Pena Total (meses)" type="number" field="pena_total_meses" onChange={handleInputChange} />
            <FormField label="Crime Hediondo?" type="checkbox" field="crime_hediondo" onChange={handleInputChange} />
            <FormField label="Reincidente?" type="checkbox" field="reincidente" onChange={handleInputChange} />
          </div>
        );
      
      case 'ferias':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Salário (R$)" type="number" field="salario" onChange={handleInputChange} />
            <FormField label="Dias de Férias" type="number" field="dias_ferias" defaultValue="30" onChange={handleInputChange} />
          </div>
        );
      
      case '13-salario':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Salário (R$)" type="number" field="salario" onChange={handleInputChange} />
            <FormField label="Meses Trabalhados" type="number" field="meses_trabalhados" defaultValue="12" onChange={handleInputChange} />
          </div>
        );

      case 'horas-extras':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Salário Base (R$)" type="number" field="salario_base" onChange={handleInputChange} />
            <FormField label="Horas Extras/Mês" type="number" field="horas_extras_mes" onChange={handleInputChange} />
            <FormField label="Adicional (%)" type="number" field="adicional_percentual" defaultValue="50" onChange={handleInputChange} />
          </div>
        );

      case 'irpf':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Renda Mensal (R$)" type="number" field="renda_mensal" onChange={handleInputChange} />
            <FormField label="Dependentes" type="number" field="dependentes" defaultValue="0" onChange={handleInputChange} />
          </div>
        );

      case 'juros-simples':
      case 'juros-compostos':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Valor Principal (R$)" type="number" field="valor_principal" onChange={handleInputChange} />
            <FormField label="Taxa Mensal (%)" type="number" field="taxa_mensal" onChange={handleInputChange} />
            <FormField label="Meses" type="number" field="meses" onChange={handleInputChange} />
          </div>
        );

      case 'honorarios':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Valor da Causa (R$)" type="number" field="valor_causa" onChange={handleInputChange} />
            <FormField label="Percentual (%)" type="number" field="percentual" defaultValue="10" onChange={handleInputChange} />
          </div>
        );

      case 'fgts':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Salário (R$)" type="number" field="salario" onChange={handleInputChange} />
            <FormField label="Meses" type="number" field="meses" onChange={handleInputChange} />
          </div>
        );

      case 'tempo-contribuicao':
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Data Início" type="date" field="data_inicio" onChange={handleInputChange} />
            <FormField label="Data Fim" type="date" field="data_fim" onChange={handleInputChange} />
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-elite-metal">
            <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Selecione uma calculadora para começar</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            Calculadoras <span className="text-elite-accent">Jurídicas</span> 🧮
          </h1>
          <p className="text-elite-metal">
            54 calculadoras especializadas para todas as áreas do direito
          </p>
        </div>

        {/* Categorias */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categorias.map((cat) => {
            const Icon = cat.icon;
            return (
              <CipherGlassCard key={cat.id} className="p-4 hover:border-elite-accent cursor-pointer transition-all">
                <div className="text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${cat.color}`} />
                  <p className="text-elite-text text-sm font-semibold">{cat.nome}</p>
                  <p className="text-elite-metal text-xs">{cat.count} calculadoras</p>
                </div>
              </CipherGlassCard>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {Object.entries(calculadoras).map(([catKey, calcs]) => (
              <CipherGlassCard key={catKey} className="p-4">
                <h3 className="text-sm font-title text-elite-accent mb-3 uppercase">
                  {categorias.find(c => c.id === catKey)?.nome}
                </h3>
                <div className="space-y-1">
                  {calcs.map((calc) => (
                    <button
                      key={calc.id}
                      onClick={() => {
                        setActiveCalc(calc.id);
                        setFormData({});
                        setResult(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        activeCalc === calc.id
                          ? 'bg-elite-accent text-elite-bg font-semibold'
                          : 'text-elite-text hover:bg-surface-01'
                      }`}
                    >
                      {calc.nome}
                    </button>
                  ))}
                </div>
              </CipherGlassCard>
            ))}
          </div>

          {/* Calculadora */}
          <div className="lg:col-span-3">
            <CipherGlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-title text-elite-text">
                  {Object.values(calculadoras).flat().find(c => c.id === activeCalc)?.nome}
                </h2>
                <span className="px-3 py-1 bg-elite-accent/20 text-elite-accent text-xs rounded-full">
                  {Object.entries(calculadoras).find(([_, calcs]) => calcs.some(c => c.id === activeCalc))?.[0]}
                </span>
              </div>

              {renderForm()}

              {formData && Object.keys(formData).length > 0 && (
                <button
                  onClick={calcular}
                  disabled={loading}
                  className="mt-6 w-full bg-elite-accent hover:bg-elite-accent/90 text-elite-bg font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Calculando...' : 'Calcular'}
                </button>
              )}

              {/* Resultado */}
              {result && (
                <div className="mt-6 p-6 bg-surface-02 border border-elite-accent rounded-lg">
                  <h3 className="text-lg font-title text-elite-accent mb-4">Resultado</h3>
                  <div className="space-y-2">
                    {Object.entries(result).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-elite-metal capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-elite-text font-semibold">
                          {typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CipherGlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormField = ({ label, type, field, onChange, defaultValue }) => {
  const [value, setValue] = useState(defaultValue || '');

  const handleChange = (e) => {
    const val = type === 'checkbox' ? e.target.checked : e.target.value;
    setValue(val);
    onChange(field, val);
  };

  if (type === 'checkbox') {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={value}
          onChange={handleChange}
          className="w-4 h-4"
        />
        <label className="text-elite-text text-sm">{label}</label>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-elite-text text-sm font-semibold mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        className="w-full bg-surface-01 border border-elite-metal/30 rounded-lg px-4 py-2 text-elite-text focus:border-elite-accent focus:outline-none"
        step={type === 'number' ? '0.01' : undefined}
      />
    </div>
  );
};

export default CalculadorasCompletas;
