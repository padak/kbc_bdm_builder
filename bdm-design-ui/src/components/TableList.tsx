import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { KeboolaTable } from '../services/keboolaApi';

interface TableListProps {
  tables: KeboolaTable[];
  onTableSelect: (table: KeboolaTable) => void;
  onTableAdd: (table: KeboolaTable) => void;
  selectedTables: string[];
}

export const TableList: React.FC<TableListProps> = ({
  tables,
  onTableSelect,
  onTableAdd,
  selectedTables,
}) => {
  if (!tables || tables.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Available Tables
        </Typography>
        <Typography color="text.secondary">
          No tables available
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Available Tables ({tables.length})
      </Typography>
      <List>
        {tables.map((table) => {
          const isSelected = selectedTables.includes(table.id);
          return (
            <ListItem
              key={table.id}
              disablePadding
              secondaryAction={
                <Tooltip title={isSelected ? "Remove from BDM" : "Add to BDM"}>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onTableAdd(table)}
                  >
                    {isSelected ? <RemoveIcon /> : <AddIcon />}
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemButton 
                onClick={() => onTableSelect(table)}
                selected={isSelected}
              >
                <ListItemText
                  primary={table.displayName || table.name}
                  secondary={`${table.columns?.length || 0} columns`}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}; 