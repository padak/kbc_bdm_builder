import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { KeboolaTable, KeboolaColumn, KeboolaMetadata } from '../services/keboolaApi';

interface TableDetailsPanelProps {
  table: KeboolaTable | null;
  onClose: () => void;
  isOpen: boolean;
}

export const TableDetailsPanel: React.FC<TableDetailsPanelProps> = ({
  table,
  onClose,
  isOpen,
}) => {
  if (!table) return null;

  const renderColumnType = (column: KeboolaColumn) => {
    const type = column.definition?.type || column.type;
    const nullable = column.definition?.nullable;
    const length = column.definition?.length;
    const basetype = column.basetype;

    return (
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          Type: {type}{length ? `(${length})` : ''}{nullable ? ' (nullable)' : ' (not null)'}
        </Typography>
        {basetype && basetype !== type && (
          <Typography variant="body2" color="text.secondary">
            Base Type: {basetype}
          </Typography>
        )}
      </Box>
    );
  };

  const getTableDescription = () => {
    if (!table.metadata) return null;
    const descMeta = table.metadata.find(m => m.key === 'KBC.description' || m.key === 'description');
    return descMeta?.value;
  };

  const getColumnDescription = (columnName: string) => {
    if (!table.columnMetadata || !table.columnMetadata[columnName]) return null;
    const descMeta = table.columnMetadata[columnName].find(m => m.key === 'KBC.description' || m.key === 'description');
    return descMeta?.value;
  };

  const getColumnMetadata = (columnName: string) => {
    if (!table.columnMetadata || !table.columnMetadata[columnName]) return [];
    return table.columnMetadata[columnName].filter(m => !m.key.startsWith('KBC.') && m.key !== 'description');
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      variant="persistent"
      sx={{
        width: 400,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {table.displayName || table.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          ID: {table.id}
        </Typography>

        {getTableDescription() && (
          <Paper variant="outlined" sx={{ p: 1.5, mt: 2, bgcolor: 'background.default' }}>
            <Typography variant="body2">
              {getTableDescription()}
            </Typography>
          </Paper>
        )}

        {table.primaryKey && table.primaryKey.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Primary Key
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {table.primaryKey.map((key) => (
                <Chip key={`pk-${key}`} label={key} size="small" />
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Columns ({table.columns?.length || 0})
        </Typography>
        <List dense>
          {table.columns?.map((column, index) => {
            if (!column || !column.name) {
              console.warn('Found column without name:', column);
              return null;
            }
            const columnMeta = getColumnMetadata(column.name);
            return (
              <ListItem
                key={`col-${column.name}-${index}`}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  py: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {column.name}
                  </Typography>
                  {table.primaryKey?.includes(column.name) && (
                    <Chip label="PK" size="small" color="primary" />
                  )}
                </Box>
                {renderColumnType(column)}
                {getColumnDescription(column.name) && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 0.5, 
                      color: 'text.secondary', 
                      fontStyle: 'italic',
                      pl: 1,
                      borderLeft: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {getColumnDescription(column.name)}
                  </Typography>
                )}
                {columnMeta.length > 0 && (
                  <Box sx={{ mt: 1, width: '100%' }}>
                    <List dense disablePadding>
                      {columnMeta.map((meta, metaIndex) => (
                        <ListItem 
                          key={`${column.name}-meta-${meta.key || metaIndex}`} 
                          sx={{ py: 0 }}
                        >
                          <ListItemText
                            primary={
                              <Typography variant="caption" color="text.secondary">
                                {meta.key}: {meta.value}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </ListItem>
            );
          }).filter(Boolean)}
        </List>

        {table.metadata && table.metadata.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Metadata
            </Typography>
            <List dense>
              {table.metadata
                .filter(meta => !meta.key.startsWith('KBC.'))
                .map((meta) => (
                <ListItem key={`table-meta-${meta.key}`}>
                  <ListItemText
                    primary={meta.key}
                    secondary={meta.value}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
}; 