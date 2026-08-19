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
      className={`p-3 border border-[#DDD5CA] bg-white flex flex-col gap-2 cursor-pointer group hover:border-l-[#C4622D] hover:bg-[#FAF6F0] border-l-2 rounded ${isHovered ? 'border-l-[#C4622D] bg-[#FAF6F0]' : 'border-l-[#DDD5CA]'}`}
      style={{ boxShadow: '0 1px 3px rgba(42,36,32,0.04)' }}
      onClick={() => setSelectedEntityId(anomaly.entities[0])}
      onMouseEnter={() => setHoveredEntityId(anomaly.entities[0])}
      onMouseLeave={() => setHoveredEntityId(null)}
    >
      <div className="flex items-start justify-between">
        <StatusBadge severity={anomaly.severity} />
        <span className="text-[9px] font-mono text-[#A89F93]">{new Date(anomaly.timestamp).toLocaleTimeString()}</span>
      </div>
      
      <div className="text-xs uppercase tracking-widest font-semibold text-[#2A2420] mt-1 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-[#A89F93] group-hover:text-[#C4622D] transition-colors" />
        {anomaly.rule.replace(/_/g, ' ')}
      </div>

      <p className="text-[10px] text-[#7A6F63] font-sans leading-relaxed">
        {anomaly.description}
      </p>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#DDD5CA]">
        <div className="flex gap-1 flex-wrap">
          {anomaly.entities.map(e => (
            <span key={e} className="px-1.5 py-0.5 bg-[#FAF6F0] border border-[#DDD5CA] text-[9px] font-mono text-[#7A6F63] rounded">
              {e}
            </span>
          ))}
        </div>
        <ChevronRight className="w-3 h-3 text-[#C8BFB3] group-hover:text-[#C4622D] transition-colors" />
      </div>
    </div>
  );
};
