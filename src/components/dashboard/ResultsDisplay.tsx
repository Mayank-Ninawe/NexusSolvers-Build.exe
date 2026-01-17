'use client';

import { BiasResult } from '@/types';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Info, Download, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResultsDisplayProps {
  results: BiasResult;
  originalText: string;
}

export default function ResultsDisplay({ results, originalText }: ResultsDisplayProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medium':
        return <Info className="h-5 w-5" />;
      case 'low':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const handleDownload = () => {
    const reportText = `
Bias Analysis Report
Generated: ${new Date().toLocaleString()}

Overall Score: ${results.overallScore}/100
Severity: ${results.severity.toUpperCase()}
Confidence: ${results.confidence}%

Summary:
${results.summary}

Detected Biases:
${results.biasesDetected.map((bias, index) => `
${index + 1}. ${bias.type.toUpperCase()}
   Severity: ${bias.severity}
   Evidence: "${bias.evidence}"
   Explanation: ${bias.explanation}
   ${bias.suggestedRewrite ? `Suggested Rewrite: "${bias.suggestedRewrite}"` : ''}
`).join('\n')}

Original Text:
${originalText}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bias-analysis-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  const handleShare = () => {
    toast.success('Share feature coming soon!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      {/* Overall Score Card */}
      <div className="glass-effect rounded-3xl p-8 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Analysis Results</h3>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-primary-light hover:bg-primary border border-white/10 transition-all"
              title="Download Report"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-primary-light hover:bg-primary border border-white/10 transition-all"
              title="Share Results"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-primary/50 rounded-xl p-4 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Overall Score</div>
            <div className="text-3xl font-black text-white">{results.overallScore}/100</div>
          </div>
          <div className="bg-primary/50 rounded-xl p-4 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Severity</div>
            <div className={`text-2xl font-bold capitalize ${getSeverityColor(results.severity).split(' ')[0]}`}>
              {results.severity}
            </div>
          </div>
          <div className="bg-primary/50 rounded-xl p-4 border border-white/10">
            <div className="text-sm text-gray-400 mb-1">Confidence</div>
            <div className="text-3xl font-black text-white">{results.confidence}%</div>
          </div>
        </div>

        <div className="bg-primary/50 rounded-xl p-4 border border-white/10">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Summary</h4>
          <p className="text-white leading-relaxed">{results.summary}</p>
        </div>
      </div>

      {/* Detected Biases */}
      {results.biasesDetected.length > 0 && (
        <div className="glass-effect rounded-3xl p-8 border border-white/10 backdrop-blur-xl">
          <h3 className="text-2xl font-bold mb-6">
            Detected Biases ({results.biasesDetected.length})
          </h3>

          <div className="space-y-4">
            {results.biasesDetected.map((bias, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border-2 ${getSeverityColor(bias.severity)}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${getSeverityColor(bias.severity).split(' ')[0]}`}>
                    {getSeverityIcon(bias.severity)}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-white capitalize">
                        {bias.type.replace('_', ' ')} Bias
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getSeverityColor(bias.severity)}`}>
                        {bias.severity}
                      </span>
                    </div>

                    <div className="bg-primary/30 rounded-lg p-3 border border-white/5">
                      <div className="text-xs text-gray-400 mb-1">Evidence:</div>
                      <div className="text-white italic">"{bias.evidence}"</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-400 mb-1">Explanation:</div>
                      <p className="text-gray-300 text-sm leading-relaxed">{bias.explanation}</p>
                    </div>

                    {bias.suggestedRewrite && (
                      <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                        <div className="text-xs text-green-400 mb-1">Suggested Alternative:</div>
                        <div className="text-white">"{bias.suggestedRewrite}"</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Biases Found */}
      {results.biasesDetected.length === 0 && (
        <div className="glass-effect rounded-3xl p-8 border border-white/10 backdrop-blur-xl">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold text-white">No Significant Biases Detected!</h3>
            <p className="text-gray-400">
              The text appears to be relatively free of obvious bias markers. However, always review communications carefully.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
