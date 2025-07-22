import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Page } from '../../types/navigation';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  return (
    <div className="h-screen w-screen text-white flex flex-col overflow-hidden">
      {/* Header */}
      <Header />
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onPageChange={onPageChange} />
        
        {/* Main Content */}
        <main className="flex-1 bg-gray-900/80 backdrop-blur-sm border-l border-gray-600/50 overflow-auto">
          <div className="h-full w-full bg-gradient-to-br from-transparent to-gray-900/20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 