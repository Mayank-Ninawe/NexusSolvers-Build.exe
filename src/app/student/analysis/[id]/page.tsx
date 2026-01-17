'use client';

/**
 * BiasBreaker Analysis Details Page
 * Detailed view of a single analysis with tabs for different sections
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { getAnalysisById, deleteAnalysis, updateAnalysisTitle } from '@/lib/firestore';
import { exportAnalysisPDF } from '@/lib/exportUtils';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import toast from 'react-hot-toast';
import type { Analysis, BiasType, DetectedPattern } from '@/types';

// ============================================================================
// Types
// ============================================================================

type TabType = 'overview' | 'patterns' | 'suggestions' | 'raw';

// ============================================================================
// Constants
// ============================================================================

const BIAS_TYPE_COLORS: Record<BiasType, { bg: string; text: string; label: string; icon: string }> = {
  gender_bias: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Gender Bias', icon: '👥' },
  department_discrimination: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dept. Discrimination', icon: '🎓' },
  socioeconomic_bias: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Socioeconomic Bias', icon: '💰' },
  academic_elitism: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Academic Elitism', icon: '📚' },
  community_patterns: { bg: 'bg-green-100', text: 'text-green-700', label: 'Community Patterns', icon: '🏛️' },
};

const SEVERITY_COLORS = {
  low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Risk' },
  medium: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Medium Risk' },
  high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High Risk' },
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Tab Navigation Component
 */
function TabNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
    },
    {
      id: 'patterns',
      label: 'Detected Patterns',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'suggestions',
      label: 'Suggestions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      id: 'raw',
      label: 'Raw Data',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-1 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

/**
 * Circular Progress Ring Component
 */
function CircularProgress({ value, size = 120, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value < 30) return '#10B981';
    if (value <= 70) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: getColor() }}>
          {value}%
        </span>
        <span className="text-xs text-gray-500">Bias Score</span>
      </div>
    </div>
  );
}

/**
 * Overview Tab Content
 */
