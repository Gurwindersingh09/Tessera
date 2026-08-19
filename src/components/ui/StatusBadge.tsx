import React from 'react';
import { cn } from '../../lib/utils';
import { AnomalyFlag } from '../../types/schema';

export const StatusBadge: React.FC<{ severity: AnomalyFlag['severity']; className?: string }> = ({ severity, className }) => {
  const styles: Record<string, { borderLeft: string; color: string; background: string }> = {
    CRITICAL: {
      borderLeft: 'var(--color-status-flagged)',
      color: 'var(--color-status-flagged)',
      background: 'var(--color-status-flagged-bg)',
    },
    HIGH: {
      borderLeft: 'var(--color-status-active)',
      color: 'var(--color-status-active)',
      background: 'var(--color-status-active-bg)',
    },
    MEDIUM: {
      borderLeft: 'var(--color-status-warning)',
      color: 'var(--color-status-warning)',
      background: 'var(--color-status-warning-bg)',
    },
    LOW: {
      borderLeft: 'var(--color-border-strong)',
      color: 'var(--color-text-muted)',
      background: 'var(--color-bg-surface)',
    },
  };

  const currentStyle = styles[severity] || styles.LOW;

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm",
        className
      )}
      style={{
        border: '1px solid var(--color-border)',
        borderLeft: `2.5px solid ${currentStyle.borderLeft}`,
        color: currentStyle.color,
        background: currentStyle.background,
      }}
    >
      {severity}
    </span>
  );
};
export default StatusBadge;
