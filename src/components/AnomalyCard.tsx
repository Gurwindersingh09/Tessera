import React from 'react';
import { AnomalyFlag } from '../types/schema';
import { StatusBadge } from './ui/StatusBadge';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const SEVERITY_BORDER: Record<string, string> = {
  CRITICAL: 'var(--color-status-flagged)',
  HIGH:     'var(--color-status-active)',
  MEDIUM:   'var(--color-status-warning)',
  LOW:      'var(--color-border)',
};

export const AnomalyCard: React.FC<{ anomaly: AnomalyFlag }> = ({ anomaly }) => {
  const { setSelectedEntityId, hoveredEntityId, setHoveredEntityId } = useAnalyticsStore();

  const isHovered = hoveredEntityId && anomaly.entities.includes(hoveredEntityId);
  const borderColor = SEVERITY_BORDER[anomaly.severity] || 'var(--color-border)';

  return (
    <div 
      className="p-3 flex flex-col gap-2 cursor-pointer group rounded"
      style={{
        background: isHovered ? 'var(--color-bg-hover)' : 'var(--color-bg-raised)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        borderLeft: `3.5px solid ${borderColor}`,
        transition: 'all 120ms ease',
      }}
      onClick={() => setSelectedEntityId(anomaly.entities[0])}
      onMouseEnter={() => setHoveredEntityId(anomaly.entities[0])}
      onMouseLeave={() => setHoveredEntityId(null)}
    >
      <div className="flex items-start justify-between">
        <StatusBadge severity={anomaly.severity} />
        <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
          {new Date(anomaly.timestamp).toLocaleTimeString()}
        </span>
      </div>
      
      <div 
        className="text-xs uppercase tracking-widest font-semibold mt-1 flex items-center gap-1.5"
        style={{ color: 'var(--color-text-primary)' }}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-[#C4622D]" />
        {anomaly.rule.replace(/_/g, ' ')}
      </div>

      <p className="text-[10.5px] font-sans leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {anomaly.description}
      </p>

      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="flex gap-1 flex-wrap">
          {anomaly.entities.map(e => (
            <span 
              key={e} 
              className="px-1.5 py-0.5 text-[9px] font-mono rounded"
              style={{
                background: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {e}
            </span>
          ))}
        </div>
        <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] group-hover:text-[#C4622D] transition-colors" />
      </div>
    </div>
  );
};
export default AnomalyCard;
