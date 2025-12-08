export interface MediaUploadAdapter {
  uploadFile: (
    file: File,
  ) => Promise<{ url: string; mime: string; size: number }>;
}

/**
 * Lifecycle callbacks for media upload operations.
 * These are invoked during upload to allow consumers to track progress,
 * show notifications, log analytics, or handle errors with custom logic.
 */
export interface MediaUploadCallbacks {
  /** Called when an upload starts */
  onUploadStart?: (file: File, mediaType: 'image' | 'video' | 'file') => void;
  /** Called with progress updates (0-100) */
  onUploadProgress?: (file: File, progress: number) => void;
  /** Called when an upload completes successfully */
  onUploadComplete?: (
    file: File,
    result: { url: string; mime: string; size: number },
  ) => void;
  /** Called when an upload fails */
  onUploadError?: (file: File, error: Error) => void;
}

export interface EditorMediaConfig {
  uploadAdapter?: MediaUploadAdapter;
  /** Optional callbacks for upload lifecycle events */
  callbacks?: MediaUploadCallbacks;
  allowedImageTypes?: string[];
  allowedVideoTypes?: string[];
  maxFileSizeMB?: number;
}

export const DEFAULT_ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const DEFAULT_ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export const DEFAULT_MAX_FILE_SIZE_MB = 5;

export const getEffectiveMediaConfig = (
  config?: EditorMediaConfig,
): EditorMediaConfig => {
  return {
    uploadAdapter: config?.uploadAdapter,
    callbacks: config?.callbacks,
    allowedImageTypes: config?.allowedImageTypes || DEFAULT_ALLOWED_IMAGE_TYPES,
    allowedVideoTypes: config?.allowedVideoTypes || DEFAULT_ALLOWED_VIDEO_TYPES,
    maxFileSizeMB: config?.maxFileSizeMB || DEFAULT_MAX_FILE_SIZE_MB,
  };
};
