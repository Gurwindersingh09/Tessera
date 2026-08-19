import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { usePhishieldStore } from '../store/usePhishieldStore';
import { Download, Search, ChevronRight, Layers } from 'lucide-react';

export const CommandBar: React.FC = () => {
  const navigate = useNavigate();
  const { caseId, setCaseId, entities, anomalies } = useAnalyticsStore();
  const { cases } = usePhishieldStore();

  const currentCase = cases.find(c => c.id === caseId);

  return (
    <div className="h-full flex items-center justify-between px-4 border-b border-[#DDD5CA] bg-[#F3EDE4] text-[#2A2420]">
      {/* Left: Case Hierarchy Selector */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-sans font-medium text-[#7A6F63] hover:text-[#C4622D] cursor-pointer" onClick={() => navigate('/dashboard')}>
          Dashboard
        </span>
        <ChevronRight className="w-3 h-3 text-[#A89F93]" />
        
        <div className="flex items-center gap-1.5 bg-white border border-[#DDD5CA] rounded px-2 py-0.5 shadow-sm">
          <Layers className="w-3.5 h-3.5 text-[#C4622D]" />
          <select
            value={caseId}
            onChange={(e) => {
              setCaseId(e.target.value);
              navigate(`/case/${e.target.value}`);
            }}
            className="font-mono text-xs bg-transparent border-none text-[#8C3D1A] font-semibold outline-none cursor-pointer pr-1"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.title}
              </option>
            ))}
          </select>
        </div>

        {currentCase && (
          <span style={{
            fontSize: 9.5,
            textTransform: 'uppercase',
            fontFamily: 'IBM Plex Mono, monospace',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 3,
            background: currentCase.priority === 'critical' ? '#B5392415' : '#C4622D15',
            color: currentCase.priority === 'critical' ? '#B53924' : '#C4622D',
            border: `1px solid ${currentCase.priority === 'critical' ? '#B5392440' : '#C4622D40'}`,
          }}>
            {currentCase.priority} Priority
          </span>
        )}
      </div>

      {/* Center: Search input with proper Lucide Search icon */}
      <div className="flex-1 max-w-md mx-4 relative hidden md:block">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#7A6F63]">
          <Search className="w-3.5 h-3.5 text-[#7A6F63]" />
        </div>
        <input 
          type="text" 
          placeholder="SEARCH ENTITIES (PHONE, IMEI, BANK, IP)..." 
          className="w-full bg-white border border-[#DDD5CA] text-[#2A2420] text-xs font-mono pl-8 pr-4 py-1.5 focus:outline-none focus:border-[#C4622D] focus:ring-1 focus:ring-[#C4622D] transition-colors placeholder:text-[#A89F93] rounded"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] uppercase tracking-[0.08em] font-medium border border-[#DDD5CA] hover:border-[#C4622D] hover:text-[#C4622D] transition-colors bg-white text-[#7A6F63] rounded shadow-sm"
          title="Export forensic intelligence brief"
        >
          <Download className="w-3.5 h-3.5 text-[#C4622D]" />
          <span>Export Dossier</span>
        </button>
      </div>
    </div>
  );
};
