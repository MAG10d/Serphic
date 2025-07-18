import { create } from 'zustand';
import { DatabaseConnection, ConnectionStatus } from '../types/database';

interface ConnectionStore {
  connections: DatabaseConnection[];
  activeConnection: DatabaseConnection | null;
  connectionStatus: ConnectionStatus;
  
  // Actions
  addConnection: (connection: Omit<DatabaseConnection, 'id' | 'createdAt'>) => void;
  removeConnection: (id: string) => void;
  updateConnection: (id: string, updates: Partial<DatabaseConnection>) => void;
  setActiveConnection: (connection: DatabaseConnection | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  testConnection: (connection: DatabaseConnection) => Promise<boolean>;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: [],
  activeConnection: null,
  connectionStatus: 'disconnected',

  addConnection: (connectionData) => {
    const newConnection: DatabaseConnection = {
      ...connectionData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      connections: [...state.connections, newConnection]
    }));
  },

  removeConnection: (id) => {
    set((state) => ({
      connections: state.connections.filter(conn => conn.id !== id),
      activeConnection: state.activeConnection?.id === id ? null : state.activeConnection
    }));
  },

  updateConnection: (id, updates) => {
    set((state) => ({
      connections: state.connections.map(conn =>
        conn.id === id ? { ...conn, ...updates } : conn
      )
    }));
  },

  setActiveConnection: (connection) => {
    set({ activeConnection: connection });
  },

  setConnectionStatus: (status) => {
    set({ connectionStatus: status });
  },

  testConnection: async (connection) => {
    // TODO: 實現與 Tauri 後端的連接測試
    try {
      set({ connectionStatus: 'connecting' });
      
      // 模擬連接測試（實際應該調用 Tauri 命令）
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set({ connectionStatus: 'connected' });
      return true;
    } catch (error) {
      set({ connectionStatus: 'error' });
      return false;
    }
  }
})); 