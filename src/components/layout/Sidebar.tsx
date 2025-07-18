import React from 'react';
import { Home, Database, Settings, Plus } from 'lucide-react';
import { useConnectionStore } from '../../stores/useConnectionStore';

type Page = 'home' | 'connections' | 'settings';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { connections } = useConnectionStore();
  
  const menuItems = [
    { icon: Home, label: '首頁', id: 'home' as Page },
    { icon: Database, label: '連接', id: 'connections' as Page },
    { icon: Settings, label: '設定', id: 'settings' as Page },
  ];

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-600 flex flex-col">
      {/* Navigation Menu */}
      <nav className="p-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded text-sm transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Connections Section */}
      <div className="flex-1 p-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            資料庫連接
          </h3>
          <button 
            className="p-1 hover:bg-gray-700 rounded"
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
              <div
                key={connection.id}
                className="px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 rounded cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Database className="w-3 h-3" />
                  <span className="truncate">{connection.name}</span>
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {connection.type} • {connection.host}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 