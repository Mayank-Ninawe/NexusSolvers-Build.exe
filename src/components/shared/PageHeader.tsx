'use client';

/**
 * PageHeader Component
 * Reusable header for page titles with subtitle and optional actions
 */

import React, { ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

interface PageHeaderProps {
  /** Main title of the page */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional action buttons to display on the right */
  actions?: ReactNode;
  /** Optional icon to display before the title */
  icon?: ReactNode;
  /** Optional badge to display after the title */
  badge?: ReactNode;
  /** Optional breadcrumb navigation */
  breadcrumb?: ReactNode;
  /** Background variant */
  variant?: 'default' | 'gradient' | 'transparent';
}

// ============================================================================
// PageHeader Component
// ============================================================================

export default function PageHeader({
  title,
  subtitle,
  actions,
  icon,
  badge,
  breadcrumb,
  variant = 'default',
}: PageHeaderProps) {
  // Background styles based on variant
  const bgStyles = {
    default: 'bg-white border-b border-gray-200',
    gradient: 'bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-100',
    transparent: 'bg-transparent',
  };

  return (
    <div className={`${bgStyles[variant]} py-6 px-4 sm:px-6 lg:px-8 mb-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        {breadcrumb && (
          <nav className="mb-4" aria-label="Breadcrumb">
            {breadcrumb}
          </nav>
        )}

        {/* Header Content */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title Section */}
          <div className="flex items-start gap-4">
            {/* Icon */}
            {icon && (
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                {icon}
              </div>
            )}

            {/* Title & Subtitle */}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {title}
                </h1>
                {badge && badge}
              </div>

              {subtitle && (
                <p className="mt-1 text-sm sm:text-base text-gray-600 max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Actions Section */}
          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Breadcrumb Component
// ============================================================================

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <ol className="flex items-center gap-2 text-sm text-gray-500">
      {items.map((item, index) => (
        <li key={index} className="flex items-center gap-2">
          {index > 0 && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <a href={item.href} className="hover:text-indigo-600 transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  );
}

// ============================================================================
// Badge Components for Page Header
// ============================================================================

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function PageBadge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
