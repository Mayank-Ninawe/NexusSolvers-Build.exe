'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ref, onValue, query, orderByChild, remove, set, push } from 'firebase/database';
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

// Demo Data
const demoEmails = [
  {
    fileName: "Gender Bias - Tech Role",
    emailText: "Subject: Software Engineer Position - TechCorp\n\nDear Sir,\n\nTechCorp is pleased to announce openings for Software Engineer positions. We are looking for talented young men who can handle the demanding nature of this role. The ideal candidate should be aggressive in problem-solving and comfortable working late nights without family obligations.\n\nHe should demonstrate strong leadership qualities and have a commanding presence in team meetings. The candidate must be willing to travel extensively without domestic constraints.\n\nRequirements:\n- Male candidates preferred\n- Must be single or without family responsibilities\n- Aggressive communication style\n- Authoritative personality\n\nInterested gentlemen may apply.\n\nBest regards,\nHR Team - TechCorp",
    analysis: {
      biasDetected: true,
      confidence: 99,
      patterns: [
        {
          type: "gender_bias",
          severity: "High",
          evidence: "Dear Sir, young men, He should, gentlemen",
          reasoning: "Uses exclusively masculine pronouns and male-coded language (aggressive, commanding), discriminates based on marital status."
        }
      ]
    }
  },
  {
    fileName: "test2.txt",
    emailText: "Dear Students,\n\nWe welcome all students regardless of branch or background. Our company believes in equal opportunity and merit-based selection.\n\nBest regards",
    analysis: {
      biasDetected: false,
      confidence: 100,
      patterns: []
    }
  },
  {
    fileName: "test1.txt",
    emailText: "Dear Sir, We need CS students only with 9.0 CGPA. Must own vehicle and laptop. He should be ready to work without family constraints.",
    analysis: {
      biasDetected: true,
      confidence: 95,
      patterns: [
        {
          type: "gender_bias",
          severity: "Medium",
          evidence: "Dear Sir, He should",
          reasoning: "Uses masculine pronouns and gendered greeting"
        },
        {
          type: "department_discrimination",
          severity: "High",
          evidence: "CS students only",
          reasoning: "Explicitly restricts to Computer Science students"
        },
        {
          type: "academic_elitism",
          severity: "High",
          evidence: "9.0 CGPA",
          reasoning: "High CGPA cutoff excludes many qualified candidates"
        }
      ]
    }
  },
  {
    fileName: "test3.txt",
    emailText: "Premium hostel students preferred. Must own vehicle and expensive laptop. Family background verification required.",
    analysis: {
      biasDetected: true,
      confidence: 100,
      patterns: [
        {
          type: "socioeconomic_bias",
          severity: "High",
          evidence: "Premium hostel students, own vehicle, expensive laptop",
          reasoning: "Multiple financial barriers that discriminate based on economic status"
        },
        {
          type: "socioeconomic_bias",
          severity: "High",
          evidence: "Family background verification",
          reasoning: "Indirect caste/class discrimination through family checks"
        }
      ]
    }
  },
  {
    fileName: "Accenture Business Analyst - Moderate Bias",
    emailText: "Subject: Business Analyst Position\n\nDear Students,\n\nAccenture is hiring Business Analysts. Preferred Qualifications: - CS, IT, or MBA students - CGPA above 8.5 - Premium institute background preferred.\n\nBest regards",
    analysis: {
      biasDetected: true,
      confidence: 72,
      patterns: [
        {
          type: "department_discrimination",
          severity: "Medium",
          evidence: "CS, IT, or MBA students",
          reasoning: "Preference for specific branches"
        },
        {
          type: "academic_elitism",
          severity: "Medium",
          evidence: "Premium institute background preferred",
          reasoning: "Institute-based discrimination"
        }
      ]
    }
  },
  {
    fileName: "Microsoft Full Stack Developer - Clean",
    emailText: "Subject: Full Stack Developer Opening\n\nHello Engineering Students,\n\nMicrosoft is hiring Full Stack Developers for our Bangalore office. Eligibility: All engineering branches welcome, Basic programming knowledge required.\n\nWe believe in diversity and equal opportunity.\n\nBest regards",
    analysis: {
      biasDetected: false,
      confidence: 100,
      patterns: []
    }
  },
  {
    fileName: "Amazon SDE Intern - Clean Email",
    emailText: "Subject: Software Development Engineer Intern\n\nDear Students,\n\nAmazon is excited to announce SDE internship opportunities for all engineering students. We welcome applications from students of all branches and backgrounds.\n\nSelection based purely on skills and problem-solving ability.\n\nBest regards",
    analysis: {
      biasDetected: false,
      confidence: 99,
      patterns: []
    }
  },
  {
    fileName: "HDFC Bank Management Trainee - Socioeconomic",
    emailText: "Subject: Management Trainee Program\n\nDear Students,\n\nHDFC Bank invites applications for Management Trainee positions. Eligibility: - Students from AC hostels preferred - Must own personal vehicle - Training bond: Rs. 50,000 (non-refundable)\n\nRegards",
    analysis: {
      biasDetected: true,
      confidence: 92,
      patterns: [
        {
          type: "socioeconomic_bias",
          severity: "High",
          evidence: "AC hostels preferred, own personal vehicle, Rs. 50,000 bond",
          reasoning: "Multiple financial barriers that exclude economically weaker students"
        }
      ]
    }
  },
  {
    fileName: "Infosys Marketing Role - Gender Bias",
    emailText: "Subject: Marketing Executive Opening\n\nHello Students,\n\nWe are looking for confident young men for our Marketing Executive position. He should be aggressive in sales and comfortable with extensive travel.\n\nInterested candidates may apply.\n\nRegards",
    analysis: {
      biasDetected: true,
      confidence: 95,
      patterns: [
        {
          type: "gender_bias",
          severity: "High",
          evidence: "young men, He should, aggressive",
          reasoning: "Male-coded language and masculine pronouns exclude women"
        }
      ]
    }
  },
  {
    fileName: "TCS Software Developer - High Bias",
    emailText: "Subject: Software Developer Position - TCS\n\nDear Sir,\n\nWe invite only CS and IT students with CGPA above 9.0 from Premium Hostel A. The ideal candidate should be a male student without family responsibilities.\n\nRegards",
    analysis: {
      biasDetected: true,
      confidence: 98,
      patterns: [
        {
          type: "gender_bias",
          severity: "High",
          evidence: "Dear Sir, male student",
          reasoning: "Explicitly mentions male preference"
        },
        {
          type: "department_discrimination",
          severity: "High",
          evidence: "only CS and IT students",
          reasoning: "Restricts to specific branches"
        },
        {
          type: "academic_elitism",
          severity: "High",
          evidence: "CGPA above 9.0",
          reasoning: "Very high CGPA cutoff"
        },
        {
          type: "socioeconomic_bias",
          severity: "High",
          evidence: "Premium Hostel A",
          reasoning: "Hostel-based discrimination"
        }
      ]
    }
  },
  {
    fileName: "Google Data Scientist - Academic Elitism",
    emailText: "Subject: Data Scientist Position\n\nHi Students,\n\nGoogle is hiring for Data Scientist roles. Strict Requirements: - CGPA: Minimum 9.5 (no exceptions) - Only IIT/NIT students - Published research papers mandatory.\n\nBest regards",
    analysis: {
      biasDetected: true,
      confidence: 97,
      patterns: [
        {
          type: "academic_elitism",
          severity: "High",
          evidence: "CGPA 9.5, Only IIT/NIT, research papers mandatory",
          reasoning: "Unrealistic academic requirements that eliminate majority of qualified candidates"
        }
      ]
    }
  }
];

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDemoTools, setShowDemoTools] = useState(false);

  useEffect(() => {
    if (user) {
      loadUploads();
    }
  }, [user]);

  const loadUploads = () => {
    const uploadsRef = ref(db, `uploads/${user.uid}`);
    const uploadsQuery = query(uploadsRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(uploadsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const uploadsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp);
        setUploads(uploadsArray);
      } else {
        setUploads([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  };

  const handleDelete = async (uploadId) => {
    if (confirm('Are you sure you want to delete this analysis?')) {
      try {
        const uploadRef = ref(db, `uploads/${user.uid}/${uploadId}`);
        await remove(uploadRef);
        toast.success('Analysis deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete analysis');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (uploads.length === 0) {
      toast.error('No uploads to delete');
      return;
    }

    if (confirm(`Are you sure you want to delete ALL ${uploads.length} analyses? This cannot be undone!`)) {
      const loadingToast = toast.loading('Deleting all analyses...');
      
      try {
        const uploadsRef = ref(db, `uploads/${user.uid}`);
        await remove(uploadsRef);
        toast.success(`Successfully deleted ${uploads.length} analyses`, { id: loadingToast });
      } catch (error) {
        console.error('Delete all error:', error);
        toast.error('Failed to delete analyses', { id: loadingToast });
      }
    }
  };

  const addDemoData = async () => {
    const loadingToast = toast.loading('Adding demo data...');
    
    try {
      const uploadsRef = ref(db, `uploads/${user.uid}`);
      let addedCount = 0;

      for (const email of demoEmails) {
        const newUploadRef = push(uploadsRef);
        const uploadData = {
          fileName: email.fileName,
          emailText: email.emailText,
          timestamp: Date.now() - (demoEmails.length - addedCount) * 60000, // Stagger timestamps
          status: 'completed',
          analysis: email.analysis,
          createdAt: new Date().toISOString(),
          analyzedAt: new Date().toISOString()
        };
        
        await set(newUploadRef, uploadData);
        addedCount++;
      }

      toast.success(`✅ Added ${addedCount} demo emails!`, { id: loadingToast, duration: 3000 });
      setShowDemoTools(false);
    } catch (error) {
      console.error('Demo data error:', error);
      toast.error('Failed to add demo data', { id: loadingToast });
    }
  };

  const stats = {
    total: uploads.length,
    completed: uploads.filter(u => u.status === 'completed').length,
    biasDetected: uploads.filter(u => u.status === 'completed' && u.analysis?.biasDetected).length,
    processing: uploads.filter(u => u.status === 'analyzing').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading your dashboard...</p>
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
              Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.isAnonymous ? 'Anonymous User' : user?.email?.split('@')[0]}! Track your bias analysis progress.
            </p>
          </div>
        </ScrollReveal>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <ScrollReveal animation="zoom-in" delay={0}>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl group-hover:scale-110 transition-transform">📊</div>
                <div className="text-sm font-semibold text-gray-500">Total</div>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Emails Uploaded</div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="zoom-in" delay={100}>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl group-hover:scale-110 transition-transform">✅</div>
                <div className="text-sm font-semibold text-gray-500">Complete</div>
              </div>
              <div className="text-3xl font-black text-green-600 mb-1">
                {stats.completed}
              </div>
              <div className="text-sm text-gray-600">Analyzed</div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="zoom-in" delay={200}>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl group-hover:scale-110 transition-transform">⚠️</div>
                <div className="text-sm font-semibold text-gray-500">Issues</div>
              </div>
              <div className="text-3xl font-black text-red-600 mb-1">
                {stats.biasDetected}
              </div>
              <div className="text-sm text-gray-600">Bias Detected</div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="zoom-in" delay={300}>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className="text-4xl group-hover:scale-110 transition-transform">⏳</div>
                <div className="text-sm font-semibold text-gray-500">Queue</div>
              </div>
              <div className="text-3xl font-black text-blue-600 mb-1">
                {stats.processing}
              </div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
          </ScrollReveal>
        </div>

        {/* Quick Actions */}
        <ScrollReveal animation="fade-up">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/upload')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span>📤</span>
                <span>Upload New Email</span>
              </button>
              
              <button
                onClick={() => router.push('/reports')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-blue-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span>📊</span>
                <span>View Reports</span>
              </button>

              <button
                onClick={() => router.push('/batch-upload')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-purple-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span>📁</span>
                <span>Batch Upload</span>
              </button>

              <button
                onClick={() => router.push('/templates')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-green-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span>📧</span>
                <span>Templates</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Recent Uploads */}
        <ScrollReveal animation="fade-up">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Uploads</h2>
              <div className="flex items-center gap-3">
                {uploads.length > 0 && (
                  <>
                    <span className="text-sm text-gray-500">
                      {uploads.length} {uploads.length === 1 ? 'upload' : 'uploads'}
                    </span>
                    <button
                      onClick={handleDeleteAll}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-300"
                    >
                      <span>🗑️</span>
                      <span>Delete All</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {uploads.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 animate-bounce">📭</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Uploads Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start by uploading your first placement email for bias analysis
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => router.push('/upload')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Upload First Email
                  </button>
                  <button
                    onClick={addDemoData}
                    className="px-8 py-3 bg-white text-purple-600 font-bold rounded-xl border-2 border-purple-300 hover:border-purple-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    🎬 Add Demo Data
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {uploads.map((upload, index) => (
                  <ScrollReveal key={upload.id} animation="fade-up" delay={index * 50}>
                    <div className="group border-2 border-gray-100 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {upload.fileName || 'Untitled Email'}
                          </h3>

                          {/* Email Preview */}
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {upload.emailText?.substring(0, 150)}...
                          </p>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <span>📅</span>
                              <span>{new Date(upload.timestamp).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>🕐</span>
                              <span>{new Date(upload.timestamp).toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}</span>
                            </div>
                            {upload.status === 'completed' && upload.analysis && (
                              <div className="flex items-center gap-1">
                                <span>🎯</span>
                                <span>{upload.analysis.confidence}% confidence</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-3">
                            {upload.status === 'completed' ? (
                              <>
                                <button
                                  onClick={() => router.push(`/analysis/${upload.id}`)}
                                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                                >
                                  View Analysis →
                                </button>
                                <button
                                  onClick={() => router.push(`/compare?left=${upload.id}`)}
                                  className="text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors"
                                >
                                  Compare →
                                </button>
                                <button
                                  onClick={() => handleDelete(upload.id)}
                                  className="text-red-600 hover:text-red-700 font-semibold text-sm transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2 text-blue-600">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-semibold">Analyzing...</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="ml-4">
                          {upload.status === 'completed' && upload.analysis?.biasDetected ? (
                            <div className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap">
                              🔥 Bias Found
                            </div>
                          ) : upload.status === 'completed' ? (
                            <div className="bg-green-100 border-2 border-green-300 text-green-700 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap">
                              ✅ Clean
                            </div>
                          ) : (
                            <div className="bg-blue-100 border-2 border-blue-300 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap">
                              ⏳ Processing
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Insights Section (if uploads exist) */}
        {uploads.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <ScrollReveal animation="fade-right">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-3">⚠️</div>
                <div className="text-3xl font-black text-red-700 mb-2">
                  {Math.round((stats.biasDetected / stats.completed) * 100) || 0}%
                </div>
                <div className="text-sm font-semibold text-red-600">
                  Bias Detection Rate
                </div>
                <p className="text-xs text-red-600 mt-2">
                  {stats.biasDetected} out of {stats.completed} analyzed emails
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={100}>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-3">📊</div>
                <div className="text-3xl font-black text-blue-700 mb-2">
                  {uploads.reduce((sum, u) => sum + (u.analysis?.patterns?.length || 0), 0)}
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  Total Patterns Found
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Across all analyzed emails
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-left" delay={200}>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-3">🎯</div>
                <div className="text-3xl font-black text-green-700 mb-2">
                  {Math.round(
                    uploads
                      .filter(u => u.status === 'completed' && u.analysis?.confidence)
                      .reduce((sum, u) => sum + u.analysis.confidence, 0) / 
                    (uploads.filter(u => u.status === 'completed').length || 1)
                  )}%
                </div>
                <div className="text-sm font-semibold text-green-600">
                  Average Confidence
                </div>
                <p className="text-xs text-green-600 mt-2">
                  AI detection accuracy
                </p>
              </div>
            </ScrollReveal>
          </div>
        )}
      </div>

      {/* Floating Demo Tools Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setShowDemoTools(!showDemoTools)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 font-bold flex items-center gap-2"
        >
          <span className="text-xl">🎬</span>
          <span>Demo Tools</span>
        </button>

        {/* Demo Tools Menu */}
        {showDemoTools && (
          <div className="absolute bottom-full right-0 mb-4 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 p-4 min-w-[250px] animate-fadeInUp">
            <div className="space-y-3">
              <button
                onClick={addDemoData}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                <span className="text-xl">📧</span>
                <div className="text-left">
                  <div className="text-sm font-bold">Add Demo Emails</div>
                  <div className="text-xs opacity-90">11 sample analyses</div>
                </div>
              </button>

              {uploads.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-300"
                >
                  <span className="text-xl">🗑️</span>
                  <div className="text-left">
                    <div className="text-sm font-bold">Delete All</div>
                    <div className="text-xs opacity-90">{uploads.length} uploads</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => setShowDemoTools(false)}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
