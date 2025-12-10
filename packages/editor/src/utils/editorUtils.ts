/**
 * Pure utility functions for editor state handling.
 * Extracted from various components for testability.
 */

/**
 * Editor mode types.
 */
export type EditorMode = 'edit' | 'read';

/**
 * Selection state.
 */
export interface SelectionState {
  hasSelection: boolean;
  isCollapsed: boolean;
  selectedText: string;
}

/**
 * Get default selection state.
 * @returns Default empty selection
 */
export function getDefaultSelectionState(): SelectionState {
  return {
    hasSelection: false,
    isCollapsed: true,
    selectedText: '',
  };
}

/**
 * Check if selection has content.
 * @param state - Selection state
 * @returns True if has selected text
 */
export function hasSelectedContent(state: SelectionState): boolean {
  return (
    state.hasSelection && !state.isCollapsed && state.selectedText.length > 0
  );
}

/**
 * Get word count from text.
 * @param text - Text content
 * @returns Word count
 */
export function getWordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Get character count from text.
 * @param text - Text content
 * @param includeSpaces - Whether to include spaces
 * @returns Character count
 */
export function getCharacterCount(
  text: string,
  includeSpaces: boolean = true,
): number {
  if (includeSpaces) {
    return text.length;
  }
  return text.replace(/\s/g, '').length;
}

/**
 * Truncate text with ellipsis.
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Debounce delay values.
 */
export const DEBOUNCE_DELAYS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/**
 * Get debounce delay.
 * @param type - Delay type
 * @returns Delay in milliseconds
 */
export function getDebounceDelay(type: keyof typeof DEBOUNCE_DELAYS): number {
  return DEBOUNCE_DELAYS[type];
}

/**
 * Check if text is URL.
 * @param text - Text to check
 * @returns True if valid URL
 */
export function isUrl(text: string): boolean {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract URLs from text.
 * @param text - Text content
 * @returns Array of URLs
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ?? [];
}

/**
 * Clean text for comparison.
 * @param text - Text to clean
 * @returns Normalized text
 */
export function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Check if two texts are similar.
 * @param a - First text
 * @param b - Second text
 * @returns True if similar (ignoring case and extra spaces)
 */
export function textsAreSimilar(a: string, b: string): boolean {
  return normalizeText(a) === normalizeText(b);
}
