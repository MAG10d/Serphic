import React, { useState } from 'react';
import { Plus, Database, Edit, Trash2, TestTube } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Toast from '../components/ui/Toast';
import { useConnectionStore } from '../stores/useConnectionStore';

const Connections: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [connectionForm, setConnectionForm] = useState({
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
    
    // 驗證必填欄位
    if (!connectionForm.name || !connectionForm.host || !connectionForm.database || !connectionForm.username) {
      setToast({ type: 'error', message: '請填寫所有必填欄位' });
      return;
    }

    // 添加連接到 store
    addConnection({
      name: connectionForm.name,
      type: connectionForm.type as any,
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
  };

  const handleDeleteConnection = (id: string, name: string) => {
    removeConnection(id);
    setToast({ type: 'success', message: `連接 "${name}" 已刪除` });
  };

  const handleTestConnection = () => {
    // 驗證必填欄位
    if (!connectionForm.name || !connectionForm.host || !connectionForm.database || !connectionForm.username) {
      setToast({ type: 'error', message: '請填寫連接資訊才能測試' });
      return;
    }

    // 模擬連接測試
    setToast({ type: 'warning', message: '正在測試連接...' });
    
    setTimeout(() => {
      // 隨機成功或失敗模擬
      const isSuccess = Math.random() > 0.3;
      if (isSuccess) {
        setToast({ type: 'success', message: '連接測試成功！' });
      } else {
        setToast({ type: 'error', message: '連接測試失敗：無法連接到資料庫' });
      }
    }, 2000);
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
                       onChange={(e) => setConnectionForm({ ...connectionForm, type: e.target.value })}
                       className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                     >
                      <option value="mysql">MySQL</option>
                      <option value="postgresql">PostgreSQL</option>
                    </select>
                  </div>
                </div>

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
                    placeholder="3306"
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

                <div className="flex space-x-3 pt-4">
                  <Button type="submit">
                    <Database className="w-4 h-4 mr-2" />
                    創建連接
                  </Button>
                                     <Button variant="secondary" onClick={handleTestConnection}>
                     <TestTube className="w-4 h-4 mr-2" />
                     測試連接
                   </Button>
                  <Button variant="ghost" onClick={() => setShowForm(false)}>
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
                       <p><span className="text-gray-400">主機:</span> {connection.host}:{connection.port}</p>
                       <p><span className="text-gray-400">資料庫:</span> {connection.database}</p>
                       <p><span className="text-gray-400">用戶:</span> {connection.username}</p>
                     </div>
                     <div className="mt-3 pt-3 border-t border-gray-700">
                       <Button variant="secondary" size="sm" className="w-full">
                         <Database className="w-4 h-4 mr-2" />
                         連接
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