/**
 * Options for file upload operations.
 */
export interface UploadOptions {
  /** Called with progress updates (0-100) during upload */
  onProgress?: (progress: number) => void;
}

/**
 * Result of a successful upload via the {@link MediaUploadAdapter}.
 *
 * `url` is the immediately-usable delivery URL the editor inserts into the
 * node for display. Consumers integrating with a workspace storage service
 * (STORAGE-11) SHOULD also return `objectId` — a stable storage object id
 * — so the editor body can be persisted with the id rather than the URL
 * (signed delivery URLs expire and must never be saved into entry content).
 */
export interface MediaUploadResult {
  url: string;
  mime: string;
  size: number;
  /**
   * Stable storage object id (STORAGE-11). When present, the editor stores
   * it on the node and persistence layers MUST save the objectId instead of
   * `src`. The runtime can then resolve a fresh signed URL on next load via
   * {@link EditorMediaConfig.resolveDownloadUrl}.
   */
  objectId?: string;
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
   * @returns Promise resolving to upload result with URL, mime type, size,
   *   and (optionally) a stable workspace storage object id.
   */
  uploadFile: (
    file: File,
    options?: UploadOptions,
  ) => Promise<MediaUploadResult>;
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
  onUploadComplete?: (file: File, result: MediaUploadResult) => void;
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
  /**
   * Optional resolver invoked by media nodes that carry a stable
   * {@link MediaUploadResult.objectId} (STORAGE-11). Implementations should
   * return a short-lived signed delivery URL — e.g. via a workspace storage
   * service `download-url` action. Returning an empty string or rejecting
   * the promise leaves the node's existing `src` in place; the editor
   * deliberately does NOT surface the resolver error to the render path.
   *
   * Implementations MUST NOT return raw provider URLs, presigned signature
   * parameters as separate fields, provider credentials, or any other field
   * besides the signed delivery URL string.
   */
  resolveDownloadUrl?: (objectId: string) => Promise<string>;
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
    resolveDownloadUrl: config?.resolveDownloadUrl,
  };
};
