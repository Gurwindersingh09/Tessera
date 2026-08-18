import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { usePhishieldStore } from '../store/usePhishieldStore';
import { Download, Shield, ArrowLeft } from 'lucide-react';

export const CommandBar: React.FC = () => {
  const navigate = useNavigate();
  const { caseId, setCaseId } = useAnalyticsStore();
  const { cases } = usePhishieldStore();

  return (
    <div className="h-full flex items-center justify-between px-4 border-b border-slate-800 bg-[#090C15] text-slate-300">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 px-2 py-1 text-xs border border-slate-800 hover:border-neon-cyan text-slate-400 hover:text-neon-cyan transition-none"
          title="Back to Cases Overview"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-2 text-neon-cyan border-r border-slate-800 pr-3">
          <Shield className="w-4 h-4" />
          <span className="font-sans font-bold tracking-widest text-xs uppercase hidden sm:inline">Phishield</span>
        </div>

        <select
          value={caseId}
          onChange={(e) => {
            setCaseId(e.target.value);
            navigate(`/case/${e.target.value}`);
          }}
          className="font-mono text-xs px-2 py-1 bg-slate-900 border border-slate-700 text-neon-cyan outline-none cursor-pointer"
        >
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id} — {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 max-w-md mx-4 relative hidden md:block">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-neon-cyan font-mono text-xs">{'>_'}</span>
        </div>
        <input 
          type="text" 
          placeholder="SEARCH ENTITIES (PHONE, IMEI, IP)..." 
          className="w-full bg-slate-900/50 border border-slate-800 text-slate-200 text-xs font-mono pl-8 pr-4 py-1 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-none placeholder:text-slate-600 uppercase"
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] font-medium border border-slate-800 hover:border-neon-cyan hover:text-neon-cyan transition-none bg-slate-900">
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>
    </div>
  );
};
