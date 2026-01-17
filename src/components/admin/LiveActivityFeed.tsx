/**
 * BiasBreaker Live Activity Feed Component
 * Real-time activity feed with animations for admin dashboard
 * 
 * Features:
 * - Real-time updates via useRealtimeAnalyses hook
 * - Smooth animations for new items (Framer Motion)
 * - Auto-scroll behavior with "New Activity" badge
 * - Color-coded severity indicators
 * - Relative timestamps
 * - Loading and empty states
 */

'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeAnalyses } from '@/hooks/useRealtimeAnalyses';
import { limitArraySize } from '@/lib/realtimeOptimization';
import type { Analysis } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface LiveActivityFeedProps {
  /** Maximum number of items to display */
  maxItems?: number;
  /** Show filter options */
  showFilters?: boolean;
  /** Compact mode with minimal info */
  compact?: boolean;
  /** Filter by college ID */
  collegeId?: string;
  /** Custom class name */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const HIGHLIGHT_DURATION = 2000; // 2 seconds

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get color based on severity
 */
function getSeverityColor(severity: 'low' | 'medium' | 'high'): {
  text: string;
  bg: string;
  icon: string;
} {
  switch (severity) {
    case 'high':
      return { text: 'text-red-600', bg: 'bg-red-100', icon: '⚠' };
    case 'medium':
      return { text: 'text-orange-500', bg: 'bg-orange-100', icon: '⚠' };
    case 'low':
    default:
      return { text: 'text-green-600', bg: 'bg-green-100', icon: '✓' };
  }
}

/**
 * Get score badge color
 */
function getScoreBadgeColor(score: number): string {
  if (score >= 70) return 'bg-red-500 text-white';
  if (score >= 40) return 'bg-orange-500 text-white';
  if (score >= 20) return 'bg-yellow-500 text-gray-900';
  return 'bg-green-500 text-white';
}

/**
 * Truncate text to specified length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Get college initial color based on name
 */
function getCollegeColor(name: string): string {
  const colors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

// ============================================================================
// Skeleton Loader Component
// ============================================================================

function ActivityItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-10 h-10 rounded-full bg-gray-200" />
      
      {/* Content skeleton */}
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-48" />
      </div>
      
      {/* Badge skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-5 w-12 bg-gray-200 rounded-full" />
        <div className="w-5 h-5 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="divide-y divide-gray-100">
      {[1, 2, 3, 4].map((i) => (
        <ActivityItemSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Activity Icon */}
      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      
      <h3 className="text-gray-900 font-medium mb-1">No recent activity</h3>
      <p className="text-gray-500 text-sm max-w-xs">
        New analyses will appear here in real-time as students submit them.
      </p>
    </div>
  );
}

// ============================================================================
// Activity Item Component
// ============================================================================

interface ActivityItemProps {
  analysis: Analysis;
  isNew: boolean;
  compact: boolean;
  onClick: () => void;
}

const ActivityItem = React.memo(function ActivityItem({
  analysis,
  isNew,
  compact,
  onClick,
}: ActivityItemProps) {
  const [highlighted, setHighlighted] = useState(isNew);
  const severity = getSeverityColor(analysis.severity);
  const scoreColor = getScoreBadgeColor(analysis.biasScore);
  const avatarColor = getCollegeColor(analysis.collegeName);
  const initial = analysis.collegeName?.charAt(0).toUpperCase() || '?';

  // Remove highlight after duration
  useEffect(() => {
    if (isNew) {
      setHighlighted(true);
      const timer = setTimeout(() => setHighlighted(false), HIGHLIGHT_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  // Format relative time
  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(analysis.timestamp, { addSuffix: false });
    } catch {
      return 'Unknown';
    }
  }, [analysis.timestamp]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-center gap-3 p-3 cursor-pointer
        hover:bg-gray-50 transition-colors
        ${highlighted ? 'bg-purple-50' : 'bg-white'}
      `}
      onClick={onClick}
    >
      {/* College Avatar */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full ${avatarColor}
        flex items-center justify-center text-white font-semibold text-sm
      `}>
        {initial}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">
          {analysis.collegeName}
        </p>
        {!compact && (
          <p className="text-gray-500 text-xs truncate mt-0.5">
            {truncate(analysis.title || 'Untitled Analysis', 40)}
          </p>
        )}
        <p className="text-gray-400 text-xs mt-0.5">
          {timeAgo === '0 seconds' ? 'Just now' : `${timeAgo} ago`}
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Bias Score */}
        <span className={`
          px-2 py-0.5 rounded-full text-xs font-semibold ${scoreColor}
        `}>
          {Math.round(analysis.biasScore)}%
        </span>

        {/* Severity Icon */}
        <span className={`
          w-6 h-6 rounded-full flex items-center justify-center text-xs
          ${severity.bg} ${severity.text}
        `}>
          {severity.icon}
        </span>
      </div>
    </motion.div>
  );
});

