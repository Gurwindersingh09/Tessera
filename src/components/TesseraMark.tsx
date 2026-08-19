import React from 'react';

interface TesseraMarkProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * TesseraMark: A geometric mosaic tile emblem representing 'Tessera'
 * (an individual stone/tile piece in a mosaic intelligence lattice).
 */
export const TesseraMark: React.FC<TesseraMarkProps> = ({ size = 28, className, style }) => {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size > 24 ? 6 : 4,
        border: '1.5px solid #C4622D',
        background: 'var(--color-bg-raised, #FAF6F0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 1px 2px rgba(196, 98, 45, 0.08)',
        transition: 'all 200ms ease',
        ...style,
      }}
    >
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 2x2 Mosaic tiles in coordinated Terracotta tonal scale */}
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="#C4622D" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="#D4854A" fillOpacity="0.9" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="#8C3D1A" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#C4622D" fillOpacity="0.75" />
      </svg>
    </div>
  );
};

export default TesseraMark;
