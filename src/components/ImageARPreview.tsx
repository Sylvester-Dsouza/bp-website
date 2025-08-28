'use client';

import { useEffect, useState } from 'react';
import { X, Eye, RotateCcw, ZoomIn, ZoomOut, Move, Target } from 'lucide-react';
import { analyzeSurface, ensureTrackingLoaded, type SurfaceAnalysis } from '../utils/surfaceDetection';
import { heicTo, isHeic } from 'heic-to';

interface ImageARPreviewProps {
  backgroundImage: string;
  arModel: string;
  productName: string;
  onClose: () => void;
}

export default function ImageARPreview({ backgroundImage, arModel, productName, onClose }: ImageARPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [modelScale, setModelScale] = useState(3);
  const [modelPosition, setModelPosition] = useState({ x: 50, y: 50 }); // Percentage positions
  const [isDragging, setIsDragging] = useState(false);
  const [surfaceAnalysis, setSurfaceAnalysis] = useState<SurfaceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadModelViewer = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
          await import('@google/model-viewer');
        }
        
        const container = document.getElementById('preview-model-viewer-container');
        if (container && arModel) {
          const modelSrc = arModel.startsWith('/') ? `${window.location.origin}${arModel}` : arModel;
          
          container.innerHTML = `
            <model-viewer
              src="${modelSrc}"
              alt="${productName} 3D model"
              camera-controls
              touch-action="none"
              auto-rotate
              shadow-intensity="0"
              environment-image="neutral"
              exposure="1"
              style="width: 100%; height: 100%; background: transparent; transform: scale(${modelScale});"
            ></model-viewer>
          `;
          
          const modelViewer = container.querySelector('model-viewer');
          if (modelViewer) {
            modelViewer.addEventListener('load', () => {
              setIsLoading(false);
            });
            
            modelViewer.addEventListener('error', () => {
              setIsLoading(false);
              setHasError(true);
            });
          }
        }
      } catch (error) {
        console.error('Error loading model-viewer:', error);
        setIsLoading(false);
        setHasError(true);
      }
    };
    
    loadModelViewer();
  }, [arModel, productName, modelScale]);
  
  // Analyze surface when background image loads
  useEffect(() => {
    const analyzeImageSurface = async () => {
      if (!backgroundImage || typeof window === 'undefined') return;
      
      setIsAnalyzing(true);
      try {
        await ensureTrackingLoaded();
        
        let imageUrl = backgroundImage;
        
        // Check if the image is HEIC and convert it to JPEG
        if (backgroundImage.startsWith('data:image/heic')) {
          try {
            console.log('HEIC image detected, converting to JPEG...');
            // Convert data URL to blob
            const response = await fetch(backgroundImage);
            const blob = await response.blob();
            
            // Convert HEIC to JPEG
            const jpegBlob = await heicTo({
              blob: blob,
              type: 'image/jpeg',
              quality: 0.8
            });
            
            // Create new data URL from converted JPEG
            imageUrl = URL.createObjectURL(jpegBlob);
            console.log('HEIC converted to JPEG successfully');
          } catch (heicError) {
            console.error('Failed to convert HEIC image:', heicError);
            // Continue with original image URL as fallback
          }
        }
        
        const img = new Image();
        // Only set crossOrigin for external URLs, not for data URLs or blob URLs
        if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('blob:')) {
          img.crossOrigin = 'anonymous';
        }
        
        img.onload = async () => {
          try {
            const analysis = await analyzeSurface(img);
            setSurfaceAnalysis(analysis);
            setShowSuggestion(true);
          } catch (error) {
            console.warn('Surface analysis failed, using default positioning:', error);
             // Provide fallback analysis
             setSurfaceAnalysis({
               surfacePoints: [],
               dominantSurfaces: [],
               suggestedPosition: { x: 50, y: 50 },
               suggestedScale: 2.5
             });
            setShowSuggestion(true);
          } finally {
            setIsAnalyzing(false);
            // Clean up blob URL if we created one
            if (imageUrl !== backgroundImage && imageUrl.startsWith('blob:')) {
              URL.revokeObjectURL(imageUrl);
            }
          }
        };
        
        img.onerror = (error) => {
          console.error('Failed to load image for analysis:', error);
          console.error('Image URL:', imageUrl);
          // Provide fallback analysis when image fails to load
          setSurfaceAnalysis({
            surfacePoints: [],
            dominantSurfaces: [],
            suggestedPosition: { x: 50, y: 50 },
            suggestedScale: 2.5
          });
          setShowSuggestion(true);
          setIsAnalyzing(false);
          // Clean up blob URL if we created one
          if (imageUrl !== backgroundImage && imageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl);
          }
        };
        
        img.src = imageUrl;
      } catch (error) {
        console.warn('Failed to initialize surface analysis, using default positioning:', error);
         // Provide fallback analysis when tracking library fails to load
         setSurfaceAnalysis({
           surfacePoints: [],
           dominantSurfaces: [],
           suggestedPosition: { x: 50, y: 50 },
           suggestedScale: 2.5
         });
        setShowSuggestion(true);
        setIsAnalyzing(false);
      }
    };
    
    analyzeImageSurface();
  }, [backgroundImage]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setModelPosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x + (deltaX / window.innerWidth) * 100)),
      y: Math.max(0, Math.min(100, prev.y + (deltaY / window.innerHeight) * 100))
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetPosition = () => {
    setModelPosition({ x: 50, y: 50 });
    setModelScale(1);
    setShowSuggestion(false);
  };
  
  const applySuggestion = () => {
    if (surfaceAnalysis) {
      setModelPosition(surfaceAnalysis.suggestedPosition);
      setModelScale(surfaceAnalysis.suggestedScale);
      setShowSuggestion(false);
    }
  };

  const zoomIn = () => {
    setModelScale(prev => Math.min(3, prev + 0.2));
  };

  const zoomOut = () => {
    setModelScale(prev => Math.max(0.2, prev - 0.2));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 bg-black/70 backdrop-blur-sm hover:bg-black/80 text-white p-3 rounded-full transition-all border border-white/20"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-60 flex flex-col space-y-2">
        {showSuggestion && surfaceAnalysis && (
          <button
            onClick={applySuggestion}
            className="bg-blue-600/80 backdrop-blur-sm hover:bg-blue-700/80 text-white p-3 rounded-full transition-all border border-blue-400/30 animate-pulse"
            title="Apply AI Suggestion"
          >
            <Target className="w-6 h-6" />
          </button>
        )}
        <button
          onClick={resetPosition}
          className="bg-black/70 backdrop-blur-sm hover:bg-black/80 text-white p-3 rounded-full transition-all border border-white/20"
          title="Reset Position & Scale"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        <button
          onClick={zoomIn}
          className="bg-black/70 backdrop-blur-sm hover:bg-black/80 text-white p-3 rounded-full transition-all border border-white/20"
          title="Zoom In"
        >
          <ZoomIn className="w-6 h-6" />
        </button>
        <button
          onClick={zoomOut}
          className="bg-black/70 backdrop-blur-sm hover:bg-black/80 text-white p-3 rounded-full transition-all border border-white/20"
          title="Zoom Out"
        >
          <ZoomOut className="w-6 h-6" />
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-60 bg-black/70 backdrop-blur-sm text-white px-4 py-3 rounded-lg text-sm flex items-center space-x-2 border border-white/20">
        <Move className="w-5 h-5" />
        <span>
          {isAnalyzing ? 'Analyzing surface...' : 
           showSuggestion ? 'AI suggests optimal placement • Click target to apply' :
           'Drag to move • Use controls to resize'}
        </span>
      </div>

      {/* Main Preview Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Background Image */}
        <img
          src={backgroundImage}
          alt="Background"
          className="max-w-full max-h-full object-contain"
          draggable={false}
        />
        
        {/* 3D Model Overlay */}
        <div
          className="absolute w-48 h-48 pointer-events-auto cursor-move"
          style={{
            left: `${modelPosition.x}%`,
            top: `${modelPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            id="preview-model-viewer-container"
            className="w-full h-full relative"
          >
            {/* Model Viewer will be loaded here */}
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-xs text-white">Loading...</p>
              </div>
            </div>
          )}
          
          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 rounded-lg">
              <div className="text-center">
                <Eye className="h-6 w-6 text-white mx-auto mb-1" />
                <p className="text-xs text-white">Failed to load</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}