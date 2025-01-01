import { useEffect, useRef, useCallback } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular, ElementDefinition, Position } from 'cytoscape';
import { KeboolaTable } from '../services/keboolaApi';

interface UseCytoscapeOptions {
  container: HTMLElement | null;
  tables: KeboolaTable[];
  onNodeSelect?: (node: NodeSingular) => void;
  onEdgeSelect?: (edge: EdgeSingular) => void;
  onCreateEdge?: (sourceId: string, targetId: string) => void;
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
  onCreateEdge,
}: UseCytoscapeOptions) => {
  const cyRef = useRef<Core | null>(null);
  const nodesRef = useRef<{ [key: string]: NodeData }>({});
  const containerRef = useRef<HTMLElement | null>(null);
  const dragStartNode = useRef<NodeSingular | null>(null);

  // Initialize cytoscape when container changes
  useEffect(() => {
    if (!container) return;

    // Only reinitialize if container actually changed
    if (containerRef.current === container) {
      return;
    }

    // Save new container reference
    containerRef.current = container;

    // Clean up existing instance
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    // Create new cytoscape instance
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
          },
        },
        {
          selector: '.eh-preview',
          style: {
            'border-color': '#ff0000',
            'border-width': 3,
          },
        },
      ],
      layout: {
        name: 'preset',
      },
      wheelSensitivity: 0.2,
    });

    const cy = cyRef.current;

    // Prevent context menu
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Handle right-click start
    container.addEventListener('mousedown', (e) => {
      if (e.button === 2) { // Right mouse button
        const renderedPosition = {
          x: e.offsetX,
          y: e.offsetY,
        };
        const targetNode = cy.nodes().filter(node => {
          const bbox = node.renderedBoundingBox();
          return (
            renderedPosition.x >= bbox.x1 &&
            renderedPosition.x <= bbox.x2 &&
            renderedPosition.y >= bbox.y1 &&
            renderedPosition.y <= bbox.y2
          );
        })[0];

        if (targetNode) {
          dragStartNode.current = targetNode;
          console.log('Right-click start on node:', targetNode.id());
        }
      }
    });

    // Handle mouse move
    container.addEventListener('mousemove', (e) => {
      if (!dragStartNode.current) return;

      cy.nodes().removeClass('eh-preview');
      const renderedPosition = {
        x: e.offsetX,
        y: e.offsetY,
      };
      const targetNode = cy.nodes().filter(node => {
        const bbox = node.renderedBoundingBox();
        return (
          renderedPosition.x >= bbox.x1 &&
          renderedPosition.x <= bbox.x2 &&
          renderedPosition.y >= bbox.y1 &&
          renderedPosition.y <= bbox.y2
        );
      })[0];
      
      if (targetNode && targetNode !== dragStartNode.current) {
        targetNode.addClass('eh-preview');
        console.log('Hovering over node:', targetNode.id());
      }
    });

    // Handle right-click end
    container.addEventListener('mouseup', (e) => {
      if (e.button === 2 && dragStartNode.current) { // Right mouse button
        const renderedPosition = {
          x: e.offsetX,
          y: e.offsetY,
        };
        const targetNode = cy.nodes().filter(node => {
          const bbox = node.renderedBoundingBox();
          return (
            renderedPosition.x >= bbox.x1 &&
            renderedPosition.x <= bbox.x2 &&
            renderedPosition.y >= bbox.y1 &&
            renderedPosition.y <= bbox.y2
          );
        })[0];
        
        if (targetNode && targetNode !== dragStartNode.current) {
          const sourceId = dragStartNode.current.id();
          const targetId = targetNode.id();
          console.log('Creating edge from', sourceId, 'to', targetId);
          
          if (onCreateEdge) {
            onCreateEdge(sourceId, targetId);
            // Add visual edge
            cy.add({
              group: 'edges',
              data: {
                source: sourceId,
                target: targetId,
              }
            });
          }
        }
        dragStartNode.current = null;
        cy.nodes().removeClass('eh-preview');
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
      containerRef.current = null;
    };
  }, [container]);

  // Save node positions before updates
  const saveNodePositions = useCallback(() => {
    if (!cyRef.current) return;
    cyRef.current.nodes().forEach((node) => {
      nodesRef.current[node.id()] = {
        position: node.position(),
        ...node.data(),
      };
    });
  }, []);

  // Effect to sync graph with tables prop
  useEffect(() => {
    if (!cyRef.current) return;
    
    const cy = cyRef.current;
    
    // Save current node positions
    saveNodePositions();
    
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
        // Save position before removing
        const node = cy.getElementById(nodeId);
        if (node.length > 0) {
          nodesRef.current[nodeId] = {
            position: node.position(),
            ...node.data(),
          };
        }
        node.remove();
      }
    });
  }, [tables, saveNodePositions]);

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