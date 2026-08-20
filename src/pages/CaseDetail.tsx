import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Group, Panel, usePanelRef } from 'react-resizable-panels';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useTesseraStore } from '../store/useTesseraStore';
import { CommandBar } from '../components/CommandBar';
import { AnomalyFeed } from '../components/AnomalyFeed';
import { NetworkGraph } from '../components/NetworkGraph';
import { EntityDossier } from '../components/EntityDossier';
import { TimelineTable } from '../components/TimelineTable';
import { GeoMap } from '../components/GeoMap';
import { ResizeHandle } from '../components/ui/ResizeHandle';
import { 
  PanelLeftOpen, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Table,
  Network,
  MapPin,
  Maximize2
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

// Helpers for localStorage layout persistence
const getPersistedLayout = (key: string, fallback?: Record<string, number>): Record<string, number> | undefined => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    // ignore json parse error
  }
  return fallback;
};

const persistLayout = (key: string, layout: Record<string, number>) => {
  try {
    localStorage.setItem(key, JSON.stringify(layout));
  } catch {
    // ignore storage error
  }
};

export const CaseDetail: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { 
    setCaseId, 
    panelState, 
    entities, 
    edges,
    anomalies, 
    events 
  } = useAnalyticsStore();
  const { cases, pushNavHistory } = useTesseraStore();

  const caseData = cases.find(c => c.id === caseId);

  // Panel Imperative Handles for smooth collapse/expand
  const anomalyPanelRef = usePanelRef();
  const graphPanelRef = usePanelRef();
  const bottomPanelRef = usePanelRef();
  const timelinePanelRef = usePanelRef();
  const mapPanelRef = usePanelRef();

  // Collapsed state tracking (triggered by drag-to-collapse or quick preset)
  const [isAnomalyCollapsed, setIsAnomalyCollapsed] = useState(false);
  const [isGraphCollapsed, setIsGraphCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);

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

  // Layout persistence keys (per-case with fallback)
  const mainLayoutKey = `tessera_layout_${caseId || 'default'}_main`;
  const verticalLayoutKey = `tessera_layout_${caseId || 'default'}_vertical`;
  const bottomLayoutKey = `tessera_layout_${caseId || 'default'}_bottom`;

  const handleMainLayoutChanged = useCallback((layout: Record<string, number>) => {
    persistLayout(mainLayoutKey, layout);
  }, [mainLayoutKey]);

  const handleVerticalLayoutChanged = useCallback((layout: Record<string, number>) => {
    persistLayout(verticalLayoutKey, layout);
  }, [verticalLayoutKey]);

  const handleBottomLayoutChanged = useCallback((layout: Record<string, number>) => {
    persistLayout(bottomLayoutKey, layout);
  }, [bottomLayoutKey]);

  // Quick Preset Actions
  const toggleAnomalyPanel = () => {
    if (anomalyPanelRef.current) {
      if (isAnomalyCollapsed) {
        anomalyPanelRef.current.expand();
      } else {
        anomalyPanelRef.current.collapse();
      }
    }
  };

  const toggleBottomPanel = () => {
    if (bottomPanelRef.current) {
      if (isBottomCollapsed) {
        bottomPanelRef.current.expand();
      } else {
        bottomPanelRef.current.collapse();
      }
    }
  };

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
            onClick={toggleAnomalyPanel}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', fontSize: '10px',
              background: !isAnomalyCollapsed ? 'var(--color-bg-hover)' : 'transparent',
              borderColor: !isAnomalyCollapsed ? '#C4622D' : 'var(--color-border)',
              color: !isAnomalyCollapsed ? '#C4622D' : 'var(--color-text-secondary)',
            }}
            title="Toggle Anomaly Feed Panel"
          >
            <Activity className="w-3 h-3" />
            <span>Feed ({anomalies.length})</span>
          </button>

          <button
            type="button"
            className="btn-ghost"
            onClick={toggleBottomPanel}
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

      {/* 3. Main Workspace Area: Resizable Outer Group */}
      <div className="flex flex-1 overflow-hidden relative min-h-0 w-full">
        <Group
          id="case-analysis-main-horizontal"
          orientation="horizontal"
          className="w-full h-full"
          defaultLayout={getPersistedLayout(mainLayoutKey, { 'panel-anomaly-feed': 22, 'panel-main-workspace': 78 })}
          onLayoutChanged={handleMainLayoutChanged}
        >
          {/* Left Column: Anomaly Feed (Collapsible with no artificial expansion ceiling) */}
          <Panel
            id="panel-anomaly-feed"
            panelRef={anomalyPanelRef}
            collapsible={true}
            minSize={120}
            collapsedSize="28px"
            defaultSize="22%"
            onResize={(size) => {
              setIsAnomalyCollapsed(size.inPixels <= 35);
            }}
            className="h-full flex flex-col z-30 overflow-hidden"
            style={{ background: 'var(--color-bg-surface)' }}
          >
            {isAnomalyCollapsed ? (
              /* Minimized vertical strip with quick click-to-expand */
              <div
                onClick={() => anomalyPanelRef.current?.expand()}
                title="Click to expand Anomaly Feed"
                className="w-full h-full flex flex-col items-center pt-3 cursor-pointer select-none bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] transition-colors"
                style={{ borderRight: '1px solid var(--color-border)' }}
              >
                <PanelLeftOpen className="w-3.5 h-3.5 text-[var(--color-text-secondary)] hover:text-[#C4622D] mb-3 transition-colors" />
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
            ) : (
              /* Full Anomaly Feed with all cards and actions */
              <AnomalyFeed onCollapse={() => anomalyPanelRef.current?.collapse()} />
            )}
          </Panel>

          {/* Vertical Drag Handle (Anomaly Feed ↔ Main Workspace Canvas) */}
          <ResizeHandle direction="vertical" id="handle-anomaly-feed" />

          {/* Center & Right Workspace Panel */}
          <Panel
            id="panel-main-workspace"
            minSize={100}
            className="h-full flex flex-col min-w-0 relative overflow-hidden"
          >
            {/* Middle Vertical Group: Graph Canvas ↕ Bottom Section */}
            <Group
              id="case-analysis-workspace-vertical"
              orientation="vertical"
              className="w-full h-full"
              defaultLayout={getPersistedLayout(verticalLayoutKey, { 'panel-graph-canvas': 62, 'panel-bottom-section': 38 })}
              onLayoutChanged={handleVerticalLayoutChanged}
            >
              {/* Top Canvas: Network Graph (Collapsible to 32px header if compressed completely) */}
              <Panel
                id="panel-graph-canvas"
                panelRef={graphPanelRef}
                collapsible={true}
                minSize={60}
                collapsedSize="32px"
                defaultSize="62%"
                onResize={(size) => {
                  setIsGraphCollapsed(size.inPixels <= 35);
                }}
                className="relative z-10 w-full h-full overflow-hidden"
              >
                {isGraphCollapsed ? (
                  /* Minimized Graph Bar when compressed completely */
                  <div 
                    onClick={() => graphPanelRef.current?.expand()}
                    title="Click to expand Network Graph"
                    className="w-full h-[32px] flex items-center justify-between px-3 cursor-pointer bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] transition-colors border-b border-[var(--color-border)] select-none"
                  >
                    <div className="flex items-center gap-2">
                      <Network className="w-3.5 h-3.5 text-[#C4622D]" />
                      <span className="text-[10.5px] font-semibold text-[#C4622D] uppercase tracking-wider">Network Graph</span>
                      <span className="text-[9.5px] font-mono text-[var(--color-text-secondary)]">{entities.length} nodes · {edges.length} links</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-secondary)] font-medium">
                      <ChevronDown className="w-3 h-3 text-[#C4622D]" />
                      <span>Expand Graph</span>
                    </div>
                  </div>
                ) : (
                  <NetworkGraph />
                )}
              </Panel>

              {/* Horizontal Drag Handle (Graph Canvas ↕ Bottom Pane) */}
              <ResizeHandle direction="horizontal" id="handle-canvas-bottom" />

              {/* Bottom Split Pane: Event Timeline & Geospatial Trajectory */}
              <Panel
                id="panel-bottom-section"
                panelRef={bottomPanelRef}
                collapsible={true}
                minSize={60}
                collapsedSize="32px"
                defaultSize="38%"
                onResize={(size) => {
                  setIsBottomCollapsed(size.inPixels <= 35);
                }}
                className="flex flex-col z-20 w-full h-full overflow-hidden"
                style={{ background: 'var(--color-bg-base)' }}
              >
                {/* Header Bar with Compress/Expand quick preset */}
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
                      onClick={toggleBottomPanel}
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
                      {isBottomCollapsed ? (
                        <>
                          <ChevronUp className="w-3 h-3 text-[#C4622D]" />
                          <span>Expand Pane</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 text-[var(--color-text-secondary)]" />
                          <span>Compress Pane</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sub-panel content: Bottom Horizontal Group for Timeline & Map */}
                {!isBottomCollapsed && (
                  <div className="flex-1 min-h-0 w-full overflow-hidden">
                    <Group
                      id="case-analysis-bottom-horizontal"
                      orientation="horizontal"
                      className="w-full h-full"
                      defaultLayout={getPersistedLayout(bottomLayoutKey, { 'panel-timeline-table': 50, 'panel-geo-map': 50 })}
                      onLayoutChanged={handleBottomLayoutChanged}
                    >
                      {/* Left: Timeline Table (Collapsible with unconstrained expansion) */}
                      <Panel
                        id="panel-timeline-table"
                        panelRef={timelinePanelRef}
                        collapsible={true}
                        minSize={50}
                        collapsedSize="32px"
                        defaultSize="50%"
                        onResize={(size) => {
                          setIsTimelineCollapsed(size.inPixels <= 35);
                        }}
                        className="h-full relative overflow-hidden"
                      >
                        {isTimelineCollapsed ? (
                          <div
                            onClick={() => timelinePanelRef.current?.expand()}
                            title="Click to expand Event Timeline"
                            className="w-full h-full flex flex-col items-center pt-3 cursor-pointer select-none bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] transition-colors"
                            style={{ borderRight: '1px solid var(--color-border)' }}
                          >
                            <Table className="w-3.5 h-3.5 text-[var(--color-text-secondary)] hover:text-[#C4622D] mb-3 transition-colors" />
                            <span style={{
                              writingMode: 'vertical-rl',
                              fontSize: 9.5,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              color: '#C4622D',
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 600,
                            }}>
                              Timeline ({events.length})
                            </span>
                          </div>
                        ) : (
                          <TimelineTable />
                        )}
                      </Panel>

                      {/* Vertical Drag Handle (Timeline ↔ Map) */}
                      <ResizeHandle direction="vertical" id="handle-timeline-map" />

                      {/* Right: Geospatial Trajectory Map (Collapsible with unconstrained expansion) */}
                      <Panel
                        id="panel-geo-map"
                        panelRef={mapPanelRef}
                        collapsible={true}
                        minSize={50}
                        collapsedSize="32px"
                        defaultSize="50%"
                        onResize={(size) => {
                          setIsMapCollapsed(size.inPixels <= 35);
                        }}
                        className="h-full relative overflow-hidden"
                      >
                        {isMapCollapsed ? (
                          <div
                            onClick={() => mapPanelRef.current?.expand()}
                            title="Click to expand Geospatial Map"
                            className="w-full h-full flex flex-col items-center pt-3 cursor-pointer select-none bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] transition-colors"
                            style={{ borderLeft: '1px solid var(--color-border)' }}
                          >
                            <MapPin className="w-3.5 h-3.5 text-[var(--color-text-secondary)] hover:text-[#C4622D] mb-3 transition-colors" />
                            <span style={{
                              writingMode: 'vertical-rl',
                              fontSize: 9.5,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              color: '#C4622D',
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 600,
                            }}>
                              Geospatial Map
                            </span>
                          </div>
                        ) : (
                          <GeoMap />
                        )}
                      </Panel>
                    </Group>
                  </div>
                )}
              </Panel>
            </Group>
          </Panel>
        </Group>

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
