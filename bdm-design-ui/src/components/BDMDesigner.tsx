import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Toolbar,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useBDMStore } from '../store/bdmStore';
import { keboolaApi } from '../services/keboolaApi';
import { BDMGraph } from './BDMGraph';

const DRAWER_WIDTH = 300;

export const BDMDesigner: React.FC = () => {
  const {
    setConnection,
    buckets,
    selectedBucket,
    tables,
    selectedTable,
    bdmTables,
    isLoading,
    error,
    setSelectedBucket,
    setTables,
    setSelectedTable,
    addToBDM,
    removeFromBDM,
    setError,
    setLoading,
  } = useBDMStore();

  useEffect(() => {
    // Select first bucket by default if none is selected
    if (buckets.length > 0 && !selectedBucket) {
      handleBucketSelect(buckets[0]);
    }
  }, [buckets, selectedBucket]);

  const handleBucketSelect = async (bucket: typeof selectedBucket) => {
    if (!bucket || isLoading) return;
    
    setSelectedBucket(bucket);
    setError(null);
    setLoading(true);
    
    try {
      const fetchedTables = await keboolaApi.listTables(bucket.id);
      setTables(fetchedTables);
    } catch (err) {
      setError('Failed to fetch tables from the selected bucket');
      console.error('Error fetching tables:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnection(false);
    setSelectedBucket(null);
    setTables([]);
    setSelectedTable(null);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Keboola Tables
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleDisconnect}
              disabled={isLoading}
            >
              Disconnect
            </Button>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Buckets ({buckets.length})
          </Typography>
          <List>
            {buckets.map((bucket) => (
              <ListItem key={bucket.id} disablePadding>
                <ListItemButton
                  selected={selectedBucket?.id === bucket.id}
                  onClick={() => handleBucketSelect(bucket)}
                  disabled={isLoading}
                >
                  <ListItemText
                    primary={bucket.name}
                    secondary={bucket.description || bucket.stage}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          {selectedBucket && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                  Tables in {selectedBucket.name} ({tables.length})
                </Typography>
                {isLoading && <CircularProgress size={20} sx={{ ml: 1 }} />}
              </Box>
              <List>
                {tables.map((table) => {
                  const isInBDM = bdmTables.some(t => t.id === table.id);
                  return (
                    <ListItem
                      key={table.id}
                      disablePadding
                      secondaryAction={
                        <Tooltip title={isInBDM ? "Remove from BDM" : "Add to BDM"}>
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={() => isInBDM ? removeFromBDM(table.id) : addToBDM(table)}
                            disabled={isLoading}
                          >
                            {isInBDM ? <RemoveIcon /> : <AddIcon />}
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemButton
                        selected={selectedTable?.id === table.id}
                        onClick={() => setSelectedTable(table)}
                        disabled={isLoading}
                      >
                        <ListItemText
                          primary={table.displayName || table.name}
                          secondary={`${table.columns.length} columns`}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100%',
          position: 'relative',
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Toolbar />
        {bdmTables.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100% - 64px)',
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6" gutterBottom>
              No tables in BDM
            </Typography>
            <Typography variant="body2">
              Click the + button next to a table to add it to your BDM
            </Typography>
          </Box>
        ) : (
          <BDMGraph
            tables={bdmTables}
            onTableSelect={setSelectedTable}
          />
        )}
      </Box>
    </Box>
  );
}; 