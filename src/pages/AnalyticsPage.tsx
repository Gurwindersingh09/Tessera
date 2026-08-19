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

/* ─── Tonal Terracotta Scale & Status Tokens ─── */
const COLOR_TONES = {
  rustDeep:    '#6B2E12',
  rust:        '#8C3D1A',
  terracotta:  '#C4622D',
  terracotta4: '#D4854A',
  peach:       '#E8B896',
  peachLight:  '#F2D9C4',
  cream:       '#FAF6F0',
  creamWarm:   '#F3EDE4',
  border:      '#DDD5CA',
  ink:         '#2A2420',
  muted:       '#7A6F63',
  green:       '#3D7A4A',
  critical:    '#B53924',
};

const STATUS_COLORS: Record<string, string> = {
  active:   COLOR_TONES.terracotta,
  flagged:  COLOR_TONES.critical,
  closed:   COLOR_TONES.green,
  archived: COLOR_TONES.muted,
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: COLOR_TONES.critical,
  high:     COLOR_TONES.terracotta,
  medium:   COLOR_TONES.terracotta4,
  low:      COLOR_TONES.muted,
};

const CATEGORY_COLORS = [
  '#8C3D1A',
  '#C4622D',
  '#D4854A',
  '#6B2E12',
  '#B53924',
  '#7A6F63',
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
      <span style={{ fontSize: 9, fontFamily: 'IBM Plex Mono, monospace', color: '#7A6F63' }}>
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
        background: '#FFFFFF',
        border: '1px solid #DDD5CA',
        borderTop: '2px solid #C4622D',
        borderRadius: 6,
        padding: '8px 12px',
        boxShadow: '0 6px 20px rgba(42, 36, 32, 0.12)',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 600,
          color: '#2A2420',
          marginBottom: 4,
          fontSize: 12,
        }}>
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: entry.color || entry.fill }} />
              <span style={{ color: '#7A6F63' }}>{entry.name}:</span>
            </div>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, color: '#2A2420' }}>
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
  dayOfWeek: number; // 0 Sun - 6 Sat
  count: number;
  caseCount: number;
  anomalyCount: number;
  level: number; // 0 to 4
}

