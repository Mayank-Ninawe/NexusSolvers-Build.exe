'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function CollegeTrendsChart() {
  const data = [
    { month: 'Jan', reports: 28, critical: 8 },
    { month: 'Feb', reports: 35, critical: 12 },
    { month: 'Mar', reports: 42, critical: 15 },
    { month: 'Apr', reports: 38, critical: 11 },
    { month: 'May', reports: 51, critical: 18 },
    { month: 'Jun', reports: 47, critical: 14 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-effect rounded-2xl p-6 border border-white/10 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-blue-500 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Reports Trend</h3>
          <p className="text-sm text-gray-400">Last 6 months</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1f3a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="reports"
            stroke="#00d4ff"
            strokeWidth={3}
            dot={{ fill: '#00d4ff', r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="critical"
            stroke="#ff0080"
            strokeWidth={3}
            dot={{ fill: '#ff0080', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
