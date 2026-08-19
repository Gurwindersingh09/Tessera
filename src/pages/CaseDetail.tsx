import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useTesseraStore } from '../store/useTesseraStore';
import { CommandBar } from '../components/CommandBar';
import { AnomalyFeed } from '../components/AnomalyFeed';
import { NetworkGraph } from '../components/NetworkGraph';
import { EntityDossier } from '../components/EntityDossier';
import { TimelineTable } from '../components/TimelineTable';
import { GeoMap } from '../components/GeoMap';
import { 
  PanelLeftOpen, 
  ChevronDown, 
  ChevronUp, 
  Activity,
  Table
} from 'lucide-react';

/* ─── Inline Mini Sparkline for Stats ─── */
function MiniSparkline({ data, color, isUp }: { data: number[]; color: string; isUp?: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 48;
  const height = 12;
  const padding = 2;
  
  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const lastPoint = points.split(' ').pop()?.split(',') ?? ['0', '0'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
          r="1.6"
          fill={color}
        />
      </svg>
      <span style={{ fontSize: 8.5, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-text-muted)' }}>
        {isUp ? '↑ 7d' : '↓ 7d'}
      </span>
    </div>
  );
}

export const CaseDetail: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { 
    setCaseId, 
    panelState, 
    toggleSidebar, 
    toggleBottomPane,
    entities, 
    anomalies, 
    events 
  } = useAnalyticsStore();
  const { cases, pushNavHistory } = useTesseraStore();

  const caseData = cases.find(c => c.id === caseId);

  useEffect(() => {
    if (caseId) {
      setCaseId(caseId);
      const title = caseData ? caseData.title : caseId;
      pushNavHistory({
        id: `case-${caseId}`,
        label: `Case: ${title}`,
        path: `/case/${caseId}`,
        depth: 1,
      });
    }
  }, [caseId, caseData]);

  // Compute stats for compact top strip
  const totalAmount = useMemo(() => {
    return events.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [events]);

  const criticalAnomalies = anomalies.filter(a => a.severity === 'CRITICAL').length;
  const highAnomalies = anomalies.filter(a => a.severity === 'HIGH').length;

  const caseStats = [
    {
      label: 'Identified Entities',
      value: String(entities.length).padStart(2, '0'),
      color: '#C4622D',
      trend: [10, 12, 14, 15, 17, 18, entities.length],
      isUp: true,
    },
    {
      label: 'Active Anomalies',
      value: String(anomalies.length).padStart(2, '0'),
      color: 'var(--color-status-flagged)',
      sublabel: `${criticalAnomalies} Critical · ${highAnomalies} High`,
      trend: [2, 3, 3, 4, 4, 5, anomalies.length],
      isUp: true,
      pulse: true,
    },
    {
      label: 'Case Risk Score',
      value: '88/100',
      color: '#C4622D',
      sublabel: 'High Severity Cluster',
      trend: [65, 70, 72, 78, 82, 85, 88],
      isUp: true,
    },
    {
      label: 'Traced Transactions',
      value: `₹${(totalAmount || 428500).toLocaleString()}`,
      color: '#D4854A',
      trend: [120000, 180000, 240000, 310000, 390000, 428500],
      isUp: true,
    },
  ];

  const isBottomCollapsed = panelState.bottomPaneCollapsed;

  return (
    <div 
      className="flex flex-col h-screen w-full overflow-hidden text-sm"
      style={{ background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}
    >
      {/* 1. Top Command Bar */}
      <div className="h-11 flex-shrink-0 z-50">
        <CommandBar />
      </div>

      {/* 2. Compact Stats Strip & Workspace Viewport Controls */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-surface)',
        padding: '6px 16px',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexShrink: 0,
        zIndex: 20,
      }}>
        {/* Left: Case KPI metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {caseStats.map((s, i) => (
            <div
              key={s.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 14px',
                borderRight: i < caseStats.length - 1 ? '1px solid var(--color-border)' : 'none',
                background: 'var(--color-bg-raised)',
                borderRadius: 4,
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {s.pulse && (
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: 'var(--color-status-flagged)', display: 'inline-block',
                      animation: 'status-pulse 2.5s ease-in-out infinite'
                    }} />
                  )}
                  <span className="data-label" style={{ fontSize: '0.6rem' }}>{s.label}</span>
                </div>
                <div style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 15.5,
                  fontWeight: 600,
                  color: s.color,
                  lineHeight: 1.1,
                }}>
                  {s.value}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                {s.sublabel && (
                  <span style={{ fontSize: 9, color: '#C4622D', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {s.sublabel}
                  </span>
                )}
                <MiniSparkline data={s.trend} color={s.color} isUp={s.isUp} />
              </div>
            </div>
          ))}
        </div>

        {/* Right: Quick Panel Layout Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={toggleSidebar}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', fontSize: '10px',
              background: panelState.sidebarOpen ? 'var(--color-bg-hover)' : 'transparent',
              borderColor: panelState.sidebarOpen ? '#C4622D' : 'var(--color-border)',
              color: panelState.sidebarOpen ? '#C4622D' : 'var(--color-text-secondary)',
            }}
            title="Toggle Anomaly Feed Panel"
          >
            <Activity className="w-3 h-3" />
            <span>Feed ({anomalies.length})</span>
          </button>

          <button
            type="button"
            className="btn-ghost"
            onClick={toggleBottomPane}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', fontSize: '10px',
              background: !isBottomCollapsed ? 'var(--color-bg-hover)' : 'transparent',
              borderColor: !isBottomCollapsed ? '#C4622D' : 'var(--color-border)',
              color: !isBottomCollapsed ? '#C4622D' : 'var(--color-text-secondary)',
            }}
            title="Toggle Timeline / Map Split Pane"
          >
            <Table className="w-3 h-3" />
            <span>{isBottomCollapsed ? 'Show Timeline/Map' : 'Maximize Graph'}</span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Drawer - Anomaly Feed */}
        {panelState.sidebarOpen ? (
          <div 
            className="w-[280px] flex-shrink-0 z-30 border-r transition-all duration-200 flex flex-col"
            style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
          >
            <AnomalyFeed />
          </div>
        ) : (
          /* Slim Floating Expand Tab when Anomaly Feed is Collapsed */
          <div
            onClick={toggleSidebar}
            title="Expand Anomaly Feed Panel"
            style={{
              width: 28,
              borderRight: '1px solid var(--color-border)',
              background: 'var(--color-bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 12,
              cursor: 'pointer',
              gap: 8,
              zIndex: 30,
              flexShrink: 0,
            }}
          >
            <PanelLeftOpen className="w-3.5 h-3.5 text-[var(--color-text-secondary)] hover:text-[#C4622D]" />
            <span style={{
              writingMode: 'vertical-rl',
              fontSize: 9.5,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#C4622D',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
            }}>
              Anomalies ({anomalies.length})
            </span>
          </div>
        )}

        {/* Center Canvas & Bottom Split */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          
          {/* Top Canvas: Network Graph */}
          <div className="flex-1 relative z-10">
            <NetworkGraph />
          </div>

          {/* Bottom Split Pane (Timeline + Map) with Expand / Compress Toggle */}
          <div 
            className="flex flex-col flex-shrink-0 border-t z-20 transition-all duration-200"
            style={{ 
              height: isBottomCollapsed ? 32 : panelState.bottomPaneHeight,
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-base)'
            }}
          >
            {/* Split Pane Compression Header Bar */}
            <div style={{
              height: 32,
              background: 'var(--color-bg-surface)',
              borderBottom: isBottomCollapsed ? 'none' : '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 12px',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="data-label" style={{ fontSize: '0.62rem', color: '#C4622D', fontWeight: 600 }}>
                  Event Timeline & Geospatial Trajectory
                </span>
                <span style={{ fontSize: 9.5, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--color-text-secondary)' }}>
                  {events.length} events · {entities.length} nodes
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={toggleBottomPane}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 3,
                    background: 'var(--color-bg-raised)',
                    padding: '2px 6px',
                    fontSize: 9.5,
                    fontFamily: 'Inter, sans-serif',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  title={isBottomCollapsed ? "Expand Timeline & Map Pane" : "Compress Pane to Maximize Graph"}
                >
                  {isBottomCollapsed ? <ChevronUp className="w-3 h-3 text-[#C4622D]" /> : <ChevronDown className="w-3 h-3 text-[var(--color-text-secondary)]" />}
                  <span>{isBottomCollapsed ? 'Expand Pane' : 'Compress Pane'}</span>
                </button>
              </div>
            </div>

            {/* Split content when not collapsed */}
            {!isBottomCollapsed && (
              <div className="flex flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 border-r relative overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                  <TimelineTable />
                </div>
                <div className="flex-1 relative overflow-hidden">
                  <GeoMap />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Drawer - Entity Dossier */}
        {panelState.dossierOpen && (
          <div 
            className="w-[380px] flex-shrink-0 z-40 border-l transition-none absolute right-0 top-0 bottom-0 shadow-lg"
            style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
          >
            <EntityDossier />
          </div>
        )}

      </div>
    </div>
  );
};
export default CaseDetail;