// ============================================================================
// New Activity Badge Component
// ============================================================================

interface NewActivityBadgeProps {
  count: number;
  onClick: () => void;
}

function NewActivityBadge({ count, onClick }: NewActivityBadgeProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="
        absolute top-2 left-1/2 -translate-x-1/2 z-10
        px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-full
        shadow-lg hover:bg-purple-700 transition-colors
        flex items-center gap-1.5
      "
      onClick={onClick}
    >
      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
      {count} New {count === 1 ? 'Activity' : 'Activities'} ↑
    </motion.button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function LiveActivityFeed({
  maxItems = 15,
  showFilters = false,
  compact = false,
  collegeId,
  className = '',
}: LiveActivityFeedProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [hiddenNewCount, setHiddenNewCount] = useState(0);
  const previousAnalysesRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Get real-time analyses
  const {
    analyses: rawAnalyses,
    loading,
    isConnected,
    newAnalysesCount,
    resetNewCount,
  } = useRealtimeAnalyses({
    collegeId,
    limit: maxItems + 10, // Fetch extra for buffer
    realtime: true,
    onNewAnalysis: (analysis) => {
      // Track new items for highlighting
      if (!isFirstLoadRef.current) {
        setNewIds((prev) => new Set(prev).add(analysis.id));

        // Track hidden new count if user scrolled down
        if (!isAtTop) {
          setHiddenNewCount((prev) => prev + 1);
        }

        // Remove highlight after duration
        setTimeout(() => {
          setNewIds((prev) => {
            const next = new Set(prev);
            next.delete(analysis.id);
            return next;
          });
        }, HIGHLIGHT_DURATION);
      }
    },
  });

  // Limit displayed analyses
  const analyses = useMemo(
    () => limitArraySize(rawAnalyses, maxItems),
    [rawAnalyses, maxItems]
  );

  // Track first load completion
  useEffect(() => {
    if (!loading && analyses.length > 0) {
      isFirstLoadRef.current = false;
      analyses.forEach((a) => previousAnalysesRef.current.add(a.id));
    }
  }, [loading, analyses]);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop } = containerRef.current;
      setIsAtTop(scrollTop < 10);
    }
  }, []);

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      setHiddenNewCount(0);
      resetNewCount();
    }
  }, [resetNewCount]);

  // Auto-scroll when at top and new item arrives
  useEffect(() => {
    if (isAtTop && newAnalysesCount > 0 && containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isAtTop, newAnalysesCount]);

  // Navigate to analysis details
  const handleItemClick = useCallback((analysisId: string) => {
    router.push(`/student/analysis/${analysisId}`);
  }, [router]);

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Live Activity</h3>
          {isConnected && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          )}
        </div>

        {showFilters && (
          <select className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white">
            <option value="all">All Colleges</option>
            <option value="high">High Severity</option>
            <option value="recent">Last Hour</option>
          </select>
        )}
      </div>

      {/* Activity List */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative max-h-[400px] overflow-y-auto"
      >
        {/* New Activity Badge */}
        <AnimatePresence>
          {!isAtTop && hiddenNewCount > 0 && (
            <NewActivityBadge count={hiddenNewCount} onClick={scrollToTop} />
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && <LoadingState />}

        {/* Empty State */}
        {!loading && analyses.length === 0 && <EmptyState />}

        {/* Activity Items */}
        {!loading && analyses.length > 0 && (
          <div className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {analyses.map((analysis) => (
                <ActivityItem
                  key={analysis.id}
                  analysis={analysis}
                  isNew={newIds.has(analysis.id)}
                  compact={compact}
                  onClick={() => handleItemClick(analysis.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && analyses.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Showing {analyses.length} most recent • Updates in real-time
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Compact Activity Feed (for sidebar)
// ============================================================================

export function CompactActivityFeed({ maxItems = 5 }: { maxItems?: number }) {
  return (
    <LiveActivityFeed
      maxItems={maxItems}
      compact
      showFilters={false}
      className="shadow-md"
    />
  );
}

export default LiveActivityFeed;
