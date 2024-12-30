# BDM Designer Requirements

## Overview
The Business Data Model (BDM) Designer is a tool for creating and managing data model diagrams in Keboola Connection. This client-side application enables users to visually represent relationships between tables in their Keboola project, document the data structure, and manage multiple BDM designs for various use cases such as e-commerce, CRM, and more.

## Core Requirements

### Authentication & Data Connection
- Connect to Keboola Connection using API token
- Support for different Keboola instances (US, EU, etc.)
- Secure storage of credentials
- API Integration:
  - List buckets and tables using Storage API
  - Fetch table details and metadata
  - Handle rate limiting and caching
  - Error handling and validation

### Table Management
- Load and display tables from Keboola Storage
- Display table metadata:
  - Column names and data types
  - Primary keys
  - Descriptions from metadata
  - Table relationships
- Support for table search and filtering
- Distinguish between data types:
  - Objects (e.g., Customers, Products)
  - Properties (e.g., Customer Name, Product Price)
  - Values (e.g., Order Total)

### Visual Design & Interface
- Interactive canvas for table placement
- Drag-and-drop functionality
- Canvas controls:
  - Zoom and pan
  - Grid layout
  - Fit to view
- Layout structure:
  - Left Panel: List of imported tables and columns
  - Main Canvas: Visual workspace for BDM design
  - Right Panel: Properties and comments for selected items
- Visual indicators:
  - Different colors/shapes for Objects, Properties, and Values
  - Relationship lines and arrows
  - Grouping indicators

### Relationship Management
- Create edges between tables
- Define relationship types (Parent-Child, M:N)
- Specify cardinality
- Add descriptions to relationships
- AI-powered relationship suggestions:
  - Based on schema analysis
  - Using metadata
  - Optional integration with OpenAI/Claude/Gemini

### Data Model Documentation
- Add descriptions to:
  - Tables
  - Columns
  - Relationships
- Support for custom metadata
- Document dependencies
- Export documentation in various formats
- Tooltips and inline help

### State Management & Persistence
- Save and restore canvas state
- Preserve:
  - Table positions (X,Y coordinates)
  - Relationships
  - Groups
  - Comments
  - Metadata
- Support for multiple BDM versions
- Undo/redo functionality
- Local storage for session persistence
- JSON export/import with structure:
  ```json
  {
    "bdmName": "string",
    "tables": [{
      "name": "string",
      "type": "Object|Property|Value",
      "comments": "string",
      "position": {"x": number, "y": number},
      "properties": [{
        "name": "string",
        "type": "string",
        "comments": "string"
      }]
    }],
    "relationships": [{
      "from": "string",
      "to": "string",
      "type": "string",
      "comments": "string"
    }],
    "groups": [{
      "name": "string",
      "tables": ["string"]
    }]
  }
  ```

### Collaboration Features
- Share BDM designs with team members
- Support for comments and annotations
- Version control for designs
- Export/Import functionality
- Multi-user editing support (future)

## Technical Requirements

### Frontend Stack
- React with TypeScript
- Material-UI for consistent design
- Cytoscape.js for graph visualization
- Responsive layout
- Cross-browser compatibility

### Graph Visualization
- Cytoscape.js implementation
- Custom node styling
- Edge routing and arrow styles
- Performance optimization for large graphs
- Support for:
  - Grouping/ungrouping
  - Node positioning
  - Edge creation/deletion
  - Visual hierarchy

### State Management
- Efficient state updates
- Persistent storage
- History tracking
- Real-time updates
- Session management

## Development Workflow
1. Project Setup
   - Frontend framework installation
   - API integration configuration
   - Development environment setup

2. Component Development
   - Table list component
   - Visual modeling canvas
   - Property editor
   - Control panel

3. Data Flow Implementation
   - API data fetching
   - State management
   - User interaction handling

4. Testing
   - JSON export/import validation
   - UI responsiveness
   - Performance testing
   - Cross-browser testing

5. Design Polish
   - UI/UX optimization
   - Performance tuning
   - Documentation

## Future Enhancements
- Integration with Keboola Transformations
- SQL generation from visual model
- Data lineage visualization
- Advanced search and filtering
- Template support for common patterns
- Automated layout algorithms
- Custom styling and themes
- Export to various formats (PDF, PNG, etc.)
- AI-powered features:
  - Relationship suggestions
  - Documentation generation
  - Schema optimization
- Real-time collaboration
- Advanced version control
- Integration with other Keboola components 