import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhishieldStore } from '../store/usePhishieldStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { CaseItem } from '../types/schema';

function useLiveClock(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function fmtTimestamp(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);
  if (diffH < 1) return 'just now';
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtAbsDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  active:  { color: '#00E5FF', label: 'Active' },
  flagged: { color: '#FF3B6B', label: 'Flagged' },
  closed:  { color: '#39FF88', label: 'Closed' },
};

function StatusCell({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { color: '#22262E', label: status };
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.color, display: 'inline-block', flexShrink: 0,
        boxShadow: 'none',
      }} />
      <span style={{ fontSize: 11, color: '#9494A0', letterSpacing: '0.02em' }}>{cfg.label}</span>
    </span>
  );
}

function StatStrip({ cases }: { cases: CaseItem[] }) {
  const active = cases.filter(c => c.status === 'active').length;
  const flagged = cases.filter(c => c.status === 'flagged').length;
  const closed = cases.filter(c => c.status === 'closed').length;
  const entities = cases.reduce((s, c) => s + c.entityCount, 0);
  const anomalies = cases.reduce((s, c) => s + c.anomalyCount, 0);

  const stats = [
    { label: 'Total Cases',      value: String(cases.length).padStart(2, '0'), color: '#00E5FF' },
    { label: 'Active',           value: String(active).padStart(2, '0'), color: '#00E5FF' },
    { label: 'Flagged',          value: String(flagged).padStart(2, '0'), color: '#FF3B6B' },
    { label: 'Closed',           value: String(closed).padStart(2, '0'), color: '#39FF88' },
    { label: 'Entities Tracked', value: String(entities), color: '#00E5FF' },
    { label: 'Total Anomalies',  value: String(anomalies), color: '#FFB020' },
  ];

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #22262E', flexWrap: 'wrap' }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{
          padding: '14px 24px',
          borderRight: i < stats.length - 1 ? '1px solid #22262E' : 'none',
          display: 'flex', flexDirection: 'column', gap: 4, minWidth: 100,
        }}>
          <div className="data-label">{s.label}</div>
          <div style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1,
            color: s.color,
          }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterBar({ filters, setFilter, resetFilters, onNewCase }: {
  filters: any;
  setFilter: (key: any, val: string) => void;
  resetFilters: () => void;
  onNewCase: () => void;
}) {
  const statusActive = filters.status !== 'all';
  const dateActive   = filters.dateRange !== 'all';
  const anyActive    = filters.search !== '' || statusActive || dateActive;
  const activeSelectStyle = { borderColor: '#00E5FF', color: '#00E5FF' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 20px',
      borderBottom: '1px solid #22262E',
      flexWrap: 'wrap',
    }}>
      <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
        <span style={{
          position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
          color: filters.search ? '#00E5FF' : '#5A5A65', fontSize: 11,
          transition: 'color 120ms',
        }}>⌕</span>
        <input
          id="case-search" type="text" placeholder="Search ID, title..."
          value={filters.search} onChange={e => setFilter('search', e.target.value)}
          style={{ width: '100%', paddingLeft: 22, ...(filters.search ? { borderColor: '#00E5FF' } : {}) }}
          spellCheck={false} aria-label="Search cases"
        />
      </div>

      <select
        id="filter-status" value={filters.status} onChange={e => setFilter('status', e.target.value)}
        style={{ minWidth: 110, ...(statusActive ? activeSelectStyle : {}) }} aria-label="Filter by status"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="flagged">Flagged</option>
        <option value="closed">Closed</option>
      </select>

      <select
        id="filter-date" value={filters.dateRange} onChange={e => setFilter('dateRange', e.target.value)}
        style={{ minWidth: 120, ...(dateActive ? activeSelectStyle : {}) }} aria-label="Filter by date range"
      >
        <option value="all">All Time</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
      </select>

      <button
        className={anyActive ? 'btn-accent' : 'btn-ghost'} onClick={resetFilters} id="reset-filters"
        aria-label="Reset all filters" style={{ opacity: anyActive ? 1 : 0.5, transition: 'opacity 150ms' }}
      >
        Reset
      </button>
      <div style={{ flex: 1 }} />
      <button
        className="btn-accent" id="new-case-btn" onClick={onNewCase} aria-label="Create new case"
        style={{ display: 'flex', alignItems: 'center', gap: 5 }}
      >
        <span style={{ fontSize: 13, lineHeight: 1, marginTop: -1 }}>+</span> New Case
      </button>
    </div>
  );
}

