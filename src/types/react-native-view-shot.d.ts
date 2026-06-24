declare module 'react-native-view-shot' {
  import { View } from 'react-native';

  interface CaptureOptions {
    width?: number;
    height?: number;
    format?: 'png' | 'jpg' | 'webm' | 'raw';
    quality?: number;
    result?: 'tmpfile' | 'base64' | 'data-uri' | 'zip-base64';
    snapshotContentContainer?: boolean;
    handleGLSurfaceViewOnAndroid?: boolean;
  }

  export function captureRef<T>(ref: React.RefObject<T>, options?: CaptureOptions): Promise<string>;
  export function releaseCapture(uri: string): void;
  export function captureScreen(options?: CaptureOptions): Promise<string>;
  export function ensureModuleIsLoaded(): void;
}
