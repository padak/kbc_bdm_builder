import React from 'react';
import { Box, Typography, Portal } from '@mui/material';
import { KeboolaTable } from '../services/keboolaApi';

interface DebugPanelProps {
  tables: KeboolaTable[];
  bdmTables: KeboolaTable[];
  selectedTableDetails: KeboolaTable | null;
  isLoading: boolean;
  error: string | null;
  debugLogs: string[];
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  tables,
  bdmTables,
  selectedTableDetails,
  isLoading,
  error,
  debugLogs,
}) => {
  return (
    <Portal>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
          bgcolor: '#000',
          color: '#fff',
          p: 3,
          zIndex: 9999999,
          border: '2px solid #f50057',
          borderRadius: '8px',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: '#f50057' }}>
          Debug Information
        </Typography>

        <Typography variant="h6" sx={{ mb: 1, color: '#2196f3' }}>
          State
        </Typography>
        <Box sx={{ mb: 3, pl: 2 }}>
          <div>Tables Count: {tables.length}</div>
          <div>BDM Tables Count: {bdmTables.length}</div>
          <div>Selected Table: {selectedTableDetails?.id || 'none'}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Error: {error || 'none'}</div>
        </Box>

        <Typography variant="h6" sx={{ mb: 1, color: '#2196f3' }}>
          BDM Tables
        </Typography>
        <Box sx={{ mb: 3, pl: 2 }}>
          {bdmTables.map(table => (
            <div key={table.id}>{table.id}</div>
          ))}
          {bdmTables.length === 0 && <div>No tables in BDM</div>}
        </Box>

        <Typography variant="h6" sx={{ mb: 1, color: '#2196f3' }}>
          Recent Events
        </Typography>
        <Box sx={{ pl: 2 }}>
          {debugLogs.map((log, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              {log}
            </div>
          ))}
          {debugLogs.length === 0 && <div>No events logged</div>}
        </Box>
      </Box>
    </Portal>
  );
}; 