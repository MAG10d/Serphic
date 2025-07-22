import React from 'react';
import { Database, Wifi, WifiOff } from 'lucide-react';

const Header: React.FC = () => {
  const isConnected = false; // TODO: 從狀態管理獲取實際連接狀態

  return (
    <header className="h-12 bg-gray-800/90 backdrop-blur-md border-b border-gray-600/50 flex items-center justify-between px-4 flex-shrink-0">
      {/* Logo and App Name */}
      <div className="flex items-center space-x-2">
        <Database className="w-5 h-5 text-white" />
        <span className="text-white font-semibold text-sm">Serphic</span>
      </div>

      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <div className="flex items-center space-x-1 text-green-400 text-xs">
            <Wifi className="w-4 h-4" />
            <span>已連接</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-gray-400 text-xs">
            <WifiOff className="w-4 h-4" />
            <span>未連接</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 