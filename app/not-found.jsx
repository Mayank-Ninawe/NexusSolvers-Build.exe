import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 animate-pulse">
          404
        </div>
        
        <div className="text-6xl mb-6">🔍</div>
        
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. 
          It might have been moved, deleted, or never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🏠 Go Home
          </Link>
          
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            📊 Dashboard
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 text-left">
          <Link href="/upload" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📤</div>
            <div className="font-semibold text-gray-900">Upload Email</div>
            <div className="text-xs text-gray-600">Analyze for bias</div>
          </Link>

          <Link href="/templates" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📧</div>
            <div className="font-semibold text-gray-900">Templates</div>
            <div className="text-xs text-gray-600">Example emails</div>
          </Link>

          <Link href="/about" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">ℹ️</div>
            <div className="font-semibold text-gray-900">About Us</div>
            <div className="text-xs text-gray-600">Learn more</div>
          </Link>

          <Link href="/reports" className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all group">
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</div>
            <div className="font-semibold text-gray-900">Reports</div>
            <div className="text-xs text-gray-600">View analytics</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
