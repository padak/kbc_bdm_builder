import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as FitIcon,
  GridOn as GridIcon,
} from '@mui/icons-material';
import { useCytoscape } from '../hooks/useCytoscape';
import { KeboolaTable, keboolaApi } from '../services/keboolaApi';
import { RelationType } from '../types/bdm';
import { TableDetailsPanel } from './TableDetailsPanel';
import debug from '../utils/debug';

interface BDMGraphProps {
  tables: KeboolaTable[];
  onTableSelect?: (table: KeboolaTable | null) => void;
  isDetailsPanelOpen?: boolean;
}

interface RelationshipDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (type: RelationType) => void;
  title: string;
  confirmText: string;
}

const RelationshipDialog: React.FC<RelationshipDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  confirmText,
}) => {
  const [type, setType] = useState<RelationType>('Parent-Child');

  const handleConfirm = () => {
    onConfirm(type);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Relationship Type</InputLabel>
          <Select
            value={type}
            label="Relationship Type"
            onChange={(e) => setType(e.target.value as RelationType)}
          >
            <MenuItem value="Parent-Child">Parent-Child</MenuItem>
            <MenuItem value="M:N">Many-to-Many</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const BDMGraph: React.FC<BDMGraphProps> = ({ tables, onTableSelect, isDetailsPanelOpen = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [relationshipSource, setRelationshipSource] = useState<string | null>(null);
  const [relationshipTarget, setRelationshipTarget] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<KeboolaTable | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    debug.log('BDMGraph mounted');
    return () => debug.log('BDMGraph unmounted');
  }, []);

  // Debug log for props
  useEffect(() => {
    debug.log('BDMGraph: Props updated', {
      tablesCount: tables.length,
      tableIds: tables.map(t => t.id),
      isDetailsPanelOpen
    });
  }, [tables, isDetailsPanelOpen]);

  const { addRelationship, updateRelationship, fit, zoomIn, zoomOut, applyGridLayout } = useCytoscape({
    container: containerRef.current,
    tables,
    onNodeSelect: (node) => {
      debug.log('BDMGraph: Node selected:', node ? node.id() : 'none');
      if (!node) {
        debug.log('BDMGraph: Clearing selected table');
        setSelectedTable(null);
        if (onTableSelect) {
          onTableSelect(null);
        }
        return;
      }

      const table = tables.find((t) => t.id === node.id());
      debug.log('BDMGraph: Found table for selection:', table?.id);
      if (table) {
        debug.log('BDMGraph: Setting selected table:', table.id);
        setSelectedTable(table);
        if (onTableSelect) {
          onTableSelect(table);
        }
      }
    },
    onEdgeSelect: () => {
      debug.log('BDMGraph: Edge selected, clearing table selection');
      setSelectedTable(null);
      if (onTableSelect) {
        onTableSelect(null);
      }
    },
    onCreateEdge: (sourceId, targetId) => {
      debug.log('BDMGraph: Creating edge between:', sourceId, 'and', targetId);
      setRelationshipSource(sourceId);
      setRelationshipTarget(targetId);
      setIsCreateDialogOpen(true);
    },
    onEdgeDoubleClick: (edgeId) => {
      debug.log('BDMGraph: Double click on edge:', edgeId);
      setSelectedEdge(edgeId);
      setIsEditDialogOpen(true);
    },
  });

  const handleCreateRelationship = (type: RelationType) => {
    debug.log('BDMGraph: Creating relationship:', { source: relationshipSource, target: relationshipTarget, type });
    if (relationshipSource && relationshipTarget) {
      addRelationship(relationshipSource, relationshipTarget, type);
      setRelationshipSource(null);
      setRelationshipTarget(null);
    }
    setIsCreateDialogOpen(false);
  };

  const handleEditRelationship = (type: RelationType) => {
    debug.log('BDMGraph: Editing relationship:', { edge: selectedEdge, type });
    if (selectedEdge) {
      updateRelationship(selectedEdge, type);
      setSelectedEdge(null);
    }
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: 'calc(100vh - 64px)',
          bgcolor: 'background.default',
          border: '1px solid #e0e0e0',
          position: 'relative',
          pr: isDetailsPanelOpen ? '400px' : 0,
          transition: 'padding-right 0.3s ease',
        }}
      />
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: isDetailsPanelOpen ? 416 : 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: 1,
          bgcolor: 'background.paper',
          zIndex: 3,
          transition: 'right 0.2s ease-in-out',
        }}
      >
        <Tooltip title="Grid Layout" placement="left">
          <IconButton onClick={applyGridLayout} size="small">
            <GridIcon />
          </IconButton>
        </Tooltip>
        <Divider sx={{ my: 0.5 }} />
        <Tooltip title="Zoom In" placement="left">
          <IconButton onClick={zoomIn} size="small">
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out" placement="left">
          <IconButton onClick={zoomOut} size="small">
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Fit to View" placement="left">
          <IconButton onClick={fit} size="small">
            <FitIcon />
          </IconButton>
        </Tooltip>
      </Paper>
      <TableDetailsPanel
        table={selectedTable}
        onClose={() => {
          setSelectedTable(null);
          if (onTableSelect) {
            onTableSelect(null);
          }
        }}
        isLoading={isLoading}
      />
      <RelationshipDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onConfirm={handleCreateRelationship}
        title="Create Relationship"
        confirmText="Create"
      />
      <RelationshipDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onConfirm={handleEditRelationship}
        title="Edit Relationship"
        confirmText="Update"
      />
    </>
  );
}; 