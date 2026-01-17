'use client';

/**
 * BiasBreaker Upload Page (TypeScript Version)
 * Allows students to submit placement communications for bias analysis
 * Saves results to Firestore and redirects to student dashboard
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { saveAnalysis, updateCollegeStats, updateGlobalStats } from '@/lib/firestore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import toast from 'react-hot-toast';
import type { BiasType, BiasSeverity, DetectedPattern } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface GeminiAnalysisResponse {
  biasDetected: boolean;
  biasScore: number;
  biasTypes: string[];
  patterns: Array<{
    type: string;
    text: string;
    severity: string;
  }>;
  suggestions: string[];
}

interface AnalysisResult {
  biasDetected: boolean;
  biasScore: number;
  biasTypes: BiasType[];
  patterns: DetectedPattern[];
  suggestions: string[];
  severity: BiasSeverity;
}

// ============================================================================
// Constants
// ============================================================================

const BIAS_TYPES_INFO = [
  {
    name: 'Gender Bias',
    icon: '👥',
    desc: 'Pronouns, gendered language',
    color: 'text-pink-600',
  },
  {
    name: 'Department Discrimination',
    icon: '🎓',
    desc: 'CS/IT preference over other branches',
    color: 'text-blue-600',
  },
  {
    name: 'Socioeconomic Bias',
    icon: '💰',
    desc: 'Hostel, background requirements',
    color: 'text-orange-600',
  },
  {
    name: 'Academic Elitism',
    icon: '📚',
    desc: 'Unrealistic CGPA cutoffs',
    color: 'text-yellow-600',
  },
  {
    name: 'Community Indicators',
    icon: '🏛️',
    desc: 'Caste/religion patterns',
    color: 'text-green-600',
  },
];

// Valid bias types for type safety
const VALID_BIAS_TYPES: BiasType[] = [
  'gender_bias',
  'department_discrimination',
  'socioeconomic_bias',
  'academic_elitism',
  'community_patterns',
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts bias score to severity level
 */
function calculateSeverity(biasScore: number): BiasSeverity {
  if (biasScore < 30) return 'low';
  if (biasScore <= 70) return 'medium';
  return 'high';
}

/**
 * Validates and filters bias types to ensure type safety
 */
function validateBiasTypes(types: string[]): BiasType[] {
  return types.filter((type): type is BiasType =>
    VALID_BIAS_TYPES.includes(type as BiasType)
  );
}

/**
 * Validates and transforms patterns to ensure type safety
 */
function validatePatterns(patterns: GeminiAnalysisResponse['patterns']): DetectedPattern[] {
  return patterns.map((pattern) => ({
    type: VALID_BIAS_TYPES.includes(pattern.type as BiasType)
      ? (pattern.type as BiasType)
      : 'community_patterns', // Default fallback
    text: pattern.text,
    severity: ['low', 'medium', 'high'].includes(pattern.severity)
      ? (pattern.severity as BiasSeverity)
      : 'medium', // Default fallback
  }));
}

// ============================================================================
// Scroll Reveal Hook Component
// ============================================================================

function useScrollReveal(options: { threshold?: number; once?: boolean } = {}) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once) {
            observer.unobserve(ref);
          }
        } else if (!options.once) {
          setIsVisible(false);
        }
      },
      { threshold: options.threshold || 0.1 }
    );

    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
    };
  }, [ref, options.once, options.threshold]);

  return [setRef, isVisible] as const;
}

