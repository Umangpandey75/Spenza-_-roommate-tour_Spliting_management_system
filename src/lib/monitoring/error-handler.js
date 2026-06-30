/**
 * Centralized error handling and monitoring
 */

class ErrorHandler {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    
    // Initialize error tracking service (Sentry, Bugsnag, etc.)
    if (this.sentryDsn && typeof window !== 'undefined') {
      this.initSentry();
    }
  }

  initSentry() {
    // Initialize Sentry or other error tracking service
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.init({ dsn: this.sentryDsn });
  }

  /**
   * Log error with context
   */
  logError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userId: context.userId || 'anonymous',
      ...context,
    };

    if (this.isDevelopment) {
      console.error('Error logged:', errorInfo);
    }

    // Send to monitoring service
    if (typeof window !== 'undefined' && this.sentryDsn) {
      // Sentry.captureException(error, { extra: context });
    }

    // Send to custom logging endpoint
    this.sendToLoggingService(errorInfo);
  }

  /**
   * Send error to logging service
   */
  async sendToLoggingService(errorInfo) {
    try {
      if (typeof window !== 'undefined') {
        await fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorInfo),
        });
      }
    } catch (loggingError) {
      console.error('Failed to send error to logging service:', loggingError);
    }
  }

  /**
   * Handle async errors with user feedback
   */
  async handleAsyncError(asyncFn, fallbackValue = null, userMessage = 'Something went wrong') {
    try {
      return await asyncFn();
    } catch (error) {
      this.logError(error, { operation: asyncFn.name });
      
      // Show user-friendly error message
      if (typeof window !== 'undefined') {
        // Use your toast system
        console.error(userMessage);
      }
      
      return fallbackValue;
    }
  }

  /**
   * Create error boundary HOC (use this in React components)
   */
  createErrorBoundary(fallbackComponent = null) {
    // This should be used with React.Component in actual components
    // Example usage in a component file:
    // import React from 'react';
    // import { errorHandler } from './error-handler';
    // 
    // class ErrorBoundary extends React.Component {
    //   constructor(props) {
    //     super(props);
    //     this.state = { hasError: false };
    //   }
    //   
    //   static getDerivedStateFromError(error) {
    //     return { hasError: true };
    //   }
    //   
    //   componentDidCatch(error, errorInfo) {
    //     errorHandler.logError(error, errorInfo);
    //   }
    //   
    //   render() {
    //     if (this.state.hasError) {
    //       return fallbackComponent || <div>Something went wrong.</div>;
    //     }
    //     return this.props.children;
    //   }
    // }
    
    return {
      fallbackComponent: fallbackComponent || (
        <div className="p-4 text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            We&apos;ve been notified and are working on a fix.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      )
    };
  }
}

export const errorHandler = new ErrorHandler();

// Global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorHandler.logError(event.error, { type: 'global_error' });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.logError(new Error(event.reason), { type: 'unhandled_promise' });
  });
}