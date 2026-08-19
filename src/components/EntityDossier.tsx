import React from 'react';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { Sparkline } from './Sparkline';
import { X, User, Phone, Hash, Building2, AtSign } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';

export const EntityDossier: React.FC = () => {
  const { selectedEntityId, entities, setSelectedEntityId } = useAnalyticsStore();
  
  const entity = entities.find(e => e.id === selectedEntityId);

  if (!entity) return null;

  const getTypeIcon = () => {
    switch(entity.type) {
      case 'PHONE': return <Phone className="w-5 h-5 text-[#C4622D]" />;
      case 'IMEI': return <Hash className="w-5 h-5 text-[#C4622D]" />;
      case 'BANK_ACCOUNT': return <Building2 className="w-5 h-5 text-[#8C3D1A]" />;
      case 'SOCIAL_HANDLE': return <AtSign className="w-5 h-5 text-[#D4854A]" />;
      case 'PERSON': return <User className="w-5 h-5 text-[var(--color-text-primary)]" />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg-surface)', color: 'var(--color-text-primary)' }}>
      <div 
        className="h-12 flex items-center justify-between px-4 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}
      >
        <div className="flex items-center gap-3">
          {getTypeIcon()}
          <span className="font-sans font-bold tracking-widest text-xs uppercase" style={{ color: 'var(--color-text-primary)' }}>Entity Dossier</span>
        </div>
        <button 
          onClick={() => setSelectedEntityId(null)}
          className="p-1 hover:text-[#C4622D] transition-colors rounded"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Header section */}
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-[0.1em] font-sans" style={{ color: 'var(--color-text-muted)' }}>{entity.type}</div>
          <div className="text-xl font-mono tracking-tight" style={{ color: 'var(--color-text-primary)' }}>{entity.id}</div>
          <div className="text-sm font-sans" style={{ color: 'var(--color-text-secondary)' }}>{entity.label}</div>
        </div>

        {/* Flags */}
        {entity.flags.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--color-text-muted)' }}>Active Flags</div>
            <div className="flex flex-col gap-2 items-start">
              {entity.flags.map(f => (
                <StatusBadge key={f.id} severity={f.severity} />
              ))}
            </div>
          </div>
        )}

        {/* Activity Sparklines */}
        <div className="space-y-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--color-text-muted)' }}>Activity Metrics</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="p-3 rounded-lg"
              style={{
                background: 'var(--color-bg-raised)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-secondary)' }}>Frequency</div>
              <Sparkline data={[2, 5, 1, 8, 3, 12, 4, 15, 2, 0]} color="#C4622D" />
            </div>
            <div 
              className="p-3 rounded-lg"
              style={{
                background: 'var(--color-bg-raised)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-secondary)' }}>Volume</div>
              <Sparkline data={[10, 20, 50, 10, 100, 20, 10, 30, 5, 200]} color={entity.type === 'BANK_ACCOUNT' ? '#8C3D1A' : '#C4622D'} />
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="space-y-2 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--color-text-muted)' }}>Recent Events</div>
          <div className="space-y-1">
            {entity.events.slice(0, 5).map((e, idx) => (
              <div 
                key={idx} 
                className="p-2 text-[10px] flex flex-col gap-1 group transition-colors cursor-default rounded"
                style={{
                  background: 'var(--color-bg-raised)',
                  border: '1px solid var(--color-border)',
                  borderLeft: '2px solid transparent',
                  boxShadow: 'var(--shadow-card)'
                }}
                onMouseEnter={(el) => { el.currentTarget.style.borderLeft = '2px solid #C4622D'; }}
                onMouseLeave={(el) => { el.currentTarget.style.borderLeft = '2px solid transparent'; }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-sans uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {e.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono" style={{ color: '#C4622D' }}>{e.counterparty_id || '-'}</span>
                  {e.amount && <span className="font-mono font-semibold" style={{ color: '#D4854A' }}>₹{e.amount.toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
export default EntityDossier;
