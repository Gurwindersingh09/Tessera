import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTesseraStore } from '../store/useTesseraStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { CaseItem } from '../types/schema';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  CheckSquare, 
  Square, 
  Activity, 
  ShieldAlert, 
  UserPlus, 
  X,
  RotateCcw,
  Check
} from 'lucide-react';
import { CaseActionsMenu, INVESTIGATORS_LIST } from '../components/CaseActionsMenu';
import { CaseDeleteModal } from '../components/CaseDeleteModal';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { getInitials } from '../context/AuthContext';

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

/* ─── Status Config with CSS Variable References ─── */
const STATUS_CONFIG: Record<string, { colorVar: string; label: string; pulse?: boolean }> = {
  active:   { colorVar: 'var(--color-status-active)', label: 'Active' },
  flagged:  { colorVar: 'var(--color-status-flagged)', label: 'Flagged', pulse: true },
  closed:   { colorVar: 'var(--color-status-closed)', label: 'Closed' },
  archived: { colorVar: 'var(--color-status-muted)', label: 'Archived' },
};

function StatusCell({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { colorVar: 'var(--color-border)', label: status };
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.colorVar, display: 'inline-block', flexShrink: 0,
        boxShadow: 'none',
        animation: cfg.pulse ? 'status-pulse 2.5s ease-in-out infinite' : 'none',
      }} />
      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', letterSpacing: '0.02em', textTransform: 'capitalize' }}>
        {cfg.label}
      </span>
    </span>
  );
}

/* ─── Inline Mini Sparkline (7-day trend) ─── */
function MiniSparkline({ data, color, isUp }: { data: number[]; color: string; isUp?: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 54;
  const height = 14;
  const padding = 2;
  
  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const lastPoint = points.split(' ').pop()?.split(',') ?? ['0', '0'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle
          cx={lastPoint[0]}
          cy={lastPoint[1]}
          r="1.8"
          fill={color}
        />
      </svg>
      <span style={{ fontSize: 9, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-text-muted)' }}>
        {isUp ? '↑ 7d' : '↓ 7d'}
      </span>
    </div>
  );
}

/* ─── Animated Counter ─── */
function AnimatedStat({ target, color, isHeavy }: { target: number; color: string; isHeavy?: boolean }) {
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
      fontSize: isHeavy ? 25 : 20,
      fontWeight: isHeavy ? 600 : 500,
      letterSpacing: '-0.02em',
      lineHeight: 1,
      color,
    }}>
      {display}
    </span>
  );
}

/* ─── Rich Stats Strip with Sparklines & Weight Hierarchy ─── */
function StatStrip({ cases }: { cases: CaseItem[] }) {
  const active = cases.filter(c => c.status === 'active').length;
  const flagged = cases.filter(c => c.status === 'flagged').length;
  const closed = cases.filter(c => c.status === 'closed').length;
  const entities = cases.reduce((s, c) => s + c.entityCount, 0);
  const anomalies = cases.reduce((s, c) => s + c.anomalyCount, 0);

  const stats = [
    {
      label: 'Total Cases',
      value: cases.length,
      color: '#C4622D',
      trend: [14, 15, 15, 16, 17, 18, cases.length],
      isUp: true,
      isHeavy: false,
    },
    {
      label: 'Active',
      value: active,
      color: '#C4622D',
      trend: [8, 9, 10, 9, 11, 11, active],
      isUp: true,
      isHeavy: true,
      dotColor: 'var(--color-status-active)',
    },
    {
      label: 'Flagged',
      value: flagged,
      color: '#B53924',
      trend: [2, 3, 2, 4, 3, 5, flagged],
      isUp: true,
      isHeavy: true,
      dotColor: 'var(--color-status-flagged)',
      pulse: true,
    },
    {
      label: 'Closed',
      value: closed,
      color: '#3D7A4A',
      trend: [4, 5, 5, 6, 6, 7, closed],
      isUp: true,
      isHeavy: false,
    },
    {
      label: 'Entities Tracked',
      value: entities,
      color: '#8C3D1A',
      trend: [38, 42, 45, 48, 50, 52, entities],
      isUp: true,
      isHeavy: false,
    },
    {
      label: 'Total Anomalies',
      value: anomalies,
      color: '#D4854A',
      trend: [18, 20, 22, 21, 24, 26, anomalies],
      isUp: true,
      isHeavy: false,
    },
  ];

  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', background: 'var(--color-bg-surface)' }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{
          padding: '11px 18px',
          borderRight: i < stats.length - 1 ? '1px solid var(--color-border)' : 'none',
          display: 'flex', flexDirection: 'column', gap: 4, minWidth: 125, flex: '1 1 125px',
          background: s.isHeavy ? 'var(--color-bg-base)' : 'transparent',
          borderTop: s.isHeavy ? `2px solid ${s.color}` : '2px solid transparent',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
            <div className="data-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {s.dotColor && (
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: s.dotColor, display: 'inline-block', flexShrink: 0,
                  animation: s.pulse ? 'status-pulse 2.5s ease-in-out infinite' : 'none',
                }} />
              )}
              <span style={{ fontWeight: s.isHeavy ? 600 : 500, color: s.isHeavy ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                {s.label}
              </span>
            </div>
          </div>

          <AnimatedStat target={s.value} color={s.color} isHeavy={s.isHeavy} />

          <MiniSparkline data={s.trend} color={s.color} isUp={s.isUp} />
        </div>
      ))}
    </div>
  );
}

