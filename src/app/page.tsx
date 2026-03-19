'use client';

import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setProcessedImage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image_file', file);
      formData.append('size', 'auto');

      const response = await axios.post(
        'https://api.remove.bg/v1.0/removebg',
        formData,
        {
          headers: {
            'X-Api-Key': process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY || '',
          },
          responseType: 'arraybuffer',
        }
      );

      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
      );
      
      setProcessedImage(`data:image/png;base64,${base64}`);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process image. Please check your API key and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processImage(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImage(files[0]);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'no-background.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
    setSliderPosition(50);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🎯 AI Background Remover
          </h1>
          <p className="text-xl text-white/80">
            Remove image backgrounds instantly with AI
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full max-w-2xl mb-8 p-4 bg-red-500/20 border border-red-400 rounded-lg">
            <p className="text-red-100 text-center">{error}</p>
          </div>
        )}

        {/* Upload Zone - Only show when no images */}
        {!originalImage && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-2xl p-12 border-4 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-white bg-white/20'
                : 'border-white/50 bg-white/10 hover:border-white hover:bg-white/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-center">
              <div className="text-6xl mb-4">📤</div>
              <p className="text-xl text-white mb-2">
                {isDragging
                  ? 'Drop the image here...'
                  : 'Click or drag image here'}
              </p>
              <p className="text-sm text-white/60">
                Supports JPG, PNG, WebP • Max 10MB
              </p>
            </div>
          </div>
        )}

        {/* Processing Spinner */}
        {isProcessing && (
          <div className="mt-8 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-white text-lg">Processing your image...</p>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
              <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '45%' }}></div>
            </div>
          </div>
        )}

        {/* Image Comparison */}
        {originalImage && processedImage && !isProcessing && (
          <div className="w-full max-w-4xl mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-white text-xl font-semibold mb-4 text-center">
                Before & After
              </h2>
              
              {/* Custom Comparison Slider */}
              <div className="relative w-full overflow-hidden rounded-xl" style={{ maxHeight: '600px' }}>
                <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                  {/* Background Image (Processed) */}
                  <img
                    src={processedImage}
                    alt="No Background"
                    className="absolute inset-0 w-full h-full object-contain bg-gray-100"
                  />
                  
                  {/* Foreground Image (Original) with clip */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img
                      src={originalImage}
                      alt="Original"
                      className="absolute inset-0 w-full h-full object-contain bg-gray-100"
                    />
                  </div>
                  
                  {/* Slider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-lg"
                    style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    onMouseDown={(e) => {
                      const handle = e.currentTarget;
                      const parent = handle.parentElement;
                      if (!parent) return;
                      
                      const handleMouseMove = (e: MouseEvent) => {
                        const rect = parent.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                        setSliderPosition(percentage);
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <span>⬇️</span>
                  Download PNG
                </button>
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                >
                  <span>🔄</span>
                  New Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-white/60">
          <p>Powered by Remove.bg API • Built with Next.js & Tailwind CSS</p>
        </footer>
      </div>
    </main>
  );
}
