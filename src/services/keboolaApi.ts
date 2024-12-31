import axios, { AxiosInstance } from 'axios';
import debug from '../utils/debug';

// Force immediate logging
console.error('%c[DEBUG-API]', 'color: green; font-weight: bold', 'KeboolaApi module loaded at', new Date().toISOString());

export interface KeboolaConfig {
  apiToken: string;
  instanceUrl: string;
}

export interface KeboolaBucket {
  id: string;
  name: string;
  stage: string;
  description: string;
}

export interface KeboolaColumn {
  name: string;
  type: string;
  nullable: boolean;
  length?: string;
  default?: string;
  description?: string;
}

export interface KeboolaMetadata {
  id: string;
  key: string;
  value: string;
  provider: string;
  timestamp: string;
}

export interface KeboolaColumnDefinition {
  type: string;
  nullable: boolean;
  length: string;
}

export interface KeboolaTableColumn {
  name: string;
  definition: {
    type: string;
    nullable: boolean;
    length: string;
  };
  basetype: string;
  canBeFiltered?: boolean;
}

export interface KeboolaTableDefinition {
  columns: KeboolaTableColumn[];
  primaryKeysNames?: string[];
}

export interface KeboolaTable {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  primaryKey?: string[];
  columns: KeboolaTableColumn[];
  columnMetadata?: { [key: string]: KeboolaMetadata[] };
  definition?: KeboolaTableDefinition;
  metadata?: KeboolaMetadata[];
}

export class KeboolaApiService {
  private static instance: KeboolaApiService;
  private config: KeboolaConfig | null = null;

  private constructor() {
    debug.log('KeboolaApiService instance created');
  }

  public static getInstance(): KeboolaApiService {
    if (!KeboolaApiService.instance) {
      debug.log('Creating new KeboolaApiService instance');
      KeboolaApiService.instance = new KeboolaApiService();
    }
    return KeboolaApiService.instance;
  }

  public setConfig(config: KeboolaConfig) {
    debug.log('Setting Keboola API config:', { url: config.instanceUrl });
    this.config = config;
  }

  public async listBuckets(): Promise<KeboolaBucket[]> {
    debug.log('Fetching buckets list');
    if (!this.config) throw new Error('Keboola API not configured');
    try {
      debug.log('Making API request to:', `${this.config.instanceUrl}/buckets`);
      const response = await axios.get<KeboolaBucket[]>(
        `${this.config.instanceUrl}/buckets`,
        {
          headers: { 'X-StorageApi-Token': this.config.apiToken },
        }
      );
      if (!response.data) {
        throw new Error('No data received from Keboola API');
      }
      debug.log('Received buckets:', response.data);
      return response.data;
    } catch (error) {
      debug.error('Failed to fetch buckets:', error);
      throw error;
    }
  }

  public async listTables(bucketId: string): Promise<KeboolaTable[]> {
    debug.log('Fetching tables for bucket:', bucketId);
    if (!this.config) throw new Error('Keboola API not configured');
    if (!bucketId) throw new Error('Bucket ID is required');
    try {
      debug.log('Making API request to:', `${this.config.instanceUrl}/buckets/${bucketId}/tables`);
      const response = await axios.get<KeboolaTable[]>(
        `${this.config.instanceUrl}/buckets/${bucketId}/tables`,
        {
          headers: { 'X-StorageApi-Token': this.config.apiToken },
        }
      );
      if (!response.data) {
        throw new Error('No data received from Keboola API');
      }
      debug.log('Received tables for bucket:', bucketId, response.data);
      return response.data;
    } catch (error) {
      debug.error('Failed to fetch tables:', error);
      throw error;
    }
  }

  public async getTableDetail(tableId: string): Promise<KeboolaTable> {
    debug.log('Fetching details for table:', tableId);
    if (!this.config) throw new Error('Keboola API not configured');
    if (!tableId) throw new Error('Table ID is required');
    try {
      debug.log('Making API request to:', `${this.config.instanceUrl}/tables/${tableId}`);
      const response = await axios.get<KeboolaTable>(
        `${this.config.instanceUrl}/tables/${tableId}`,
        {
          headers: { 'X-StorageApi-Token': this.config.apiToken },
        }
      );
      if (!response.data) {
        throw new Error('No data received from Keboola API');
      }
      debug.log('Received table details:', response.data);
      return response.data;
    } catch (error) {
      debug.error('Failed to fetch table details:', error);
      throw error;
    }
  }
}

export const keboolaApi = KeboolaApiService.getInstance(); 