function ActivityHeatmap({ cases }: { cases: CaseItem[] }) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  // Generate 52 weeks of dates leading up to today (Aug 2026 simulation)
  const heatmapData = useMemo(() => {
    const today = new Date('2026-08-19T00:00:00Z');
    const days: HeatmapDay[] = [];
    const totalDays = 52 * 7;

    // Create a map of active dates from cases
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

      // Combine real case activity + pseudo deterministic telemetry traffic
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

    // Group into 52 weeks
    const weeks: HeatmapDay[][] = [];
    for (let w = 0; w < 52; w++) {
      weeks.push(days.slice(w * 7, (w + 1) * 7));
    }

    return { weeks, days };
  }, [cases]);

  const levelColors = ['#F3EDE4', '#F2D9C4', '#E8B896', '#D4854A', '#8C3D1A'];

  // Identify where month labels should appear
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
      background: '#FFFFFF',
      border: '1px solid #DDD5CA',
      borderRadius: 8,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      boxShadow: '0 1px 3px rgba(42, 36, 32, 0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div className="data-label" style={{ color: '#8C3D1A', fontWeight: 600 }}>12-Month Telemetry Record</div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2A2420', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
            Investigation Activity Heatmap
          </h3>
        </div>

        <div style={{ fontSize: 11, color: '#7A6F63', fontFamily: 'IBM Plex Mono, monospace' }}>
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
                  color: '#7A6F63',
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
              color: '#A89F93',
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
                        border: '1px solid #DDD5CA50',
                        cursor: 'pointer',
                        transition: 'transform 100ms ease, box-shadow 100ms ease',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.35)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(42,36,32,0.2)';
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #DDD5CA60', paddingTop: 10, flexWrap: 'wrap', gap: 10 }}>
        {/* Dynamic Tooltip line */}
        <div style={{ minHeight: 18, fontSize: 11, fontFamily: 'Inter, sans-serif' }}>
          {hoveredDay ? (
            <span style={{ color: '#2A2420' }}>
              <strong style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#8C3D1A' }}>
                {new Date(hoveredDay.dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </strong>
              {' — '}
              <span style={{ color: '#4A4340' }}>
                {hoveredDay.caseCount} case update{hoveredDay.caseCount !== 1 ? 's' : ''}, {hoveredDay.anomalyCount} anomal{hoveredDay.anomalyCount !== 1 ? 'ies' : 'y'} flagged
              </span>
            </span>
          ) : (
            <span style={{ color: '#7A6F63', fontSize: 10.5 }}>Hover over any day cell to view incident metrics</span>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#7A6F63', fontFamily: 'IBM Plex Mono, monospace' }}>
          <span>Less</span>
          {levelColors.map((col, idx) => (
            <span
              key={idx}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: col,
                border: '1px solid #DDD5CA80',
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
    const points = [
      { week: 'Week 1', opened: 4, closed: 2, anomalies: 8 },
      { week: 'Week 2', opened: 6, closed: 3, anomalies: 14 },
      { week: 'Week 3', opened: 5, closed: 4, anomalies: 11 },
      { week: 'Week 4', opened: 9, closed: 5, anomalies: 19 },
      { week: 'Week 5', opened: 7, closed: 6, anomalies: 16 },
      { week: 'Week 6', opened: 11, closed: 7, anomalies: 24 },
      { week: 'Week 7', opened: 8, closed: 8, anomalies: 18 },
      { week: 'Week 8', opened: Math.max(3, filteredCases.length), closed: Math.max(2, closedCases), anomalies: totalAnomalies },
    ];
    return points;
  }, [filteredCases, closedCases, totalAnomalies]);

  // 2. Case Status Breakdown (Donut)
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { active: 0, flagged: 0, closed: 0, archived: 0 };
    cases.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return [
      { name: 'Active', key: 'active', value: counts.active, color: STATUS_COLORS.active },
      { name: 'Flagged', key: 'flagged', value: counts.flagged, color: STATUS_COLORS.flagged },
      { name: 'Closed', key: 'closed', value: counts.closed, color: STATUS_COLORS.closed },
      { name: 'Archived', key: 'archived', value: counts.archived || 0, color: STATUS_COLORS.archived },
    ].filter(s => s.value > 0);
  }, [cases]);

  // 3. Priority Distribution Data (Horizontal Bar)
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    filteredCases.forEach((c) => {
      counts[c.priority] = (counts[c.priority] || 0) + 1;
    });
    return [
      { priority: 'Critical', key: 'critical', count: counts.critical, color: PRIORITY_COLORS.critical },
      { priority: 'High', key: 'high', count: counts.high, color: PRIORITY_COLORS.high },
      { priority: 'Medium', key: 'medium', count: counts.medium, color: PRIORITY_COLORS.medium },
      { priority: 'Low', key: 'low', count: counts.low, color: PRIORITY_COLORS.low },
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

  // 6. Anomaly Severity Over Time (Stacked Area)
  const anomalySeverityData = useMemo(() => [
    { period: 'May 26', critical: 3, high: 6, medium: 9, low: 5 },
    { period: 'Jun 26', critical: 5, high: 9, medium: 12, low: 7 },
    { period: 'Jul 26', critical: 8, high: 14, medium: 10, low: 6 },
    { period: 'Aug 26', critical: flaggedCases * 2 + 4, high: activeCases + 6, medium: 8, low: 4 },
  ], [flaggedCases, activeCases]);

  const hasActiveFilters = Boolean(statusFilter || priorityFilter || categoryFilter || dateRange !== 'all');

  const clearAllFilters = () => {
    setStatusFilter(null);
    setPriorityFilter(null);
    setCategoryFilter(null);
    setDateRange('all');
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
        background: '#FAF6F0',
        position: 'relative',
      }}
    >
      {/* ─── 1. Header ─── */}
      <header style={{
        padding: '18px 24px 14px',
        borderBottom: '1px solid #DDD5CA',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        background: '#FAF6F0',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <div>
          <div className="data-label" style={{ marginBottom: 4 }}>Phishield / Analytics</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#2A2420', letterSpacing: '-0.01em', fontFamily: '"Fraunces", Georgia, serif' }}>
            Analytics & Telemetry
          </h1>
        </div>

        {/* Date Filter & System Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {/* Date Range Selector Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#FFFFFF',
            border: '1px solid #DDD5CA',
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
                    color: active ? '#8C3D1A' : '#7A6F63',
                    background: active ? '#FAF6F0' : 'transparent',
                    border: active ? '1px solid #C4622D50' : '1px solid transparent',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderLeft: '1px solid #DDD5CA', paddingLeft: 12 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3D7A4A', display: 'inline-block' }} />
            <span className="data-label">Telemetry Live</span>
          </div>
        </div>
      </header>

      {/* ─── 2. Top Stats Strip ─── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #DDD5CA', flexWrap: 'wrap', background: '#F3EDE4' }}>
        {[
          { label: 'Total Cases', value: totalCases, color: '#8C3D1A', trend: [10, 11, 12, 13, 14, 15, totalCases], isUp: true, isHeavy: false },
          { label: 'Active Pipeline', value: activeCases, color: '#C4622D', trend: [6, 7, 8, 8, 9, 9, activeCases], isUp: true, isHeavy: true, dot: '#C4622D' },
          { label: 'Avg Resolution', value: avgResolutionDays, suffix: 'd', isFloat: true, color: '#6B2E12', trend: [5.1, 4.9, 4.7, 4.5, 4.3, 4.2], isUp: false, isHeavy: false },
          { label: 'Total Anomalies', value: totalAnomalies, color: '#B53924', trend: [24, 28, 31, 35, 40, totalAnomalies], isUp: true, isHeavy: true, dot: '#B53924', pulse: true },
          { label: 'Entities Tracked', value: totalEntities, color: '#D4854A', trend: [120, 140, 160, 190, 210, totalEntities], isUp: true, isHeavy: false },
          { label: 'Closure Rate', value: closureRate, suffix: '%', isFloat: true, color: '#3D7A4A', trend: [58, 60, 62, 64, 66, closureRate], isUp: true, isHeavy: false },
        ].map((s, i) => (
          <div key={s.label} style={{
            padding: '11px 18px',
            borderRight: i < 5 ? '1px solid #DDD5CA' : 'none',
            display: 'flex', flexDirection: 'column', gap: 4, minWidth: 130, flex: '1 1 130px',
            background: s.isHeavy ? '#FAF6F0' : 'transparent',
            borderTop: s.isHeavy ? `2px solid ${s.color}` : '2px solid transparent',
          }}>
            <div className="data-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {s.dot && (
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', background: s.dot,
                  animation: s.pulse ? 'status-pulse 2.5s ease-in-out infinite' : 'none',
                }} />
              )}
              <span style={{ fontWeight: s.isHeavy ? 600 : 500, color: s.isHeavy ? '#2A2420' : '#7A6F63' }}>
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
              background: '#FAF6F0',
              borderBottom: '1px solid #DDD5CA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#8C3D1A', fontSize: 11, fontWeight: 600 }}>
                <Filter className="w-3.5 h-3.5 text-[#C4622D]" />
                <span>Active Filters:</span>
              </div>

              {dateRange !== 'all' && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: '#FFFFFF', border: '1px solid #DDD5CA',
                  borderRadius: 4, padding: '2px 8px', fontSize: 10.5, color: '#2A2420',
                }}>
                  <span>Date: {dateRange.toUpperCase()}</span>
                  <button type="button" onClick={() => setDateRange('all')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                    <X className="w-3 h-3 text-[#A89F93] hover:text-[#B53924]" />
                  </button>
                </span>
              )}

              {statusFilter && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: '#FFFFFF', border: '1px solid #DDD5CA',
                  borderRadius: 4, padding: '2px 8px', fontSize: 10.5, color: '#2A2420',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[statusFilter] || '#C4622D' }} />
                  <span>Status: {statusFilter}</span>
                  <button type="button" onClick={() => setStatusFilter(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                    <X className="w-3 h-3 text-[#A89F93] hover:text-[#B53924]" />
                  </button>
                </span>
              )}

              {priorityFilter && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: '#FFFFFF', border: '1px solid #DDD5CA',
                  borderRadius: 4, padding: '2px 8px', fontSize: 10.5, color: '#2A2420',
                }}>
                  <span>Priority: {priorityFilter}</span>
                  <button type="button" onClick={() => setPriorityFilter(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                    <X className="w-3 h-3 text-[#A89F93] hover:text-[#B53924]" />
                  </button>
                </span>
              )}

              {categoryFilter && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: '#FFFFFF', border: '1px solid #DDD5CA',
                  borderRadius: 4, padding: '2px 8px', fontSize: 10.5, color: '#2A2420',
                }}>
                  <span>Type: {categoryFilter}</span>
                  <button type="button" onClick={() => setCategoryFilter(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                    <X className="w-3 h-3 text-[#A89F93] hover:text-[#B53924]" />
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
              background: '#FFFFFF',
              border: '1px solid #DDD5CA',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: '0 1px 3px rgba(42, 36, 32, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="data-label" style={{ color: '#8C3D1A', fontWeight: 600 }}>Case Velocity & Telemetry</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2A2420', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
                  Case Ingestion vs. Resolution Rate
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, fontFamily: 'IBM Plex Mono, monospace' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 2, background: '#C4622D', borderRadius: 1 }} />
                  <span style={{ color: '#7A6F63' }}>Opened</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 2, background: '#3D7A4A', borderRadius: 1 }} />
                  <span style={{ color: '#7A6F63' }}>Closed</span>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#DDD5CA50" vertical={false} />
                  <XAxis dataKey="week" stroke="#A89F93" fontSize={10} tickLine={false} fontFamily="IBM Plex Mono, monospace" />
                  <YAxis stroke="#A89F93" fontSize={10} tickLine={false} axisLine={false} fontFamily="IBM Plex Mono, monospace" />
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
                    stroke="#3D7A4A"
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
              background: '#FFFFFF',
              border: '1px solid #DDD5CA',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(42, 36, 32, 0.04)',
            }}
          >
            <div>
              <div className="data-label" style={{ color: '#8C3D1A', fontWeight: 600 }}>Status Distribution</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2A2420', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
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
                        stroke={statusFilter === entry.key ? '#2A2420' : '#FFFFFF'} 
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
                <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 20, fontWeight: 600, color: '#2A2420', lineHeight: 1 }}>
                  {totalCases}
                </span>
                <span style={{ fontSize: 9, color: '#7A6F63', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                  Total Cases
                </span>
              </div>
            </div>

            {/* Legend & Click Hint */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid #DDD5CA60', paddingTop: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {statusData.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setStatusFilter(statusFilter === s.key ? null : s.key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '4px 6px', borderRadius: 4, border: 'none',
                      background: statusFilter === s.key ? '#FAF6F0' : 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
                      <span style={{ fontSize: 10.5, color: '#2A2420' }}>{s.name}</span>
                    </div>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10.5, fontWeight: 600, color: '#7A6F63' }}>
                      {s.value}
                    </span>
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 9.5, color: '#A89F93', textAlign: 'center' }}>Click segment to filter table</span>
            </div>
          </motion.div>
        </div>

        {/* Row 2: Priority Distribution (1/2) + Crime Type Breakdown (1/2) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          
          {/* Chart 3: Priority Distribution Horizontal Bars */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.35, ease: EASE_SHARP }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #DDD5CA',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: '0 1px 3px rgba(42, 36, 32, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="data-label" style={{ color: '#8C3D1A', fontWeight: 600 }}>Severity Distribution</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2A2420', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
                  Case Priority Allocation
                </h3>
              </div>
              <span style={{ fontSize: 10, color: '#7A6F63', fontFamily: 'IBM Plex Mono, monospace' }}>
                {filteredCases.length} Filtered Cases
              </span>
            </div>

            <div style={{ height: 180, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={priorityData}
                  margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#DDD5CA40" horizontal={false} />
                  <XAxis type="number" stroke="#A89F93" fontSize={10} tickLine={false} axisLine={false} fontFamily="IBM Plex Mono, monospace" />
                  <YAxis type="category" dataKey="priority" stroke="#2A2420" fontSize={11} tickLine={false} axisLine={false} width={65} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Cases"
                    radius={[0, 4, 4, 0]}
                    cursor="pointer"
                    onClick={(data: any) => {
                      const k = data?.key || data?.payload?.key;
                      if (k) {
                        setPriorityFilter(prev => prev === k ? null : k);
                      }
                    }}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke={priorityFilter === entry.key ? '#2A2420' : 'none'}
                        strokeWidth={1.5}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 4: Case Crime Type Categorization */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.35, ease: EASE_SHARP }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #DDD5CA',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: '0 1px 3px rgba(42, 36, 32, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="data-label" style={{ color: '#8C3D1A', fontWeight: 600 }}>Classification</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2A2420', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
                  Offense & Target Categories
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxHeight: 185, overflowY: 'auto' }}>
              {categoryData.map((cat) => {
                const pct = totalCases > 0 ? ((cat.value / totalCases) * 100).toFixed(0) : '0';
                const isSelected = categoryFilter === cat.name;
                return (
                  <div
                    key={cat.name}
                    onClick={() => setCategoryFilter(isSelected ? null : cat.name)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: 4,
                      background: isSelected ? '#FAF6F0' : 'transparent',
                      transition: 'background 100ms ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5 }}>
                      <span style={{ fontWeight: 600, color: isSelected ? '#8C3D1A' : '#2A2420', fontFamily: 'Inter, sans-serif' }}>
                        {cat.name}
                      </span>
                      <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#7A6F63', fontSize: 10.5 }}>
                        {cat.value} ({pct}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 5, background: '#F3EDE4', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: cat.color,
                          borderRadius: 3,
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
              background: '#FFFFFF',
              border: '1px solid #DDD5CA',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: '0 1px 3px rgba(42, 36, 32, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div className="data-label" style={{ color: '#8C3D1A', fontWeight: 600 }}>Severity Spikes</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2A2420', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
                  Anomaly Detection Severity Stream
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 10.5, fontFamily: 'IBM Plex Mono, monospace' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B53924' }} /> Critical
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4622D' }} /> High
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4854A' }} /> Medium
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7A6F63' }} /> Low
                </span>
              </div>
            </div>

            <div style={{ height: 210, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={anomalySeverityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DDD5CA50" vertical={false} />
                  <XAxis dataKey="period" stroke="#A89F93" fontSize={10} tickLine={false} fontFamily="IBM Plex Mono, monospace" />
                  <YAxis stroke="#A89F93" fontSize={10} tickLine={false} axisLine={false} fontFamily="IBM Plex Mono, monospace" />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="#B53924" fill="#B53924" fillOpacity={0.85} name="Critical" />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="#C4622D" fill="#C4622D" fillOpacity={0.75} name="High" />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="#D4854A" fill="#D4854A" fillOpacity={0.65} name="Medium" />
                  <Area type="monotone" dataKey="low" stackId="1" stroke="#A89F93" fill="#A89F93" fillOpacity={0.4} name="Low" />
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
              background: '#FFFFFF',
              border: '1px solid #DDD5CA',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 1px 3px rgba(42, 36, 32, 0.04)',
            }}
          >
            <div>
              <div className="data-label" style={{ color: '#8C3D1A', fontWeight: 600 }}>Personnel Allocation</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#2A2420', fontFamily: '"Fraunces", Georgia, serif', marginTop: 2 }}>
                Investigator Workload
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 210 }}>
              {investigatorData.map((inv, idx) => (
                <div
                  key={inv.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 6,
                    background: '#FAF6F0',
                    border: '1px solid #DDD5CA60',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: '#F3EDE4', border: '1px solid #DDD5CA',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9.5, fontWeight: 600, color: '#8C3D1A',
                    }}>
                      {inv.initials}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#2A2420', fontFamily: 'Inter, sans-serif' }}>
                        {inv.name}
                      </div>
                      <div style={{ fontSize: 9.5, color: '#7A6F63' }}>
                        {inv.avgAnomalies} avg. anomalies/case
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 600, color: '#C4622D' }}>
                      {inv.cases}
                    </span>
                    <span style={{ fontSize: 9.5, color: '#7A6F63' }}>cases</span>
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
