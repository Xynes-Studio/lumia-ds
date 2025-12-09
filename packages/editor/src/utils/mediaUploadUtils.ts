/**
 * mediaUploadUtils - Pure utility functions for media upload handling.
 * Extracted from useSlashMediaUpload for testability (ADR-001 Tier 1).
 */

/**
 * Media types supported for upload.
 */
export type MediaType = 'image' | 'video' | 'file';

/**
 * Upload status for media nodes.
 */
export type UploadStatus = 'uploading' | 'uploaded' | 'error';

/**
 * Result from an upload operation.
 */
export interface UploadResult {
  url: string;
  mime?: string;
  size?: number;
}

/**
 * Error normalization result.
 */
export interface NormalizedError {
  error: Error;
  message: string;
}

/**
 * Check if media config has upload adapter.
 * @param mediaConfig - The media configuration
 * @returns True if upload is available
 */
export function hasUploadAdapter(
  mediaConfig: { uploadAdapter?: unknown } | null,
): boolean {
  return (
    mediaConfig?.uploadAdapter !== undefined &&
    mediaConfig?.uploadAdapter !== null
  );
}

/**
 * Extract filename from URL.
 * @param url - The URL to extract from
 * @param fallback - Fallback filename
 * @returns The extracted filename
 */
export function extractFilenameFromUrl(
  url: string,
  fallback: string = 'file',
): string {
  const parts = url.split('/');
  const filename = parts.pop();
  return filename && filename.length > 0 ? filename : fallback;
}

/**
 * Create preview URL for a file.
 * @param file - The file to create preview for
 * @returns Object URL for the file
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Normalize an error to ensure it's an Error instance.
 * @param error - Error of unknown type
 * @returns Normalized error object
 */
export function normalizeUploadError(error: unknown): NormalizedError {
  if (error instanceof Error) {
    return { error, message: error.message };
  }
  const normalizedError = new Error('Upload failed');
  return { error: normalizedError, message: 'Upload failed' };
}

/**
 * Build node status updates for successful upload.
 * @param result - The upload result
 * @param nodeType - Type of node being updated
 * @returns Object with status properties
 */
export function buildSuccessStatusUpdates(
  result: UploadResult,
  nodeType: MediaType,
): Record<string, unknown> {
  const srcKey = nodeType === 'file' ? '__url' : '__src';
  return {
    [srcKey]: result.url,
    __status: 'uploaded' as UploadStatus,
  };
}

/**
 * Build node status updates for failed upload.
 * @returns Object with error status
 */
export function buildErrorStatusUpdates(): Record<string, unknown> {
  return {
    __status: 'error' as UploadStatus,
  };
}

/**
 * Validate file before upload.
 * @param file - The file to validate
 * @param maxSizeMB - Maximum size in MB (optional)
 * @param allowedTypes - Allowed MIME types (optional)
 * @returns Validation result
 */
export function validateFileForUpload(
  file: File,
  maxSizeMB?: number,
  allowedTypes?: string[],
): { isValid: boolean; error?: string } {
  // Check file size
  if (maxSizeMB !== undefined) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB`,
      };
    }
  }

  // Check file type
  if (allowedTypes !== undefined && allowedTypes.length > 0) {
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Determine media type from file MIME type.
 * @param mimeType - The MIME type string
 * @returns The media type
 */
export function getMediaTypeFromMime(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  return 'file';
}

/**
 * Build image node payload.
 * @param previewUrl - Preview URL for the image
 * @param filename - Filename for alt text
 * @returns Node creation payload
 */
export function buildImageNodePayload(
  previewUrl: string,
  filename: string,
): { src: string; alt: string; status: UploadStatus } {
  return {
    src: previewUrl,
    alt: filename,
    status: 'uploading',
  };
}

/**
 * Build video node payload.
 * @param previewUrl - Preview URL for the video
 * @param filename - Filename for title
 * @returns Node creation payload
 */
export function buildVideoNodePayload(
  previewUrl: string,
  filename: string,
): { src: string; provider: 'html5'; title: string; status: UploadStatus } {
  return {
    src: previewUrl,
    provider: 'html5',
    title: filename,
    status: 'uploading',
  };
}

/**
 * Build file node payload.
 * @param previewUrl - Preview URL for the file
 * @param file - The file object
 * @returns Node creation payload
 */
export function buildFileNodePayload(
  previewUrl: string,
  file: File,
): {
  url: string;
  filename: string;
  size: number;
  mime: string;
  status: UploadStatus;
} {
  return {
    url: previewUrl,
    filename: file.name,
    size: file.size,
    mime: file.type,
    status: 'uploading',
  };
}
