import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Connections from './pages/Connections';
import Query from './pages/Query';
import { Page } from './types/navigation';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigateToConnections={() => setCurrentPage('connections')} />;
      case 'connections':
        return <Connections />;
      case 'query':
        return <Query />;
      case 'settings':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">設定</h1>
              <p className="text-gray-300">設定頁面開發中...</p>
            </div>
          </div>
        );
      default:
        return <Home onNavigateToConnections={() => setCurrentPage('connections')} />;
    }
  };

  return (
    <ErrorBoundary>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        <ErrorBoundary>
          {renderPage()}
        </ErrorBoundary>
      </Layout>
    </ErrorBoundary>
  );
}

export default App; 