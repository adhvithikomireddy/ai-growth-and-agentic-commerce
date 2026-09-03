import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "../ui/Button.js";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error captured by React ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearStorage = () => {
    localStorage.removeItem("nex_cart");
    localStorage.removeItem("nex_history");
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAF9] dark:bg-[#090D11] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#172018] dark:text-white">
                Autonomous Session Recovered
              </h2>
              <p className="text-xs text-[#667067] dark:text-slate-400 leading-relaxed">
                An unexpected interface event occurred. The Agentic Commerce state has been preserved.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-slate-800/80 border border-neutral-200 dark:border-slate-700 text-left overflow-x-auto text-[11px] font-mono text-neutral-700 dark:text-slate-300 max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={this.handleReset}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Reload Application
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={this.handleClearStorage}
              >
                Reset Cache
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
