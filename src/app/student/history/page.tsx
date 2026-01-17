'use client';

/**
 * BiasBreaker Analysis History Page
 * Full history of user's analyses with filtering, sorting, and pagination
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { getUserAnalyses, deleteAnalysis } from '@/lib/firestore';
import { exportAnalysisPDF, exportAnalysesSummaryPDF } from '@/lib/exportUtils';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import toast from 'react-hot-toast';
import type { Analysis, BiasType, BiasSeverity } from '@/types';

// ============================================================================
// Types
// ============================================================================

type SortOption = 'newest' | 'oldest' | 'highest-bias' | 'lowest-bias';
type DateRangeOption = 'all' | '7days' | '30days' | '90days';

interface FilterState {
  search: string;
  dateRange: DateRangeOption;
  severity: BiasSeverity | 'all';
  sortBy: SortOption;
}

// ============================================================================
// Constants
// ============================================================================

const ITEMS_PER_PAGE = 10;

const BIAS_TYPE_COLORS: Record<BiasType, { bg: string; text: string; label: string }> = {
  gender_bias: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Gender Bias' },
  department_discrimination: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dept. Discrimination' },
  socioeconomic_bias: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Socioeconomic' },
  academic_elitism: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Academic Elitism' },
  community_patterns: { bg: 'bg-green-100', text: 'text-green-700', label: 'Community' },
};

const SEVERITY_COLORS = {
  low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-l-green-500', icon: '✓' },
  medium: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-l-orange-500', icon: '!' },
  high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-l-red-500', icon: '⚠' },
};

const DATE_RANGE_OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'highest-bias', label: 'Highest Bias' },
  { value: 'lowest-bias', label: 'Lowest Bias' },
];

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Filter Bar Component
 */
