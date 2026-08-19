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
    <div className="h-full flex items-center justify-between px-4 border-b border-[#DDD5CA] bg-[#F3EDE4] text-[#2A2420]">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 px-2 py-1 text-xs border border-[#DDD5CA] hover:border-[#C4622D] text-[#7A6F63] hover:text-[#C4622D] transition-colors rounded"
          title="Back to Cases Overview"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-2 text-[#C4622D] border-r border-[#DDD5CA] pr-3">
          <Shield className="w-4 h-4" />
          <span className="font-sans font-bold tracking-widest text-xs uppercase hidden sm:inline">Phishield</span>
        </div>

        <select
          value={caseId}
          onChange={(e) => {
            setCaseId(e.target.value);
            navigate(`/case/${e.target.value}`);
          }}
          className="font-mono text-xs px-2 py-1 bg-white border border-[#DDD5CA] text-[#8C3D1A] outline-none cursor-pointer rounded"
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
          <span className="text-[#C4622D] font-mono text-xs">{'⌕'}</span>
        </div>
        <input 
          type="text" 
          placeholder="SEARCH ENTITIES (PHONE, IMEI, IP)..." 
          className="w-full bg-white border border-[#DDD5CA] text-[#2A2420] text-xs font-mono pl-8 pr-4 py-1 focus:outline-none focus:border-[#C4622D] focus:ring-1 focus:ring-[#C4622D] transition-colors placeholder:text-[#C8BFB3] uppercase rounded"
        />
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] font-medium border border-[#DDD5CA] hover:border-[#C4622D] hover:text-[#C4622D] transition-colors bg-white text-[#7A6F63] rounded">
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>
      </div>
    </div>
  );
};
