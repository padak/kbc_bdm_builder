import { useEffect, useRef } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular } from 'cytoscape';
import { KeboolaTable } from '../services/keboolaApi';

interface UseCytoscapeOptions {
  container: HTMLElement | null;
  onNodeSelect?: (node: NodeSingular) => void;
  onEdgeSelect?: (edge: EdgeSingular) => void;
}

export const useCytoscape = ({ container, onNodeSelect, onEdgeSelect }: UseCytoscapeOptions) => {
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!container) return;

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
            'text-max-width': 160,
            'shape': 'rectangle',
            'padding': '10px',
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

    const cy = cyRef.current;

    // Event handlers
    if (onNodeSelect) {
      cy.on('tap', 'node', (event) => {
        onNodeSelect(event.target);
      });
    }

    if (onEdgeSelect) {
      cy.on('tap', 'edge', (event) => {
        onEdgeSelect(event.target);
      });
    }

    // Enable node dragging
    cy.on('dragfree', 'node', (event) => {
      const node = event.target;
      const position = node.position();
      // Here you could save the new position to your state management
    });

    return () => {
      cy.destroy();
    };
  }, [container, onNodeSelect, onEdgeSelect]);

  const addTable = (table: KeboolaTable, position?: { x: number; y: number }) => {
    if (!cyRef.current) return;

    const existingNode = cyRef.current.getElementById(table.id);
    if (existingNode.length > 0) {
      // Node already exists, maybe update its data
      existingNode.data({
        label: table.displayName || table.name,
        columns: table.columns,
      });
      return;
    }

    cyRef.current.add({
      group: 'nodes',
      data: {
        id: table.id,
        label: table.displayName || table.name,
        columns: table.columns,
      },
      position: position || {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    });
  };

  const addRelationship = (
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
  };

  const removeElement = (elementId: string) => {
    if (!cyRef.current) return;
    const element = cyRef.current.getElementById(elementId);
    if (element.length > 0) {
      cyRef.current.remove(element);
    }
  };

  const fit = () => {
    if (!cyRef.current) return;
    cyRef.current.fit();
  };

  return {
    addTable,
    addRelationship,
    removeElement,
    fit,
  };
}; 