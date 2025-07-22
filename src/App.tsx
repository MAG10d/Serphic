import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Connections from './pages/Connections';
import Query from './pages/Query';
import Settings from './pages/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import { useTheme } from './hooks/useTheme';
import { Page } from './types/navigation';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  
  // 應用主題設置
  useTheme();

  const handleNavigateToConnections = () => {
    setCurrentPage('connections');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigateToConnections={handleNavigateToConnections} />;
      case 'connections':
        return <Connections />;
      case 'query':
        return <Query />;
      case 'settings':
        return <Settings />;
      default:
        return <Home onNavigateToConnections={handleNavigateToConnections} />;
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
};

export default App;
