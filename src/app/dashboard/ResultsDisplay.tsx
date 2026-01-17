'use client';

import { BiasResult } from '@/types';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Download, FileText } from 'lucide-react';
import { getSeverityColor, getSeverityBg } from '@/lib/utils';

interface ResultsDisplayProps {
  results: BiasResult;
  originalText: string;
}

export default function ResultsDisplay({ results, originalText }: ResultsDisplayProps) {
  const handleDownloadPDF = () => {
    // PDF generation will be implemented later
    alert('PDF download feature coming soon!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overall Score */}
      <div className="glass-effect rounded-3xl p-8 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Analysis Results</h3>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/20 hover:bg-accent-cyan/30 rounded-xl transition-colors"
          >
            <Download className="h-5 w-5" />
            <span className="font-semibold">Export PDF</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className={`p-6 rounded-2xl ${getSeverityBg(results.severity)} border border-white/10`}>
            <div className="text-sm text-gray-400 mb-2">Overall Severity</div>
            <div className={`text-3xl font-black uppercase ${getSeverityColor(results.severity)}`}>
              {results.severity}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-accent-pink/10 border border-white/10">
            <div className="text-sm text-gray-400 mb-2">Biases Detected</div>
            <div className="text-3xl font-black text-accent-pink">
              {results.biasesDetected.length}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-accent-green/10 border border-white/10">
            <div className="text-sm text-gray-400 mb-2">AI Confidence</div>
            <div className="text-3xl font-black text-accent-green">
              {results.confidence}%
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 bg-primary/50 rounded-2xl border border-white/10">
          <div className="flex items-start gap-3">
            <FileText className="h-6 w-6 text-accent-cyan mt-1" />
            <div>
              <h4 className="font-bold text-lg mb-2">Summary</h4>
              <p className="text-gray-300 leading-relaxed">{results.summary}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Biases */}
      {results.biasesDetected.length > 0 ? (
        <div className="glass-effect rounded-3xl p-8 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-accent-pink" />
            <h3 className="text-2xl font-bold">Detected Biases</h3>
          </div>

          <div className="space-y-4">
            {results.biasesDetected.map((bias, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-primary/50 rounded-2xl border border-white/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full text-sm font-semibold uppercase">
                        {bias.type.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 ${getSeverityBg(bias.severity)} ${getSeverityColor(bias.severity)} rounded-full text-sm font-semibold uppercase`}>
                        {bias.severity}
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{bias.explanation}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Evidence:</div>
                    <div className="text-gray-200 font-medium">"{bias.evidence}"</div>
                  </div>

                  {bias.suggestedRewrite && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="text-sm text-gray-400 mb-1">Suggested Rewrite:</div>
                      <div className="text-gray-200 font-medium">"{bias.suggestedRewrite}"</div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-effect rounded-3xl p-12 border border-white/10 backdrop-blur-xl text-center">
          <CheckCircle className="h-16 w-16 text-accent-green mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">No Bias Detected! 🎉</h3>
          <p className="text-gray-400">
            The text appears to be free from discriminatory language and bias.
          </p>
        </div>
      )}
    </motion.div>
  );
}
