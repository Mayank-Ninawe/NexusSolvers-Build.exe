'use client'
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl mb-6 animate-bounce">⚠️</div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Oops! Something Went Wrong
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Don't worry, it's not your fault. We've encountered an unexpected error.
          Please try again or return to the homepage.
        </p>

        <div className="bg-white rounded-xl p-4 mb-8 border border-red-200">
          <p className="text-sm text-gray-700 font-mono break-all">
            {error.message || 'Unknown error occurred'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🔄 Try Again
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🏠 Go Home
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  );
}
