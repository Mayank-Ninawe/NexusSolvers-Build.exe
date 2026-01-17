export default function LoadingSkeleton({ type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded-full ml-4"></div>
        </div>
        <div className="flex gap-4 mt-3">
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-gray-200">
            <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Default skeleton
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );
}
