'use client';

import { motion } from 'framer-motion';
import { Building2, TrendingUp, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { CollegeStats } from '@/types';

interface CollegeCardProps {
  college: CollegeStats;
  index: number;
}

export default function CollegeCard({ college, index }: CollegeCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'from-red-500 to-red-600';
      case 'high':
        return 'from-orange-500 to-orange-600';
      case 'medium':
        return 'from-yellow-500 to-yellow-600';
      case 'low':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500/10';
      case 'high':
        return 'bg-orange-500/10';
      case 'medium':
        return 'bg-yellow-500/10';
      case 'low':
        return 'bg-green-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="glass-effect rounded-2xl p-6 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRiskColor(college.riskLevel)} flex items-center justify-center`}>
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{college.collegeName}</h3>
            <p className="text-sm text-gray-400">{college.location}</p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getRiskBg(college.riskLevel)}`}>
          <span className={`bg-gradient-to-r ${getRiskColor(college.riskLevel)} bg-clip-text text-transparent`}>
            {college.riskLevel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-black text-accent-cyan mb-1">{college.totalReports}</div>
          <div className="text-xs text-gray-400 font-semibold uppercase">Reports</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-accent-pink mb-1">{college.criticalCases}</div>
          <div className="text-xs text-gray-400 font-semibold uppercase">Critical</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-accent-green mb-1">
            {college.totalReports - college.criticalCases}
          </div>
          <div className="text-xs text-gray-400 font-semibold uppercase">Resolved</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Last report: {college.lastReport.toLocaleString()}</span>
        </div>

        <button className="flex items-center gap-1 text-accent-cyan font-semibold text-sm group-hover:gap-2 transition-all">
          View Details
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
