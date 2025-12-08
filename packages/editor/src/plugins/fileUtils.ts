/**
 * Pure utility functions for file handling.
 * Extracted from InsertFilePlugin for testability.
 */

/**
 * Validate file size against maximum allowed.
 * @param fileSizeBytes - The file size in bytes
 * @param maxSizeMB - Maximum allowed size in megabytes
 * @returns True if valid (within limit), false if exceeds limit
 */
export function validateFileSize(
    fileSizeBytes: number,
    maxSizeMB: number | undefined,
): boolean {
    if (maxSizeMB === undefined) return true;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return fileSizeBytes <= maxSizeBytes;
}

/**
 * Get file size error message.
 * @param maxSizeMB - Maximum allowed size in megabytes
 * @returns Error message string
 */
export function getFileSizeErrorMessage(maxSizeMB: number): string {
    return `File size exceeds ${maxSizeMB}MB`;
}

/**
 * Format file size for display.
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.2 MB", "500 KB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename.
 * @param filename - The file name
 * @returns Extension without dot, or empty string if none
 */
export function getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1 || lastDot === filename.length - 1) return '';
    return filename.substring(lastDot + 1).toLowerCase();
}

/**
 * Check if file type is in allowed list.
 * @param mimeType - The file MIME type
 * @param allowedTypes - Array of allowed MIME types or patterns
 * @returns True if allowed
 */
export function isFileTypeAllowed(
    mimeType: string,
    allowedTypes: string[] | undefined,
): boolean {
    if (!allowedTypes || allowedTypes.length === 0) return true;

    return allowedTypes.some((allowed) => {
        if (allowed.endsWith('/*')) {
            // Wildcard match (e.g., "image/*")
            const category = allowed.slice(0, -2);
            return mimeType.startsWith(category + '/');
        }
        return mimeType === allowed;
    });
}

/**
 * Create file metadata object from File.
 * @param file - The File object
 * @returns Metadata object with filename, size, mime
 */
export function extractFileMetadata(file: File): {
    filename: string;
    size: number;
    mime: string;
} {
    return {
        filename: file.name,
        size: file.size,
        mime: file.type || 'application/octet-stream',
    };
}

/**
 * Determine icon type based on MIME type.
 * @param mimeType - The file MIME type
 * @returns Icon identifier string
 */
export function getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    return 'file';
}
