'use client';

/**
 * BiasBreaker Admin College Details Page
 * Individual college view with all analyses and detailed analytics
 */

import React, { useState, useEffect, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getCollegeData, getAllAnalyses } from '@/lib/firestore';
import { 
  calculateTrends, 
  getBiasTypeDistribution, 
  getSeverityBreakdown,
  BIAS_TYPE_CONFIG,
  getScoreColor,
  exportAnalysesToCSV
} from '@/lib/adminUtils';
import StatsCard, { StatsCardSkeleton } from '@/components/admin/StatsCard';
import AnalysisTable from '@/components/admin/AnalysisTable';
import type { College, Analysis, BiasType } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface PageParams {
  collegeId: string;
}

// ============================================================================
// Constants
// ============================================================================

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Department Breakdown Component
 */
function DepartmentBreakdown({ analyses }: { analyses: Analysis[] }) {
  // Group analyses by department
  const departmentData = useMemo(() => {
    const depts: Record<string, { count: number; totalScore: number }> = {};
    
    analyses.forEach(a => {
      const dept = a.department || 'Unknown';
      if (!depts[dept]) {
        depts[dept] = { count: 0, totalScore: 0 };
      }
      depts[dept].count++;
      depts[dept].totalScore += a.biasScore;
    });

    return Object.entries(depts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgScore: Math.round(data.totalScore / data.count),
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 6);
  }, [analyses]);

  if (departmentData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No department data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {departmentData.map((dept, index) => (
        <div key={dept.name} className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 truncate">
                {dept.name}
              </span>
              <span className={`text-sm font-bold ${getScoreColor(dept.avgScore)}`}>
                {dept.avgScore}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dept.avgScore}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`h-full rounded-full ${
                  dept.avgScore >= 70 ? 'bg-red-500' :
                  dept.avgScore >= 40 ? 'bg-orange-500' :
                  'bg-green-500'
                }`}
              />
            </div>
          </div>
          <span className="text-xs text-gray-500 w-16 text-right">
            {dept.count} reports
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Bias Type Distribution Chart
 */
function BiasDistributionPie({ analyses }: { analyses: Analysis[] }) {
  const distribution = getBiasTypeDistribution(analyses);

  if (distribution.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No bias type data available
      </div>
    );
  }

  // Convert to plain objects for Recharts
  const chartData = distribution.map((d: { name: string; count: number; color: string }) => ({
    name: d.name,
    count: d.count,
    color: d.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={80}
          dataKey="count"
          nameKey="name"
          label={({ name, percent }) => `${(name || 'Unknown').split(' ')[0]} ${((percent || 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((entry: { color: string }, index: number) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} occurrences`, 'Count']}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Severity Distribution Component
 */
function SeverityDistribution({ analyses }: { analyses: Analysis[] }) {
  const breakdown = getSeverityBreakdown(analyses);

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden flex">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${breakdown.high}%` }}
          transition={{ duration: 0.5 }}
          className="h-full bg-red-500"
          title={`High: ${breakdown.high}%`}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${breakdown.medium}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="h-full bg-orange-500"
          title={`Medium: ${breakdown.medium}%`}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${breakdown.low}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-full bg-green-500"
          title={`Low: ${breakdown.low}%`}
        />
      </div>
      <div className="flex gap-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full" />
          High {breakdown.high}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-orange-500 rounded-full" />
          Med {breakdown.medium}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          Low {breakdown.low}%
        </span>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton
 */
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F3FF] p-6 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-6 w-32 bg-gray-100 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-white rounded-xl shadow-lg" />
          <div className="h-64 bg-white rounded-xl shadow-lg" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function CollegeDetailsPage({ params }: { params: Promise<PageParams> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { collegeId } = resolvedParams;

  // State
  const [college, setCollege] = useState<College | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [collegeData, allAnalyses] = await Promise.all([
          getCollegeData(collegeId),
          getAllAnalyses(),
        ]);

        setCollege(collegeData);
        // Filter analyses for this college
        const collegeAnalyses = allAnalyses.filter(a => a.collegeId === collegeId);
        setAnalyses(collegeAnalyses);
      } catch (error) {
        console.error('Error fetching college data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [collegeId]);

  // Computed data
  const computedData = useMemo(() => {
    if (analyses.length === 0) {
      return {
        trends: [],
        avgScore: 0,
        highSeverityCount: 0,
        recentActivityDays: null,
        biasTypeDistribution: [],
      };
    }

    const trends = calculateTrends(analyses, 30);
    const avgScore = Math.round(analyses.reduce((sum, a) => sum + a.biasScore, 0) / analyses.length);
    const highSeverityCount = analyses.filter(a => a.severity === 'high').length;
    
    // Find most recent activity
    const sortedByDate = [...analyses].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const recentActivityDays = sortedByDate.length > 0
      ? Math.floor((Date.now() - sortedByDate[0].timestamp.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const biasTypeDistribution = getBiasTypeDistribution(analyses);

    return {
      trends,
      avgScore,
      highSeverityCount,
      recentActivityDays,
      biasTypeDistribution,
    };
  }, [analyses]);

  // Handlers
  const handleViewAnalysis = (analysis: Analysis) => {
    router.push(`/student/analysis/${analysis.id}`);
  };

  const handleExportCSV = () => {
    exportAnalysesToCSV(analyses);
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (!college) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">College Not Found</h1>
          <p className="text-gray-500 mb-4">The college you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/colleges')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Colleges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div {...fadeIn}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button
              onClick={() => router.push('/admin/colleges')}
              className="hover:text-purple-600 transition-colors"
            >
              Colleges
            </button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{college.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{college.name}</h1>
              <p className="text-gray-500">
                {analyses.length} total analyses • 
                {computedData.recentActivityDays !== null
                  ? ` Last activity ${computedData.recentActivityDays === 0 ? 'today' : `${computedData.recentActivityDays} days ago`}`
                  : ' No activity yet'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                disabled={analyses.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            value={analyses.length.toString()}
            label="Total Analyses"
            subtext="All time"
            gradient="from-blue-500 to-cyan-500"
          />

          <StatsCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            value={`${computedData.avgScore}%`}
            label="Average Bias Score"
            subtext="Platform benchmark: 45%"
            gradient="from-purple-500 to-pink-500"
            valueColor={getScoreColor(computedData.avgScore)}
          />

          <StatsCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            value={computedData.highSeverityCount.toString()}
            label="High Severity"
            subtext="Critical incidents"
            gradient="from-red-500 to-orange-500"
            valueColor="text-red-600"
          />

          <StatsCard
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            }
            value={college.commonBiasTypes?.length.toString() || '0'}
            label="Bias Types Detected"
            subtext="Unique categories"
            gradient="from-emerald-500 to-teal-500"
          />
        </motion.div>

        {/* Severity Distribution */}
        {analyses.length > 0 && (
          <motion.div {...fadeIn} transition={{ delay: 0.15 }} className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Severity Distribution</h3>
            <SeverityDistribution analyses={analyses} />
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bias Trend (30 Days)</h3>
            {computedData.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={computedData.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#7C3AED"
                    strokeWidth={2}
                    dot={{ fill: '#7C3AED', strokeWidth: 0, r: 4 }}
                    name="Avg Bias Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                    name="Reports"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No trend data available
              </div>
            )}
          </motion.div>

          {/* Bias Type Distribution */}
          <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bias Type Distribution</h3>
            <BiasDistributionPie analyses={analyses} />
            
            {/* Legend */}
            {computedData.biasTypeDistribution.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {computedData.biasTypeDistribution.map((item: { type: string; name: string; color: string }) => (
                  <span
                    key={item.type}
                    className="flex items-center gap-1 text-xs text-gray-600"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Department Breakdown */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Breakdown</h3>
          <DepartmentBreakdown analyses={analyses} />
        </motion.div>

        {/* Analyses Table */}
        <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Analyses</h3>
          <AnalysisTable
            analyses={analyses}
            loading={loading}
            showCollege={false}
            onViewAnalysis={handleViewAnalysis}
            pageSize={10}
          />
        </motion.div>
      </div>
    </div>
  );
}
