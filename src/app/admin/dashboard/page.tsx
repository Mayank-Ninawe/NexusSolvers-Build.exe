'use client';

/**
 * BiasBreaker Super Admin Dashboard
 * Platform-wide analytics overview with real-time Firestore data
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllAnalyses, getAllColleges, getGlobalStats } from '@/lib/firestore';
import { 
  filterByDateRange, 
  calculateTrends, 
  getTopColleges, 
  getBiasTypeDistribution, 
  calculatePlatformStats,
  generatePlatformInsights,
  BIAS_TYPE_CONFIG,
  type DateRangeFilter
} from '@/lib/adminUtils';
import StatsCard, { StatsCardSkeleton } from '@/components/admin/StatsCard';
import { useRealtimeAnalyses } from '@/hooks/useRealtimeAnalyses';
import RealtimeNotifications from '@/components/admin/RealtimeNotifications';
import LiveActivityFeed from '@/components/admin/LiveActivityFeed';
import RealtimeBiasChart from '@/components/admin/RealtimeBiasChart';
import type { Analysis, College, GlobalStats } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface DashboardData {
  analyses: Analysis[];
  colleges: College[];
  globalStats: GlobalStats | null;
}

// ============================================================================
// Constants
// ============================================================================

const DATE_RANGES: { label: string; value: DateRangeFilter }[] = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Year', value: '1y' },
  { label: 'All Time', value: 'all' },
];

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// ============================================================================
// Real-Time Indicator Components
// ============================================================================

/**
 * Live Indicator Badge - Shows pulsing live indicator
 */
function LiveIndicatorBadge({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
      <span className={`relative flex h-2.5 w-2.5`}>
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </span>
      <span className={`text-xs font-semibold ${
        isConnected ? 'text-green-600' : 'text-red-600'
      }`}>
        {isConnected ? 'Live' : 'Disconnected'}
      </span>
    </div>
  );
}

/**
 * Connection Status Banner - Shows warning when disconnected
 */
