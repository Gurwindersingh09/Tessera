import React from 'react';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { Download, Shield } from 'lucide-react';

export const CommandBar = () => {
  const { caseId } = useAnalyticsStore();

  return (
    <div className="h-full flex items-center justify-between px-4 border-b border-slate-800 bg-[#090C15] text-slate-300">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-neon-cyan border-r border-slate-800 pr-4">
          <Shield className="w-5 h-5" />
          <span className="font-sans font-bold tracking-widest text-xs uppercase">Phishield</span>
        </div>
        <div className="font-mono text-xs px-2 py-1 bg-slate-900 border border-slate-700 text-slate-400">
          {caseId}
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-neon-cyan font-mono text-sm">{'>_'}</span>
        </div>
        <input 
          type="text" 
          placeholder="SEARCH ENTITIES (PHONE, IMEI, IP)..." 
          className="w-full bg-slate-900/50 border border-slate-800 text-slate-200 text-xs font-mono pl-10 pr-4 py-1.5 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-none placeholder:text-slate-600 uppercase"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium border border-slate-800 hover:border-neon-cyan hover:text-neon-cyan transition-none bg-slate-900">
          <Download className="w-3 h-3" />
          Export Case PDF
        </button>
      </div>
    </div>
  );
};
