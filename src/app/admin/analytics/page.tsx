'use client';

/**
 * BiasBreaker Admin Platform Analytics Page
 * Comprehensive analytics with charts, tables, and CSV exports
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, subDays, subMonths } from 'date-fns';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { getAllAnalyses, getAllColleges, getGlobalStats } from '@/lib/firestore';
import {
  filterByDateRange,
  calculateTrends,
  calculateMonthlyTrends,
  getTopColleges,
  getBiasTypeDistribution,
  getSeverityBreakdown,
  calculatePlatformStats,
  generatePlatformInsights,
  exportCollegesToCSV,
  exportAnalysesToCSV,
  BIAS_TYPE_CONFIG,
  type DateRangeFilter,
  type BiasTypeDistribution
} from '@/lib/adminUtils';
import StatsCard, { StatsCardSkeleton } from '@/components/admin/StatsCard';
import type { Analysis, College, GlobalStats } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface AnalyticsData {
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

const SEVERITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Section Card Component
 */
function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/**
 * College Comparison Chart
 */
function CollegeComparisonChart({ colleges }: { colleges: College[] }) {
  const data = colleges.slice(0, 8).map(c => ({
    name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
    biasScore: c.averageBiasScore,
    reports: c.totalReports,
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No college data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} width={100} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
          }}
          formatter={(value, name) => [
            name === 'biasScore' ? `${value}%` : value,
            name === 'biasScore' ? 'Bias Score' : 'Reports'
          ]}
        />
        <Legend />
        <Bar
          dataKey="biasScore"
          name="Bias Score"
          fill="#7C3AED"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Severity Pie Chart
 */
function SeverityPieChart({ breakdown }: { breakdown: { high: number; medium: number; low: number } }) {
  const data = [
    { name: 'High', value: breakdown.high, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: breakdown.medium, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: breakdown.low, color: SEVERITY_COLORS.low },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500">
        No severity data available
      </div>
    );
  }

  return (
    <div className="flex items-center gap-8">
      <ResponsiveContainer width={200} height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}%`, 'Percentage']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-3">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-gray-700">{item.name}</span>
            <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Growth Area Chart
 */
function GrowthAreaChart({ trends }: { trends: Array<{ date: string; count: number; avgScore: number }> }) {
  if (trends.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={trends}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} />
        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="count"
          stroke="#7C3AED"
          fillOpacity={1}
          fill="url(#colorCount)"
          name="Analyses"
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="avgScore"
          stroke="#F59E0B"
          fillOpacity={1}
          fill="url(#colorScore)"
          name="Avg Bias Score"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Bias Type Radar Chart
 */
function BiasTypeRadarChart({ distribution }: { distribution: Array<{ name: string; count: number; type: string; color: string }> }) {
  if (distribution.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No bias type data available
      </div>
    );
  }

  const maxCount = Math.max(...distribution.map(d => d.count));
  const data = distribution.map(d => ({
    ...d,
    fullMark: maxCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
        <PolarRadiusAxis angle={30} domain={[0, maxCount]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
        <Radar
          name="Occurrences"
          dataKey="count"
          stroke="#7C3AED"
          fill="#7C3AED"
          fillOpacity={0.3}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/**
 * Insights Panel
 */
function InsightsPanel({ insights }: { insights: string[] }) {
  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100"
        >
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-purple-600 text-sm font-bold">{index + 1}</span>
          </div>
          <p className="text-sm text-gray-700">{insight}</p>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Loading State
 */
function LoadingState() {
  return (
    <div className="min-h-screen bg-[#F5F3FF] p-6 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-xl shadow-lg" />
          <div className="h-80 bg-white rounded-xl shadow-lg" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AnalyticsPage() {
  const router = useRouter();

  // State
  const [data, setData] = useState<AnalyticsData>({
    analyses: [],
    colleges: [],
    globalStats: null,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRangeFilter>('30d');

  // Fetch data
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
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Computed data
  const computedData = useMemo(() => {
    const filteredAnalyses = filterByDateRange(data.analyses, dateRange);
    const trends = calculateTrends(filteredAnalyses, dateRange);
    const monthlyTrends = calculateMonthlyTrends(data.analyses);
    const topColleges = getTopColleges(data.colleges, 10);
    const biasDistribution = getBiasTypeDistribution(filteredAnalyses);
    const severityBreakdown = getSeverityBreakdown(filteredAnalyses);
    const platformStats = calculatePlatformStats(data.analyses, data.colleges);
    const insights = generatePlatformInsights(data.analyses, data.colleges);

    // Calculate period-specific stats
    const periodStats = {
      totalAnalyses: filteredAnalyses.length,
      avgScore: filteredAnalyses.length > 0
        ? Math.round(filteredAnalyses.reduce((sum: number, a: Analysis) => sum + a.biasScore, 0) / filteredAnalyses.length)
        : 0,
      highSeverityCount: filteredAnalyses.filter((a: Analysis) => a.severity === 'high').length,
      uniqueColleges: new Set(filteredAnalyses.map((a: Analysis) => a.collegeId)).size,
      uniqueUsers: new Set(filteredAnalyses.map((a: Analysis) => a.userId)).size,
    };

    return {
      filteredAnalyses,
      trends,
      monthlyTrends,
      topColleges,
      biasDistribution,
      severityBreakdown,
      platformStats,
      insights,
      periodStats,
    };
  }, [data, dateRange]);

  // Handlers
  const handleExportAnalyses = () => {
    exportAnalysesToCSV(computedData.filteredAnalyses);
  };

  const handleExportColleges = () => {
    exportCollegesToCSV(data.colleges);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div {...fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-500">
              Comprehensive analysis of bias patterns across all colleges
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
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

            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleExportAnalyses}
                disabled={computedData.filteredAnalyses.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Analyses CSV
              </button>
              <button
                onClick={handleExportColleges}
                disabled={data.colleges.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Colleges CSV
              </button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            value={computedData.periodStats.totalAnalyses.toLocaleString()}
            label="Total Analyses"
            subtext={`${data.analyses.length} all time`}
            gradient="from-blue-500 to-cyan-500"
          />

          <StatsCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            value={`${computedData.periodStats.avgScore}%`}
            label="Avg Bias Score"
            subtext="Period average"
            gradient="from-purple-500 to-pink-500"
            valueColor={
              computedData.periodStats.avgScore >= 70 ? 'text-red-600' :
              computedData.periodStats.avgScore >= 40 ? 'text-orange-600' :
              'text-green-600'
            }
          />

          <StatsCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            value={computedData.periodStats.highSeverityCount.toString()}
            label="High Severity"
            subtext="Critical incidents"
            gradient="from-red-500 to-orange-500"
            valueColor="text-red-600"
          />

          <StatsCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            value={computedData.periodStats.uniqueColleges.toString()}
            label="Active Colleges"
            subtext="With submissions"
            gradient="from-emerald-500 to-teal-500"
          />

          <StatsCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            value={computedData.periodStats.uniqueUsers.toString()}
            label="Active Users"
            subtext="Unique submitters"
            gradient="from-indigo-500 to-purple-500"
          />
        </motion.div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Growth Trend */}
          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <SectionCard title="Platform Growth" subtitle="Analyses and bias scores over time">
              <GrowthAreaChart trends={computedData.trends} />
            </SectionCard>
          </motion.div>

          {/* Bias Type Distribution */}
          <motion.div {...fadeIn} transition={{ delay: 0.25 }}>
            <SectionCard title="Bias Type Radar" subtitle="Distribution across categories">
              <BiasTypeRadarChart distribution={computedData.biasDistribution} />
            </SectionCard>
          </motion.div>
        </div>

        {/* Secondary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* College Comparison */}
          <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <SectionCard 
              title="College Comparison" 
              subtitle="Top colleges by bias score"
              action={
                <button
                  onClick={() => router.push('/admin/colleges')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View All →
                </button>
              }
            >
              <CollegeComparisonChart colleges={computedData.topColleges} />
            </SectionCard>
          </motion.div>

          {/* Severity Breakdown */}
          <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
            <SectionCard title="Severity Breakdown" subtitle="Distribution by severity level">
              <SeverityPieChart breakdown={computedData.severityBreakdown} />
            </SectionCard>
          </motion.div>
        </div>

        {/* Insights Section */}
        <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
          <SectionCard
            title="Platform Insights"
            subtitle="AI-generated observations and recommendations"
          >
            {computedData.insights.length > 0 ? (
              <InsightsPanel insights={computedData.insights} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Not enough data to generate insights
              </div>
            )}
          </SectionCard>
        </motion.div>

        {/* Bias Type Breakdown Table */}
        <motion.div {...fadeIn} transition={{ delay: 0.45 }}>
          <SectionCard title="Bias Type Breakdown" subtitle="Detailed statistics per bias category">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Count</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">% of Total</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Distribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {computedData.biasDistribution.map((item: BiasTypeDistribution) => {
                    const totalCount = computedData.biasDistribution.reduce((sum: number, d: BiasTypeDistribution) => sum + d.count, 0);
                    const percentage = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                    
                    return (
                      <tr key={item.type} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700 font-medium">
                          {item.count}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {percentage}%
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: item.color 
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </motion.div>

        {/* Quick Stats Summary */}
        <motion.div {...fadeIn} transition={{ delay: 0.5 }}>
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Platform Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-purple-200 text-sm">Total Analyses</p>
                <p className="text-3xl font-bold">{data.analyses.length.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm">Total Colleges</p>
                <p className="text-3xl font-bold">{data.colleges.length}</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm">Total Users</p>
                <p className="text-3xl font-bold">{data.globalStats?.totalUsers?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p className="text-purple-200 text-sm">Platform Score</p>
                <p className="text-3xl font-bold">{computedData.platformStats.averageBiasScore}%</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
