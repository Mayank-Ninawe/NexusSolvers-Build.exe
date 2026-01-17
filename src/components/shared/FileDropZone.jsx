'use client'
import { useCallback, useState } from 'react';

export default function FileDropZone({ onFilesAdded, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded, disabled]);

  const handleFileInput = (e) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files);
    if (files && files.length > 0) {
      onFilesAdded(files);
    }
    e.target.value = ''; // Reset input
  };

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative bg-white rounded-2xl border-4 border-dashed p-12 text-center transition-all ${
        isDragging 
          ? 'border-blue-500 bg-blue-50 scale-105' 
          : disabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
      }`}
    >
      <input
        type="file"
        multiple
        accept=".txt,.eml,.email,text/plain,message/rfc822"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        id="file-upload"
      />

      <div className="pointer-events-none">
        <div className={`text-6xl mb-4 transition-transform ${isDragging ? 'scale-110' : ''}`}>
          {isDragging ? '📥' : '📁'}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {isDragging ? 'Drop files here!' : 'Drag & Drop Email Files'}
        </h3>

        <p className="text-gray-600 mb-4">
          or click to browse
        </p>

        <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
          Accepts: .txt, .eml files (max 10)
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <div>💡 <strong>Tip:</strong> You can select multiple files at once</div>
          <div className="mt-1">⚡ Each file will be analyzed with Gemini AI</div>
        </div>
      </div>
    </div>
  );
}
