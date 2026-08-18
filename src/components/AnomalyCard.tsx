import React from 'react';
import { AnomalyFlag } from '../types/schema';
import { StatusBadge } from './ui/StatusBadge';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { AlertTriangle, ChevronRight } from 'lucide-react';

export const AnomalyCard: React.FC<{ anomaly: AnomalyFlag }> = ({ anomaly }) => {
  const { setSelectedEntityId, hoveredEntityId, setHoveredEntityId } = useAnalyticsStore();

  const isHovered = hoveredEntityId && anomaly.entities.includes(hoveredEntityId);

  return (
    <div 
      className={`p-3 border border-slate-800 bg-slate-900/50 flex flex-col gap-2 cursor-pointer transition-none group hover:border-l-neon-cyan hover:bg-slate-800/50 border-l-2 ${isHovered ? 'border-l-neon-cyan bg-slate-800/50' : 'border-l-slate-800'}`}
      onClick={() => setSelectedEntityId(anomaly.entities[0])}
      onMouseEnter={() => setHoveredEntityId(anomaly.entities[0])}
      onMouseLeave={() => setHoveredEntityId(null)}
    >
      <div className="flex items-start justify-between">
        <StatusBadge severity={anomaly.severity} />
        <span className="text-[9px] font-mono text-slate-500">{new Date(anomaly.timestamp).toLocaleTimeString()}</span>
      </div>
      
      <div className="text-xs uppercase tracking-widest font-semibold text-slate-300 mt-1 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-slate-500 group-hover:text-neon-cyan transition-none" />
        {anomaly.rule.replace(/_/g, ' ')}
      </div>

      <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
        {anomaly.description}
      </p>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
        <div className="flex gap-1 flex-wrap">
          {anomaly.entities.map(e => (
            <span key={e} className="px-1.5 py-0.5 bg-[#090C15] border border-slate-800 text-[9px] font-mono text-slate-400">
              {e}
            </span>
          ))}
        </div>
        <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-neon-cyan transition-none" />
      </div>
    </div>
  );
};
