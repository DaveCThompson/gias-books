// src/components/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary component that catches errors in child components.
 * Displays a fallback UI and optionally calls onError callback.
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught:', error, errorInfo);
        }

        this.props.onError?.(error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback - can be overridden via props
            return (
                <ErrorFallback
                    error={this.state.error}
                    onRetry={this.handleRetry}
                />
            );
        }

        return this.props.children;
    }
}

interface ErrorFallbackProps {
    error?: Error | null;
    onRetry?: () => void;
}

/**
 * Simple, on-brand error fallback UI.
 */
function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <span style={styles.emoji}>😕</span>
                <h2 style={styles.title}>Oops!</h2>
                <p style={styles.message}>
                    Something went wrong loading this page.
                </p>
                {process.env.NODE_ENV === 'development' && error && (
                    <pre style={styles.error}>{error.message}</pre>
                )}
                {onRetry && (
                    <button style={styles.button} onClick={onRetry}>
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        background: 'var(--color-background)',
        color: 'var(--color-text)',
    },
    content: {
        textAlign: 'center',
        maxWidth: '400px',
    },
    emoji: {
        fontSize: '4rem',
        display: 'block',
        marginBottom: '1rem',
    },
    title: {
        fontFamily: 'var(--font-display)',
        fontSize: '1.5rem',
        margin: '0 0 0.5rem 0',
    },
    message: {
        fontFamily: 'var(--font-body)',
        fontSize: '1rem',
        margin: '0 0 1.5rem 0',
        opacity: 0.8,
    },
    error: {
        background: 'var(--color-surface)',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '0.75rem',
        textAlign: 'left',
        overflow: 'auto',
        marginBottom: '1.5rem',
    },
    button: {
        fontFamily: 'var(--font-display)',
        fontSize: '1rem',
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '8px',
        background: 'var(--color-interactive)',
        color: 'white',
        cursor: 'pointer',
    },
};

export { ErrorBoundary, ErrorFallback };
