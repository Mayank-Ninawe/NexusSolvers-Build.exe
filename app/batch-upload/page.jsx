'use client'
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import FileDropZone from '@/components/FileDropZone';
import BatchProgress from '@/components/BatchProgress';
import toast from 'react-hot-toast';

function BatchUploadContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);

  const handleFilesAdded = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      // Accept .txt, .eml, or plain text files
      const validTypes = ['text/plain', 'message/rfc822', 'application/octet-stream'];
      const validExtensions = ['.txt', '.eml', '.email'];
      const hasValidType = validTypes.includes(file.type);
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      return hasValidType || hasValidExtension || file.type === '';
    });

    if (validFiles.length !== newFiles.length) {
      toast.error(`${newFiles.length - validFiles.length} files were invalid. Only .txt and .eml files accepted.`);
    }

    if (files.length + validFiles.length > 10) {
      toast.error('Maximum 10 files allowed at once');
      return;
    }

    const filesWithStatus = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      status: 'pending', // pending, processing, completed, failed
      progress: 0,
      result: null,
      error: null
    }));

    setFiles(prev => [...prev, ...filesWithStatus]);
    toast.success(`${validFiles.length} file(s) added to queue`);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startBatchProcessing = async () => {
    if (files.length === 0) {
      toast.error('Please add files first');
      return;
    }

    setProcessing(true);
    toast.loading('Starting batch analysis...', { id: 'batch-start' });

    // Import required functions
    const { ref, push, set } = await import('firebase/database');
    const { db } = await import('@/lib/firebase');

    const processedResults = [];

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];
      
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'processing', progress: 10 }
          : f
      ));

      try {
        // Read file content
        const text = await fileItem.file.text();
        
        // Update progress
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, progress: 30 }
            : f
        ));

        // Analyze with Gemini via API route
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emailText: text }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Analysis failed');
        }

        const analysis = data.analysis;
        
        // Update progress
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, progress: 70 }
            : f
        ));

        // Save to Firebase
        const uploadsRef = ref(db, `uploads/${user.uid}`);
        const newUploadRef = push(uploadsRef);
        
        const uploadData = {
          fileName: fileItem.name,
          emailText: text,
          timestamp: Date.now(),
          status: 'completed',
          analysis: analysis,
          createdAt: new Date().toISOString(),
          analyzedAt: new Date().toISOString(),
          batchUpload: true
        };

        await set(newUploadRef, uploadData);

        // Update to completed
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'completed', progress: 100, result: analysis }
            : f
        ));

        processedResults.push({
          fileName: fileItem.name,
          analysis
        });

      } catch (error) {
        console.error(`Error processing ${fileItem.name}:`, error);
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'failed', error: error.message }
            : f
        ));
      }
    }

    setProcessing(false);
    setResults(processedResults);
    
    toast.success(`Batch complete! ${processedResults.length}/${files.length} files analyzed`, { 
      id: 'batch-start',
      duration: 5000 
    });
  };

  const clearAll = () => {
    if (!confirm('Clear all files and results?')) return;
    setFiles([]);
    setResults([]);
    toast.success('Queue cleared');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 animate-fadeInUp">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Batch Upload & Analysis
          </h1>
          <p className="text-gray-600">
            Upload multiple emails at once for efficient bias detection
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8 animate-fadeInUp">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📁</div>
              <div>
                <div className="font-bold text-blue-900">Multiple Files</div>
                <div className="text-sm text-blue-700">Upload up to 10 emails</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚡</div>
              <div>
                <div className="font-bold text-green-900">Fast Processing</div>
                <div className="text-sm text-green-700">Parallel AI analysis</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📊</div>
              <div>
                <div className="font-bold text-purple-900">Batch Reports</div>
                <div className="text-sm text-purple-700">Combined insights</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Left Column - Upload Zone */}
          <div>
            <FileDropZone onFilesAdded={handleFilesAdded} disabled={processing} />
            
            {/* Action Buttons */}
            {files.length > 0 && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={startBatchProcessing}
                  disabled={processing}
                  className="flex-1 btn-press bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing {files.filter(f => f.status === 'completed').length}/{files.length}</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Start Batch Analysis</span>
                    </>
                  )}
                </button>

                <button
                  onClick={clearAll}
                  disabled={processing}
                  className="btn-press bg-red-100 text-red-700 px-6 py-4 rounded-xl font-semibold hover:bg-red-200 transition disabled:opacity-50"
                >
                  🗑️ Clear All
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Progress */}
          <div>
            <BatchProgress files={files} onRemove={removeFile} processing={processing} />
          </div>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-scaleIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Batch Results</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Total Analyzed</div>
                <div className="text-3xl font-bold text-gray-900">{results.length}</div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-sm text-red-600 mb-1">Bias Detected</div>
                <div className="text-3xl font-bold text-red-700">
                  {results.filter(r => r.analysis.biasDetected).length}
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-sm text-green-600 mb-1">Clean Emails</div>
                <div className="text-3xl font-bold text-green-700">
                  {results.filter(r => !r.analysis.biasDetected).length}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                View in Dashboard →
              </button>
              
              <button
                onClick={() => router.push('/reports')}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                View Reports →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BatchUpload() {
  return (
    <ProtectedRoute>
      <BatchUploadContent />
    </ProtectedRoute>
  );
}
