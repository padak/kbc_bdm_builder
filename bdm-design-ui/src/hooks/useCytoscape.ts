import { useEffect, useRef, useCallback } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular, ElementDefinition, Position } from 'cytoscape';
import { KeboolaTable } from '../services/keboolaApi';

interface UseCytoscapeOptions {
  container: HTMLElement | null;
  onNodeSelect?: (node: NodeSingular) => void;
  onEdgeSelect?: (edge: EdgeSingular) => void;
}

interface NodeData {
  position: Position;
  [key: string]: any;
}

export const useCytoscape = ({ container, onNodeSelect, onEdgeSelect }: UseCytoscapeOptions) => {
  const cyRef = useRef<Core | null>(null);
  const gridEnabled = useRef(false);
  const nodesRef = useRef<{ [key: string]: NodeData }>({});

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
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#666',
              'target-arrow-color': '#666',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'label': 'data(label)',
              'font-size': '10px',
              'text-rotation': 'autorotate',
            },
          },
          {
            selector: 'edge:selected',
            style: {
              'line-color': '#f50057',
              'target-arrow-color': '#f50057',
              'width': 3,
            },
          },
        ],
        layout: {
          name: 'grid',
          rows: 2,
        },
        wheelSensitivity: 0.2,
      });

      // Event handlers
      if (onNodeSelect) {
        cyRef.current.on('tap', 'node', (event) => {
          onNodeSelect(event.target);
        });
      }

      if (onEdgeSelect) {
        cyRef.current.on('tap', 'edge', (event) => {
          onEdgeSelect(event.target);
        });
      }

      // Enable node dragging
      cyRef.current.on('dragfree', 'node', (event) => {
        const node = event.target;
        const id = node.id();
        const position = node.position();
        nodesRef.current[id] = { ...nodesRef.current[id], position };
      });
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [container, onNodeSelect, onEdgeSelect]);

  const addTable = useCallback((table: KeboolaTable) => {
    if (!cyRef.current) return;

    const existingNode = cyRef.current.getElementById(table.id);
    if (existingNode.length > 0) {
      // Update existing node data
      existingNode.data({
        label: table.displayName || table.name,
        columns: table.definition?.columns || [],
      });
      return;
    }

    // Get saved position or generate new one
    const savedNode = nodesRef.current[table.id];
    const position = savedNode?.position || {
      x: Math.random() * 500,
      y: Math.random() * 500,
    };

    // Add new node
    const newNode: ElementDefinition = {
      group: 'nodes',
      data: {
        id: table.id,
        label: table.displayName || table.name,
        columns: table.definition?.columns || [],
      },
      position,
    };

    cyRef.current.add(newNode);
    nodesRef.current[table.id] = { position, ...newNode.data };
  }, []);

  const addRelationship = useCallback((
    sourceId: string,
    targetId: string,
    label: string,
    id?: string
  ) => {
    if (!cyRef.current) return;

    const edgeId = id || `${sourceId}-${targetId}`;
    const existingEdge = cyRef.current.getElementById(edgeId);
    if (existingEdge.length > 0) return;

    cyRef.current.add({
      group: 'edges',
      data: {
        id: edgeId,
        source: sourceId,
        target: targetId,
        label,
      },
    });
  }, []);

  const removeElement = useCallback((elementId: string) => {
    if (!cyRef.current) return;
    const element = cyRef.current.getElementById(elementId);
    if (element.length > 0) {
      cyRef.current.remove(element);
      delete nodesRef.current[elementId];
    }
  }, []);

  const fit = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.fit();
  }, []);

  const zoomIn = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 1.2);
  }, []);

  const zoomOut = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  }, []);

  const toggleGrid = useCallback(() => {
    if (!cyRef.current) return;
    gridEnabled.current = !gridEnabled.current;
    if (gridEnabled.current) {
      cyRef.current.layout({ name: 'grid', rows: 2 }).run();
    }
  }, []);

  return {
    addTable,
    addRelationship,
    removeElement,
    fit,
    zoomIn,
    zoomOut,
    toggleGrid,
  };
}; 