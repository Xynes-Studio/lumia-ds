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