const COL = {
  id:        { width: 100, flexShrink: 0 },
  title:     { flex: 1, minWidth: 180 },
  status:    { width: 90,  flexShrink: 0 },
  entities:  { width: 80,  flexShrink: 0, textAlign: 'right' as const },
  anomalies: { width: 80,  flexShrink: 0, textAlign: 'right' as const },
  updated:   { width: 100, flexShrink: 0, textAlign: 'right' as const },
  action:    { width: 56,  flexShrink: 0, textAlign: 'center' as const },
};

function TableHeader() {
  const headers = [
    { key: 'id',        label: 'Case ID' },
    { key: 'title',     label: 'Title' },
    { key: 'status',    label: 'Status' },
    { key: 'entities',  label: 'Entities' },
    { key: 'anomalies', label: 'Anomalies' },
    { key: 'updated',   label: 'Last Updated' },
    { key: 'action',    label: '' },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '7px 20px',
      borderBottom: '1px solid #22262E',
      background: '#111318',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {headers.map(h => (
        <div key={h.key} className="data-label" style={COL[h.key as keyof typeof COL]}>{h.label}</div>
      ))}
    </div>
  );
}

const PRIORITY_BORDER: Record<string, string> = {
  critical: '#FF3B6B',
  high:     '#FF3B6B',
  medium:   '#FFB020',
  low:      '#22262E',
};

function CaseRow({ caseData, onOpen }: { caseData: CaseItem; onOpen: (c: CaseItem) => void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const borderColor = PRIORITY_BORDER[caseData.priority] ?? '#22262E';
  const isHighlit = hovered || focused;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(caseData); }
  }, [caseData, onOpen]);

  return (
    <div
      className="case-row"
      role="row" tabIndex={0}
      aria-label={`Open case ${caseData.id}: ${caseData.title}`}
      onClick={() => onOpen(caseData)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'flex', alignItems: 'center',
        padding: '9px 20px',
        borderBottom: '1px solid #22262E',
        background: isHighlit ? '#161A21' : 'transparent',
        borderLeft: `2px solid ${borderColor}`,
        transition: 'background 80ms, border-left-color 80ms',
        cursor: 'pointer',
        outline: focused ? '1px solid #00E5FF' : 'none',
        outlineOffset: '-1px',
      }}
    >
      <div style={COL.id}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.03em', color: isHighlit ? '#00E5FF' : '#9494A0', transition: 'color 80ms' }}>
          {caseData.id}
        </span>
      </div>

      <div style={COL.title}>
        <span style={{ fontSize: 12.5, fontWeight: 500, transition: 'color 80ms', color: isHighlit ? '#E8E8EE' : '#C8C8D0' }}>
          {caseData.title}
        </span>
        {caseData.investigator && (
          <span style={{ fontSize: 10.5, color: '#5A5A65', marginLeft: 8, fontFamily: 'Inter, sans-serif' }}>
            {caseData.investigator}
          </span>
        )}
      </div>

      <div style={COL.status}><StatusCell status={caseData.status} /></div>

      <div style={COL.entities}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#9494A0' }}>
          {String(caseData.entityCount).padStart(3, '\u2007')}
        </span>
      </div>

      <div style={COL.anomalies}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: caseData.anomalyCount > 0 ? '#FFB020' : '#39FF88' }}>
          {String(caseData.anomalyCount).padStart(3, '\u2007')}
        </span>
      </div>

      <div style={COL.updated} title={fmtAbsDate(caseData.lastUpdated)}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#5A5A65' }}>
          {fmtTimestamp(caseData.lastUpdated)}
        </span>
      </div>

      <div style={COL.action}>
        <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, transition: 'color 80ms', color: isHighlit ? '#00E5FF' : '#38383F', fontFamily: 'Inter, sans-serif' }}>
          Open →
        </span>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div role="status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 14 }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="1" y="1" width="34" height="34" rx="1" stroke="#22262E" strokeWidth="1"/>
        <circle cx="18" cy="15" r="6" stroke="#38383F" strokeWidth="1.2"/>
        <line x1="23" y1="20" x2="30" y2="27" stroke="#38383F" strokeWidth="1.2" strokeLinecap="square"/>
        <line x1="10" y1="27" x2="26" y2="27" stroke="#38383F" strokeWidth="1" strokeDasharray="2 2"/>
      </svg>
      <div style={{ color: '#5A5A65', fontSize: 11.5, textAlign: 'center', letterSpacing: '0.02em', fontFamily: 'Inter, sans-serif' }}>
        {hasFilters
          ? (<>No cases match the current filters.<br/><span style={{ color: '#38383F', fontSize: 10.5 }}>Adjust or reset filters to see results.</span></>)
          : 'No cases found.'}
      </div>
    </div>
  );
}

