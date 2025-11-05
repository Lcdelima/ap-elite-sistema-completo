import React from 'react';
import '../../styles/elite-gravitas.css';

/**
 * CipherGlassCard - Componente de cartão com efeito vidro fosco
 * Design System: Elite Gravitas™
 */
const CipherGlassCard = ({ 
  children, 
  onClick, 
  className = '',
  variant = 'default', // 'default' | 'strong'
  category = null, // 'advocacia' | 'pericia' | 'admin' | etc.
  ...props 
}) => {
  const baseClass = variant === 'strong' ? 'cipher-glass-strong' : 'cipher-glass';
  const categoryClass = category ? `module-card-${category}` : '';
  
  return (
    <div
      className={`${baseClass} ${categoryClass} ${className} p-6`}
      onClick={onClick}
      {...props}
    >
      {category && (
        <div 
          className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
          style={{ 
            background: `var(--color-${category})`,
            transform: 'scaleX(0)',
            transformOrigin: 'left'
          }}
        />
      )}
      {children}
    </div>
  );
};

export default CipherGlassCard;