function ScrollReveal({
  children,
  animation = 'fade-up',
  delay = 0,
}: {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'zoom-out';
  delay?: number;
}) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1, once: true });

  const animations: Record<string, string> = {
    'fade-up': 'translate-y-10 opacity-0',
    'fade-down': '-translate-y-10 opacity-0',
    'fade-left': 'translate-x-10 opacity-0',
    'fade-right': '-translate-x-10 opacity-0',
    'zoom-in': 'scale-90 opacity-0',
    'zoom-out': 'scale-110 opacity-0',
  };

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ease-out ${
        isVisible ? 'translate-y-0 translate-x-0 scale-100 opacity-100' : animations[animation]
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Main Upload Content Component
// ============================================================================

function UploadContent() {
  const { user } = useAuth();
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [emailText, setEmailText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Check for template loaded from templates page
  useEffect(() => {
    const pendingUpload = localStorage.getItem('pendingEmailUpload');
    if (pendingUpload) {
      try {
        const data = JSON.parse(pendingUpload);
        setTitle(data.title || '');
        setEmailText(data.content || '');
        localStorage.removeItem('pendingEmailUpload');
        toast.success('✅ Template loaded! Ready to analyze.');
      } catch (error) {
        console.error('Failed to load template:', error);
      }
    }
  }, []);

  /**
   * Handle form submission - analyze with Gemini and save to Firestore
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailText.trim()) {
      toast.error('Please enter email content');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to analyze');
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);
    const loadingToast = toast.loading('🤖 Analyzing with Gemini AI...');

    try {
      // Step 1: Analyze with Gemini via API route
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailText }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      const geminiAnalysis: GeminiAnalysisResponse = data.analysis;

      // Step 2: Process and validate the analysis result
      const biasScore = Math.min(100, Math.max(0, geminiAnalysis.biasScore || 0));
      const severity = calculateSeverity(biasScore);
      const biasTypes = validateBiasTypes(geminiAnalysis.biasTypes || []);
      const patterns = validatePatterns(geminiAnalysis.patterns || []);
      const suggestions = geminiAnalysis.suggestions || [];

      const result: AnalysisResult = {
        biasDetected: geminiAnalysis.biasDetected,
        biasScore,
        biasTypes,
        patterns,
        suggestions,
        severity,
      };

      setAnalysisResult(result);

      toast.success(
        `✅ Analysis complete! ${result.biasDetected ? `Found ${result.patterns.length} bias patterns` : 'No bias detected'}`,
        { id: loadingToast, duration: 3000 }
      );

      // Step 3: Save to Firestore
      setSaving(true);
      const savingToast = toast.loading('💾 Saving to your history...');

      try {
        const analysisData = {
          userId: user.uid,
          userEmail: user.email,
          collegeName: user.collegeName,
          collegeId: user.collegeId,
          title: title.trim() || 'Untitled Analysis',
          text: emailText,
          biasScore: result.biasScore,
          biasTypes: result.biasTypes,
          detectedPatterns: result.patterns,
          suggestions: result.suggestions,
          timestamp: new Date(),
          severity: result.severity,
        };

        await saveAnalysis(analysisData);

        toast.success('✓ Analysis saved to your history', { id: savingToast });

        // Step 4: Update aggregated statistics (in background)
        try {
          await Promise.all([
            updateCollegeStats(user.collegeId, result.biasScore),
            updateGlobalStats(result.biasScore),
          ]);
        } catch (statsError) {
          // Don't fail the main flow if stats update fails
          console.error('Failed to update stats:', statsError);
        }

        // Step 5: Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/student/dashboard');
        }, 2000);

      } catch (saveError) {
        console.error('Failed to save analysis:', saveError);
        toast.error('Failed to save analysis. Please try again.', { id: savingToast });
        setSaving(false);
      }

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Analysis failed. Please try again.',
        { id: loadingToast }
      );
      setAnalyzing(false);
    }
  };

  /**
   * Reset form for new analysis
   */
  const handleReset = () => {
    setTitle('');
    setEmailText('');
    setAnalysisResult(null);
    setAnalyzing(false);
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Upload for Analysis</h1>
              <p className="text-gray-600 mt-1">
                Paste your placement email content below for bias detection
              </p>
            </div>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Form */}
        <ScrollReveal animation="zoom-in">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl">
                  📧
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Email Content</h2>
                  <p className="text-purple-100 text-sm">Fill in the details below</p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-8 space-y-6">
              {/* Email Title Input */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📝</span>
                  <span>Email Title (Optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., TechCorp Software Engineer Role"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 group-hover:border-gray-400 text-gray-900"
                  disabled={analyzing || saving}
                />
              </div>

              {/* Email Content Textarea */}
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>✍️</span>
                  <span>Email Content *</span>
                  <span className="ml-auto text-xs text-gray-500 font-normal">
                    {emailText.length} / 10,000 characters
                  </span>
                </label>
                <textarea
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  placeholder="Paste your placement email content here..."
                  rows={12}
                  maxLength={10000}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 resize-none group-hover:border-gray-400 font-mono text-sm text-gray-900"
                  required
                  disabled={analyzing || saving}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={analyzing || saving || !emailText.trim()}
                  className="flex-1 group relative px-8 py-4 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-bold rounded-xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                >
                  {analyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing...</span>
                    </span>
                  ) : saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      🎯 Analyze for Bias
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </button>

                {analysisResult && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-300 hover:border-gray-400 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    New Analysis
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => router.push('/student/dashboard')}
                  disabled={analyzing || saving}
                  className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-300 hover:border-gray-400 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </ScrollReveal>

        {/* Analysis Result Preview */}
        {analysisResult && (
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className={`px-8 py-4 ${
                analysisResult.severity === 'low' ? 'bg-green-50' :
                analysisResult.severity === 'medium' ? 'bg-orange-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Analysis Results</h3>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold capitalize ${
                    analysisResult.severity === 'low' ? 'bg-green-100 text-green-700' :
                    analysisResult.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {analysisResult.severity} severity
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <p className={`text-4xl font-bold ${
                      analysisResult.biasScore < 30 ? 'text-green-600' :
                      analysisResult.biasScore <= 70 ? 'text-orange-500' : 'text-red-600'
                    }`}>
                      {analysisResult.biasScore}%
                    </p>
                    <p className="text-sm text-gray-500">Bias Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{analysisResult.patterns.length}</p>
                    <p className="text-sm text-gray-500">Patterns Found</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{analysisResult.suggestions.length}</p>
                    <p className="text-sm text-gray-500">Suggestions</p>
                  </div>
                </div>

                {analysisResult.biasTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {analysisResult.biasTypes.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700"
                      >
                        {type.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-center text-gray-500 mt-4 text-sm">
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* What We Analyze Section */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">ℹ️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">What we analyze:</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our AI scans for these discrimination patterns using Google Gemini 2.5 Flash
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {BIAS_TYPES_INFO.map((bias, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl group-hover:scale-110 transition-transform">
                      {bias.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold ${bias.color} mb-1`}>{bias.name}</div>
                      <div className="text-sm text-gray-600">{bias.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Tips Section */}
        <ScrollReveal animation="fade-up" delay={300}>
          <div className="mt-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-3xl">💡</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pro Tips:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Include the full email subject and body for best results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Analysis typically takes 2-3 seconds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>You can analyze up to 10,000 characters at once</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>
                      Try our{' '}
                      <button
                        onClick={() => router.push('/templates')}
                        className="text-blue-600 font-semibold underline hover:text-blue-700"
                      >
                        pre-made templates
                      </button>{' '}
                      to test the AI
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Quick Links */}
        <ScrollReveal animation="zoom-in" delay={400}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => router.push('/templates')}
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-purple-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              📧 Browse Templates
            </button>
            <button
              onClick={() => router.push('/batch-upload')}
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-blue-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              📁 Batch Upload
            </button>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-green-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              📊 View Dashboard
            </button>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}

// ============================================================================
// Main Page Component with Route Protection
// ============================================================================

export default function UploadPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <UploadContent />
    </ProtectedRoute>
  );
}
