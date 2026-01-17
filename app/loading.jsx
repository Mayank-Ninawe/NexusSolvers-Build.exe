export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-8 border-blue-200 rounded-full animate-ping"></div>
          <div className="absolute inset-0 border-8 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            🎯
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
        <p className="text-gray-600">Please wait while we prepare your content</p>
      </div>
    </div>
  );
}
