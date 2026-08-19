import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { motion } from 'framer-motion';

const EASE_SHARP: [number, number, number, number] = [0.4, 0, 0.2, 1];

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
      case 'PHONE': return '#C4622D';
      case 'IMEI': return '#C4622D';
      case 'BANK_ACCOUNT': return '#8C3D1A';
      case 'SOCIAL_HANDLE': return '#D4854A';
      case 'PERSON': return '#2A2420';
      default: return '#A89F93';
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
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.strokeStyle = '#6B2E12';
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
      ctx.fillStyle = isSelected ? '#2A2420' : '#7A6F63';
      ctx.fillText(node.label, node.x, node.y + size + 6 / globalScale);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE_SHARP }}
      className="absolute inset-0 bg-[#FAF6F0] overflow-hidden dot-pattern"
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
            return '#DDD5CA';
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
          backgroundColor="#FAF6F0"
        />
      )}
    </motion.div>
  );
};
