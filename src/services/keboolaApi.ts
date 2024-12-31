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
      // First get the list of tables
      const response = await this.api.get(`/v2/storage/buckets/${bucketId}/tables`);
      
      if (!response.data) {
        throw new Error('No data received from Keboola API');
      }

      // Then fetch details for each table
      const tablesWithDetails = await Promise.all(
        response.data.map(async (table: any) => {
          try {
            const detailResponse = await this.api.get(`/v2/storage/tables/${table.id}`);
            const detail = detailResponse.data;

            // Process the columns from the detail response
            const columns = detail.definition?.columns?.map((col: any) => ({
              name: col.name,
              definition: {
                type: col.definition?.type || 'string',
                nullable: col.definition?.nullable || false,
                length: col.definition?.length || '',
              },
              basetype: col.basetype || 'string',
              canBeFiltered: col.canBeFiltered || false,
            })) || [];

            return {
              id: detail.id,
              name: detail.name,
              displayName: detail.displayName,
              primaryKey: detail.primaryKey || [],
              columns: columns,
              definition: {
                columns: columns,
                primaryKeysNames: detail.primaryKey || [],
              },
              metadata: detail.metadata || [],
              columnMetadata: detail.columnMetadata || {},
            };
          } catch (err) {
            console.error(`Failed to fetch details for table ${table.id}:`, err);
            return {
              ...table,
              columns: [],
              definition: {
                columns: [],
                primaryKeysNames: [],
              },
            };
          }
        })
      );

      return tablesWithDetails;
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
      console.log('Raw getTableDetail response:', JSON.stringify(response.data, null, 2));

      if (!response.data) {
        throw new Error('No data received from Keboola API');
      }

      // Process the columns from the API response
      const processColumns = (cols: any[] = []) => cols.map((col: any) => ({
        name: col.name,
        definition: {
          type: col.definition?.type || 'string',
          nullable: col.definition?.nullable || false,
          length: col.definition?.length || '',
        },
        basetype: col.basetype || 'string',
        canBeFiltered: col.canBeFiltered || false,
      }));

      // Get columns from both possible locations
      const columnsFromRoot = processColumns(response.data.columns);
      const columnsFromDefinition = processColumns(response.data.definition?.columns);
      
      // Use whichever set of columns is available, preferring definition.columns
      const columns = columnsFromDefinition.length > 0 ? columnsFromDefinition : columnsFromRoot;

      console.log('Processed columns:', {
        columnsFromRoot: columnsFromRoot.length,
        columnsFromDefinition: columnsFromDefinition.length,
        finalColumns: columns.length
      });

      // Process the response to ensure all required fields are present
      const tableDetail: KeboolaTable = {
        id: response.data.id,
        name: response.data.name,
        displayName: response.data.displayName,
        primaryKey: response.data.primaryKey || [],
        columns: columns,
        definition: {
          columns: columns,
          primaryKeysNames: response.data.primaryKey || [],
        },
        metadata: response.data.metadata || [],
        columnMetadata: response.data.columnMetadata || {},
      };

      console.log('Final processed table detail:', {
        id: tableDetail.id,
        name: tableDetail.name,
        columnsLength: tableDetail.columns.length,
        definitionColumnsLength: tableDetail.definition?.columns.length || 0
      });

      return tableDetail;
    } catch (error) {
      console.error('Failed to fetch table detail:', error);
      throw error;
    }
  }
}

export const keboolaApi = KeboolaApiService.getInstance(); 