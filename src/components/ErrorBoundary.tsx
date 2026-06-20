import * as React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Handles uncaught rendering exceptions gracefully by displaying an eye-friendly failure state.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  // Explicitly annotate properties to fit strict compiler rules without requiring external types
  public props: Props;
  public state: State;
  public setState!: (state: Partial<State> | ((state: State) => Partial<State>)) => void;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught rendering failure", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#111612] text-white flex flex-col items-center justify-center p-6 text-center" id="error-boundary-view">
          <div className="max-w-md bg-[#1B2119] border border-[#2C342B] rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-[#E8F0E3]">Something Went Wrong</h1>
              <p className="text-xs text-[#A8B8AA] leading-relaxed">
                An unexpected user interface rendering issue has occurred. Please press below to restart the application.
              </p>
            </div>
            {this.state.error && (
              <pre className="p-3 bg-[#121714] border border-[#2C342B] rounded-xl text-[10px] font-mono text-rose-300 overflow-x-auto text-left max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              id="error-boundary-reload-btn"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
