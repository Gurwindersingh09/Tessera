import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { Plus, Minus, Maximize2, Info } from 'lucide-react';

const EASE_SHARP: [number, number, number, number] = [0.4, 0, 0.2, 1];

export const NetworkGraph: React.FC = () => {
  const fgRef = useRef<ForceGraphMethods | null>(null);
  const { entities, edges, selectedEntityId, setSelectedEntityId, hoveredEntityId, setHoveredEntityId } = useAnalyticsStore();
  const { theme } = useTheme();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    };

    updateDimensions();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-fit graph to view on initial load
  useEffect(() => {
    if (dimensions.width > 0 && fgRef.current) {
      const timer = setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 45);
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [dimensions.width > 0 && dimensions.height > 0, entities]);

  const graphData = useMemo(() => ({
    nodes: entities.map(e => ({ ...e })),
    links: edges.map(e => ({ ...e }))
  }), [entities, edges]);

  const getNodeColor = (type: string) => {
    switch(type) {
      case 'PHONE': return '#C4622D';
      case 'IMEI': return '#6B2E12';
      case 'BANK_ACCOUNT': return '#8C3D1A';
      case 'SOCIAL_HANDLE': return '#D4854A';
      case 'PERSON': return isDark ? '#EDEEF0' : '#2A2420';
      default: return '#A89F93';
    }
  };

  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedEntityId === node.id;
    const isHovered = hoveredEntityId === node.id;
    
    const size = node.type === 'PERSON' ? 9 : 6;
    const color = getNodeColor(node.type);

    ctx.beginPath();
    
    if (node.type === 'BANK_ACCOUNT') {
      ctx.rect(node.x - size, node.y - size, size * 2, size * 2);
    } else if (node.type === 'SOCIAL_HANDLE') {
      ctx.moveTo(node.x, node.y - size * 1.1);
      ctx.lineTo(node.x + size * 1.1, node.y);
      ctx.lineTo(node.x, node.y + size * 1.1);
      ctx.lineTo(node.x - size * 1.1, node.y);
      ctx.closePath();
    } else {
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    }

    ctx.fillStyle = color;
    
    if (isSelected || isHovered) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.strokeStyle = isDark ? '#EDEEF0' : '#2A2420';
      ctx.lineWidth = 2.5 / globalScale;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      ctx.fill();
      ctx.strokeStyle = isDark ? '#2A2C30' : '#FFFFFF';
      ctx.lineWidth = 1 / globalScale;
      ctx.stroke();
    }

    if (globalScale > 1.2 || isSelected || isHovered) {
      const fontSize = 11 / globalScale;
      ctx.font = `500 ${fontSize}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isSelected 
        ? '#C4622D' 
        : (isDark ? '#EDEEF0' : '#2A2420');
      ctx.fillText(node.label, node.x, node.y + size + 7 / globalScale);
    }
  };

  const handleZoomIn = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom * 1.35, 300);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom / 1.35, 300);
    }
  };

  const handleFitView = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 45);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE_SHARP }}
      className="absolute inset-0 overflow-hidden dot-pattern"
      style={{ background: 'var(--color-bg-base)' }}
      ref={containerRef}
    >
      {dimensions.width > 0 && (
        <ForceGraph2D
          ref={fgRef as any}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={drawNode}
          linkColor={(link: any) => {
            if (link.type === 'CALLED') return '#C4622D';
            if (link.type === 'TRANSACTED_WITH') return '#8C3D1A';
            return isDark ? '#3A3C42' : '#DDD5CA';
          }}
          linkWidth={1.5}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          onNodeClick={(node: any) => {
            setSelectedEntityId(node.id);
            if (fgRef.current) {
              fgRef.current.centerAt(node.x, node.y, 800);
              fgRef.current.zoom(2.5, 800);
            }
          }}
          onNodeHover={(node: any) => setHoveredEntityId(node ? node.id : null)}
          backgroundColor={isDark ? '#0D0E10' : '#FAF6F0'}
        />
      )}

      {/* Top-Right: Zoom & Pan Controls */}
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 6,
        padding: 3,
        boxShadow: 'var(--shadow-dropdown)',
        zIndex: 20,
      }}>
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          style={{
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            borderRadius: 4,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          style={{
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            borderRadius: 4,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div style={{ height: 1, background: 'var(--color-border)', margin: '2px 0' }} />

        <button
          type="button"
          onClick={handleFitView}
          title="Fit Graph to View"
          style={{
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            color: '#C4622D',
            cursor: 'pointer',
            borderRadius: 4,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#C4622D]" />
        </button>
      </div>

      {/* Bottom-Left: Legend Panel */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 6,
        padding: '8px 12px',
        boxShadow: 'var(--shadow-dropdown)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 20,
        minWidth: 175,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 4 }}>
          <div className="data-label" style={{ fontSize: '0.62rem', color: '#C4622D' }}>Entity Legend</div>
          <Info className="w-3 h-3 text-[var(--color-text-muted)]" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px', fontSize: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C4622D', display: 'inline-block' }} />
            <span style={{ color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif' }}>Phone (●)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, background: '#8C3D1A', display: 'inline-block' }} />
            <span style={{ color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif' }}>Bank (■)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, background: '#D4854A', transform: 'rotate(45deg)', display: 'inline-block' }} />
            <span style={{ color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif' }}>Social (◆)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isDark ? '#EDEEF0' : '#2A2420', display: 'inline-block' }} />
            <span style={{ color: 'var(--color-text-primary)', fontFamily: 'Inter, sans-serif' }}>Suspect (●)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default NetworkGraph;
