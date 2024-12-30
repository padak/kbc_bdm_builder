import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { useBDMStore } from '../store/bdmStore';
import { keboolaApi } from '../services/keboolaApi';

const STORAGE_KEY = 'keboola_config';

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
  const [instanceUrl, setInstanceUrl] = useState('https://connection.keboola.com');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Try to load saved credentials when the dialog opens
    if (open) {
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        try {
          const { apiToken: token, instanceUrl: url } = JSON.parse(savedConfig);
          setApiToken(token);
          setInstanceUrl(url);
          console.log('Loaded saved configuration');
          // Attempt to connect with saved credentials
          handleSubmit(undefined, token, url);
        } catch (err) {
          console.error('Failed to parse saved configuration:', err);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [open]);

  const handleSubmit = async (
    e?: React.FormEvent,
    savedToken?: string,
    savedUrl?: string
  ) => {
    if (e) e.preventDefault();
    
    const token = savedToken || apiToken;
    const url = savedUrl || instanceUrl;
    
    if (!token || !url) {
      setLocalError('Please provide both API token and instance URL');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);
    setGlobalError(null);

    try {
      console.log('Configuring API client...');
      keboolaApi.configure({ apiToken: token, instanceUrl: url });

      console.log('Testing connection...');
      const isConnected = await keboolaApi.testConnection();

      if (isConnected) {
        try {
          console.log('Fetching buckets...');
          const fetchedBuckets = await keboolaApi.listBuckets();
          
          if (fetchedBuckets && fetchedBuckets.length > 0) {
            setBuckets(fetchedBuckets);
            
            // Load tables for the first bucket
            const firstBucket = fetchedBuckets[0];
            setSelectedBucket(firstBucket);
            
            console.log('Fetching tables for bucket:', firstBucket.id);
            const fetchedTables = await keboolaApi.listTables(firstBucket.id);
            
            if (fetchedTables) {
              setTables(fetchedTables);
              // Save credentials only after successful connection
              localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ apiToken: token, instanceUrl: url })
              );
              console.log('Saved configuration');
              setConnection(true);
              onClose();
            } else {
              throw new Error('Failed to load tables from the first bucket.');
            }
          } else {
            throw new Error('No buckets found in your Keboola project.');
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
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isSubmitting}
    >
      <DialogTitle>Connect to Keboola</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {localError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
            </Alert>
          )}
          <TextField
            label="API Token"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            fullWidth
            required
            margin="normal"
            type="password"
            disabled={isSubmitting}
          />
          <TextField
            label="Instance URL"
            value={instanceUrl}
            onChange={(e) => setInstanceUrl(e.target.value)}
            fullWidth
            required
            margin="normal"
            placeholder="https://connection.keboola.com"
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Box sx={{ position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              Connect
            </Button>
            {isSubmitting && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 