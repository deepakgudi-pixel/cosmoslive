'use client';

import { Component } from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Label shown in the fallback UI (e.g. "ISS TELEMETRY", "LAUNCH DATA") */
  sectionLabel?: string;
  /** Called when the user clicks Retry */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * A section-level error boundary that provides a themed fallback.
 * Isolates failures to individual dashboard sections so the rest
 * of the page continues to render normally.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SectionErrorBoundary${this.props.sectionLabel ? `: ${this.props.sectionLabel}` : ''}]`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            border: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(5, 11, 20, 0.65)',
            padding: '3rem 2rem',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Reticle corners */}
          <span style={{ position: 'absolute', top: -1, left: -1, width: 6, height: 6, borderTop: '1px solid rgba(255, 106, 0, 0.5)', borderLeft: '1px solid rgba(255, 106, 0, 0.5)' }} />
          <span style={{ position: 'absolute', top: -1, right: -1, width: 6, height: 6, borderTop: '1px solid rgba(255, 106, 0, 0.5)', borderRight: '1px solid rgba(255, 106, 0, 0.5)' }} />
          <span style={{ position: 'absolute', bottom: -1, left: -1, width: 6, height: 6, borderBottom: '1px solid rgba(255, 106, 0, 0.5)', borderLeft: '1px solid rgba(255, 106, 0, 0.5)' }} />
          <span style={{ position: 'absolute', bottom: -1, right: -1, width: 6, height: 6, borderBottom: '1px solid rgba(255, 106, 0, 0.5)', borderRight: '1px solid rgba(255, 106, 0, 0.5)' }} />

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-amber)',
              marginBottom: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                background: 'var(--color-amber)',
                borderRadius: '50%',
                boxShadow: '0 0 8px var(--color-amber)',
                animation: 'pulse-live 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
            {this.props.sectionLabel ? `${this.props.sectionLabel} — ` : ''}FEED OFFLINE
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              color: 'white',
              marginBottom: '0.5rem',
              letterSpacing: '0.02em',
            }}
          >
            DATA UNAVAILABLE
          </h3>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'rgba(255, 255, 255, 0.5)',
              maxWidth: '400px',
              margin: '0 auto 1.5rem',
              lineHeight: 1.6,
            }}
          >
            {this.state.error?.message || 'This section encountered an unexpected error.'}
          </p>

          <button
            onClick={this.handleReset}
            className="btn-primary btn-amber"
            style={{ fontSize: '0.65rem', padding: '10px 24px' }}
          >
            RETRY LINK
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
