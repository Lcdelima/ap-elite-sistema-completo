import React, { useState, useEffect } from 'react';
import '../../styles/elite-gravitas.css';

/**
 * ProofBar™ - Barra de prova de conformidade
 * Pisca em ciano quando detecta citações a normas ISO/ABNT
 */
const ProofBar = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Observer para detectar menções a normas na página
    const observer = new MutationObserver(() => {
      const pageText = document.body.innerText.toLowerCase();
      const hasStandards = /iso|abnt|nbr|27037|27001|lgpd/.test(pageText);
      
      if (hasStandards && !isActive) {
        setIsActive(true);
        setTimeout(() => setIsActive(false), 2000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, [isActive]);

  return (
    <div 
      className={`proof-bar ${isActive ? 'active' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'var(--elite-accent)',
        zIndex: 9999,
        opacity: isActive ? 1 : 0,
        transition: 'opacity 150ms ease'
      }}
    />
  );
};

export default ProofBar;
