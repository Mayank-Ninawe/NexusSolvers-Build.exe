'use client';

/**
 * BiasBreaker Student Dashboard
 * Personal dashboard showing user's analysis history, statistics, and quick actions
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, format, startOfMonth, subMonths, isAfter } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAnalyses } from '@/lib/firestore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import type { Analysis, BiasType } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  subtext?: string;
  subtextColor?: string;
  valueColor?: string;
  gradient: string;
}

// ============================================================================
// Constants
// ============================================================================

const BIAS_TYPE_COLORS: Record<BiasType, { bg: string; text: string; label: string }> = {
  gender_bias: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Gender Bias' },
  department_discrimination: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dept. Discrimination' },
  socioeconomic_bias: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Socioeconomic' },
  academic_elitism: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Academic Elitism' },
  community_patterns: { bg: 'bg-green-100', text: 'text-green-700', label: 'Community' },
};

const SEVERITY_COLORS = {
  low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-l-green-500' },
  medium: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-l-orange-500' },
  high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-l-red-500' },
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Statistics Card Component
 */
function StatCard({ icon, value, label, subtext, subtextColor = 'text-green-600', valueColor = 'text-gray-900', gradient }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-lg ${gradient} flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
        <p className="text-gray-500 text-sm mt-1">{label}</p>
        {subtext && (
          <p className={`text-xs mt-2 font-medium ${subtextColor}`}>{subtext}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Skeleton Loader for Stats Cards
 */
function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="w-12 h-12 rounded-lg bg-gray-200" />
      <div className="mt-4 space-y-2">
        <div className="h-8 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

/**
 * Analysis Card Component
 */
function AnalysisCard({ analysis, onClick }: { analysis: Analysis; onClick: () => void }) {
  const severityStyle = SEVERITY_COLORS[analysis.severity];
  
  // Determine score color
  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score <= 70) return 'text-orange-500';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score <= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-l-4 ${severityStyle.border} p-4 hover:shadow-md transition-all duration-200 cursor-pointer group`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 truncate pr-4">
            {analysis.title || 'Untitled Analysis'}
          </h3>
          
          {/* Date */}
          <p className="text-sm text-gray-500 mt-1">
            {format(analysis.timestamp, "MMM d, yyyy 'at' h:mm a")}
          </p>
          
          {/* Bias Score Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Bias Score</span>
              <span className={`font-semibold ${getScoreColor(analysis.biasScore)}`}>
                {analysis.biasScore}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getProgressColor(analysis.biasScore)}`}
                style={{ width: `${analysis.biasScore}%` }}
              />
            </div>
          </div>
          
          {/* Bias Types Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {analysis.biasTypes.slice(0, 3).map((type) => {
              const style = BIAS_TYPE_COLORS[type];
              return (
                <span
                  key={type}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
                >
                  {style.label}
                </span>
              );
            })}
            {analysis.biasTypes.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{analysis.biasTypes.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        {/* Severity Badge */}
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${severityStyle.bg} ${severityStyle.text}`}>
          {analysis.severity}
        </span>
      </div>
      
      {/* View Details Button (visible on hover) */}
      <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <span className="text-sm font-medium text-purple-600 flex items-center gap-1">
          View Details
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

/**
 * Analysis Card Skeleton
 */
function AnalysisCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border-l-4 border-l-gray-200 p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-100 rounded" />
          <div className="h-2 w-full bg-gray-200 rounded-full" />
          <div className="flex gap-2">
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
            <div className="h-5 w-16 bg-gray-100 rounded-full" />
          </div>
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ onStartAnalysis }: { onStartAnalysis: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      {/* Upload Icon */}
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">No analyses yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Start analyzing placement communications to detect bias patterns and improve fairness in your campus hiring process.
      </p>
      
      <button
        onClick={onStartAnalysis}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Start Your First Analysis
      </button>
    </div>
  );
}

// ============================================================================
// Main Dashboard Content Component
// ============================================================================

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  
  // State
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user analyses on mount
  useEffect(() => {
    async function fetchAnalyses() {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        setError(null);
        const userAnalyses = await getUserAnalyses(user.uid);
        setAnalyses(userAnalyses);
      } catch (err) {
        console.error('Failed to fetch analyses:', err);
        setError('Failed to load your analyses. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalyses();
  }, [user?.uid]);

  // Calculate statistics using useMemo for performance
  const stats = useMemo(() => {
    if (!analyses.length) {
      return {
        totalAnalyses: 0,
        averageBias: 0,
        lastAnalysis: null,
        thisMonth: 0,
        lastMonth: 0,
      };
    }

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = thisMonthStart;

    const thisMonthCount = analyses.filter(a => isAfter(a.timestamp, thisMonthStart)).length;
    const lastMonthCount = analyses.filter(a => 
      isAfter(a.timestamp, lastMonthStart) && !isAfter(a.timestamp, lastMonthEnd)
    ).length;

    const totalBias = analyses.reduce((sum, a) => sum + a.biasScore, 0);
    const avgBias = Math.round(totalBias / analyses.length);

    return {
      totalAnalyses: analyses.length,
      averageBias: avgBias,
      lastAnalysis: analyses[0]?.timestamp || null,
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount,
    };
  }, [analyses]);

  // Get recent analyses (last 5)
  const recentAnalyses = useMemo(() => analyses.slice(0, 5), [analyses]);

  // Determine trend indicator for this month
  const getTrendIndicator = () => {
    if (stats.thisMonth > stats.lastMonth) {
      return { text: `↑ ${stats.thisMonth - stats.lastMonth} from last month`, color: 'text-green-600' };
    } else if (stats.thisMonth < stats.lastMonth) {
      return { text: `↓ ${stats.lastMonth - stats.thisMonth} from last month`, color: 'text-red-600' };
    }
    return { text: 'Same as last month', color: 'text-gray-500' };
  };

  // Get average bias score color
  const getAverageColor = () => {
    if (stats.averageBias < 30) return 'text-green-600';
    if (stats.averageBias <= 70) return 'text-orange-500';
    return 'text-red-600';
  };

  const trend = getTrendIndicator();

  // Navigation handlers
  const handleNavigate = (path: string) => router.push(path);

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your bias analysis progress</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm text-gray-500">Welcome back,</span>
              <span className="text-sm font-semibold text-gray-900">
                {user?.displayName || user?.email?.split('@')[0]}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                {/* Total Analyses */}
                <StatCard
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                  value={stats.totalAnalyses}
                  label="Total Analyses"
                  subtext={stats.thisMonth > 0 ? `+${stats.thisMonth} this month` : undefined}
                  gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />

                {/* Average Bias Score */}
                <StatCard
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  value={stats.totalAnalyses > 0 ? `${stats.averageBias}%` : '-'}
                  label="Average Bias Detected"
                  valueColor={stats.totalAnalyses > 0 ? getAverageColor() : 'text-gray-400'}
                  gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                />

                {/* Last Analysis */}
                <StatCard
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  value={stats.lastAnalysis ? formatDistanceToNow(stats.lastAnalysis, { addSuffix: true }) : 'No analyses yet'}
                  label="Last Check"
                  gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
                />

                {/* This Month */}
                <StatCard
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  value={stats.thisMonth}
                  label="Analyses This Month"
                  subtext={trend.text}
                  subtextColor={trend.color}
                  gradient="bg-gradient-to-br from-pink-500 to-pink-600"
                />
              </>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* New Analysis Button */}
              <button
                onClick={() => handleNavigate('/upload')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                New Analysis
              </button>

              {/* View All History Button */}
              <button
                onClick={() => handleNavigate('/student/history')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                View All History
              </button>

              {/* Browse Templates Button */}
              <button
                onClick={() => handleNavigate('/templates')}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Browse Templates
              </button>
            </div>
          </div>
        </section>

        {/* Recent Analyses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Analyses</h2>
            {analyses.length > 0 && (
              <button
                onClick={() => handleNavigate('/student/history')}
                className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              <AnalysisCardSkeleton />
              <AnalysisCardSkeleton />
              <AnalysisCardSkeleton />
            </div>
          ) : analyses.length === 0 ? (
            <EmptyState onStartAnalysis={() => handleNavigate('/upload')} />
          ) : (
            <div className="space-y-4">
              {recentAnalyses.map((analysis) => (
                <AnalysisCard
                  key={analysis.id}
                  analysis={analysis}
                  onClick={() => handleNavigate(`/student/analysis/${analysis.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ============================================================================
// Main Page Component with Route Protection
// ============================================================================

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
