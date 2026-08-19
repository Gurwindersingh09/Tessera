import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhishieldStore } from '../store/usePhishieldStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { CaseItem } from '../types/schema';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';

/* ─── Easing ─── */
const EASE_SHARP: [number, number, number, number] = [0.4, 0, 0.2, 1];

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

/* ─── Status Config — warm tonal ─── */
const STATUS_CONFIG: Record<string, { color: string; darkColor: string; label: string; pulse?: boolean }> = {
  active:  { color: '#C4622D', darkColor: '#8C3D1A', label: 'Active' },
  flagged: { color: '#B53924', darkColor: '#8A2517', label: 'Flagged', pulse: true },
  closed:  { color: '#3D7A4A', darkColor: '#2B5A36', label: 'Closed' },
};

function StatusCell({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { color: '#DDD5CA', darkColor: '#C8BFB3', label: status };
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.color, display: 'inline-block', flexShrink: 0,
        boxShadow: 'none',
        animation: cfg.pulse ? 'status-pulse 2.5s ease-in-out infinite' : 'none',
      }} />
      <span style={{ fontSize: 11, color: '#7A6F63', letterSpacing: '0.02em' }}>{cfg.label}</span>
    </span>
  );
}

/* ─── Animated Counter ─── */
function AnimatedStat({ target, color }: { target: number; color: string }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => String(Math.round(v)).padStart(2, '0'));
  const [display, setDisplay] = useState('00');

  useEffect(() => {
    const controls = animate(motionVal, target, { duration: 1.2, ease: EASE_SHARP });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [target]);

  return (
    <span style={{
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1,
      color,
    }}>
      {display}
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
    { label: 'Total Cases',      value: cases.length, color: '#8C3D1A' },
    { label: 'Active',           value: active, color: '#C4622D' },
    { label: 'Flagged',          value: flagged, color: '#B53924' },
    { label: 'Closed',           value: closed, color: '#3D7A4A' },
    { label: 'Entities Tracked', value: entities, color: '#6B2E12' },
    { label: 'Total Anomalies',  value: anomalies, color: '#D4854A' },
  ];

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #DDD5CA', flexWrap: 'wrap', background: '#F3EDE4' }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{
          padding: '14px 24px',
          borderRight: i < stats.length - 1 ? '1px solid #DDD5CA' : 'none',
          display: 'flex', flexDirection: 'column', gap: 4, minWidth: 100,
        }}>
          <div className="data-label">{s.label}</div>
          <AnimatedStat target={s.value} color={s.color} />
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
  const activeSelectStyle = { borderColor: '#C4622D', color: '#C4622D' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 20px',
      borderBottom: '1px solid #DDD5CA',
      flexWrap: 'wrap',
      background: '#FAF6F0',
    }}>
      <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
        <span style={{
          position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
          color: filters.search ? '#C4622D' : '#C8BFB3', fontSize: 11,
          transition: 'color 120ms',
        }}>⌕</span>
        <input
          id="case-search" type="text" placeholder="Search ID, title..."
          value={filters.search} onChange={e => setFilter('search', e.target.value)}
          style={{ width: '100%', paddingLeft: 22, ...(filters.search ? { borderColor: '#C4622D' } : {}) }}
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
      borderBottom: '1px solid #DDD5CA',
      background: '#F3EDE4',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {headers.map(h => (
        <div key={h.key} className="data-label" style={COL[h.key as keyof typeof COL]}>{h.label}</div>
      ))}
    </div>
  );
}

const PRIORITY_BORDER: Record<string, string> = {
  critical: '#B53924',
  high:     '#B53924',
  medium:   '#D4854A',
  low:      '#DDD5CA',
};

/* ─── Row animation variants ─── */
const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: EASE_SHARP },
  }),
};

