import React, { useEffect, useState } from 'react';
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
  TextField,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Search as SearchIcon } from '@mui/icons-material';
import { useBDMStore } from '../store/bdmStore';
import { BDMGraph } from './BDMGraph';
import { keboolaApi, KeboolaBucket, KeboolaTable } from '../services/keboolaApi';

const DRAWER_WIDTH = 300;

export const BDMDesigner: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableDetails, setSelectedTableDetails] = useState<KeboolaTable | null>(null);
  const {
    buckets,
    selectedBucket,
    tables,
    bdmTables,
    isLoading,
    error,
    setConnection,
    setBuckets,
    setSelectedBucket,
    setTables,
    addToBDM,
    removeFromBDM,
    setError,
    setLoading,
  } = useBDMStore();

  useEffect(() => {
    // Select first bucket by default if none is selected
    if (buckets.length > 0 && !selectedBucket) {
      console.log('Selecting first bucket:', buckets[0]);
      handleBucketSelect(buckets[0]);
    }
  }, [buckets, selectedBucket]);

  const handleBucketSelect = async (bucket: KeboolaBucket | null) => {
    if (!bucket || isLoading) return;
    
    console.log('Selecting bucket:', bucket);
    setSelectedBucket(bucket);
    setError(null);
    setLoading(true);
    
    try {
      // Fetch tables with full details
      const fetchedTables = await keboolaApi.listTables(bucket.id);
      console.log('Received tables with details:', fetchedTables);
      
      // Use the tables directly since they already have full details
      setTables(fetchedTables);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Failed to fetch tables from the selected bucket');
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    // Clear all stored data
    setConnection(false);
    setSelectedBucket(null);
    setTables([]);
    setSelectedTableDetails(null);
    setBuckets([]);
    setError(null);
  };

  // Filter tables based on search query
  const filteredTables = tables.filter((table) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      table.name.toLowerCase().includes(searchLower) ||
      table.displayName?.toLowerCase().includes(searchLower) ||
      false
    );
  });

  const handleTableAdd = async (table: KeboolaTable) => {
    try {
      setLoading(true);
      const tableDetail = await keboolaApi.getTableDetail(table.id);
      console.log('Adding table to BDM with details:', tableDetail);
      addToBDM(tableDetail);
    } catch (err) {
      console.error('Failed to fetch table details:', err);
      setError('Failed to fetch table details');
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = async (table: KeboolaTable | null) => {
    if (!table) {
      setSelectedTableDetails(null);
      return;
    }

    try {
      setLoading(true);
      const tableDetail = await keboolaApi.getTableDetail(table.id);
      setSelectedTableDetails(tableDetail);
    } catch (err) {
      console.error('Failed to fetch table details:', err);
      setError('Failed to fetch table details');
      setSelectedTableDetails(table);
    } finally {
      setLoading(false);
    }
  };

  console.log('Current state:', {
    buckets: buckets.length,
    selectedBucket: selectedBucket?.name,
    tables: tables.length,
    bdmTables: bdmTables.length,
    isLoading,
    error,
  });

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
        <Box sx={{ overflow: 'auto', height: '100%' }}>
          <Toolbar />
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Keboola Storage
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
            <Typography variant="subtitle2" gutterBottom>
              Buckets ({buckets.length})
            </Typography>
            <List dense>
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
          </Box>
          {error && (
            <Alert severity="error" sx={{ mx: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          {selectedBucket && (
            <>
              <Divider />
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tables in {selectedBucket.name} ({tables.length})
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search tables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <List dense>
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    filteredTables.map((table) => {
                      const isInBDM = bdmTables.some((t) => t.id === table.id);
                      return (
                        <ListItem
                          key={table.id}
                          disablePadding
                          secondaryAction={
                            <Tooltip title={isInBDM ? "Remove from BDM" : "Add to BDM"}>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={async () => {
                                  if (isInBDM) {
                                    removeFromBDM(table.id);
                                  } else {
                                    try {
                                      setLoading(true);
                                      const tableDetail = await keboolaApi.getTableDetail(table.id);
                                      addToBDM(tableDetail);
                                    } catch (err) {
                                      console.error('Failed to fetch table details:', err);
                                      setError('Failed to fetch table details');
                                    } finally {
                                      setLoading(false);
                                    }
                                  }
                                }}
                                disabled={isLoading}
                              >
                                {isInBDM ? <RemoveIcon /> : <AddIcon />}
                              </IconButton>
                            </Tooltip>
                          }
                        >
                          <ListItemButton
                            selected={selectedTableDetails?.id === table.id}
                            onClick={() => handleTableSelect(table)}
                            disabled={isLoading}
                          >
                            <ListItemText
                              primary={table.displayName || table.name}
                              secondary={table.id}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })
                  )}
                </List>
              </Box>
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
            onTableSelect={handleTableSelect}
            isDetailsPanelOpen={selectedTableDetails !== null}
          />
        )}
      </Box>
    </Box>
  );
}; 