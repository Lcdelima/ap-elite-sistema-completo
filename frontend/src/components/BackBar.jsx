/**
 * BackBar Component - Elite Gravitas™
 * Barra superior global com botão Voltar e Breadcrumb
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export const BackBar = ({ trail = [], actions = null }) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-cyan-500/10 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Voltar + Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-cyan-500/20 text-cyan-300 hover:text-amber-300 hover:border-amber-500/30 transition-all duration-200"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Voltar</span>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Home size={16} className="text-cyan-400" />
            {trail.map((item, index) => (
              <React.Fragment key={index}>
                <span className="text-slate-600">/</span>
                <span
                  className={index === trail.length - 1 ? 'text-cyan-300 font-medium' : 'text-slate-400'}
                >
                  {item}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Right: Ações rápidas (opcional) */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackBar;
