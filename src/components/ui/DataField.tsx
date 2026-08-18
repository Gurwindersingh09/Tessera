import React from 'react';
import { cn } from '../../lib/utils';

interface DataFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export const DataField: React.FC<DataFieldProps> = ({ label, value, className }) => {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-[10px] uppercase tracking-[0.1em] text-slate-500 font-sans">{label}</span>
      <span className="text-sm font-mono text-slate-200 selection:bg-cyan-500/30">{value}</span>
    </div>
  );
};
