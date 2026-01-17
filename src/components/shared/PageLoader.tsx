'use client';

/**
 * PageLoader Component
 * Full-screen loading state with BiasBreaker branding
 */

import React from 'react';

// ============================================================================
// Types
// ============================================================================

interface PageLoaderProps {
  /** Optional loading message */
  message?: string;
  /** Show full screen overlay */
  fullScreen?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// Logo Component
// ============================================================================

function AnimatedLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        
        {/* Outer ring - pulsing */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#loaderGradient)"
          strokeWidth="3"
          className="animate-pulse"
          opacity="0.3"
        />
        
        {/* Middle ring - rotating */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="url(#loaderGradient)"
          strokeWidth="4"
          strokeDasharray="60 160"
          className="origin-center animate-spin"
          style={{ animationDuration: '2s' }}
        />
        
        {/* Inner ring */}
        <circle
          cx="50"
          cy="50"
          r="25"
          fill="none"
          stroke="url(#loaderGradient)"
          strokeWidth="3"
          opacity="0.5"
        />
        
        {/* Center dot */}
        <circle
          cx="50"
          cy="50"
          r="8"
          fill="url(#loaderGradient)"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

// ============================================================================
// PageLoader Component
// ============================================================================

export default function PageLoader({
  message = 'Loading...',
  fullScreen = true,
  size = 'md',
}: PageLoaderProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
    : 'w-full py-12';

  return (
    <div className={`${containerClasses} flex flex-col items-center justify-center`}>
      <AnimatedLogo size={size} />
      
      {/* Brand Name */}
      <div className="mt-6 text-center">
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          BiasBreaker
        </h2>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
      </div>

      {/* Loading dots animation */}
      <div className="mt-6 flex gap-1">
        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

// ============================================================================
// Inline Loader Component
// ============================================================================

interface InlineLoaderProps {
  message?: string;
  size?: 'sm' | 'md';
}

export function InlineLoader({ message = 'Loading...', size = 'sm' }: InlineLoaderProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <div className={`
        ${size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'}
        border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin
      `} />
      <span className="text-sm text-gray-500">{message}</span>
    </div>
  );
}

// ============================================================================
// Button Loader Component
// ============================================================================

export function ButtonLoader() {
  return (
    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}

// ============================================================================
// Overlay Loader Component
// ============================================================================

interface OverlayLoaderProps {
  message?: string;
  isVisible: boolean;
}

export function OverlayLoader({ message = 'Processing...', isVisible }: OverlayLoaderProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center">
        <AnimatedLogo size="md" />
        <p className="mt-4 text-gray-700 font-medium">{message}</p>
        <p className="mt-2 text-sm text-gray-500">Please wait...</p>
      </div>
    </div>
  );
}
