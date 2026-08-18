import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CaseItem, NavEntry } from '../types/schema';
import { SEED_CASES } from '../data/mockData';

interface FilterState {
  search: string;
  status: string;
  investigator: string;
  dateRange: string;
}

interface PhishieldState {
  cases: CaseItem[];
  addCase: (newCase: Omit<CaseItem, 'id' | 'lastUpdated'>) => void;
  navigationHistory: NavEntry[];
  pushNavHistory: (entry: NavEntry) => void;
  truncateNavAt: (path: string) => void;
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string) => void;
  resetFilters: () => void;
}

export const usePhishieldStore = create<PhishieldState>()(
  persist(
    (set) => ({
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

      navigationHistory: [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', depth: 0 },
      ],

      pushNavHistory: (entry) =>
        set((state) => {
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
      name: 'phishield-store',
      partialize: (state) => ({
        cases: state.cases,
        navigationHistory: state.navigationHistory,
      }),
    }
  )
);
