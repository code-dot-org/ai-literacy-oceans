import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render/lifecycle errors from the lab so a crash degrades to a
 * recoverable message instead of React 18 unmounting the whole tree (which
 * leaves an empty #root over the dark page background — a "black screen").
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {hasError: false};

  static getDerivedStateFromError(): State {
    return {hasError: true};
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('AI for Oceans crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        data-testid="error-screen"
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <p style={{fontSize: 18}}>Something went wrong.</p>
        <button
          data-testid="error-reload-btn"
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 32px',
            fontSize: 18,
            fontWeight: 600,
            borderRadius: 8,
            border: 'none',
            background: '#00b4d8',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}
