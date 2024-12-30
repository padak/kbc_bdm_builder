import { create } from 'zustand';
import { KeboolaBucket, KeboolaTable } from '../services/keboolaApi';

interface BDMStore {
  isConnected: boolean;
  buckets: KeboolaBucket[];
  selectedBucket: KeboolaBucket | null;
  tables: KeboolaTable[];
  selectedTable: KeboolaTable | null;
  bdmTables: KeboolaTable[];
  isLoading: boolean;
  error: string | null;
  setConnection: (isConnected: boolean) => void;
  setBuckets: (buckets: KeboolaBucket[]) => void;
  setSelectedBucket: (bucket: KeboolaBucket | null) => void;
  setTables: (tables: KeboolaTable[]) => void;
  setSelectedTable: (table: KeboolaTable | null) => void;
  addToBDM: (table: KeboolaTable) => void;
  removeFromBDM: (tableId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBDMStore = create<BDMStore>((set) => ({
  isConnected: false,
  buckets: [],
  selectedBucket: null,
  tables: [],
  selectedTable: null,
  bdmTables: [],
  isLoading: false,
  error: null,
  setConnection: (isConnected) => set({ isConnected }),
  setBuckets: (buckets) => set({ buckets: buckets || [] }),
  setSelectedBucket: (bucket) => set({ selectedBucket: bucket }),
  setTables: (tables) => set({ tables: tables || [] }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  addToBDM: (table) =>
    set((state) => ({
      bdmTables: [...state.bdmTables, { ...table }],
    })),
  removeFromBDM: (tableId) =>
    set((state) => ({
      bdmTables: state.bdmTables.filter((t) => t.id !== tableId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})); 