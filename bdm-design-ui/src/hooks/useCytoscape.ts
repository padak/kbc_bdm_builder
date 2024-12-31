import { useEffect, useRef, useCallback } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular, ElementDefinition, Position } from 'cytoscape';
import { KeboolaTable } from '../services/keboolaApi';

interface UseCytoscapeOptions {
  container: HTMLElement | null;
  tables: KeboolaTable[];
  onNodeSelect?: (node: NodeSingular) => void;
  onEdgeSelect?: (edge: EdgeSingular) => void;
}

interface NodeData {
  position: Position;
  [key: string]: any;
}

export const useCytoscape = ({
  container,
  tables,
  onNodeSelect,
  onEdgeSelect,
}: UseCytoscapeOptions) => {
  const cyRef = useRef<Core | null>(null);
  const nodesRef = useRef<{ [key: string]: NodeData }>({});

  // Initialize cytoscape
  useEffect(() => {
    if (!container) return;

    if (!cyRef.current) {
      cyRef.current = cytoscape({
        container,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#fff',
              'border-color': '#2196f3',
              'border-width': 2,
              'label': 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              'width': 180,
              'height': 60,
              'font-size': '12px',
              'text-wrap': 'wrap',
              'text-max-width': '160px',
              'shape': 'rectangle',
            },
          },
          {
            selector: 'node:selected',
            style: {
              'border-color': '#f50057',
              'border-width': 3,
            },
          },
        ],
        layout: {
          name: 'preset',
        },
        wheelSensitivity: 0.2,
      });
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [container]);

  // Effect to sync graph with tables prop
  useEffect(() => {
    if (!cyRef.current || !container) return;
    
    const cy = cyRef.current;
    
    // Get current nodes in the graph
    const currentNodes = cy.nodes().map(node => node.id());
    
    // Add or update nodes that should be in the graph
    tables.forEach(table => {
      const existingNode = cy.getElementById(table.id);
      if (existingNode.length > 0) {
        // Update existing node data but maintain its position
        const currentPosition = existingNode.position();
        existingNode.data({
          id: table.id,
          label: table.displayName || table.name,
          columns: table.columns,
        });
        existingNode.position(currentPosition);
      } else {
        // Get saved position or generate new one
        const savedNode = nodesRef.current[table.id];
        const position = savedNode?.position || {
          x: Math.random() * 500,
          y: Math.random() * 500,
        };

        // Add new node
        cy.add({
          group: 'nodes',
          data: {
            id: table.id,
            label: table.displayName || table.name,
            columns: table.columns,
          },
          position,
        });
      }
    });

    // Remove nodes that shouldn't be in the graph
    const tableIds = tables.map(t => t.id);
    currentNodes.forEach(nodeId => {
      if (!tableIds.includes(nodeId)) {
        cy.getElementById(nodeId).remove();
      }
    });
  }, [container, tables]);

  // Event handlers
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    if (onNodeSelect) {
      cy.on('tap', 'node', (event) => {
        const node = event.target;
        onNodeSelect(node);
      });
    }

    if (onEdgeSelect) {
      cy.on('tap', 'edge', (event) => {
        onEdgeSelect(event.target);
      });
    }

    return () => {
      cy.removeAllListeners();
    };
  }, [onNodeSelect, onEdgeSelect]);

  const fit = () => {
    if (!cyRef.current) return;
    cyRef.current.fit();
  };

  const zoomIn = () => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 1.2);
  };

  const zoomOut = () => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };

  const toggleGrid = () => {
    if (!cyRef.current) return;
    cyRef.current.layout({ name: 'grid', rows: 2 }).run();
  };

  return {
    fit,
    zoomIn,
    zoomOut,
    toggleGrid,
  };
}; 