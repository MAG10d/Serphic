import React from 'react';
import { Database, Zap, Shield, Code } from 'lucide-react';
import Button from '../components/ui/Button';

interface HomeProps {
  onNavigateToConnections: () => void;
}

const Home: React.FC<HomeProps> = ({ onNavigateToConnections }) => {
  const features = [
    {
      icon: Zap,
      title: '高性能',
      description: 'Rust 原生性能，快速啟動和響應'
    },
    {
      icon: Shield,
      title: '安全性',
      description: '本地存儲，開源透明，保護您的資料'
    },
    {
      icon: Code,
      title: '開發者友好',
      description: '豐富的快捷鍵和現代化介面設計'
    }
  ];

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        {/* Logo and Title */}
        <div className="mb-8">
          <Database className="w-16 h-16 text-white mx-auto mb-4" />
                     <h1 className="text-3xl font-bold text-white mb-2">
             歡迎使用 Serphic
           </h1>
           <p className="text-gray-300 text-lg">
             資料庫管理，重新定義
           </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <div 
              key={index}
                             className="p-4 bg-gray-800 rounded-lg border border-gray-600"
            >
              <feature.icon className="w-8 h-8 text-white mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">
                {feature.title}
              </h3>
                             <p className="text-gray-300 text-sm">
                 {feature.description}
               </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            size="lg" 
            className="w-full max-w-xs"
            onClick={onNavigateToConnections}
          >
            建立新連接
          </Button>
          <div>
            <Button variant="ghost" size="sm">
              查看文檔
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 