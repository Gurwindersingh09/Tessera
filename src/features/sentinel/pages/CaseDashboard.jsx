/**
 * @file CaseDashboard.jsx  (Sentinel feature)
 * @description
 * The first page an investigator sees after login.
 * Displays a stat strip, filter bar, and dense case table.
 *
 * ROUTE:
 *   Mount at your dashboard route, e.g.:
 *     <Route path="/" element={<CaseDashboard />} />
 *   or within a layout route if you are using React Router 6 nested routes.
 *
 * DATA:
 *   Reads `cases` from useSentinelStore. Replace SEED_CASES in the store with
 *   real API data fetched in a useEffect or via React Query / SWR.
 *
 * NAVIGATION:
 *   - Row click  → navigate('/case/:id')   pushes depth-1 nav history entry
 *   - "+ New Case" → navigate('/new-case') pushes depth-1 nav history entry
 *   Both routes should be defined in your router.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSentinelStore } from '../store/useSentinelStore';

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
function fmtTimestamp(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);
  if (diffH < 1)  return 'just now';
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7)  return `${diffD}d ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

function fmtAbsDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ─── Status Dot ─────────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  active:  { color: '#4ADE80', label: 'Active'  },
  flagged: { color: '#F59E0B', label: 'Flagged' },
  closed:  { color: '#4B5563', label: 'Closed'  },
};

function StatusCell({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { color: '#4B5563', label: status };
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.color, display: 'inline-block', flexShrink: 0,
        boxShadow: status === 'active' ? `0 0 6px ${cfg.color}66` : 'none',
      }} />
      <span style={{ fontSize: 11, color: '#9494A0', letterSpacing: '0.02em' }}>{cfg.label}</span>
    </span>
  );
}

/* ─── Stat Strip ─────────────────────────────────────────────────────────────── */
function StatStrip({ cases }) {
  const active    = cases.filter(c => c.status === 'active').length;
  const flagged   = cases.filter(c => c.status === 'flagged').length;
  const closed    = cases.filter(c => c.status === 'closed').length;
  const entities  = cases.reduce((s, c) => s + c.entityCount, 0);
  const anomalies = cases.reduce((s, c) => s + c.anomalyCount, 0);

  const stats = [
    { label: 'Total Cases',      value: String(cases.length).padStart(2, '0') },
    { label: 'Active',           value: String(active).padStart(2, '0'),    accent: active > 0  },
    { label: 'Flagged',          value: String(flagged).padStart(2, '0'),   warn: flagged > 0   },
    { label: 'Closed',           value: String(closed).padStart(2, '0')    },
    { label: 'Entities Tracked', value: String(entities)                   },
    { label: 'Total Anomalies',  value: String(anomalies),                  warn: anomalies > 0 },
  ];

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{
          padding: '14px 24px',
          borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          display: 'flex', flexDirection: 'column', gap: 4, minWidth: 100,
        }}>
          <div className="data-label">{s.label}</div>
          <div style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1,
            color: s.accent ? '#5FA8D3' : s.warn ? '#F59E0B' : '#E8E8EE',
          }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Filter Bar ─────────────────────────────────────────────────────────────── */
function FilterBar({ filters, setFilter, resetFilters, onNewCase }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      flexWrap: 'wrap',
    }}>
      {/* Search input */}
      <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
        <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#5A5A65', fontSize: 11 }}>⌕</span>
        <input
          id="case-search"
          type="text"
          placeholder="Search case ID, title, investigator..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
          style={{ width: '100%', paddingLeft: 22 }}
          spellCheck={false}
        />
      </div>

      {/* Status filter */}
      <select id="filter-status" value={filters.status} onChange={e => setFilter('status', e.target.value)} style={{ minWidth: 110 }}>
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="flagged">Flagged</option>
        <option value="closed">Closed</option>
      </select>

      {/* Date range filter */}
      <select id="filter-date" value={filters.dateRange} onChange={e => setFilter('dateRange', e.target.value)} style={{ minWidth: 120 }}>
        <option value="all">All Time</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
      </select>

      <button className="btn-ghost" onClick={resetFilters} id="reset-filters">Reset</button>
      <div style={{ flex: 1 }} />
      <button className="btn-accent" id="new-case-btn" onClick={onNewCase}
        style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 13, lineHeight: 1, marginTop: -1 }}>+</span>
        New Case
      </button>
    </div>
  );
}

/* ─── Table Column Layout ─────────────────────────────────────────────────────── */
const COL = {
  id:        { width: 100, flexShrink: 0 },
  title:     { flex: 1, minWidth: 180 },
  status:    { width: 90,  flexShrink: 0 },
  entities:  { width: 80,  flexShrink: 0, textAlign: 'right' },
  anomalies: { width: 80,  flexShrink: 0, textAlign: 'right' },
  updated:   { width: 100, flexShrink: 0, textAlign: 'right' },
  action:    { width: 56,  flexShrink: 0, textAlign: 'center' },
};

function TableHeader() {
  const headers = [
    { key: 'id',        label: 'Case ID'      },
    { key: 'title',     label: 'Title'        },
    { key: 'status',    label: 'Status'       },
    { key: 'entities',  label: 'Entities'     },
    { key: 'anomalies', label: 'Anomalies'    },
    { key: 'updated',   label: 'Last Updated' },
    { key: 'action',    label: ''             },
  ];
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '7px 20px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      background: '#0F0F12',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {headers.map(h => (
        <div key={h.key} className="data-label" style={COL[h.key]}>{h.label}</div>
      ))}
    </div>
  );
}

