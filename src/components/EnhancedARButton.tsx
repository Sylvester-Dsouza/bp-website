'use client';

import { useState, useEffect, useRef } from 'react';
import { Smartphone } from 'lucide-react';

interface EnhancedARButtonProps {
  arModel: string;
  productName: string;
  productId?: string;
}

export default function EnhancedARButton({ arModel, productName, productId }: EnhancedARButtonProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [canUseAR, setCanUseAR] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const modelViewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Detect device OS
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
      setIsAndroid(/android/.test(userAgent));
      
      // Load model-viewer if needed
      if (!customElements.get('model-viewer')) {
        import('@google/model-viewer')
          .then(() => {
            console.log('Model viewer loaded successfully');
          })
          .catch(error => {
            console.error('Error loading model-viewer:', error);
            setHasError(true);
          });
      }
    }
    
    // Set loading to false after a delay to simulate model loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleARClick = () => {
    try {
      // Ensure model path is absolute
      const modelSrc = arModel.startsWith('/') 
        ? `${window.location.origin}${arModel}` 
        : arModel;
      
      if (isIOS) {
        // iOS QuickLook AR - convert GLB to USDZ if needed
        const iosSrc = modelSrc.endsWith('.glb') 
          ? modelSrc.replace('.glb', '.usdz') 
          : modelSrc;
          
        // Use iOS AR QuickLook
        window.location.href = `${iosSrc}#allowsContentScaling=0`;
      } else if (isAndroid) {
        // Android Scene Viewer with intent URL
        const sceneViewerUrl = `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(modelSrc)}&mode=ar_preferred&title=${encodeURIComponent(productName)}&resizable=false`;
        
        // Use intent:// protocol for better AR experience
        const intent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(modelSrc)}&mode=ar_preferred&title=${encodeURIComponent(productName)}&resizable=false#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end;`;
        
        window.location.href = intent;
      } else {
        // Fallback for other devices - open in new tab
        const arUrl = `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(modelSrc)}&mode=ar_preferred&title=${encodeURIComponent(productName)}`;
        window.open(arUrl, '_blank');
      }
    } catch (error) {
      console.error('Error launching AR:', error);
      alert('Unable to start AR mode. Please make sure your device supports AR and try again.');
    }
  };

  return (
    <div className="space-y-3">
      
      {/* AR Button */}
      <div className="relative">
        <button 
          onClick={handleARClick}
          disabled={isLoading || hasError}
          className="bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-md font-medium text-sm transition-all duration-150 flex items-center justify-center space-x-2 w-full tracking-wide disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Smartphone className="w-4 h-4" />
          <span>VIEW IN AR</span>
        </button>
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span className="text-white text-xs">Loading AR...</span>
            </div>
          </div>
        )}
        
        {/* Error Indicator */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-80 rounded-md">
            <span className="text-white text-xs">Failed to load AR</span>
          </div>
        )}
      </div>
      
      <p className="text-xs text-center text-gray-500">
        {isIOS ? 'Compatible with Apple AR' : isAndroid ? 'Compatible with Android AR' : 'AR compatibility varies by device'}
      </p>
    </div>
  );
}
