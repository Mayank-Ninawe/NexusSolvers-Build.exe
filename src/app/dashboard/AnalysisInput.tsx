'use client';

import { useState } from 'react';
import { analyzeBiasWithGemini } from '@/lib/gemini';
import { BiasResult } from '@/types';
import { motion } from 'framer-motion';
import { Sparkles, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ResultsDisplay from '@/components/dashboard/ResultsDisplay';

export default function AnalysisInput() {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<BiasResult | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    if (text.length < 50) {
      toast.error('Please enter at least 50 characters');
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeBiasWithGemini(text);
      setResults(result);
      toast.success('Analysis complete! 🎉');
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze text');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-3xl p-8 border border-white/10 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-pink flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Analyze Text for Bias</h2>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste job description, placement email, or any recruitment communication here..."
              rows={8}
              className="w-full p-4 bg-primary/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-accent-cyan focus:border-accent-cyan outline-none transition-all placeholder:text-gray-500 text-white resize-none"
            />
            <div className="absolute bottom-4 right-4 text-sm text-gray-400">
              {text.length} characters
            </div>
          </div>

          {text.length > 0 && text.length < 50 && (
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span>Minimum 50 characters required ({50 - text.length} more needed)</span>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={analyzing || text.length < 50}
            className="w-full py-4 bg-gradient-to-r from-accent-cyan via-accent-pink to-accent-green rounded-xl font-bold text-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-accent-cyan/25"
          >
            {analyzing ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Analyzing with AI...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Analyze for Bias</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Results Section */}
      {results && <ResultsDisplay results={results} originalText={text} />}
    </div>
  );
}
