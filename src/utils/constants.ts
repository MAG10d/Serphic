export const APP_NAME = 'Serphic';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = '資料庫管理，重新定義';

// Database Types
export const DATABASE_TYPES = [
  { value: 'mysql', label: 'MySQL', defaultPort: 3306 },
  { value: 'postgresql', label: 'PostgreSQL', defaultPort: 5432 },
  { value: 'sqlite', label: 'SQLite', defaultPort: 0 },
  { value: 'mongodb', label: 'MongoDB', defaultPort: 27017 },
] as const;

// Basic Configuration
export const EDITOR_CONFIG = {
  fontSize: 14,
  tabSize: 2,
  lineHeight: 1.4,
} as const;

// Connection Timeouts
export const CONNECTION_TIMEOUT = 10000; // 10 seconds
export const QUERY_TIMEOUT = 30000; // 30 seconds

// Local Storage Keys
export const STORAGE_KEYS = {
  connections: 'serphic_connections',
  settings: 'serphic_settings',
  recentQueries: 'serphic_recent_queries',
} as const; 