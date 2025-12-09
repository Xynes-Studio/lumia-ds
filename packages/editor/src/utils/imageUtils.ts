/**
 * Pure utility functions for image handling.
 * Extracted from image-related components for testability.
 */

/**
 * Image layout types.
 */
export type ImageLayout = 'default' | 'fullWidth' | 'breakout';

/**
 * Get layout class name.
 * @param layout - The image layout
 * @returns CSS class name
 */
export function getLayoutClassName(layout: ImageLayout): string {
  switch (layout) {
    case 'fullWidth':
      return 'image-full-width';
    case 'breakout':
      return 'image-breakout';
    default:
      return 'image-default';
  }
}

/**
 * Calculate aspect ratio from dimensions.
 * @param width - The width
 * @param height - The height
 * @returns Aspect ratio or null if invalid
 */
export function calculateAspectRatio(
  width: number,
  height: number,
): number | null {
  if (width <= 0 || height <= 0) return null;
  return width / height;
}

/**
 * Get dimensions to fit within max size while preserving aspect ratio.
 * @param originalWidth - Original width
 * @param originalHeight - Original height
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Fitted dimensions
 */
export function fitDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (originalWidth <= 0 || originalHeight <= 0) {
    return { width: 0, height: 0 };
  }

  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Check if URL is a valid image URL.
 * @param url - The URL to check
 * @returns True if valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  const imageExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
    '.avif',
  ];
  const lowerUrl = url.toLowerCase();
  const urlWithoutQuery = lowerUrl.split('?')[0];

  return imageExtensions.some((ext) => urlWithoutQuery.endsWith(ext));
}

/**
 * Get image format from URL or MIME type.
 * @param urlOrMime - URL or MIME type
 * @returns Format string or 'unknown'
 */
export function getImageFormat(urlOrMime: string): string {
  const lower = urlOrMime.toLowerCase();

  // Check MIME type
  if (lower.includes('image/')) {
    const format = lower.split('image/')[1];
    return format || 'unknown';
  }

  // Check file extension
  const urlWithoutQuery = lower.split('?')[0];
  const lastDot = urlWithoutQuery.lastIndexOf('.');
  if (lastDot !== -1) {
    return urlWithoutQuery.substring(lastDot + 1);
  }

  return 'unknown';
}

/**
 * Generate alt text from filename.
 * @param filename - The file name
 * @returns Generated alt text
 */
export function generateAltFromFilename(filename: string): string {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  // Replace hyphens and underscores with spaces
  const spacedName = nameWithoutExt.replace(/[-_]/g, ' ');
  // Capitalize first letter
  return spacedName.charAt(0).toUpperCase() + spacedName.slice(1);
}

/**
 * Check if image needs resizing.
 * @param width - Current width
 * @param maxWidth - Maximum allowed width
 * @returns True if needs resizing
 */
export function needsResizing(width: number, maxWidth: number): boolean {
  return width > maxWidth && maxWidth > 0;
}

/**
 * Calculate percentage width.
 * @param width - The image width
 * @param containerWidth - The container width
 * @returns Percentage value
 */
export function calculatePercentWidth(
  width: number,
  containerWidth: number,
): number {
  if (containerWidth <= 0) return 100;
  return Math.min(100, Math.round((width / containerWidth) * 100));
}

/**
 * Snap width to predefined points.
 * @param width - The width to snap
 * @param containerWidth - Container width
 * @param snapPoints - Array of percentage snap points
 * @returns Snapped width
 */
export function snapToWidth(
  width: number,
  containerWidth: number,
  snapPoints: number[] = [25, 50, 75, 100],
): number {
  const percentage = calculatePercentWidth(width, containerWidth);

  // Find closest snap point
  let closest = snapPoints[0];
  let minDiff = Math.abs(percentage - closest);

  for (const point of snapPoints) {
    const diff = Math.abs(percentage - point);
    if (diff < minDiff) {
      minDiff = diff;
      closest = point;
    }
  }

  // Only snap if within 5%
  if (minDiff <= 5) {
    return Math.round((closest / 100) * containerWidth);
  }

  return width;
}
