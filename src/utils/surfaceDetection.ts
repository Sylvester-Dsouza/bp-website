export interface SurfacePoint {
  x: number;
  y: number;
  confidence: number;
}

export interface SurfaceAnalysis {
  suggestedPosition: { x: number; y: number };
  suggestedScale: number;
  surfacePoints: SurfacePoint[];
  dominantSurfaces: Array<{
    center: { x: number; y: number };
    area: number;
    confidence: number;
  }>;
}

// Dynamically import tracking.js only on client side
let trackingModule: any = null;

/**
 * Analyzes an image to detect flat surfaces and suggest optimal 3D object placement
 * @param imageElement - HTML image element to analyze
 * @returns Promise<SurfaceAnalysis> - Analysis results with suggested placement
 */
export async function analyzeSurface(imageElement: HTMLImageElement): Promise<SurfaceAnalysis> {
  if (typeof window === 'undefined') {
    throw new Error('Surface detection is only available in browser environment');
  }
  
  await ensureTrackingLoaded();
  
  return new Promise((resolve) => {
    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    ctx.drawImage(imageElement, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Convert to grayscale for tracking.js
    const gray = trackingModule.Image.grayscale(imageData.data, canvas.width, canvas.height);
    
    // Apply Gaussian blur to reduce noise
    const blurred = trackingModule.Image.blur(gray, canvas.width, canvas.height, 3);
    
    // Set FAST corner detection threshold
    trackingModule.Fast.THRESHOLD = 25;
    
    // Detect corners/features
    const corners = trackingModule.Fast.findCorners(blurred, canvas.width, canvas.height);
    
    // Convert corners to surface points
    const surfacePoints: SurfacePoint[] = [];
    for (let i = 0; i < corners.length; i += 2) {
      surfacePoints.push({
        x: (corners[i] / canvas.width) * 100, // Convert to percentage
        y: (corners[i + 1] / canvas.height) * 100,
        confidence: 0.8 // Default confidence
      });
    }
    
    // Analyze surface density to find optimal placement areas
    const dominantSurfaces = findDominantSurfaces(surfacePoints, canvas.width, canvas.height);
    
    // Determine suggested position and scale
    const suggestedPosition = calculateOptimalPosition(dominantSurfaces, canvas.width, canvas.height);
    const suggestedScale = calculateOptimalScale(dominantSurfaces, canvas.width, canvas.height);
    
    resolve({
      suggestedPosition,
      suggestedScale,
      surfacePoints,
      dominantSurfaces
    });
  });
}

/**
 * Finds dominant flat surfaces by clustering corner points
 */
function findDominantSurfaces(
  points: SurfacePoint[],
  imageWidth: number,
  imageHeight: number
): Array<{ center: { x: number; y: number }; area: number; confidence: number }> {
  if (points.length === 0) {
    // Return center as default if no features detected
    return [{
      center: { x: 50, y: 50 },
      area: 2500, // 50x50 area
      confidence: 0.3
    }];
  }
  
  // Simple clustering: divide image into grid and count points in each cell
  const gridSize = 8;
  const cellWidth = 100 / gridSize;
  const cellHeight = 100 / gridSize;
  const grid: number[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
  
  // Count points in each grid cell
  points.forEach(point => {
    const gridX = Math.min(Math.floor(point.x / cellWidth), gridSize - 1);
    const gridY = Math.min(Math.floor(point.y / cellHeight), gridSize - 1);
    grid[gridY][gridX]++;
  });
  
  // Find cells with low feature density (indicating flat surfaces)
  const surfaces: Array<{ center: { x: number; y: number }; area: number; confidence: number }> = [];
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const featureCount = grid[y][x];
      const maxFeatures = Math.max(1, points.length / (gridSize * gridSize) * 2);
      
      // Low feature count suggests flat surface
      if (featureCount <= maxFeatures) {
        const centerX = (x + 0.5) * cellWidth;
        const centerY = (y + 0.5) * cellHeight;
        const confidence = Math.max(0.1, 1 - (featureCount / maxFeatures));
        
        surfaces.push({
          center: { x: centerX, y: centerY },
          area: cellWidth * cellHeight,
          confidence
        });
      }
    }
  }
  
  // Sort by confidence and return top surfaces
  return surfaces
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

/**
 * Calculates optimal position based on dominant surfaces
 */
function calculateOptimalPosition(
  surfaces: Array<{ center: { x: number; y: number }; area: number; confidence: number }>,
  imageWidth: number,
  imageHeight: number
): { x: number; y: number } {
  if (surfaces.length === 0) {
    return { x: 50, y: 50 }; // Default center
  }
  
  // Use the most confident surface, but prefer surfaces in the lower half of the image
  // (more natural for object placement)
  const lowerSurfaces = surfaces.filter(s => s.center.y > 40);
  const targetSurfaces = lowerSurfaces.length > 0 ? lowerSurfaces : surfaces;
  
  const bestSurface = targetSurfaces[0];
  return {
    x: Math.max(20, Math.min(80, bestSurface.center.x)), // Keep within bounds
    y: Math.max(30, Math.min(70, bestSurface.center.y))
  };
}

/**
 * Calculates optimal scale based on surface analysis
 */
function calculateOptimalScale(
  surfaces: Array<{ center: { x: number; y: number }; area: number; confidence: number }>,
  imageWidth: number,
  imageHeight: number
): number {
  if (surfaces.length === 0) {
    return 2.5; // Default scale
  }
  
  // Base scale on image dimensions and surface confidence
  const avgConfidence = surfaces.reduce((sum, s) => sum + s.confidence, 0) / surfaces.length;
  const aspectRatio = imageWidth / imageHeight;
  
  // Larger scale for high confidence surfaces and wider images
  let scale = 2 + (avgConfidence * 2); // Range: 2-4
  
  // Adjust for aspect ratio
  if (aspectRatio > 1.5) {
    scale *= 1.2; // Slightly larger for wide images
  } else if (aspectRatio < 0.7) {
    scale *= 0.8; // Slightly smaller for tall images
  }
  
  return Math.max(1.5, Math.min(5, scale));
}

/**
 * Loads tracking.js if not already loaded
 */
export async function ensureTrackingLoaded(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Surface detection is only available in browser environment');
  }
  
  if (!trackingModule) {
    try {
      trackingModule = await import('tracking');
    } catch (error) {
      console.error('Failed to load tracking.js:', error);
      throw new Error('Failed to load surface detection library');
    }
  }
}