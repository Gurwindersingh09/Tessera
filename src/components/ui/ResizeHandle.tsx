import React, { useState } from 'react';
import { Separator } from 'react-resizable-panels';

interface ResizeHandleProps {
  id?: string;
  direction?: 'vertical' | 'horizontal'; // 'vertical' = divider is vertical line (col-resize), 'horizontal' = divider is horizontal line (row-resize)
  className?: string;
  disabled?: boolean;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  id,
  direction = 'vertical',
  className = '',
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isColResize = direction === 'vertical';

  return (
    <Separator
      id={id}
      disabled={disabled}
      className={`group relative flex items-center justify-center select-none transition-colors duration-150 shrink-0 z-20 ${
        isColResize ? 'w-[5px] h-full cursor-col-resize' : 'h-[5px] w-full cursor-row-resize'
      } ${className}`}
      style={{
        background: isHovered || isFocused ? '#C4622D' : 'var(--color-border)',
        boxShadow: isHovered || isFocused ? '0 0 6px rgba(196, 98, 45, 0.45)' : 'none',
        touchAction: 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {/* Invisible expanded hit target for smooth targeting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          margin: isColResize ? '0 -4px' : '-4px 0',
        }}
      />

      {/* Centered grip affordance indicator */}
      <div
        className="pointer-events-none flex items-center justify-center transition-opacity duration-150"
        style={{
          opacity: isHovered || isFocused ? 1 : 0.6,
        }}
      >
        {isColResize ? (
          <div
            style={{
              width: 2,
              height: 18,
              borderRadius: 1,
              background: isHovered || isFocused ? '#FFFFFF' : 'var(--color-text-muted)',
              transition: 'background-color 150ms ease',
            }}
          />
        ) : (
          <div
            style={{
              width: 18,
              height: 2,
              borderRadius: 1,
              background: isHovered || isFocused ? '#FFFFFF' : 'var(--color-text-muted)',
              transition: 'background-color 150ms ease',
            }}
          />
        )}
      </div>
    </Separator>
  );
};

export default ResizeHandle;
