/**
 * Font configuration types and utilities for Lumia Editor.
 * Provides curated Google Fonts with proper fallback stacks.
 */

/**
 * Metadata for a single font option.
 */
export interface FontMeta {
  /** Unique identifier for the font (e.g., "inter", "roboto") */
  id: string;
  /** Display label for the font (e.g., "Inter", "Roboto") */
  label: string;
  /** CSS font-family stack with fallbacks (e.g., "Inter, system-ui, -apple-system, sans-serif") */
  cssStack: string;
}

/**
 * Configuration for fonts available in the editor.
 */
export interface FontConfig {
  /** All available fonts */
  allFonts: FontMeta[];
  /** Optional subset of font IDs allowed for brand use. If undefined, all fonts are allowed. */
  allowedFonts?: string[];
  /** Default font ID to use (must exist in allFonts) */
  defaultFontId: string;
}

/**
 * Returns the default font configuration with a curated set of Google Fonts.
 * Each font includes proper fallback stacks per Google Fonts best practices.
 *
 * @returns Default FontConfig with 5 curated fonts
 */
export function getDefaultFontConfig(): FontConfig {
  return {
    allFonts: [
      {
        id: 'inter',
        label: 'Inter',
        cssStack: 'Inter, system-ui, -apple-system, sans-serif',
      },
      {
        id: 'roboto',
        label: 'Roboto',
        cssStack: 'Roboto, system-ui, -apple-system, sans-serif',
      },
      {
        id: 'lora',
        label: 'Lora',
        cssStack: 'Lora, Georgia, "Times New Roman", serif',
      },
      {
        id: 'roboto-mono',
        label: 'Roboto Mono',
        cssStack: 'Roboto Mono, Consolas, Monaco, "Courier New", monospace',
      },
      {
        id: 'playfair-display',
        label: 'Playfair Display',
        cssStack: 'Playfair Display, Georgia, "Times New Roman", serif',
      },
    ],
    defaultFontId: 'inter',
  };
}

/**
 * Normalizes a font configuration to enforce brand font restrictions.
 * If defaultFontId is not in allowedFonts, maps it to the first allowed font.
 *
 * @param config - The font configuration to normalize
 * @returns Normalized font configuration
 *
 * @example
 * ```ts
 * const config = {
 *   allFonts: [inter, roboto, lora],
 *   allowedFonts: ['inter', 'roboto'],
 *   defaultFontId: 'lora' // not in allowedFonts
 * };
 * const normalized = normalizeFontConfig(config);
 * // normalized.defaultFontId === 'inter' (first allowed font)
 * ```
 */
export function normalizeFontConfig(config: FontConfig): FontConfig {
  // If no allowedFonts restriction, return as-is
  if (!config.allowedFonts || config.allowedFonts.length === 0) {
    if (config.allowedFonts && config.allowedFonts.length === 0) {
      console.warn(
        'FontConfig has empty allowedFonts array. No font restrictions will be applied.',
      );
    }
    return config;
  }

  // If defaultFontId is already in allowedFonts, return as-is
  if (config.allowedFonts.includes(config.defaultFontId)) {
    return config;
  }

  // defaultFontId is not in allowedFonts, map to first allowed font
  return {
    ...config,
    defaultFontId: config.allowedFonts[0],
  };
}
