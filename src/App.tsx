import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { KeboolaConfigDialog } from './components/KeboolaConfig';
import { BDMDesigner } from './components/BDMDesigner';
import { useBDMStore } from './store/bdmStore';

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

function App() {
  const { isConnected, buckets, error } = useBDMStore();
  const [configOpen, setConfigOpen] = useState(!isConnected);

  const renderContent = () => {
    if (!isConnected) {
      return (
        <KeboolaConfigDialog
          open={true}
          onClose={() => setConfigOpen(false)}
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