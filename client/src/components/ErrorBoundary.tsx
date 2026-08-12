'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service (e.g., Sentry)
      console.error('Error caught by boundary:', error, errorInfo);
    } else {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <h1 className="text-2xl font-black text-primary mb-4">
              حدث خطأ غير متوقع
            </h1>
            <p className="text-primary-muted mb-6">
              نأسف، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-3 rounded-2xl font-black hover:bg-[#4a1a2f] transition-all"
            >
              إعادة التحميل
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
