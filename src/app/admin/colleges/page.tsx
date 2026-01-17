'use client';

import { motion } from 'framer-motion';
import { Building2, Plus, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import CollegeCard from '@/components/admin/CollegeCard';

export default function CollegesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const colleges = [
    {
      collegeName: 'JDCOEM Nagpur',
      location: 'Maharashtra',
      totalReports: 47,
      criticalCases: 12,
      lastReport: new Date(Date.now() - 2 * 60 * 60 * 1000),
      riskLevel: 'high' as const,
    },
    {
      collegeName: 'VNIT Nagpur',
      location: 'Maharashtra',
      totalReports: 23,
      criticalCases: 3,
      lastReport: new Date(Date.now() - 24 * 60 * 60 * 1000),
      riskLevel: 'medium' as const,
    },
    {
      collegeName: 'COEP Pune',
      location: 'Maharashtra',
      totalReports: 38,
      criticalCases: 8,
      lastReport: new Date(Date.now() - 5 * 60 * 60 * 1000),
      riskLevel: 'high' as const,
    },
    {
      collegeName: 'PICT Pune',
      location: 'Maharashtra',
      totalReports: 15,
      criticalCases: 2,
      lastReport: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      riskLevel: 'low' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-accent-green" />
            <h1 className="text-4xl font-black">
              College <span className="gradient-text">Management</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Manage and monitor all registered colleges</p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-cyan to-accent-green rounded-xl font-bold hover:scale-105 transition-transform">
          <Plus className="h-5 w-5" />
          Add College
        </button>
      </div>

      {/* Search & Filter */}
      <div className="glass-effect rounded-2xl p-6 border border-white/10 backdrop-blur-xl">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleges..."
              className="w-full pl-12 pr-4 py-3 bg-primary/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-accent-cyan outline-none transition-all text-white"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-colors">
            <Filter className="h-5 w-5" />
            Filters
          </button>
        </div>
      </div>

      {/* Colleges Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {colleges.map((college, index) => (
          <CollegeCard key={index} college={college} index={index} />
        ))}
      </div>
    </div>
  );
}
