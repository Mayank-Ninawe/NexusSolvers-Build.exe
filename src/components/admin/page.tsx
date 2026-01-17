'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertTriangle, Building2, Users } from 'lucide-react';
import AdminKPICards from '@/components/admin/AdminKPICards';
import BiasDistributionChart from '@/components/admin/BiasDistributionChart';
import RecentReportsTable from '@/components/admin/RecentReportsTable';
import CollegeTrendsChart from '@/components/admin/CollegeTrendsChart';

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-accent-cyan" />
          <h1 className="text-4xl font-black">
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          Monitor bias reports, analytics, and platform performance
        </p>
      </div>

      {/* KPI Cards */}
      <AdminKPICards />

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <BiasDistributionChart />
        <CollegeTrendsChart />
      </div>

      {/* Recent Reports */}
      <RecentReportsTable />
    </div>
  );
}
