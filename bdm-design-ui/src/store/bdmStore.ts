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
  setConnection: (status: boolean) => void;
  setBuckets: (buckets: KeboolaBucket[]) => void;
  setSelectedBucket: (bucket: KeboolaBucket | null) => void;
  setTables: (tables: KeboolaTable[]) => void;
  setSelectedTable: (table: KeboolaTable | null) => void;
  addToBDM: (table: KeboolaTable) => void;
  removeFromBDM: (tableId: string) => void;
  setLoading: (status: boolean) => void;
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
  setConnection: (status: boolean) => set({ isConnected: status }),
  setBuckets: (buckets: KeboolaBucket[]) => set({ buckets }),
  setSelectedBucket: (bucket: KeboolaBucket | null) => set({ selectedBucket: bucket }),
  setTables: (tables: KeboolaTable[]) => set({ tables }),
  setSelectedTable: (table: KeboolaTable | null) => set({ selectedTable: table }),
  addToBDM: (table: KeboolaTable) => 
    set((state) => ({
      bdmTables: state.bdmTables.some(t => t.id === table.id)
        ? state.bdmTables
        : [...state.bdmTables, table]
    })),
  removeFromBDM: (tableId: string) =>
    set((state) => ({
      bdmTables: state.bdmTables.filter(t => t.id !== tableId)
    })),
  setLoading: (status: boolean) => set({ isLoading: status }),
  setError: (error: string | null) => set({ error }),
})); 