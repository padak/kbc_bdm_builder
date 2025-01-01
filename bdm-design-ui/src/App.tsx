import React, { useState, useEffect } from 'react';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import { KeboolaConfigDialog } from './components/KeboolaConfig';
import { BDMDesigner } from './components/BDMDesigner';
import { useBDMStore } from './store/bdmStore';
import { KeboolaTable } from './services/keboolaApi';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const App: React.FC = () => {
  const [configOpen, setConfigOpen] = useState(true);
  const { isConnected, tables, isLoading, error } = useBDMStore();

  useEffect(() => {
    if (isConnected) {
      setConfigOpen(false);
    }
  }, [isConnected]);

  const handleClose = () => {
    setConfigOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: '100vh', bgcolor: 'background.default' }}>
        {!isConnected || configOpen ? (
          <KeboolaConfigDialog open={configOpen} onClose={handleClose} />
        ) : (
          <BDMDesigner tables={tables} isLoading={isLoading} error={error} />
        )}
      </Box>
    </ThemeProvider>
  );
};

export default App; 