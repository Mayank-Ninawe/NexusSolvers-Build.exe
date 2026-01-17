'use client';

/**
 * StatsCard Component
 * Reusable card for displaying statistics with icons and trends
 */

import React, { ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

interface StatsCardProps {
  /** Card title/label */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Icon to display */
  icon: ReactNode;
  /** Optional trend data */
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  /** Color theme for the card */
  color?: 'indigo' | 'purple' | 'green' | 'blue' | 'pink' | 'orange' | 'red';
  /** Optional description text */
  description?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Loading state */
  loading?: boolean;
}

// ============================================================================
// Color Configuration
// ============================================================================

const colorConfig = {
  indigo: {
    iconBg: 'from-indigo-500 to-indigo-600',
    iconShadow: 'shadow-indigo-200',
    trendUp: 'text-green-600 bg-green-50',
    trendDown: 'text-red-600 bg-red-50',
  },
  purple: {
    iconBg: 'from-purple-500 to-purple-600',
    iconShadow: 'shadow-purple-200',
    trendUp: 'text-green-600 bg-green-50',
    trendDown: 'text-red-600 bg-red-50',
  },
  green: {
    iconBg: 'from-green-500 to-green-600',
    iconShadow: 'shadow-green-200',
    trendUp: 'text-green-600 bg-green-50',
    trendDown: 'text-red-600 bg-red-50',
  },
  blue: {
    iconBg: 'from-blue-500 to-blue-600',
    iconShadow: 'shadow-blue-200',
    trendUp: 'text-green-600 bg-green-50',
    trendDown: 'text-red-600 bg-red-50',
  },
  pink: {
    iconBg: 'from-pink-500 to-pink-600',
    iconShadow: 'shadow-pink-200',
    trendUp: 'text-green-600 bg-green-50',
    trendDown: 'text-red-600 bg-red-50',
  },
  orange: {
    iconBg: 'from-orange-500 to-orange-600',
    iconShadow: 'shadow-orange-200',
    trendUp: 'text-green-600 bg-green-50',
    trendDown: 'text-red-600 bg-red-50',
  },
  red: {
    iconBg: 'from-red-500 to-red-600',
    iconShadow: 'shadow-red-200',
    trendUp: 'text-green-600 bg-green-50',
    trendDown: 'text-red-600 bg-red-50',
  },
};

// ============================================================================
// Icons
// ============================================================================

const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

// ============================================================================
// StatsCard Component
// ============================================================================

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  color = 'indigo',
  description,
  onClick,
  loading = false,
}: StatsCardProps) {
  const colors = colorConfig[color];

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-white rounded-xl shadow-md border border-gray-100 p-6 
        transition-all duration-200 hover:shadow-lg hover:border-gray-200
        ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start justify-between">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          
          {/* Value */}
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
            
            {/* Trend Badge */}
            {trend && (
              <span className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                ${trend.isPositive ? colors.trendUp : colors.trendDown}
              `}>
                {trend.isPositive ? <TrendUpIcon /> : <TrendDownIcon />}
                {Math.abs(trend.value)}%
                {trend.label && <span className="ml-1 text-gray-500">{trend.label}</span>}
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="mt-2 text-xs text-gray-500">{description}</p>
          )}
        </div>

        {/* Icon */}
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-xl 
          bg-gradient-to-br ${colors.iconBg} 
          flex items-center justify-center text-white
          shadow-lg ${colors.iconShadow}
        `}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// StatsCardGrid Component
// ============================================================================

interface StatsCardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

export function StatsCardGrid({ children, columns = 4 }: StatsCardGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6`}>
      {children}
    </div>
  );
}

// ============================================================================
// MiniStatsCard Component (Compact Version)
// ============================================================================

interface MiniStatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'indigo' | 'purple' | 'green' | 'blue' | 'pink' | 'orange' | 'red';
}

export function MiniStatsCard({ title, value, icon, color = 'indigo' }: MiniStatsCardProps) {
  const colors = colorConfig[color];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-4">
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-lg 
        bg-gradient-to-br ${colors.iconBg} 
        flex items-center justify-center text-white
      `}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 truncate">{title}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
