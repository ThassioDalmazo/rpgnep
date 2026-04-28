
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-stone-950 text-stone-300">
          <div className="bg-red-500/10 p-6 rounded-full mb-6 border border-red-500/20">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-cinzel font-bold text-white mb-2">Ops! Algo deu errado</h2>
          <p className="text-stone-400 mb-8 max-w-md">
            Ocorreu um erro inesperado nesta parte do aplicativo. Você pode tentar recarregar ou voltar para o início.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl transition-all"
            >
              <RefreshCw size={18} /> Recarregar Página
            </button>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all font-bold"
            >
              Tentar Novamente
            </button>
          </div>
          {this.state.error && (
            <div className="mt-12 p-4 bg-black/40 rounded-lg border border-white/5 text-left max-w-2xl w-full overflow-auto">
              <p className="text-xs font-mono text-red-400/70">
                {this.state.error.toString()}
              </p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
