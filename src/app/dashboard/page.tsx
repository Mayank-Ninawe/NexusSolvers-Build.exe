'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import AnalysisInput from '@/components/dashboard/AnalysisInput';
import DemoCards from '@/components/dashboard/DemoCards';
import QuickStats from '@/components/dashboard/QuickStats';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user && mounted) {
      router.push('/login');
    }
  }, [user, loading, router, mounted]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-accent-cyan" />
            <h1 className="text-4xl md:text-5xl font-black">
              Welcome, <span className="gradient-text">{user.name}</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Analyze placement communications for bias and get instant AI-powered insights
          </p>
        </motion.div>

        {/* Quick Stats */}
        <QuickStats />

        {/* Main Analysis Section */}
        <div className="mt-12">
          <AnalysisInput />
        </div>

        {/* Demo Cards Section */}
        <div className="mt-16">
          <DemoCards />
        </div>
      </div>
    </div>
  );
}
