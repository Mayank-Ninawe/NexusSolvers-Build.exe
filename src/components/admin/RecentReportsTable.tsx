'use client';

import { motion } from 'framer-motion';
import { FileText, Eye, Download, AlertTriangle } from 'lucide-react';
import { getSeverityColor, getSeverityBg } from '@/lib/utils';

export default function RecentReportsTable() {
  const reports = [
    {
      id: 'BR-2847',
      college: 'JDCOEM Nagpur',
      user: 'anon@student.jdcoem.ac.in',
      biasTypes: ['Gender', 'Age'],
      severity: 'critical',
      date: '2026-01-15',
      status: 'Pending Review',
    },
    {
      id: 'BR-2846',
      college: 'VNIT Nagpur',
      user: 'student@vnit.ac.in',
      biasTypes: ['Location'],
      severity: 'medium',
      date: '2026-01-14',
      status: 'Reviewed',
    },
    {
      id: 'BR-2845',
      college: 'JDCOEM Nagpur',
      user: 'test@student.jdcoem.ac.in',
      biasTypes: ['Educational Background'],
      severity: 'high',
      date: '2026-01-14',
      status: 'Pending Review',
    },
    {
      id: 'BR-2844',
      college: 'COEP Pune',
      user: 'student@coep.ac.in',
      biasTypes: ['Gender', 'Location', 'Age'],
      severity: 'critical',
      date: '2026-01-13',
      status: 'Resolved',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-effect rounded-2xl p-6 border border-white/10 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green to-green-500 flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Recent Reports</h3>
            <p className="text-sm text-gray-400">Latest bias detection reports</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 rounded-xl font-semibold text-sm transition-colors">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Report ID
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                College
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Bias Types
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Severity
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <motion.tr
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-4 px-4">
                  <span className="font-mono font-semibold text-accent-cyan">{report.id}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-300">{report.college}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {report.biasTypes.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-accent-pink/20 text-accent-pink rounded-full text-xs font-semibold"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityBg(
                      report.severity
                    )} ${getSeverityColor(report.severity)}`}
                  >
                    {report.severity}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-400 text-sm">{report.date}</span>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'Resolved'
                        ? 'bg-green-500/20 text-green-400'
                        : report.status === 'Reviewed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
