import React from 'react';

const EliteLogoOfficial = ({ width = "200", height = "75" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width={width} height={height}>
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00E5FF"/>
          <stop offset="100%" stopColor="#E6B76A"/>
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E6B76A"/>
          <stop offset="100%" stopColor="#00E5FF"/>
        </linearGradient>
        <filter id="glow" width="300%" height="300%" x="-100%" y="-100%">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <g filter="url(#glow)">
        <path d="M150 200 L250 50 L350 200 Z" stroke="url(#grad1)" strokeWidth="12" fill="none" strokeLinejoin="round"/>
        <path d="M200 150 L300 150" stroke="url(#grad2)" strokeWidth="8" strokeLinecap="round"/>
      </g>
      
      <text x="400" y="155" fill="url(#grad1)" fontFamily="Sora" fontSize="82" fontWeight="600" letterSpacing="0.04em">
        ELITE
      </text>
      
      <text x="402" y="200" fill="#9AA6B2" fontFamily="Manrope" fontSize="22" letterSpacing="0.15em">
        ESTRATÉGIAS EM PERÍCIA E INVESTIGAÇÃO CRIMINAL
      </text>
    </svg>
  );
};

export default EliteLogoOfficial;
