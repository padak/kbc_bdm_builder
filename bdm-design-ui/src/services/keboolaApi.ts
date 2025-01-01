import axios, { AxiosInstance } from 'axios';

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

export interface KeboolaMetadata {
  key: string;
  value: string;
}

export interface KeboolaColumnDefinition {
  type: string;
  nullable: boolean;
  length?: string;
}

export interface KeboolaColumn {
  name: string;
  type: string;
  basetype: string;
  definition: KeboolaColumnDefinition;
}

export interface KeboolaTable {
  id: string;
  name: string;
  displayName?: string;
  primaryKey?: string[];
  columns?: KeboolaColumn[];
  definition?: {
    columns: KeboolaColumn[];
  };
  metadata?: KeboolaMetadata[];
  columnMetadata?: {
    [key: string]: KeboolaMetadata[];
  };
}

class KeboolaApiService {
  private api: AxiosInstance;
  private config: KeboolaConfig | null = null;
  private static instance: KeboolaApiService;

  private constructor() {
    this.api = axios.create();
  }

  public static getInstance(): KeboolaApiService {
    if (!KeboolaApiService.instance) {
      KeboolaApiService.instance = new KeboolaApiService();
    }
    return KeboolaApiService.instance;
  }

  public configure({ apiToken, instanceUrl }: KeboolaConfig): void {
    this.config = { apiToken, instanceUrl };
    this.api = axios.create({
      baseURL: instanceUrl,
      headers: {
        'X-StorageApi-Token': apiToken,
        'Content-Type': 'application/json',
      },
    });
  }

  public async testConnection(): Promise<boolean> {
    if (!this.config) throw new Error('Keboola API not configured');
    try {
      const response = await this.api.get('/v2/storage');
      return response.status === 200;
    } catch (error) {
      console.error('Failed to connect to Keboola:', error);
      return false;
    }
  }

  public async listBuckets(): Promise<KeboolaBucket[]> {
    if (!this.config) throw new Error('Keboola API not configured');
    try {
      const response = await this.api.get('/v2/storage/buckets');
      if (!response.data) {
        throw new Error('No data received from Keboola API');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch buckets:', error);
      throw error;
    }
  }

  public async listTables(bucketId: string): Promise<KeboolaTable[]> {
    if (!this.config) throw new Error('Keboola API not configured');
    if (!bucketId) throw new Error('Bucket ID is required');
    
    try {
      // Get tables with all details in one call
      const response = await this.api.get(`/v2/storage/buckets/${bucketId}/tables?include=columns,metadata,columnMetadata`);
      if (!response.data) {
        throw new Error('No data received from Keboola API');
      }
      
      // Process the response to ensure proper column structure
      const tables = response.data.map((table: any) => {
        // Ensure columns is an array and has proper structure
        const columns = Array.isArray(table.columns) 
          ? table.columns.map((col: any) => ({
              name: col.name || '',
              type: col.type || 'STRING',
              basetype: col.basetype || col.type || 'STRING',
              definition: {
                type: col.type || 'STRING',
                nullable: col.nullable !== false,
                length: col.length,
              }
            }))
          : [];

        return {
          ...table,
          columns,
          metadata: table.metadata || [],
          columnMetadata: table.columnMetadata || {},
        };
      });

      console.log('Processed tables:', tables);
      return tables;
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      throw error;
    }
  }

  public async getTableDetail(tableId: string): Promise<KeboolaTable> {
    if (!this.config) throw new Error('Keboola API not configured');
    if (!tableId) throw new Error('Table ID is required');
    
    try {
      const response = await this.api.get(`/v2/storage/tables/${tableId}?include=columns,metadata,columnMetadata`);
      if (!response.data) {
        throw new Error('No data received from Keboola API');
      }

      // Process the response to ensure proper column structure
      const table = response.data;
      const columns = Array.isArray(table.columns) 
        ? table.columns.map((col: any) => ({
            name: col.name || '',
            type: col.type || 'STRING',
            basetype: col.basetype || col.type || 'STRING',
            definition: {
              type: col.type || 'STRING',
              nullable: col.nullable !== false,
              length: col.length,
            }
          }))
        : [];

      const processedTable = {
        ...table,
        columns,
        metadata: table.metadata || [],
        columnMetadata: table.columnMetadata || {},
      };

      console.log('Processed table detail:', processedTable);
      return processedTable;
    } catch (error) {
      console.error('Failed to fetch table detail:', error);
      throw error;
    }
  }
}

export const keboolaApi = KeboolaApiService.getInstance(); 