import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { KeboolaTable, KeboolaMetadata } from '../services/keboolaApi';

interface TableDetailsPanelProps {
  table: KeboolaTable | null;
  onClose: () => void;
  isLoading?: boolean;
}

interface ColumnData {
  name: string;
  type: string;
  nullable: boolean;
  length: string;
  basetype: string;
  description?: string;
}

export const TableDetailsPanel: React.FC<TableDetailsPanelProps> = ({ 
  table, 
  onClose,
  isLoading = false,
}) => {
  if (!table) return null;

  // Map the columns with their metadata from the definition
  const columns = table.definition?.columns?.map((col): ColumnData => {
    const metadata = table.columnMetadata?.[col.name] || [];
    const description = metadata.find((m: KeboolaMetadata) => m.key === 'KBC.description')?.value;
    
    return {
      name: col.name,
      type: col.definition.type,
      nullable: col.definition.nullable,
      length: col.definition.length || '',
      basetype: col.basetype,
      description: description
    };
  }) || [];

  const formatDataType = (column: ColumnData) => {
    let type = `${column.type}`;
    if (column.length) {
      type += ` (${column.length})`;
    }
    if (column.basetype && column.basetype !== column.type) {
      type += ` [${column.basetype}]`;
    }
    if (column.nullable) {
      type += ', Nullable';
    }
    return type || '(Not specified)';
  };

  return (
    <Box
      sx={{
        width: 400,
        height: '100%',
        position: 'fixed',
        right: 0,
        top: 64,
        zIndex: 2,
        bgcolor: 'background.paper',
        borderLeft: '1px solid #e0e0e0',
        boxShadow: '-2px 0 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Table Details
        </Typography>
        <Tooltip title="Close">
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {table.displayName || table.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {table.id}
        </Typography>
        {table.metadata?.find((m: KeboolaMetadata) => m.key === 'KBC.description')?.value && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {table.metadata.find((m: KeboolaMetadata) => m.key === 'KBC.description')?.value}
          </Typography>
        )}
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Properties
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label={`${columns.length} columns`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={table.primaryKey?.length ? 'Has Primary Key' : 'No Primary Key'}
            size="small"
            variant="outlined"
            color={table.primaryKey?.length ? 'primary' : 'default'}
          />
        </Box>
        {table.primaryKey?.length ? (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Primary Key:
            </Typography>
            <Typography variant="body2">
              {table.primaryKey.join(', ')}
            </Typography>
          </Box>
        ) : null}
      </Box>
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Column Name</TableCell>
                  <TableCell>Data Type</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {columns.map((column, index) => (
                  <TableRow key={`${table.id}-${column.name}-${index}`}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" component="span">
                          {column.name}
                        </Typography>
                        {table.primaryKey?.includes(column.name) && (
                          <Chip
                            label="PK"
                            size="small"
                            color="primary"
                            sx={{ height: 16, '& .MuiChip-label': { px: 1, fontSize: '0.625rem' } }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" component="span">
                        {formatDataType(column)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" component="span">
                        {column.description || 'No description'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}; 