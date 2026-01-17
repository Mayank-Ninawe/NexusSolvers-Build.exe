'use client';

/**
 * 404 Not Found Page
 * Displays when a route doesn't exist
 * Includes role-based redirect to appropriate dashboard
 */

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

// ============================================================================
// Icons
// ============================================================================

const Icons = {
  Target: () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="notFoundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" stroke="url(#notFoundGradient)" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="6" stroke="url(#notFoundGradient)" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="2" fill="url(#notFoundGradient)" />
    </svg>
  ),
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  History: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ============================================================================
// Quick Links for Navigation
// ============================================================================

const quickLinks = [
  { label: 'Upload Email', href: '/upload', icon: <Icons.Upload />, description: 'Analyze for bias' },
  { label: 'View History', href: '/student/history', icon: <Icons.History />, description: 'Past analyses' },
];

// ============================================================================
// NotFound Component
// ============================================================================

export default function NotFound() {
  const { user, isAdmin, loading } = useAuth();
  
  // Determine dashboard route based on role
  const dashboardRoute = isAdmin ? '/admin/dashboard' : '/student/dashboard';
  const dashboardLabel = isAdmin ? 'Admin Dashboard' : 'Student Dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] sm:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 leading-none select-none">
            404
          </h1>
          {/* Floating elements for visual interest */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
            <Icons.Search />
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Icons.Target />
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          {/* Go to Dashboard Button */}
          <Link
            href={loading ? '/' : dashboardRoute}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Icons.Home />
            {loading ? 'Go to Dashboard' : `Go to ${dashboardLabel}`}
          </Link>

          {/* Go Back Button */}
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Icons.ArrowLeft />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition-all duration-200">
                  {link.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {link.label}
                  </div>
                  <div className="text-xs text-gray-500">{link.description}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Support Link */}
        <p className="mt-8 text-sm text-gray-500">
          Need help?{' '}
          <Link href="/help" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
