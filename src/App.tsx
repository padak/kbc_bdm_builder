import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { KeboolaConfigDialog } from './components/KeboolaConfig';
import { BDMDesigner } from './components/BDMDesigner';
import { useBDMStore } from './store/bdmStore';
import { keboolaApi } from './services/keboolaApi';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const STORAGE_KEY = 'keboola_config';

function App() {
  const { 
    isConnected, 
    buckets, 
    error, 
    setConnection,
    setBuckets,
    setSelectedBucket,
    setTables,
    setError: setGlobalError,
  } = useBDMStore();
  const [configOpen, setConfigOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeConnection = async () => {
      console.log('Starting initialization...');
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      
      if (savedConfig) {
        try {
          const { apiToken, instanceUrl } = JSON.parse(savedConfig);
          console.log('Found saved configuration, attempting to reconnect...');

          // Configure the API client
          keboolaApi.configure({ apiToken, instanceUrl });
          
          // Test the connection
          console.log('Testing connection...');
          const isConnected = await keboolaApi.testConnection();
          console.log('Connection test result:', isConnected);
          
          if (isConnected) {
            try {
              // Fetch initial buckets
              console.log('Fetching buckets...');
              const fetchedBuckets = await keboolaApi.listBuckets();
              console.log('Fetched buckets:', fetchedBuckets?.length);
              
              if (fetchedBuckets && fetchedBuckets.length > 0) {
                setBuckets(fetchedBuckets);
                
                // Load tables for the first bucket
                const firstBucket = fetchedBuckets[0];
                console.log('Setting first bucket:', firstBucket.name);
                setSelectedBucket(firstBucket);
                
                console.log('Fetching tables for bucket:', firstBucket.id);
                const fetchedTables = await keboolaApi.listTables(firstBucket.id);
                console.log('Fetched tables:', fetchedTables?.length);
                
                if (fetchedTables) {
                  setTables(fetchedTables);
                  console.log('Setting connection to true');
                  setConnection(true);
                } else {
                  throw new Error('Failed to load tables from the first bucket.');
                }
              } else {
                throw new Error('No buckets found in your Keboola project.');
              }
            } catch (err) {
              console.error('Error fetching initial data:', err);
              setGlobalError('Failed to load data. Please reconnect.');
              setConfigOpen(true);
            }
          } else {
            console.log('Saved credentials are invalid');
            setConfigOpen(true);
          }
        } catch (err) {
          console.error('Error initializing connection:', err);
          setConfigOpen(true);
        }
      } else {
        console.log('No saved configuration found');
        setConfigOpen(true);
      }
      console.log('Initialization complete');
      setIsInitializing(false);
    };

    initializeConnection();
  }, []);

  const renderContent = () => {
    console.log('Rendering content with state:', {
      isInitializing,
      isConnected,
      configOpen,
      bucketsCount: buckets?.length
    });

    if (isInitializing) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>Initializing...</Typography>
        </Box>
      );
    }

    if (!isConnected || configOpen) {
      return (
        <KeboolaConfigDialog
          open={true}
          onClose={() => {
            console.log('Config dialog closed');
            setConfigOpen(false);
          }}
        />
      );
    }

    if (!buckets || buckets.length === 0) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>Loading Keboola data...</Typography>
          {error && (
            <Typography color="error">
              {error}
            </Typography>
          )}
        </Box>
      );
    }

    console.log('Rendering BDMDesigner with buckets:', buckets.length);
    return <BDMDesigner />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', width: '100vw' }}>
        {renderContent()}
      </Box>
    </ThemeProvider>
  );
}

export default App; 