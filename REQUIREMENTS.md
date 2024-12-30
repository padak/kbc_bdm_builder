# Original Requirements for BDM Designer

## Overview
The Business Data Model (BDM) Designer is a tool for creating and managing data model diagrams in Keboola Connection. It allows users to visually represent relationships between tables in their Keboola project and document the data structure.

## Core Requirements

### Authentication
- Connect to Keboola Connection using API token
- Support for different Keboola instances (US, EU, etc.)
- Secure storage of credentials

### Table Management
- Load tables from Keboola Storage
- Display table metadata:
  - Column names
  - Data types
  - Primary keys
  - Descriptions from metadata
- Support for table search and filtering

### Visual Design
- Interactive canvas for table placement
- Drag-and-drop functionality
- Zoom and pan controls
- Grid layout option
- Fit to view functionality

### Relationship Management
- Create edges between tables
- Define relationship types
- Specify cardinality
- Add descriptions to relationships

### Data Model Documentation
- Add descriptions to tables and columns
- Support for custom metadata
- Document relationships and dependencies
- Export documentation in various formats

### State Management
- Save and restore canvas state
- Preserve table positions and relationships
- Support for multiple BDM versions
- Undo/redo functionality

### Collaboration
- Share BDM designs with team members
- Support for comments and annotations
- Version control for designs
- Export/Import functionality

## Technical Requirements

### Frontend
- Modern React application
- TypeScript for type safety
- Material-UI for consistent design
- Responsive layout
- Cross-browser compatibility

### Graph Visualization
- Cytoscape.js for graph rendering
- Support for custom node styling
- Edge routing and arrow styles
- Performance optimization for large graphs

### State Management
- Efficient state updates
- Persistent storage
- History tracking
- Real-time updates

### API Integration
- Keboola Storage API integration
- Error handling
- Rate limiting
- Caching for performance

## Future Enhancements
- Integration with Keboola Transformations
- SQL generation from visual model
- Data lineage visualization
- Advanced search and filtering
- Template support for common patterns
- Automated layout algorithms
- Custom styling and themes
- Export to various formats (PDF, PNG, etc.) 