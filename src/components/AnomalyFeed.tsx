import React from 'react';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { AnomalyCard } from './AnomalyCard';
import { Activity, PanelLeftClose } from 'lucide-react';
import { motion } from 'framer-motion';

const EASE_SHARP: [number, number, number, number] = [0.4, 0, 0.2, 1];

const slideInVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: EASE_SHARP },
  }),
};

interface AnomalyFeedProps {
  onCollapse?: () => void;
}

export const AnomalyFeed: React.FC<AnomalyFeedProps> = ({ onCollapse }) => {
  const { anomalies, toggleSidebar } = useAnalyticsStore();

  const handleCollapse = () => {
    if (onCollapse) {
      onCollapse();
    } else {
      toggleSidebar();
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg-surface)', color: 'var(--color-text-primary)' }}>
      {/* Header with collapse button */}
      <div 
        className="h-10 flex items-center justify-between px-3 shrink-0"
        style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}
      >
        <div className="flex items-center gap-2 uppercase tracking-widest text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          <Activity className="w-4 h-4 text-[#D4854A]" />
          <span>Anomaly Feed</span>
        </div>

        <div className="flex items-center gap-2">
          <div 
            className="px-1.5 py-0.5 font-mono text-[10px] rounded"
            style={{ background: 'var(--color-bg-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            {anomalies.length}
          </div>

          <button
            type="button"
            onClick={handleCollapse}
            title="Compress Anomaly Feed"
            style={{
              border: 'none', background: 'transparent',
              color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 2,
            }}
          >
            <PanelLeftClose className="w-3.5 h-3.5 hover:text-[#C4622D] transition-colors" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {anomalies.map((anomaly, i) => (
          <motion.div
            key={anomaly.id}
            custom={i}
            variants={slideInVariants}
            initial="hidden"
            animate="visible"
          >
            <AnomalyCard anomaly={anomaly} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default AnomalyFeed;
