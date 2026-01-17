'use client'
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const { loginAnonymously, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAnonymousLogin = async () => {
  setLoading(true);
  setError(null);
  
  const loadingToast = toast.loading('🔐 Signing in anonymously...');
  
  const result = await loginAnonymously();
  
  if (result.success) {
    toast.success('✅ Successfully signed in!', { id: loadingToast });
    onClose();
  } else {
    toast.error(`❌ ${result.error}`, { id: loadingToast });
    setError(result.error);
  }
  
  setLoading(false);
};


  const handleGoogleLogin = async () => {
  setLoading(true);
  setError(null);
  
  const loadingToast = toast.loading('🔐 Signing in with Google...');
  
  const result = await loginWithGoogle();
  
  if (result.success) {
    toast.success('✅ Successfully signed in with Google!', { id: loadingToast });
    onClose();
  } else {
    toast.error(`❌ ${result.error}`, { id: loadingToast });
    setError(result.error);
  }
  
  setLoading(false);
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          disabled={loading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎯</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to BiasBreaker
          </h2>
          <p className="text-gray-600">
            Sign in to detect bias in campus placements
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Login Options */}
        <div className="space-y-4">
          
          {/* Anonymous Login */}
          <button
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Continue Anonymously</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
