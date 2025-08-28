'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface ARViewerProps {
  modelSrc: string;
  alt: string;
  poster?: string;
  className?: string;
  placementMode?: 'floor' | 'wall';
}

export default function ARViewer({ modelSrc, alt, poster, className = '', placementMode = 'floor' }: ARViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelViewerRef = useRef<any>(null);

  const handleARClick = () => {
    if (modelViewerRef.current) {
      (modelViewerRef.current as any).activateAR();
    }
  };

  useEffect(() => {
    const loadModelViewer = async () => {
      if (typeof window !== 'undefined' && containerRef.current) {
        // Dynamically import model-viewer
        await import('@google/model-viewer');
        
        // Create model-viewer element
        const modelViewer = document.createElement('model-viewer');
        modelViewer.setAttribute('src', modelSrc);
        modelViewer.setAttribute('alt', alt);
        if (poster) modelViewer.setAttribute('poster', poster);
        modelViewer.setAttribute('ar', '');
        modelViewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
        modelViewer.setAttribute('ar-scale', 'fixed');
        modelViewer.setAttribute('ar-placement', placementMode);
        modelViewer.setAttribute('xr-environment', '');
        modelViewer.setAttribute('camera-controls', '');
        modelViewer.setAttribute('camera-orbit', '0deg 75deg 4m');
         modelViewer.setAttribute('camera-target', '0m 0m 0m');
         modelViewer.setAttribute('field-of-view', '30deg');
         modelViewer.setAttribute('min-camera-orbit', 'auto auto 2m');
         modelViewer.setAttribute('max-camera-orbit', 'auto auto 8m');
        modelViewer.setAttribute('touch-action', 'pan-y');
        modelViewer.setAttribute('auto-rotate', '');
        modelViewer.setAttribute('auto-rotate-delay', '3000');
        modelViewer.setAttribute('rotation-per-second', '30deg');
        modelViewer.setAttribute('loading', 'eager');
        modelViewer.setAttribute('reveal', 'auto');
        modelViewer.setAttribute('interaction-prompt', 'auto');
        modelViewer.setAttribute('interaction-prompt-threshold', '2000');
        
        modelViewer.style.width = '100%';
        modelViewer.style.height = '100%';
        modelViewer.style.backgroundColor = '#f9fafb';
        
        // Add AR prompts and instructions
        const arPrompt = document.createElement('div');
        arPrompt.id = 'ar-prompt';
        arPrompt.innerHTML = `
          <div class="scanning-animation">
            <div class="scan-line"></div>
          </div>
          <p class="prompt-text">${placementMode === 'wall' ? 'Point your camera at a wall and move your phone slowly to detect the surface' : 'Point your camera at the floor and move your phone in a circular motion to detect the surface'}</p>
        `;
        containerRef.current.appendChild(arPrompt);
          
          const arFailure = document.createElement('div');
          arFailure.id = 'ar-failure';
          arFailure.innerHTML = `<p>Having trouble? Try moving to a well-lit area and point your camera at a ${placementMode === 'wall' ? 'plain wall' : 'flat floor surface'}.</p>`;
          containerRef.current.appendChild(arFailure);
         
         // Add CSS styles
         const style = document.createElement('style');
         style.textContent = `
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
        document.head.appendChild(style);
        
        // Create AR instructions overlay
        const arInstructions = document.createElement('div');
        arInstructions.className = 'absolute top-4 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg text-sm hidden z-10';
        const placementInstructions = placementMode === 'wall' 
          ? `
            <li>• Move your device to scan vertical surfaces</li>
            <li>• Tap on a wall to attach the balloon</li>
            <li>• Pinch to resize, drag to reposition</li>
            <li>• Step back to see the full wall display</li>
          `
          : `
            <li>• Move your device to scan horizontal surfaces</li>
            <li>• Tap on a flat surface to place the balloon</li>
            <li>• Pinch to resize, drag to move</li>
            <li>• Walk around to view from different angles</li>
          `;
        
        arInstructions.innerHTML = `
          <div class="flex items-center gap-2 mb-2">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span class="font-medium">AR ${placementMode === 'wall' ? 'Wall' : 'Floor'} Placement</span>
          </div>
          <ul class="space-y-1 text-xs">
            ${placementInstructions}
          </ul>
        `;
        
        modelViewer.appendChild(arInstructions);
        
        // Show instructions when AR session starts
        modelViewer.addEventListener('ar-status', (event: any) => {
          if (event.detail.status === 'session-started') {
            arInstructions.classList.remove('hidden');
            setTimeout(() => {
              arInstructions.classList.add('hidden');
            }, 8000); // Hide after 8 seconds
          }
        });
        
        // Add event listeners for better model loading
        modelViewer.addEventListener('load', () => {
          console.log('Model loaded successfully');
        });
        
        modelViewer.addEventListener('error', (error) => {
          console.error('Model loading error:', error);
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
        
        // Clear container and append model-viewer
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(modelViewer);
        
        // Force model to load immediately
        (modelViewer as any).dismissPoster();
        
        modelViewerRef.current = modelViewer;
      }
    };
    
    loadModelViewer();
  }, [modelSrc, alt, poster]);

  return (
    <Button 
      onClick={handleARClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center space-x-2"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor"/>
      </svg>
      <span>View in AR</span>
      <div ref={containerRef} className="hidden" />
    </Button>
  );
}