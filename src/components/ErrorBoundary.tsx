import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-900">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-4">出現錯誤</h1>
            <p className="text-gray-300 mb-6">
              應用程序遇到了一個錯誤。請重新載入頁面或重新啟動應用程序。
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                重新載入頁面
              </button>
              <div className="mt-4">
                <details className="text-left">
                  <summary className="text-gray-400 cursor-pointer hover:text-white">
                    顯示錯誤詳情
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-800 border border-gray-600 rounded text-red-400 text-sm overflow-auto">
                    {this.state.error?.message}
                    {'\n\n'}
                    {this.state.error?.stack}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 