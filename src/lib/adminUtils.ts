/**
 * BiasBreaker Admin Utilities
 * Helper functions for admin dashboard data processing and aggregation
 */

import { format, subDays, startOfDay, isAfter, subMonths, differenceInDays } from 'date-fns';
import type { Analysis, College, BiasType } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface TrendDataPoint {
  date: string;
  avgScore: number;
  count: number;
  biasedCount: number;
  cleanCount: number;
}

export interface BiasTypeDistribution {
  type: BiasType;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CollegeRanking extends College {
  rank: number;
  recentActivity: number;
}

export interface PlatformInsight {
  type: 'warning' | 'info' | 'success';
  message: string;
  metric?: string;
}

/** Date range filter values for dashboard filtering */
export type DateRangeFilter = '7d' | '30d' | '90d' | '1y' | 'all';

/** Map of date range values to number of days */
const DATE_RANGE_DAYS: Record<DateRangeFilter, number | null> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
  'all': null,
};

// ============================================================================
// Constants
// ============================================================================

export const BIAS_TYPE_CONFIG: Record<BiasType, { label: string; color: string; bgColor: string }> = {
  gender_bias: { label: 'Gender Bias', color: '#EC4899', bgColor: 'bg-pink-100' },
  department_discrimination: { label: 'Dept. Discrimination', color: '#3B82F6', bgColor: 'bg-blue-100' },
  socioeconomic_bias: { label: 'Socioeconomic Bias', color: '#F59E0B', bgColor: 'bg-orange-100' },
  academic_elitism: { label: 'Academic Elitism', color: '#7C3AED', bgColor: 'bg-purple-100' },
  community_patterns: { label: 'Community Patterns', color: '#10B981', bgColor: 'bg-green-100' },
};

// ============================================================================
// Date Filtering Functions
// ============================================================================

/**
 * Filters analyses by date range
 */
export function filterByDateRange(analyses: Analysis[], dateRange: DateRangeFilter): Analysis[] {
  const days = DATE_RANGE_DAYS[dateRange];
  if (days === null) return analyses;

  const cutoffDate = startOfDay(subDays(new Date(), days));
  return analyses.filter((analysis) => isAfter(analysis.timestamp, cutoffDate));
}

/**
 * Filters colleges by activity status
 */
export function filterCollegesByActivity(
  colleges: College[],
  analyses: Analysis[],
  filter: 'all' | 'active' | 'inactive'
): College[] {
  if (filter === 'all') return colleges;

  const weekAgo = subDays(new Date(), 7);
  const monthAgo = subDays(new Date(), 30);

  const collegeActivity = new Map<string, Date>();
  analyses.forEach((a) => {
    const existing = collegeActivity.get(a.collegeId);
    if (!existing || a.timestamp > existing) {
      collegeActivity.set(a.collegeId, a.timestamp);
    }
  });

  return colleges.filter((college) => {
    const lastActivity = collegeActivity.get(college.id);
    if (!lastActivity) return filter === 'inactive';

    const isActive = lastActivity > (filter === 'active' ? weekAgo : monthAgo);
    return filter === 'active' ? isActive : !isActive;
  });
}

// ============================================================================
// Trend Calculation Functions
// ============================================================================

/**
 * Calculates trend data over a period
 * @param analyses - Array of analyses
 * @param daysOrRange - Number of days or a DateRangeFilter
 */
export function calculateTrends(analyses: Analysis[], daysOrRange: number | DateRangeFilter = 30): TrendDataPoint[] {
  // Convert DateRangeFilter to number of days
  const days = typeof daysOrRange === 'string' ? (DATE_RANGE_DAYS[daysOrRange] || 30) : daysOrRange;
  
  const trends: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = startOfDay(subDays(now, i));
    const nextDate = startOfDay(subDays(now, i - 1));

    const dayAnalyses = analyses.filter(
      (a) => a.timestamp >= date && a.timestamp < nextDate
    );

    const avgScore =
      dayAnalyses.length > 0
        ? dayAnalyses.reduce((sum, a) => sum + a.biasScore, 0) / dayAnalyses.length
        : 0;

    const biasedCount = dayAnalyses.filter((a) => a.biasScore >= 0.3).length;
    const cleanCount = dayAnalyses.filter((a) => a.biasScore < 0.3).length;

    trends.push({
      date: format(date, 'MMM dd'),
      avgScore: Math.round(avgScore * 100) / 100,
      count: dayAnalyses.length,
      biasedCount,
      cleanCount,
    });
  }

  return trends;
}

