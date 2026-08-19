import React from 'react';
import { cn } from '../../lib/utils';
import { AnomalyFlag } from '../../types/schema';

export const StatusBadge: React.FC<{ severity: AnomalyFlag['severity']; className?: string }> = ({ severity, className }) => {
  const styles = {
    CRITICAL: 'border-l-[#B53924] text-[#8A2517] bg-[#B53924]/10',
    HIGH: 'border-l-[#8C3D1A] text-[#8C3D1A] bg-[#8C3D1A]/10',
    MEDIUM: 'border-l-[#D4854A] text-[#D4854A] bg-[#D4854A]/10',
    LOW: 'border-l-[#C8BFB3] text-[#A89F93] bg-[#F3EDE4]',
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 border-y border-r border-[#DDD5CA] border-l-2 text-[10px] font-mono uppercase tracking-wider rounded-sm",
      styles[severity],
      className
    )}>
      {severity}
    </span>
  );
};
