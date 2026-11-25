import React from 'react';
import { AlertCircle, RefreshCw, Home, Trash2 } from 'lucide-react';

/**
 * SkillSwap ErrorBoundary
 * Catches any unhandled JavaScript runtime exceptions in child components,
 * preventing blank white screens and offering immediate recovery options.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[SkillSwap ErrorBoundary caught an exception]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetSession = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-4 font-sans paper-pattern">
          <div className="max-w-md w-full bg-white rounded-4xl border-2 border-charcoal shadow-pop p-8 text-center relative overflow-hidden">
            {/* Top decorative doodle tape */}
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-28 bg-coral/80 border border-charcoal/20 rounded-sm shadow-sm"
              style={{ transform: 'translateX(-50%) rotate(-1deg)' }}
            />

            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-coral/15 text-coral border-2 border-charcoal flex items-center justify-center shadow-pop-sm">
              <AlertCircle className="w-8 h-8 text-coral" />
            </div>

            <h2 className="text-2xl font-bold font-serif text-charcoal mb-2">
              Something went sideways
            </h2>

            <p className="text-xs text-charcoal-muted leading-relaxed mb-6">
              SkillSwap encountered an unexpected interface error. Don't worry — your data is safe.
            </p>

            {this.state.error?.message && (
              <div className="bg-ivory rounded-2xl p-3 mb-6 border border-charcoal/15 text-left overflow-x-auto max-h-32 text-[11px] font-mono text-charcoal-subtle">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-charcoal text-ivory text-xs font-bold border-2 border-charcoal hover:bg-charcoal-light shadow-pop-sm active:shadow-none flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>

              <button
                onClick={this.handleResetSession}
                className="py-2.5 px-4 rounded-2xl bg-butter text-charcoal text-xs font-bold border-2 border-charcoal hover:bg-butter-dark shadow-pop-sm active:shadow-none flex items-center justify-center gap-2 transition"
                title="Clears local storage cache and redirects to home"
              >
                <Trash2 className="w-4 h-4" />
                Clear Cache & Reset
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
