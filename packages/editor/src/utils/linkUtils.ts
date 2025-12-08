/**
 * Pure utility functions for link handling.
 * Extracted from link-related plugins for testability.
 */

/**
 * Check if text is a valid URL.
 * @param text - Text to check
 * @returns True if valid URL
 */
export function isValidUrl(text: string): boolean {
  const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
  return urlPattern.test(text.trim());
}

/**
 * Extract domain from URL.
 * @param url - The URL
 * @returns Domain or null
 */
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * Normalize URL for display.
 * @param url - The URL
 * @returns Normalized URL
 */
export function normalizeUrlForDisplay(url: string): string {
  const trimmed = url.trim();
  // Remove trailing slash
  return trimmed.replace(/\/+$/, '');
}

/**
 * Check if URL is internal link.
 * @param url - The URL
 * @param currentDomain - Current site domain
 * @returns True if internal
 */
export function isInternalLink(url: string, currentDomain: string): boolean {
  const domain = extractDomain(url);
  if (!domain) return false;
  return domain === currentDomain || domain.endsWith(`.${currentDomain}`);
}

/**
 * Get link display text.
 * @param url - The URL
 * @param maxLength - Maximum length
 * @returns Display text
 */
export function getLinkDisplayText(
  url: string,
  maxLength: number = 50,
): string {
  const domain = extractDomain(url);
  if (!domain) return url.substring(0, maxLength);

  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    const display = domain + (path !== '/' ? path : '');

    if (display.length <= maxLength) return display;
    return display.substring(0, maxLength - 3) + '...';
  } catch {
    return url.substring(0, maxLength);
  }
}

/**
 * Check if URL needs HTTPS upgrade.
 * @param url - The URL
 * @returns True if HTTP (not HTTPS)
 */
export function needsHttpsUpgrade(url: string): boolean {
  return url.trim().toLowerCase().startsWith('http://');
}

/**
 * Sanitize URL for use in href.
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if dangerous
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  // Block javascript: and data: URLs
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '';
  }
  return trimmed;
}
