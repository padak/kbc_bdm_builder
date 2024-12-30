# Keboola BDM Designer

A visual tool for designing Business Data Models (BDM) in Keboola Connection. This application allows users to create and manage data model diagrams by selecting tables from their Keboola project and defining relationships between them.

## Current Features

- ✅ Authentication with Keboola Connection API
- ✅ Loading and displaying tables from Keboola Storage
- ✅ Interactive canvas for table placement and relationship design
- ✅ Table details panel showing:
  - Column names
  - Data types
  - Primary key indicators
  - Column descriptions
  - Table descriptions (from KBC.description metadata)
- ✅ Canvas controls:
  - Zoom in/out
  - Fit to view
  - Grid layout
- ✅ Edge creation between tables
- ✅ State persistence (layout and relationships are preserved)

## Pending Requirements

- [ ] Export functionality for the BDM design
- [ ] Import existing BDM designs
- [ ] Ability to add custom descriptions and metadata
- [ ] Advanced edge properties (relationship types, cardinality)
- [ ] Undo/redo functionality
- [ ] Multiple BDM diagram support
- [ ] Collaboration features
- [ ] Version control for BDM designs

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
- React
- TypeScript
- Material-UI
- Cytoscape.js for graph visualization
- Vite as the build tool

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 