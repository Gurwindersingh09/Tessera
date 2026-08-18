import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { useAnalyticsStore } from '../store/useAnalyticsStore';

export const NetworkGraph: React.FC = () => {
  const fgRef = useRef<ForceGraphMethods | null>(null);
  const { entities, edges, selectedEntityId, setSelectedEntityId, hoveredEntityId, setHoveredEntityId } = useAnalyticsStore();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const graphData = useMemo(() => ({
    nodes: entities.map(e => ({ ...e })),
    links: edges.map(e => ({ ...e }))
  }), [entities, edges]);

  const getNodeColor = (type: string) => {
    switch(type) {
      case 'PHONE': return '#00f0ff';
      case 'IMEI': return '#00f0ff';
      case 'BANK_ACCOUNT': return '#ffb000';
      case 'SOCIAL_HANDLE': return '#b026ff';
      case 'PERSON': return '#ffffff';
      default: return '#888888';
    }
  };

  const drawNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isSelected = selectedEntityId === node.id;
    const isHovered = hoveredEntityId === node.id;
    
    const size = node.type === 'PERSON' ? 8 : 5;
    const color = getNodeColor(node.type);

    ctx.beginPath();
    
    if (node.type === 'BANK_ACCOUNT') {
      ctx.rect(node.x - size, node.y - size, size * 2, size * 2);
    } else if (node.type === 'SOCIAL_HANDLE') {
      ctx.moveTo(node.x, node.y - size);
      ctx.lineTo(node.x + size, node.y);
      ctx.lineTo(node.x, node.y + size);
      ctx.lineTo(node.x - size, node.y);
      ctx.closePath();
    } else {
      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    }

    ctx.fillStyle = color;
    
    if (isSelected || isHovered) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else {
      ctx.fill();
    }

    if (globalScale > 1.5 || isSelected || isHovered) {
      const fontSize = 12 / globalScale;
      ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isSelected ? '#fff' : '#888';
      ctx.fillText(node.label, node.x, node.y + size + 6 / globalScale);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#090C15] overflow-hidden" ref={containerRef}>
      {dimensions.width > 0 && (
        <ForceGraph2D
          ref={fgRef as any}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeCanvasObject={drawNode}
          linkColor={(link: any) => {
            if (link.type === 'CALLED') return '#00f0ff';
            if (link.type === 'TRANSACTED_WITH') return '#ffb000';
            return '#475569';
          }}
          linkWidth={1}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          onNodeClick={(node: any) => {
            setSelectedEntityId(node.id);
            if (fgRef.current) {
              fgRef.current.centerAt(node.x, node.y, 1000);
              fgRef.current.zoom(3, 1000);
            }
          }}
          onNodeHover={(node: any) => setHoveredEntityId(node ? node.id : null)}
          backgroundColor="#090C15"
        />
      )}
    </div>
  );
};
