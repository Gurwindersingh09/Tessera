import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePhishieldStore } from '../store/usePhishieldStore';
import { CaseItem } from '../types/schema';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Filter, 
  X, 
  Calendar, 
  Layers, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

/* ─── Motion Easing ─── */
const EASE_SHARP: [number, number, number, number] = [0.4, 0, 0.2, 1];

const CATEGORY_COLORS = [
  '#C4622D',
  '#D4854A',
  '#E58A4E',
  '#8C3D1A',
  '#E05A47',
  '#4E9A5E',
];

/* ─── Category Inferrer ─── */
export function getCaseCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('fraud') || t.includes('financial') || t.includes('laundering') || t.includes('scheme') || t.includes('bank')) {
    return 'Financial Fraud';
  }
  if (t.includes('trafficking') || t.includes('drug') || t.includes('corridor') || t.includes('smuggling')) {
    return 'Illicit Trafficking';
  }
  if (t.includes('surveillance') || t.includes('vantage') || t.includes('telecom') || t.includes('cdr') || t.includes('phish')) {
    return 'Cyber Extortion & Phishing';
  }
  if (t.includes('nightfall') || t.includes('blackthorn') || t.includes('syndicate') || t.includes('nexus') || t.includes('operation')) {
    return 'Syndicate Operations';
  }
  if (t.includes('bridge') || t.includes('incident') || t.includes('property') || t.includes('infrastructure')) {
    return 'Critical Infrastructure';
  }
  return 'General Cybercrime';
}

/* ─── Sparkline Component ─── */
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
        <circle cx={lastPoint[0]} cy={lastPoint[1]} r="1.8" fill={color} />
      </svg>
      <span style={{ fontSize: 9, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-text-muted)' }}>
        {isUp ? '↑ 30d' : '↓ 30d'}
      </span>
    </div>
  );
}

/* ─── Animated Counter ─── */
function AnimatedStat({ target, suffix = '', isFloat = false, color, isHeavy }: {
  target: number;
  suffix?: string;
  isFloat?: boolean;
  color: string;
  isHeavy?: boolean;
}) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => 
    isFloat ? v.toFixed(1) : String(Math.round(v))
  );
  const [display, setDisplay] = useState(isFloat ? '0.0' : '0');

  useEffect(() => {
    const controls = animate(motionVal, target, { duration: 1.1, ease: EASE_SHARP });
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [target, isFloat]);

  return (
    <span style={{
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: isHeavy ? 24 : 20,
      fontWeight: isHeavy ? 600 : 500,
      letterSpacing: '-0.02em',
      lineHeight: 1,
      color,
    }}>
      {display}{suffix}
    </span>
  );
}

/* ─── Custom Tooltip for Charts ─── */
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--color-bg-raised)',
        border: '1px solid var(--color-border)',
        borderTop: '2px solid #C4622D',
        borderRadius: 6,
        padding: '8px 12px',
        boxShadow: 'var(--shadow-dropdown)',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: 4,
          fontSize: 12,
        }}>
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: entry.color || entry.fill }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>{entry.name}:</span>
            </div>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── Activity Heatmap Component ─── */
interface HeatmapDay {
  dateStr: string;
  month: string;
  dayOfWeek: number;
  count: number;
  caseCount: number;
  anomalyCount: number;
  level: number;
}

