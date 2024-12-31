import { create } from 'zustand';
import { KeboolaTable, KeboolaBucket } from '../services/keboolaApi';
import debug from '../utils/debug';

interface BDMStore {
  // Connection state
  isConnected: boolean;
  setConnection: (connected: boolean) => void;

  // Loading and error states
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Buckets
  buckets: KeboolaBucket[];
  selectedBucket: KeboolaBucket | null;
  setBuckets: (buckets: KeboolaBucket[]) => void;
  setSelectedBucket: (bucket: KeboolaBucket | null) => void;

  // Tables
  tables: KeboolaTable[];
  bdmTables: KeboolaTable[];
  setTables: (tables: KeboolaTable[]) => void;
  addToBDM: (table: KeboolaTable) => void;
  removeFromBDM: (tableId: string) => void;
  updateTable: (tableId: string, updates: Partial<KeboolaTable>) => void;
  currentBDM: KeboolaTable | null;
}

// Force immediate logging
console.error('%c[DEBUG-STORE]', 'color: green; font-weight: bold', 'BDMStore module loaded at', new Date().toISOString());

export const useBDMStore = create<BDMStore>((set) => ({
  // Connection state
  isConnected: false,
  setConnection: (isConnected) => {
    debug.log('Setting connection state:', isConnected);
    set({ isConnected });
  },

  // Loading and error states
  isLoading: false,
  error: null,
  setLoading: (isLoading) => {
    debug.log('Setting loading state:', isLoading);
    set({ isLoading });
  },
  setError: (error) => {
    debug.log('Setting error:', error);
    set({ error });
  },

  // Buckets
  buckets: [],
  selectedBucket: null,
  setBuckets: (buckets) => {
    debug.log('Setting buckets:', buckets.map(b => b.id));
    set({ buckets });
  },
  setSelectedBucket: (bucket) => {
    debug.log('Setting selected bucket:', bucket?.id);
    set({ selectedBucket: bucket });
  },

  // Tables
  tables: [],
  bdmTables: [],
  currentBDM: null,
  setTables: (tables) => {
    debug.log('Setting tables:', tables.map(t => t.id));
    set({ tables });
  },
  addToBDM: (table) => {
    debug.log('Adding table to BDM:', table.id);
    set((state) => {
      const existingIndex = state.bdmTables.findIndex((t) => t.id === table.id);
      if (existingIndex >= 0) {
        debug.log('Updating existing table in BDM:', table.id);
        const newTables = [...state.bdmTables];
        newTables[existingIndex] = table;
        return { bdmTables: newTables };
      } else {
        debug.log('Adding new table to BDM:', table.id);
        return { bdmTables: [...state.bdmTables, table] };
      }
    });
  },
  removeFromBDM: (tableId) => {
    debug.log('Removing table from BDM:', tableId);
    set((state) => ({
      bdmTables: state.bdmTables.filter((t) => t.id !== tableId),
    }));
  },
  updateTable: (tableId, updates) => set((state) => ({
    bdmTables: state.bdmTables.map((table) =>
      table.id === tableId ? { ...table, ...updates } : table
    )
  }))
})); 