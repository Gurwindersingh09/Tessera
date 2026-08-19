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
      case 'PERSON': return <User className="w-5 h-5 text-[#2A2420]" />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F3EDE4] text-[#2A2420]">
      <div className="h-12 border-b border-[#DDD5CA] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          {getTypeIcon()}
          <span className="font-sans font-bold tracking-widest text-xs uppercase text-[#2A2420]">Entity Dossier</span>
        </div>
        <button 
          onClick={() => setSelectedEntityId(null)}
          className="p-1 hover:text-[#C4622D] hover:bg-[#EDE5D8] transition-colors rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Header section */}
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-[0.1em] text-[#A89F93] font-sans">{entity.type}</div>
          <div className="text-xl font-mono text-[#2A2420] tracking-tight">{entity.id}</div>
          <div className="text-sm font-sans text-[#7A6F63]">{entity.label}</div>
        </div>

        {/* Flags */}
        {entity.flags.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.1em] text-[#A89F93]">Active Flags</div>
            <div className="flex flex-col gap-2 items-start">
              {entity.flags.map(f => (
                <StatusBadge key={f.id} severity={f.severity} />
              ))}
            </div>
          </div>
        )}

        {/* Activity Sparklines */}
        <div className="space-y-4 border-t border-[#DDD5CA] pt-4">
          <div className="text-[10px] uppercase tracking-[0.1em] text-[#A89F93] mb-2">Activity Metrics</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-[#DDD5CA] bg-white rounded-lg" style={{ boxShadow: '0 1px 3px rgba(42,36,32,0.04)' }}>
              <div className="text-[10px] uppercase tracking-widest text-[#7A6F63] mb-2">Frequency</div>
              <Sparkline data={[2, 5, 1, 8, 3, 12, 4, 15, 2, 0]} color="#C4622D" />
            </div>
            <div className="p-3 border border-[#DDD5CA] bg-white rounded-lg" style={{ boxShadow: '0 1px 3px rgba(42,36,32,0.04)' }}>
              <div className="text-[10px] uppercase tracking-widest text-[#7A6F63] mb-2">Volume</div>
              <Sparkline data={[10, 20, 50, 10, 100, 20, 10, 30, 5, 200]} color={entity.type === 'BANK_ACCOUNT' ? '#8C3D1A' : '#C4622D'} />
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="space-y-2 border-t border-[#DDD5CA] pt-4">
          <div className="text-[10px] uppercase tracking-[0.1em] text-[#A89F93]">Recent Events</div>
          <div className="space-y-1">
            {entity.events.slice(0, 5).map((e, idx) => (
              <div key={idx} className="p-2 text-[10px] border border-[#DDD5CA] bg-white flex flex-col gap-1 group hover:border-l-[#C4622D] hover:border-l-2 transition-colors cursor-default border-l-2 border-l-transparent rounded" style={{ boxShadow: '0 1px 2px rgba(42,36,32,0.03)' }}>
                <div className="flex justify-between items-center">
                  <span className="font-sans text-[#2A2420] uppercase tracking-wider font-semibold">{e.event_type.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-[#A89F93]">{new Date(e.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[#C4622D]">{e.counterparty_id || '-'}</span>
                  {e.amount && <span className="font-mono text-[#8C3D1A]">₹{e.amount.toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
