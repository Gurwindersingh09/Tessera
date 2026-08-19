import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useTesseraStore } from '../store/useTesseraStore';
import { Download, Search, ChevronRight, Layers } from 'lucide-react';

export const CommandBar: React.FC = () => {
  const navigate = useNavigate();
  const { caseId, setCaseId } = useAnalyticsStore();
  const { cases } = useTesseraStore();

  const currentCase = cases.find(c => c.id === caseId);

  return (
    <div 
      className="h-full flex items-center justify-between px-4"
      style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
        color: 'var(--color-text-primary)'
      }}
    >
      {/* Left: Case Hierarchy Selector */}
      <div className="flex items-center gap-2">
        <span 
          className="text-[11px] font-sans font-medium hover:text-[#C4622D] cursor-pointer"
          style={{ color: 'var(--color-text-secondary)' }}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </span>
        <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)]" />
        
        <div 
          className="flex items-center gap-1.5 rounded px-2 py-0.5 shadow-sm"
          style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)' }}
        >
          <Layers className="w-3.5 h-3.5 text-[#C4622D]" />
          <select
            value={caseId}
            onChange={(e) => {
              setCaseId(e.target.value);
              navigate(`/case/${e.target.value}`);
            }}
            className="font-mono text-xs bg-transparent border-none font-semibold outline-none cursor-pointer pr-1"
            style={{ color: '#C4622D' }}
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id} style={{ background: 'var(--color-bg-surface)', color: 'var(--color-text-primary)' }}>
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
            background: currentCase.priority === 'critical' ? 'var(--color-status-flagged-bg)' : 'var(--color-status-warning-bg)',
            color: currentCase.priority === 'critical' ? 'var(--color-status-flagged)' : 'var(--color-status-warning)',
            border: `1px solid ${currentCase.priority === 'critical' ? 'var(--color-status-flagged-border)' : 'var(--color-status-warning-border)'}`,
          }}>
            {currentCase.priority} Priority
          </span>
        )}
      </div>

      {/* Center: Search input */}
      <div className="flex-1 max-w-md mx-4 relative hidden md:block">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
          <Search className="w-3.5 h-3.5" />
        </div>
        <input 
          type="text" 
          placeholder="SEARCH ENTITIES (PHONE, IMEI, BANK, IP)..." 
          className="w-full text-xs font-mono pl-8 pr-4 py-1.5 focus:outline-none focus:border-[#C4622D] focus:ring-1 focus:ring-[#C4622D] transition-colors rounded"
          style={{
            background: 'var(--color-bg-raised)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 text-[10.5px] uppercase tracking-[0.08em] font-medium transition-colors rounded shadow-sm"
          style={{
            background: 'var(--color-bg-raised)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
          title="Export forensic intelligence brief"
        >
          <Download className="w-3.5 h-3.5 text-[#C4622D]" />
          <span>Export Dossier</span>
        </button>
      </div>
    </div>
  );
};
export default CommandBar;
