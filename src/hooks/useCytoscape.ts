import { useEffect, useRef } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular } from 'cytoscape';
import { KeboolaTable } from '../services/keboolaApi';
import { RelationType } from '../types/bdm';
import edgehandles from 'cytoscape-edgehandles';

// Add type declaration for the edgehandles extension
declare module 'cytoscape' {
  interface Core {
    edgehandles: (options: any) => any;
  }
}

// Register the extension
cytoscape.use(edgehandles);

interface UseCytoscapeOptions {
  container: HTMLElement | null;
  onNodeSelect?: (node: NodeSingular) => void;
  onEdgeSelect?: (edge: EdgeSingular) => void;
  onCreateEdge?: (sourceId: string, targetId: string) => void;
  onEdgeDoubleClick?: (edgeId: string) => void;
}

interface NodePosition {
  x: number;
  y: number;
}

interface NodeData {
  position: NodePosition;
  [key: string]: any;
}

export const useCytoscape = ({ container, onNodeSelect, onEdgeSelect, onCreateEdge, onEdgeDoubleClick }: UseCytoscapeOptions) => {
  const cyRef = useRef<Core | null>(null);
  const ehRef = useRef<any>(null);
  const nodesRef = useRef<{ [key: string]: NodeData }>({});
  const isDrawMode = useRef(false);

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
            },
          },
          {
            selector: '.eh-hover',
            style: {
              'background-color': '#4caf50',
            },
          },
          {
            selector: '.eh-source',
            style: {
              'border-color': '#4caf50',
              'border-width': 3,
            },
          },
          {
            selector: '.eh-target',
            style: {
              'border-color': '#4caf50',
              'border-width': 3,
            },
          },
          {
            selector: '.eh-preview, .eh-ghost-edge',
            style: {
              'line-color': '#4caf50',
              'target-arrow-color': '#4caf50',
              'source-arrow-color': '#4caf50',
              'target-arrow-shape': 'triangle',
            },
          },
        ],
        layout: {
          name: 'grid',
          rows: 2,
        },
        wheelSensitivity: 0.2,
        boxSelectionEnabled: true,
        selectionType: 'single',
      });

      // Event handlers
      if (onNodeSelect) {
        cyRef.current.on('tap', 'node', (event) => {
          if (!isDrawMode.current) {
            onNodeSelect(event.target);
          }
        });
      }

      if (onEdgeSelect) {
        cyRef.current.on('tap', 'edge', (event) => {
          if (!isDrawMode.current) {
            onEdgeSelect(event.target);
          }
        });
      }

      // Handle shift key events
      const handleKeyDown = (event: KeyboardEvent) => {
        console.log('Key down:', event.key);
        if (event.key === 'Shift' && !isDrawMode.current) {
          console.log('Entering draw mode');
          isDrawMode.current = true;
          if (ehRef.current) {
            console.log('Enabling edge handles');
            ehRef.current.enable();
            console.log('Edge handles enabled:', ehRef.current.enabled());
          } else {
            console.error('Edge handles not initialized');
          }
          if (cyRef.current) {
            cyRef.current.nodes().ungrabify();
            console.log('Nodes ungrabified');
          }
        }
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        console.log('Key up:', event.key);
        if (event.key === 'Shift') {
          console.log('Exiting draw mode');
          isDrawMode.current = false;
          if (ehRef.current) {
            console.log('Disabling edge handles');
            ehRef.current.disable();
            console.log('Edge handles disabled:', !ehRef.current.enabled());
          }
          if (cyRef.current) {
            cyRef.current.nodes().grabify();
            console.log('Nodes grabified');
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // Initialize edge handles with draw mode disabled by default
      ehRef.current = cyRef.current.edgehandles({
        snap: true,
        noEdgeEventsInDraw: true,
        disableBrowserGestures: true,
        handleNodes: 'node',
        handlePosition: 'right middle',
        handleInDrawMode: false,
        edgeType: () => 'straight',
        loopAllowed: () => false,
        nodeLoopOffset: -50,
        complete: (sourceNode: any, targetNode: any) => {
          console.log('Edge creation completed:', { sourceNode, targetNode });
          if (onCreateEdge) {
            onCreateEdge(sourceNode.id(), targetNode.id());
          }
        },
        start: (sourceNode: any) => {
          console.log('Edge creation started from:', sourceNode);
        },
        stop: (sourceNode: any) => {
          console.log('Edge creation stopped at:', sourceNode);
        },
        edgeParams: {
          style: {
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
          },
        },
      });

      console.log('Edge handles initialized');
      ehRef.current.disable();
      console.log('Edge handles disabled initially');

      // Enable node dragging
      cyRef.current.on('dragfree', 'node', (event) => {
        const node = event.target;
        const id = node.id();
        const position = node.position();
        nodesRef.current[id] = { ...nodesRef.current[id], position };
      });

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [container, onNodeSelect, onEdgeSelect, onCreateEdge, onEdgeDoubleClick]);

  const addTable = (table: KeboolaTable, position?: { x: number; y: number }) => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    console.log('Adding table:', table.id);

    // Check if the node already exists
    const existingNode = cy.getElementById(table.id);
    if (existingNode.length > 0) {
      // Update existing node data
      existingNode.data({
        label: table.displayName || table.name,
        columns: table.columns,
      });
      return;
    }

    // Add new node
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