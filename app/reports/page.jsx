'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { exportAllReportsPDF, exportDetailedCSV } from '@/lib/utils/exportUtils';
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

// Animated Chart Wrapper
function AnimatedChart({ children, delay = 0 }) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.2, once: true });
  
  return (
    <div
      ref={ref}
      className={`transform transition-all duration-1000 ease-out ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function ReportsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const uploadsRef = ref(db, `uploads/${user.uid}`);
      
      onValue(uploadsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const uploadsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setUploads(uploadsArray.filter(u => u.status === 'completed'));
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handleExportPDF = () => {
    const loadingToast = toast.loading('Generating PDF report...');
    try {
      // Transform analytics to match expected format
      const stats = {
        total: analytics.total,
        withBias: analytics.biasDetected,
        withoutBias: analytics.clean,
        avgConfidence: analytics.avgConfidence
      };
      exportAllReportsPDF(uploads, stats);
      toast.success('PDF exported successfully!', { id: loadingToast });
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF', { id: loadingToast });
    }
  };

  const handleExportCSV = () => {
    const loadingToast = toast.loading('Generating CSV file...');
    try {
      exportDetailedCSV(uploads);
      toast.success('CSV exported successfully!', { id: loadingToast });
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV', { id: loadingToast });
    }
  };

  // Analytics calculations
  const analytics = {
    total: uploads.length,
    biasDetected: uploads.filter(u => u.analysis?.biasDetected).length,
    clean: uploads.filter(u => !u.analysis?.biasDetected).length,
    avgConfidence: uploads.length > 0 
      ? Math.round(uploads.reduce((sum, u) => sum + (u.analysis?.confidence || 0), 0) / uploads.length)
      : 0
  };

  // Pie chart data
  const pieData = [
    { name: 'Bias Detected', value: analytics.biasDetected, color: '#EF4444' },
    { name: 'Clean Emails', value: analytics.clean, color: '#10B981' }
  ];

  // Bar chart - bias types
  const biasTypes = {};
  uploads.forEach(upload => {
    if (upload.analysis?.patterns) {
      upload.analysis.patterns.forEach(pattern => {
        const type = pattern.type || 'unknown';
        biasTypes[type] = (biasTypes[type] || 0) + 1;
      });
    }
  });

  const barData = Object.keys(biasTypes).map(type => ({
    name: type.replace(/_/g, ' ').substring(0, 15),
    count: biasTypes[type]
  }));

  // Line chart - 7 day trend
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    
    const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
    const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();
    
    const dayUploads = uploads.filter(u => 
      u.timestamp >= dayStart && u.timestamp <= dayEnd
    );
    
    last7Days.push({
      date: dateStr,
      bias: dayUploads.filter(u => u.analysis?.biasDetected).length,
      clean: dayUploads.filter(u => !u.analysis?.biasDetected).length
    });
  }

  // Horizontal bar - severity
  const severityCounts = { high: 0, medium: 0, low: 0 };
  uploads.forEach(upload => {
    if (upload.analysis?.patterns) {
      upload.analysis.patterns.forEach(pattern => {
        const sev = pattern.severity?.toLowerCase();
        if (severityCounts.hasOwnProperty(sev)) {
          severityCounts[sev]++;
        }
      });
    }
  });

  const severityData = [
    { name: 'High', count: severityCounts.high, color: '#EF4444' },
    { name: 'Medium', count: severityCounts.medium, color: '#F59E0B' },
    { name: 'Low', count: severityCounts.low, color: '#3B82F6' }
  ];

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
            <p className="text-gray-600 font-medium">Loading reports...</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Analytics & Reports
              </h1>
              <p className="text-gray-600">
                Comprehensive bias detection insights and trends
              </p>
            </div>
          </div>
        </ScrollReveal>

        {uploads.length === 0 ? (
          <ScrollReveal animation="zoom-in">
            <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
              <div className="text-6xl mb-4 animate-bounce">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600 mb-6">
                Upload and analyze emails to generate reports
              </p>
              <button
                onClick={() => router.push('/upload')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Upload First Email
              </button>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <ScrollReveal animation="zoom-in" delay={0}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-4xl group-hover:scale-110 transition-transform">📊</div>
                    <div className="text-xs font-semibold text-gray-500">Total</div>
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {analytics.total}
                  </div>
                  <div className="text-sm text-gray-600">Analyzed</div>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="zoom-in" delay={100}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-4xl group-hover:scale-110 transition-transform">⚠️</div>
                    <div className="text-xs font-semibold text-gray-500">Issues</div>
                  </div>
                  <div className="text-3xl font-black text-red-600 mb-1">
                    {analytics.biasDetected}
                  </div>
                  <div className="text-sm text-gray-600">With Bias</div>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="zoom-in" delay={200}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-4xl group-hover:scale-110 transition-transform">✅</div>
                    <div className="text-xs font-semibold text-gray-500">Clean</div>
                  </div>
                  <div className="text-3xl font-black text-green-600 mb-1">
                    {analytics.clean}
                  </div>
                  <div className="text-sm text-gray-600">No Bias</div>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="zoom-in" delay={300}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-4xl group-hover:scale-110 transition-transform">🎯</div>
                    <div className="text-xs font-semibold text-gray-500">Accuracy</div>
                  </div>
                  <div className="text-3xl font-black text-blue-600 mb-1">
                    {analytics.avgConfidence}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
              </ScrollReveal>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              
              {/* Pie Chart */}
              <AnimatedChart delay={0}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={200}
                        animationDuration={800}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </AnimatedChart>

              {/* Bar Chart */}
              <AnimatedChart delay={100}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Bias Types Detected</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="count" 
                        fill="#3B82F6" 
                        animationBegin={300}
                        animationDuration={800}
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </AnimatedChart>

              {/* Line Chart */}
              <AnimatedChart delay={200}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">7-Day Trend</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={last7Days}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="bias" 
                        stroke="#EF4444" 
                        strokeWidth={2}
                        name="Bias Detected"
                        animationBegin={400}
                        animationDuration={1000}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="clean" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Clean"
                        animationBegin={600}
                        animationDuration={1000}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </AnimatedChart>

              {/* Horizontal Bar Chart */}
              <AnimatedChart delay={300}>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Severity Breakdown</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={severityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar 
                        dataKey="count" 
                        animationBegin={500}
                        animationDuration={800}
                        radius={[0, 8, 8, 0]}
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </AnimatedChart>
            </div>

            {/* Recent Analysis Table */}
            <ScrollReveal animation="fade-up">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Analysis</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <span>📄</span>
                      <span>Export PDF Report</span>
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <span>📊</span>
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-gray-700">Email Title</th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">Date</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-700">Status</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-700">Confidence</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-700">Patterns</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploads.slice(0, 10).map((upload, index) => (
                        <tr 
                          key={upload.id} 
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors animate-fade-in"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {upload.fileName || 'Untitled'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(upload.timestamp).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {upload.analysis?.biasDetected ? (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                                🔥 Bias
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                ✅ Clean
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-gray-900">
                            {upload.analysis?.confidence || 0}%
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-gray-900">
                            {upload.analysis?.patterns?.length || 0}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => router.push(`/analysis/${upload.id}`)}
                              className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                            >
                              View Details →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}