/* ─── Priority Queue: 3 Compact Cards for Highest-Anomaly Active Cases ─── */
function PriorityQueue({ 
  cases, 
  onOpen,
  onStatusChange,
  onPriorityChange,
  onReassign,
  onDeleteRequest,
}: { 
  cases: CaseItem[]; 
  onOpen: (c: CaseItem) => void;
  onStatusChange: (caseId: string, status: CaseItem['status']) => void;
  onPriorityChange: (caseId: string, priority: CaseItem['priority']) => void;
  onReassign: (caseId: string, investigator: string) => void;
  onDeleteRequest: (caseData: CaseItem) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const priorityCases = useMemo(() => {
    return cases
      .filter(c => c.status === 'active' || c.status === 'flagged')
      .sort((a, b) => b.anomalyCount - a.anomalyCount)
      .slice(0, 3);
  }, [cases]);

  if (priorityCases.length === 0) return null;

  return (
    <div style={{
      padding: '12px 20px',
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-bg-base)',
      transition: 'all 200ms ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: collapsed ? 0 : 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--color-status-flagged)', display: 'inline-block',
            animation: 'status-pulse 2.5s ease-in-out infinite'
          }} />
          <span className="data-label" style={{ color: '#C4622D', fontWeight: 600, letterSpacing: '0.1em' }}>
            Priority Queue · Highest Risk Active Cases
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-text-muted)' }}>
            3 cases surfaced
          </span>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Priority Queue" : "Compress Priority Queue"}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              border: '1px solid var(--color-border)',
              borderRadius: 3,
              background: 'var(--color-bg-surface)',
              padding: '2px 6px',
              fontSize: 9.5,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            {collapsed ? <ChevronDown className="w-3 h-3 text-[#C4622D]" /> : <ChevronUp className="w-3 h-3 text-[var(--color-text-secondary)]" />}
            <span>{collapsed ? 'Expand' : 'Compress'}</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {priorityCases.map((c, i) => {
            const initials = getInitials(c.investigator);
            const isCritical = c.priority === 'critical';
            const borderColor = isCritical ? 'var(--color-status-flagged)' : 'var(--color-status-active)';

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: EASE_SHARP }}
                whileHover={{ y: -2, boxShadow: 'var(--shadow-dropdown)' }}
                onClick={() => onOpen(c)}
                tabIndex={0}
                role="button"
                aria-label={`Open high-priority case ${c.id}: ${c.title}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(c); } }}
                style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-border)',
                  borderLeft: `3px solid ${borderColor}`,
                  borderRadius: 8,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  transition: 'border-color 150ms, box-shadow 150ms',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#C4622D',
                    }}>
                      {c.id}
                    </span>
                    <span style={{
                      fontSize: 9,
                      textTransform: 'uppercase',
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontWeight: 600,
                      padding: '1px 5px',
                      borderRadius: 2,
                      background: isCritical ? 'var(--color-status-flagged-bg)' : 'var(--color-status-warning-bg)',
                      color: isCritical ? 'var(--color-status-flagged)' : 'var(--color-status-warning)',
                      border: `1px solid ${isCritical ? 'var(--color-status-flagged-border)' : 'var(--color-status-warning-border)'}`,
                    }}>
                      {c.priority}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                      title={`Assigned: ${c.investigator}`}
                      style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, fontWeight: 600, color: 'var(--color-text-secondary)',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {initials}
                    </div>

                    <CaseActionsMenu
                      caseData={c}
                      onStatusChange={onStatusChange}
                      onPriorityChange={onPriorityChange}
                      onReassign={onReassign}
                      onDeleteRequest={onDeleteRequest}
                      onOpenCase={onOpen}
                      alignRight={true}
                    />
                  </div>
                </div>

                <div style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  fontFamily: '"Fraunces", Georgia, serif',
                  lineHeight: 1.25,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {c.title}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: 19,
                      fontWeight: 600,
                      color: 'var(--color-status-flagged)',
                      lineHeight: 1,
                    }}>
                      {String(c.anomalyCount).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 9.5, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      anomalies
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', fontFamily: 'Inter, sans-serif' }}>
                    {c.entityCount} entities · {c.status}
                  </span>
                </div>

                <div style={{
                  fontSize: 10,
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-raised)',
                  padding: '4px 7px',
                  borderRadius: 4,
                  border: '1px solid var(--color-border)',
                  lineHeight: 1.3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-status-flagged)', flexShrink: 0 }} />
                  <span>
                    {c.anomalyCount >= 10
                      ? `${c.anomalyCount} anomalies · Rapid transaction volume`
                      : `${c.anomalyCount} anomalies · Pattern deviation flagged`}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterBar({ 
  filters, 
  setFilter, 
  resetFilters, 
  onNewCase,
}: {
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
      borderBottom: '1px solid var(--color-border)',
      flexWrap: 'wrap',
      background: 'var(--color-bg-surface)',
    }}>
      <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
        <span style={{
          position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
          color: filters.search ? '#C4622D' : 'var(--color-text-faint)', fontSize: 11,
          transition: 'color 120ms',
        }}>⌕</span>
        <input
          id="case-search" type="text" placeholder="Search ID, title, investigator..."
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
        <option value="archived">Archived</option>
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
  select:    { width: 34,  flexShrink: 0, textAlign: 'center' as const },
  id:        { width: 95,  flexShrink: 0 },
  title:     { flex: 1, minWidth: 180 },
  status:    { width: 90,  flexShrink: 0 },
  entities:  { width: 75,  flexShrink: 0, textAlign: 'right' as const },
  anomalies: { width: 75,  flexShrink: 0, textAlign: 'right' as const },
  updated:   { width: 95,  flexShrink: 0, textAlign: 'right' as const },
  action:    { width: 75,  flexShrink: 0, textAlign: 'right' as const },
};

function TableHeader({
  allSelected,
  someSelected,
  onToggleSelectAll,
}: {
  allSelected: boolean;
  someSelected: boolean;
  onToggleSelectAll: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '7px 20px',
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-bg-surface)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div style={COL.select}>
        <button
          type="button"
          onClick={onToggleSelectAll}
          title={allSelected ? "Deselect all" : "Select all"}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)'
          }}
        >
          {allSelected ? (
            <CheckSquare className="w-3.5 h-3.5 text-[#C4622D]" />
          ) : someSelected ? (
            <div style={{ width: 14, height: 14, border: '1.5px solid #C4622D', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 8, height: 2, background: '#C4622D', borderRadius: 1 }} />
            </div>
          ) : (
            <Square className="w-3.5 h-3.5 text-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]" />
          )}
        </button>
      </div>

      <div className="data-label" style={COL.id}>Case ID</div>
      <div className="data-label" style={COL.title}>Title</div>
      <div className="data-label" style={COL.status}>Status</div>
      <div className="data-label" style={COL.entities}>Entities</div>
      <div className="data-label" style={COL.anomalies}>Anomalies</div>
      <div className="data-label" style={COL.updated}>Last Updated</div>
      <div className="data-label" style={COL.action}>Actions</div>
    </div>
  );
}

/* ─── Row animation variants ─── */
const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: EASE_SHARP },
  }),
  exit: {
    opacity: 0,
    height: 0,
    paddingTop: 0,
    paddingBottom: 0,
    transition: { duration: 0.25, ease: EASE_SHARP },
  },
};

function CaseRow({ 
  caseData, 
  onOpen, 
  index, 
  featured,
  isSelected,
  onToggleSelect,
  hasAnySelection,
  onStatusChange,
  onPriorityChange,
  onReassign,
  onDeleteRequest,
}: { 
  caseData: CaseItem; 
  onOpen: (c: CaseItem) => void; 
  index: number; 
  featured?: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  hasAnySelection: boolean;
  onStatusChange: (caseId: string, status: CaseItem['status']) => void;
  onPriorityChange: (caseId: string, priority: CaseItem['priority']) => void;
  onReassign: (caseId: string, investigator: string) => void;
  onDeleteRequest: (caseData: CaseItem) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // Consistent status-driven & priority-driven left border on every row
  const getBorderColor = () => {
    if (caseData.status === 'flagged' || caseData.priority === 'critical') return 'var(--color-status-flagged)';
    if (caseData.status === 'active' || caseData.priority === 'high') return 'var(--color-status-active)';
    if (caseData.priority === 'medium') return 'var(--color-status-warning)';
    if (caseData.status === 'closed') return 'var(--color-status-closed)';
    return 'var(--color-border)';
  };

  const borderColor = getBorderColor();
  const isHighlit = hovered || focused || isSelected;
  const isHighAnomaly = caseData.anomalyCount >= 10;

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
        exit="exit"
        whileHover={{ y: -2, boxShadow: 'var(--shadow-dropdown)' }}
        role="row" tabIndex={0}
        aria-label={`Open featured case ${caseData.id}: ${caseData.title}`}
        onClick={() => onOpen(caseData)}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          margin: '12px 16px',
          padding: '16px 20px',
          background: isSelected ? 'var(--color-bg-hover)' : 'var(--color-bg-surface)',
          border: `1px solid ${isSelected ? '#C4622D' : (isHighlit ? 'var(--color-border-strong)' : 'var(--color-border)')}`,
          borderLeft: `3.5px solid ${borderColor}`,
          borderRadius: 10,
          boxShadow: 'var(--shadow-card)',
          cursor: 'pointer',
          outline: focused ? '2px solid #C4622D' : 'none',
          outlineOffset: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(caseData.id);
              }}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-[#C4622D]" />
              ) : (
                <Square className="w-4 h-4 text-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]" />
              )}
            </button>

            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.03em', color: '#C4622D', fontWeight: 600 }}>
              {caseData.id}
            </span>
            <StatusCell status={caseData.status} />
            <span style={{
              fontSize: 9.5, textTransform: 'uppercase', fontFamily: 'IBM Plex Mono, monospace',
              color: '#C4622D', background: 'var(--color-bg-raised)', padding: '1px 6px', borderRadius: 3, border: '1px solid var(--color-border)',
            }}>
              {caseData.priority} Priority
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: 'var(--color-text-muted)' }}>
              {fmtTimestamp(caseData.lastUpdated)}
            </span>

            <CaseActionsMenu
              caseData={caseData}
              onStatusChange={onStatusChange}
              onPriorityChange={onPriorityChange}
              onReassign={onReassign}
              onDeleteRequest={onDeleteRequest}
              onOpenCase={onOpen}
              alignRight={true}
            />
          </div>
        </div>

        <div>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: '"Fraunces", Georgia, serif' }}>
            {caseData.title}
          </span>
          {caseData.investigator && (
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginLeft: 10, fontFamily: 'Inter, sans-serif' }}>
              Investigator: {caseData.investigator}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--color-text-secondary)' }}>
          <span><span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#C4622D', fontWeight: 600 }}>{caseData.entityCount}</span> entities tracked</span>
          <span><span style={{ fontFamily: 'IBM Plex Mono, monospace', color: caseData.anomalyCount > 0 ? 'var(--color-status-flagged)' : 'var(--color-status-closed)', fontWeight: 600 }}>{caseData.anomalyCount}</span> anomalies detected</span>
        </div>
      </motion.div>
    );
  }

  const rowVerticalPadding = isHighAnomaly ? '12px' : '8px';

  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -1, boxShadow: 'var(--shadow-card)' }}
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
        padding: `${rowVerticalPadding} 20px`,
        borderBottom: '1px solid var(--color-border)',
        background: isSelected ? 'var(--color-bg-hover)' : (isHighlit ? 'var(--color-bg-hover)' : (isHighAnomaly ? 'var(--color-bg-surface)' : 'transparent')),
        borderLeft: `3.5px solid ${borderColor}`,
        transition: 'background 80ms, border-left-color 80ms, padding 120ms',
        cursor: 'pointer',
        outline: focused ? '2px solid #C4622D' : 'none',
        outlineOffset: -1,
      }}
    >
      {/* Checkbox */}
      <div style={COL.select}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(caseData.id);
          }}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: isSelected || hovered || hasAnySelection ? 1 : 0,
            transition: 'opacity 120ms ease',
          }}
        >
          {isSelected ? (
            <CheckSquare className="w-3.5 h-3.5 text-[#C4622D]" />
          ) : (
            <Square className="w-3.5 h-3.5 text-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]" />
          )}
        </button>
      </div>

      <div style={COL.id}>
        <span style={{
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.03em',
          color: isHighlit ? '#C4622D' : 'var(--color-text-secondary)',
          fontWeight: isHighAnomaly ? 600 : 400,
          transition: 'color 80ms',
        }}>
          {caseData.id}
        </span>
      </div>

      <div style={COL.title}>
        <span style={{
          fontSize: isHighAnomaly ? 13 : 12.5,
          fontWeight: isHighAnomaly ? 600 : 500,
          transition: 'color 80ms',
          color: isHighlit ? '#C4622D' : 'var(--color-text-primary)',
        }}>
          {caseData.title}
        </span>
        {caseData.investigator && (
          <span style={{ fontSize: 10.5, color: 'var(--color-text-secondary)', marginLeft: 8, fontFamily: 'Inter, sans-serif' }}>
            {caseData.investigator}
          </span>
        )}
      </div>

      <div style={COL.status}><StatusCell status={caseData.status} /></div>

      <div style={COL.entities}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--color-text-secondary)' }}>
          {String(caseData.entityCount).padStart(3, '\u2007')}
        </span>
      </div>

      <div style={COL.anomalies}>
        <span style={{
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 11,
          fontWeight: isHighAnomaly ? 600 : 400,
          color: caseData.anomalyCount >= 10 ? 'var(--color-status-flagged)' : (caseData.anomalyCount > 0 ? 'var(--color-status-warning)' : 'var(--color-status-closed)'),
        }}>
          {String(caseData.anomalyCount).padStart(3, '\u2007')}
        </span>
      </div>

      <div style={COL.updated} title={fmtAbsDate(caseData.lastUpdated)}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: 'var(--color-text-muted)' }}>
          {fmtTimestamp(caseData.lastUpdated)}
        </span>
      </div>

      {/* Actions: Kebab button + Open link visible on hover */}
      <div style={{ ...COL.action, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
        <div style={{ opacity: hovered || focused ? 1 : 0, transition: 'opacity 100ms ease' }}>
          <span 
            onClick={(e) => { e.stopPropagation(); onOpen(caseData); }}
            style={{ fontSize: 9.5, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, color: '#C4622D', fontFamily: 'Inter, sans-serif' }}
          >
            Open →
          </span>
        </div>

        <div style={{ opacity: hovered || focused ? 1 : 0.4, transition: 'opacity 100ms ease' }}>
          <CaseActionsMenu
            caseData={caseData}
            onStatusChange={onStatusChange}
            onPriorityChange={onPriorityChange}
            onReassign={onReassign}
            onDeleteRequest={onDeleteRequest}
            onOpenCase={onOpen}
            alignRight={true}
          />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div role="status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 14 }}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <rect x="1" y="1" width="34" height="34" rx="4" stroke="var(--color-border)" strokeWidth="1"/>
        <circle cx="18" cy="15" r="6" stroke="var(--color-border-strong)" strokeWidth="1.2"/>
        <line x1="23" y1="20" x2="30" y2="27" stroke="var(--color-border-strong)" strokeWidth="1.2" strokeLinecap="square"/>
        <line x1="10" y1="27" x2="26" y2="27" stroke="var(--color-border-strong)" strokeWidth="1" strokeDasharray="2 2"/>
      </svg>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: 11.5, textAlign: 'center', letterSpacing: '0.02em', fontFamily: 'Inter, sans-serif' }}>
        {hasFilters
          ? (<>No cases match the current filters.<br/><span style={{ color: 'var(--color-text-muted)', fontSize: 10.5 }}>Adjust or reset filters to see results.</span></>)
          : 'No cases found.'}
      </div>
    </div>
  );
}

export const CaseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cases, 
    filters, 
    setFilter, 
    resetFilters, 
    pushNavHistory, 
    updateCase, 
    updateBulkCases,
    deleteCase, 
    deleteBulkCases,
    restoreCase,
    restoreBulkCases,
  } = useTesseraStore();
  const { setCaseId } = useAnalyticsStore();
  const clock = useLiveClock(60_000);

  // Multi-selection state
  const [selectedCaseIds, setSelectedCaseIds] = useState<Set<string>>(new Set());

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<CaseItem | null>(null);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<CaseItem[]>([]);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const duration = toast.duration || 5000;
    const newToast: ToastMessage = { ...toast, id, duration };

    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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

  const allFilteredSelected = filteredCases.length > 0 && filteredCases.every(c => selectedCaseIds.has(c.id));
  const someFilteredSelected = filteredCases.some(c => selectedCaseIds.has(c.id)) && !allFilteredSelected;

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedCaseIds(new Set());
    } else {
      setSelectedCaseIds(new Set(filteredCases.map(c => c.id)));
    }
  };

  const handleToggleSelect = (caseId: string) => {
    setSelectedCaseIds(prev => {
      const next = new Set(prev);
      if (next.has(caseId)) {
        next.delete(caseId);
      } else {
        next.add(caseId);
      }
      return next;
    });
  };

  const handleOpenCase = (c: CaseItem) => {
    setCaseId(c.id);
    pushNavHistory({
      id: `case-${c.id}`,
      label: `Case: ${c.title}`,
      path: `/case/${c.id}`,
      depth: 1,
    });
    navigate(`/case/${c.id}`);
  };

  const handleNewCase = () => {
    pushNavHistory({
      id: 'new-case',
      label: 'New Investigation',
      path: '/new-case',
      depth: 1,
    });
    navigate('/new-case');
  };

  // Row-level Actions
  const handleStatusChange = (caseId: string, status: CaseItem['status']) => {
    const prevCase = cases.find(c => c.id === caseId);
    const prevStatus = prevCase?.status;
    updateCase(caseId, { status });

    addToast({
      title: 'Case Status Updated',
      description: `${caseId} marked as ${status.toUpperCase()}.`,
      type: 'success',
      onUndo: () => {
        if (prevStatus) updateCase(caseId, { status: prevStatus });
      },
      undoLabel: 'Undo',
    });
  };

  const handlePriorityChange = (caseId: string, priority: CaseItem['priority']) => {
    const prevCase = cases.find(c => c.id === caseId);
    const prevPriority = prevCase?.priority;
    updateCase(caseId, { priority });

    addToast({
      title: 'Priority Updated',
      description: `${caseId} priority set to ${priority.toUpperCase()}.`,
      type: 'info',
      onUndo: () => {
        if (prevPriority) updateCase(caseId, { priority: prevPriority });
      },
      undoLabel: 'Undo',
    });
  };

  const handleReassign = (caseId: string, investigator: string) => {
    const prevCase = cases.find(c => c.id === caseId);
    const prevInvestigator = prevCase?.investigator;
    updateCase(caseId, { investigator });

    addToast({
      title: 'Case Reassigned',
      description: `${caseId} assigned to ${investigator}.`,
      type: 'success',
      onUndo: () => {
        if (prevInvestigator) updateCase(caseId, { investigator: prevInvestigator });
      },
      undoLabel: 'Undo',
    });
  };

  const handleDeleteRequest = (caseData: CaseItem) => {
    setCaseToDelete(caseData);
    setBulkDeleteTarget([]);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (bulkDeleteTarget.length > 0) {
      // Bulk Delete
      const deletedItems = [...bulkDeleteTarget];
      const deletedIds = deletedItems.map(c => c.id);
      deleteBulkCases(deletedIds);
      setSelectedCaseIds(new Set());

      addToast({
        title: 'Cases Deleted',
        description: `${deletedItems.length} cases removed from workspace.`,
        type: 'warning',
        onUndo: () => {
          restoreBulkCases(deletedItems);
          addToast({ title: 'Cases Restored', description: `${deletedItems.length} cases restored.`, type: 'success' });
        },
        undoLabel: 'Undo',
        duration: 5500,
      });
    } else if (caseToDelete) {
      // Single Delete
      const target = { ...caseToDelete };
      const originalIdx = cases.findIndex(c => c.id === target.id);
      deleteCase(target.id);
      setSelectedCaseIds(prev => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });

      addToast({
        title: 'Case File Deleted',
        description: `${target.id} — ${target.title} removed.`,
        type: 'warning',
        onUndo: () => {
          restoreCase(target, originalIdx);
          addToast({ title: 'Case Restored', description: `${target.id} restored to workspace.`, type: 'success' });
        },
        undoLabel: 'Undo',
        duration: 5500,
      });
    }
  };

  // Bulk Actions
  const handleBulkStatusChange = (status: CaseItem['status']) => {
    const ids = Array.from(selectedCaseIds);
    updateBulkCases(ids, { status });
    addToast({
      title: 'Bulk Status Updated',
      description: `${ids.length} cases marked as ${status.toUpperCase()}.`,
      type: 'success',
    });
  };

  const handleBulkPriorityChange = (priority: CaseItem['priority']) => {
    const ids = Array.from(selectedCaseIds);
    updateBulkCases(ids, { priority });
    addToast({
      title: 'Bulk Priority Updated',
      description: `${ids.length} cases set to ${priority.toUpperCase()}.`,
      type: 'info',
    });
  };

  const handleBulkReassign = (investigator: string) => {
    const ids = Array.from(selectedCaseIds);
    updateBulkCases(ids, { investigator });
    addToast({
      title: 'Bulk Reassignment',
      description: `${ids.length} cases assigned to ${investigator}.`,
      type: 'success',
    });
  };

  const handleBulkDeleteRequest = () => {
    const targetCases = cases.filter(c => selectedCaseIds.has(c.id));
    setBulkDeleteTarget(targetCases);
    setCaseToDelete(null);
    setDeleteModalOpen(true);
  };

  return (
    <div
      className="grain-texture"
      style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)', position: 'relative' }}
    >
      {/* 1. Header */}
      <header style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, position: 'relative', zIndex: 1 }}>
        <div>
          <div className="data-label" style={{ marginBottom: 4 }}>Tessera / Dashboard</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.01em', fontFamily: '"Fraunces", Georgia, serif' }}>
            Case Overview
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-status-closed)', display: 'inline-block', boxShadow: 'none' }} />
            <span className="data-label">System Nominal</span>
          </div>
          <time
            dateTime={clock.toISOString()}
            style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: 'var(--color-text-secondary)' }}
          >
            {clock.toUTCString().replace('GMT', 'UTC').slice(0, -4)}
          </time>
        </div>
      </header>

      {/* 2. Rich Stats Strip */}
      <StatStrip cases={cases} />

      {/* 3. Priority Queue: 3 Compact Cards */}
      {!hasFilters && (
        <PriorityQueue 
          cases={cases} 
          onOpen={handleOpenCase}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onReassign={handleReassign}
          onDeleteRequest={handleDeleteRequest}
        />
      )}

      {/* 4. Filter Bar */}
      <FilterBar
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        onNewCase={handleNewCase}
      />

      {/* 5. Cases Table */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <TableHeader 
          allSelected={allFilteredSelected}
          someSelected={someFilteredSelected}
          onToggleSelectAll={handleToggleSelectAll}
        />

        <AnimatePresence mode="popLayout">
          {filteredCases.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            filteredCases.map((c, i) => (
              <CaseRow
                key={c.id}
                caseData={c}
                onOpen={handleOpenCase}
                index={i}
                featured={i === 0 && !hasFilters}
                isSelected={selectedCaseIds.has(c.id)}
                onToggleSelect={handleToggleSelect}
                hasAnySelection={selectedCaseIds.size > 0}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
                onReassign={handleReassign}
                onDeleteRequest={handleDeleteRequest}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* 6. Footer */}
      <div style={{ padding: '8px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1, background: 'var(--color-bg-surface)' }}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: 'var(--color-text-secondary)' }}>
          {filteredCases.length === cases.length
            ? `${cases.length} cases`
            : `${filteredCases.length} of ${cases.length} cases`
          }
        </span>
        <span className="data-label" title={clock.toUTCString()}>
          Updated {fmtTimestamp(clock.toISOString())}
        </span>
      </div>

      {/* 7. Floating Bulk Action Toolbar */}
      <AnimatePresence>
        {selectedCaseIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: EASE_SHARP }}
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 800,
              background: 'var(--color-bg-raised)',
              border: '1px solid var(--color-border)',
              borderTop: '2px solid #C4622D',
              borderRadius: 8,
              padding: '8px 16px',
              boxShadow: 'var(--shadow-dropdown)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              maxWidth: '90vw',
              flexWrap: 'wrap',
            }}
          >
            {/* Selection Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 10, borderRight: '1px solid var(--color-border)' }}>
              <span style={{
                background: '#C4622D', color: '#FFFFFF',
                fontSize: 10.5, fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600,
                padding: '2px 7px', borderRadius: 4,
              }}>
                {selectedCaseIds.size}
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif' }}>
                Selected
              </span>
            </div>

            {/* Bulk Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="data-label" style={{ fontSize: '0.6rem' }}>Status:</span>
              {(['active', 'flagged', 'closed'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleBulkStatusChange(st)}
                  className="btn-ghost"
                  style={{ padding: '3px 8px', fontSize: '9.5px', textTransform: 'capitalize' }}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Bulk Priority */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 6, borderLeft: '1px solid var(--color-border)' }}>
              <span className="data-label" style={{ fontSize: '0.6rem' }}>Priority:</span>
              {(['critical', 'high', 'medium'] as const).map(pr => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => handleBulkPriorityChange(pr)}
                  className="btn-ghost"
                  style={{ padding: '3px 8px', fontSize: '9.5px', textTransform: 'capitalize' }}
                >
                  {pr}
                </button>
              ))}
            </div>

            {/* Bulk Delete */}
            <div style={{ paddingLeft: 6, borderLeft: '1px solid var(--color-border)' }}>
              <button
                type="button"
                onClick={handleBulkDeleteRequest}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'var(--color-status-flagged-bg)', border: '1px solid var(--color-status-flagged-border)',
                  color: 'var(--color-status-flagged)', borderRadius: 4, padding: '4px 10px',
                  fontSize: 10.5, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <Trash2 className="w-3.5 h-3.5 text-[var(--color-status-flagged)]" />
                <span>Delete ({selectedCaseIds.size})</span>
              </button>
            </div>

            {/* Deselect */}
            <button
              type="button"
              onClick={() => setSelectedCaseIds(new Set())}
              style={{
                border: 'none', background: 'transparent',
                color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px',
                display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 11,
              }}
              title="Deselect all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. Delete Confirmation Modal */}
      <CaseDeleteModal
        isOpen={deleteModalOpen}
        targetCase={caseToDelete}
        bulkCases={bulkDeleteTarget}
        onClose={() => {
          setDeleteModalOpen(false);
          setCaseToDelete(null);
          setBulkDeleteTarget([]);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* 9. Floating Toasts with Undo Support */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
export default CaseDashboard;
