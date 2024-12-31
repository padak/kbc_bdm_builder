import { create } from 'zustand';
import { KeboolaTable, KeboolaBucket } from '../services/keboolaApi';

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
  removeTable: (tableId: string) => void;
  currentBDM: KeboolaTable | null;
}

export const useBDMStore = create<BDMStore>((set) => ({
  // Connection state
  isConnected: false,
  setConnection: (connected) => set({ isConnected: connected }),

  // Loading and error states
  isLoading: false,
  error: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Buckets
  buckets: [],
  selectedBucket: null,
  setBuckets: (buckets) => set({ buckets }),
  setSelectedBucket: (bucket) => set({ selectedBucket: bucket }),

  // Tables
  tables: [],
  bdmTables: [],
  currentBDM: null,
  setTables: (tables) => set({ tables }),
  addToBDM: (table) => set((state) => ({
    bdmTables: [...state.bdmTables, table],
  })),
  removeFromBDM: (tableId) => set((state) => ({
    bdmTables: state.bdmTables.filter((t) => t.id !== tableId),
  })),
  updateTable: (tableId, updates) => set((state) => ({
    bdmTables: state.bdmTables.map((table) =>
      table.id === tableId ? { ...table, ...updates } : table
    ),
  })),
  removeTable: (tableId) => set((state) => ({
    bdmTables: state.bdmTables.filter((t) => t.id !== tableId),
  })),
})); 