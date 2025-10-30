/**
 * AP ELITE - Design System Premium
 * Sistema de design revolucionário com glassmorphism, animações e micro-interações
 */

// ==================== CORES E GRADIENTES ====================

export const colors = {
  // Brand Colors - AP Elite
  brand: {
    primary: '#00D9FF',      // Cyan elétrico
    secondary: '#8B5CF6',    // Roxo vibrante
    accent: '#F59E0B',       // Âmbar
    success: '#10B981',      // Verde
    warning: '#F59E0B',      // Laranja
    danger: '#EF4444',       // Vermelho
  },
  
  // Backgrounds Premium
  bg: {
    primary: '#0B1120',      // Azul escuro profundo
    secondary: '#1A2332',    // Azul escuro médio
    tertiary: '#2D3748',     // Cinza azulado
    elevated: '#1E293B',     // Elevado
    glass: 'rgba(255, 255, 255, 0.05)', // Glassmorphism
  },
  
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    muted: '#475569',
  },
  
  // Borders
  border: {
    default: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(255, 255, 255, 0.2)',
    focus: 'rgba(0, 217, 255, 0.5)',
  }
};

// ==================== GRADIENTES PREMIUM ====================

export const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  cyan: 'linear-gradient(135deg, #00D9FF 0%, #0EA5E9 100%)',
  purple: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
  amber: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  green: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  blue: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
  teal: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
  
  // Gradientes especiais
  aurora: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  sunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ocean: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
  cosmic: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
};

// ==================== SOMBRAS PREMIUM ====================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '2xl': '0 30px 60px -15px rgba(0, 0, 0, 0.3)',
  
  // Sombras coloridas
  cyan: '0 10px 40px -10px rgba(0, 217, 255, 0.4)',
  purple: '0 10px 40px -10px rgba(139, 92, 246, 0.4)',
  amber: '0 10px 40px -10px rgba(245, 158, 11, 0.4)',
  
  // Glass effect
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  glow: '0 0 20px rgba(0, 217, 255, 0.5)',
};

// ==================== ANIMAÇÕES ====================

export const animations = {
  // Fade
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  // Slide
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  
  // Scale
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3 }
  },
  
  // Hover
  hoverScale: {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 }
  },
  
  hoverGlow: {
    whileHover: { 
      boxShadow: '0 0 30px rgba(0, 217, 255, 0.6)',
      transition: { duration: 0.3 }
    }
  },
  
  // Container
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  // Pulse
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
};

// ==================== ESPAÇAMENTO ====================

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
};

// ==================== TIPOGRAFIA ====================

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

// ==================== BORDER RADIUS ====================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  default: '0.5rem', // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  '2xl': '2rem',    // 32px
  full: '9999px',
};

// ==================== BREAKPOINTS ====================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ==================== GLASSMORPHISM ====================

export const glassEffect = {
  default: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: shadows.glass,
  },
  
  strong: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: shadows.glass,
  },
  
  subtle: {
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
};

// ==================== EFEITOS DE HOVER ====================

export const hoverEffects = {
  lift: {
    transform: 'translateY(-4px)',
    boxShadow: shadows.xl,
  },
  
  glow: {
    boxShadow: '0 0 30px rgba(0, 217, 255, 0.6)',
  },
  
  scale: {
    transform: 'scale(1.02)',
  },
};

export default {
  colors,
  gradients,
  shadows,
  animations,
  spacing,
  typography,
  borderRadius,
  breakpoints,
  glassEffect,
  hoverEffects,
};