/**
 * Gets weekly aggregated trends
 */
export function getWeeklyTrends(analyses: Analysis[], weeks: number = 8): TrendDataPoint[] {
  const trends: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfDay(subDays(now, (i + 1) * 7));
    const weekEnd = startOfDay(subDays(now, i * 7));

    const weekAnalyses = analyses.filter(
      (a) => a.timestamp >= weekStart && a.timestamp < weekEnd
    );

    const avgScore =
      weekAnalyses.length > 0
        ? weekAnalyses.reduce((sum, a) => sum + a.biasScore, 0) / weekAnalyses.length
        : 0;

    trends.push({
      date: format(weekStart, 'MMM dd'),
      avgScore: Math.round(avgScore * 100) / 100,
      count: weekAnalyses.length,
      biasedCount: weekAnalyses.filter((a) => a.biasScore >= 0.3).length,
      cleanCount: weekAnalyses.filter((a) => a.biasScore < 0.3).length,
    });
  }

  return trends;
}

/**
 * Gets monthly aggregated trends
 */
export function calculateMonthlyTrends(analyses: Analysis[], months: number = 6): TrendDataPoint[] {
  const trends: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = subMonths(startOfDay(now), i + 1);
    const monthEnd = subMonths(startOfDay(now), i);

    const monthAnalyses = analyses.filter(
      (a) => a.timestamp >= monthStart && a.timestamp < monthEnd
    );

    const avgScore =
      monthAnalyses.length > 0
        ? monthAnalyses.reduce((sum, a) => sum + a.biasScore, 0) / monthAnalyses.length
        : 0;

    trends.push({
      date: format(monthStart, 'MMM yyyy'),
      avgScore: Math.round(avgScore * 100) / 100,
      count: monthAnalyses.length,
      biasedCount: monthAnalyses.filter((a) => a.biasScore >= 0.3).length,
      cleanCount: monthAnalyses.filter((a) => a.biasScore < 0.3).length,
    });
  }

  return trends;
}

// ============================================================================
// Bias Distribution Functions
// ============================================================================

/**
 * Gets bias type distribution across analyses
 */
