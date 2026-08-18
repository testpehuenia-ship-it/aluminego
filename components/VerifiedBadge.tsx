import React from 'react';

interface VerifiedBadgeProps {
  isVerified: boolean;
  style?: React.CSSProperties;
}

export default function VerifiedBadge({ isVerified, style }: VerifiedBadgeProps) {
  return (
    <div 
      style={{ 
        position: 'absolute', 
        bottom: '8px', 
        right: '8px', 
        zIndex: 10,
        filter: isVerified ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' : 'drop-shadow(0px 1px 2px rgba(0,0,0,0.1))',
        ...style 
      }}
      title={isVerified ? "Comercio Verificado" : "Comercio Gratuito"}
    >
      {isVerified ? (
        <div style={{ position: 'relative', width: 24, height: 24 }}>
          {/* The badge background */}
          <svg viewBox="0 0 24 24" fill="var(--color-orange)" width="24" height="24">
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          </svg>
          {/* The checkmark */}
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" style={{ position: 'absolute', top: 0, left: 0 }}>
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
      ) : (
        <div style={{ position: 'relative', width: 24, height: 24, opacity: 0.7 }}>
          <svg viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)" stroke="#64748b" strokeWidth="1.5" width="24" height="24">
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          </svg>
          <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" style={{ position: 'absolute', top: 0, left: 0 }}>
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
      )}
    </div>
  );
}
