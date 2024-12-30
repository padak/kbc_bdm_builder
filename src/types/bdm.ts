export type PropertyType = 'Key' | 'Property' | 'Value';
export type TableType = 'Object' | 'Property' | 'Value';
export type RelationType = 'Parent-Child' | 'M:N';

export interface Position {
  x: number;
  y: number;
}

export interface Property {
  name: string;
  type: PropertyType;
  comments?: string;
}

export interface Table {
  name: string;
  type: TableType;
  comments?: string;
  properties: Property[];
  position: Position;
}

export interface Relationship {
  from: string;
  to: string;
  type: RelationType;
  comments?: string;
}

export interface BDM {
  bdmName: string;
  tables: Table[];
  relationships: Relationship[];
}

export interface Group {
  id: string;
  name: string;
  tables: string[];
  position: Position;
}

export interface BDMWithGroups extends BDM {
  groups: Group[];
} 