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
import debug from '../utils/debug';
import { DebugPanel } from './DebugPanel';

// Force immediate logging
console.error('%c[DEBUG-DESIGNER]', 'color: purple; font-weight: bold', 'BDMDesigner module loaded at', new Date().toISOString());

const DRAWER_WIDTH = 300;

export const BDMDesigner: React.FC = () => {
  // Force immediate component logging
  console.error('%c[DEBUG-DESIGNER]', 'color: purple; font-weight: bold', 'BDMDesigner component rendering at', new Date().toISOString());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableDetails, setSelectedTableDetails] = useState<KeboolaTable | null>(null);
  // Add debug state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Debug log function
  const addDebugLog = (message: string) => {
    console.error('DEBUG:', message); // Direct console log
    setDebugLogs(prev => [...prev, `${new Date().toISOString()} - ${message}`].slice(-10));
  };

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
    debug.log('BDMDesigner mounted');
    return () => debug.log('BDMDesigner unmounted');
  }, []);

  useEffect(() => {
    // Select first bucket by default if none is selected
    if (buckets.length > 0 && !selectedBucket) {
      debug.log('Selecting first bucket:', buckets[0]);
      handleBucketSelect(buckets[0]);
    }
  }, [buckets, selectedBucket]);

  const handleBucketSelect = async (bucket: typeof selectedBucket) => {
    // Immediate logging in the bucket selection handler
    console.error('CLICK EVENT - Bucket selected:', bucket?.id);
    
    if (!bucket || isLoading) {
      console.error('CLICK EVENT - Bucket selection cancelled:', { bucket: bucket?.id, isLoading });
      return;
    }
    
    setSelectedBucket(bucket);
    setError(null);
    setLoading(true);
    
    try {
      console.error('CLICK EVENT - Fetching tables for bucket:', bucket.id);
      // First get the list of tables
      const basicTables = await keboolaApi.listTables(bucket.id);
      console.error('CLICK EVENT - Basic tables fetched:', basicTables.map(t => t.id));
      
      // Then fetch full details for all tables in parallel
      console.error('CLICK EVENT - Fetching details for tables');
      const tablesWithDetails = await Promise.all(
        basicTables.map(async (table) => {
          try {
            console.error('CLICK EVENT - Fetching details for table:', table.id);
            return await keboolaApi.getTableDetail(table.id);
          } catch (err) {
            console.error('CLICK EVENT - Failed to fetch details for table:', table.id, err);
            setError(`Failed to fetch details for table ${table.name}`);
            return {
              ...table,
              columns: [],
              definition: { columns: [], primaryKeysNames: [] }
            };
          }
        })
      );
      
      // Filter out tables that failed to load
      const validTables = tablesWithDetails.filter(table => table.columns && table.columns.length > 0);
      console.error('CLICK EVENT - Setting valid tables:', validTables.map(t => t.id));
      setTables(validTables);
      
      if (validTables.length === 0) {
        console.error('CLICK EVENT - No valid tables found');
        setError('No valid tables found in the selected bucket');
      } else if (validTables.length < basicTables.length) {
        console.error('CLICK EVENT - Some tables failed to load:', {
          valid: validTables.length,
          total: basicTables.length
        });
        setError('Some tables failed to load completely');
      }
    } catch (err) {
      console.error('CLICK EVENT - Failed to fetch tables:', err);
      setError('Failed to fetch tables from the selected bucket');
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    // Reset all state
    setConnection(false);
    setSelectedBucket(null);
    setTables([]);
    setBuckets([]);
    setSelectedTableDetails(null);
    setError(null);
    setLoading(false);
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
    addDebugLog(`Adding table: ${table.id}`);
    try {
      setLoading(true);
      addDebugLog(`Fetching details for table: ${table.id}`);
      const tableDetail = await keboolaApi.getTableDetail(table.id);
      addDebugLog(`Got table details: ${tableDetail.id}`);
      addToBDM(tableDetail);
      addDebugLog(`Added to BDM: ${tableDetail.id}`);
    } catch (err) {
      addDebugLog(`Error adding table: ${err}`);
      setError('Failed to fetch table details');
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = async (table: KeboolaTable | null) => {
    addDebugLog(`Selecting table: ${table?.id}`);
    
    if (!table) {
      addDebugLog('Clearing selected table');
      setSelectedTableDetails(null);
      return;
    }

    try {
      setLoading(true);
      addDebugLog(`Fetching details for selected table: ${table.id}`);
      const tableDetail = await keboolaApi.getTableDetail(table.id);
      addDebugLog(`Got details for selected table: ${tableDetail.id}`);
      
      setSelectedTableDetails(tableDetail);
      addDebugLog('Updated selected table details');
      
      const updatedTables = tables.map((t: KeboolaTable) => 
        t.id === tableDetail.id ? tableDetail : t
      );
      setTables(updatedTables);
      addDebugLog('Updated tables list');

      const isInBDM = bdmTables.some(t => t.id === tableDetail.id);
      addDebugLog(`Table in BDM: ${isInBDM}`);
      
      if (isInBDM) {
        addDebugLog(`Updating BDM table: ${tableDetail.id}`);
        addToBDM(tableDetail);
        addDebugLog('BDM table updated');
      }
    } catch (err) {
      addDebugLog(`Error selecting table: ${err}`);
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
                                onClick={(e) => {
                                  // Immediate logging in the click handler
                                  console.error('CLICK EVENT - Add/Remove button clicked:', table.id);
                                  e.stopPropagation(); // Prevent event bubbling
                                  if (isInBDM) {
                                    removeFromBDM(table.id);
                                  } else {
                                    handleTableAdd(table);
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
                            onClick={(e) => {
                              // Immediate logging in the click handler
                              console.error('CLICK EVENT - Table clicked:', table.id);
                              e.stopPropagation(); // Prevent event bubbling
                              handleTableSelect(table);
                            }}
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
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <BDMGraph
          tables={bdmTables}
          onTableSelect={handleTableSelect}
          isDetailsPanelOpen={!!selectedTableDetails}
        />
      </Box>
      {/* Debug Panel */}
      <DebugPanel
        tables={tables}
        bdmTables={bdmTables}
        selectedTableDetails={selectedTableDetails}
        isLoading={isLoading}
        error={error}
        debugLogs={debugLogs}
      />

      {/* Debug Counter - Always visible in top-right corner */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bgcolor: '#f50057',
          color: 'white',
          p: 1,
          zIndex: 99999,
          fontSize: '14px',
          fontWeight: 'bold',
          borderBottomLeftRadius: '4px',
        }}
      >
        🔍 Tables: {tables.length} | BDM: {bdmTables.length}
      </Box>
    </Box>
  );
}; 