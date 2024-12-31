import React from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { KeboolaTable } from '../services/keboolaApi';
import { useBDMStore } from '../store/bdmStore';

interface TablePropertiesProps {
  table: KeboolaTable;
}

export const TableProperties: React.FC<TablePropertiesProps> = ({ table }) => {
  const { updateTable, removeTable } = useBDMStore();

  const handlePropertyChange = (property: keyof KeboolaTable, value: string) => {
    updateTable(table.id, { [property]: value });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Table Properties
        </Typography>
        <IconButton
          onClick={() => removeTable(table.id)}
          size="small"
          color="error"
          title="Remove table"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
      <TextField
        fullWidth
        label="Display Name"
        value={table.displayName || ''}
        onChange={(e) => handlePropertyChange('displayName', e.target.value)}
        margin="normal"
        size="small"
      />
      <TextField
        fullWidth
        label="Description"
        value={table.description || ''}
        onChange={(e) => handlePropertyChange('description', e.target.value)}
        margin="normal"
        size="small"
        multiline
        rows={3}
      />
    </Box>
  );
}; 