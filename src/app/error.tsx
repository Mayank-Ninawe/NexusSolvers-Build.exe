'use client';

/**
 * Error Boundary Page
 * Catches and displays React errors with recovery options
 */

import React, { useEffect } from 'react';
import Link from 'next/link';

// ============================================================================
// Types
// ============================================================================

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// ============================================================================
// Icons
// ============================================================================

const Icons = {
  Target: () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="url(#errorGradient)" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="6" stroke="url(#errorGradient)" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="2" fill="url(#errorGradient)" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Bug: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
};

// ============================================================================
// Error Component
// ============================================================================

export default function Error({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Log error to console for debugging
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  // Copy error details to clipboard
  const copyErrorDetails = async () => {
    const errorDetails = `
BiasBreaker Error Report
========================
Message: ${error.message}
Digest: ${error.digest || 'N/A'}
Stack: ${error.stack || 'N/A'}
Timestamp: ${new Date().toISOString()}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Icons.Warning />
            {/* Pulse effect */}
            <div className="absolute inset-0 animate-ping opacity-30">
              <Icons.Warning />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Oops! Something Went Wrong
          </h1>
          <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
            Don't worry, it's not your fault. We've encountered an unexpected error. 
            Please try again or return to the homepage.
          </p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-xl shadow-lg border border-red-100 mb-6 overflow-hidden">
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
            <span className="text-sm font-medium text-red-700">Error Details</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              {showDetails ? 'Hide' : 'Show'}
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-gray-700 font-mono break-all">
              {error.message || 'An unknown error occurred'}
            </p>
            
            {/* Collapsible stack trace */}
            {showDetails && error.stack && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <pre className="text-xs text-gray-500 overflow-x-auto whitespace-pre-wrap max-h-40">
                  {error.stack}
                </pre>
                {error.digest && (
                  <p className="mt-2 text-xs text-gray-400">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          {/* Try Again Button */}
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Icons.Refresh />
            Try Again
          </button>

          {/* Go Home Button */}
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Icons.Home />
            Go Home
          </Link>
        </div>

        {/* Report Error */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={copyErrorDetails}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {copied ? <Icons.Check /> : <Icons.Copy />}
            {copied ? 'Copied!' : 'Copy Error Details'}
          </button>

          <Link
            href="/help"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <Icons.Bug />
            Report Error
          </Link>
        </div>

        {/* Support Message */}
        <p className="mt-8 text-center text-sm text-gray-500">
          If this problem persists, please{' '}
          <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
            contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}