function ConnectionStatusBanner({ 
  isConnected, 
  onRetry 
}: { 
  isConnected: boolean; 
  onRetry: () => void;
}) {
  if (isConnected) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-red-800">Connection Lost</p>
            <p className="text-sm text-red-600">Real-time updates are paused. Data may be outdated.</p>
          </div>
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry Connection
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Pulse Indicator for real-time updating cards
 */
function PulseIndicator() {
  return (
    <span className="absolute -top-1 -right-1 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
    </span>
  );
}

/**
 * New Analyses Counter Badge
 */
function NewAnalysesBadge({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      onClick={onClick}
    >
      {count} new {count === 1 ? 'analysis' : 'analyses'}
    </motion.button>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Section Header Component
 */
function SectionHeader({ 
  title, 
  subtitle, 
  action 
}: { 
  title: string; 
  subtitle?: string; 
  action?: React.ReactNode 
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * Top Colleges Table Component
 */
function TopCollegesTable({ 
  colleges, 
  loading,
  onViewCollege 
}: { 
  colleges: College[]; 
  loading: boolean;
  onViewCollege: (collegeId: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {colleges.slice(0, 5).map((college, index) => (
        <motion.div
          key={college.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onViewCollege(college.id)}
          className="flex items-center gap-4 p-3 bg-gray-50 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors group"
        >
          {/* Rank */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            index === 0 ? 'bg-yellow-100 text-yellow-700' :
            index === 1 ? 'bg-gray-200 text-gray-600' :
            index === 2 ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            {index + 1}
          </div>

          {/* College Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate group-hover:text-purple-700 transition-colors">
              {college.name}
            </p>
            <p className="text-xs text-gray-500">
              {college.totalReports} reports • Last: {formatDistanceToNow(college.lastActivity, { addSuffix: true })}
            </p>
          </div>

          {/* Score */}
          <div className="text-right">
            <span className={`text-lg font-bold ${
              college.averageBiasScore >= 70 ? 'text-red-600' :
              college.averageBiasScore >= 40 ? 'text-orange-600' :
              'text-green-600'
            }`}>
              {college.averageBiasScore}%
            </span>
            <p className="text-xs text-gray-500">bias score</p>
          </div>

          {/* Arrow */}
          <svg 
            className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      ))}

      {colleges.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No college data available
        </div>
      )}
    </div>
  );
}

/**
 * Recent Activity Feed Component
 */
function RecentActivityFeed({ 
  analyses, 
  loading,
  onViewAnalysis 
}: { 
  analyses: Analysis[]; 
  loading: boolean;
  onViewAnalysis: (analysisId: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  const recentAnalyses = analyses
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 8);

  return (
    <div className="space-y-2">
      {recentAnalyses.map((analysis, index) => (
        <motion.div
          key={analysis.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onViewAnalysis(analysis.id)}
          className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors group"
        >
          {/* Severity Indicator */}
          <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
            analysis.severity === 'high' ? 'bg-red-500' :
            analysis.severity === 'medium' ? 'bg-orange-500' :
            'bg-green-500'
          }`} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-purple-700 transition-colors">
              {analysis.title || 'Untitled Analysis'}
            </p>
            <p className="text-xs text-gray-500">
              {analysis.collegeName} • Score: {analysis.biasScore}%
            </p>
          </div>

          {/* Timestamp */}
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatDistanceToNow(analysis.timestamp, { addSuffix: true })}
          </span>
        </motion.div>
      ))}

      {recentAnalyses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No recent activity
        </div>
      )}
    </div>
  );
}

/**
 * Insights Card Component
 */
function InsightsCard({ insights }: { insights: string[] }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900">Platform Insights</h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-2">
            <svg className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-700">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AdminDashboardPage() {
  const router = useRouter();

  // State
  const [data, setData] = useState<DashboardData>({
    analyses: [],
    colleges: [],
    globalStats: null,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRangeFilter>('30d');

  // Real-time analyses hook for live updates
  const {
    analyses: realtimeAnalyses,
    loading: realtimeLoading,
    isConnected,
    newAnalysesCount,
    resetNewCount,
    refresh: refreshRealtime,
  } = useRealtimeAnalyses({
    limit: 50,
    realtime: true,
  });

  // Fetch initial data on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [analyses, colleges, globalStats] = await Promise.all([
          getAllAnalyses(),
          getAllColleges(),
          getGlobalStats(),
        ]);

        setData({ analyses, colleges, globalStats });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Merge realtime analyses with initial data for live count
  const mergedAnalyses = useMemo(() => {
    if (realtimeAnalyses.length > 0) {
      // Use realtime analyses for the most up-to-date data
      const realtimeIds = new Set(realtimeAnalyses.map((a) => a.id));
      const additionalAnalyses = data.analyses.filter((a) => !realtimeIds.has(a.id));
      return [...realtimeAnalyses, ...additionalAnalyses];
    }
    return data.analyses;
  }, [realtimeAnalyses, data.analyses]);

  // Computed data based on date range
  const computedData = useMemo(() => {
    const filteredAnalyses = filterByDateRange(mergedAnalyses, dateRange);
    const trends = calculateTrends(filteredAnalyses, dateRange);
    const topColleges = getTopColleges(data.colleges, 5);
    const biasDistribution = getBiasTypeDistribution(filteredAnalyses);
    const platformStats = calculatePlatformStats(mergedAnalyses, data.colleges);
    const insights = generatePlatformInsights(mergedAnalyses, data.colleges);

    return {
      filteredAnalyses,
      trends,
      topColleges,
      biasDistribution,
      platformStats,
      insights,
    };
  }, [mergedAnalyses, data.colleges, dateRange]);

  // Handle retry connection
  const handleRetryConnection = useCallback(() => {
    refreshRealtime();
  }, [refreshRealtime]);

  // Handle new analyses badge click
  const handleNewAnalysesClick = useCallback(() => {
    resetNewCount();
    // Scroll to top or focus on activity feed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetNewCount]);

  // Handlers
  const handleViewCollege = (collegeId: string) => {
    router.push(`/admin/colleges/${collegeId}`);
  };

  const handleViewAnalysis = (analysisId: string) => {
    router.push(`/student/analysis/${analysisId}`);
  };

  return (
    <>
      {/* Real-time Notifications Toast Container */}
      <RealtimeNotifications />

      <div className="min-h-screen bg-[#F5F3FF] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Connection Status Banner */}
          <ConnectionStatusBanner 
            isConnected={isConnected} 
            onRetry={handleRetryConnection}
          />

          {/* Header */}
          <motion.div {...fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
                  <LiveIndicatorBadge isConnected={isConnected} />
                </div>
                <p className="text-gray-500">
                  Real-time analytics across all colleges
                </p>
              </div>
              
              {/* New Analyses Badge */}
              <NewAnalysesBadge count={newAnalysesCount} onClick={handleNewAnalysesClick} />
            </div>

            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer shadow-sm"
            >
              {DATE_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </motion.div>

          {/* KPI Cards */}
          <motion.div 
            {...fadeIn}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {loading ? (
              <>
                <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                value={data.globalStats?.totalUsers?.toLocaleString() || '0'}
                label="Total Users"
                trend="8.5%"
                trendPositive={true}
                subtext="Platform registrations"
                gradient="from-blue-500 to-cyan-500"
              />

              <StatsCard
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                value={data.colleges.length.toString()}
                label="Active Colleges"
                trend="12%"
                trendPositive={true}
                subtext="Institutions onboarded"
                gradient="from-purple-500 to-pink-500"
              />

              {/* Analyses Card with Real-time Pulse Indicator */}
              <div className="relative">
                {isConnected && <PulseIndicator />}
                <StatsCard
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                  value={mergedAnalyses.length.toLocaleString()}
                  label="Total Analyses"
                  trend={`${computedData.platformStats.monthlyGrowth}%`}
                  trendPositive={computedData.platformStats.monthlyGrowth > 0}
                  subtext={isConnected ? 'Live updating' : `${computedData.filteredAnalyses.length} in period`}
                  gradient="from-emerald-500 to-teal-500"
                />
              </div>

              <StatsCard
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                value={`${computedData.platformStats.averageBiasScore}%`}
                label="Avg Bias Score"
                trend="3.2%"
                trendPositive={true}
                subtext="Platform average"
                gradient="from-orange-500 to-red-500"
                valueColor={
                  computedData.platformStats.averageBiasScore >= 70 ? 'text-red-600' :
                  computedData.platformStats.averageBiasScore >= 40 ? 'text-orange-600' :
                  'text-green-600'
                }
              />
            </>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section - 2 columns */}
          <motion.div 
            {...fadeIn}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Trend Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <SectionHeader 
                title="Platform Trends" 
                subtitle="Analysis volume and bias scores over time"
              />

              <div className="h-72">
                {loading ? (
                  <div className="h-full bg-gray-100 animate-pulse rounded-lg" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={computedData.trends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        tickLine={false}
                      />
                      <YAxis 
                        yAxisId="left"
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right"
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="count" 
                        stroke="#7C3AED" 
                        strokeWidth={2}
                        dot={{ fill: '#7C3AED', strokeWidth: 0, r: 4 }}
                        name="Analyses"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="avgScore" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#F59E0B', strokeWidth: 0, r: 4 }}
                        name="Avg Bias Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Bias Type Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <SectionHeader 
                title="Bias Type Distribution" 
                subtitle="Breakdown by bias category"
              />

              <div className="h-64">
                {loading ? (
                  <div className="h-full bg-gray-100 animate-pulse rounded-lg" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={computedData.biasDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={false} />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        tickLine={false}
                        axisLine={false}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [`${value} occurrences`, 'Count']}
                      />
                      <Bar 
                        dataKey="count" 
                        radius={[0, 4, 4, 0]}
                      >
                        {computedData.biasDistribution.map((entry: { color: string }, index: number) => (
                          <rect key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div 
            {...fadeIn}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Top Colleges */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <SectionHeader 
                title="Top Colleges by Bias" 
                subtitle="Highest bias scores"
                action={
                  <button
                    onClick={() => router.push('/admin/colleges')}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    View All →
                  </button>
                }
              />
              <TopCollegesTable 
                colleges={computedData.topColleges}
                loading={loading}
                onViewCollege={handleViewCollege}
              />
            </div>

            {/* Live Activity Feed - Real-time Updates */}
            <LiveActivityFeed 
              maxItems={10}
              showFilters={false}
              compact={false}
            />

            {/* Insights */}
            {!loading && computedData.insights.length > 0 && (
              <InsightsCard insights={computedData.insights} />
            )}
          </motion.div>
        </div>

        {/* Real-Time Bias Trends Chart */}
        <motion.div 
          {...fadeIn}
          transition={{ delay: 0.35 }}
        >
          <RealtimeBiasChart height={280} />
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          {...fadeIn}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/colleges')}
              className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">View Colleges</span>
            </button>

            <button
              onClick={() => router.push('/admin/analytics')}
              className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Analytics</span>
            </button>

            <button
              onClick={() => router.push('/admin/reports')}
              className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Reports</span>
            </button>

            <button
              onClick={() => router.push('/admin/settings')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Settings</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
