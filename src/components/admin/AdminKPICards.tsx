'use client';

import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Building2, Users, Target, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminKPICards() {
  const [stats, setStats] = useState({
    totalReports: 247,
    criticalAlerts: 38,
    activeColleges: 12,
    totalUsers: 1247,
    avgAccuracy: 95,
    avgAnalysisTime: 2.8,
  });

  const cards = [
    {
      icon: TrendingUp,
      label: 'Total Reports',
      value: stats.totalReports,
      suffix: '',
      change: '+12%',
      changePositive: true,
      color: 'from-accent-cyan to-blue-500',
      iconBg: 'bg-accent-cyan/20',
    },
    {
      icon: AlertTriangle,
      label: 'Critical Alerts',
      value: stats.criticalAlerts,
      suffix: '',
      change: '-5%',
      changePositive: true,
      color: 'from-accent-pink to-pink-500',
      iconBg: 'bg-accent-pink/20',
    },
    {
      icon: Building2,
      label: 'Active Colleges',
      value: stats.activeColleges,
      suffix: '',
      change: '+3',
      changePositive: true,
      color: 'from-accent-green to-green-500',
      iconBg: 'bg-accent-green/20',
    },
    {
      icon: Users,
      label: 'Total Users',
      value: stats.totalUsers,
      suffix: '',
      change: '+89',
      changePositive: true,
      color: 'from-purple-500 to-purple-400',
      iconBg: 'bg-purple-500/20',
    },
    {
      icon: Target,
      label: 'Avg. Accuracy',
      value: stats.avgAccuracy,
      suffix: '%',
      change: '+2%',
      changePositive: true,
      color: 'from-yellow-500 to-yellow-400',
      iconBg: 'bg-yellow-500/20',
    },
    {
      icon: Clock,
      label: 'Avg. Analysis Time',
      value: stats.avgAnalysisTime,
      suffix: 's',
      change: '-0.5s',
      changePositive: true,
      color: 'from-blue-500 to-blue-400',
      iconBg: 'bg-blue-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="glass-effect rounded-2xl p-6 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              card.changePositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {card.change}
            </div>
          </div>

          <div className={`text-4xl font-black mb-1 bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
            {card.value}{card.suffix}
          </div>

          <div className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
            {card.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
