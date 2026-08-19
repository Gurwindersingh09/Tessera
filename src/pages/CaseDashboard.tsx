import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhishieldStore } from '../store/usePhishieldStore';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { CaseItem } from '../types/schema';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
      <span style={{ fontSize: 9, fontFamily: 'IBM Plex Mono, monospace', color: '#7A6F63' }}>
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
      color: '#8C3D1A',
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
      isHeavy: true, // Visually heavier
      dotColor: '#C4622D',
    },
    {
      label: 'Flagged',
      value: flagged,
      color: '#B53924',
      trend: [2, 3, 2, 4, 3, 5, flagged],
      isUp: true,
      isHeavy: true, // Visually heavier
      dotColor: '#B53924',
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
      color: '#6B2E12',
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
    <div style={{ display: 'flex', borderBottom: '1px solid #DDD5CA', flexWrap: 'wrap', background: '#F3EDE4' }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{
          padding: '11px 18px',
          borderRight: i < stats.length - 1 ? '1px solid #DDD5CA' : 'none',
          display: 'flex', flexDirection: 'column', gap: 4, minWidth: 125, flex: '1 1 125px',
          background: s.isHeavy ? '#FAF6F0' : 'transparent',
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
              <span style={{ fontWeight: s.isHeavy ? 600 : 500, color: s.isHeavy ? '#2A2420' : '#7A6F63' }}>
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

/* ─── Priority Queue: 3 Compact Cards for Highest-Anomaly Active Cases with Compress/Expand ─── */
function PriorityQueue({ cases, onOpen }: { cases: CaseItem[]; onOpen: (c: CaseItem) => void }) {
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
      borderBottom: '1px solid #DDD5CA',
      background: '#FAF6F0',
      transition: 'all 200ms ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: collapsed ? 0 : 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#B53924', display: 'inline-block',
            animation: 'status-pulse 2.5s ease-in-out infinite'
          }} />
          <span className="data-label" style={{ color: '#8C3D1A', fontWeight: 600, letterSpacing: '0.1em' }}>
            Priority Queue · Highest Risk Active Cases
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontFamily: 'IBM Plex Mono, monospace', color: '#7A6F63' }}>
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
              border: '1px solid #DDD5CA',
              borderRadius: 3,
              background: '#FFFFFF',
              padding: '2px 6px',
              fontSize: 9.5,
              color: '#7A6F63',
              cursor: 'pointer',
            }}
          >
            {collapsed ? <ChevronDown className="w-3 h-3 text-[#C4622D]" /> : <ChevronUp className="w-3 h-3 text-[#7A6F63]" />}
            <span>{collapsed ? 'Expand' : 'Compress'}</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {priorityCases.map((c, i) => {
            const initials = c.investigator
              ? c.investigator.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              : 'RO';
            const isCritical = c.priority === 'critical';
            const borderColor = isCritical ? '#B53924' : '#C4622D';

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: EASE_SHARP }}
                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(42,36,32,0.08)' }}
                onClick={() => onOpen(c)}
                tabIndex={0}
                role="button"
                aria-label={`Open high-priority case ${c.id}: ${c.title}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(c); } }}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #DDD5CA',
                  borderLeft: `3px solid ${borderColor}`,
                  borderRadius: 8,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(42,36,32,0.04)',
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
                      color: '#8C3D1A',
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
                      background: isCritical ? '#B5392415' : '#C4622D15',
                      color: isCritical ? '#B53924' : '#C4622D',
                      border: `1px solid ${isCritical ? '#B5392440' : '#C4622D40'}`,
                    }}>
                      {c.priority}
                    </span>
                  </div>
                  <div
                    title={`Assigned: ${c.investigator}`}
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#F3EDE4', border: '1px solid #DDD5CA',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 600, color: '#7A6F63',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {initials}
                  </div>
                </div>

                <div style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: '#2A2420',
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
                      color: '#B53924',
                      lineHeight: 1,
                    }}>
                      {String(c.anomalyCount).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 9.5, color: '#7A6F63', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      anomalies
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: '#7A6F63', fontFamily: 'Inter, sans-serif' }}>
                    {c.entityCount} entities · {c.status}
                  </span>
                </div>

                <div style={{
                  fontSize: 10,
                  color: '#8C3D1A',
                  background: '#FAF6F0',
                  padding: '4px 7px',
                  borderRadius: 4,
                  border: '1px solid #DDD5CA80',
                  lineHeight: 1.3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#B53924', flexShrink: 0 }} />
                  <span>
                    {c.anomalyCount >= 10
                      ? `${c.anomalyCount} anomalies · Rapid transaction volume · Unreviewed 2d`
                      : `${c.anomalyCount} anomalies · Pattern deviation flagged by system`}
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

/* ─── Row animation variants ─── */
const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: EASE_SHARP },
  }),
};

function CaseRow({ caseData, onOpen, index, featured }: { caseData: CaseItem; onOpen: (c: CaseItem) => void; index: number; featured?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  // Consistent status-driven & priority-driven left border on every row
  const getBorderColor = () => {
    if (caseData.status === 'flagged' || caseData.priority === 'critical') return '#B53924';
    if (caseData.status === 'active' || caseData.priority === 'high') return '#C4622D';
    if (caseData.priority === 'medium') return '#D4854A';
    if (caseData.status === 'closed') return '#3D7A4A';
    return '#DDD5CA';
  };

  const borderColor = getBorderColor();
  const isHighlit = hovered || focused;
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
        whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(42,36,32,0.08)' }}
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
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.03em', color: '#C4622D', fontWeight: 600 }}>
              {caseData.id}
            </span>
            <StatusCell status={caseData.status} />
            <span style={{
              fontSize: 9.5, textTransform: 'uppercase', fontFamily: 'IBM Plex Mono, monospace',
              color: '#8C3D1A', background: '#F3EDE4', padding: '1px 6px', borderRadius: 3, border: '1px solid #DDD5CA',
            }}>
              {caseData.priority} Priority
            </span>
          </div>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#7A6F63' }}>
            {fmtTimestamp(caseData.lastUpdated)}
          </span>
        </div>
        <div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#2A2420', fontFamily: '"Fraunces", Georgia, serif' }}>
            {caseData.title}
          </span>
          {caseData.investigator && (
            <span style={{ fontSize: 11, color: '#7A6F63', marginLeft: 10, fontFamily: 'Inter, sans-serif' }}>
              Investigator: {caseData.investigator}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#7A6F63' }}>
          <span><span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#8C3D1A', fontWeight: 600 }}>{caseData.entityCount}</span> entities tracked</span>
          <span><span style={{ fontFamily: 'IBM Plex Mono, monospace', color: caseData.anomalyCount > 0 ? '#B53924' : '#3D7A4A', fontWeight: 600 }}>{caseData.anomalyCount}</span> anomalies detected</span>
        </div>
      </motion.div>
    );
  }

  // Row height varies slightly by anomaly severity: 10+ anomalies get more vertical padding and bolder weight
  const rowVerticalPadding = isHighAnomaly ? '13px' : '8.5px';

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
        padding: `${rowVerticalPadding} 20px`,
        borderBottom: '1px solid #DDD5CA',
        background: isHighlit ? '#EDE5D8' : (isHighAnomaly ? '#FFFDFB' : 'transparent'),
        borderLeft: `3px solid ${borderColor}`,
        transition: 'background 80ms, border-left-color 80ms, padding 150ms',
        cursor: 'pointer',
        outline: focused ? '2px solid #C4622D' : 'none',
        outlineOffset: -1,
      }}
    >
      <div style={COL.id}>
        <span style={{
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 11,
          letterSpacing: '0.03em',
          color: isHighlit ? '#C4622D' : '#7A6F63',
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
          color: isHighlit ? '#2A2420' : (isHighAnomaly ? '#2A2420' : '#4A4340'),
        }}>
          {caseData.title}
        </span>
        {caseData.investigator && (
          <span style={{ fontSize: 10.5, color: '#7A6F63', marginLeft: 8, fontFamily: 'Inter, sans-serif' }}>
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
        <span style={{
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: 11,
          fontWeight: isHighAnomaly ? 600 : 400,
          color: caseData.anomalyCount >= 10 ? '#B53924' : (caseData.anomalyCount > 0 ? '#D4854A' : '#3D7A4A'),
        }}>
          {String(caseData.anomalyCount).padStart(3, '\u2007')}
        </span>
      </div>

      <div style={COL.updated} title={fmtAbsDate(caseData.lastUpdated)}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#7A6F63' }}>
          {fmtTimestamp(caseData.lastUpdated)}
        </span>
      </div>

      <div style={COL.action}>
        <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, transition: 'color 80ms', color: isHighlit ? '#C4622D' : '#A89F93', fontFamily: 'Inter, sans-serif' }}>
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
      <div style={{ color: '#7A6F63', fontSize: 11.5, textAlign: 'center', letterSpacing: '0.02em', fontFamily: 'Inter, sans-serif' }}>
        {hasFilters
          ? (<>No cases match the current filters.<br/><span style={{ color: '#A89F93', fontSize: 10.5 }}>Adjust or reset filters to see results.</span></>)
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
            style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#7A6F63' }}
          >
            {clock.toUTCString().replace('GMT', 'UTC').slice(0, -4)}
          </time>
        </div>
      </header>

      {/* 1. Rich Stats Strip with Sparklines & Visual Weights */}
      <StatStrip cases={cases} />

      {/* 2. Priority Queue: 3 Compact Cards for Top Risk Cases */}
      {!hasFilters && (
        <PriorityQueue cases={cases} onOpen={handleOpenCase} />
      )}

      {/* 3. Filter Bar */}
      <FilterBar
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        onNewCase={handleNewCase}
      />

      {/* 4. Cases Table with Featured Hero Card & Varied Row Padding */}
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

      {/* 5. Footer */}
      <div style={{ padding: '8px 20px', borderTop: '1px solid #DDD5CA', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1, background: '#FAF6F0' }}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, color: '#7A6F63' }}>
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
