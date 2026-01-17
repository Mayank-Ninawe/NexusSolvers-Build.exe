'use client';

import { DEMO_SCENARIOS } from '@/lib/demo-data';
import { motion } from 'framer-motion';
import { FileText, Play } from 'lucide-react';
import { useState } from 'react';
import { analyzeBiasWithGemini } from '@/lib/gemini';
import { BiasResult } from '@/types';
import toast from 'react-hot-toast';
import ResultsDisplay from './ResultsDisplay';

export default function DemoCards() {
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [demoResults, setDemoResults] = useState<{ text: string; results: BiasResult } | null>(null);

  const handleDemoAnalysis = async (scenario: typeof DEMO_SCENARIOS[0]) => {
    setAnalyzing(scenario.id);
    try {
      const result = await analyzeBiasWithGemini(scenario.text);
      setDemoResults({ text: scenario.text, results: result });
      toast.success('Demo analysis complete! 🎉');
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('demo-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze demo');
    } finally {
      setAnalyzing(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black mb-3">
          Try <span className="gradient-text">Demo Scenarios</span>
        </h2>
        <p className="text-gray-400">
          Click on any card to analyze real-world biased placement communications
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_SCENARIOS.map((scenario, index) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="group glass-effect rounded-2xl p-6 border border-white/10 backdrop-blur-xl cursor-pointer hover:border-accent-cyan/50 transition-all"
            onClick={() => handleDemoAnalysis(scenario)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-pink flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="px-3 py-1 bg-accent-pink/20 text-accent-pink rounded-full text-xs font-semibold">
                {scenario.category}
              </span>
            </div>

            <h3 className="text-lg font-bold mb-3 group-hover:text-accent-cyan transition-colors">
              {scenario.title}
            </h3>

            <p className="text-gray-400 text-sm mb-4 line-clamp-3">
              {scenario.text}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {scenario.expectedBiases.map((bias) => (
                  <div
                    key={bias}
                    className="w-2 h-2 rounded-full bg-accent-pink"
                    title={bias}
                  />
                ))}
              </div>

              <button
                disabled={analyzing === scenario.id}
                className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 rounded-lg transition-colors text-sm font-semibold"
              >
                {analyzing === scenario.id ? (
                  'Analyzing...'
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Demo Results */}
      {demoResults && (
        <div id="demo-results" className="mt-12">
          <div className="mb-4 flex items-center gap-2 text-sm text-accent-cyan">
            <span className="px-3 py-1 bg-accent-cyan/20 rounded-full font-semibold">
              DEMO ANALYSIS
            </span>
          </div>
          <ResultsDisplay results={demoResults.results} originalText={demoResults.text} />
        </div>
      )}
    </div>
  );
}
