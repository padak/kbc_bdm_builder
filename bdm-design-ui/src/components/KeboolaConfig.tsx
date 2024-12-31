import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useBDMStore } from '../store/bdmStore';
import { keboolaApi } from '../services/keboolaApi';

interface KeboolaConfigDialogProps {
  open: boolean;
  onClose: () => void;
}

export const KeboolaConfigDialog: React.FC<KeboolaConfigDialogProps> = ({
  open,
  onClose,
}) => {
  const { setConnection, setBuckets, setSelectedBucket, setTables, setError: setGlobalError } = useBDMStore();
  const [apiToken, setApiToken] = useState('');
  const [instanceUrl, setInstanceUrl] = useState('https://connection.north-europe.azure.keboola.com');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    setGlobalError(null);
    setConnectionStatus('Connecting to Keboola...');

    try {
      // Configure the API client
      keboolaApi.configure({ apiToken, instanceUrl });
      
      // Test the connection
      const isConnected = await keboolaApi.testConnection();
      
      if (isConnected) {
        try {
          setConnectionStatus('Loading buckets...');
          // Fetch initial buckets
          const fetchedBuckets = await keboolaApi.listBuckets();
          
          if (fetchedBuckets && fetchedBuckets.length > 0) {
            setBuckets(fetchedBuckets);
            setConnectionStatus('Loading tables...');
            
            // Load tables for the first bucket
            const firstBucket = fetchedBuckets[0];
            setSelectedBucket(firstBucket);
            
            const fetchedTables = await keboolaApi.listTables(firstBucket.id);
            if (fetchedTables) {
              setTables(fetchedTables);
              // Everything is loaded, now we can set the connection state
              setConnection(true);
              onClose();
            } else {
              setLocalError('Failed to load tables from the first bucket.');
            }
          } else {
            setLocalError('No buckets found in your Keboola project.');
          }
        } catch (err) {
          console.error('Error fetching initial data:', err);
          setLocalError('Connected successfully but failed to fetch data. Please try again.');
        }
      } else {
        setLocalError('Failed to connect to Keboola API. Please check your credentials.');
      }
    } catch (err) {
      console.error('Error connecting to Keboola:', err);
      setLocalError('An error occurred while connecting to Keboola API. Please try again.');
    } finally {
      setIsSubmitting(false);
      setConnectionStatus('');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setLocalError(null);
      setConnectionStatus('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isSubmitting}
    >
      <DialogTitle>Connect to Keboola</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Please enter your Keboola Storage API credentials to connect to your project.
          </Typography>
          {localError && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {localError}
            </Alert>
          )}
          {isSubmitting && connectionStatus && (
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              {connectionStatus}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="API Token"
            type="password"
            fullWidth
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            disabled={isSubmitting}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Instance URL"
            type="text"
            fullWidth
            value={instanceUrl}
            onChange={(e) => setInstanceUrl(e.target.value)}
            disabled={isSubmitting}
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!apiToken || !instanceUrl || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
        >
          {isSubmitting ? 'Connecting...' : 'Connect'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 