# BDM Design UI

A user-friendly UI application for designing Business Data Models (BDM) using data from Keboola Storage API.

## Features

- Connect to Keboola Storage API
- Visual modeling of data relationships
- Drag-and-drop interface
- Support for Objects, Properties, and Values
- Save and load BDM designs
- Group tables for better organization
- Add comments to tables and relationships

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- A Keboola Storage API token
- A Keboola instance URL

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bdm-design-ui
```

2. Install dependencies:
```bash
npm install
```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
```

The build output will be in the `dist` directory.

## Usage

1. When you first open the application, you'll be prompted to enter your Keboola Storage API credentials:
   - API Token
   - Instance URL (e.g., https://connection.keboola.com)

2. After connecting, you'll see the main BDM designer interface:
   - Left panel: Available tables from Keboola
   - Main canvas: BDM design area
   - Right panel: Properties and settings for selected items

3. To create your BDM:
   - Drag tables from the left panel onto the canvas
   - Create relationships by dragging between tables
   - Use the right panel to edit properties and add comments
   - Group related tables by selecting them and using the group function

4. Save your BDM design using the save button in the toolbar

## Project Structure

```
src/
  ├── components/       # React components
  ├── services/        # API and service functions
  ├── store/           # State management
  ├── types/           # TypeScript type definitions
  ├── hooks/           # Custom React hooks
  └── utils/           # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 