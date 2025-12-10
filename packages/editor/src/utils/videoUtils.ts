/**
 * Pure utility functions for video handling.
 * Extracted from video-related components for testability.
 */

/**
 * Supported video providers.
 */
export type VideoProvider = 'youtube' | 'vimeo' | 'loom' | 'html5';

/**
 * Detect video provider from URL.
 * @param url - The video URL
 * @returns The detected provider or undefined
 */
export function detectVideoProvider(url: string): VideoProvider | undefined {
  const trimmedUrl = url.trim().toLowerCase();

  if (trimmedUrl.includes('youtube.com') || trimmedUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (trimmedUrl.includes('vimeo.com')) {
    return 'vimeo';
  }
  if (trimmedUrl.includes('loom.com')) {
    return 'loom';
  }

  // Check for common video file extensions
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const urlWithoutQuery = trimmedUrl.split('?')[0];
  if (videoExtensions.some((ext) => urlWithoutQuery.endsWith(ext))) {
    return 'html5';
  }

  return undefined;
}

/**
 * Extract YouTube video ID from URL.
 * @param url - The YouTube URL
 * @returns The video ID or null
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Extract Vimeo video ID from URL.
 * @param url - The Vimeo URL
 * @returns The video ID or null
 */
export function extractVimeoId(url: string): string | null {
  const pattern = /vimeo\.com\/(\d+)/;
  const match = url.match(pattern);
  return match?.[1] ?? null;
}

/**
 * Extract Loom video ID from URL.
 * @param url - The Loom URL
 * @returns The video ID or null
 */
export function extractLoomId(url: string): string | null {
  const pattern = /loom\.com\/share\/([a-zA-Z0-9]+)/;
  const match = url.match(pattern);
  return match?.[1] ?? null;
}

/**
 * Generate embed URL for a video.
 * @param url - The original video URL
 * @param provider - The video provider
 * @returns The embed URL or the original URL
 */
export function getEmbedUrl(url: string, provider: VideoProvider): string {
  switch (provider) {
    case 'youtube': {
      const id = extractYouTubeId(url);
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    case 'vimeo': {
      const id = extractVimeoId(url);
      return id ? `https://player.vimeo.com/video/${id}` : url;
    }
    case 'loom': {
      const id = extractLoomId(url);
      return id ? `https://www.loom.com/embed/${id}` : url;
    }
    default:
      return url;
  }
}

/**
 * Check if URL is a valid video URL.
 * @param url - The URL to check
 * @returns True if valid
 */
export function isValidVideoUrl(url: string): boolean {
  try {
    new URL(url);
    return detectVideoProvider(url) !== undefined;
  } catch {
    return false;
  }
}

/**
 * Get thumbnail URL for a video.
 * @param url - The video URL
 * @param provider - The video provider
 * @returns Thumbnail URL or null
 */
export function getThumbnailUrl(
  url: string,
  provider: VideoProvider,
): string | null {
  switch (provider) {
    case 'youtube': {
      const id = extractYouTubeId(url);
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }
    case 'vimeo': {
      // Vimeo requires API call for thumbnail
      return null;
    }
    default:
      return null;
  }
}

/**
 * Format video duration from seconds.
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "1:30", "1:05:30")
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
