import { Component, ErrorInfo, ReactNode } from 'react';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error | null, reset: () => void) => ReactNode);
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[ErrorBoundary] Caught render error:', error?.message || error, errorInfo?.componentStack);
  }

  public handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const errorMessage = this.state.error?.message || 'An unexpected error occurred';
      const isChunkLoadError = errorMessage.toLowerCase().includes('dynamically imported module') ||
        errorMessage.toLowerCase().includes('failed to fetch') ||
        errorMessage.toLowerCase().includes('loading chunk');

      return (
        <div className="min-h-[420px] w-full flex items-center justify-center bg-zinc-950 p-6 font-sans">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-zinc-100 mb-2">Something went wrong</h1>
            <p className="text-sm text-zinc-400 mb-4">
              {isChunkLoadError
                ? 'A newer version of the application might be available or a network interruption occurred.'
                : 'We encountered an unexpected error while loading this page.'}
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-zinc-950 border border-zinc-800/80 rounded-lg text-left text-xs font-mono text-zinc-400 overflow-x-auto max-h-28">
                {this.state.error.message}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-brand text-zinc-950 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-brand/90 transition-colors text-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 border border-zinc-700 text-zinc-200 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors text-sm cursor-pointer"
              >
                Reload Page
              </button>
              <a 
                href="/"
                className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors text-sm"
              >
                <Home className="w-4 h-4" />
                Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}



