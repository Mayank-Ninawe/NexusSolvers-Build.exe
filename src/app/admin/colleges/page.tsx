'use client';

/**
 * BiasBreaker Admin Colleges List Page
 * Browse and filter all colleges with Firestore integration
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { getAllColleges } from '@/lib/firestore';
import { sortColleges, exportCollegesToCSV } from '@/lib/adminUtils';
import type { College } from '@/types';

// ============================================================================
// Types
// ============================================================================

type SortOption = 'biasScore-desc' | 'biasScore-asc' | 'activity-desc' | 'name-asc' | 'reports-desc';
type BiasRangeFilter = 'all' | 'low' | 'medium' | 'high';
type ActivityFilter = 'all' | 'active' | 'inactive';

interface FilterState {
  search: string;
  biasRange: BiasRangeFilter;
  activity: ActivityFilter;
  sort: SortOption;
}

// ============================================================================
// Constants
// ============================================================================

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Highest Bias First', value: 'biasScore-desc' },
  { label: 'Lowest Bias First', value: 'biasScore-asc' },
  { label: 'Most Recent Activity', value: 'activity-desc' },
  { label: 'Most Reports', value: 'reports-desc' },
  { label: 'Name (A-Z)', value: 'name-asc' },
];

const BIAS_FILTERS: { label: string; value: BiasRangeFilter }[] = [
  { label: 'All Bias Levels', value: 'all' },
  { label: 'Low Risk (0-40%)', value: 'low' },
  { label: 'Medium Risk (40-70%)', value: 'medium' },
  { label: 'High Risk (70%+)', value: 'high' },
];

const ACTIVITY_FILTERS: { label: string; value: ActivityFilter }[] = [
  { label: 'All Activity', value: 'all' },
  { label: 'Active (7 days)', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * College Card Component
 */
