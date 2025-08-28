'use client';

import { useEffect, useState } from 'react';
import { Eye, AlertCircle, Home, Square } from 'lucide-react';
import ImageUploadAR from './ImageUploadAR';
import ImageARPreview from './ImageARPreview';

interface ARProductViewerProps {
  productName: string;
  arModel: string;
  productId: string;
}

export default function ARProductViewer({ productName, arModel, productId }: ARProductViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [canUseAR, setCanUseAR] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [placementMode, setPlacementMode] = useState<'floor' | 'wall'>('floor');

  useEffect(() => {
    // Dynamically load model-viewer
    const loadModelViewer = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
          await import('@google/model-viewer');
        }
        
        // Create and configure model-viewer element
        const container = document.getElementById('model-viewer-container');
        if (container && arModel) {
          // Ensure the model path is absolute
          const modelSrc = arModel.startsWith('/') ? `${window.location.origin}${arModel}` : arModel;
          
          // Create background style based on uploaded image
          const backgroundStyle = backgroundImage 
            ? `background-image: url(${backgroundImage}); background-size: cover; background-position: center; background-repeat: no-repeat;`
            : 'background-color: #f8f9fa;';
          
          container.innerHTML = `
            <model-viewer
              src="${modelSrc}"
              alt="${productName} 3D model"
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-placement="${placementMode}"
              ar-scale="fixed"
              camera-controls
              camera-orbit="0deg 75deg 4m"
              camera-target="0m 0m 0m"
              field-of-view="30deg"
              min-camera-orbit="auto auto 2m"
              max-camera-orbit="auto auto 8m"
              touch-action="pan-y"
              auto-rotate
              shadow-intensity="1"
              environment-image="${backgroundImage ? 'legacy' : 'neutral'}"
              exposure="1"
              xr-environment
              loading="eager"
              reveal="auto"
              style="width: 100%; height: 100%; ${backgroundStyle}"
            >
              <div slot="ar-button" id="ar-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
                View in AR
              </div>
              <div id="ar-prompt">
                <div class="scanning-animation">
                  <div class="scan-line"></div>
                </div>
                <p class="prompt-text">${placementMode === 'wall' ? 'Point your camera at a wall and move your phone slowly to detect the surface' : 'Point your camera at the floor and move your phone in a circular motion to detect the surface'}</p>
              </div>
              <div id="ar-failure">
                <p>Having trouble? Try moving to a well-lit area and point your camera at a ${placementMode === 'wall' ? 'plain wall' : 'flat floor surface'}.</p>
              </div>
            </model-viewer>
          `;
          
          // Add CSS styles for AR prompts
          const style = document.createElement('style');
          style.textContent = `
            #ar-button {
              background-color: #4285f4;
              color: white;
              border: none;
              border-radius: 24px;
              padding: 12px 24px;
              font-size: 16px;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 8px;
              position: absolute;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
              transition: all 0.2s ease;
            }
            
            #ar-button:hover {
              background-color: #3367d6;
              transform: translateX(-50%) translateY(-2px);
              box-shadow: 0 6px 16px rgba(66, 133, 244, 0.4);
            }
            
            model-viewer[ar-status="session-started"] #ar-prompt {
              display: block;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background: rgba(0, 0, 0, 0.8);
              color: white;
              padding: 20px;
              border-radius: 12px;
              text-align: center;
              max-width: 300px;
              z-index: 1000;
            }
            
            model-viewer:not([ar-status="session-started"]) #ar-prompt {
              display: none;
            }
            
            .scanning-animation {
              width: 60px;
              height: 60px;
              margin: 0 auto 16px;
              position: relative;
              border: 2px solid rgba(255, 255, 255, 0.3);
              border-radius: 8px;
              overflow: hidden;
            }
            
            .scan-line {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 2px;
              background: linear-gradient(90deg, transparent, #4285f4, transparent);
              animation: scan 2s ease-in-out infinite;
            }
            
            @keyframes scan {
              0% { transform: translateY(0); }
              50% { transform: translateY(56px); }
              100% { transform: translateY(0); }
            }
            
            .prompt-text {
              margin: 0;
              font-size: 14px;
              line-height: 1.4;
            }
            
            model-viewer[ar-status="failed"] #ar-failure {
              display: block;
              position: absolute;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(244, 67, 54, 0.9);
              color: white;
              padding: 12px 20px;
              border-radius: 8px;
              text-align: center;
              max-width: 280px;
              z-index: 1000;
            }
            
            model-viewer:not([ar-status="failed"]) #ar-failure {
              display: none;
            }
            
            #ar-failure p {
              margin: 0;
              font-size: 13px;
              line-height: 1.3;
            }
          `;
          container.appendChild(style);
          
          // Wait for model-viewer to be ready
          const modelViewer = container.querySelector('model-viewer');
          if (modelViewer) {
            // Preload the model
            modelViewer.addEventListener('load', () => {
              setIsLoading(false);
              setCanUseAR((modelViewer as any).canActivateAR || true);
            });
            
            modelViewer.addEventListener('error', () => {
              setIsLoading(false);
              setHasError(true);
            });
            
            // Add AR session event listeners for better model persistence
            modelViewer.addEventListener('ar-status', (event: any) => {
              const status = event.detail.status;
              console.log('AR Status:', status);
              
              if (status === 'session-started') {
                // Ensure model is visible and properly positioned
                (modelViewer as any).updateFraming();
              }
            });
            
            // Force model to load immediately
            (modelViewer as any).dismissPoster();
          }
        }
      } catch (error) {
        console.error('Error loading model-viewer:', error);
        setIsLoading(false);
        setHasError(true);
      }
    };
    
    loadModelViewer();
  }, [arModel, productName, backgroundImage, placementMode]);

  const handleImageUpload = (imageUrl: string) => {
    setBackgroundImage(imageUrl);
  };

  const handleRemoveImage = () => {
    setBackgroundImage('');
    setShowPreview(false);
  };

  const handlePreview = () => {
    if (backgroundImage) {
      setShowPreview(true);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleARClick = async () => {
    try {
      const modelViewer = document.querySelector('model-viewer');
      
      if (modelViewer && (modelViewer as any).canActivateAR) {
        await (modelViewer as any).activateAR();
      } else if (arModel) {
        // Fallback for mobile devices - use absolute URL
        const modelSrc = arModel.startsWith('/') ? `${window.location.origin}${arModel}` : arModel;
        const arUrl = `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(modelSrc)}&mode=ar_only&resizable=false&link=${encodeURIComponent(window.location.href)}`;
        window.open(arUrl, '_blank');
      }
    } catch (error) {
      console.error('Error activating AR:', error);
      // Show user-friendly error message
      alert('Unable to start AR mode. Please make sure your device supports AR and try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Upload Component */}
      <ImageUploadAR 
        onImageUpload={handleImageUpload}
        onRemoveImage={handleRemoveImage}
        uploadedImage={backgroundImage}
        onPreview={handlePreview}
      />
      
      {/* AR Placement Mode Toggle */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">AR Placement Mode</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setPlacementMode('floor')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
              placementMode === 'floor'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Floor</span>
          </button>
          <button
            onClick={() => setPlacementMode('wall')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
              placementMode === 'wall'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Square className="w-4 h-4" />
            <span>Wall</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {placementMode === 'floor' 
            ? 'Place balloons on horizontal surfaces like floors and tables'
            : 'Attach balloons to vertical surfaces like walls and doors'
          }
        </p>
      </div>
      
      {/* Full-Screen Preview Modal */}
      {showPreview && backgroundImage && (
        <ImageARPreview
          backgroundImage={backgroundImage}
          arModel={arModel}
          productName={productName}
          onClose={handleClosePreview}
        />
      )}
      
      {/* 3D Model Viewer */}
      <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
        <div 
          id="model-viewer-container"
          className="w-full h-full relative"
        >
          {/* Model Viewer will be loaded here */}
        </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading 3D model...</p>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Failed to load 3D model</p>
          </div>
        </div>
      )}
      
      {/* AR Button - positioned over the model viewer */}
      {!isLoading && !hasError && (
        <button 
          onClick={handleARClick}
          disabled={!canUseAR}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 z-20"
        >
          <Eye className="w-5 h-5" />
          <span>View in AR</span>
        </button>
       )}
      </div>
    </div>
  );
}