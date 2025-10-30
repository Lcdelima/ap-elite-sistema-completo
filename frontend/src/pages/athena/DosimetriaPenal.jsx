import React, { useState } from 'react';
import { Calculator, Scale, AlertTriangle, CheckCircle, FileText, User } from 'lucide-react';
import StandardModuleLayout from '../../components/StandardModuleLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const DosimetriaPenal = () => {
  const [resultado, setResultado] = useState(null);
  
  const calcularExemplo = async () => {
    const dados = {
      reu_nome: "Exemplo",
      reu_cpf: "12345678900",
      crimes: [{
        tipo_penal: "Furto Qualificado",
        artigo: "CP Art. 155, §4º",
        pena_minima_anos: 2,
        pena_minima_meses: 0,
        pena_maxima_anos: 8,
        pena_maxima_meses: 0,
        tipo: "reclusao"
      }],
      concurso: "unico",
      circunstancias_art59: {
        culpabilidade: "normal",
        antecedentes: "primario",
        conduta_social: "favoravel",
        personalidade: "normal",
        motivos: "normais",
        circunstancias: "normais",
        consequencias: "normais",
        comportamento_vitima: "neutro"
      },
      atenuantes: [{
        artigo: "CP Art. 65, III, d",
        descricao: "Confissão espontânea",
        aplicavel: true
      }],
      agravantes: [],
      reincidencia: {
        possui_reincidencia: false
      },
      causas_aumento: [],
      causas_diminuicao: [],
      responsavel: "Sistema"
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/dosimetria/calcular`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });

      if (response.ok) {
        const data = await response.json();
        setResultado(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <StandardModuleLayout>
      <div className="p-6">
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Calculator size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Calculadora de Penas</h1>
                <p className="text-purple-100">Dosimetria Penal Completa - CP Art. 59, 61-66 + Prescrição + Regime</p>
              </div>
            </div>
            <button
              onClick={calcularExemplo}
              className="bg-white text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition"
            >
              Calcular Exemplo
            </button>
          </div>
        </div>

        {resultado && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Scale className="text-purple-400" />
                Resultado da Dosimetria
              </h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-750 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Pena Final</p>
                  <p className="text-3xl font-bold text-white">{resultado.pena_final?.formatado}</p>
                </div>
                <div className="bg-slate-750 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Regime Inicial</p>
                  <p className="text-2xl font-bold text-cyan-400">{resultado.regime_inicial}</p>
                </div>
                <div className="bg-slate-750 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Prescrição</p>
                  <p className="text-2xl font-bold text-amber-400">{resultado.prescricao?.prazo_abstrato_anos} anos</p>
                </div>
              </div>

              {resultado.resultados_por_crime?.map((crime, idx) => (
                <div key={idx} className="bg-slate-750 rounded-lg p-6 mb-4">
                  <h3 className="text-xl font-bold text-white mb-4">{crime.crime.tipo_penal}</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-purple-400 font-semibold mb-2">1ª Fase - Pena Base (Art. 59)</p>
                      <p className="text-white text-lg">{crime.primeira_fase.pena_base_formatada}</p>
                      <ul className="text-gray-400 text-sm mt-2">
                        {crime.primeira_fase.fundamentacao?.map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-blue-400 font-semibold mb-2">2ª Fase - Atenuantes/Agravantes</p>
                      <p className="text-white text-lg">{crime.segunda_fase.pena_intermediaria_formatada}</p>
                      <ul className="text-gray-400 text-sm mt-2">
                        {crime.segunda_fase.fundamentacao?.map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-green-400 font-semibold mb-2">3ª Fase - Causas Especiais</p>
                      <p className="text-white text-lg">{crime.terceira_fase.pena_final_formatada}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
                    <div className={`flex items-center gap-2 ${crime.substituicao_possivel ? 'text-green-400' : 'text-gray-500'}`}>
                      {crime.substituicao_possivel ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                      <span className="text-sm">Substituição de pena</span>
                    </div>
                    <div className={`flex items-center gap-2 ${crime.sursis_possivel ? 'text-green-400' : 'text-gray-500'}`}>
                      {crime.sursis_possivel ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                      <span className="text-sm">Sursis</span>
                    </div>
                    <div className="text-cyan-400 flex items-center gap-2">
                      <Scale size={16} />
                      <span className="text-sm">Regime: {crime.regime_inicial}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4 mt-6">
                <h4 className="text-white font-semibold mb-2">Benefícios Possíveis</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className={resultado.beneficios?.substituicao_possivel ? 'text-green-400' : 'text-gray-500'}>
                    ✓ Substituição de pena
                  </div>
                  <div className={resultado.beneficios?.sursis_possivel ? 'text-green-400' : 'text-gray-500'}>
                    ✓ Sursis
                  </div>
                  <div className={resultado.beneficios?.livramento_condicional_possivel ? 'text-green-400' : 'text-gray-500'}>
                    ✓ Livramento condicional
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!resultado && (
          <div className="bg-slate-800 rounded-lg p-12 text-center">
            <Calculator size={64} className="mx-auto mb-4 text-purple-400 opacity-50" />
            <p className="text-gray-400 mb-4">Clique em "Calcular Exemplo" para ver a dosimetria em ação</p>
            <p className="text-gray-500 text-sm">Ou crie um novo cálculo personalizado</p>
          </div>
        )}
      </div>
    </StandardModuleLayout>
  );
};

export default DosimetriaPenal;
