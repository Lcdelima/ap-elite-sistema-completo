import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import '../../styles/elite-forensic.css';

const DashboardFinanceiro = () => {
  const [dashboard, setDashboard] = useState(null);
  const [dre, setDre] = useState(null);
  const [fluxoCaixa, setFluxoCaixa] = useState(null);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [mes, ano]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, dreRes, fluxoRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/financial/dashboard?mes=${mes}&ano=${ano}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
        }),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/financial/dre?mes=${mes}&ano=${ano}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
        }),
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/financial/fluxo-caixa?mes=${mes}&ano=${ano}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` }
        })
      ]);

      setDashboard(dashRes.data);
      setDre(dreRes.data);
      setFluxoCaixa(fluxoRes.data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-title font-bold" style={{ color: '#E4E6EB' }}>
              Dashboard <span style={{ color: '#00A3C4' }}>Financeiro</span> 📊
            </h1>
          </div>
          
          <div className="flex gap-3">
            <select 
              className="input-elite" 
              style={{ width: '100px' }}
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>{(i + 1).toString().padStart(2, '0')}</option>
              ))}
            </select>
            <input
              type="number"
              className="input-elite"
              style={{ width: '100px' }}
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ color: 'rgba(228,230,235,0.6)' }}>
            Carregando...
          </div>
        ) : dashboard && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="cipher-glass p-6">
                <div className="text-xs mb-2" style={{ color: '#00A3C4' }}>RECEITAS</div>
                <div className="text-3xl font-title font-bold" style={{ color: '#27AE60' }}>
                  R$ {dashboard.totais.receitas.toLocaleString('pt-BR')}
                </div>
              </div>
              
              <div className="cipher-glass p-6">
                <div className="text-xs mb-2" style={{ color: '#00A3C4' }}>DESPESAS</div>
                <div className="text-3xl font-title font-bold" style={{ color: '#E74C3C' }}>
                  R$ {dashboard.totais.despesas.toLocaleString('pt-BR')}
                </div>
              </div>
              
              <div className="cipher-glass p-6">
                <div className="text-xs mb-2" style={{ color: '#00A3C4' }}>RESULTADO</div>
                <div className="text-3xl font-title font-bold" style={{ 
                  color: dashboard.totais.resultado >= 0 ? '#27AE60' : '#E74C3C' 
                }}>
                  R$ {dashboard.totais.resultado.toLocaleString('pt-BR')}
                </div>
              </div>
              
              <div className="cipher-glass p-6">
                <div className="text-xs mb-2" style={{ color: '#00A3C4' }}>MARGEM</div>
                <div className="text-3xl font-title font-bold" style={{ color: '#00A3C4' }}>
                  {dashboard.totais.margem}%
                </div>
              </div>
            </div>

            {/* DRE */}
            {dre && (
              <div className="cipher-glass p-6">
                <h3 className="text-2xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
                  DRE - Demonstrativo de Resultados
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <span style={{ color: 'rgba(228,230,235,0.7)' }}>Receita Bruta</span>
                    <span className="font-bold" style={{ color: '#27AE60' }}>
                      R$ {dre.dre.receita_bruta.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <span style={{ color: 'rgba(228,230,235,0.7)' }}>Despesas Operacionais</span>
                    <span className="font-bold" style={{ color: '#E74C3C' }}>
                      R$ {dre.dre.despesas_operacionais.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <span style={{ color: 'rgba(228,230,235,0.7)' }}>Lucro Operacional</span>
                    <span className="font-bold" style={{ color: '#00A3C4' }}>
                      R$ {dre.dre.lucro_operacional.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-3 mt-3" style={{ borderTop: '2px solid rgba(0,163,196,0.3)' }}>
                    <span className="font-bold" style={{ color: '#E4E6EB' }}>Lucro Líquido</span>
                    <span className="text-2xl font-title font-bold" style={{ color: '#27AE60' }}>
                      R$ {dre.dre.lucro_liquido.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Fluxo de Caixa */}
            {fluxoCaixa && (
              <div className="cipher-glass p-6">
                <h3 className="text-2xl font-title font-bold mb-6" style={{ color: '#E4E6EB' }}>
                  Fluxo de Caixa
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-title font-bold" style={{ color: '#27AE60' }}>
                      R$ {fluxoCaixa.resumo.total_entradas.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>Entradas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-title font-bold" style={{ color: '#E74C3C' }}>
                      R$ {fluxoCaixa.resumo.total_saidas.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>Saídas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-title font-bold" style={{ color: '#00A3C4' }}>
                      R$ {fluxoCaixa.resumo.saldo_periodo.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(228,230,235,0.6)' }}>Saldo</div>
                  </div>
                </div>

                {/* Tabela de fluxo */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead style={{ background: 'rgba(0,0,0,0.3)' }}>
                      <tr>
                        <th className="text-left px-3 py-2" style={{ color: 'rgba(228,230,235,0.8)' }}>Data</th>
                        <th className="text-right px-3 py-2" style={{ color: '#27AE60' }}>Entradas</th>
                        <th className="text-right px-3 py-2" style={{ color: '#E74C3C' }}>Saídas</th>
                        <th className="text-right px-3 py-2" style={{ color: '#00A3C4' }}>Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fluxoCaixa.fluxo_diario.slice(0, 10).map((dia, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td className="px-3 py-2" style={{ color: '#E4E6EB' }}>{dia.data}</td>
                          <td className="text-right px-3 py-2" style={{ color: '#27AE60' }}>
                            {dia.entradas > 0 ? `R$ ${dia.entradas.toLocaleString('pt-BR')}` : '-'}
                          </td>
                          <td className="text-right px-3 py-2" style={{ color: '#E74C3C' }}>
                            {dia.saidas > 0 ? `R$ ${dia.saidas.toLocaleString('pt-BR')}` : '-'}
                          </td>
                          <td className="text-right px-3 py-2 font-bold" style={{ color: '#00A3C4' }}>
                            R$ {dia.saldo_acumulado.toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFinanceiro;
