'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ref, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { analyzeBias } from '@/lib/geminiConfig';
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

function UploadContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [fileName, setFileName] = useState('');
  const [emailText, setEmailText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Check for template loaded from templates page
  useEffect(() => {
    const pendingUpload = localStorage.getItem('pendingEmailUpload');
    if (pendingUpload) {
      try {
        const data = JSON.parse(pendingUpload);
        setFileName(data.title);
        setEmailText(data.content);
        localStorage.removeItem('pendingEmailUpload');
        toast.success('✅ Template loaded! Ready to analyze.');
      } catch (error) {
        console.error('Failed to load template:', error);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailText.trim()) {
      toast.error('Please enter email content');
      return;
    }

    setAnalyzing(true);
    const loadingToast = toast.loading('🤖 Analyzing with Gemini AI...');

    try {
      // Analyze with Gemini
      const analysis = await analyzeBias(emailText);

      // Save to Firebase
      const uploadsRef = ref(db, `uploads/${user.uid}`);
      const newUploadRef = push(uploadsRef);
      
      const uploadData = {
        fileName: fileName.trim() || 'Untitled Email',
        emailText: emailText,
        timestamp: Date.now(),
        status: 'completed',
        analysis: analysis,
        createdAt: new Date().toISOString(),
        analyzedAt: new Date().toISOString()
      };

      await set(newUploadRef, uploadData);

      toast.success(
        `✅ Analysis complete! ${analysis.biasDetected ? `Found ${analysis.patterns?.length || 0} bias patterns` : 'No bias detected'}`,
        { id: loadingToast, duration: 5000 }
      );

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.', { id: loadingToast });
      setAnalyzing(false);
    }
  };

  const biasTypes = [
    { 
      name: 'Gender Bias', 
      icon: '👥', 
      desc: 'Pronouns, gendered language',
      color: 'text-pink-600'
    },
    { 
      name: 'Department Discrimination', 
      icon: '🎓', 
      desc: 'CS/IT preference over other branches',
      color: 'text-blue-600'
    },
    { 
      name: 'Socioeconomic Bias', 
      icon: '💰', 
      desc: 'Hostel, background requirements',
      color: 'text-orange-600'
    },
    { 
      name: 'Academic Elitism', 
      icon: '📚', 
      desc: 'Unrealistic CGPA cutoffs',
      color: 'text-yellow-600'
    },
    { 
      name: 'Community Indicators', 
      icon: '🏛️', 
      desc: 'Caste/religion patterns',
      color: 'text-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <ScrollReveal animation="fade-down">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
              Upload Email for Analysis
            </h1>
            <p className="text-lg text-gray-600">
              Paste your placement email content below. Our AI will analyze it for bias patterns.
            </p>
          </div>
        </ScrollReveal>

        {/* Main Form */}
        <ScrollReveal animation="zoom-in" delay={100}>
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden">
            
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl">
                  📧
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Email Content</h2>
                  <p className="text-blue-100 text-sm">Fill in the details below</p>
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
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g., TechCorp Software Engineer Role"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 group-hover:border-gray-400 text-gray-900"
                  disabled={analyzing}
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
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 resize-none group-hover:border-gray-400 font-mono text-sm text-gray-900"
                  required
                  disabled={analyzing}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={analyzing || !emailText.trim()}
                  className="flex-1 group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  {analyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      🎯 Analyze for Bias
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  disabled={analyzing}
                  className="px-8 py-4 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-300 hover:border-gray-400 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </ScrollReveal>

        {/* What We Analyze Section */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">ℹ️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  What we analyze:
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our AI scans for these discrimination patterns using Google Gemini 2.5 Flash
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {biasTypes.map((bias, index) => (
                <ScrollReveal key={index} animation="fade-right" delay={index * 50}>
                  <div className="bg-white rounded-xl p-4 border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl group-hover:scale-110 transition-transform">
                        {bias.icon}
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold ${bias.color} mb-1`}>
                          {bias.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {bias.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
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
                    <span>Try our <button onClick={() => router.push('/templates')} className="text-blue-600 font-semibold underline hover:text-blue-700">pre-made templates</button> to test the AI</span>
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
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-green-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              📊 View Dashboard
            </button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

export default function Upload() {
  return (
    <ProtectedRoute>
      <UploadContent />
    </ProtectedRoute>
  );
}
