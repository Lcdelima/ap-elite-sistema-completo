import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const EntitlementsContext = createContext();

export const useEntitlements = () => {
  const context = useContext(EntitlementsContext);
  if (!context) {
    throw new Error('useEntitlements deve ser usado dentro de EntitlementsProvider');
  }
  return context;
};

export const EntitlementsProvider = ({ children }) => {
  const [entitlements, setEntitlements] = useState([]);
  const [modules, setModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState(null);

  useEffect(() => {
    loadEntitlements();
  }, []);

  const loadEntitlements = async () => {
    try {
      const token = localStorage.getItem('elite_token');
      if (!token) {
        // Sem token - usar modo corporativo padrão (acesso total)
        setPlanType('corporate');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/entitlements/my-entitlements`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = response.data;
      setEntitlements(data.entitlements || []);
      
      // Mapear módulos disponíveis
      const availableModules = {};
      data.entitlements?.forEach(ent => {
        availableModules[ent.module_name] = {
          expires_at: ent.expires_at,
          plan_type: ent.plan_type,
          is_active: ent.is_active
        };
      });
      
      setModules(availableModules);
      
      // Determinar plano principal
      if (data.entitlements && data.entitlements.length > 0) {
        const plans = data.entitlements.map(e => e.plan_type);
        // Ordem: corporate > elite > pro > basic
        if (plans.includes('corporate')) setPlanType('corporate');
        else if (plans.includes('elite')) setPlanType('elite');
        else if (plans.includes('pro')) setPlanType('pro');
        else setPlanType('basic');
      }
      
      setLoading(false);
    } catch (error) {
      // Em caso de erro, usar modo corporativo (acesso total) para não bloquear o sistema
      console.warn('Entitlements não disponíveis, usando acesso total:', error.message);
      setPlanType('corporate');
      setLoading(false);
    }
  };

  const hasAccess = (moduleName) => {
    if (planType === 'corporate') return true; // Acesso total
    return modules[moduleName]?.is_active || false;
  };

  const getExpirationDate = (moduleName) => {
    return modules[moduleName]?.expires_at || null;
  };

  const getDaysUntilExpiration = (moduleName) => {
    const expirationDate = getExpirationDate(moduleName);
    if (!expirationDate) return null;
    
    const now = new Date();
    const expires = new Date(expirationDate);
    const diffTime = expires - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const isExpiringSoon = (moduleName, daysThreshold = 7) => {
    const days = getDaysUntilExpiration(moduleName);
    return days !== null && days <= daysThreshold && days > 0;
  };

  const value = {
    entitlements,
    modules,
    planType,
    loading,
    hasAccess,
    getExpirationDate,
    getDaysUntilExpiration,
    isExpiringSoon,
    refresh: loadEntitlements
  };

  return (
    <EntitlementsContext.Provider value={value}>
      {children}
    </EntitlementsContext.Provider>
  );
};