export function getBiasTypeDistribution(analyses: Analysis[]): BiasTypeDistribution[] {
  const counts: Record<string, number> = {};

  analyses.forEach((analysis) => {
    if (analysis.biasTypes) {
      analysis.biasTypes.forEach((bias: BiasType) => {
        counts[bias] = (counts[bias] || 0) + 1;
      });
    }
  });

  const total = Object.values(counts).reduce((sum: number, count: number) => sum + count, 0);

  return Object.entries(counts)
    .map(([type, count]) => ({
      type: type as BiasType,
      name: BIAS_TYPE_CONFIG[type as BiasType]?.label || type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: BIAS_TYPE_CONFIG[type as BiasType]?.color || '#6B7280',
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculates severity breakdown - returns percentages as numbers
 */
export function getSeverityBreakdown(analyses: Analysis[]): {
  low: number;
  medium: number;
  high: number;
} {
  const counts = { low: 0, medium: 0, high: 0 };
  analyses.forEach((analysis) => {
    counts[analysis.severity]++;
  });

  const total = analyses.length;

  return {
    low: total > 0 ? Math.round((counts.low / total) * 100) : 0,
    medium: total > 0 ? Math.round((counts.medium / total) * 100) : 0,
    high: total > 0 ? Math.round((counts.high / total) * 100) : 0,
  };
}

// ============================================================================
// College Ranking Functions
// ============================================================================

/**
 * Gets top colleges by total reports
 */
export function getTopColleges(colleges: College[], limit: number = 10): College[] {
  return [...colleges]
    .sort((a, b) => (b.totalReports || 0) - (a.totalReports || 0))
    .slice(0, limit);
}

/**
 * Sorts colleges by various criteria
 */
export function sortColleges(
  colleges: College[],
  sortBy: 'biasScore' | 'activity' | 'name' | 'reports',
  direction: 'asc' | 'desc' = 'desc'
): College[] {
  const sorted = [...colleges].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'biasScore':
        comparison = (a.averageBiasScore || 0) - (b.averageBiasScore || 0);
        break;
      case 'activity':
        const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
        const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
        comparison = aTime - bTime;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'reports':
        comparison = (a.totalReports || 0) - (b.totalReports || 0);
        break;
    }

    return direction === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Gets colleges with rankings
 */
export function getCollegeRankings(
  colleges: College[],
  analyses: Analysis[]
): CollegeRanking[] {
  const weekAgo = subDays(new Date(), 7);

  const collegeAnalyses = new Map<string, number>();
  analyses.forEach((a) => {
    if (a.timestamp >= weekAgo) {
      collegeAnalyses.set(a.collegeId, (collegeAnalyses.get(a.collegeId) || 0) + 1);
    }
  });

  return colleges
    .map((college, index) => ({
      ...college,
      rank: index + 1,
      recentActivity: collegeAnalyses.get(college.id) || 0,
    }))
    .sort((a, b) => (b.totalReports || 0) - (a.totalReports || 0))
    .map((college, index) => ({
      ...college,
      rank: index + 1,
    }));
}

// ============================================================================
// Platform Statistics Functions
// ============================================================================

/**
 * Calculates comprehensive platform statistics
 */
export function calculatePlatformStats(
  analyses: Analysis[],
  colleges: College[]
): {
  totalAnalyses: number;
  averageBiasScore: number;
  criticalIncidents: number;
  activeColleges: number;
  analysesToday: number;
  analysesThisWeek: number;
  analysesThisMonth: number;
  mostActiveCollege: { name: string; count: number } | null;
  biasReductionRate: number;
  monthlyGrowth: number;
} {
  const now = new Date();
  const today = startOfDay(now);
  const weekAgo = subDays(now, 7);
  const monthAgo = subMonths(now, 1);
  const twoMonthsAgo = subMonths(now, 2);

  // Time-based counts
  const analysesToday = analyses.filter((a) => a.timestamp >= today).length;
  const analysesThisWeek = analyses.filter((a) => a.timestamp >= weekAgo).length;
  const analysesThisMonth = analyses.filter((a) => a.timestamp >= monthAgo).length;
  const lastMonthAnalyses = analyses.filter(
    (a) => a.timestamp >= twoMonthsAgo && a.timestamp < monthAgo
  ).length;

  // Critical incidents (high severity)
  const criticalIncidents = analyses.filter((a) => a.severity === 'high').length;

  // Average bias score
  const averageBiasScore =
    analyses.length > 0
      ? analyses.reduce((sum, a) => sum + a.biasScore, 0) / analyses.length
      : 0;

  // Active colleges (activity in last 30 days)
  const activeCollegeIds = new Set(
    analyses.filter((a) => a.timestamp >= monthAgo).map((a) => a.collegeId)
  );
  const activeColleges = activeCollegeIds.size;

  // Most active college
  const collegeCounts = new Map<string, number>();
  analyses.forEach((a) => {
    collegeCounts.set(a.collegeId, (collegeCounts.get(a.collegeId) || 0) + 1);
  });

  let mostActiveCollege: { name: string; count: number } | null = null;
  let maxCount = 0;
  collegeCounts.forEach((count, collegeId) => {
    if (count > maxCount) {
      maxCount = count;
      const college = colleges.find((c) => c.id === collegeId);
      if (college) {
        mostActiveCollege = { name: college.name, count };
      }
    }
  });

  // Bias reduction rate (comparing this month to last month averages)
  const thisMonthAnalyses = analyses.filter((a) => a.timestamp >= monthAgo);
  const lastMonthAnalysesData = analyses.filter(
    (a) => a.timestamp >= twoMonthsAgo && a.timestamp < monthAgo
  );

  const thisMonthAvg =
    thisMonthAnalyses.length > 0
      ? thisMonthAnalyses.reduce((sum, a) => sum + a.biasScore, 0) / thisMonthAnalyses.length
      : 0;

  const lastMonthAvg =
    lastMonthAnalysesData.length > 0
      ? lastMonthAnalysesData.reduce((sum, a) => sum + a.biasScore, 0) / lastMonthAnalysesData.length
      : 0;

  const biasReductionRate =
    lastMonthAvg > 0
      ? Math.round(((lastMonthAvg - thisMonthAvg) / lastMonthAvg) * 100)
      : 0;

  // Monthly growth
  const monthlyGrowth =
    lastMonthAnalyses > 0
      ? Math.round(((analysesThisMonth - lastMonthAnalyses) / lastMonthAnalyses) * 100)
      : analysesThisMonth > 0
        ? 100
        : 0;

  return {
    totalAnalyses: analyses.length,
    averageBiasScore: Math.round(averageBiasScore * 100) / 100,
    criticalIncidents,
    activeColleges,
    analysesToday,
    analysesThisWeek,
    analysesThisMonth,
    mostActiveCollege,
    biasReductionRate,
    monthlyGrowth,
  };
}

// ============================================================================
// Insights Generation
// ============================================================================

/**
 * Generates platform insights as string array
 */
export function generatePlatformInsights(
  analyses: Analysis[],
  colleges: College[],
  _globalStats?: unknown
): string[] {
  const insights: string[] = [];
  const stats = calculatePlatformStats(analyses, colleges);

  // Critical incidents insight
  if (stats.criticalIncidents > 0) {
    const criticalPercentage = Math.round((stats.criticalIncidents / stats.totalAnalyses) * 100);
    insights.push(
      `${stats.criticalIncidents} critical incidents detected (${criticalPercentage}% of total). Review recommended.`
    );
  }

  // Bias reduction insight
  if (stats.biasReductionRate > 5) {
    insights.push(
      `Platform-wide bias has decreased by ${stats.biasReductionRate}% compared to last month. Great progress!`
    );
  } else if (stats.biasReductionRate < -5) {
    insights.push(
      `Platform-wide bias has increased by ${Math.abs(stats.biasReductionRate)}% - attention needed.`
    );
  }

  // Monthly growth insight
  if (stats.monthlyGrowth > 20) {
    insights.push(
      `Report submissions grew by ${stats.monthlyGrowth}% this month - strong engagement.`
    );
  }

  // Activity insight
  if (stats.mostActiveCollege) {
    insights.push(
      `${stats.mostActiveCollege.name} is the most active with ${stats.mostActiveCollege.count} submissions.`
    );
  }

  // Low activity warning
  if (stats.activeColleges < colleges.length * 0.5 && colleges.length > 0) {
    insights.push(
      `Only ${stats.activeColleges} of ${colleges.length} colleges active in the last 30 days. Consider outreach.`
    );
  }

  // Gender bias dominance
  const biasDistribution = getBiasTypeDistribution(analyses);
  if (biasDistribution.length > 0 && biasDistribution[0].percentage > 40) {
    insights.push(
      `${biasDistribution[0].name} accounts for ${biasDistribution[0].percentage}% of all detected biases.`
    );
  }

  return insights.slice(0, 5);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Anonymizes email for display
 */
export function anonymizeEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;

  const visibleChars = Math.min(3, local.length);
  const masked = local.slice(0, visibleChars) + '***';
  return `${masked}@${domain}`;
}

/**
 * Formats large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Gets color class based on bias score
 */
export function getScoreColor(score: number): string {
  if (score >= 0.7) return 'text-red-600';
  if (score >= 0.4) return 'text-orange-500';
  if (score >= 0.2) return 'text-yellow-600';
  return 'text-green-600';
}

/**
 * Gets background color based on bias score
 */
export function getScoreBgColor(score: number): string {
  if (score >= 0.7) return 'bg-red-100';
  if (score >= 0.4) return 'bg-orange-100';
  if (score >= 0.2) return 'bg-yellow-100';
  return 'bg-green-100';
}

/**
 * Gets progress bar color based on score
 */
export function getProgressBarColor(score: number): string {
  if (score >= 0.7) return 'bg-red-500';
  if (score >= 0.4) return 'bg-orange-500';
  if (score >= 0.2) return 'bg-yellow-500';
  return 'bg-green-500';
}

// ============================================================================
// CSV Export Functions
// ============================================================================

/**
 * Converts data to CSV format
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const headers = columns.map((col) => col.header).join(',');
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      })
      .join(',')
  );

  return [headers, ...rows].join('\n');
}

/**
 * Downloads content as CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Exports colleges data to CSV
 */
export function exportCollegesToCSV(colleges: College[]): void {
  const data = colleges.map(c => ({
    name: c.name,
    averageBiasScore: c.averageBiasScore,
    totalReports: c.totalReports,
    highSeverityCount: c.highSeverityCount,
    lastActivity: c.lastActivity ? format(new Date(c.lastActivity), 'yyyy-MM-dd') : '',
  }));
  
  const csv = convertToCSV(data, [
    { key: 'name', header: 'College Name' },
    { key: 'averageBiasScore', header: 'Average Bias Score' },
    { key: 'totalReports', header: 'Total Reports' },
    { key: 'highSeverityCount', header: 'High Severity Count' },
    { key: 'lastActivity', header: 'Last Activity' },
  ]);
  downloadCSV(csv, `colleges-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
}

/**
 * Exports analyses data to CSV
 */
export function exportAnalysesToCSV(analyses: Analysis[]): void {
  const data = analyses.map((a) => ({
    id: a.id,
    collegeName: a.collegeName,
    timestamp: format(a.timestamp, 'yyyy-MM-dd HH:mm'),
    biasScore: a.biasScore,
    severity: a.severity,
    biasTypes: a.biasTypes?.join('; ') || '',
  }));

  const csv = convertToCSV(data, [
    { key: 'id', header: 'Analysis ID' },
    { key: 'collegeName', header: 'College' },
    { key: 'timestamp', header: 'Date' },
    { key: 'biasScore', header: 'Bias Score' },
    { key: 'severity', header: 'Severity' },
    { key: 'biasTypes', header: 'Bias Types' },
  ]);
  downloadCSV(csv, `analyses-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
}

// ============================================================================
// Activity Timeline Functions
// ============================================================================

/**
 * Gets recent activity for activity feed
 */
export function getRecentActivity(
  analyses: Analysis[],
  limit: number = 10
): Analysis[] {
  return [...analyses]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

/**
 * Groups analyses by time period
 */
export function groupAnalysesByPeriod(
  analyses: Analysis[],
  period: 'hour' | 'day' | 'week' | 'month'
): Map<string, Analysis[]> {
  const groups = new Map<string, Analysis[]>();

  const formatString =
    period === 'hour'
      ? 'yyyy-MM-dd HH:00'
      : period === 'day'
        ? 'yyyy-MM-dd'
        : period === 'week'
          ? "yyyy-'W'ww"
          : 'yyyy-MM';

  analyses.forEach((analysis) => {
    const key = format(analysis.timestamp, formatString);
    const existing = groups.get(key) || [];
    groups.set(key, [...existing, analysis]);
  });

  return groups;
}

/**
 * Gets department breakdown for a college
 */
export function getDepartmentBreakdown(
  analyses: Analysis[]
): { department: string; count: number; avgScore: number }[] {
  const deptMap = new Map<string, { count: number; totalScore: number }>();

  analyses.forEach((a) => {
    const dept = a.department || 'Unknown';
    const existing = deptMap.get(dept) || { count: 0, totalScore: 0 };
    deptMap.set(dept, {
      count: existing.count + 1,
      totalScore: existing.totalScore + a.biasScore,
    });
  });

  return Array.from(deptMap.entries())
    .map(([department, data]) => ({
      department,
      count: data.count,
      avgScore: Math.round((data.totalScore / data.count) * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count);
}