function CaseRow({ caseData, onOpen, index, featured }: { caseData: CaseItem; onOpen: (c: CaseItem) => void; index: number; featured?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const borderColor = PRIORITY_BORDER[caseData.priority] ?? '#DDD5CA';
  const isHighlit = hovered || focused;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(caseData); }
  }, [caseData, onOpen]);

  if (featured) {
    return (
      <motion.div
        custom={index}
        variants={rowVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(42,36,32,0.08)' }}
        role="row" tabIndex={0}
        aria-label={`Open case ${caseData.id}: ${caseData.title}`}
        onClick={() => onOpen(caseData)}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          margin: '12px 16px',
          padding: '16px 20px',
          background: '#FFFFFF',
          border: `1px solid ${isHighlit ? '#E8B896' : '#DDD5CA'}`,
          borderLeft: `3px solid ${borderColor}`,
          borderRadius: 10,
          boxShadow: '0 1px 3px rgba(42,36,32,0.06), 0 1px 2px rgba(42,36,32,0.04)',
          cursor: 'pointer',
          outline: focused ? '2px solid #C4622D' : 'none',
          outlineOffset: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.03em', color: '#C4622D' }}>
              {caseData.id}
            </span>
            <StatusCell status={caseData.status} />
          </div>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#A89F93' }}>
            {fmtTimestamp(caseData.lastUpdated)}
          </span>
        </div>
        <div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#2A2420', fontFamily: '"Fraunces", Georgia, serif' }}>
            {caseData.title}
          </span>
          {caseData.investigator && (
            <span style={{ fontSize: 11, color: '#7A6F63', marginLeft: 10, fontFamily: 'Inter, sans-serif' }}>
              {caseData.investigator}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#7A6F63' }}>
          <span><span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#8C3D1A', fontWeight: 500 }}>{caseData.entityCount}</span> entities</span>
          <span><span style={{ fontFamily: 'IBM Plex Mono, monospace', color: caseData.anomalyCount > 0 ? '#D4854A' : '#3D7A4A', fontWeight: 500 }}>{caseData.anomalyCount}</span> anomalies</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -1, boxShadow: '0 2px 8px rgba(42,36,32,0.06)' }}
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
        borderBottom: '1px solid #DDD5CA',
        background: isHighlit ? '#EDE5D8' : 'transparent',
        borderLeft: `2px solid ${borderColor}`,
        transition: 'background 80ms, border-left-color 80ms',
        cursor: 'pointer',
        outline: focused ? '2px solid #C4622D' : 'none',
        outlineOffset: -1,
      }}
    >
      <div style={COL.id}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.03em', color: isHighlit ? '#C4622D' : '#7A6F63', transition: 'color 80ms' }}>
          {caseData.id}
        </span>
      </div>

      <div style={COL.title}>
        <span style={{ fontSize: 12.5, fontWeight: 500, transition: 'color 80ms', color: isHighlit ? '#2A2420' : '#4A4340' }}>
          {caseData.title}
        </span>
        {caseData.investigator && (
          <span style={{ fontSize: 10.5, color: '#A89F93', marginLeft: 8, fontFamily: 'Inter, sans-serif' }}>
            {caseData.investigator}
          </span>
        )}
      </div>

      <div style={COL.status}><StatusCell status={caseData.status} /></div>

      <div style={COL.entities}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#7A6F63' }}>
          {String(caseData.entityCount).padStart(3, '\u2007')}
        </span>
      </div>

      <div style={COL.anomalies}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: caseData.anomalyCount > 0 ? '#D4854A' : '#3D7A4A' }}>
          {String(caseData.anomalyCount).padStart(3, '\u2007')}
        </span>
      </div>

      <div style={COL.updated} title={fmtAbsDate(caseData.lastUpdated)}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#A89F93' }}>
          {fmtTimestamp(caseData.lastUpdated)}
        </span>
      </div>

      <div style={COL.action}>
        <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, transition: 'color 80ms', color: isHighlit ? '#C4622D' : '#C8BFB3', fontFamily: 'Inter, sans-serif' }}>
          Open →
        </span>
      </div>
    </motion.div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div role="status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 14 }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="1" y="1" width="34" height="34" rx="4" stroke="#DDD5CA" strokeWidth="1"/>
        <circle cx="18" cy="15" r="6" stroke="#C8BFB3" strokeWidth="1.2"/>
        <line x1="23" y1="20" x2="30" y2="27" stroke="#C8BFB3" strokeWidth="1.2" strokeLinecap="square"/>
        <line x1="10" y1="27" x2="26" y2="27" stroke="#C8BFB3" strokeWidth="1" strokeDasharray="2 2"/>
      </svg>
      <div style={{ color: '#A89F93', fontSize: 11.5, textAlign: 'center', letterSpacing: '0.02em', fontFamily: 'Inter, sans-serif' }}>
        {hasFilters
          ? (<>No cases match the current filters.<br/><span style={{ color: '#C8BFB3', fontSize: 10.5 }}>Adjust or reset filters to see results.</span></>)
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
      className="grain-texture"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', background: '#FAF6F0' }}
    >
      <header style={{ padding: '18px 24px 14px', borderBottom: '1px solid #DDD5CA', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'relative', zIndex: 1 }}>
        <div>
          <div className="data-label" style={{ marginBottom: 4 }}>Phishield / Dashboard</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#2A2420', letterSpacing: '-0.01em', fontFamily: '"Fraunces", Georgia, serif' }}>
            Case Overview
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3D7A4A', display: 'inline-block', boxShadow: 'none' }} />
            <span className="data-label">System Nominal</span>
          </div>
          <time
            dateTime={clock.toISOString()}
            style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#A89F93' }}
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

      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <TableHeader />
        {filteredCases.length === 0
          ? <EmptyState hasFilters={hasFilters} />
          : filteredCases.map((c, i) => (
              <CaseRow
                key={c.id}
                caseData={c}
                onOpen={handleOpenCase}
                index={i}
                featured={i === 0 && !hasFilters}
              />
            ))
        }
      </div>

      <div style={{ padding: '8px 20px', borderTop: '1px solid #DDD5CA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#A89F93' }}>
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
