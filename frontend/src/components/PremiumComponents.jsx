import React from 'react';
import { motion } from 'framer-motion';
import { animations } from '../styles/designSystem';

/**
 * GlassCard - Card com efeito glassmorphism premium
 */
export const GlassCard = ({ 
  children, 
  className = '', 
  gradient = null,
  hover = true,
  onClick = null,
  ...props 
}) => {
  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/5 backdrop-blur-xl
        border border-white/10
        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
        transition-all duration-300
        ${hover ? 'hover:bg-white/10 hover:border-white/20 hover:shadow-cyan-500/20 hover:shadow-2xl cursor-pointer hover:-translate-y-1' : ''}
        ${className}
      `}
      initial="initial"
      animate="animate"
      whileHover={hover ? "hover" : undefined}
      variants={animations.scaleIn}
      onClick={onClick}
      {...props}
    >
      {gradient && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{ background: gradient }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

/**
 * StatCard - Card de estatística com animação e ícone
 */
export const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  gradient,
  trend = null,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative group"
    >
      <GlassCard className="p-6" gradient={gradient}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1 font-medium">{label}</p>
            <motion.p 
              className="text-4xl font-bold text-white"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: delay + 0.2 }}
            >
              {value}
            </motion.p>
            {trend && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.4 }}
                className={`text-xs mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </motion.p>
            )}
          </div>
          <motion.div
            className="p-4 rounded-2xl"
            style={{ 
              background: gradient,
              boxShadow: '0 10px 40px -10px rgba(0, 217, 255, 0.4)'
            }}
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Icon size={32} className="text-white" />
          </motion.div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

/**
 * GradientButton - Botão com gradiente e animação
 */
export const GradientButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  icon: Icon = null,
  disabled = false,
  loading = false,
  className = ''
}) => {
  const gradientMap = {
    primary: 'linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%)',
    purple: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
    amber: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    green: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  };
  
  const sizeMap = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        relative overflow-hidden rounded-xl font-semibold
        text-white shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-300
        ${sizeMap[size]}
        ${className}
      `}
      style={{ background: gradientMap[variant] }}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.3 }}
      />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {Icon && <Icon size={20} />}
        {loading ? 'Carregando...' : children}
      </span>
    </motion.button>
  );
};

/**
 * Badge Premium com animação
 */
export const PremiumBadge = ({ 
  children, 
  variant = 'default',
  pulse = false 
}) => {
  const variantMap = {
    default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    success: 'bg-green-500/20 text-green-300 border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    danger: 'bg-red-500/20 text-red-300 border-red-500/30',
    info: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };
  
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-1
        px-3 py-1 rounded-full
        text-xs font-semibold
        border backdrop-blur-sm
        ${variantMap[variant]}
      `}
    >
      {pulse && (
        <motion.span
          className="w-2 h-2 rounded-full bg-current"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {children}
    </motion.span>
  );
};

/**
 * FloatingCard - Card flutuante com profundidade
 */
export const FloatingCard = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8,
        boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.3)'
      }}
      transition={{ duration: 0.3 }}
      className={`
        relative group
        bg-gradient-to-br from-slate-800/50 to-slate-900/50
        backdrop-blur-xl
        border border-white/10
        rounded-2xl p-6
        shadow-2xl
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedNumber - Número que anima ao aparecer
 */
export const AnimatedNumber = ({ value, duration = 1 }) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  
  React.useEffect(() => {
    let startTime = null;
    const startValue = 0;
    const endValue = parseInt(value) || 0;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);
      
      if (progress < 1) {
        setDisplayValue(Math.floor(startValue + (endValue - startValue) * progress));
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <span>{displayValue}</span>;
};

/**
 * Shimmer Effect para loading
 */
export const ShimmerCard = () => {
  return (
    <div className="relative overflow-hidden bg-slate-800/50 rounded-2xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-8 bg-slate-700 rounded w-1/2"></div>
      </div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default {
  GlassCard,
  StatCard,
  GradientButton,
  PremiumBadge,
  FloatingCard,
  AnimatedNumber,
  ShimmerCard
};
