import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { useCytoscape } from '../hooks/useCytoscape';
import { KeboolaTable } from '../services/keboolaApi';

interface BDMGraphProps {
  tables: KeboolaTable[];
  onTableSelect?: (table: KeboolaTable) => void;
}

export const BDMGraph: React.FC<BDMGraphProps> = ({ tables, onTableSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { addTable, fit } = useCytoscape({
    container: containerRef.current,
    onNodeSelect: (node) => {
      const table = tables.find((t) => t.id === node.id());
      if (table && onTableSelect) {
        onTableSelect(table);
      }
    },
  });

  useEffect(() => {
    tables.forEach((table) => {
      addTable(table);
    });
    fit();
  }, [tables, addTable, fit]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: 'background.default',
      }}
    />
  );
}; 