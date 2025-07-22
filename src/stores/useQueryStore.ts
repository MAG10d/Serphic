import { create } from 'zustand';

interface QueryStore {
  selectedConnection: string | null;
  currentSql: string;
  autoQuery: {
    connection: any;
    tableName: string;
    sql: string;
  } | null;
  
  // Actions
  setSelectedConnection: (connectionId: string | null) => void;
  setCurrentSql: (sql: string) => void;
  setAutoQuery: (connection: any, tableName: string, customSql?: string) => void;
  clearAutoQuery: () => void;
}

export const useQueryStore = create<QueryStore>((set) => ({
  selectedConnection: null,
  currentSql: '-- 輸入您的 SQL 查詢\nSELECT "Hello, Serphic!" as message;',
  autoQuery: null,

  setSelectedConnection: (connectionId) => {
    set({ selectedConnection: connectionId });
  },

  setCurrentSql: (sql) => {
    set({ currentSql: sql });
  },

  setAutoQuery: (connection, tableName, customSql) => {
    // 使用自定義 SQL 或根據對象類型生成查詢
    let sql: string;
    if (customSql) {
      sql = customSql;
    } else if (tableName.startsWith('sqlite_') || tableName === 'sqlite_sequence') {
      sql = `SELECT * FROM "${tableName}";`;
    } else {
      sql = `SELECT * FROM "${tableName}" LIMIT 50;`;
    }
    
    set({ 
      autoQuery: { connection, tableName, sql },
      currentSql: sql,
      selectedConnection: connection.id
    });
  },

  clearAutoQuery: () => {
    set({ autoQuery: null });
  }
})); 