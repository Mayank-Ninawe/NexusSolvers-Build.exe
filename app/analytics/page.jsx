'use client'
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { db } from '@/lib/firebase';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  LineChart, Line, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
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

function AnalyticsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateRange, setDateRange] = useState('all');
  const [biasFilter, setBiasFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = () => {
    const uploadsRef = ref(db, `uploads/${user.uid}`);
    const uploadsQuery = query(uploadsRef, orderByChild('timestamp'));
    
    const unsubscribe = onValue(uploadsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const uploadsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setUploads(uploadsArray);
      } else {
        setUploads([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  };

  // Filter uploads based on selected filters
  const filteredUploads = useMemo(() => {
    let filtered = uploads.filter(u => u.status === 'completed');

    const now = Date.now();
    if (dateRange === '7days') {
      filtered = filtered.filter(u => u.timestamp >= now - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === '30days') {
      filtered = filtered.filter(u => u.timestamp >= now - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRange === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate).getTime();
      const end = new Date(customEndDate).getTime();
      filtered = filtered.filter(u => u.timestamp >= start && u.timestamp <= end);
    }

    if (biasFilter === 'biased') {
      filtered = filtered.filter(u => u.analysis?.biasDetected);
    } else if (biasFilter === 'clean') {
      filtered = filtered.filter(u => !u.analysis?.biasDetected);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(u => 
        u.analysis?.patterns?.some(p => p.severity?.toLowerCase() === severityFilter)
      );
    }

    return filtered;
  }, [uploads, dateRange, biasFilter, severityFilter, customStartDate, customEndDate]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const total = filteredUploads.length;
    const biased = filteredUploads.filter(u => u.analysis?.biasDetected).length;
    const clean = total - biased;
    
    const confidences = filteredUploads.map(u => u.analysis?.confidence || 0);
    const avgConfidence = confidences.length > 0 
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : 0;
    const maxConfidence = confidences.length > 0 ? Math.max(...confidences) : 0;
    const minConfidence = confidences.length > 0 ? Math.min(...confidences) : 0;

    const biasTypes = {};
    filteredUploads.forEach(upload => {
      if (upload.analysis?.patterns) {
        upload.analysis.patterns.forEach(pattern => {
          const type = pattern.type || 'unknown';
          biasTypes[type] = (biasTypes[type] || 0) + 1;
        });
      }
    });

    const severityCounts = { high: 0, medium: 0, low: 0 };
    filteredUploads.forEach(upload => {
      if (upload.analysis?.patterns) {
        upload.analysis.patterns.forEach(pattern => {
          const sev = pattern.severity?.toLowerCase();
          if (severityCounts.hasOwnProperty(sev)) {
            severityCounts[sev]++;
          }
        });
      }
    });

    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();
      
      const dayUploads = filteredUploads.filter(u => 
        u.timestamp >= dayStart && u.timestamp <= dayEnd
      );
      
      const biasCount = dayUploads.filter(u => u.analysis?.biasDetected).length;
      
      last30Days.push({
        date: dateStr,
        bias: biasCount,
        clean: dayUploads.length - biasCount,
        total: dayUploads.length
      });
    }

    const companies = {};
    filteredUploads.forEach(upload => {
      const fileName = upload.fileName || 'Unknown';
      const match = fileName.match(/^([^-]+)/);
      const company = match ? match[1].trim() : 'Other';
      
      if (!companies[company]) {
        companies[company] = { total: 0, biased: 0, clean: 0 };
      }
      
      companies[company].total++;
      if (upload.analysis?.biasDetected) {
        companies[company].biased++;
      } else {
        companies[company].clean++;
      }
    });

    const radarData = Object.keys(biasTypes).map(type => ({
      type: type.replace(/_/g, ' ').substring(0, 20),
      count: biasTypes[type],
      fullMark: Math.max(...Object.values(biasTypes))
    }));

    return {
      total,
      biased,
      clean,
      biasRate: total > 0 ? Math.round((biased / total) * 100) : 0,
      avgConfidence,
      maxConfidence,
      minConfidence,
      biasTypes,
      severityCounts,
      last30Days,
      companies,
      radarData
    };
  }, [filteredUploads]);

  const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4'];

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
            <p className="text-gray-600 font-medium">Loading analytics...</p>
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
              Advanced Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Deep insights into bias detection patterns and trends
            </p>
          </div>
        </ScrollReveal>

        {/* Filters Section */}
        <ScrollReveal animation="fade-up">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Filters & Controls</h2>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none transition text-gray-900 font-medium"
                >
                  <option value="all">All Time</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bias Status</label>
                <select
                  value={biasFilter}
                  onChange={(e) => setBiasFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none transition text-gray-900 font-medium"
                >
                  <option value="all">All Emails</option>
                  <option value="biased">Biased Only</option>
                  <option value="clean">Clean Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Severity Level</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none transition text-gray-900 font-medium"
                >
                  <option value="all">All Severities</option>
                  <option value="high">High Only</option>
                  <option value="medium">Medium Only</option>
                  <option value="low">Low Only</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setDateRange('all');
                    setBiasFilter('all');
                    setSeverityFilter('all');
                    setCustomStartDate('');
                    setCustomEndDate('');
                    toast.success('Filters reset');
                  }}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  🔄 Reset Filters
                </button>
              </div>
            </div>

            {dateRange === 'custom' && (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { icon: '📊', value: analytics.total, label: 'Total Analyzed', color: 'text-gray-900' },
            { icon: '⚠️', value: analytics.biased, label: 'Bias Detected', color: 'text-red-600' },
            { icon: '✅', value: analytics.clean, label: 'Clean Emails', color: 'text-green-600' },
            { icon: '📈', value: `${analytics.biasRate}%`, label: 'Bias Rate', color: 'text-purple-600' },
            { icon: '🎯', value: `${analytics.avgConfidence}%`, label: 'Avg Confidence', color: 'text-blue-600' },
            { icon: '🔥', value: analytics.severityCounts.high, label: 'High Severity', color: 'text-orange-600' }
          ].map((metric, index) => (
            <ScrollReveal key={index} animation="zoom-in" delay={index * 50}>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{metric.icon}</div>
                <div className={`text-2xl font-black ${metric.color} mb-1`}>{metric.value}</div>
                <div className="text-xs text-gray-600">{metric.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          
          {/* 30-Day Trend Area Chart */}
          <ScrollReveal animation="fade-right">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span>📈</span> 30-Day Trend Analysis
              </h2>
              <p className="text-sm text-gray-600 mb-4">Daily bias detection patterns over the last month</p>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={analytics.last30Days}>
                  <defs>
                    <linearGradient id="colorBias" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorClean" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }} 
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#374151', fontWeight: 600 }} 
                    stroke="#9CA3AF"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    labelStyle={{ color: '#1F2937', fontWeight: 'bold', marginBottom: '4px' }}
                    itemStyle={{ color: '#1F2937', fontWeight: '600' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="circle"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bias" 
                    name="Bias Detected"
                    stroke="#EF4444" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorBias)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clean" 
                    name="Clean Emails"
                    stroke="#10B981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorClean)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ScrollReveal>

          {/* Bias Types Radar Chart */}
          <ScrollReveal animation="fade-left">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span>🎯</span> Bias Types Distribution
              </h2>
              <p className="text-sm text-gray-600 mb-4">Pentagon radar showing frequency of different bias categories</p>
              {analytics.radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={analytics.radarData}>
                    <PolarGrid stroke="#E5E7EB" strokeWidth={1.5} />
                    <PolarAngleAxis 
                      dataKey="type" 
                      tick={{ fontSize: 11, fill: '#374151', fontWeight: 600 }} 
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      tick={{ fill: '#374151', fontSize: 11, fontWeight: 600 }} 
                      stroke="#9CA3AF"
                    />
                    <Radar 
                      name="Count" 
                      dataKey="count" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.65}
                      strokeWidth={2.5}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        padding: '8px 12px'
                      }}
                      labelStyle={{ color: '#1F2937', fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}
                      itemStyle={{ color: '#1F2937', fontWeight: '600', fontSize: '13px' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '12px' }}
                      iconType="circle"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="font-medium">No bias patterns detected</div>
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Company/Source Breakdown */}
          <ScrollReveal animation="fade-right" delay={100}>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Source/Company Analysis</h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {Object.entries(analytics.companies)
                  .sort(([,a], [,b]) => b.total - a.total)
                  .slice(0, 10)
                  .map(([company, data], index) => (
                    <div key={company} className="border-b border-gray-100 pb-3 animate-fadeInUp" style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{company}</span>
                        <span className="text-sm text-gray-600">{data.total} emails</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-red-500 h-2 transition-all duration-500" 
                            style={{ width: `${(data.biased / data.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-16 text-right">
                          {Math.round((data.biased / data.total) * 100)}% biased
                        </span>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Confidence Distribution */}
          <ScrollReveal animation="fade-left" delay={100}>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Confidence Score Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:scale-105 transition-transform">
                  <div>
                    <div className="text-sm text-blue-700 font-medium">Average Confidence</div>
                    <div className="text-3xl font-bold text-blue-900">{analytics.avgConfidence}%</div>
                  </div>
                  <div className="text-4xl">🎯</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200 hover:scale-105 transition-transform">
                    <div className="text-xs text-green-700 font-medium">Maximum</div>
                    <div className="text-2xl font-bold text-green-900">{analytics.maxConfidence}%</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:scale-105 transition-transform">
                    <div className="text-xs text-yellow-700 font-medium">Minimum</div>
                    <div className="text-2xl font-bold text-yellow-900">{analytics.minConfidence}%</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Model Reliability</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${analytics.avgConfidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {analytics.avgConfidence >= 90 ? 'Excellent' : 
                       analytics.avgConfidence >= 75 ? 'Very Good' :
                       analytics.avgConfidence >= 60 ? 'Good' : 'Fair'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Detailed Bias Type Breakdown */}
        <ScrollReveal animation="fade-up">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Bias Type Breakdown</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics.biasTypes)
                .sort(([,a], [,b]) => b - a)
                .map(([type, count], index) => (
                  <ScrollReveal key={type} animation="zoom-in" delay={index * 50}>
                    <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all duration-300 hover:scale-105">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">
                          {type.includes('gender') ? '👥' :
                           type.includes('department') ? '🎓' :
                           type.includes('socioeconomic') ? '💰' :
                           type.includes('academic') ? '📚' :
                           type.includes('caste') ? '🏛️' : '⚠️'}
                        </span>
                        <span className="text-2xl font-bold text-gray-900">{count}</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-800 capitalize mb-2">
                        {type.replace(/_/g, ' ')}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              index === 0 ? 'bg-red-500' :
                              index === 1 ? 'bg-orange-500' :
                              index === 2 ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${(count / Math.max(...Object.values(analytics.biasTypes))) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {Math.round((count / analytics.biased) * 100)}%
                        </span>
                      </div>
                    </div>
                  </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Insights & Recommendations */}
        <ScrollReveal animation="zoom-in">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💡 AI Insights & Recommendations</h2>
            <div className="space-y-3">
              {analytics.biasRate > 50 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded hover:scale-105 transition-transform">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 text-xl">⚠️</span>
                    <div>
                      <div className="font-bold text-red-900">High Bias Detection Rate</div>
                      <div className="text-sm text-red-800">
                        {analytics.biasRate}% of analyzed emails contain bias. This is significantly high and requires immediate attention from placement coordinators.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {analytics.severityCounts.high > 0 && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded hover:scale-105 transition-transform">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 text-xl">🔥</span>
                    <div>
                      <div className="font-bold text-orange-900">High Severity Patterns Detected</div>
                      <div className="text-sm text-orange-800">
                        Found {analytics.severityCounts.high} high-severity bias patterns. These should be reported to companies and placement cell immediately.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {analytics.avgConfidence >= 90 && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded hover:scale-105 transition-transform">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-xl">✅</span>
                    <div>
                      <div className="font-bold text-green-900">High Model Confidence</div>
                      <div className="text-sm text-green-800">
                        Average confidence of {analytics.avgConfidence}% indicates highly reliable bias detection. Results can be trusted for decision-making.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {Object.keys(analytics.biasTypes).length > 0 && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded hover:scale-105 transition-transform">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 text-xl">📊</span>
                    <div>
                      <div className="font-bold text-blue-900">Multiple Bias Types Found</div>
                      <div className="text-sm text-blue-800">
                        Detected {Object.keys(analytics.biasTypes).length} different types of bias. Most common: {
                          Object.entries(analytics.biasTypes).sort(([,a], [,b]) => b - a)[0][0].replace(/_/g, ' ')
                        }.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

export default function Analytics() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}
