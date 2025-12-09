/**
 * Pure utility functions for toolbar handling.
 * Extracted from toolbar components for testability.
 */

/**
 * Block type identifiers.
 */
export type BlockType = 'paragraph' | 'heading' | 'code' | 'quote';

/**
 * Heading levels.
 */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/**
 * Text format types.
 */
export type TextFormatType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code';

/**
 * Get display label for block type.
 * @param type - The block type
 * @returns Display label
 */
export function getBlockTypeLabel(type: BlockType): string {
  switch (type) {
    case 'paragraph':
      return 'Paragraph';
    case 'heading':
      return 'Heading';
    case 'code':
      return 'Code Block';
    case 'quote':
      return 'Quote';
    default:
      return type;
  }
}

/**
 * Get display label for heading level.
 * @param level - The heading level
 * @returns Display label (e.g., "Heading 1")
 */
export function getHeadingLabel(level: HeadingLevel): string {
  const num = level.charAt(1);
  return `Heading ${num}`;
}

/**
 * Get keyboard shortcut for format.
 * @param format - The format type
 * @param isMac - Whether the current platform is Mac
 * @returns Keyboard shortcut string
 */
export function getFormatShortcut(
  format: TextFormatType,
  isMac: boolean = true,
): string {
  const mod = isMac ? '⌘' : 'Ctrl+';
  switch (format) {
    case 'bold':
      return `${mod}B`;
    case 'italic':
      return `${mod}I`;
    case 'underline':
      return `${mod}U`;
    case 'strikethrough':
      return `${mod}⇧S`;
    case 'code':
      return `${mod}E`;
    default:
      return '';
  }
}

/**
 * Check if format is active from selection.
 * @param formats - Object with format states
 * @param format - The format to check
 * @returns True if format is active
 */
export function isFormatActive(
  formats: Record<TextFormatType, boolean>,
  format: TextFormatType,
): boolean {
  return formats[format] ?? false;
}

/**
 * Toggle format in format object.
 * @param formats - Current format states
 * @param format - Format to toggle
 * @returns New format states object
 */
export function toggleFormat(
  formats: Record<TextFormatType, boolean>,
  format: TextFormatType,
): Record<TextFormatType, boolean> {
  return {
    ...formats,
    [format]: !formats[format],
  };
}

/**
 * Check if platform is Mac.
 * @param platform - The navigator.platform or userAgent string
 * @returns True if Mac
 */
export function isMacPlatform(platform: string): boolean {
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/**
 * Get modifier key for current platform.
 * @param isMac - Whether current platform is Mac
 * @returns Modifier key name
 */
export function getModifierKey(isMac: boolean): string {
  return isMac ? 'metaKey' : 'ctrlKey';
}

/**
 * Parse heading level from tag name.
 * @param tagName - HTML tag name (e.g., "H1", "h2")
 * @returns Heading level or null
 */
export function parseHeadingLevel(tagName: string): HeadingLevel | null {
  const match = tagName.toLowerCase().match(/^h([1-6])$/);
  if (match) {
    return `h${match[1]}` as HeadingLevel;
  }
  return null;
}

/**
 * Check if key event matches shortcut.
 * @param event - Keyboard event data
 * @param format - Format to check
 * @param isMac - Whether on Mac
 * @returns True if matches
 */
export function matchesShortcut(
  event: { key: string; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean },
  format: TextFormatType,
  isMac: boolean,
): boolean {
  const modKey = isMac ? event.metaKey : event.ctrlKey;
  if (!modKey) return false;

  const key = event.key.toLowerCase();
  switch (format) {
    case 'bold':
      return key === 'b';
    case 'italic':
      return key === 'i';
    case 'underline':
      return key === 'u';
    case 'strikethrough':
      return event.shiftKey && key === 's';
    case 'code':
      return key === 'e';
    default:
      return false;
  }
}

/**
 * Get default formats object.
 * @returns Default format states
 */
export function getDefaultFormats(): Record<TextFormatType, boolean> {
  return {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
  };
}
