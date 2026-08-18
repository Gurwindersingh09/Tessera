import { create } from 'zustand';
import { EntityNode, RelationshipEdge, AnalyticsEvent, AnomalyFlag } from '../types/schema';
import { mockEntities, mockEdges, mockEvents, mockAnomalies } from '../data/mockData';

interface AnalyticsState {
  caseId: string;
  selectedEntityId: string | null;
  hoveredEntityId: string | null;
  entities: EntityNode[];
  edges: RelationshipEdge[];
  events: AnalyticsEvent[];
  anomalies: AnomalyFlag[];
  filters: Record<string, any>;
  panelState: {
    sidebarOpen: boolean;
    dossierOpen: boolean;
    bottomPaneHeight: number;
  };
  
  // Actions
  setCaseId: (id: string) => void;
  setSelectedEntityId: (id: string | null) => void;
  setHoveredEntityId: (id: string | null) => void;
  setData: (data: { entities: EntityNode[], edges: RelationshipEdge[], events: AnalyticsEvent[], anomalies: AnomalyFlag[] }) => void;
  toggleSidebar: () => void;
  toggleDossier: () => void;
  setBottomPaneHeight: (height: number) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  caseId: 'CASE-0041',
  selectedEntityId: null,
  hoveredEntityId: null,
  entities: mockEntities,
  edges: mockEdges,
  events: mockEvents,
  anomalies: mockAnomalies,
  filters: {},
  panelState: {
    sidebarOpen: true,
    dossierOpen: false,
    bottomPaneHeight: 280,
  },

  setCaseId: (id) => set({ caseId: id }),
  setSelectedEntityId: (id) => set((state) => ({ 
    selectedEntityId: id,
    panelState: { ...state.panelState, dossierOpen: !!id } 
  })),
  setHoveredEntityId: (id) => set({ hoveredEntityId: id }),
  setData: (data) => set({ ...data }),
  toggleSidebar: () => set((state) => ({ panelState: { ...state.panelState, sidebarOpen: !state.panelState.sidebarOpen } })),
  toggleDossier: () => set((state) => ({ panelState: { ...state.panelState, dossierOpen: !state.panelState.dossierOpen } })),
  setBottomPaneHeight: (height) => set((state) => ({ panelState: { ...state.panelState, bottomPaneHeight: height } })),
}));
