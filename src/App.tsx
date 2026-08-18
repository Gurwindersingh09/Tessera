import React, { useEffect, useState } from 'react';
import { useAnalyticsStore } from './store/useAnalyticsStore';
import { mockEntities, mockEdges, mockEvents, mockAnomalies } from './data/mockData';
import { CommandBar } from './components/CommandBar';
import { AnomalyFeed } from './components/AnomalyFeed';
import { NetworkGraph } from './components/NetworkGraph';
import { EntityDossier } from './components/EntityDossier';
import { TimelineTable } from './components/TimelineTable';
import { GeoMap } from './components/GeoMap';
import { LandingPage } from './LandingPage';

function App() {
  const { setData, panelState } = useAnalyticsStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Load mock data on mount
    setData({
      entities: mockEntities,
      edges: mockEdges,
      events: mockEvents,
      anomalies: mockAnomalies,
    });
  }, [setData]);

  if (!isAuthenticated) {
    return <LandingPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090C15] text-slate-200 text-sm">
      {/* Top Command Bar */}
      <div className="h-12 flex-shrink-0 z-50">
        <CommandBar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar - Anomaly Feed */}
        {panelState.sidebarOpen && (
          <div className="w-[280px] flex-shrink-0 z-40 bg-slate-950/80 backdrop-blur-md border-r border-slate-800 transition-none">
            <AnomalyFeed />
          </div>
        )}

        {/* Center - Network Graph & Bottom Split */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          
          {/* Top part: Network Graph */}
          <div className="flex-1 relative z-10">
            <NetworkGraph />
          </div>

          {/* Bottom Split Pane */}
          <div 
            className="flex flex-shrink-0 border-t border-slate-800 z-30 bg-[#090C15]"
            style={{ height: panelState.bottomPaneHeight }}
          >
            <div className="flex-1 border-r border-slate-800 relative">
              <TimelineTable />
            </div>
            <div className="flex-1 relative">
              <GeoMap />
            </div>
          </div>
        </div>

        {/* Right Drawer - Entity Dossier */}
        {panelState.dossierOpen && (
          <div className="w-[380px] flex-shrink-0 z-40 bg-slate-950/80 backdrop-blur-md border-l border-slate-800 transition-none absolute right-0 top-0 bottom-0">
            <EntityDossier />
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
