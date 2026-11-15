import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  info: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null, info: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ info: errorInfo });
    this.props.onError?.(error, errorInfo);
    // Log to console for debugging
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          style={{ minHeight: '60vh' }}
        >
          <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-serif font-bold text-text mb-2">Something went wrong</h2>
          <p className="text-text-secondary mb-6">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, info: null });
              window.location.reload();
            }}
            className="px-6 py-2 rounded-xl bg-accent text-text hover:bg-accent-deep"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