function CollegeCard({ 
  college, 
  index,
  onClick 
}: { 
  college: College; 
  index: number;
  onClick: () => void;
}) {
  const biasLevel = college.averageBiasScore >= 70 ? 'high' : 
                    college.averageBiasScore >= 40 ? 'medium' : 'low';
  
  const biasStyles = {
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' },
    medium: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100' },
    low: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' },
  };

  const style = biasStyles[biasLevel];
  const isActive = (Date.now() - college.lastActivity.getTime()) < 7 * 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className={`group relative bg-white rounded-xl shadow-lg hover:shadow-xl border ${style.border} cursor-pointer transition-all hover:-translate-y-1`}
    >
      {/* Activity Indicator */}
      <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
        {isActive && (
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
        )}
      </div>

      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors truncate pr-8">
            {college.name}
          </h3>
          <p className="text-sm text-gray-500">
            Last activity: {formatDistanceToNow(college.lastActivity, { addSuffix: true })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{college.totalReports}</p>
            <p className="text-xs text-gray-500">Reports</p>
          </div>
          <div className={`text-center p-3 rounded-lg ${style.bg}`}>
            <p className={`text-2xl font-bold ${style.text}`}>{college.averageBiasScore}%</p>
            <p className="text-xs text-gray-500">Avg Bias</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{college.highSeverityCount || 0}</p>
            <p className="text-xs text-gray-500">Critical</p>
          </div>
        </div>

        {/* Bias Type Tags */}
        {college.commonBiasTypes && college.commonBiasTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {college.commonBiasTypes.slice(0, 3).map((type) => (
              <span 
                key={type}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {type.replace(/_/g, ' ')}
              </span>
            ))}
            {college.commonBiasTypes.length > 3 && (
              <span className="px-2 py-0.5 text-gray-500 text-xs">
                +{college.commonBiasTypes.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Risk Badge */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.badge} ${style.text}`}>
            {biasLevel.charAt(0).toUpperCase() + biasLevel.slice(1)} Risk
          </span>
          <span className="text-purple-600 text-sm font-medium group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Stats Summary Card
 */
function StatsSummary({ colleges, loading }: { colleges: College[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl" />
        ))}
      </div>
    );
  }

  const totalReports = colleges.reduce((sum, c) => sum + c.totalReports, 0);
  const avgBias = colleges.length > 0 
    ? Math.round(colleges.reduce((sum, c) => sum + c.averageBiasScore, 0) / colleges.length)
    : 0;
  const highRiskCount = colleges.filter(c => c.averageBiasScore >= 70).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <p className="text-sm text-gray-500">Total Colleges</p>
        <p className="text-2xl font-bold text-gray-900">{colleges.length}</p>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <p className="text-sm text-gray-500">Total Reports</p>
        <p className="text-2xl font-bold text-gray-900">{totalReports.toLocaleString()}</p>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <p className="text-sm text-gray-500">Avg Bias Score</p>
        <p className={`text-2xl font-bold ${
          avgBias >= 70 ? 'text-red-600' : avgBias >= 40 ? 'text-orange-600' : 'text-green-600'
        }`}>{avgBias}%</p>
      </div>
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <p className="text-sm text-gray-500">High Risk</p>
        <p className="text-2xl font-bold text-red-600">{highRiskCount}</p>
      </div>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ hasFilters, onClearFilters }: { hasFilters: boolean; onClearFilters: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {hasFilters ? 'No matching colleges' : 'No colleges yet'}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {hasFilters
          ? 'Try adjusting your filters to see more results'
          : 'Colleges will appear here once they start using the platform'}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

/**
 * Loading Skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-1/2 bg-gray-100 rounded mb-4" />
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="h-16 bg-gray-100 rounded-lg" />
            <div className="h-16 bg-gray-100 rounded-lg" />
            <div className="h-16 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-8 w-24 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function CollegesPage() {
  const router = useRouter();

  // State
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    biasRange: 'all',
    activity: 'all',
    sort: 'biasScore-desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  useEffect(() => {
    async function fetchColleges() {
      setLoading(true);
      try {
        const data = await getAllColleges();
        setColleges(data);
      } catch (error) {
        console.error('Error fetching colleges:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchColleges();
  }, []);

  // Apply filters and sorting
  const filteredColleges = useMemo(() => {
    let result = [...colleges];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(searchLower));
    }

    // Bias range filter
    if (filters.biasRange !== 'all') {
      result = result.filter(c => {
        if (filters.biasRange === 'low') return c.averageBiasScore < 40;
        if (filters.biasRange === 'medium') return c.averageBiasScore >= 40 && c.averageBiasScore < 70;
        if (filters.biasRange === 'high') return c.averageBiasScore >= 70;
        return true;
      });
    }

    // Activity filter
    if (filters.activity !== 'all') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter(c => {
        const isActive = c.lastActivity.getTime() > sevenDaysAgo;
        return filters.activity === 'active' ? isActive : !isActive;
      });
    }

    // Sort
    const [sortField, sortDir] = filters.sort.split('-') as [string, 'asc' | 'desc'];
    return sortColleges(result, sortField as 'biasScore' | 'activity' | 'name' | 'reports', sortDir);
  }, [colleges, filters]);

  // Handlers
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', biasRange: 'all', activity: 'all', sort: 'biasScore-desc' });
  };

  const handleExportCSV = () => {
    exportCollegesToCSV(filteredColleges);
  };

  const hasFilters = filters.search !== '' || filters.biasRange !== 'all' || filters.activity !== 'all';

  return (
    <div className="min-h-screen bg-[#F5F3FF] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Colleges</h1>
            <p className="text-gray-500">
              {loading ? 'Loading...' : `${filteredColleges.length} colleges registered`}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              disabled={filteredColleges.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <StatsSummary colleges={filteredColleges} loading={loading} />

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[250px] relative">
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
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search colleges..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              />
            </div>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer text-sm"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Toggle Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                showFilters ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {hasFilters && (
                <span className="w-2 h-2 bg-purple-600 rounded-full" />
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-gray-100">
                  {/* Bias Range */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Bias Level</label>
                    <select
                      value={filters.biasRange}
                      onChange={(e) => handleFilterChange('biasRange', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                    >
                      {BIAS_FILTERS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Activity */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Activity</label>
                    <select
                      value={filters.activity}
                      onChange={(e) => handleFilterChange('activity', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                    >
                      {ACTIVITY_FILTERS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clear Filters */}
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="self-end px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        {!loading && (
          <p className="text-sm text-gray-500">
            Showing {filteredColleges.length} of {colleges.length} colleges
          </p>
        )}

        {/* Colleges Grid */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredColleges.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map((college, index) => (
              <CollegeCard
                key={college.id}
                college={college}
                index={index}
                onClick={() => router.push(`/admin/colleges/${college.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
