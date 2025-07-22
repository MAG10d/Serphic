import React, { useState } from 'react';
import { Plus, Database, Trash2, TestTube, FolderOpen, Edit } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Toast from '../components/ui/Toast';
import { useConnectionStore } from '../stores/useConnectionStore';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

const Connections: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [connectionForm, setConnectionForm] = useState<{
    name: string;
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
    type: 'mysql' | 'postgresql' | 'sqlite';
  }>({
    name: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    type: 'mysql'
  });
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const { connections, addConnection, removeConnection } = useConnectionStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 根據資料庫類型驗證不同欄位
      if (connectionForm.type === 'sqlite') {
        if (!connectionForm.name || !connectionForm.database) {
          setToast({ type: 'error', message: '請填寫連接名稱和檔案路徑' });
          return;
        }
      } else {
        if (!connectionForm.name || !connectionForm.host || !connectionForm.database || !connectionForm.username) {
          setToast({ type: 'error', message: '請填寫所有必填欄位' });
          return;
        }
      }

      // 添加連接到 store
      addConnection({
        name: connectionForm.name,
        type: connectionForm.type as 'mysql' | 'postgresql' | 'sqlite',
        host: connectionForm.host,
        port: parseInt(connectionForm.port) || (connectionForm.type === 'mysql' ? 3306 : 5432),
        database: connectionForm.database,
        username: connectionForm.username,
        password: connectionForm.password,
      });

      // 重置表單並返回列表
      setConnectionForm({
        name: '',
        host: '',
        port: '',
        database: '',
        username: '',
        password: '',
        type: 'mysql'
      });
      setShowForm(false);
      
      setToast({ type: 'success', message: '連接已成功創建！' });
    } catch (error) {
      console.error('創建連接時發生錯誤:', error);
      setToast({ type: 'error', message: `創建連接失敗: ${error}` });
    }
  };

  const handleDeleteConnection = (id: string, name: string) => {
    removeConnection(id);
    setToast({ type: 'success', message: `連接 "${name}" 已刪除` });
  };

  const handleTestConnection = async (e?: React.MouseEvent) => {
    // 防止表單提交
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 根據資料庫類型驗證不同欄位
    if (connectionForm.type === 'sqlite') {
      if (!connectionForm.name || !connectionForm.database) {
        setToast({ type: 'error', message: '請填寫連接名稱和檔案路徑才能測試' });
        return;
      }
    } else {
      if (!connectionForm.name || !connectionForm.host || !connectionForm.database || !connectionForm.username) {
        setToast({ type: 'error', message: '請填寫連接資訊才能測試' });
        return;
      }
    }

    // 真正的連接測試
    setToast({ type: 'warning', message: '正在測試連接...' });
    
    try {
      const result = await invoke('test_database_connection', {
        connection: {
          name: connectionForm.name,
          db_type: connectionForm.type,
          host: connectionForm.host,
          port: parseInt(connectionForm.port) || (connectionForm.type === 'mysql' ? 3306 : 5432),
          database: connectionForm.database,
          username: connectionForm.username,
          password: connectionForm.password,
        }
      }) as { success: boolean; message: string; execution_time: number };

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
        message: `連接測試失敗: ${error}` 
      });
    }
  };

  const handleTestExistingConnection = async (connection: any) => {
    setToast({ type: 'warning', message: `正在測試連接 "${connection.name}"...` });
    
    try {
      const result = await invoke('test_database_connection', {
        connection: {
          name: connection.name,
          db_type: connection.type,
          host: connection.host,
          port: connection.port,
          database: connection.database,
          username: connection.username,
          password: connection.password,
        }
      }) as { success: boolean; message: string; execution_time: number };

      if (result.success) {
        setToast({ 
          type: 'success', 
          message: `"${connection.name}" ${result.message} (耗時: ${result.execution_time}ms)` 
        });
      } else {
        setToast({ type: 'error', message: `"${connection.name}" ${result.message}` });
      }
    } catch (error) {
      setToast({ 
        type: 'error', 
        message: `測試 "${connection.name}" 失敗: ${error}` 
      });
    }
  };

  const handleSelectFile = async () => {
    try {
      const file = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: 'SQLite Database',
            extensions: ['db', 'sqlite', 'sqlite3']
          },
          {
            name: 'All Files',
            extensions: ['*']
          }
        ]
      });

      if (file && typeof file === 'string') {
        setConnectionForm(prev => ({
          ...prev,
          database: file
        }));
        setToast({ 
          type: 'success', 
          message: '文件選擇成功！' 
        });
      } else if (file === null) {
        // 用戶取消了文件選擇，不顯示錯誤
        console.log('用戶取消了文件選擇');
      }
    } catch (error) {
      console.error('文件選擇錯誤:', error);
      setToast({ 
        type: 'error', 
        message: `文件選擇失敗: ${error}` 
      });
    }
  };

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
              <h1 className="text-xl font-semibold text-white">資料庫連接</h1>
              <p className="text-gray-300 text-sm mt-1">管理您的資料庫連接配置</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新增連接
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {showForm ? (
            /* Connection Form */
            <div className="p-6">
              <div className="max-w-2xl">
                <h2 className="text-lg font-medium text-white mb-6">新增資料庫連接</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="連接名稱"
                      value={connectionForm.name}
                      onChange={(e) => setConnectionForm({ ...connectionForm, name: e.target.value })}
                      placeholder="我的資料庫"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">
                        資料庫類型
                      </label>
                      <select
                        value={connectionForm.type}
                        onChange={(e) => setConnectionForm({ ...connectionForm, type: e.target.value as "mysql" | "postgresql" | "sqlite" })}
                        className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="mysql">MySQL</option>
                        <option value="postgresql">PostgreSQL</option>
                        <option value="sqlite">SQLite</option>
                      </select>
                    </div>
                  </div>

                  {/* 根據資料庫類型顯示不同欄位 */}
                  {connectionForm.type === 'sqlite' ? (
                    /* SQLite 欄位 */
                    <div>
                      <Input
                        label="檔案路徑"
                        value={connectionForm.database}
                        onChange={(e) => setConnectionForm({ ...connectionForm, database: e.target.value })}
                        placeholder=":memory: 或 ./database.db 或 C:\path\to\database.db"
                        helperText="使用 :memory: 創建內存資料庫，或輸入 .db 檔案路徑"
                      />
                      <Button
                        type="button"
                        onClick={handleSelectFile}
                        className="mt-2 px-3 py-2 bg-gray-700 hover:bg-gray-600"
                      >
                        <FolderOpen className="w-4 h-4" />
                        選擇檔案
                      </Button>
                    </div>
                  ) : (
                    /* MySQL/PostgreSQL 欄位 */
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="主機"
                          value={connectionForm.host}
                          onChange={(e) => setConnectionForm({ ...connectionForm, host: e.target.value })}
                          placeholder="localhost"
                        />
                        
                        <Input
                          label="端口"
                          type="number"
                          value={connectionForm.port}
                          onChange={(e) => setConnectionForm({ ...connectionForm, port: e.target.value })}
                          placeholder={connectionForm.type === 'mysql' ? '3306' : '5432'}
                        />
                        
                        <Input
                          label="資料庫名稱"
                          value={connectionForm.database}
                          onChange={(e) => setConnectionForm({ ...connectionForm, database: e.target.value })}
                          placeholder="mydb"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="用戶名"
                          value={connectionForm.username}
                          onChange={(e) => setConnectionForm({ ...connectionForm, username: e.target.value })}
                          placeholder="root"
                        />
                        
                        <Input
                          label="密碼"
                          type="password"
                          value={connectionForm.password}
                          onChange={(e) => setConnectionForm({ ...connectionForm, password: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <Button type="submit">
                      <Database className="w-4 h-4 mr-2" />
                      創建連接
                    </Button>
                    <Button 
                      type="button"
                      variant="secondary" 
                      onClick={handleTestConnection}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      測試連接
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost" 
                      onClick={() => setShowForm(false)}
                    >
                      取消
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Connections List */
            <div className="p-6">
              {connections.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-gray-300 text-lg mb-2">尚無資料庫連接</h3>
                  <p className="text-gray-400 mb-4">建立您的第一個資料庫連接開始使用</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    新增連接
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connections.map((connection) => (
                    <div key={connection.id} className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white">{connection.name}</h3>
                        <div className="flex space-x-1">
                          <button className="p-1 text-gray-400 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-red-400"
                            onClick={() => handleDeleteConnection(connection.id, connection.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-300">
                        <p><span className="text-gray-400">類型:</span> {connection.type.toUpperCase()}</p>
                        {connection.type === 'sqlite' ? (
                          <p><span className="text-gray-400">檔案:</span> {connection.database}</p>
                        ) : (
                          <>
                            <p><span className="text-gray-400">主機:</span> {connection.host}:{connection.port}</p>
                            <p><span className="text-gray-400">資料庫:</span> {connection.database}</p>
                            <p><span className="text-gray-400">用戶:</span> {connection.username}</p>
                          </>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleTestExistingConnection(connection)}
                        >
                          <TestTube className="w-4 h-4 mr-2" />
                          測試連接
                        </Button>
                        <Button variant="primary" size="sm" className="w-full">
                          <Database className="w-4 h-4 mr-2" />
                          連接使用
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Connections; 