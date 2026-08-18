import React from 'react';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { AnomalyCard } from './AnomalyCard';
import { Activity } from 'lucide-react';

export const AnomalyFeed: React.FC = () => {
  const { anomalies } = useAnalyticsStore();

  return (
    <div className="h-full flex flex-col bg-[#090C15]/80">
      <div className="h-10 border-b border-slate-800 flex items-center justify-between px-3 shrink-0 bg-[#090C15]">
        <div className="flex items-center gap-2 text-slate-300 uppercase tracking-widest text-xs font-semibold">
          <Activity className="w-4 h-4 text-neon-amber" />
          Anomaly Feed
        </div>
        <div className="px-1.5 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
          {anomalies.length}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent">
        {anomalies.map(anomaly => (
          <AnomalyCard key={anomaly.id} anomaly={anomaly} />
        ))}
      </div>
    </div>
  );
};
