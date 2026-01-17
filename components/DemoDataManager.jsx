'use client'
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { seedDemoData, clearAllData } from '@/lib/utils/seedData';

export default function DemoDataManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showManager, setShowManager] = useState(false);

  const handleSeedData = async () => {
  if (!confirm('This will add 7 sample analyzed emails to your account. Continue?')) {
    return;
  }

  setLoading(true);
  setMessage(null);

  const loadingToast = toast.loading('📦 Adding demo data...');

  const result = await seedDemoData(db, user.uid);

  if (result.success) {
    toast.success(`✅ Successfully added ${result.count} demo emails!`, { 
      id: loadingToast,
      duration: 5000 
    });
    setMessage({ type: 'success', text: `✅ Successfully added ${result.count} demo emails!` });
    
    // Auto-close manager after 2 seconds
    setTimeout(() => {
      setShowManager(false);
    }, 2000);
  } else {
    toast.error(`❌ Error: ${result.error}`, { id: loadingToast });
    setMessage({ type: 'error', text: `❌ Error: ${result.error}` });
  }

  setLoading(false);
};


  const handleClearData = async () => {
  if (!confirm('⚠️ This will DELETE ALL your uploaded emails. Are you sure?')) {
    return;
  }

  setLoading(true);
  setMessage(null);

  const loadingToast = toast.loading('🗑️ Clearing all data...');

  const result = await clearAllData(db, user.uid);

  if (result.success) {
    toast.success('✅ All data cleared successfully!', { 
      id: loadingToast,
      duration: 5000 
    });
    setMessage({ type: 'success', text: '✅ All data cleared successfully!' });
    
    // Auto-close manager after 2 seconds
    setTimeout(() => {
      setShowManager(false);
    }, 2000);
  } else {
    toast.error(`❌ Error: ${result.error}`, { id: loadingToast });
    setMessage({ type: 'error', text: `❌ Error: ${result.error}` });
  }

  setLoading(false);
};

  if (!showManager) {
    return (
      <button
        onClick={() => setShowManager(true)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition z-50 flex items-center gap-2"
        title="Demo Data Manager"
      >
        <span className="text-xl">🎬</span>
        <span className="hidden sm:inline font-semibold">Demo Tools</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 p-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>🎬</span>
          <span>Demo Data Manager</span>
        </h3>
        <button
          onClick={() => setShowManager(false)}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Quickly populate your dashboard with sample analyzed emails for demo purposes.
      </p>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleSeedData}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Adding Demo Data...</span>
            </>
          ) : (
            <>
              <span>➕</span>
              <span>Add 7 Sample Emails</span>
            </>
          )}
        </button>

        <button
          onClick={handleClearData}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-700 px-4 py-3 rounded-lg font-semibold hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>🗑️</span>
          <span>Clear All Data</span>
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Demo includes:</strong> 4 emails with bias, 2 clean emails, 1 moderate bias. Perfect for hackathon demo!
        </p>
      </div>
    </div>
  );
}
