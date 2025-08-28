declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'camera-controls'?: boolean;
        'touch-action'?: string;
        'auto-rotate'?: boolean;
        'auto-rotate-delay'?: string;
        'rotation-per-second'?: string;
        loading?: 'auto' | 'lazy' | 'eager';
        reveal?: 'auto' | 'interaction' | 'manual';
        'environment-image'?: string;
        'skybox-image'?: string;
        'shadow-intensity'?: string;
        'shadow-softness'?: string;
        'exposure'?: string;
        'tone-mapping'?: string;
        ref?: React.Ref<any>;
      },
      HTMLElement
    >;
  }
}

declare module '@google/model-viewer' {
  const ModelViewer: any;
  export default ModelViewer;
}