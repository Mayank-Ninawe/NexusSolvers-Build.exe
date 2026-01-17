'use client';

/**
 * BiasBreaker Protected Route Component
 * Provides role-based access control for protected pages
 * Shows loading state during auth check and access denied for unauthorized users
 */

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface ProtectedRouteProps {
  children: ReactNode;
  /** Array of roles allowed to access this route */
  allowedRoles: UserRole[];
  /** Redirect path for unauthenticated users (default: '/login') */
  redirectTo?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingState />;
  }

  // Not authenticated - will redirect (show loading in the meantime)
  if (!user) {
    return <LoadingState />;
  }

  // Check if user's role is in the allowed roles
  const hasAccess = allowedRoles.includes(user.role);

  // Show access denied if user doesn't have permission
  if (!hasAccess) {
    return <AccessDenied userRole={user.role} />;
  }

  // User is authorized - render children
  return <>{children}</>;
}

// ============================================================================
// Loading State Component
// ============================================================================

function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F3FF]">
      {/* BiasBreaker Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
            BiasBreaker
          </span>
        </div>
      </div>

      {/* Spinning Loader */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-[#E5E7EB]" />
        <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#4F46E5] border-r-[#7C3AED] animate-spin" />
      </div>

      {/* Loading Text */}
      <p className="mt-6 text-[#6B7280] font-medium">Verifying access...</p>
    </div>
  );
}

// ============================================================================
// Access Denied Component
// ============================================================================

interface AccessDeniedProps {
  userRole: UserRole;
}

function AccessDenied({ userRole }: AccessDeniedProps) {
  const router = useRouter();

  // Determine dashboard URL based on user role
  const getDashboardUrl = (): string => {
    switch (userRole) {
      case 'super_admin':
      case 'college_admin':
        return '/admin/dashboard';
      case 'student':
      default:
        return '/student/dashboard';
    }
  };

  const handleGoToDashboard = () => {
    router.push(getDashboardUrl());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F3FF] p-4">
      <div
        className="w-full max-w-[500px] bg-white rounded-2xl shadow-xl p-8 text-center animate-fadeIn"
        style={{
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        {/* Warning Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-[#1F2937] mb-3">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-base text-[#6B7280] mb-8 leading-relaxed">
          You don&apos;t have permission to access this page.
          <br />
          Please contact your administrator.
        </p>

        {/* Dashboard Button */}
        <button
          onClick={handleGoToDashboard}
          className="w-full py-3 px-6 rounded-lg text-white font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-lg"
          style={{
            background: 'linear-gradient(to right, #4F46E5, #7C3AED)',
          }}
        >
          Go to Dashboard
        </button>
      </div>

      {/* Fade-in animation keyframes */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
