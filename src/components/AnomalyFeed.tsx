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
    x: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: EASE_SHARP },
  }),
};

export const AnomalyFeed: React.FC = () => {
  const { anomalies, toggleSidebar } = useAnalyticsStore();

  return (
    <div className="h-full flex flex-col bg-[#F3EDE4]">
      {/* Header with collapse button */}
      <div className="h-10 border-b border-[#DDD5CA] flex items-center justify-between px-3 shrink-0 bg-[#F3EDE4]">
        <div className="flex items-center gap-2 text-[#2A2420] uppercase tracking-widest text-xs font-semibold">
          <Activity className="w-4 h-4 text-[#D4854A]" />
          <span>Anomaly Feed</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-1.5 py-0.5 bg-[#FAF6F0] text-[#7A6F63] font-mono text-[10px] border border-[#DDD5CA] rounded">
            {anomalies.length}
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            title="Compress Anomaly Feed"
            style={{
              border: 'none', background: 'transparent',
              color: '#7A6F63', cursor: 'pointer', padding: 2,
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
