import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useEntitlements } from '../../contexts/EntitlementsContext';
import '../../styles/elite-gravitas.css';
import CipherGlassCard from '../../components/ui/CipherGlassCard';

const PortalCliente = () => {
  const { entitlements, planType, refresh } = useEntitlements();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('user_id') || 'test-user';
      
      // Carregar assinaturas
      const subsResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/billing/subscriptions/${userId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );
      setSubscriptions(subsResponse.data.subscriptions || []);

      // Carregar planos disponíveis
      const plansResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/billing/plans`
      );
      setPlans(plansResponse.data.plans || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradePlan = async (planId, duration) => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('user_id') || 'test-user';
      
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/billing/subscriptions`,
        {
          user_id: userId,
          plan_type: planId,
          duration_days: duration === 'monthly' ? 30 : duration === 'quarterly' ? 90 : 365,
          payment_method: 'stripe'
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('elite_token')}` } }
      );

      alert('✅ Assinatura criada! Aguardando pagamento...');
      loadData();
    } catch (error) {
      alert('Erro: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffTime = expires - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-elite p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-title text-elite-text mb-2">
            Portal do <span className="text-elite-accent">Cliente</span> 👤
          </h1>
          <p className="text-elite-metal">
            Gerencie suas assinaturas, módulos e usuários
          </p>
        </div>

        {/* Plano Atual */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <CipherGlassCard className="p-6">
            <div className="text-sm text-elite-metal mb-2">Plano Atual</div>
            <div className="text-3xl font-title text-elite-accent mb-2 capitalize">
              {planType || 'Nenhum'}
            </div>
            <div className="text-sm text-elite-metal">Status: Ativo</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6">
            <div className="text-sm text-elite-metal mb-2">Módulos Ativos</div>
            <div className="text-3xl font-title text-elite-accent mb-2">
              {entitlements.length}
            </div>
            <div className="text-sm text-elite-metal">De {planType === 'corporate' ? 'Ilimitados' : entitlements.length}</div>
          </CipherGlassCard>
          
          <CipherGlassCard className="p-6">
            <div className="text-sm text-elite-metal mb-2">Próxima Renovação</div>
            <div className="text-3xl font-title text-elite-accent mb-2">
              {entitlements[0] ? getDaysRemaining(entitlements[0].expires_at) : '--'}
            </div>
            <div className="text-sm text-elite-metal">Dias</div>
          </CipherGlassCard>
        </div>

        {/* Minhas Assinaturas */}
        <CipherGlassCard className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-title text-elite-text">Minhas Assinaturas</h2>
            <button onClick={loadData} className="btn-elite btn-elite-secondary text-sm py-2 px-4">
              🔄 Atualizar
            </button>
          </div>

          {subscriptions.length === 0 ? (
            <div className="text-center py-12 text-elite-metal">
              <div className="text-4xl mb-4">📋</div>
              <p>Nenhuma assinatura ativa</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="p-4 bg-surface-01 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-elite-text font-semibold text-lg capitalize">
                        Plano {sub.plan_type}
                      </div>
                      <div className="text-elite-metal text-sm">
                        {sub.payment_method.toUpperCase()} • {sub.modules_included.length} módulos
                      </div>
                    </div>
                    <div className={`category-badge ${
                      sub.status === 'active' ? 'badge-admin' :
                      sub.status === 'pending' ? 'badge-diversos' :
                      'badge-pericia'
                    } text-xs`}>
                      {sub.status.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-elite-metal">Valor</div>
                      <div className="text-elite-text font-semibold">
                        R$ {sub.amount?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </div>
                    </div>
                    <div>
                      <div className="text-elite-metal">Início</div>
                      <div className="text-elite-text">
                        {new Date(sub.starts_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      <div className="text-elite-metal">Vencimento</div>
                      <div className="text-elite-text">
                        {new Date(sub.expires_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CipherGlassCard>

        {/* Upgrade de Plano */}
        <div>
          <h2 className="text-2xl font-title text-elite-text mb-6">Planos Disponíveis</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <CipherGlassCard 
                key={plan.id}
                className={`p-6 ${
                  planType === plan.id ? 'border-2 border-elite-accent' : ''
                }`}
              >
                <div className="text-center mb-4">
                  <div className="text-2xl font-title text-elite-text capitalize mb-2">
                    {plan.name}
                  </div>
                  <div className="text-elite-metal text-sm mb-4">
                    {plan.description}
                  </div>
                  <div className="text-3xl font-title text-elite-accent mb-1">
                    R$ {plan.pricing.monthly.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-xs text-elite-metal">por mês</div>
                </div>

                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-elite-metal text-sm">
                      <span className="text-elite-accent mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>

                {planType === plan.id ? (
                  <div className="category-badge badge-admin w-full text-center">
                    PLANO ATUAL
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="btn-elite btn-elite-primary w-full"
                  >
                    Selecionar
                  </button>
                )}
              </CipherGlassCard>
            ))}
          </div>
        </div>

        {/* Modal de Upgrade */}
        {selectedPlan && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
            <CipherGlassCard className="max-w-2xl w-full p-8">
              <h3 className="text-2xl font-title text-elite-text mb-6">
                Upgrade para {selectedPlan.name}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(selectedPlan.pricing).map(([duration, price]) => (
                    <button
                      key={duration}
                      onClick={() => upgradePlan(selectedPlan.id, duration)}
                      className="p-4 bg-surface-01 rounded-lg border border-white/20 hover:border-elite-accent transition-all"
                    >
                      <div className="text-elite-text font-semibold capitalize mb-2">
                        {duration === 'monthly' ? 'Mensal' : duration === 'quarterly' ? 'Trimestral' : 'Anual'}
                      </div>
                      <div className="text-2xl font-title text-elite-accent">
                        R$ {price.toLocaleString('pt-BR')}
                      </div>
                      {duration === 'annual' && (
                        <div className="text-xs text-green-400 mt-2">Economize 15%</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="btn-elite btn-elite-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </CipherGlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortalCliente;
