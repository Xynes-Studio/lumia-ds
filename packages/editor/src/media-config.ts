export interface MediaUploadAdapter {
  uploadFile: (
    file: File,
  ) => Promise<{ url: string; mime: string; size: number }>;
}

export interface EditorMediaConfig {
  uploadAdapter?: MediaUploadAdapter;
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
    allowedImageTypes: config?.allowedImageTypes || DEFAULT_ALLOWED_IMAGE_TYPES,
    allowedVideoTypes: config?.allowedVideoTypes || DEFAULT_ALLOWED_VIDEO_TYPES,
    maxFileSizeMB: config?.maxFileSizeMB || DEFAULT_MAX_FILE_SIZE_MB,
  };
};
