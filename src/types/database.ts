export type DatabaseType = 'mysql' | 'postgresql' | 'sqlite' | 'mongodb';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface DatabaseConnection {
  id: string;
  name: string;
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface DatabaseSchema {
  name: string;
  tables: DatabaseTable[];
}

export interface DatabaseTable {
  name: string;
  columns: DatabaseColumn[];
  indexes: DatabaseIndex[];
  rowCount?: number;
}

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  autoIncrement?: boolean;
}

export interface DatabaseIndex {
  name: string;
  columns: string[];
  unique: boolean;
  type: 'primary' | 'unique' | 'index';
}

export interface QueryResult {
  columns: string[];
  rows: any[][];
  affectedRows?: number;
  executionTime: number;
}

export interface QueryError {
  message: string;
  code?: string;
  line?: number;
  column?: number;
} 