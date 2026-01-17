'use client'
import { exportAnalysisPDF } from '@/lib/utils/exportUtils';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';


function AnalysisContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && params.id) {
      loadAnalysis();
    }
  }, [user, params.id]);

  const loadAnalysis = async () => {
    try {
      const analysisRef = ref(db, `uploads/${user.uid}/${params.id}`);
      const snapshot = await get(analysisRef);
      
      if (snapshot.exists()) {
        setAnalysis({ id: params.id, ...snapshot.val() });
      } else {
        setError('Analysis not found');
      }
      setLoading(false);
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load analysis');
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getBiasIcon = (type) => {
    const icons = {
      gender_bias: '👥',
      department_discrimination: '🎓',
      socioeconomic_bias: '🏠',
      academic_elitism: '📚',
      caste_community_indicators: '🏛️',
      default: '⚠️'
    };
    return icons[type] || icons.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Analysis Not Found'}</h2>
            <p className="text-gray-600 mb-6">The analysis you're looking for doesn't exist or you don't have access.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-6 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {analysis.fileName || 'Email Analysis'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  📅 {new Date(analysis.timestamp).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="flex items-center gap-1">
                  🕐 {new Date(analysis.timestamp).toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {analysis.analysis?.confidence && (
                  <span className="flex items-center gap-1">
                    🎯 {analysis.analysis.confidence}% confidence
                  </span>
                )}
              </div>
            </div>
            
            {/* Overall Status Badge */}
            <div>
              {analysis.analysis?.biasDetected ? (
                <div className="bg-red-100 border-2 border-red-300 text-red-800 px-4 py-2 rounded-xl font-bold text-center">
                  <div className="text-2xl mb-1">⚠️</div>
                  <div>Bias Detected</div>
                </div>
              ) : (
                <div className="bg-green-100 border-2 border-green-300 text-green-800 px-4 py-2 rounded-xl font-bold text-center">
                  <div className="text-2xl mb-1">✅</div>
                  <div>No Bias Found</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Original Email */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📧</span>
                <span>Original Email Content</span>
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {analysis.emailText}
                </pre>
              </div>
            </div>

            {/* Bias Patterns Detected */}
            {analysis.analysis?.patterns && analysis.analysis.patterns.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🔍</span>
                  <span>Detected Bias Patterns ({analysis.analysis.patterns.length})</span>
                </h2>
                
                <div className="space-y-4">
                  {analysis.analysis.patterns.map((pattern, index) => (
                    <div 
                      key={index}
                      className={`border-2 rounded-xl p-5 ${getSeverityColor(pattern.severity)}`}
                    >
                      {/* Pattern Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getBiasIcon(pattern.type)}</span>
                          <div>
                            <h3 className="font-bold text-lg capitalize">
                              {pattern.type?.replace(/_/g, ' ')}
                            </h3>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              pattern.severity === 'high' ? 'bg-red-200 text-red-900' :
                              pattern.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                              'bg-blue-200 text-blue-900'
                            }`}>
                              {pattern.severity?.toUpperCase()} SEVERITY
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Evidence */}
                      {pattern.evidence && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold mb-1 opacity-75">EVIDENCE FOUND:</p>
                          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-current border-opacity-20">
                            <p className="font-mono text-sm italic">"{pattern.evidence}"</p>
                          </div>
                        </div>
                      )}

                      {/* AI Reasoning */}
                      {pattern.reasoning && (
                        <div>
                          <p className="text-xs font-semibold mb-1 opacity-75">AI ANALYSIS:</p>
                          <p className="text-sm leading-relaxed">{pattern.reasoning}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            
            {/* Analysis Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Analysis Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Total Patterns</span>
                  <span className="font-bold text-gray-900">
                    {analysis.analysis?.patterns?.length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Confidence Score</span>
                  <span className="font-bold text-blue-600">
                    {analysis.analysis?.confidence || 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">High Severity</span>
                  <span className="font-bold text-red-600">
                    {analysis.analysis?.patterns?.filter(p => p.severity === 'high').length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Medium Severity</span>
                  <span className="font-bold text-yellow-600">
                    {analysis.analysis?.patterns?.filter(p => p.severity === 'medium').length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 text-sm">Low Severity</span>
                  <span className="font-bold text-blue-600">
                    {analysis.analysis?.patterns?.filter(p => p.severity === 'low').length || 0}
                  </span>
                </div>
              </div>
            </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
            
            <div className="space-y-3">
              <button 
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105"
                onClick={() => exportAnalysisPDF(analysis)}
              >
                <span>📄</span>
                <span>Export PDF Report</span>
              </button>
              
              <button 
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                onClick={() => {
                  const patterns = analysis.analysis?.patterns || [];
                  const csv = `Type,Severity,Evidence,Reasoning\n${
                    patterns.map(p => 
                      `"${p.type}","${p.severity}","${p.evidence}","${p.reasoning}"`
                    ).join('\n')
                  }`;
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${analysis.fileName || 'analysis'}-patterns.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <span>📊</span>
                <span>Export CSV Data</span>
              </button>
              
              <button 
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                onClick={() => window.print()}
              >
                <span>🖨️</span>
                <span>Print Report</span>
              </button>
              
              <button 
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('🔗 Link copied to clipboard!');
                }}
              >
                <span>🔗</span>
                <span>Copy Share Link</span>
              </button>

              
              <button 
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                onClick={() => {
                  const shareData = {
                    title: `BiasBreaker: ${analysis.fileName || 'Analysis'}`,
                    text: `${analysis.analysis?.biasDetected ? '⚠️ Bias detected' : '✅ No bias found'} with ${analysis.analysis?.confidence}% confidence`,
                    url: window.location.href
                  };
                  
                  if (navigator.share) {
                    navigator.share(shareData)
                      .then(() => toast.success('📤 Shared successfully!'))
                      .catch((err) => {
                        if (err.name !== 'AbortError') {
                          navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                          toast.success('📋 Details copied to clipboard!');
                        }
                      });
                  } else {
                    navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                    toast.success('📋 Details copied to clipboard!');
                  }
                }}
              >
                <span>📤</span>
                <span>Share Analysis</span>
              </button>

            </div>
          </div>


            {/* AI Model Info */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
              <h2 className="text-lg font-bold text-gray-900 mb-3">AI Model Used</h2>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span>🤖</span>
                  <span className="font-semibold">Gemini 2.5 Flash</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>⚡</span>
                  <span className="text-gray-700">Real-time analysis</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>🎯</span>
                  <span className="text-gray-700">Context-aware detection</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <ProtectedRoute>
      <AnalysisContent />
    </ProtectedRoute>
  );
}
