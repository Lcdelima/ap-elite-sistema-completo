import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Universal Module Layout Component
 * Provides consistent layout with back button for all Athena modules
 */
const UniversalModuleLayout = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  children,
  backUrl = '/admin/athena',
  headerAction = null,
  className = ''
}) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Back Button */}
                <button
                  onClick={() => navigate(backUrl)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Voltar</span>
                </button>
                
                {/* Icon and Title */}
                {Icon && <Icon className="w-10 h-10" />}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
                  {subtitle && <p className="text-teal-100 text-sm md:text-base mt-1">{subtitle}</p>}
                </div>
              </div>
              
              {/* Header Action (e.g., "Nova Análise" button) */}
              {headerAction && (
                <div className="hidden md:block">
                  {headerAction}
                </div>
              )}
            </div>
            
            {/* Mobile Header Action */}
            {headerAction && (
              <div className="md:hidden mt-4">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
};

export default UniversalModuleLayout;
