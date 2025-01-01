declare module 'cytoscape-edgehandles' {
  import { Core } from 'cytoscape';
  
  function register(cytoscape: any): void;
  
  export = register;
} 