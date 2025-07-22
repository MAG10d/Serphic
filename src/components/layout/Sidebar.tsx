import React, { useState } from 'react';
import { Home, Database, Settings, Plus, Code, ChevronRight, ChevronDown, Table, BarChart3, Eye, Zap, Hash } from 'lucide-react';
import { useConnectionStore } from '../../stores/useConnectionStore';
import { useQueryStore } from '../../stores/useQueryStore';
import { invoke } from '@tauri-apps/api/core';
import { Page } from '../../types/navigation';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

interface TableInfo {
  name: string;
  row_count: number;
  table_type: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { connections } = useConnectionStore();
  const { setAutoQuery } = useQueryStore();
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set());
  const [connectionTables, setConnectionTables] = useState<Record<string, TableInfo[]>>({});
  const [loadingTables, setLoadingTables] = useState<Set<string>>(new Set());
  const [expandedObjectTypes, setExpandedObjectTypes] = useState<Set<string>>(new Set());
  
  const menuItems = [
    { icon: Home, label: '首頁', id: 'home' as Page },
    { icon: Database, label: '連接', id: 'connections' as Page },
    { icon: Code, label: 'SQL查詢', id: 'query' as Page },
    { icon: Settings, label: '設定', id: 'settings' as Page },
  ];

  const toggleConnection = async (connectionId: string) => {
    const newExpanded = new Set(expandedConnections);
    
    if (newExpanded.has(connectionId)) {
      // 收起連接
      newExpanded.delete(connectionId);
    } else {
      // 展開連接
      newExpanded.add(connectionId);
      
      // 如果還沒有載入表格，則載入
      if (!connectionTables[connectionId] && !loadingTables.has(connectionId)) {
        await loadConnectionTables(connectionId);
      }
    }
    
    setExpandedConnections(newExpanded);
  };

  const toggleObjectType = (connectionId: string, objectType: string) => {
    const key = `${connectionId}_${objectType}`;
    const newExpanded = new Set(expandedObjectTypes);
    
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    
    setExpandedObjectTypes(newExpanded);
  };

  const groupTablesByType = (tables: TableInfo[]) => {
    const grouped = tables.reduce((acc, table) => {
      const type = table.table_type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(table);
      return acc;
    }, {} as Record<string, TableInfo[]>);

    // 確保順序：table, view, index, trigger
    const orderedTypes = ['table', 'view', 'index', 'trigger'];
    const result: Record<string, TableInfo[]> = {};
    
    orderedTypes.forEach(type => {
      if (grouped[type]) {
        result[type] = grouped[type];
      }
    });

    return result;
  };

  const getObjectTypeLabel = (type: string) => {
    switch (type) {
      case 'table': return '表格';
      case 'view': return '檢視表';
      case 'index': return '索引';
      case 'trigger': return '觸發器';
      default: return type;
    }
  };

  const getObjectTypeColor = (type: string) => {
    switch (type) {
      case 'table': return 'text-blue-400';
      case 'view': return 'text-green-400';
      case 'index': return 'text-yellow-400';
      case 'trigger': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const loadConnectionTables = async (connectionId: string) => {
    const connection = connections.find(conn => conn.id === connectionId);
    if (!connection) return;

    setLoadingTables(prev => new Set(prev).add(connectionId));

    try {
      const result = await invoke('get_database_tables', {
        connection: {
          name: connection.name,
          db_type: connection.type,
          host: connection.host,
          port: connection.port,
          database: connection.database,
          username: connection.username,
          password: connection.password,
        }
      }) as { success: boolean; tables: TableInfo[]; message: string };

      if (result.success) {
        setConnectionTables(prev => ({
          ...prev,
          [connectionId]: result.tables
        }));
      } else {
        console.error('載入表格失敗:', result.message);
      }
    } catch (error) {
      console.error('載入表格錯誤:', error);
    } finally {
      setLoadingTables(prev => {
        const newSet = new Set(prev);
        newSet.delete(connectionId);
        return newSet;
      });
    }
  };

  const handleTableClick = (connection: any, tableName: string, tableType: string) => {
    // 立即給視覺反饋
    setLoadingTables(prev => new Set(prev).add(`${connection.id}_${tableName}`));
    
    // 先切換到查詢頁面
    onPageChange('query');
    
    // 根據對象類型設置不同的查詢
    setTimeout(() => {
      if (tableType === 'table' || tableType === 'view') {
        setAutoQuery(connection, tableName);
      } else if (tableType === 'index') {
        // 對於索引，查詢索引信息
        const sql = `PRAGMA index_info("${tableName}");`;
        setAutoQuery(connection, tableName, sql);
      } else if (tableType === 'trigger') {
        // 對於觸發器，顯示觸發器定義
        const sql = `SELECT sql FROM sqlite_master WHERE type='trigger' AND name='${tableName}';`;
        setAutoQuery(connection, tableName, sql);
      } else {
        setAutoQuery(connection, tableName);
      }
      
      // 清除載入狀態
      setLoadingTables(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${connection.id}_${tableName}`);
        return newSet;
      });
    }, 10);
  };

  const getObjectIcon = (objectType: string) => {
    switch (objectType) {
      case 'table':
        return Table;
      case 'view':
        return Eye;
      case 'index':
        return Hash; // 使用 Hash 圖標替代不存在的 Index
      case 'trigger':
        return Zap;
      default:
        return Table;
    }
  };

  const getObjectColor = (objectType: string) => {
    switch (objectType) {
      case 'table':
        return 'text-blue-400';
      case 'view':
        return 'text-green-400';
      case 'index':
        return 'text-yellow-400';
      case 'trigger':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <aside className="w-64 bg-gray-800/90 backdrop-blur-md border-r border-gray-600/50 flex flex-col">
      {/* Navigation Menu */}
      <nav className="p-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded text-sm transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-600/90 text-white backdrop-blur-sm'
                  : 'text-gray-400 hover:bg-gray-700/80 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Connections Section */}
      <div className="flex-1 p-2 overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            資料庫連接
          </h3>
          <button 
            className="p-1 hover:bg-gray-700/80 rounded transition-colors"
            onClick={() => onPageChange('connections')}
          >
            <Plus className="w-3 h-3 text-gray-400" />
          </button>
        </div>
        
        {/* Connection List */}
        <div className="space-y-1">
          {connections.length === 0 ? (
            <div className="text-xs text-gray-500 italic py-2">
              尚無連接
            </div>
          ) : (
            connections.map((connection) => (
              <div key={connection.id}>
                {/* Connection Header */}
                <div
                  className="flex items-center px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 rounded cursor-pointer"
                  onClick={() => toggleConnection(connection.id)}
                >
                  <div className="flex-1 flex items-center space-x-2">
                    {expandedConnections.has(connection.id) ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    <Database className="w-3 h-3" />
                    <span className="truncate">{connection.name}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {connection.type.toUpperCase()}
                  </span>
                </div>

                {/* Database Objects List */}
                {expandedConnections.has(connection.id) && (
                  <div className="ml-4 mt-1 space-y-1">
                    {loadingTables.has(connection.id) ? (
                      <div className="text-xs text-gray-500 px-2 py-1">
                        載入中...
                      </div>
                    ) : connectionTables[connection.id] && connectionTables[connection.id].length > 0 ? (
                      <>
                        {/* 表格直接顯示 */}
                        {connectionTables[connection.id]
                          .filter(obj => obj.table_type === 'table')
                          .map((table) => {
                            const ObjectIcon = getObjectIcon(table.table_type);
                            const objectColor = getObjectColor(table.table_type);
                            
                            return (
                              <div
                                key={table.name}
                                className="flex items-center justify-between px-2 py-1 text-xs text-gray-400 hover:bg-gray-700 rounded cursor-pointer"
                                onClick={() => handleTableClick(connection, table.name, table.table_type)}
                              >
                                <div className="flex items-center space-x-2">
                                  <ObjectIcon className={`w-3 h-3 ${objectColor}`} />
                                  <span className="truncate">{table.name}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <BarChart3 className="w-2 h-2" />
                                  <span className="text-gray-500">{table.row_count}</span>
                                </div>
                              </div>
                            );
                          })}

                        {/* 其他類型分組顯示 */}
                        {Object.entries(groupTablesByType(connectionTables[connection.id]))
                          .filter(([type]) => type !== 'table')
                          .map(([objectType, objects]) => (
                            <div key={objectType}>
                              {/* Object Type Header */}
                              <div
                                className="flex items-center justify-between px-2 py-1 text-xs hover:bg-gray-700 rounded cursor-pointer"
                                onClick={() => toggleObjectType(connection.id, objectType)}
                              >
                                <div className="flex items-center space-x-2">
                                  {expandedObjectTypes.has(`${connection.id}_${objectType}`) ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                  <span className={`font-medium ${getObjectTypeColor(objectType)}`}>
                                    {getObjectTypeLabel(objectType)}
                                  </span>
                                  <span className="text-gray-500">({objects.length})</span>
                                </div>
                              </div>

                              {/* Objects List */}
                              {expandedObjectTypes.has(`${connection.id}_${objectType}`) && (
                                <div className="ml-4 space-y-1">
                                  {objects.map((table) => {
                                    const ObjectIcon = getObjectIcon(table.table_type);
                                    const objectColor = getObjectColor(table.table_type);
                                    
                                    return (
                                      <div
                                        key={table.name}
                                        className="flex items-center justify-between px-2 py-1 text-xs text-gray-400 hover:bg-gray-700 rounded cursor-pointer"
                                        onClick={() => handleTableClick(connection, table.name, table.table_type)}
                                      >
                                        <div className="flex items-center space-x-2">
                                          <ObjectIcon className={`w-3 h-3 ${objectColor}`} />
                                          <span className="truncate">{table.name}</span>
                                        </div>
                                        {objectType === 'view' && (
                                          <div className="flex items-center space-x-1">
                                            <BarChart3 className="w-2 h-2" />
                                            <span className="text-gray-500">{table.row_count}</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                      </>
                    ) : connectionTables[connection.id] ? (
                      <div className="text-xs text-gray-500 px-2 py-1">
                        無資料庫對象
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 