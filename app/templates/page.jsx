'use client'
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { emailTemplates, getAllTemplates, searchTemplates } from '@/lib/data/emailTemplates';
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

function TemplatesContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('biased');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { id: 'biased', name: 'Biased Examples', icon: '⚠️', color: 'red', count: emailTemplates.biased.templates.length },
    { id: 'fair', name: 'Fair Examples', icon: '✅', color: 'green', count: emailTemplates.fair.templates.length },
    { id: 'borderline', name: 'Borderline Cases', icon: '⚡', color: 'yellow', count: emailTemplates.borderline.templates.length }
  ];

  const getCurrentTemplates = () => {
    if (searchQuery) {
      return searchTemplates(searchQuery);
    }
    return emailTemplates[activeCategory]?.templates || [];
  };

  const handleUseTemplate = async (template) => {
    localStorage.setItem('pendingEmailUpload', JSON.stringify({
      title: template.title,
      content: template.content
    }));
    
    toast.success('Template loaded! Redirecting to upload page...');
    
    setTimeout(() => {
      router.push('/upload');
    }, 1000);
  };

  const handleQuickTest = async (template) => {
    const loadingToast = toast.loading('🤖 Quick analyzing with Gemini AI...');

    try {
      const { ref, push, set } = await import('firebase/database');
      const { db } = await import('@/lib/firebase');

      // Call API route for analysis instead of direct import
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText: template.content })
      });

      if (!response.ok) {
        throw new Error('Analysis API failed');
      }

      const result = await response.json();
      const analysis = result.analysis;

      const uploadsRef = ref(db, `uploads/${user.uid}`);
      const newUploadRef = push(uploadsRef);
      
      const uploadData = {
        fileName: `Template: ${template.title}`,
        emailText: template.content,
        timestamp: Date.now(),
        status: 'completed',
        analysis: analysis,
        createdAt: new Date().toISOString(),
        analyzedAt: new Date().toISOString(),
        fromTemplate: true
      };

      await set(newUploadRef, uploadData);

      toast.success(
        `✅ Analyzed! ${analysis.biasDetected ? `Found ${analysis.patterns?.length || 0} bias patterns` : 'No bias detected'}`,
        { id: loadingToast, duration: 5000 }
      );

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Quick test error:', error);
      toast.error('Analysis failed. Please try again.', { id: loadingToast });
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      case 'none': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const templates = getCurrentTemplates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <ScrollReveal animation="fade-down">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
              Email Templates Library
            </h1>
            <p className="text-xl text-gray-600">
              Pre-written examples to understand bias patterns and test the AI
            </p>
          </div>
        </ScrollReveal>

        {/* Search Bar */}
        <ScrollReveal animation="fade-up">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-4 pl-12 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none transition-all text-gray-900 font-medium shadow-lg"
              />
              <svg className="absolute left-4 top-5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Category Tabs */}
        {!searchQuery && (
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {categories.map((cat, index) => (
              <ScrollReveal key={cat.id} animation="zoom-in" delay={index * 100}>
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
                    activeCategory === cat.id
                      ? cat.color === 'red' ? 'bg-red-600 text-white shadow-xl scale-105' :
                        cat.color === 'green' ? 'bg-green-600 text-white shadow-xl scale-105' :
                        'bg-yellow-500 text-white shadow-xl scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 shadow-lg'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className={`min-w-[32px] px-2.5 py-1 rounded-full text-sm font-black text-center ${
                    activeCategory === cat.id 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Category Description */}
        {!searchQuery && (
          <ScrollReveal animation="fade-up">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border-l-4 border-blue-500 shadow-lg">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                {emailTemplates[activeCategory]?.category}
              </h3>
              <p className="text-gray-600">
                {emailTemplates[activeCategory]?.description}
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* Templates Grid */}
        {templates.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {templates.map((template, index) => (
              <ScrollReveal 
                key={template.id} 
                animation={index % 2 === 0 ? 'fade-right' : 'fade-left'}
                delay={index * 100}
              >
                <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                  
                  {/* Template Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {template.title}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getSeverityColor(template.severity)} shadow-md`}>
                          {template.severity} Severity
                        </span>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-300">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Content Preview */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 max-h-32 overflow-hidden relative border border-gray-200">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {template.content.substring(0, 200)}...
                    </pre>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-100 to-transparent"></div>
                  </div>

                  {/* Learning Point */}
                  {template.learningPoint && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-lg shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold text-lg flex-shrink-0">💡</span>
                        <div>
                          <p className="text-sm text-yellow-800 font-medium">
                            <strong className="font-bold">Learning:</strong> {template.learningPoint}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expected Bias Types */}
                  {template.expectedBias && template.expectedBias.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-bold text-gray-600 mb-2">Expected Bias Types:</div>
                      <div className="flex flex-wrap gap-2">
                        {template.expectedBias.map((bias) => (
                          <span key={bias} className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-lg border border-red-200 font-semibold">
                            {bias.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowPreview(true);
                      }}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 hover:border-gray-300"
                    >
                      👁️ Preview
                    </button>
                    
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      📝 Use Template
                    </button>
                    
                    <button
                      onClick={() => handleQuickTest(template)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      ⚡ Quick Test
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal animation="zoom-in">
            <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
              <div className="text-8xl mb-6 animate-bounce">🔍</div>
              <h3 className="text-3xl font-black text-gray-900 mb-3">No templates found</h3>
              <p className="text-gray-600 text-lg">Try a different search term or category</p>
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn">
            
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-gray-900 mb-3">
                    {selectedTemplate.title}
                  </h2>
                  <div className="flex gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${getSeverityColor(selectedTemplate.severity)}`}>
                      {selectedTemplate.severity}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {selectedTemplate.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 border-2 border-gray-200 shadow-inner">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                  {selectedTemplate.content}
                </pre>
              </div>

              {selectedTemplate.learningPoint && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-xl mb-6 shadow-md">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 text-2xl">💡</span>
                    <div>
                      <div className="font-bold text-yellow-900 mb-2 text-lg">Learning Point:</div>
                      <p className="text-yellow-800">{selectedTemplate.learningPoint}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate.expectedBias && selectedTemplate.expectedBias.length > 0 && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 shadow-md">
                  <div className="font-bold text-red-900 mb-3 text-lg">Expected Bias Detection:</div>
                  <div className="space-y-2">
                    {selectedTemplate.expectedBias.map((bias) => (
                      <div key={bias} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-red-200">
                        <span className="text-red-600 text-xl">⚠️</span>
                        <span className="text-red-800 font-semibold">{bias.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t-2 border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  handleUseTemplate(selectedTemplate);
                  setShowPreview(false);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                📝 Use This Template
              </button>
              
              <button
                onClick={() => {
                  handleQuickTest(selectedTemplate);
                  setShowPreview(false);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ⚡ Quick Test Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function Templates() {
  return (
    <ProtectedRoute>
      <TemplatesContent />
    </ProtectedRoute>
  );
}
