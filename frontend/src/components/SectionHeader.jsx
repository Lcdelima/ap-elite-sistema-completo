import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/elite-forensic.css';

const SectionHeader = ({ title, subtitle, breadcrumbs = [], actions = null }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-elite btn-elite-secondary text-sm px-3 py-2"
            aria-label="Voltar"
            title="Voltar"
          >
            ← Voltar
          </button>

          <div>
            {breadcrumbs.length > 0 && (
              <div className="text-xs mb-2" style={{ color: 'rgba(228,230,235,0.5)' }}>
                {breadcrumbs.map((crumb, idx) => (
                  <span key={idx}>
                    {idx > 0 && <span className="mx-2" style={{ color: 'rgba(228,230,235,0.3)' }}>/</span>}
                    {crumb}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-3xl font-title font-bold" style={{ color: '#E4E6EB' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: 'rgba(228,230,235,0.6)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
