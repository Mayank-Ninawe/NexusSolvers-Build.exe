'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Sparkles } from 'lucide-react';

export default function AnalysisInput() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    // Add your analysis logic here
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative"
    >
      <div className="glass-effect rounded-3xl p-8 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-6 w-6 text-accent-cyan" />
          <h2 className="text-2xl font-bold text-white">Analyze Communication</h2>
        </div>

        <div className="space-y-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your placement communication text here for bias analysis..."
            className="w-full h-48 bg-primary-light/50 border border-white/10 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-cyan resize-none"
          />

          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={!inputText.trim() || isAnalyzing}
              className="flex-1 bg-gradient-to-r from-accent-cyan to-accent-pink text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-accent-cyan/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Analyze with AI
                </>
              )}
            </button>

            <button className="bg-primary-light/80 hover:bg-primary-light text-white font-semibold py-4 px-6 rounded-xl border border-white/10 transition-all flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload File
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
