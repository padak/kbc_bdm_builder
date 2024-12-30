import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['cytoscape', 'cytoscape-edgehandles'],
  },
  resolve: {
    alias: {
      'cytoscape-edgehandles': 'cytoscape-edgehandles/cytoscape-edgehandles.js',
    },
  },
}); 