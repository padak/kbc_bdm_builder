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
  definition: KeboolaColumnDefinition;
  basetype: string;
  canBeFiltered: boolean;
}

export interface KeboolaTableDefinition {
  primaryKeysNames: string[];
  columns: KeboolaTableColumn[];
}

export interface KeboolaTable {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  primaryKey?: string[];
  columns?: string[];
  columnMetadata?: { [key: string]: KeboolaMetadata[] };
  definition?: KeboolaTableDefinition;
  metadata?: KeboolaMetadata[];
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
      const response = await this.api.get(`/v2/storage/buckets/${bucketId}/tables`);
      if (!response.data) {
        throw new Error('No data received from Keboola API');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      throw error;
    }
  }

  public async getTableDetail(tableId: string): Promise<KeboolaTable> {
    if (!this.config) throw new Error('Keboola API not configured');
    if (!tableId) throw new Error('Table ID is required');
    
    try {
      console.log('Fetching table detail for:', tableId);
      const response = await this.api.get(`/v2/storage/tables/${tableId}`);
      console.log('Raw API response:', response.data);
      if (!response.data) {
        throw new Error('No data received from Keboola API');
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch table detail:', error);
      throw error;
    }
  }
}

export const keboolaApi = KeboolaApiService.getInstance(); 