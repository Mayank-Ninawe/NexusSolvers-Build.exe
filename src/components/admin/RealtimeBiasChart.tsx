/**
 * BiasBreaker Real-Time Bias Chart Component
 * Live updating line chart showing bias trends over the last 24 hours
 * 
 * Features:
 * - Hourly bias score aggregation
 * - Real-time updates when new analyses arrive
 * - Animated data transitions
 * - Color-coded data points by severity
 * - Hover tooltips with analysis details
 */

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
  ComposedChart,
} from 'recharts';
import { format, subHours, startOfHour, isWithinInterval } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeAnalyses } from '@/hooks/useRealtimeAnalyses';
import type { Analysis } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface RealtimeBiasChartProps {
  /** College ID to filter by (optional) */
  collegeId?: string;
  /** Chart height in pixels */
  height?: number;
  /** Show new analysis dots */
  showDots?: boolean;
  /** Custom class name */
  className?: string;
}

interface HourlyDataPoint {
  hour: string;
  timestamp: Date;
  avgScore: number;
  count: number;
  analyses: Analysis[];
  isCurrentHour: boolean;
}

interface NewAnalysisDot {
  id: string;
  hour: string;
  score: number;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

// ============================================================================
// Constants
// ============================================================================

const HOURS_TO_SHOW = 24;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get color based on bias score
 */
function getScoreColor(score: number): string {
  if (score >= 70) return '#EF4444'; // red-500
  if (score >= 40) return '#F97316'; // orange-500
  if (score >= 20) return '#EAB308'; // yellow-500
  return '#22C55E'; // green-500
}

/**
 * Get severity dot color
 */
function getSeverityDotColor(severity: 'low' | 'medium' | 'high'): string {
  switch (severity) {
    case 'high': return '#EF4444';
    case 'medium': return '#F97316';
    default: return '#22C55E';
  }
}

/**
 * Aggregate analyses into hourly data points
 */
function aggregateByHour(analyses: Analysis[]): HourlyDataPoint[] {
  const now = new Date();
  const currentHour = startOfHour(now);
  const hourlyData: HourlyDataPoint[] = [];

  // Generate all hours for the last 24 hours
  for (let i = HOURS_TO_SHOW - 1; i >= 0; i--) {
    const hourStart = startOfHour(subHours(now, i));
    const hourEnd = subHours(hourStart, -1);
    const isCurrentHour = hourStart.getTime() === currentHour.getTime();

    // Filter analyses for this hour
    const hourAnalyses = analyses.filter((a) =>
      isWithinInterval(a.timestamp, { start: hourStart, end: hourEnd })
    );

    // Calculate average score
    const avgScore =
      hourAnalyses.length > 0
        ? hourAnalyses.reduce((sum, a) => sum + a.biasScore, 0) / hourAnalyses.length
        : 0;

    hourlyData.push({
      hour: format(hourStart, 'HH:mm'),
      timestamp: hourStart,
      avgScore: Math.round(avgScore * 10) / 10,
      count: hourAnalyses.length,
      analyses: hourAnalyses,
      isCurrentHour,
    });
  }

  return hourlyData;
}

// ============================================================================
// Custom Tooltip Component
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: HourlyDataPoint }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-100 p-3 min-w-[180px]">
      <p className="text-sm font-semibold text-gray-900 mb-1">
        {format(data.timestamp, 'MMM d, h:mm a')}
      </p>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Avg Bias Score:</span>
          <span 
            className="text-sm font-bold"
            style={{ color: getScoreColor(data.avgScore) }}
          >
            {data.avgScore}%
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Analyses:</span>
          <span className="text-sm font-medium text-gray-900">
            {data.count}
          </span>
        </div>
      </div>

      {data.count > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {data.analyses.slice(0, 2).map((a) => a.collegeName).join(', ')}
            {data.analyses.length > 2 && ` +${data.analyses.length - 2} more`}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Live Indicator Component
// ============================================================================

function LiveIndicator({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span 
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`}
      />
      <span className={`text-xs font-medium ${
        isConnected ? 'text-green-600' : 'text-gray-500'
      }`}>
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}

// ============================================================================
// New Analysis Flash Component
// ============================================================================

function NewAnalysisFlash({ analysis }: { analysis: Analysis | null }) {
  if (!analysis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute top-2 right-2 z-10"
    >
      <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
        New: {analysis.collegeName}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Loading State
// ============================================================================

function ChartSkeleton({ height }: { height: number }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="h-full bg-gray-100 rounded-lg flex items-end p-4 gap-2">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded-t"
            style={{ height: `${20 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function RealtimeBiasChart({
  collegeId,
  height = 300,
  showDots = true,
  className = '',
}: RealtimeBiasChartProps) {
  const [latestAnalysis, setLatestAnalysis] = useState<Analysis | null>(null);
  const [newDots, setNewDots] = useState<NewAnalysisDot[]>([]);

  // Get real-time analyses
  const { analyses, loading, isConnected } = useRealtimeAnalyses({
    collegeId,
    limit: 500, // Need more for 24h aggregation
    realtime: true,
    onNewAnalysis: (analysis) => {
      // Flash notification
      setLatestAnalysis(analysis);
      setTimeout(() => setLatestAnalysis(null), 3000);

      // Add dot for new analysis
      if (showDots) {
        const dot: NewAnalysisDot = {
          id: analysis.id,
          hour: format(startOfHour(analysis.timestamp), 'HH:mm'),
          score: analysis.biasScore,
          severity: analysis.severity,
          timestamp: analysis.timestamp,
        };
        setNewDots((prev) => [...prev.slice(-10), dot]);

        // Remove dot after animation
        setTimeout(() => {
          setNewDots((prev) => prev.filter((d) => d.id !== analysis.id));
        }, 5000);
      }
    },
  });

  // Aggregate data by hour
  const chartData = useMemo(() => aggregateByHour(analyses), [analyses]);

  // Calculate trend line values
  const { avgLine, maxScore } = useMemo(() => {
    const scores = chartData.filter((d) => d.count > 0).map((d) => d.avgScore);
    const avg = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
    const max = Math.max(...scores, 50);
    return { avgLine: Math.round(avg), maxScore: Math.ceil(max / 10) * 10 };
  }, [chartData]);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Bias Trends (24h)</h3>
          <LiveIndicator isConnected={false} />
        </div>
        <ChartSkeleton height={height} />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 relative ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Bias Trends (24h)</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Average bias score per hour
          </p>
        </div>
        <LiveIndicator isConnected={isConnected} />
      </div>

      {/* New Analysis Flash */}
      <AnimatePresence>
        <NewAnalysisFlash analysis={latestAnalysis} />
      </AnimatePresence>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="biasGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />

          <XAxis
            dataKey="hour"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            interval="preserveStartEnd"
          />

          <YAxis
            domain={[0, maxScore]}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Average reference line */}
          <ReferenceLine
            y={avgLine}
            stroke="#9CA3AF"
            strokeDasharray="4 4"
            label={{
              value: `Avg: ${avgLine}%`,
              position: 'right',
              fill: '#6B7280',
              fontSize: 10,
            }}
          />

          {/* Main line */}
          <Line
            type="monotone"
            dataKey="avgScore"
            stroke="#7C3AED"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 6,
              fill: '#7C3AED',
              stroke: '#fff',
              strokeWidth: 2,
            }}
            animationDuration={500}
            animationEasing="ease-out"
          />

          {/* Individual analysis dots */}
          {showDots && newDots.length > 0 && (
            <Scatter
              data={newDots.map((d) => ({
                hour: d.hour,
                avgScore: d.score,
                fill: getSeverityDotColor(d.severity),
              }))}
              dataKey="avgScore"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500">Low (&lt;20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-xs text-gray-500">Medium (20-40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-xs text-gray-500">High (40-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-500">Critical (&gt;70%)</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Mini Chart Variant (for cards)
// ============================================================================

interface MiniChartProps {
  collegeId?: string;
  height?: number;
}

export function MiniRealtimeBiasChart({ collegeId, height = 80 }: MiniChartProps) {
  const { analyses, loading } = useRealtimeAnalyses({
    collegeId,
    limit: 100,
    realtime: true,
  });

  const chartData = useMemo(() => aggregateByHour(analyses).slice(-12), [analyses]);

  if (loading) {
    return <div className="h-20 bg-gray-100 animate-pulse rounded" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <defs>
          <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Line
          type="monotone"
          dataKey="avgScore"
          stroke="#7C3AED"
          strokeWidth={2}
          dot={false}
          fill="url(#miniGradient)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default RealtimeBiasChart;
