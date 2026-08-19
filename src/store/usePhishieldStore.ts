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
  updateCase: (id: string, updates: Partial<CaseItem>) => void;
  updateBulkCases: (ids: string[], updates: Partial<CaseItem>) => void;
  deleteCase: (id: string) => void;
  deleteBulkCases: (ids: string[]) => void;
  restoreCase: (caseItem: CaseItem, index?: number) => void;
  restoreBulkCases: (caseItems: CaseItem[]) => void;
  
  hasRequestedAccess: boolean;
  setHasRequestedAccess: (hasRequested: boolean) => void;
  
  navigationHistory: NavEntry[];
  pushNavHistory: (entry: NavEntry) => void;
  truncateNavAt: (path: string) => void;
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string) => void;
  resetFilters: () => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const usePhishieldStore = create<PhishieldState>()(
  persist(
    (set) => ({
      hasRequestedAccess: false,
      setHasRequestedAccess: (hasRequested) => set({ hasRequestedAccess: hasRequested }),

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

      updateCase: (id, updates) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            c.id === id
              ? { ...c, ...updates, lastUpdated: new Date().toISOString() }
              : c
          ),
        })),

      updateBulkCases: (ids, updates) =>
        set((state) => ({
          cases: state.cases.map((c) =>
            ids.includes(c.id)
              ? { ...c, ...updates, lastUpdated: new Date().toISOString() }
              : c
          ),
        })),

      deleteCase: (id) =>
        set((state) => ({
          cases: state.cases.filter((c) => c.id !== id),
        })),

      deleteBulkCases: (ids) =>
        set((state) => ({
          cases: state.cases.filter((c) => !ids.includes(c.id)),
        })),

      restoreCase: (caseItem, index) =>
        set((state) => {
          const newCases = [...state.cases];
          if (typeof index === 'number' && index >= 0 && index <= newCases.length) {
            newCases.splice(index, 0, caseItem);
          } else {
            newCases.unshift(caseItem);
          }
          return { cases: newCases };
        }),

      restoreBulkCases: (caseItems) =>
        set((state) => ({
          cases: [...caseItems, ...state.cases],
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

      sidebarCollapsed: false,
      toggleSidebarCollapse: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed: boolean) =>
        set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'phishield-store',
      partialize: (state) => ({
        cases: state.cases,
        navigationHistory: state.navigationHistory,
        sidebarCollapsed: state.sidebarCollapsed,
        hasRequestedAccess: state.hasRequestedAccess,
      }),
    }
  )
);
