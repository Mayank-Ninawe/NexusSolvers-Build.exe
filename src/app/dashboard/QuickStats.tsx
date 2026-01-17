'use client';

import { motion } from 'framer-motion';
import { TrendingUp, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export default function QuickStats() {
  const stats = [
    {
      icon: FileText,
      label: 'Total Analyses',
      value: '0',
      color: 'from-accent-cyan to-blue-500',
      iconBg: 'bg-accent-cyan/20',
    },
    {
      icon: AlertTriangle,
      label: 'Biases Found',
      value: '0',
      color: 'from-accent-pink to-pink-500',
      iconBg: 'bg-accent-pink/20',
    },
    {
      icon: CheckCircle,
      label: 'Clean Reports',
      value: '0',
      color: 'from-accent-green to-green-500',
      iconBg: 'bg-accent-green/20',
    },
    {
      icon: TrendingUp,
      label: 'Accuracy Rate',
      value: '95%',
      color: 'from-purple-500 to-purple-400',
      iconBg: 'bg-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-effect rounded-2xl p-6 border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all"
        >
          <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
            <stat.icon className="h-6 w-6 text-white" />
          </div>
          <div className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-400 font-semibold">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
