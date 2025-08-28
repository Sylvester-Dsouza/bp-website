declare module 'tracking' {
  interface TrackingStatic {
    Image: {
      grayscale(imageData: Uint8ClampedArray, width: number, height: number, fillRGBA?: boolean): Uint8ClampedArray;
      blur(imageData: Uint8ClampedArray, width: number, height: number, diameter: number): Uint8ClampedArray;
    };
    Fast: {
      THRESHOLD: number;
      findCorners(imageData: Uint8ClampedArray, width: number, height: number): number[];
    };
  }
  
  const tracking: TrackingStatic;
  export = tracking;
}