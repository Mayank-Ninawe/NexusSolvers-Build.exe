'use client'

export default function BatchProgress({ files, onRemove, processing }) {
  if (files.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Files Added</h3>
        <p className="text-gray-600">
          Drop files on the left to start batch analysis
        </p>
      </div>
    );
  }

  const completed = files.filter(f => f.status === 'completed').length;
  const failed = files.filter(f => f.status === 'failed').length;
  const pending = files.filter(f => f.status === 'pending').length;
  const processingCount = files.filter(f => f.status === 'processing').length;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Upload Queue</h3>
        <div className="text-sm font-medium text-gray-600">
          {completed}/{files.length} Complete
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Overall Progress</span>
          <span className="text-blue-600 font-bold">
            {Math.round((completed / files.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completed / files.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-600">{pending}</div>
          <div className="text-xs text-gray-600">Pending</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{processingCount}</div>
          <div className="text-xs text-blue-600">Processing</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{completed}</div>
          <div className="text-xs text-green-600">Done</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{failed}</div>
          <div className="text-xs text-red-600">Failed</div>
        </div>
      </div>

      {/* File List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {files.map((fileItem) => (
          <div
            key={fileItem.id}
            className={`border-2 rounded-lg p-4 transition-all ${
              fileItem.status === 'completed' ? 'border-green-300 bg-green-50' :
              fileItem.status === 'failed' ? 'border-red-300 bg-red-50' :
              fileItem.status === 'processing' ? 'border-blue-300 bg-blue-50 animate-pulse' :
              'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {fileItem.status === 'completed' ? '✅' :
                     fileItem.status === 'failed' ? '❌' :
                     fileItem.status === 'processing' ? '⏳' : '📄'}
                  </span>
                  <span className="font-medium text-gray-900 truncate">
                    {fileItem.name}
                  </span>
                </div>
                
                {fileItem.status === 'processing' && (
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${fileItem.progress}%` }}
                    />
                  </div>
                )}

                {fileItem.result && (
                  <div className="mt-2 text-sm">
                    <span className={`inline-flex items-center gap-1 font-medium ${
                      fileItem.result.biasDetected ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {fileItem.result.biasDetected ? '⚠️ Bias Detected' : '✅ Clean'}
                      <span className="text-gray-600">
                        ({fileItem.result.confidence}% confidence)
                      </span>
                    </span>
                  </div>
                )}

                {fileItem.error && (
                  <div className="mt-2 text-sm text-red-600">
                    Error: {fileItem.error}
                  </div>
                )}
              </div>

              {!processing && fileItem.status === 'pending' && (
                <button
                  onClick={() => onRemove(fileItem.id)}
                  className="ml-2 text-gray-400 hover:text-red-600 transition"
                  title="Remove"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Size: {(fileItem.file.size / 1024).toFixed(1)} KB</span>
              <span>•</span>
              <span className="capitalize">{fileItem.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
