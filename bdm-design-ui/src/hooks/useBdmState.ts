import { useState, useCallback } from 'react';
import { KeboolaTable } from '../services/keboolaApi';

interface BdmState {
  bdmName: string;
  tables: {
    id: string;
    name: string;
    position: {
      x: number;
      y: number;
    };
    properties: {
      name: string;
      type: string;
      comments?: string;
    }[];
  }[];
  relationships: {
    from: string;
    to: string;
    type: string;
  }[];
}

interface UseBdmStateProps {
  initialName?: string;
}

export const useBdmState = ({ initialName = 'New BDM' }: UseBdmStateProps = {}) => {
  const [state, setState] = useState<BdmState>({
    bdmName: initialName,
    tables: [],
    relationships: [],
  });

  const updateTablePosition = useCallback((tableId: string, position: { x: number; y: number }) => {
    setState(prev => ({
      ...prev,
      tables: prev.tables.map(table => 
        table.id === tableId 
          ? { ...table, position }
          : table
      ),
    }));
  }, []);

  const addTable = useCallback((table: KeboolaTable, position: { x: number; y: number }) => {
    setState(prev => ({
      ...prev,
      tables: [
        ...prev.tables,
        {
          id: table.id,
          name: table.displayName || table.name,
          position,
          properties: (table.columns || []).map(col => ({
            name: col.name,
            type: col.type,
          })),
        },
      ],
    }));
  }, []);

  const removeTable = useCallback((tableId: string) => {
    setState(prev => ({
      ...prev,
      tables: prev.tables.filter(table => table.id !== tableId),
      relationships: prev.relationships.filter(rel => 
        rel.from !== tableId && rel.to !== tableId
      ),
    }));
  }, []);

  const addRelationship = useCallback((from: string, to: string, type: string = 'default') => {
    setState(prev => ({
      ...prev,
      relationships: [
        ...prev.relationships,
        { from, to, type },
      ],
    }));
  }, []);

  const removeRelationship = useCallback((from: string, to: string) => {
    setState(prev => ({
      ...prev,
      relationships: prev.relationships.filter(rel => 
        !(rel.from === from && rel.to === to)
      ),
    }));
  }, []);

  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem('bdm-state', JSON.stringify(state));
      return true;
    } catch (error) {
      console.error('Failed to save BDM state:', error);
      return false;
    }
  }, [state]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedState = localStorage.getItem('bdm-state');
      if (savedState) {
        setState(JSON.parse(savedState));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load BDM state:', error);
      return false;
    }
  }, []);

  const exportState = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importState = useCallback((jsonState: string) => {
    try {
      const newState = JSON.parse(jsonState);
      setState(newState);
      return true;
    } catch (error) {
      console.error('Failed to import BDM state:', error);
      return false;
    }
  }, []);

  return {
    state,
    updateTablePosition,
    addTable,
    removeTable,
    addRelationship,
    removeRelationship,
    saveToLocalStorage,
    loadFromLocalStorage,
    exportState,
    importState,
  };
}; 