function OverviewTab({ analysis }: { analysis: Analysis }) {
  const severityStyle = SEVERITY_COLORS[analysis.severity];

  // Highlight biased phrases in the text
  const highlightedText = () => {
    let text = analysis.text;
    const patterns = analysis.detectedPatterns;

    // Sort patterns by text length (longest first) to avoid partial replacements
    const sortedPatterns = [...patterns].sort((a, b) => b.text.length - a.text.length);

    // Create a map of highlights
    const highlights: { start: number; end: number; pattern: DetectedPattern }[] = [];

    sortedPatterns.forEach((pattern) => {
      const regex = new RegExp(pattern.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let match;
      while ((match = regex.exec(analysis.text)) !== null) {
        highlights.push({
          start: match.index,
          end: match.index + match[0].length,
          pattern,
        });
      }
    });

    // Sort highlights by start position
    highlights.sort((a, b) => a.start - b.start);

    // Build highlighted text
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    highlights.forEach((highlight, index) => {
      // Skip overlapping highlights
      if (highlight.start < lastIndex) return;

      // Add text before highlight
      if (highlight.start > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {analysis.text.slice(lastIndex, highlight.start)}
          </span>
        );
      }

      // Add highlighted text
      const style = BIAS_TYPE_COLORS[highlight.pattern.type];
      elements.push(
        <span
          key={`highlight-${index}`}
          className={`${style.bg} ${style.text} px-1 rounded cursor-help`}
          title={`${style.label}: ${highlight.pattern.severity} severity`}
        >
          {analysis.text.slice(highlight.start, highlight.end)}
        </span>
      );

      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < analysis.text.length) {
      elements.push(
        <span key="text-end">{analysis.text.slice(lastIndex)}</span>
      );
    }

    return elements.length > 0 ? elements : analysis.text;
  };

  return (
    <div className="space-y-6">
      {/* Score and Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bias Score */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
          <CircularProgress value={analysis.biasScore} />
          <div className="mt-4 text-center">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${severityStyle.bg} ${severityStyle.text}`}>
              {severityStyle.label}
            </span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Patterns Detected</p>
              <p className="text-2xl font-bold text-gray-900">{analysis.detectedPatterns.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bias Types Found</p>
              <p className="text-2xl font-bold text-gray-900">{analysis.biasTypes.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Suggestions</p>
              <p className="text-2xl font-bold text-gray-900">{analysis.suggestions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Text Length</p>
              <p className="text-2xl font-bold text-gray-900">{analysis.text.length} chars</p>
            </div>
          </div>

          {/* Bias Types */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">Detected Bias Types</p>
            <div className="flex flex-wrap gap-2">
              {analysis.biasTypes.map((type) => {
                const style = BIAS_TYPE_COLORS[type];
                return (
                  <span
                    key={type}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}
                  >
                    {style.icon} {style.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Original Text with Highlights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Original Text</h3>
        <p className="text-sm text-gray-500 mb-3">
          Highlighted sections indicate detected bias patterns. Hover for details.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-mono text-sm">
            {highlightedText()}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Patterns Tab Content
 */
function PatternsTab({ analysis }: { analysis: Analysis }) {
  // Group patterns by bias type
  const patternsByType = analysis.detectedPatterns.reduce((acc, pattern) => {
    if (!acc[pattern.type]) {
      acc[pattern.type] = [];
    }
    acc[pattern.type].push(pattern);
    return acc;
  }, {} as Record<BiasType, DetectedPattern[]>);

  if (analysis.detectedPatterns.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Patterns Detected</h3>
        <p className="text-gray-600">Great news! No bias patterns were found in this analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(patternsByType).map(([type, patterns]) => {
        const typeKey = type as BiasType;
        const style = BIAS_TYPE_COLORS[typeKey];

        return (
          <div key={type} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Section Header */}
            <div className={`${style.bg} px-6 py-4 border-b border-gray-100`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{style.icon}</span>
                <div>
                  <h3 className={`text-lg font-semibold ${style.text}`}>{style.label}</h3>
                  <p className="text-sm text-gray-600">{patterns.length} pattern{patterns.length !== 1 ? 's' : ''} detected</p>
                </div>
              </div>
            </div>

            {/* Patterns List */}
            <div className="divide-y divide-gray-100">
              {patterns.map((pattern, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Pattern Text */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-gray-800 font-mono text-sm">&quot;{pattern.text}&quot;</p>
                      </div>
                      
                      {/* Explanation Placeholder */}
                      <p className="text-gray-600 text-sm">
                        This text contains indicators of {style.label.toLowerCase()}. Consider rephrasing to use more inclusive language.
                      </p>
                    </div>
                    
                    {/* Severity Badge */}
                    <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      SEVERITY_COLORS[pattern.severity].bg
                    } ${SEVERITY_COLORS[pattern.severity].text}`}>
                      {pattern.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Suggestions Tab Content
 */
function SuggestionsTab({ analysis }: { analysis: Analysis }) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (analysis.suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Suggestions</h3>
        <p className="text-gray-600">No improvement suggestions were generated for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {analysis.suggestions.map((suggestion, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-4">
            {/* Number Badge */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-bold text-sm">
              {index + 1}
            </div>
            
            {/* Suggestion Content */}
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 leading-relaxed">{suggestion}</p>
              
              {/* Copy Button */}
              <button
                onClick={() => copyToClipboard(suggestion)}
                className="mt-3 inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Raw Data Tab Content
 */
function RawDataTab({ analysis }: { analysis: Analysis }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
    toast.success('JSON copied to clipboard!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Raw Analysis Data</h3>
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy JSON
        </button>
      </div>
      <div className="p-6 bg-gray-900 overflow-x-auto max-h-[600px]">
        <pre className="text-sm text-green-400 font-mono">
          {JSON.stringify(analysis, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/**
 * Delete Confirmation Modal
 */
function DeleteConfirmationModal({
  onConfirm,
  onCancel,
  isDeleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Analysis?</h3>
        <p className="text-gray-600 text-center mb-6">
          This action cannot be undone. The analysis will be permanently removed.
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
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse">
            <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
            <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-48 bg-gray-100 rounded" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded" />
          <div className="grid grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="col-span-2 h-64 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-96 bg-gray-200 rounded-lg" />
        </div>
      </main>
    </div>
  );
}

/**
 * Not Found / Access Denied Component
 */
function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-12 text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Not Found</h2>
        <p className="text-gray-600 mb-6">
          The analysis you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>
        <button
          onClick={() => router.push('/student/dashboard')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Analysis Details Content Component
// ============================================================================

function AnalysisDetailsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const analysisId = params.id as string;

  // State
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Fetch analysis on mount
  useEffect(() => {
    async function fetchAnalysis() {
      if (!analysisId || !user?.uid) return;

      try {
        setLoading(true);
        const data = await getAnalysisById(analysisId);

        if (!data || data.userId !== user.uid) {
          setNotFound(true);
          return;
        }

        setAnalysis(data);
        setEditedTitle(data.title || '');
      } catch (err) {
        console.error('Failed to fetch analysis:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [analysisId, user?.uid]);

  // Handle title update
  const handleSaveTitle = useCallback(async () => {
    if (!analysis || !editedTitle.trim()) return;

    try {
      await updateAnalysisTitle(analysis.id, editedTitle.trim());
      setAnalysis((prev) => prev ? { ...prev, title: editedTitle.trim() } : null);
      setIsEditingTitle(false);
      toast.success('Title updated');
    } catch (err) {
      console.error('Failed to update title:', err);
      toast.error('Failed to update title');
    }
  }, [analysis, editedTitle]);

  // Handle delete
  const handleDelete = async () => {
    if (!analysis) return;

    setIsDeleting(true);
    try {
      await deleteAnalysis(analysis.id);
      toast.success('Analysis deleted');
      router.push('/student/history');
    } catch (err) {
      console.error('Failed to delete analysis:', err);
      toast.error('Failed to delete analysis');
      setIsDeleting(false);
    }
  };

  // Copy shareable link
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Not found state
  if (notFound || !analysis) {
    return <NotFound />;
  }

  const severityStyle = SEVERITY_COLORS[analysis.severity];

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <button
            onClick={() => router.push('/student/history')}
            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to History
          </button>

          {/* Title Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Editable Title */}
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-purple-500 bg-transparent outline-none w-full max-w-lg"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') {
                        setIsEditingTitle(false);
                        setEditedTitle(analysis.title || '');
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditedTitle(analysis.title || '');
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 truncate">
                    {analysis.title || 'Untitled Analysis'}
                  </h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit title"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Metadata */}
              <p className="text-gray-500 mt-1">
                {format(analysis.timestamp, "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            {/* Score and Severity */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold" style={{
                  color: analysis.biasScore < 30 ? '#10B981' : analysis.biasScore <= 70 ? '#F59E0B' : '#EF4444'
                }}>
                  {analysis.biasScore}%
                </p>
                <p className="text-sm text-gray-500">Bias Score</p>
              </div>
              <span className={`px-4 py-2 rounded-full font-semibold ${severityStyle.bg} ${severityStyle.text}`}>
                {severityStyle.label}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab analysis={analysis} />}
        {activeTab === 'patterns' && <PatternsTab analysis={analysis} />}
        {activeTab === 'suggestions' && <SuggestionsTab analysis={analysis} />}
        {activeTab === 'raw' && <RawDataTab analysis={analysis} />}
      </main>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Download PDF Button */}
            <button
              onClick={() => exportAnalysisPDF(analysis)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-lg hover:shadow-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            
            <button
              onClick={() => router.push('/compare')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Compare
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Spacer for sticky bar */}
      <div className="h-20" />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

// ============================================================================
// Main Page Component with Route Protection
// ============================================================================

export default function AnalysisDetailsPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <AnalysisDetailsContent />
    </ProtectedRoute>
  );
}
