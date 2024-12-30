# Keboola BDM Designer

A visual tool for designing Business Data Models (BDM) in Keboola Connection. This application allows users to create and manage data model diagrams by selecting tables from their Keboola project and defining relationships between them.

## Current Features

- ✅ Authentication & Data Connection:
  - Keboola Connection API integration
  - Support for different Keboola instances
  - Secure credential storage
  - API token validation

- ✅ Table Management:
  - Load and display tables from Keboola Storage
  - Display table metadata from API
  - Table search functionality
  - Table details panel showing:
    - Column names and data types
    - Primary key indicators
    - Column descriptions
    - Table descriptions (from KBC.description metadata)

- ✅ Visual Design:
  - Interactive canvas for table placement
  - Drag-and-drop functionality
  - Canvas controls:
    - Zoom in/out
    - Fit to view
    - Grid layout
  - Responsive layout
  - Right panel for table details

- ✅ Relationship Management:
  - Basic edge creation between tables
  - Visual connection indicators
  - Edge persistence

- ✅ State Management:
  - Save and restore canvas state
  - Preserve table positions
  - Maintain relationships between sessions

## Pending Requirements

- [ ] Advanced Relationship Features:
  - Relationship types (Parent-Child, M:N)
  - Cardinality indicators
  - Edge descriptions and metadata
  - AI-powered relationship suggestions

- [ ] Data Model Documentation:
  - Custom descriptions for tables and columns
  - Relationship documentation
  - Export documentation in various formats

- [ ] Import/Export:
  - Export BDM design to JSON
  - Import existing BDM designs
  - Export to visual formats (PDF, PNG)

- [ ] Collaboration Features:
  - Multi-user support
  - Comments and annotations
  - Version control
  - Design sharing

- [ ] Advanced Features:
  - Undo/redo functionality
  - Multiple BDM diagram support
  - Table grouping
  - Advanced search and filtering
  - Template support

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the displayed URL
5. Enter your Keboola Connection API token and instance URL

## Development

The application is built using:
- React with TypeScript for type safety
- Material-UI for consistent design
- Cytoscape.js for graph visualization
- Vite as the build tool

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 