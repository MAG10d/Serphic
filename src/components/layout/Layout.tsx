import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

type Page = 'home' | 'connections' | 'settings';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <Header />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onPageChange={onPageChange} />
        
        {/* Main Content */}
        <main className="flex-1 bg-gray-900 border-l border-gray-600 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 