function FilterBar({
  filters,
  onFilterChange,
  totalCount,
  filteredCount,
  onReset,
}: {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}) {
  const hasFilters = filters.search !== '' || 
                     filters.dateRange !== 'all' || 
                     filters.severity !== 'all' ||
                     filters.sortBy !== 'newest';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 sticky top-0 z-10">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3">
          {/* Date Range */}
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange('dateRange', e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none cursor-pointer"
          >
            {DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={filters.severity}
            onChange={(e) => onFilterChange('severity', e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Reset Button */}
          {hasFilters && (
            <button
              onClick={onReset}
              className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-3 text-sm text-gray-600">
        Showing <span className="font-semibold">{filteredCount}</span> of{' '}
        <span className="font-semibold">{totalCount}</span> analyses
      </div>
    </div>
  );
}

/**
 * Circular Progress Ring Component
 */
function CircularProgress({ value, size = 80, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value < 30) return '#10B981'; // green
    if (value <= 70) return '#F59E0B'; // orange
    return '#EF4444'; // red
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color: getColor() }}>
          {value}%
        </span>
      </div>
    </div>
  );
}

/**
 * Analysis List Card Component
 */
function AnalysisListCard({
  analysis,
  onView,
  onDelete,
  isDeleting,
}: {
  analysis: Analysis;
  onView: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const severityStyle = SEVERITY_COLORS[analysis.severity];

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-l-4 ${severityStyle.border} p-6 hover:shadow-md transition-all duration-200`}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section - Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Timestamp */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className="text-xl font-bold text-gray-900 truncate">
              {analysis.title || 'Untitled Analysis'}
            </h3>
            <span className={`hidden lg:flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${severityStyle.bg} ${severityStyle.text}`}>
              {severityStyle.icon} {analysis.severity}
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-3">
            {format(analysis.timestamp, "EEEE, MMMM d, yyyy 'at' h:mm a")}
          </p>

          {/* Text Preview */}
          <p className="text-gray-600 mb-4 line-clamp-2">
            {analysis.text.slice(0, 150)}
            {analysis.text.length > 150 && '...'}
          </p>

          {/* Bias Types Pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {analysis.biasTypes.map((type) => {
              const style = BIAS_TYPE_COLORS[type];
              return (
                <span
                  key={type}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
                >
                  {style.label}
                </span>
              );
            })}
          </div>

          {/* Patterns Count */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {analysis.detectedPatterns.length} pattern{analysis.detectedPatterns.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Right Section - Score & Actions */}
        <div className="lg:w-48 flex lg:flex-col items-center justify-between lg:justify-start gap-4 lg:gap-6">
          {/* Mobile Severity Badge */}
          <span className={`lg:hidden px-3 py-1 rounded-full text-xs font-semibold capitalize ${severityStyle.bg} ${severityStyle.text}`}>
            {severityStyle.icon} {analysis.severity}
          </span>

          {/* Circular Progress */}
          <div className="flex flex-col items-center">
            <CircularProgress value={analysis.biasScore} />
            <span className="text-sm text-gray-500 mt-2">Bias Score</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onView}
          className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Full Analysis
        </button>

        <button
          onClick={() => {
            exportAnalysisPDF(analysis);
            toast.success('PDF downloaded successfully!');
          }}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>

        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {isDeleting ? (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
          Delete
        </button>
      </div>
    </div>
  );
}

/**
 * Delete Confirmation Modal
 */
function DeleteConfirmationModal({
  analysisTitle,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  analysisTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Warning Icon */}
        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Delete Analysis?
        </h3>
        <p className="text-gray-600 text-center mb-6">
          This action cannot be undone. Are you sure you want to delete{' '}
          <span className="font-semibold">&quot;{analysisTitle}&quot;</span>?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Pagination Component
 */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex gap-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-purple-600 text-white'
                : page === '...'
                ? 'text-gray-400 cursor-default'
                : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}

/**
 * Empty State - No Results After Filtering
 */
function NoResultsState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No analyses found</h3>
      <p className="text-gray-600 mb-6">No analyses match your current filters</p>
      <button
        onClick={onClearFilters}
        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
}

/**
 * Empty State - No Analyses Yet
 */
function EmptyState({ onStartAnalysis }: { onStartAnalysis: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-12 text-center">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No analyses yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Start analyzing placement communications to detect bias patterns
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

/**
 * Loading Skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border-l-4 border-l-gray-200 p-6 animate-pulse">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="h-6 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
              <div className="h-16 w-full bg-gray-100 rounded" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                <div className="h-6 w-24 bg-gray-100 rounded-full" />
              </div>
            </div>
            <div className="lg:w-48 flex justify-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main History Content Component
// ============================================================================

function HistoryContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Analysis | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    dateRange: (searchParams.get('dateRange') as DateRangeOption) || 'all',
    severity: (searchParams.get('severity') as BiasSeverity | 'all') || 'all',
    sortBy: (searchParams.get('sortBy') as SortOption) || 'newest',
  });

  // Fetch analyses on mount
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

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
    if (filters.severity !== 'all') params.set('severity', filters.severity);
    if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  // Filter and sort analyses
  const filteredAnalyses = useMemo(() => {
    let result = [...analyses];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((a) =>
        (a.title?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let daysAgo = 7;
      if (filters.dateRange === '30days') daysAgo = 30;
      if (filters.dateRange === '90days') daysAgo = 90;

      const cutoffDate = subDays(now, daysAgo);
      result = result.filter((a) => isAfter(a.timestamp, cutoffDate));
    }

    // Severity filter
    if (filters.severity !== 'all') {
      result = result.filter((a) => a.severity === filters.severity);
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime();
        case 'highest-bias':
          return b.biasScore - a.biasScore;
        case 'lowest-bias':
          return a.biasScore - b.biasScore;
        default:
          return 0;
      }
    });

    return result;
  }, [analyses, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredAnalyses.length / ITEMS_PER_PAGE);
  const paginatedAnalyses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAnalyses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAnalyses, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Handlers
  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      dateRange: 'all',
      severity: 'all',
      sortBy: 'newest',
    });
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteAnalysis(deleteTarget.id);
      setAnalyses((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      toast.success('Analysis deleted successfully');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete analysis:', err);
      toast.error('Failed to delete analysis. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/student/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
                <p className="text-gray-600 mt-1">View and manage all your bias analyses</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              {/* Export All Button */}
              {analyses.length > 0 && (
                <button
                  onClick={() => {
                    exportAnalysesSummaryPDF(filteredAnalyses, 'My Analysis History');
                    toast.success('Summary PDF downloaded!');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export All
                </button>
              )}
              {/* New Analysis Button */}
              <button
                onClick={() => router.push('/upload')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Analysis
              </button>
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

        {loading ? (
          <>
            {/* Filter Bar Skeleton */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 animate-pulse">
              <div className="flex gap-4">
                <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
                <div className="w-32 h-10 bg-gray-200 rounded-lg" />
                <div className="w-32 h-10 bg-gray-200 rounded-lg" />
                <div className="w-32 h-10 bg-gray-200 rounded-lg" />
              </div>
            </div>
            <LoadingSkeleton />
          </>
        ) : analyses.length === 0 ? (
          <EmptyState onStartAnalysis={() => router.push('/upload')} />
        ) : (
          <>
            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              totalCount={analyses.length}
              filteredCount={filteredAnalyses.length}
              onReset={handleResetFilters}
            />

            {/* Analysis List */}
            {filteredAnalyses.length === 0 ? (
              <NoResultsState onClearFilters={handleResetFilters} />
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedAnalyses.map((analysis) => (
                    <AnalysisListCard
                      key={analysis.id}
                      analysis={analysis}
                      onView={() => router.push(`/student/analysis/${analysis.id}`)}
                      onDelete={() => setDeleteTarget(analysis)}
                      isDeleting={isDeleting && deleteTarget?.id === analysis.id}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmationModal
          analysisTitle={deleteTarget.title || 'Untitled Analysis'}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// Main Page Component with Route Protection
// ============================================================================

export default function AnalysisHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <HistoryContent />
    </ProtectedRoute>
  );
}
