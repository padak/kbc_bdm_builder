import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Table, TableType, PropertyType } from '../types/bdm';
import { useBDMStore } from '../store/bdmStore';

interface TablePropertiesProps {
  tableName: string;
}

export const TableProperties: React.FC<TablePropertiesProps> = ({ tableName }) => {
  const { currentBDM, updateTable, removeTable } = useBDMStore();
  const table = currentBDM?.tables.find((t: Table) => t.name === tableName);

  if (!table) return null;

  const handleTypeChange = (type: TableType) => {
    updateTable({ ...table, type });
  };

  const handleCommentChange = (comments: string) => {
    updateTable({ ...table, comments });
  };

  const handlePropertyTypeChange = (propertyName: string, type: PropertyType) => {
    const updatedProperties = table.properties.map((prop) =>
      prop.name === propertyName ? { ...prop, type } : prop
    );
    updateTable({ ...table, properties: updatedProperties });
  };

  const handlePropertyCommentChange = (propertyName: string, comments: string) => {
    const updatedProperties = table.properties.map((prop) =>
      prop.name === propertyName ? { ...prop, comments } : prop
    );
    updateTable({ ...table, properties: updatedProperties });
  };

  return (
    <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Table Properties
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={table.type}
            label="Type"
            onChange={(e: SelectChangeEvent<TableType>) => 
              handleTypeChange(e.target.value as TableType)
            }
          >
            <MenuItem value="Object">Object</MenuItem>
            <MenuItem value="Property">Property</MenuItem>
            <MenuItem value="Value">Value</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Comments"
          multiline
          rows={3}
          value={table.comments}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            handleCommentChange(e.target.value)
          }
        />
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Properties
      </Typography>

      <List>
        {table.properties.map((property) => (
          <ListItem
            key={property.name}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => {
                  // Implement property edit dialog
                }}
              >
                <EditIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={property.name}
              secondary={
                <Box>
                  <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                    <Select
                      value={property.type}
                      onChange={(e: SelectChangeEvent<PropertyType>) =>
                        handlePropertyTypeChange(
                          property.name,
                          e.target.value as PropertyType
                        )
                      }
                    >
                      <MenuItem value="Key">Key</MenuItem>
                      <MenuItem value="Property">Property</MenuItem>
                      <MenuItem value="Value">Value</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    placeholder="Comment"
                    value={property.comments || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handlePropertyCommentChange(property.name, e.target.value)
                    }
                  />
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 2 }}>
        <IconButton
          color="error"
          onClick={() => removeTable(table.name)}
          aria-label="delete table"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}; 