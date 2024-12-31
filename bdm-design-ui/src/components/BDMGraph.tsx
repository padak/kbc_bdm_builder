import React, { useRef } from 'react';
import { Box, IconButton, Paper } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  GridOn as GridOnIcon,
  CenterFocusStrong as FitIcon,
} from '@mui/icons-material';
import { KeboolaTable } from '../services/keboolaApi';
import { useCytoscape } from '../hooks/useCytoscape';

interface BDMGraphProps {
  tables: KeboolaTable[];
  onTableSelect?: (table: KeboolaTable) => void;
  isDetailsPanelOpen?: boolean;
}

export const BDMGraph: React.FC<BDMGraphProps> = ({
  tables,
  onTableSelect,
  isDetailsPanelOpen = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    fit,
    zoomIn,
    zoomOut,
    toggleGrid,
  } = useCytoscape({
    container: containerRef.current,
    tables,
    onNodeSelect: (node) => {
      if (onTableSelect && node) {
        const table = tables.find((t) => t.id === node.id());
        if (table) {
          onTableSelect(table);
        }
      }
    },
  });

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#f5f5f5',
        position: 'relative',
        transition: 'padding-right 0.3s ease',
        pr: isDetailsPanelOpen ? '400px' : 0,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          position: 'absolute',
          top: 16,
          right: isDetailsPanelOpen ? 416 : 16,
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          transition: 'right 0.3s ease',
          zIndex: 2,
        }}
      >
        <IconButton onClick={zoomIn} size="small" title="Zoom In">
          <ZoomInIcon />
        </IconButton>
        <IconButton onClick={zoomOut} size="small" title="Zoom Out">
          <ZoomOutIcon />
        </IconButton>
        <IconButton onClick={toggleGrid} size="small" title="Toggle Grid Layout">
          <GridOnIcon />
        </IconButton>
        <IconButton onClick={fit} size="small" title="Fit to View">
          <FitIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}; 