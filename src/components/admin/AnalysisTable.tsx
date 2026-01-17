'use client';

/**
 * BiasBreaker Admin Analysis Table Component
 * Reusable table for displaying analyses with filters and pagination
 */

import React, { useState, useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { anonymizeEmail, getScoreColor, getProgressBarColor, BIAS_TYPE_CONFIG } from '@/lib/adminUtils';
import type { Analysis, BiasType, BiasSeverity } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface AnalysisTableProps {
  /** Array of analyses to display */
  analyses: Analysis[];
  /** Whether data is loading */
  loading?: boolean;
  /** Number of items per page (default: 10) */
  pageSize?: number;
  /** Show college name column */
  showCollege?: boolean;
  /** Callback when "View" is clicked */
  onViewAnalysis?: (analysis: Analysis) => void;
  /** Callback when "Delete" is clicked */
  onDeleteAnalysis?: (analysis: Analysis) => void;
  /** Show compact view (for activity feed) */
  compact?: boolean;
}

interface FilterState {
  search: string;
  severity: BiasSeverity | 'all';
  biasType: BiasType | 'all';
}

// ============================================================================
// Constants
// ============================================================================

const SEVERITY_STYLES = {
  low: { bg: 'bg-green-100', text: 'text-green-700' },
  medium: { bg: 'bg-orange-100', text: 'text-orange-700' },
  high: { bg: 'bg-red-100', text: 'text-red-700' },
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Table Header Cell Component
 */
function TableHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 ${className}`}>
      {children}
    </th>
  );
}

/**
 * Table Cell Component
 */
function TableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`py-4 px-4 text-sm ${className}`}>
      {children}
    </td>
  );
}

/**
 * Bias Type Pill Component
 */
function BiasTypePill({ type }: { type: BiasType }) {
  const config = BIAS_TYPE_CONFIG[type];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor}`}
      style={{ color: config.color }}
    >
      {config.label}
    </span>
  );
}

/**
 * Progress Bar Component
 */
function ScoreProgressBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getProgressBarColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
        {score}%
      </span>
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
  const getPageNumbers = (): (number | string)[] => {
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

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-6 pt-4 border-t border-gray-100">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>

      <div className="flex gap-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-purple-600 text-white'
                : page === '...'
                ? 'text-gray-400 cursor-default'
                : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}

/**
 * Table Skeleton Loader
 */
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-100 rounded-t-lg" />
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-gray-100">
          <div className="h-4 w-1/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/6 bg-gray-100 rounded" />
          <div className="h-4 w-1/5 bg-gray-200 rounded" />
          <div className="h-4 w-1/6 bg-gray-100 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {hasFilters ? 'No matching analyses' : 'No analyses yet'}
      </h3>
      <p className="text-gray-500 text-sm mb-4">
        {hasFilters
          ? 'Try adjusting your filters'
          : 'Analyses will appear here once submitted'}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="text-purple-600 hover:text-purple-700 font-medium text-sm"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AnalysisTable({
  analyses,
  loading = false,
  pageSize = 10,
  showCollege = true,
  onViewAnalysis,
  onDeleteAnalysis,
  compact = false,
}: AnalysisTableProps) {
  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    severity: 'all',
    biasType: 'all',
  });

  // Filter and paginate analyses
  const { filteredAnalyses, paginatedAnalyses, totalPages } = useMemo(() => {
    let result = [...analyses];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.collegeName.toLowerCase().includes(searchLower)
      );
    }

    // Apply severity filter
    if (filters.severity !== 'all') {
      result = result.filter((a) => a.severity === filters.severity);
    }

    // Apply bias type filter
    if (filters.biasType !== 'all') {
      result = result.filter((a) => a.biasTypes.includes(filters.biasType as BiasType));
    }

    // Sort by timestamp descending
    result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const totalPages = Math.ceil(result.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginated = result.slice(start, start + pageSize);

    return {
      filteredAnalyses: result,
      paginatedAnalyses: paginated,
      totalPages,
    };
  }, [analyses, filters, currentPage, pageSize]);

  // Reset to page 1 when filters change
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', severity: 'all', biasType: 'all' });
    setCurrentPage(1);
  };

  const hasFilters = filters.search !== '' || filters.severity !== 'all' || filters.biasType !== 'all';

  if (loading) {
    return <TableSkeleton rows={pageSize} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Filters Row */}
      {!compact && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-wrap gap-3">
            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by title or college..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {/* Bias Type Filter */}
            <select
              value={filters.biasType}
              onChange={(e) => handleFilterChange('biasType', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
            >
              <option value="all">All Bias Types</option>
              {(Object.entries(BIAS_TYPE_CONFIG) as [BiasType, { label: string; color: string; bgColor: string }][]).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.label}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results Count */}
          <p className="text-xs text-gray-500 mt-2">
            Showing {paginatedAnalyses.length} of {filteredAnalyses.length} analyses
          </p>
        </div>
      )}

      {/* Table */}
      {filteredAnalyses.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <TableHeader>Title</TableHeader>
                  {showCollege && <TableHeader>College</TableHeader>}
                  <TableHeader>User</TableHeader>
                  <TableHeader className="w-40">Bias Score</TableHeader>
                  <TableHeader>Types</TableHeader>
                  <TableHeader>Severity</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader className="w-24">Actions</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedAnalyses.map((analysis) => (
                  <tr
                    key={analysis.id}
                    className="hover:bg-purple-50/50 transition-colors"
                  >
                    {/* Title */}
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium text-gray-900 truncate">
                          {analysis.title || 'Untitled'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {analysis.detectedPatterns.length} patterns
                        </p>
                      </div>
                    </TableCell>

                    {/* College */}
                    {showCollege && (
                      <TableCell>
                        <span className="text-gray-700">{analysis.collegeName}</span>
                      </TableCell>
                    )}

                    {/* User (Anonymized) */}
                    <TableCell>
                      <span className="text-gray-500 font-mono text-xs">
                        {anonymizeEmail(analysis.userEmail)}
                      </span>
                    </TableCell>

                    {/* Bias Score */}
                    <TableCell>
                      <ScoreProgressBar score={analysis.biasScore} />
                    </TableCell>

                    {/* Bias Types */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {analysis.biasTypes.slice(0, 2).map((type) => (
                          <BiasTypePill key={type} type={type} />
                        ))}
                        {analysis.biasTypes.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{analysis.biasTypes.length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Severity */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          SEVERITY_STYLES[analysis.severity].bg
                        } ${SEVERITY_STYLES[analysis.severity].text}`}
                      >
                        {analysis.severity}
                      </span>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <div>
                        <p className="text-gray-700 text-sm">
                          {format(analysis.timestamp, 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(analysis.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {onViewAnalysis && (
                          <button
                            onClick={() => onViewAnalysis(analysis)}
                            className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        )}
                        {onDeleteAnalysis && (
                          <button
                            onClick={() => onDeleteAnalysis(analysis)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
