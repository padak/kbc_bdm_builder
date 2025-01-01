import React, { useState, useCallback, useEffect } from 'react';
import { Box, Button, IconButton, Tooltip, CircularProgress, Alert } from '@mui/material';
import { Save as SaveIcon, Upload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { KeboolaTable, KeboolaBucket, keboolaApi } from '../services/keboolaApi';
import { BDMGraph } from './BDMGraph';
import { TableList } from './TableList';
import { TableDetailsPanel } from './TableDetailsPanel';
import { BucketSelector } from './BucketSelector';
import { useBdmState } from '../hooks/useBdmState';
import { useBDMStore } from '../store/bdmStore';

interface BDMDesignerProps {
  tables: KeboolaTable[];
  isLoading?: boolean;
  error?: string | null;
}

export const BDMDesigner: React.FC<BDMDesignerProps> = ({ 
  tables = [], 
  isLoading = false,
  error = null,
}) => {
  const [selectedTable, setSelectedTable] = useState<KeboolaTable | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const {
    state,
    addTable,
    removeTable,
    updateTablePosition,
    addRelationship,
    removeRelationship,
    saveToLocalStorage,
    loadFromLocalStorage,
    exportState,
    importState,
  } = useBdmState();

  const {
    buckets,
    selectedBucket,
    setSelectedBucket,
    setTables,
    setLoading,
    setError,
  } = useBDMStore();

  const handleBucketSelect = useCallback(async (bucket: KeboolaBucket) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTables = await keboolaApi.listTables(bucket.id);
      console.log('Fetched tables:', fetchedTables);
      setTables(fetchedTables);
      setSelectedBucket(bucket);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
      setError('Failed to load tables from the selected bucket');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setTables, setSelectedBucket]);

  // Load saved state on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const handleTableSelect = useCallback((table: KeboolaTable) => {
    console.log('Selected table:', table);
    setSelectedTable(table);
    setIsDetailsPanelOpen(true);
  }, []);

  const handleTableAdd = useCallback(async (table: KeboolaTable) => {
    try {
      setLoading(true);
      const position = {
        x: Math.random() * 500,
        y: Math.random() * 500,
      };
      addTable(table, position);
    } catch (err) {
      console.error('Failed to add table:', err);
      setError('Failed to add table to BDM');
    } finally {
      setLoading(false);
    }
  }, [addTable, setLoading, setError]);

  const handleCreateRelation = useCallback((sourceId: string, targetId: string) => {
    addRelationship(sourceId, targetId);
  }, [addRelationship]);

  const handleSave = useCallback(() => {
    if (saveToLocalStorage()) {
      // TODO: Show success notification
      console.log('BDM state saved successfully');
    } else {
      // TODO: Show error notification
      console.error('Failed to save BDM state');
    }
  }, [saveToLocalStorage]);

  const handleExport = useCallback(() => {
    const state = exportState();
    const blob = new Blob([state], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bdm-state.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportState]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (importState(content)) {
            // TODO: Show success notification
            console.log('BDM state imported successfully');
          } else {
            // TODO: Show error notification
            console.error('Failed to import BDM state');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [importState]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', p: 2 }}>
        <BucketSelector
          buckets={buckets}
          selectedBucket={selectedBucket}
          onBucketSelect={handleBucketSelect}
        />
        <TableList 
          tables={tables} 
          onTableSelect={handleTableSelect}
          onTableAdd={handleTableAdd}
          selectedTables={state.tables.map(t => t.id)}
        />
      </Box>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
          <Tooltip title="Save">
            <IconButton onClick={handleSave}>
              <SaveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export">
            <IconButton onClick={handleExport}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Import">
            <IconButton onClick={handleImport}>
              <UploadIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <BDMGraph
          tables={state.tables}
          onTableSelect={handleTableSelect}
          onCreateRelation={handleCreateRelation}
          isDetailsPanelOpen={isDetailsPanelOpen}
        />
      </Box>
      {selectedTable && (
        <TableDetailsPanel
          table={selectedTable}
          onClose={() => setIsDetailsPanelOpen(false)}
          isOpen={isDetailsPanelOpen}
        />
      )}
    </Box>
  );
}; 