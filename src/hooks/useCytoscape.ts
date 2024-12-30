import { useEffect, useRef } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular, Stylesheet } from 'cytoscape';
import { KeboolaTable } from '../services/keboolaApi';
import { RelationType } from '../types/bdm';
import edgehandles from 'cytoscape-edgehandles';

// Add type declaration for the edgehandles extension
declare module 'cytoscape' {
  interface Core {
    edgehandles: (options: any) => any;
  }
}

// Register the extension only once, globally
cytoscape.use(edgehandles);

interface UseCytoscapeOptions {
  container: HTMLDivElement | null;
  onNodeSelect?: (node: NodeSingular | null) => void;
  onEdgeSelect?: (edge: EdgeSingular) => void;
  onCreateEdge?: (sourceId: string, targetId: string) => void;
  onEdgeDoubleClick?: (edgeId: string) => void;
}

export const useCytoscape = ({ 
  container, 
  onNodeSelect, 
  onEdgeSelect,
  onCreateEdge,
  onEdgeDoubleClick 
}: UseCytoscapeOptions) => {
  const cyRef = useRef<Core | null>(null);
  const ehRef = useRef<any>(null);
  const edgeSourceRef = useRef<string | null>(null);
  const isShiftPressed = useRef<boolean>(false);
  const isInitialized = useRef<boolean>(false);
  const spacePressed = useRef<boolean>(false);

  useEffect(() => {
    if (!container) return;

    cyRef.current = cytoscape({
      container,
      style: [
        {
          selector: 'node',
          style: {
            backgroundColor: '#fff',
            borderColor: '#2196f3',
            borderWidth: 2,
            label: 'data(label)',
            textValign: 'center',
            textHalign: 'center',
            width: 180,
            height: 60,
            fontSize: 12,
            textWrap: 'wrap',
            textMaxWidth: 160,
            shape: 'rectangle',
            padding: 10,
          } as any,
        },
        {
          selector: 'node:selected',
          style: {
            borderColor: '#f50057',
            borderWidth: 3,
          } as any,
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            lineColor: '#666',
            targetArrowColor: '#666',
            targetArrowShape: 'triangle',
            curveStyle: 'bezier',
            fontSize: 10,
            textRotation: 'autorotate',
          } as any,
        },
        {
          selector: 'edge[label]',
          style: {
            label: 'data(label)',
            // Only show label if it's not "undefined"
            visibility: (ele: EdgeSingular) => ele.data('label') === 'undefined' ? 'hidden' : 'visible',
          } as any,
        },
        {
          selector: 'edge:selected',
          style: {
            lineColor: '#f50057',
            targetArrowColor: '#f50057',
            width: 3,
          } as any,
        },
        {
          selector: '.eh-handle',
          style: {
            'background-color': '#4caf50',
            'width': 12,
            'height': 12,
            'shape': 'ellipse',
            'overlay-opacity': 0,
            'border-width': 12,
            'border-opacity': 0.5,
            'border-color': '#4caf50',
          } as any,
        },
        {
          selector: '.eh-hover',
          style: {
            'background-color': '#4caf50',
          } as any,
        },
        {
          selector: '.eh-source',
          style: {
            'border-color': '#4caf50',
            'border-width': 3,
          } as any,
        },
        {
          selector: '.eh-target',
          style: {
            'border-color': '#4caf50',
            'border-width': 3,
          } as any,
        },
        {
          selector: '.eh-preview, .eh-ghost-edge',
          style: {
            'line-color': '#4caf50',
            'target-arrow-color': '#4caf50',
            'source-arrow-color': '#4caf50',
            'target-arrow-shape': 'triangle',
          } as any,
        },
      ],
      layout: {
        name: 'grid',
        rows: 2,
      },
      wheelSensitivity: 0.2,
    });

    const cy = cyRef.current;

    // Handle node selection
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      console.log('Node selected:', node.id());
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    });

    // Handle edge selection
    cy.on('tap', 'edge', (event) => {
      const edge = event.target;
      console.log('Edge selected:', edge.id());
      if (onEdgeSelect) {
        onEdgeSelect(edge);
      }
    });

    // Handle background tap to clear selection
    cy.on('tap', (event) => {
      if (event.target === cy) {
        console.log('Background clicked, clearing selection');
        if (onNodeSelect) {
          onNodeSelect(null);
        }
      }
    });

    // Handle edge creation
    cy.on('ehcomplete', (event, sourceNode, targetNode, addedEles) => {
      if (onCreateEdge) {
        onCreateEdge(sourceNode.id(), targetNode.id());
      }
    });

    // Handle edge double click
    cy.on('dblclick', 'edge', (event) => {
      const edge = event.target;
      if (onEdgeDoubleClick) {
        onEdgeDoubleClick(edge.id());
      }
    });

    return () => {
      cy.destroy();
    };
  }, [container, onNodeSelect, onEdgeSelect, onCreateEdge, onEdgeDoubleClick]);

  const addTable = (table: KeboolaTable, position?: { x: number; y: number }) => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    console.log('Adding table:', table.id);

    // Store current state before any modifications
    const currentNodes = cy.nodes().map(node => ({
      id: node.id(),
      position: node.position(),
      data: node.data(),
    }));

    const currentEdges = cy.edges().map(edge => ({
      id: edge.id(),
      source: edge.source().id(),
      target: edge.target().id(),
      data: edge.data(),
    }));

    // Remove all elements
    cy.elements().remove();

    // Add back existing nodes (excluding the one we're adding/updating)
    currentNodes
      .filter(node => node.id !== table.id)
      .forEach(node => {
        cy.add({
          group: 'nodes',
          data: node.data,
          position: node.position,
        });
      });

    // Add the new/updated node
    cy.add({
      group: 'nodes',
      data: {
        id: table.id,
        label: table.displayName || table.name,
        columns: table.columns,
      },
      position: position || {
        x: Math.random() * 500 + 100,
        y: Math.random() * 500 + 100,
      },
    });

    // Restore edges
    console.log('Restoring edges');
    currentEdges.forEach(edge => {
      // Only restore edges if both source and target nodes exist
      const sourceExists = cy.getElementById(edge.source).length > 0;
      const targetExists = cy.getElementById(edge.target).length > 0;
      
      if (sourceExists && targetExists) {
        cy.add({
          group: 'edges',
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.data.label && edge.data.label !== 'undefined' ? edge.data.label : undefined,
          },
        });
      }
    });
  };

  const addRelationship = (
    sourceId: string,
    targetId: string,
    type: RelationType,
    id?: string
  ) => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    // Check if a relationship already exists between these tables in this direction
    const existingEdges = cy.edges().filter(edge => 
      edge.source().id() === sourceId && 
      edge.target().id() === targetId
    );

    // If there are any existing edges, don't create a new one
    if (existingEdges.length > 0) {
      console.log('Relationship already exists between these tables');
      return;
    }

    // Create new edge with the new type
    const edgeId = id || `${sourceId}-${targetId}-${type}`;
    console.log('Adding relationship:', { sourceId, targetId, type, edgeId });
    
    cy.add({
      group: 'edges',
      data: {
        id: edgeId,
        source: sourceId,
        target: targetId,
        label: type,
      },
    });
  };

  const updateRelationship = (edgeId: string, newType: RelationType) => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    
    const edge = cy.getElementById(edgeId);
    if (edge.length > 0) {
      edge.data('label', newType);
      console.log('Updated relationship:', { edgeId, newType });
    }
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

  const zoomIn = () => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 1.2);
  };

  const zoomOut = () => {
    if (!cyRef.current) return;
    cyRef.current.zoom(cyRef.current.zoom() * 0.8);
  };

  const applyGridLayout = () => {
    if (!cyRef.current) return;
    
    const layout = cyRef.current.layout({
      name: 'grid',
      rows: undefined,
      cols: undefined,
      fit: true,
      padding: 30,
      avoidOverlap: true,
      nodeDimensionsIncludeLabels: true,
      spacingFactor: 1.2,
      animate: true,
      animationDuration: 500,
      animationEasing: 'ease-out-cubic',
    });

    layout.run();
  };

  return {
    addTable,
    addRelationship,
    updateRelationship,
    removeElement,
    fit,
    zoomIn,
    zoomOut,
    applyGridLayout,
  };
}; 