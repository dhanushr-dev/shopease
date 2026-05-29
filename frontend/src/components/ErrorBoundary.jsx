import React from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
          <div className="card max-w-md w-full p-8 text-center animate-fade-in shadow-xl">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-surface-900 mb-2 font-display">Something went wrong</h2>
            <p className="text-surface-600 mb-6">We're sorry, but an unexpected error occurred. Please refresh the page or return home.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button onClick={() => window.location.reload()} className="btn-secondary !py-2.5">
                Refresh Page
              </button>
              {window.location.pathname.startsWith('/products/') && (
                <Link to="/products" onClick={() => this.setState({ hasError: false })} className="btn-secondary !py-2.5">
                  Back to Products
                </Link>
              )}
              <Link to="/" onClick={() => this.setState({ hasError: false })} className="btn-primary !py-2.5">
                Go Home
              </Link>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 text-left bg-surface-100 p-4 rounded-xl overflow-auto text-xs text-red-600 font-mono max-h-40">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
