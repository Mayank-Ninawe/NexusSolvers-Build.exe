'use client';

/**
 * BiasBreaker Admin Stats Card Component
 * Reusable KPI card for displaying platform statistics
 */

import React from 'react';

// ============================================================================
// Types
// ============================================================================

interface StatsCardProps {
  /** Icon component to display */
  icon: React.ReactNode;
  /** Main value to display (number or string) */
  value: string | number;
  /** Label describing the value */
  label: string;
  /** Optional trend indicator text (e.g., "+12% from last month") */
  trend?: string;
  /** Whether the trend is positive (green) or negative (red) */
  trendPositive?: boolean;
  /** Optional subtext below the label */
  subtext?: string;
  /** Gradient class for the icon background */
  gradient?: string;
  /** Color class for the main value */
  valueColor?: string;
  /** Optional click handler */
  onClick?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export default function StatsCard({
  icon,
  value,
  label,
  trend,
  trendPositive = true,
  subtext,
  gradient = 'bg-gradient-to-br from-blue-500 to-blue-600',
  valueColor = 'text-gray-900',
  onClick,
}: StatsCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
    >
      {/* Header Row: Icon and Trend */}
      <div className="flex items-start justify-between mb-4">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-lg ${gradient} flex items-center justify-center shadow-sm`}
        >
          {icon}
        </div>

        {/* Trend Badge */}
        {trend && (
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              trendPositive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {trendPositive ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>

      {/* Main Value */}
      <p className={`text-3xl font-bold ${valueColor} mb-1`}>{value}</p>

      {/* Label */}
      <p className="text-gray-500 text-sm font-medium">{label}</p>

      {/* Optional Subtext */}
      {subtext && (
        <p className="text-xs text-gray-400 mt-2">{subtext}</p>
      )}
    </div>
  );
}

// ============================================================================
// Skeleton Loader Component
// ============================================================================

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-200" />
        <div className="w-16 h-6 rounded-full bg-gray-100" />
      </div>
      <div className="h-9 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-32 bg-gray-100 rounded" />
    </div>
  );
}