/* ─── Case Row ───────────────────────────────────────────────────────────────── */
const PRIORITY_BORDER = {
  critical: '#EF4444',
  high:     '#F59E0B',
  medium:   '#5FA8D3',
  low:      '#2D2D35',
};

function CaseRow({ caseData, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const borderColor = PRIORITY_BORDER[caseData.priority] ?? '#2D2D35';

  return (
    <div
      className="case-row"
      onClick={() => onOpen(caseData)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center',
        padding: '9px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: hovered ? '#141418' : 'transparent',
        borderLeft: `2px solid ${hovered ? borderColor : borderColor + '66'}`,
        transition: 'background 80ms, border-left-color 80ms',
        cursor: 'pointer',
      }}
    >
      {/* Case ID */}
      <div style={COL.id}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.03em',
          color: hovered ? '#5FA8D3' : '#9494A0', transition: 'color 80ms' }}>
          {caseData.id}
        </span>
      </div>

      {/* Title + investigator inline */}
      <div style={COL.title}>
        <span style={{ fontSize: 12.5, fontWeight: 500, transition: 'color 80ms',
          color: hovered ? '#E8E8EE' : '#C8C8D0' }}>
          {caseData.title}
        </span>
        {caseData.investigator && (
          <span style={{ fontSize: 10.5, color: '#5A5A65', marginLeft: 8, fontFamily: 'Inter, sans-serif' }}>
            {caseData.investigator}
          </span>
        )}
      </div>

      {/* Status */}
      <div style={COL.status}><StatusCell status={caseData.status} /></div>

      {/* Entity count */}
      <div style={COL.entities}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#9494A0' }}>
          {String(caseData.entityCount).padStart(3, '\u2007')}
        </span>
      </div>

      {/* Anomaly count — amber if nonzero */}
      <div style={COL.anomalies}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11,
          color: caseData.anomalyCount > 0 ? '#F59E0B' : '#4B5563' }}>
          {String(caseData.anomalyCount).padStart(3, '\u2007')}
        </span>
      </div>

      {/* Last updated */}
      <div style={COL.updated} title={fmtAbsDate(caseData.lastUpdated)}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#5A5A65' }}>
          {fmtTimestamp(caseData.lastUpdated)}
        </span>
      </div>

      {/* Open action */}
      <div style={COL.action}>
        <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500,
          transition: 'color 80ms', color: hovered ? '#5FA8D3' : '#38383F',
          fontFamily: 'Inter, sans-serif' }}>
          Open →
        </span>
      </div>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────────────── */
function EmptyState({ hasFilters }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12 }}>
      <div style={{ width: 40, height: 40, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38383F', fontSize: 18 }}>
        ⊘
      </div>
      <div style={{ color: '#5A5A65', fontSize: 12, textAlign: 'center' }}>
        {hasFilters ? 'No cases match the current filters.' : 'No cases found.'}
      </div>
    </div>
  );
}

/* ─── CaseDashboard ──────────────────────────────────────────────────────────── */

/**
 * CaseDashboard — main entry page for the Sentinel platform.
 *
 * Mount at your root/dashboard route:
 *   <Route path="/" element={<CaseDashboard />} />
 *
 * Required sibling routes (add to your router):
 *   <Route path="/case/:caseId" element={<YourCaseDetailPage />} />
 *   <Route path="/new-case"     element={<YourNewCasePage />} />
 */
export default function CaseDashboard() {
  const navigate = useNavigate();
  const { cases, filters, setFilter, resetFilters, pushNavHistory } = useSentinelStore();

  // Register this page in the nav history on mount
  useEffect(() => {
    pushNavHistory({ id: 'dashboard', label: 'Dashboard', path: '/', depth: 0 });
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
        if (new Date(c.lastUpdated) < new Date(now - days * 86_400_000)) return false;
      }
      return true;
    });
  }, [cases, filters]);

  const hasFilters = filters.search !== '' || filters.status !== 'all' || filters.dateRange !== 'all';

  const handleOpenCase = (caseData) => {
    pushNavHistory({ id: `case-${caseData.id}`, label: `Case: ${caseData.title}`, path: `/case/${caseData.id}`, depth: 1 });
    navigate(`/case/${caseData.id}`);
  };

  const handleNewCase = () => {
    pushNavHistory({ id: 'new-case', label: 'New Case', path: '/new-case', depth: 1 });
    navigate('/new-case');
  };

  return (
    <div
      className="scanline-bg sentinel-panel"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', background: '#0A0A0C' }}
    >
      {/* ── Page Header ── */}
      <header style={{ padding: '18px 24px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="data-label" style={{ marginBottom: 4 }}>Sentinel / Dashboard</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#E8E8EE', letterSpacing: '-0.01em', fontFamily: 'Inter, sans-serif' }}>
            Case Overview
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', boxShadow: '0 0 6px #4ADE8066' }} />
            <span className="data-label">System Nominal</span>
          </div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#38383F' }}>
            {new Date().toUTCString().replace('GMT', 'UTC').slice(0, -4)}
          </div>
        </div>
      </header>

      {/* ── Stat Strip ── */}
      <StatStrip cases={cases} />

      {/* ── Filter Bar ── */}
      <FilterBar
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        onNewCase={handleNewCase}
      />

      {/* ── Case Table ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <TableHeader />
        {filteredCases.length === 0
          ? <EmptyState hasFilters={hasFilters} />
          : filteredCases.map(c => <CaseRow key={c.id} caseData={c} onOpen={handleOpenCase} />)
        }
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#38383F' }}>
          Showing {filteredCases.length} of {cases.length} cases
        </span>
        <span className="data-label">Last sync: {fmtTimestamp(new Date().toISOString())}</span>
      </div>
    </div>
  );
}
