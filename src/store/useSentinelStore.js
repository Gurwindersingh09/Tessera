import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_CASES = [
  {
    id: 'CASE-0041',
    title: 'Operation Blackthorn',
    status: 'active',
    entityCount: 34,
    anomalyCount: 7,
    lastUpdated: '2026-08-18T14:22:00Z',
    investigator: 'R. Okafor',
    priority: 'critical',
  },
  {
    id: 'CASE-0039',
    title: 'Meridian Financial Fraud',
    status: 'active',
    entityCount: 18,
    anomalyCount: 3,
    lastUpdated: '2026-08-17T09:45:00Z',
    investigator: 'S. Petrov',
    priority: 'high',
  },
  {
    id: 'CASE-0038',
    title: 'Harbor Bridge Incident',
    status: 'flagged',
    entityCount: 9,
    anomalyCount: 12,
    lastUpdated: '2026-08-16T18:01:00Z',
    investigator: 'R. Okafor',
    priority: 'critical',
  },
  {
    id: 'CASE-0037',
    title: 'Nexus Supply Chain',
    status: 'flagged',
    entityCount: 56,
    anomalyCount: 21,
    lastUpdated: '2026-08-15T11:30:00Z',
    investigator: 'M. Chen',
    priority: 'high',
  },
  {
    id: 'CASE-0036',
    title: 'Vantage Point Surveillance',
    status: 'active',
    entityCount: 7,
    anomalyCount: 0,
    lastUpdated: '2026-08-14T07:15:00Z',
    investigator: 'J. Adeyemi',
    priority: 'medium',
  },
  {
    id: 'CASE-0035',
    title: 'Thornfield Property Scheme',
    status: 'closed',
    entityCount: 22,
    anomalyCount: 0,
    lastUpdated: '2026-08-10T16:40:00Z',
    investigator: 'S. Petrov',
    priority: 'low',
  },
  {
    id: 'CASE-0034',
    title: 'Project Nightfall',
    status: 'active',
    entityCount: 41,
    anomalyCount: 5,
    lastUpdated: '2026-08-09T12:00:00Z',
    investigator: 'M. Chen',
    priority: 'high',
  },
  {
    id: 'CASE-0033',
    title: 'Coastal Drug Network',
    status: 'flagged',
    entityCount: 88,
    anomalyCount: 14,
    lastUpdated: '2026-08-07T09:20:00Z',
    investigator: 'J. Adeyemi',
    priority: 'critical',
  },
  {
    id: 'CASE-0032',
    title: 'Eastern Corridor Trafficking',
    status: 'flagged',
    entityCount: 15,
    anomalyCount: 9,
    lastUpdated: '2026-08-05T14:55:00Z',
    investigator: 'R. Okafor',
    priority: 'high',
  },
  {
    id: 'CASE-0031',
    title: 'Irongate Money Laundering',
    status: 'active',
    entityCount: 30,
    anomalyCount: 2,
    lastUpdated: '2026-08-03T10:10:00Z',
    investigator: 'S. Petrov',
    priority: 'medium',
  },
  {
    id: 'CASE-0030',
    title: 'Silver Lake Arson Series',
    status: 'active',
    entityCount: 6,
    anomalyCount: 1,
    lastUpdated: '2026-08-01T08:00:00Z',
    investigator: 'M. Chen',
    priority: 'medium',
  },
  {
    id: 'CASE-0029',
    title: 'Perimeter Breach 7',
    status: 'closed',
    entityCount: 4,
    anomalyCount: 0,
    lastUpdated: '2026-07-28T17:45:00Z',
    investigator: 'J. Adeyemi',
    priority: 'low',
  },
];

// ─── Store ─────────────────────────────────────────────────────────────────────
export const useSentinelStore = create(
  persist(
    (set, get) => ({
      // ── Cases ──────────────────────────────────────────────────────────────
      cases: SEED_CASES,

      addCase: (newCase) =>
        set((state) => ({
          cases: [
            {
              ...newCase,
              id: `CASE-${String(state.cases.length + 42).padStart(4, '0')}`,
              lastUpdated: new Date().toISOString(),
            },
            ...state.cases,
          ],
        })),

      // ── Navigation History ──────────────────────────────────────────────────
      // Each entry: { id, label, path, depth }
      navigationHistory: [
        { id: 'dashboard', label: 'Dashboard', path: '/', depth: 0 },
      ],

      pushNavHistory: (entry) =>
        set((state) => {
          // If clicking an existing entry (same path), truncate history there
          const existingIdx = state.navigationHistory.findIndex(
            (e) => e.path === entry.path
          );
          if (existingIdx !== -1) {
            return {
              navigationHistory: state.navigationHistory.slice(0, existingIdx + 1),
            };
          }
          return {
            navigationHistory: [...state.navigationHistory, entry],
          };
        }),

      truncateNavAt: (path) =>
        set((state) => {
          const idx = state.navigationHistory.findIndex((e) => e.path === path);
          if (idx === -1) return {};
          return {
            navigationHistory: state.navigationHistory.slice(0, idx + 1),
          };
        }),

      // ── Filters ─────────────────────────────────────────────────────────────
      filters: {
        search: '',
        status: 'all',
        investigator: 'all',
        dateRange: 'all',
      },

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      resetFilters: () =>
        set({
          filters: { search: '', status: 'all', investigator: 'all', dateRange: 'all' },
        }),
    }),
    {
      name: 'sentinel-store',
      // Only persist cases and navigationHistory
      partialize: (state) => ({
        cases: state.cases,
        navigationHistory: state.navigationHistory,
      }),
    }
  )
);
