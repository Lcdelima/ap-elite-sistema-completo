import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Settings, Download, RefreshCw, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ATHENA ELITE - BOTÃO DE NAVEGAÇÃO PADRONIZADO
 * Componente universal para todos os módulos do sistema
 * Design inspirado em CISAI / CIA Command Centers
 */

export const AthenaBackButton = ({ 
  label = "Voltar", 
  destination = -1,
  showIcon = true,
  className = ""
}) => {
  const navigate = useNavigate();
  
  return (
    <motion.button
      onClick={() => typeof destination === 'number' ? navigate(destination) : navigate(destination)}
      className={`group flex items-center gap-2 px-4 py-2 rounded-xl
        bg-gradient-to-r from-neutral-800 to-neutral-900
        border border-neutral-700 hover:border-cyan-500/50
        text-neutral-200 hover:text-cyan-400
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:shadow-cyan-500/20
        ${className}`}
      whileHover={{ scale: 1.02, x: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {showIcon && (
        <ArrowLeft 
          size={18} 
          className="transition-transform group-hover:-translate-x-1" 
        />
      )}
      <span className="font-medium text-sm">{label}</span>
    </motion.button>
  );
};

export const AthenaNavigationBar = ({ 
  title = "Athena Elite",
  subtitle = "",
  showBack = true,
  backDestination = -1
}) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      className="flex items-center justify-between w-full px-6 py-4 
        bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900
        border-b border-neutral-700/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Left: Back Button */}
      <div className="flex items-center gap-4">
        {showBack && (
          <AthenaBackButton destination={backDestination} />
        )}
        
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {title}
            </span>
          </h1>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      
      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        <ActionButton
          icon={<Home size={16} />}
          label="Home"
          onClick={() => navigate('/admin')}
        />
        <ActionButton
          icon={<RefreshCw size={16} />}
          label="Atualizar"
          onClick={() => window.location.reload()}
        />
        <ActionButton
          icon={<Download size={16} />}
          label="Exportar"
          onClick={() => console.log('Export')}
        />
        <ActionButton
          icon={<Settings size={16} />}
          label="Config"
          onClick={() => navigate('/settings')}
        />
      </div>
    </motion.div>
  );
};

const ActionButton = ({ icon, label, onClick }) => (
  <motion.button
    onClick={onClick}
    className="group flex items-center gap-2 px-3 py-2 rounded-lg
      bg-neutral-800/50 hover:bg-neutral-700/50
      border border-neutral-700 hover:border-cyan-500/50
      text-neutral-400 hover:text-cyan-400
      transition-all duration-200"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    title={label}
  >
    {icon}
    <span className="text-xs hidden lg:inline">{label}</span>
  </motion.button>
);

export const AthenaFloatingActions = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.div className="relative">
        {/* Main Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600
            shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70
            flex items-center justify-center text-white
            transition-all duration-300"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
        >
          <MessageCircle size={24} />
        </motion.button>
        
        {/* Sub Actions */}
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 flex flex-col gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FloatingAction icon="🧠" label="IA Athena" />
            <FloatingAction icon="📊" label="Dashboard" />
            <FloatingAction icon="🔍" label="Busca Global" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const FloatingAction = ({ icon, label }) => (
  <motion.button
    className="flex items-center gap-2 px-4 py-2 rounded-full
      bg-neutral-800 border border-neutral-700
      text-sm text-neutral-200 hover:text-cyan-400
      shadow-lg hover:shadow-cyan-500/20
      transition-all duration-200"
    whileHover={{ scale: 1.05, x: -5 }}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </motion.button>
);

export const AthenaLoadingSkeleton = ({ lines = 3 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-12 bg-neutral-800/50 rounded-xl" />
    ))}
  </div>
);

export const AthenaEmptyState = ({ 
  title = "Sem dados disponíveis",
  subtitle = "Nenhum registro encontrado",
  icon = "📭",
  actionLabel = "Criar Novo",
  onAction = null
}) => (
  <motion.div
    className="flex flex-col items-center justify-center py-16 px-4
      text-center space-y-4"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4 }}
  >
    <div className="text-6xl opacity-50">{icon}</div>
    <div>
      <h3 className="text-xl font-semibold text-neutral-300">{title}</h3>
      <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
    </div>
    {onAction && (
      <motion.button
        onClick={onAction}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600
          text-white font-medium shadow-lg hover:shadow-xl
          transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {actionLabel}
      </motion.button>
    )}
  </motion.div>
);

export default {
  AthenaBackButton,
  AthenaNavigationBar,
  AthenaFloatingActions,
  AthenaLoadingSkeleton,
  AthenaEmptyState
};
