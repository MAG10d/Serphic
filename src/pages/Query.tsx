import React, { useState, useEffect } from 'react';
import { Play, Save, History, Database } from 'lucide-react';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { useConnectionStore } from '../stores/useConnectionStore';
import { useQueryStore } from '../stores/useQueryStore';
import { invoke } from '@tauri-apps/api/core';

interface QueryResult {
  success: boolean;
  columns: string[];
  rows: any[][];
  affected_rows?: number;
  execution_time: number;
  message: string;
}

const Query: React.FC = () => {
  const { connections } = useConnectionStore();
  const { selectedConnection: storeSelectedConnection, currentSql: storeSql, autoQuery, clearAutoQuery, setCurrentSql } = useQueryStore();
  
  const [sql, setSql] = useState(storeSql);
  const [selectedConnection, setSelectedConnection] = useState<string>(storeSelectedConnection || '');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // 監聽自動查詢
  useEffect(() => {
    if (autoQuery) {
      setSql(autoQuery.sql);
      setSelectedConnection(autoQuery.connection.id);
      
      // 立即顯示載入狀態
      setIsExecuting(true);
      setToast({ 
        type: 'warning', 
        message: `正在查詢表格: ${autoQuery.tableName}...` 
      });
      
      // 立即執行查詢
      handleExecuteQuery(autoQuery.connection, autoQuery.sql);
      
      // 清除自動查詢狀態
      clearAutoQuery();
    }
  }, [autoQuery]);

  // 同步 SQL 到 store
  useEffect(() => {
    setCurrentSql(sql);
  }, [sql, setCurrentSql]);

  const handleExecuteQuery = async (connection?: any, sqlToExecute?: string) => {
    const targetConnection = connection || connections.find(conn => conn.id === selectedConnection);
    const targetSql = sqlToExecute || sql.trim();

    if (!targetConnection) {
      setToast({ type: 'error', message: '請選擇一個資料庫連接' });
      return;
    }

    if (!targetSql) {
      setToast({ type: 'error', message: '請輸入 SQL 查詢語句' });
      return;
    }

    setIsExecuting(true);
    setToast({ type: 'warning', message: '正在執行查詢...' });

    try {
      const result = await invoke('execute_query', {
        request: {
          connection: {
            name: targetConnection.name,
            db_type: targetConnection.type,
            host: targetConnection.host,
            port: targetConnection.port,
            database: targetConnection.database,
            username: targetConnection.username,
            password: targetConnection.password,
          },
          sql: targetSql,
        }
      }) as QueryResult;

      setQueryResult(result);

      if (result.success) {
        setToast({ 
          type: 'success', 
          message: `${result.message} (耗時: ${result.execution_time}ms)` 
        });
      } else {
        setToast({ type: 'error', message: result.message });
      }
    } catch (error) {
      setToast({ 
        type: 'error', 
        message: `查詢失敗: ${error}` 
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter 或 Cmd+Enter 執行查詢
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecuteQuery();
    }
  };

  const commonQueries = [
    {
      name: 'SQLite - 創建表格',
      sql: `CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`
    },
    {
      name: 'SQLite - 插入數據',
      sql: `INSERT INTO users (name, email) VALUES 
('張三', 'zhang@example.com'),
('李四', 'li@example.com'),
('王五', 'wang@example.com');`
    },
    {
      name: 'SQLite - 查詢數據',
      sql: 'SELECT * FROM users ORDER BY created_at DESC;'
    },
    {
      name: '查看表格',
      sql: "SELECT name FROM sqlite_master WHERE type='table';"
    }
  ];

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">SQL 查詢</h1>
              <p className="text-gray-300 text-sm mt-1">執行 SQL 查詢並查看結果</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* 連接選擇 */}
              <select
                value={selectedConnection}
                onChange={(e) => setSelectedConnection(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇連接</option>
                {connections.map((conn) => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name} ({conn.type.toUpperCase()})
                  </option>
                ))}
              </select>
              <Button 
                onClick={() => handleExecuteQuery()}
                disabled={isExecuting}
                className="min-w-[100px]"
              >
                <Play className="w-4 h-4 mr-2" />
                {isExecuting ? '執行中...' : '執行'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* SQL Editor Section */}
          <div className="flex-shrink-0">
            {/* Common Queries */}
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center space-x-2 mb-2">
                <History className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">常用查詢:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {commonQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => setSql(query.sql)}
                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  >
                    {query.name}
                  </button>
                ))}
              </div>
            </div>

            {/* SQL Textarea */}
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white">
                  SQL 查詢
                </label>
                <span className="text-xs text-gray-400">
                  Ctrl+Enter 執行
                </span>
              </div>
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={Math.max(3, sql.split('\n').length)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="輸入您的 SQL 查詢..."
                style={{ maxHeight: '200px', overflowY: sql.split('\n').length > 8 ? 'auto' : 'hidden' }}
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b border-gray-600">
              <h3 className="text-lg font-medium text-white">查詢結果</h3>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {queryResult ? (
                <div>
                  {queryResult.success ? (
                    <div>
                      {queryResult.rows.length > 0 ? (
                        /* 表格結果 */
                        <div className="overflow-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-600">
                                {queryResult.columns.map((col, index) => (
                                  <th key={index} className="text-left p-2 text-gray-300 font-medium whitespace-nowrap">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {queryResult.rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b border-gray-700 hover:bg-gray-800">
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="p-2 text-gray-200 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                                      {cell === null ? (
                                        <span className="text-gray-500 italic">NULL</span>
                                      ) : (
                                        <span title={String(cell)}>{String(cell)}</span>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        /* 無結果或非查詢語句 */
                        <div className="text-center py-8">
                          <Database className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-300">{queryResult.message}</p>
                          {queryResult.affected_rows !== undefined && (
                            <p className="text-gray-400 mt-2">
                              影響行數: {queryResult.affected_rows}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 錯誤結果 */
                    <div className="text-center py-8">
                      <div className="text-red-400 mb-2">查詢失敗</div>
                      <p className="text-gray-300 text-sm">{queryResult.message}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* 初始狀態 */
                <div className="text-center py-8">
                  <Database className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">選擇連接並執行 SQL 查詢</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Query; 