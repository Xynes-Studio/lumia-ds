import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FONT_CONFIG,
  FontConfig,
  FontMeta,
  getAvailableFonts,
  normalizeFontId,
} from './fontConfig';

describe('fontConfig', () => {
  describe('DEFAULT_FONT_CONFIG', () => {
    it('has all required properties', () => {
      expect(DEFAULT_FONT_CONFIG).toBeDefined();
      expect(DEFAULT_FONT_CONFIG.allFonts).toBeInstanceOf(Array);
      expect(DEFAULT_FONT_CONFIG.allFonts.length).toBeGreaterThan(0);
      expect(DEFAULT_FONT_CONFIG.defaultFontId).toBe('inter');
    });

    it('contains valid font metadata', () => {
      DEFAULT_FONT_CONFIG.allFonts.forEach((font) => {
        expect(font.id).toBeTruthy();
        expect(font.label).toBeTruthy();
        if (font.category) {
          expect(['serif', 'sans', 'mono']).toContain(font.category);
        }
      });
    });

    it('default font ID exists in allFonts', () => {
      const defaultFontExists = DEFAULT_FONT_CONFIG.allFonts.some(
        (font) => font.id === DEFAULT_FONT_CONFIG.defaultFontId,
      );
      expect(defaultFontExists).toBe(true);
    });
  });

  describe('getAvailableFonts', () => {
    const mockFonts: FontMeta[] = [
      { id: 'inter', label: 'Inter', category: 'sans' },
      { id: 'roboto', label: 'Roboto', category: 'sans' },
      { id: 'lora', label: 'Lora', category: 'serif' },
    ];

    it('returns all fonts when allowedFonts is undefined', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        defaultFontId: 'inter',
      };

      const available = getAvailableFonts(config);
      expect(available).toEqual(mockFonts);
      expect(available.length).toBe(3);
    });

    it('returns all fonts when allowedFonts is empty array', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        allowedFonts: [],
        defaultFontId: 'inter',
      };

      const available = getAvailableFonts(config);
      expect(available).toEqual(mockFonts);
      expect(available.length).toBe(3);
    });

    it('filters fonts when allowedFonts is provided', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        allowedFonts: ['inter', 'roboto'],
        defaultFontId: 'inter',
      };

      const available = getAvailableFonts(config);
      expect(available.length).toBe(2);
      expect(available.map((f) => f.id)).toEqual(['inter', 'roboto']);
    });

    it('returns empty array when allowedFonts contains no matching fonts', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        allowedFonts: ['nonexistent'],
        defaultFontId: 'inter',
      };

      const available = getAvailableFonts(config);
      expect(available.length).toBe(0);
    });
  });

  describe('normalizeFontId', () => {
    const mockFonts: FontMeta[] = [
      { id: 'inter', label: 'Inter', category: 'sans' },
      { id: 'roboto', label: 'Roboto', category: 'sans' },
      { id: 'lora', label: 'Lora', category: 'serif' },
    ];

    it('returns defaultFontId when fontId is undefined', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        defaultFontId: 'inter',
      };

      const normalized = normalizeFontId(undefined, config);
      expect(normalized).toBe('inter');
    });

    it('returns defaultFontId when fontId does not exist in allFonts', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        defaultFontId: 'inter',
      };

      const normalized = normalizeFontId('nonexistent', config);
      expect(normalized).toBe('inter');
    });

    it('returns fontId when it exists in allFonts and no allowedFonts is set', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        defaultFontId: 'inter',
      };

      const normalized = normalizeFontId('roboto', config);
      expect(normalized).toBe('roboto');
    });

    it('returns fontId when it exists in both allFonts and allowedFonts', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        allowedFonts: ['inter', 'roboto'],
        defaultFontId: 'inter',
      };

      const normalized = normalizeFontId('roboto', config);
      expect(normalized).toBe('roboto');
    });

    it('returns defaultFontId when fontId is not in allowedFonts', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        allowedFonts: ['inter', 'roboto'],
        defaultFontId: 'inter',
      };

      const normalized = normalizeFontId('lora', config);
      expect(normalized).toBe('inter');
    });

    it('returns defaultFontId when allowedFonts is empty array', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        allowedFonts: [],
        defaultFontId: 'inter',
      };

      // Empty allowedFonts should be treated same as undefined (return all)
      const normalized = normalizeFontId('roboto', config);
      expect(normalized).toBe('roboto');
    });
  });
});
