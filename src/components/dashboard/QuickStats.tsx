'use client';

import { motion } from 'framer-motion';
import { BarChart3, CheckCircle, Clock, FileCheck } from 'lucide-react';

const stats = [
  {
    icon: FileCheck,
    label: 'Analyses Run',
    value: '0',
    color: 'text-accent-cyan',
  },
  {
    icon: CheckCircle,
    label: 'Issues Detected',
    value: '0',
    color: 'text-accent-pink',
  },
  {
    icon: Clock,
    label: 'Avg. Response Time',
    value: '< 2s',
    color: 'text-accent-green',
  },
  {
    icon: BarChart3,
    label: 'Accuracy Rate',
    value: '98%',
    color: 'text-yellow-500',
  },
];

export default function QuickStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.1 }}
          className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
          </div>
          <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
          <div className="text-gray-400 text-sm">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
