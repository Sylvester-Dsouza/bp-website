'use client';

import { useEffect, useRef, useState } from 'react';

interface ModelPreviewProps {
  modelPath: string;
  productName: string;
  height?: string;
  autoRotate?: boolean;
  fullSize?: boolean;
  showControls?: boolean;
  showLoadingIndicator?: boolean;
}

export default function ModelPreview({ 
  modelPath, 
  productName, 
  height = '100%',
  autoRotate = true,
  fullSize = true,
  showControls = true,
  showLoadingIndicator = true
}: ModelPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [arSessionActive, setArSessionActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create model-viewer element
    const modelViewer = document.createElement('model-viewer');
    modelViewer.setAttribute('src', modelPath);
    modelViewer.setAttribute('alt', `${productName} 3D model`);
    modelViewer.setAttribute('camera-controls', showControls ? 'true' : 'false');
    modelViewer.setAttribute('auto-rotate', autoRotate ? 'true' : 'false');
    modelViewer.setAttribute('shadow-intensity', '0.5'); // Add subtle shadows for better depth perception
    modelViewer.setAttribute('environment-image', 'legacy');
    modelViewer.setAttribute('skybox-image', '');
    modelViewer.setAttribute('exposure', '1.2'); // Slightly brighter exposure
    modelViewer.setAttribute('shadow-softness', '1'); // Softer shadows
    modelViewer.setAttribute('tone-mapping', 'commerce'); // Better color rendering
    modelViewer.setAttribute('camera-orbit', '0deg 75deg auto');
    modelViewer.setAttribute('field-of-view', '30deg');
    modelViewer.setAttribute('ar', 'true');
    modelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
    modelViewer.setAttribute('ar-scale', 'fixed');
    modelViewer.setAttribute('ar-status', 'not-presenting');
    modelViewer.setAttribute('touch-action', 'none'); // Prevent accidental activation when scrolling
    modelViewer.setAttribute('disable-tap', 'true'); // Disable tap to activate AR
    modelViewer.setAttribute('disable-pan', 'true'); // Disable panning on touch
    modelViewer.setAttribute('min-field-of-view', '10deg');
    modelViewer.setAttribute('max-field-of-view', '60deg');
    modelViewer.setAttribute('bounds', 'tight');
    modelViewer.setAttribute('reveal', 'auto');
    modelViewer.setAttribute('loading', 'eager');
    modelViewer.setAttribute('poster', '');
    modelViewer.setAttribute('interaction-prompt', 'none');
    
    // Set dimensions
    modelViewer.style.width = '100%';
    modelViewer.style.height = height || '100%';
    modelViewer.style.backgroundColor = 'transparent';
    modelViewer.style.contain = 'none'; // Prevent cropping
    modelViewer.style.objectFit = 'contain'; // Ensure model fits within container
    modelViewer.style.maxWidth = '100%';
    modelViewer.style.maxHeight = '100%';

    // Clear container and append model-viewer
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(modelViewer);

    // Add event listener for load
    modelViewer.addEventListener('load', () => {
      // Model has loaded
      setIsLoading(false);
      
      // Adjust camera to frame the model nicely after loading
      setTimeout(() => {
        try {
          // Try to frame the model better if the method exists
          if (typeof (modelViewer as any).updateFraming === 'function') {
            (modelViewer as any).updateFraming();
          }
        } catch (e) {
          console.log('Error updating framing', e);
        }
      }, 100);
    });
    
    // Add AR session event listeners
    modelViewer.addEventListener('ar-status', (event: any) => {
      const status = event.detail.status;
      console.log('AR Status:', status);
      
      if (status === 'session-started') {
        setArSessionActive(true);
      } else if (status === 'not-presenting') {
        setArSessionActive(false);
      } else if (status === 'failed') {
        setArSessionActive(false);
        console.error('AR session failed to start');
      }
    });
  }, [modelPath, productName, height, autoRotate, fullSize, showControls, showLoadingIndicator]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full"></div>
      
      {/* Loading Indicator */}
      {showLoadingIndicator && isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-sm text-gray-800 font-medium">Loading 3D model...</p>
          </div>
        </div>
      )}
      
      {/* AR Session Feedback */}
      {arSessionActive && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg z-20 pointer-events-none">
          <div className="flex items-center space-x-2">
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 border-2 border-white rounded-md"></div>
              <div className="absolute inset-0 border-t-2 border-blue-500 rounded-md animate-scan"></div>
            </div>
            <span className="text-xs">Point at a surface to place</span>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
