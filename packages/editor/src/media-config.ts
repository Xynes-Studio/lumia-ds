/**
 * Options for file upload operations.
 */
export interface UploadOptions {
  /** Called with progress updates (0-100) during upload */
  onProgress?: (progress: number) => void;
}

/**
 * Adapter interface for handling file uploads.
 * Consumers implement this to integrate with their backend.
 */
export interface MediaUploadAdapter {
  /**
   * Upload a file and return its URL.
   * @param file - The file to upload
   * @param options - Optional upload configuration including progress callback
   * @returns Promise resolving to upload result with URL, mime type, and size
   */
  uploadFile: (
    file: File,
    options?: UploadOptions,
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

/**
 * Configuration for media handling in the editor.
 * Allows customizing upload behavior, file type restrictions, and size limits.
 */
export interface EditorMediaConfig {
  /** Optional adapter for handling file uploads to your backend */
  uploadAdapter?: MediaUploadAdapter;
  /** Optional callbacks for upload lifecycle events */
  callbacks?: MediaUploadCallbacks;
  /** Allowed MIME types for image uploads (defaults to jpeg, png, gif, webp, svg) */
  allowedImageTypes?: string[];
  /** Allowed MIME types for video uploads (defaults to mp4, webm) */
  allowedVideoTypes?: string[];
  /** Maximum file size in megabytes (defaults to 5MB) */
  maxFileSizeMB?: number;
}

/** Default allowed MIME types for image uploads */
export const DEFAULT_ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

/** Default allowed MIME types for video uploads */
export const DEFAULT_ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

/** Default maximum file size in megabytes */
export const DEFAULT_MAX_FILE_SIZE_MB = 5;

/**
 * Returns an effective media configuration with defaults applied.
 * Any undefined options are filled with sensible defaults.
 *
 * @param config - Optional partial media configuration
 * @returns Complete media configuration with defaults applied
 *
 * @example
 * ```ts
 * const config = getEffectiveMediaConfig({
 *   uploadAdapter: myAdapter,
 *   maxFileSizeMB: 10,
 * });
 * // config.allowedImageTypes will use defaults
 * // config.maxFileSizeMB will be 10
 * ```
 */
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
