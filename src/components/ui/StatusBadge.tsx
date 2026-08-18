import React from 'react';
import { cn } from '../../lib/utils';
import { AnomalyFlag } from '../../types/schema';

export const StatusBadge: React.FC<{ severity: AnomalyFlag['severity']; className?: string }> = ({ severity, className }) => {
  const styles = {
    CRITICAL: 'border-l-[#ff2a2a] text-neon-red bg-[#ff2a2a]/10',
    HIGH: 'border-l-[#ffb000] text-neon-amber bg-[#ffb000]/10',
    MEDIUM: 'border-l-slate-400 text-slate-300 bg-slate-800',
    LOW: 'border-l-slate-600 text-slate-500 bg-slate-900',
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 border-y border-r border-slate-800 border-l-2 text-[10px] font-mono uppercase tracking-wider",
      styles[severity],
      className
    )}>
      {severity}
    </span>
  );
};
