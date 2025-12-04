/**
 * Metadata for a single font.
 */
export interface FontMeta {
  /** Unique identifier for the font. */
  id: string;
  /** Display label for the font. */
  label: string;
  /** Category of the font (serif, sans-serif, or monospace). */
  category?: 'serif' | 'sans' | 'mono';
}

/**
 * Configuration for fonts available in the editor.
 */
export interface FontConfig {
  /** All available fonts in the system. */
  allFonts: FontMeta[];
  /** Optional whitelist of font IDs. If provided, only these fonts are available. */
  allowedFonts?: string[];
  /** Default font ID to use when no font is explicitly set. */
  defaultFontId: string;
}

/**
 * Default font configuration with a curated set of brand and common fonts.
 */
export const DEFAULT_FONT_CONFIG: FontConfig = {
  allFonts: [
    { id: 'inter', label: 'Inter', category: 'sans' },
    { id: 'roboto', label: 'Roboto', category: 'sans' },
    { id: 'open-sans', label: 'Open Sans', category: 'sans' },
    { id: 'montserrat', label: 'Montserrat', category: 'sans' },
    { id: 'lora', label: 'Lora', category: 'serif' },
    { id: 'merriweather', label: 'Merriweather', category: 'serif' },
    { id: 'roboto-mono', label: 'Roboto Mono', category: 'mono' },
    { id: 'source-code-pro', label: 'Source Code Pro', category: 'mono' },
  ],
  defaultFontId: 'inter',
};

/**
 * Get the list of fonts that are available based on the configuration.
 * If allowedFonts is provided, only those fonts are returned.
 * Otherwise, all fonts from allFonts are returned.
 *
 * @param config Font configuration
 * @returns Array of available fonts
 */
export function getAvailableFonts(config: FontConfig): FontMeta[] {
  if (!config.allowedFonts || config.allowedFonts.length === 0) {
    return config.allFonts;
  }

  const allowedSet = new Set(config.allowedFonts);
  return config.allFonts.filter((font) => allowedSet.has(font.id));
}

/**
 * Normalize and validate a font ID against the configuration.
 * If the font ID is undefined, invalid, or not in allowedFonts, returns the defaultFontId.
 *
 * @param fontId Font ID to normalize (may be undefined)
 * @param config Font configuration
 * @returns Valid font ID
 */
export function normalizeFontId(
  fontId: string | undefined,
  config: FontConfig,
): string {
  // If no fontId provided, use default
  if (!fontId) {
    return config.defaultFontId;
  }

  // Check if fontId exists in allFonts
  const fontExists = config.allFonts.some((font) => font.id === fontId);
  if (!fontExists) {
    return config.defaultFontId;
  }

  // If allowedFonts is specified, check if fontId is allowed
  if (config.allowedFonts && config.allowedFonts.length > 0) {
    const isAllowed = config.allowedFonts.includes(fontId);
    if (!isAllowed) {
      return config.defaultFontId;
    }
  }

  // Font is valid
  return fontId;
}