export const CaseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { cases, filters, setFilter, resetFilters, pushNavHistory } = usePhishieldStore();
  const { setCaseId } = useAnalyticsStore();
  const clock = useLiveClock(60_000);

  useEffect(() => {
    pushNavHistory({ id: 'dashboard', label: 'Dashboard', path: '/dashboard', depth: 0 });
  }, []);

  const filteredCases = useMemo(() => {
    const now = new Date();
    return cases.filter(c => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!c.id.toLowerCase().includes(q) && !c.title.toLowerCase().includes(q) && !c.investigator?.toLowerCase().includes(q)) return false;
      }
      if (filters.status !== 'all' && c.status !== filters.status) return false;

      if (filters.dateRange !== 'all') {
        const days = parseInt(filters.dateRange);
        if (new Date(c.lastUpdated) < new Date(now.getTime() - days * 86_400_000)) return false;
      }
      return true;
    });
  }, [cases, filters]);

  const hasFilters = filters.search !== '' || filters.status !== 'all' || filters.dateRange !== 'all';

  const handleOpenCase = (caseData: CaseItem) => {
    setCaseId(caseData.id);
    pushNavHistory({ id: `case-${caseData.id}`, label: `Case: ${caseData.title}`, path: `/case/${caseData.id}`, depth: 1 });
    navigate(`/case/${caseData.id}`);
  };

  const handleNewCase = () => {
    pushNavHistory({ id: 'new-case', label: 'New Case', path: '/new-case', depth: 1 });
    navigate('/new-case');
  };

  return (
    <div
      className="scanline-bg phishield-panel"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', background: '#0A0A0C' }}
    >
      <header style={{ padding: '18px 24px 14px', borderBottom: '1px solid #22262E', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="data-label" style={{ marginBottom: 4 }}>Phishield / Dashboard</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#E8E8EE', letterSpacing: '-0.01em', fontFamily: 'Inter, sans-serif' }}>
            Case Overview
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#39FF88', display: 'inline-block', boxShadow: 'none' }} />
            <span className="data-label">System Nominal</span>
          </div>
          <time
            dateTime={clock.toISOString()}
            style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#38383F' }}
          >
            {clock.toUTCString().replace('GMT', 'UTC').slice(0, -4)}
          </time>
        </div>
      </header>

      <StatStrip cases={cases} />

      <FilterBar
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        onNewCase={handleNewCase}
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <TableHeader />
        {filteredCases.length === 0
          ? <EmptyState hasFilters={hasFilters} />
          : filteredCases.map(c => <CaseRow key={c.id} caseData={c} onOpen={handleOpenCase} />)
        }
      </div>

      <div style={{ padding: '8px 20px', borderTop: '1px solid #22262E', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#38383F' }}>
          {filteredCases.length === cases.length
            ? `${cases.length} cases`
            : `${filteredCases.length} of ${cases.length} cases`
          }
        </span>
        <span className="data-label" title={clock.toUTCString()}>
          Updated {fmtTimestamp(clock.toISOString())}
        </span>
      </div>
    </div>
  );
};