function ActivityHeatmap({ cases }: { cases: CaseItem[] }) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  const heatmapData = useMemo(() => {
    const today = new Date('2026-08-19T00:00:00Z');
    const days: HeatmapDay[] = [];
    const totalDays = 52 * 7;

    const activityMap: Record<string, { cases: number; anomalies: number }> = {};

    cases.forEach((c) => {
      const d = new Date(c.lastUpdated).toISOString().slice(0, 10);
      if (!activityMap[d]) activityMap[d] = { cases: 0, anomalies: 0 };
      activityMap[d].cases += 1;
      activityMap[d].anomalies += c.anomalyCount;
    });

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86_400_000);
      const dateStr = d.toISOString().slice(0, 10);
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const dayOfWeek = d.getUTCDay();

      const seeded = (Math.sin(d.getTime() * 0.00000005) + 1) * 2;
      const real = activityMap[dateStr];
      const caseCount = (real?.cases || 0) + (seeded > 3.2 ? 1 : 0);
      const anomalyCount = (real?.anomalies || 0) + Math.floor(seeded * 1.5);
      const count = caseCount * 2 + anomalyCount;

      let level = 0;
      if (count >= 12) level = 4;
      else if (count >= 7) level = 3;
      else if (count >= 4) level = 2;
      else if (count >= 1) level = 1;

      days.push({
        dateStr,
        month,
        dayOfWeek,
        count,
        caseCount,
        anomalyCount,
        level,
      });
    }

    const weeks: HeatmapDay[][] = [];
    for (let w = 0; w < 52; w++) {
      weeks.push(days.slice(w * 7, (w + 1) * 7));
    }

    return { weeks, days };
  }, [cases]);

  const levelColors = ['var(--color-bg-base)', 'rgba(196, 98, 45, 0.25)', 'rgba(196, 98, 45, 0.5)', 'rgba(212, 133, 74, 0.8)', '#C4622D'];

  const monthHeaders = useMemo(() => {
    const headers: { month: string; colIndex: number }[] = [];
    let lastMonth = '';
    heatmapData.weeks.forEach((week, wIdx) => {
      const firstDay = week[0];
      if (firstDay && firstDay.month !== lastMonth) {
        headers.push({ month: firstDay.month, colIndex: wIdx });
        lastMonth = firstDay.month;
      }
    });
    return headers;
  }, [heatmapData]);

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      boxShadow: 'var(--shadow-card)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div className="data-label" style={{ color: '#C4622D', fontWeight: 600 }}>12-Month Telemetry Record</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
            Investigation Activity Heatmap
          </h3>
        </div>

        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
          52 Weeks · Daily correlation events & anomalies
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ minWidth: 780, position: 'relative' }}>
          {/* Month labels */}
          <div style={{ display: 'flex', marginLeft: 28, marginBottom: 6, position: 'relative', height: 14 }}>
            {monthHeaders.map((m, idx) => (
              <span
                key={idx}
                style={{
                  position: 'absolute',
                  left: m.colIndex * 14.5,
                  fontSize: 9.5,
                  fontFamily: 'IBM Plex Mono, monospace',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {m.month}
              </span>
            ))}
          </div>

          {/* Grid Rows: 7 rows (Sun to Sat), 52 columns */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            {/* Day of week labels */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 7 * 13,
              fontSize: 9,
              fontFamily: 'IBM Plex Mono, monospace',
              color: 'var(--color-text-muted)',
              width: 22,
              paddingRight: 4,
            }}>
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Matrix of weeks */}
            <div style={{ display: 'flex', gap: 3.5 }}>
              {heatmapData.weeks.map((week, wIdx) => (
                <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                  {week.map((day, dIdx) => (
                    <div
                      key={`${wIdx}-${dIdx}`}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{
                        width: 10.5,
                        height: 10.5,
                        borderRadius: 2,
                        background: levelColors[day.level],
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        transition: 'transform 100ms ease, box-shadow 100ms ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.35)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                        e.currentTarget.style.zIndex = '10';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.zIndex = '1';
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 10, flexWrap: 'wrap', gap: 10 }}>
        {/* Dynamic Tooltip line */}
        <div style={{ minHeight: 18, fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
          {hoveredDay ? (
            <span style={{ color: 'var(--color-text-primary)' }}>
              <strong style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#C4622D' }}>
                {new Date(hoveredDay.dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </strong>
              {' — '}
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {hoveredDay.caseCount} case update{hoveredDay.caseCount !== 1 ? 's' : ''}, {hoveredDay.anomalyCount} anomal{hoveredDay.anomalyCount !== 1 ? 'ies' : 'y'} flagged
              </span>
            </span>
          ) : (
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 10.5 }}>Hover over any day cell to view incident metrics</span>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--color-text-secondary)', fontFamily: 'IBM Plex Mono, monospace' }}>
          <span>Less</span>
          {levelColors.map((col, idx) => (
            <span
              key={idx}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: col,
                border: '1px solid var(--color-border)',
                display: 'inline-block',
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main AnalyticsPage Component ─── */
export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { cases, pushNavHistory } = usePhishieldStore();

  // Filter States
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    pushNavHistory({ id: 'analytics', label: 'Analytics', path: '/analytics', depth: 1 });
  }, []);

  // Filtered dataset for charts
  const filteredCases = useMemo(() => {
    const now = new Date('2026-08-19T00:00:00Z');
    return cases.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (priorityFilter && c.priority !== priorityFilter) return false;
      if (categoryFilter && getCaseCategory(c.title) !== categoryFilter) return false;

      if (dateRange !== 'all') {
        const days = parseInt(dateRange);
        if (new Date(c.lastUpdated) < new Date(now.getTime() - days * 86_400_000)) return false;
      }
      return true;
    });
  }, [cases, dateRange, statusFilter, priorityFilter, categoryFilter]);

  // Derived Top Metrics
  const totalCases = cases.length;
  const activeCases = cases.filter(c => c.status === 'active').length;
  const flaggedCases = cases.filter(c => c.status === 'flagged').length;
  const closedCases = cases.filter(c => c.status === 'closed').length;
  const totalAnomalies = cases.reduce((acc, c) => acc + c.anomalyCount, 0);
  const totalEntities = cases.reduce((acc, c) => acc + c.entityCount, 0);
  const closureRate = totalCases > 0 ? (closedCases / totalCases) * 100 : 0;
  const avgResolutionDays = 4.2;

  // 1. Case Volume Over Time Trend Data (Weekly buckets)
  const volumeTrendData = useMemo(() => {
    return [
      { week: 'Week 1', opened: 4, closed: 2, anomalies: 8 },
      { week: 'Week 2', opened: 6, closed: 3, anomalies: 14 },
      { week: 'Week 3', opened: 5, closed: 4, anomalies: 11 },
      { week: 'Week 4', opened: 9, closed: 5, anomalies: 19 },
      { week: 'Week 5', opened: 7, closed: 6, anomalies: 16 },
      { week: 'Week 6', opened: 11, closed: 7, anomalies: 24 },
      { week: 'Week 7', opened: 8, closed: 8, anomalies: 18 },
      { week: 'Week 8', opened: Math.max(3, filteredCases.length), closed: Math.max(2, closedCases), anomalies: totalAnomalies },
    ];
  }, [filteredCases, closedCases, totalAnomalies]);

  // 2. Case Status Breakdown (Donut)
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { active: 0, flagged: 0, closed: 0, archived: 0 };
    cases.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return [
      { name: 'Active', key: 'active', value: counts.active, color: 'var(--color-status-active)' },
      { name: 'Flagged', key: 'flagged', value: counts.flagged, color: 'var(--color-status-flagged)' },
      { name: 'Closed', key: 'closed', value: counts.closed, color: 'var(--color-status-closed)' },
      { name: 'Archived', key: 'archived', value: counts.archived || 0, color: 'var(--color-status-muted)' },
    ].filter(s => s.value > 0);
  }, [cases]);

  // 3. Priority Distribution Data (Horizontal Bar)
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    filteredCases.forEach((c) => {
      counts[c.priority] = (counts[c.priority] || 0) + 1;
    });
    return [
      { priority: 'Critical', key: 'critical', count: counts.critical, color: 'var(--color-status-flagged)' },
      { priority: 'High', key: 'high', count: counts.high, color: 'var(--color-status-active)' },
      { priority: 'Medium', key: 'medium', count: counts.medium, color: 'var(--color-status-warning)' },
      { priority: 'Low', key: 'low', count: counts.low, color: 'var(--color-border-strong)' },
    ];
  }, [filteredCases]);

  // 4. Case Type Breakdown Data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredCases.forEach((c) => {
      const cat = getCaseCategory(c.title);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    })).sort((a, b) => b.value - a.value);
  }, [filteredCases]);

  // 5. Investigator Workload Data
  const investigatorData = useMemo(() => {
    const map: Record<string, { name: string; cases: number; anomalies: number }> = {};
    cases.forEach((c) => {
      const inv = c.investigator || 'Unassigned';
      if (!map[inv]) map[inv] = { name: inv, cases: 0, anomalies: 0 };
      map[inv].cases += 1;
      map[inv].anomalies += c.anomalyCount;
    });
    return Object.values(map)
      .map(inv => ({
        ...inv,
        initials: inv.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        avgAnomalies: (inv.anomalies / inv.cases).toFixed(1),
      }))
      .sort((a, b) => b.cases - a.cases);
  }, [cases]);

  // 6. Anomaly Severity Breakdown Stream Data
  const anomalySeverityData = useMemo(() => {
    return [
      { period: 'Jul W1', critical: 3, high: 6, medium: 9, low: 5 },
      { period: 'Jul W2', critical: 5, high: 8, medium: 12, low: 7 },
      { period: 'Jul W3', critical: 4, high: 7, medium: 10, low: 6 },
      { period: 'Jul W4', critical: 8, high: 11, medium: 15, low: 9 },
      { period: 'Aug W1', critical: 6, high: 9, medium: 13, low: 8 },
      { period: 'Aug W2', critical: 9, high: 14, medium: 18, low: 11 },
      { period: 'Aug W3', critical: flaggedCases * 2, high: activeCases * 3, medium: totalAnomalies - (flaggedCases * 2), low: 10 },
    ];
  }, [flaggedCases, activeCases, totalAnomalies]);

  const hasActiveFilters = dateRange !== 'all' || statusFilter !== null || priorityFilter !== null || categoryFilter !== null;

  const clearAllFilters = () => {
    setDateRange('all');
    setStatusFilter(null);
    setPriorityFilter(null);
    setCategoryFilter(null);
  };

  return (
    <div
      className="grain-texture"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
        background: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
        position: 'relative',
      }}
    >
      {/* ─── 1. Header ─── */}
      <header style={{
        padding: '18px 24px 14px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        background: 'var(--color-bg-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <div>
          <div className="data-label" style={{ marginBottom: 4 }}>Phishield / Analytics</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.01em', fontFamily: '"Fraunces", Georgia, serif' }}>
            Analytics & Telemetry
          </h1>
        </div>

        {/* Date Filter & System Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Date Range Selector Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--color-bg-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            padding: '2px 4px',
            gap: 2,
          }}>
            {(['7d', '30d', '90d', 'all'] as const).map((r) => {
              const active = dateRange === r;
              const labels: Record<string, string> = {
                '7d': '7 Days',
                '30d': '30 Days',
                '90d': '90 Days',
                'all': 'All Time',
              };
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDateRange(r)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 10.5,
                    fontWeight: active ? 600 : 500,
                    fontFamily: 'Inter, sans-serif',
                    color: active ? '#C4622D' : 'var(--color-text-secondary)',
                    background: active ? 'var(--color-bg-hover)' : 'transparent',
                    border: active ? '1px solid #C4622D' : '1px solid transparent',
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderLeft: '1px solid var(--color-border)', paddingLeft: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-status-closed)', display: 'inline-block' }} />
            <span className="data-label">Telemetry Live</span>
          </div>
        </div>
      </header>

      {/* ─── 2. Top Stats Strip ─── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', background: 'var(--color-bg-surface)' }}>
        {[
          { label: 'Total Cases', value: totalCases, color: '#C4622D', trend: [10, 11, 12, 13, 14, 15, totalCases], isUp: true, isHeavy: false },
          { label: 'Active Pipeline', value: activeCases, color: '#C4622D', trend: [6, 7, 8, 8, 9, 9, activeCases], isUp: true, isHeavy: true, dot: 'var(--color-status-active)' },
          { label: 'Avg Resolution', value: avgResolutionDays, suffix: 'd', isFloat: true, color: '#8C3D1A', trend: [5.1, 4.9, 4.7, 4.5, 4.3, 4.2], isUp: false, isHeavy: false },
          { label: 'Total Anomalies', value: totalAnomalies, color: 'var(--color-status-flagged)', trend: [24, 28, 31, 35, 40, totalAnomalies], isUp: true, isHeavy: true, dot: 'var(--color-status-flagged)', pulse: true },
          { label: 'Entities Tracked', value: totalEntities, color: '#D4854A', trend: [120, 140, 160, 190, 210, totalEntities], isUp: true, isHeavy: false },
          { label: 'Closure Rate', value: closureRate, suffix: '%', isFloat: true, color: 'var(--color-status-closed)', trend: [58, 60, 62, 64, 66, closureRate], isUp: true, isHeavy: false },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '11px 18px',
            borderRight: i < 5 ? '1px solid var(--color-border)' : 'none',
            display: 'flex', flexDirection: 'column', gap: 4, minWidth: 130, flex: '1 1 130px',
            background: s.isHeavy ? 'var(--color-bg-base)' : 'transparent',
            borderTop: s.isHeavy ? `2px solid ${s.color}` : '2px solid transparent',
          }}>
            <div className="data-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {s.dot && (
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', background: s.dot,
                  animation: s.pulse ? 'status-pulse 2.5s ease-in-out infinite' : 'none',
                }} />
              )}
              <span style={{ fontWeight: s.isHeavy ? 600 : 500, color: s.isHeavy ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                {s.label}
              </span>
            </div>

            <AnimatedStat target={s.value} suffix={s.suffix} isFloat={s.isFloat} color={s.color} isHeavy={s.isHeavy} />
            <MiniSparkline data={s.trend} color={s.color} isUp={s.isUp} />
          </div>
        ))}
      </div>

      {/* ─── 3. Active Filters Pill Row ─── */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: EASE_SHARP }}
            style={{
              padding: '8px 24px',
              background: 'var(--color-bg-surface)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#C4622D', fontSize: 11, fontWeight: 600 }}>
                <Filter className="w-3.5 h-3.5 text-[#C4622D]" />
                <span>Active Filters:</span>
              </div>

              {dateRange !== 'all' && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)',
                  borderRadius: 4, padding: '2px 8px', fontSize: 10.5, color: 'var(--color-text-primary)',
                }}>
                  <span>Date: {dateRange.toUpperCase()}</span>
                  <button type="button" onClick={() => setDateRange('all')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                    <X className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-status-flagged)]" />
                  </button>
                </span>
              )}

              {statusFilter && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)',
                  borderRadius: 4, padding: '2px 8px', fontSize: 10.5, color: 'var(--color-text-primary)',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusFilter === 'active' ? 'var(--color-status-active)' : statusFilter === 'flagged' ? 'var(--color-status-flagged)' : 'var(--color-status-closed)' }} />
                  <span>Status: {statusFilter}</span>
                  <button type="button" onClick={() => setStatusFilter(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                    <X className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-status-flagged)]" />
                  </button>
                </span>
              )}

              {priorityFilter && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)',
                  borderRadius: 4, padding: '2px 8px', fontSize: 10.5, color: 'var(--color-text-primary)',
                }}>
                  <span>Priority: {priorityFilter}</span>
                  <button type="button" onClick={() => setPriorityFilter(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                    <X className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-status-flagged)]" />
                  </button>
                </span>
              )}

              {categoryFilter && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)',
                  borderRadius: 4, padding: '2px 8px', fontSize: 10.5, color: 'var(--color-text-primary)',
                }}>
                  <span>Type: {categoryFilter}</span>
                  <button type="button" onClick={() => setCategoryFilter(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                    <X className="w-3 h-3 text-[var(--color-text-muted)] hover:text-[var(--color-status-flagged)]" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={clearAllFilters}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'transparent', border: 'none',
                color: '#C4622D', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 4. Main Charts Section ─── */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Row 1: Volume Over Time (2/3) + Case Status Donut (1/3) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          
          {/* Chart 1: Volume Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_SHARP }}
            style={{
              gridColumn: 'span 2',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="data-label" style={{ color: '#C4622D', fontWeight: 600 }}>Case Velocity & Telemetry</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
                  Case Ingestion vs. Resolution Rate
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 2, background: '#C4622D', borderRadius: 1 }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>Opened</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 2, background: 'var(--color-status-closed)', borderRadius: 1 }} />
                  <span style={{ color: 'var(--color-text-secondary)' }}>Closed</span>
                </div>
              </div>
            </div>

            <div style={{ height: 240, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="terracottaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C4622D" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#C4622D" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3D7A4A" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3D7A4A" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} fontFamily="IBM Plex Mono, monospace" />
                  <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} fontFamily="IBM Plex Mono, monospace" />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="opened"
                    name="Opened Cases"
                    stroke="#C4622D"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#terracottaGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="closed"
                    name="Closed Cases"
                    stroke="#4E9A5E"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#greenGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 2: Case Status Donut (Interactive Filter) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35, ease: EASE_SHARP }}
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div>
              <div className="data-label" style={{ color: '#C4622D', fontWeight: 600 }}>Status Distribution</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
                Case Pipeline Breakdown
              </h3>
            </div>

            {/* Donut Chart with Center Total */}
            <div style={{ height: 180, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomChartTooltip />} />
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={75}
                    paddingAngle={3}
                    cursor="pointer"
                    onClick={(data: any) => {
                      const k = data?.key || data?.payload?.key;
                      if (k) {
                        setStatusFilter(prev => prev === k ? null : k);
                      }
                    }}
                  >
                    {statusData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke={statusFilter === entry.key ? '#C4622D' : 'var(--color-bg-surface)'} 
                        strokeWidth={statusFilter === entry.key ? 2 : 1}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Total Callout */}
              <div style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                  {totalCases}
                </span>
                <span style={{ fontSize: 9, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                  Total Cases
                </span>
              </div>
            </div>

            {/* Legend & Click Hint */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {statusData.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setStatusFilter(prev => prev === s.key ? null : s.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: statusFilter === s.key ? 'var(--color-bg-hover)' : 'transparent',
                      border: statusFilter === s.key ? '1px solid #C4622D' : '1px solid transparent',
                      borderRadius: 4, padding: '3px 6px', cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'Inter, sans-serif' }}>
                      {s.name} ({s.value})
                    </span>
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                Click a slice to filter dashboard
              </span>
            </div>
          </motion.div>
        </div>

        {/* Row 2: Priority Distribution Bar (1/2) + Case Category Breakdown (1/2) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          
          {/* Chart 3: Priority Distribution Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.35, ease: EASE_SHARP }}
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div>
              <div className="data-label" style={{ color: '#C4622D', fontWeight: 600 }}>Triage Severity</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
                Cases by Priority Level
              </h3>
            </div>

            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} fontFamily="IBM Plex Mono, monospace" />
                  <YAxis type="category" dataKey="priority" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} fontFamily="Inter, sans-serif" />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Cases"
                    radius={[0, 4, 4, 0]}
                    cursor="pointer"
                    onClick={(data: any) => {
                      const k = data?.key || data?.payload?.key;
                      if (k) setPriorityFilter(prev => prev === k ? null : k);
                    }}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={entry.color}
                        stroke={priorityFilter === entry.key ? '#C4622D' : 'transparent'}
                        strokeWidth={2}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 4: Case Category / Type Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.35, ease: EASE_SHARP }}
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div>
              <div className="data-label" style={{ color: '#C4622D', fontWeight: 600 }}>Classification</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
                Threat Vector Distribution
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 200 }}>
              {categoryData.map((cat) => {
                const pct = totalCases > 0 ? ((cat.value / totalCases) * 100).toFixed(0) : 0;
                const isSelected = categoryFilter === cat.name;
                return (
                  <div
                    key={cat.name}
                    onClick={() => setCategoryFilter(prev => prev === cat.name ? null : cat.name)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      background: isSelected ? 'var(--color-bg-hover)' : 'transparent',
                      border: isSelected ? '1px solid #C4622D' : '1px solid transparent',
                      transition: 'all 120ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11.5, fontWeight: isSelected ? 600 : 500, color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif' }}>
                        {cat.name}
                      </span>
                      <span style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-text-secondary)' }}>
                        {cat.value} ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: 4, width: '100%', background: 'var(--color-bg-base)', borderRadius: 2, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: cat.color,
                          borderRadius: 2,
                          transition: 'width 600ms ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Row 3: Stacked Anomaly Severity Trend (2/3) + Investigator Workload (1/3) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          
          {/* Chart 5: Stacked Anomaly Severity Trend */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35, ease: EASE_SHARP }}
            style={{
              gridColumn: 'span 2',
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div className="data-label" style={{ color: '#C4622D', fontWeight: 600 }}>Severity Spikes</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
                  Anomaly Detection Severity Stream
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10.5, fontFamily: 'IBM Plex Mono, monospace' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-status-flagged)' }} /> Critical
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-status-active)' }} /> High
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-status-warning)' }} /> Medium
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-status-muted)' }} /> Low
                </span>
              </div>
            </div>

            <div style={{ height: 210, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={anomalySeverityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="period" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} fontFamily="IBM Plex Mono, monospace" />
                  <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} fontFamily="IBM Plex Mono, monospace" />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="var(--color-status-flagged)" fill="var(--color-status-flagged)" fillOpacity={0.85} name="Critical" />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="var(--color-status-active)" fill="var(--color-status-active)" fillOpacity={0.75} name="High" />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="var(--color-status-warning)" fill="var(--color-status-warning)" fillOpacity={0.65} name="Medium" />
                  <Area type="monotone" dataKey="low" stackId="1" stroke="var(--color-status-muted)" fill="var(--color-status-muted)" fillOpacity={0.4} name="Low" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 6: Investigator Workload & Case Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.35, ease: EASE_SHARP }}
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div>
              <div className="data-label" style={{ color: '#C4622D', fontWeight: 600 }}>Personnel Allocation</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
                Investigator Workload
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 210 }}>
              {investigatorData.map((inv) => (
                <div
                  key={inv.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 6,
                    background: 'var(--color-bg-raised)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9.5, fontWeight: 600, color: '#C4622D',
                    }}>
                      {inv.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif' }}>
                        {inv.name}
                      </div>
                      <div style={{ fontSize: 9.5, color: 'var(--color-text-secondary)' }}>
                        {inv.avgAnomalies} avg. anomalies/case
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 600, color: '#C4622D' }}>
                      {inv.cases}
                    </span>
                    <span style={{ fontSize: 9.5, color: 'var(--color-text-secondary)' }}>cases</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Row 4: 12-Month Case Activity Heatmap (Full Width) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.35, ease: EASE_SHARP }}
        >
          <ActivityHeatmap cases={cases} />
        </motion.div>

      </div>
    </div>
  );
};
export default AnalyticsPage;
