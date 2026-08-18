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
      case 'PHONE': return <Phone className="w-5 h-5 text-neon-cyan" />;
      case 'IMEI': return <Hash className="w-5 h-5 text-neon-cyan" />;
      case 'BANK_ACCOUNT': return <Building2 className="w-5 h-5 text-neon-amber" />;
      case 'SOCIAL_HANDLE': return <AtSign className="w-5 h-5 text-[#b026ff]" />;
      case 'PERSON': return <User className="w-5 h-5 text-white" />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#090C15]/90 text-slate-200">
      <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          {getTypeIcon()}
          <span className="font-sans font-bold tracking-widest text-xs uppercase text-slate-300">Entity Dossier</span>
        </div>
        <button 
          onClick={() => setSelectedEntityId(null)}
          className="p-1 hover:text-neon-cyan hover:bg-slate-800 transition-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent">
        
        {/* Header section */}
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-[0.1em] text-slate-500 font-sans">{entity.type}</div>
          <div className="text-xl font-mono text-white tracking-tight">{entity.id}</div>
          <div className="text-sm font-sans text-slate-400">{entity.label}</div>
        </div>

        {/* Flags */}
        {entity.flags.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.1em] text-slate-500">Active Flags</div>
            <div className="flex flex-col gap-2 items-start">
              {entity.flags.map(f => (
                <StatusBadge key={f.id} severity={f.severity} />
              ))}
            </div>
          </div>
        )}

        {/* Activity Sparklines */}
        <div className="space-y-4 border-t border-slate-800 pt-4">
          <div className="text-[10px] uppercase tracking-[0.1em] text-slate-500 mb-2">Activity Metrics</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Frequency</div>
              <Sparkline data={[2, 5, 1, 8, 3, 12, 4, 15, 2, 0]} color="#00f0ff" />
            </div>
            <div className="p-3 border border-slate-800 bg-slate-900/50">
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Volume</div>
              <Sparkline data={[10, 20, 50, 10, 100, 20, 10, 30, 5, 200]} color={entity.type === 'BANK_ACCOUNT' ? '#ffb000' : '#00f0ff'} />
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <div className="text-[10px] uppercase tracking-[0.1em] text-slate-500">Recent Events</div>
          <div className="space-y-1">
            {entity.events.slice(0, 5).map((e, idx) => (
              <div key={idx} className="p-2 text-[10px] border border-slate-800 bg-slate-900/30 flex flex-col gap-1 group hover:border-l-neon-cyan hover:border-l-2 transition-none cursor-default border-l-2 border-l-transparent">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-slate-300 uppercase tracking-wider font-semibold">{e.event_type.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-slate-500">{new Date(e.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-neon-cyan">{e.counterparty_id || '-'}</span>
                  {e.amount && <span className="font-mono text-neon-amber">₹{e.amount.toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
