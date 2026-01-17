'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ref, get, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

// Scroll Reveal Component
function ScrollReveal({ children, animation = 'fade-up', delay = 0 }) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1, once: true });
  
  const animations = {
    'fade-up': 'translate-y-10 opacity-0',
    'fade-down': '-translate-y-10 opacity-0',
    'fade-left': 'translate-x-10 opacity-0',
    'fade-right': '-translate-x-10 opacity-0',
    'zoom-in': 'scale-90 opacity-0',
    'zoom-out': 'scale-110 opacity-0'
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

function CompareContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [uploads, setUploads] = useState([]);
  const [leftId, setLeftId] = useState(searchParams.get('left') || '');
  const [rightId, setRightId] = useState(searchParams.get('right') || '');
  const [leftAnalysis, setLeftAnalysis] = useState(null);
  const [rightAnalysis, setRightAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    if (user) {
      loadUploads();
    }
  }, [user]);

  useEffect(() => {
    if (leftId && rightId && uploads.length > 0) {
      loadComparison();
    }
  }, [leftId, rightId, uploads]);

  const loadUploads = () => {
    const uploadsRef = ref(db, `uploads/${user.uid}`);
    
    onValue(uploadsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const uploadsArray = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(u => u.status === 'completed')
          .sort((a, b) => b.timestamp - a.timestamp);
        
        setUploads(uploadsArray);
      }
      setLoading(false);
    });
  };

  const loadComparison = () => {
    setComparing(true);
    
    const left = uploads.find(u => u.id === leftId);
    const right = uploads.find(u => u.id === rightId);
    
    if (left && right) {
      setLeftAnalysis(left);
      setRightAnalysis(right);
      toast.success('Comparison loaded');
    } else {
      toast.error('One or both analyses not found');
    }
    
    setComparing(false);
  };

  const handleCompare = () => {
    if (!leftId || !rightId) {
      toast.error('Please select both analyses to compare');
      return;
    }

    if (leftId === rightId) {
      toast.error('Please select different analyses');
      return;
    }

    loadComparison();
    
    // Update URL
    router.push(`/compare?left=${leftId}&right=${rightId}`);
  };

  const resetComparison = () => {
    setLeftId('');
    setRightId('');
    setLeftAnalysis(null);
    setRightAnalysis(null);
    router.push('/compare');
  };

  const getBiasTypeColor = (type) => {
    const colors = {
      gender_bias: 'bg-pink-100 text-pink-800 border-pink-300',
      department_discrimination: 'bg-purple-100 text-purple-800 border-purple-300',
      socioeconomic_bias: 'bg-orange-100 text-orange-800 border-orange-300',
      academic_elitism: 'bg-blue-100 text-blue-800 border-blue-300',
      caste_community_indicators: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const calculateDifference = () => {
    if (!leftAnalysis || !rightAnalysis) return null;

    const leftBiasTypes = new Set((leftAnalysis.analysis?.patterns || []).map(p => p.type));
    const rightBiasTypes = new Set((rightAnalysis.analysis?.patterns || []).map(p => p.type));

    const onlyInLeft = [...leftBiasTypes].filter(t => !rightBiasTypes.has(t));
    const onlyInRight = [...rightBiasTypes].filter(t => !leftBiasTypes.has(t));
    const inBoth = [...leftBiasTypes].filter(t => rightBiasTypes.has(t));

    const leftCount = leftAnalysis.analysis?.patterns?.length || 0;
    const rightCount = rightAnalysis.analysis?.patterns?.length || 0;
    const difference = rightCount - leftCount;

    const leftConfidence = leftAnalysis.analysis?.confidence || 0;
    const rightConfidence = rightAnalysis.analysis?.confidence || 0;
    const confidenceDiff = rightConfidence - leftConfidence;

    return {
      onlyInLeft,
      onlyInRight,
      inBoth,
      patternDifference: difference,
      confidenceDifference: confidenceDiff,
      leftHasBias: leftAnalysis.analysis?.biasDetected,
      rightHasBias: rightAnalysis.analysis?.biasDetected
    };
  };

  const diff = calculateDifference();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <ScrollReveal animation="fade-down">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              Compare Analyses
            </h1>
            <p className="text-gray-600">
              Side-by-side comparison of two email bias analyses
            </p>
          </div>
        </ScrollReveal>

        {/* Selection Section */}
        <ScrollReveal animation="fade-up">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Analyses to Compare</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {/* Left Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-blue-600">🔵</span>
                  <span>First Analysis</span>
                </label>
                <select
                  value={leftId}
                  onChange={(e) => setLeftId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none transition text-gray-900 font-medium bg-white"
                  style={{ color: leftId ? '#111827' : '#6B7280' }}
                >
                  <option value="" className="text-gray-500">Select an analysis...</option>
                  {uploads.map(upload => (
                    <option key={upload.id} value={upload.id} className="text-gray-900">
                      {upload.fileName} - {new Date(upload.timestamp).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Right Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-purple-600">🟣</span>
                  <span>Second Analysis</span>
                </label>
                <select
                  value={rightId}
                  onChange={(e) => setRightId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none transition text-gray-900 font-medium bg-white"
                  style={{ color: rightId ? '#111827' : '#6B7280' }}
                >
                  <option value="" className="text-gray-500">Select an analysis...</option>
                  {uploads.map(upload => (
                    <option key={upload.id} value={upload.id} className="text-gray-900">
                      {upload.fileName} - {new Date(upload.timestamp).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleCompare}
                  disabled={!leftId || !rightId || comparing}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg flex items-center justify-center gap-2"
                >
                  <span>🔍</span>
                  <span>Compare</span>
                </button>
                
                {(leftAnalysis || rightAnalysis) && (
                  <button
                    onClick={resetComparison}
                    className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition transform hover:scale-105"
                    title="Reset comparison"
                  >
                    🔄
                  </button>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Comparison Results */}
        {leftAnalysis && rightAnalysis && diff && (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <ScrollReveal animation="zoom-in" delay={0}>
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-sm text-gray-600 mb-1">Pattern Difference</div>
                  <div className={`text-3xl font-black ${
                    diff.patternDifference > 0 ? 'text-red-600' :
                    diff.patternDifference < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {diff.patternDifference > 0 ? '+' : ''}{diff.patternDifference}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="zoom-in" delay={100}>
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-sm text-gray-600 mb-1">Confidence Change</div>
                  <div className={`text-3xl font-black ${
                    diff.confidenceDifference > 0 ? 'text-green-600' :
                    diff.confidenceDifference < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {diff.confidenceDifference > 0 ? '+' : ''}{diff.confidenceDifference}%
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="zoom-in" delay={200}>
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-sm text-gray-600 mb-1">Common Patterns</div>
                  <div className="text-3xl font-black text-purple-600">
                    {diff.inBoth.length}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="zoom-in" delay={300}>
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-sm text-gray-600 mb-1">Status Change</div>
                  <div className="text-2xl font-black text-gray-900">
                    {!diff.leftHasBias && !diff.rightHasBias ? '✅ Both Clean' :
                     diff.leftHasBias && diff.rightHasBias ? '⚠️ Both Biased' :
                     !diff.leftHasBias && diff.rightHasBias ? '❌ Got Worse' :
                     '✅ Improved'}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Insights */}
            {(diff.onlyInLeft.length > 0 || diff.onlyInRight.length > 0) && (
              <ScrollReveal animation="fade-up">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Key Differences</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {diff.onlyInLeft.length > 0 && (
                      <div>
                        <div className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <span>🔵</span>
                          <span>Only in First Analysis</span>
                        </div>
                        <div className="space-y-2">
                          {diff.onlyInLeft.map(type => (
                            <div key={type} className={`text-sm px-3 py-2 rounded-lg border-2 ${getBiasTypeColor(type)}`}>
                              {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {diff.onlyInRight.length > 0 && (
                      <div>
                        <div className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                          <span>🟣</span>
                          <span>Only in Second Analysis</span>
                        </div>
                        <div className="space-y-2">
                          {diff.onlyInRight.map(type => (
                            <div key={type} className={`text-sm px-3 py-2 rounded-lg border-2 ${getBiasTypeColor(type)}`}>
                              {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {diff.inBoth.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-blue-300">
                      <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <span>🔗</span>
                        <span>Common Bias Types (Found in Both)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {diff.inBoth.map(type => (
                          <span key={type} className={`text-sm px-3 py-1 rounded-lg border ${getBiasTypeColor(type)}`}>
                            {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )}

            {/* Side by Side Comparison */}
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Left Analysis */}
              <ScrollReveal animation="fade-right">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-300 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <span>🔵</span>
                      <span>First Analysis</span>
                    </h3>
                    {leftAnalysis.analysis?.biasDetected ? (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                        ⚠️ Biased
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                        ✅ Clean
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Title</div>
                      <div className="font-semibold text-gray-900">{leftAnalysis.fileName}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Date</div>
                      <div className="text-gray-900">
                        {new Date(leftAnalysis.timestamp).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Confidence Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all"
                            style={{ width: `${leftAnalysis.analysis?.confidence || 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-blue-600">
                          {leftAnalysis.analysis?.confidence || 0}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-2">Detected Patterns ({leftAnalysis.analysis?.patterns?.length || 0})</div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {leftAnalysis.analysis?.patterns?.length > 0 ? (
                          leftAnalysis.analysis.patterns.map((pattern, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                              <div className="flex items-start justify-between mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${getBiasTypeColor(pattern.type)}`}>
                                  {pattern.type?.replace(/_/g, ' ')}
                                </span>
                                <span className={`text-xs font-bold ${getSeverityColor(pattern.severity)}`}>
                                  {pattern.severity?.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 italic mb-1">
                                "{pattern.evidence?.substring(0, 60)}..."
                              </div>
                              <div className="text-xs text-gray-600">
                                {pattern.reasoning?.substring(0, 100)}...
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-4">
                            No bias patterns detected
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/analysis/${leftAnalysis.id}`)}
                      className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 transition"
                    >
                      View Full Analysis →
                    </button>
                  </div>
                </div>
              </ScrollReveal>

              {/* Right Analysis */}
              <ScrollReveal animation="fade-left">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-300 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <span>🟣</span>
                      <span>Second Analysis</span>
                    </h3>
                    {rightAnalysis.analysis?.biasDetected ? (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                        ⚠️ Biased
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                        ✅ Clean
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Title</div>
                      <div className="font-semibold text-gray-900">{rightAnalysis.fileName}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Date</div>
                      <div className="text-gray-900">
                        {new Date(rightAnalysis.timestamp).toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Confidence Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-purple-600 h-3 rounded-full transition-all"
                            style={{ width: `${rightAnalysis.analysis?.confidence || 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-purple-600">
                          {rightAnalysis.analysis?.confidence || 0}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-2">Detected Patterns ({rightAnalysis.analysis?.patterns?.length || 0})</div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {rightAnalysis.analysis?.patterns?.length > 0 ? (
                          rightAnalysis.analysis.patterns.map((pattern, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                              <div className="flex items-start justify-between mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded ${getBiasTypeColor(pattern.type)}`}>
                                  {pattern.type?.replace(/_/g, ' ')}
                                </span>
                                <span className={`text-xs font-bold ${getSeverityColor(pattern.severity)}`}>
                                  {pattern.severity?.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 italic mb-1">
                                "{pattern.evidence?.substring(0, 60)}..."
                              </div>
                              <div className="text-xs text-gray-600">
                                {pattern.reasoning?.substring(0, 100)}...
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-4">
                            No bias patterns detected
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/analysis/${rightAnalysis.id}`)}
                      className="w-full bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-200 transition"
                    >
                      View Full Analysis →
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Export Comparison */}
            <ScrollReveal animation="fade-up" delay={200}>
              <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Export Comparison</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const content = `
BIASBREAKER COMPARISON REPORT
Generated: ${new Date().toLocaleString()}

=== FIRST ANALYSIS ===
Title: ${leftAnalysis.fileName}
Date: ${new Date(leftAnalysis.timestamp).toLocaleString()}
Status: ${leftAnalysis.analysis?.biasDetected ? 'Bias Detected' : 'Clean'}
Confidence: ${leftAnalysis.analysis?.confidence}%
Patterns: ${leftAnalysis.analysis?.patterns?.length || 0}

=== SECOND ANALYSIS ===
Title: ${rightAnalysis.fileName}
Date: ${new Date(rightAnalysis.timestamp).toLocaleString()}
Status: ${rightAnalysis.analysis?.biasDetected ? 'Bias Detected' : 'Clean'}
Confidence: ${rightAnalysis.analysis?.confidence}%
Patterns: ${rightAnalysis.analysis?.patterns?.length || 0}

=== COMPARISON SUMMARY ===
Pattern Difference: ${diff.patternDifference}
Confidence Difference: ${diff.confidenceDifference}%
Common Patterns: ${diff.inBoth.length}
Status: ${!diff.leftHasBias && !diff.rightHasBias ? 'Both Clean' :
          diff.leftHasBias && diff.rightHasBias ? 'Both Biased' :
          !diff.leftHasBias && diff.rightHasBias ? 'Got Worse' : 'Improved'}

=== UNIQUE TO FIRST ===
${diff.onlyInLeft.join(', ') || 'None'}

=== UNIQUE TO SECOND ===
${diff.onlyInRight.join(', ') || 'None'}

=== COMMON BIAS TYPES ===
${diff.inBoth.join(', ') || 'None'}
                      `.trim();
                      
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `comparison-${Date.now()}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('📄 Comparison report exported!');
                    }}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition transform hover:scale-105 shadow-lg"
                  >
                    📄 Export as Text
                  </button>
                  
                  <button
                    onClick={() => {
                      const csv = `Field,First Analysis,Second Analysis\n` +
                        `Title,"${leftAnalysis.fileName}","${rightAnalysis.fileName}"\n` +
                        `Status,${leftAnalysis.analysis?.biasDetected ? 'Biased' : 'Clean'},${rightAnalysis.analysis?.biasDetected ? 'Biased' : 'Clean'}\n` +
                        `Confidence,${leftAnalysis.analysis?.confidence}%,${rightAnalysis.analysis?.confidence}%\n` +
                        `Patterns,${leftAnalysis.analysis?.patterns?.length || 0},${rightAnalysis.analysis?.patterns?.length || 0}\n` +
                        `Difference,,${diff.patternDifference}\n` +
                        `Common Patterns,,${diff.inBoth.length}`;
                      
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `comparison-${Date.now()}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('📊 CSV exported!');
                    }}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition transform hover:scale-105 shadow-lg"
                  >
                    📊 Export as CSV
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </>
        )}

        {/* Empty State */}
        {!leftAnalysis && !rightAnalysis && uploads.length === 0 && (
          <ScrollReveal animation="zoom-in">
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Analyses Available</h3>
              <p className="text-gray-600 mb-6">
                You need at least 2 analyzed emails to use the comparison feature
              </p>
              <button
                onClick={() => router.push('/upload')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105 shadow-lg"
              >
                📤 Upload Emails
              </button>
            </div>
          </ScrollReveal>
        )}

        {!leftAnalysis && !rightAnalysis && uploads.length > 0 && (
          <ScrollReveal animation="zoom-in">
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
              <div className="text-6xl mb-4 animate-bounce">👆</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Two Analyses</h3>
              <p className="text-gray-600">
                Choose two analyses from the dropdowns above to compare them side-by-side
              </p>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}

export default function Compare() {
  return (
    <ProtectedRoute>
      <CompareContent />
    </ProtectedRoute>
  );
}
