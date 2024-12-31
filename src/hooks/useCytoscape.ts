import { useEffect, useRef } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular } from 'cytoscape';
import { KeboolaTable } from '../services/keboolaApi';
import { RelationType } from '../types/bdm';
import edgehandles from 'cytoscape-edgehandles';
import debug from '../utils/debug';

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
  tables: KeboolaTable[];
  onNodeSelect?: (node: NodeSingular | null) => void;
  onEdgeSelect?: (edge: EdgeSingular | null) => void;
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

export const useCytoscape = ({
  container,
  tables,
  onNodeSelect,
  onEdgeSelect,
  onCreateEdge,
  onEdgeDoubleClick,
}: UseCytoscapeOptions) => {
  const cyRef = useRef<Core | null>(null);
  const ehRef = useRef<any>(null);
  const nodesRef = useRef<{ [key: string]: NodeData }>({});
  const isDrawMode = useRef(false);

  useEffect(() => {
    debug.log('useCytoscape: Effect triggered', { hasContainer: !!container });
    if (!container) return;

    debug.log('useCytoscape: Initializing with container');
    if (!cyRef.current) {
      debug.log('useCytoscape: Creating new Cytoscape instance');
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
        boxSelectionEnabled: true,
        selectionType: 'single',
      });

      // Event handlers
      if (onNodeSelect) {
        cyRef.current.on('tap', (event) => {
          debug.log('useCytoscape: Tap event:', event.target.group());
          
          // If clicking on the background, clear selection
          if (event.target === cyRef.current) {
            debug.log('useCytoscape: Background clicked, clearing selection');
            onNodeSelect(null);
            return;
          }
          
          // If clicking on a node
          if (event.target.isNode()) {
            debug.log('useCytoscape: Node clicked:', event.target.id());
            if (!isDrawMode.current) {
              onNodeSelect(event.target);
            }
          }
        });
      }

      if (onEdgeSelect) {
        cyRef.current.on('tap', 'edge', (event) => {
          debug.log('useCytoscape: Edge clicked:', event.target.id());
          if (!isDrawMode.current) {
            onEdgeSelect(event.target);
          }
        });
      }

      // Initialize edge handles
      debug.log('useCytoscape: Initializing edge handles');
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
        complete: (sourceNode: NodeSingular, targetNode: NodeSingular) => {
          debug.log('useCytoscape: Edge creation completed:', { sourceNode: sourceNode.id(), targetNode: targetNode.id() });
          if (onCreateEdge) {
            onCreateEdge(sourceNode.id(), targetNode.id());
          }
        },
      });

      ehRef.current.disable();
    }

    // Sync tables whenever they change
    debug.log('useCytoscape: Initial sync of tables:', tables.map(t => t.id));
    syncTables(tables);

    return () => {
      if (cyRef.current) {
        debug.log('useCytoscape: Cleaning up');
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [container]);

  const addTable = (table: KeboolaTable, position?: { x: number; y: number }) => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    debug.log('useCytoscape: Adding/Updating table:', table.id);

    // Check if the node already exists
    const existingNode = cy.getElementById(table.id);
    if (existingNode.length > 0) {
      debug.log('useCytoscape: Updating existing node:', table.id);
      // Update existing node data but maintain its position
      const currentPosition = existingNode.position();
      existingNode.data({
        id: table.id,
        label: table.displayName || table.name,
        columns: table.columns,
      });
      existingNode.position(currentPosition);
      // Save the current position
      nodesRef.current[table.id] = { position: currentPosition };
      return;
    }

    debug.log('useCytoscape: Creating new node:', table.id);
    // Get saved position or generate a new one
    const savedPosition = nodesRef.current[table.id]?.position;
    const newPosition = position || savedPosition || {
      x: Math.random() * 500 + 100,
      y: Math.random() * 500 + 100,
    };

    // Add new node
    cy.add({
      group: 'nodes',
      data: {
        id: table.id,
        label: table.displayName || table.name,
        columns: table.columns,
      },
      position: newPosition,
    });

    // Save the position
    nodesRef.current[table.id] = { position: newPosition };
  };

  // Function to sync graph with current tables
  const syncTables = (tables: KeboolaTable[]) => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    debug.log('useCytoscape: Syncing tables:', tables.map(t => t.id));

    // Get current nodes
    const currentNodes = cy.nodes().map(node => node.id());
    debug.log('useCytoscape: Current nodes:', currentNodes);

    // Add or update nodes that should be in the graph
    tables.forEach(table => {
      debug.log('useCytoscape: Processing table:', table.id);
      addTable(table);
    });

    // Remove nodes that shouldn't be in the graph
    const tableIds = tables.map(t => t.id);
    currentNodes.forEach(nodeId => {
      if (!tableIds.includes(nodeId)) {
        debug.log('useCytoscape: Removing node:', nodeId);
        cy.getElementById(nodeId).remove();
      }
    });
  };

  // Effect to sync graph with tables prop
  useEffect(() => {
    if (!cyRef.current || !container) return;
    
    debug.log('useCytoscape: Tables changed, syncing graph');
    debug.log('useCytoscape: Current tables:', tables.map(t => t.id));
    
    // Get current nodes in the graph
    const currentNodes = cyRef.current.nodes().map(node => node.id());
    debug.log('useCytoscape: Current nodes in graph:', currentNodes);
    
    syncTables(tables);
  }, [tables]);

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
      debug.log('Relationship already exists between these tables');
      return;
    }

    // Create new edge with the new type
    const edgeId = id || `${sourceId}-${targetId}-${type}`;
    debug.log('Adding relationship:', { sourceId, targetId, type, edgeId });
    
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
      debug.log('Updated relationship:', { edgeId, newType });
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