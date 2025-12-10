import { describe, expect, it, vi } from 'vitest';
import {
  getDefaultFontConfig,
  normalizeFontConfig,
  type FontConfig,
  type FontMeta,
} from './font-config';

describe('font-config', () => {
  describe('getDefaultFontConfig', () => {
    it('returns a valid FontConfig structure', () => {
      const config = getDefaultFontConfig();

      expect(config).toHaveProperty('allFonts');
      expect(config).toHaveProperty('defaultFontId');
      expect(Array.isArray(config.allFonts)).toBe(true);
      expect(typeof config.defaultFontId).toBe('string');
    });

    it('has non-empty allFonts array', () => {
      const config = getDefaultFontConfig();

      expect(config.allFonts.length).toBeGreaterThan(0);
    });

    it('has valid defaultFontId that exists in allFonts', () => {
      const config = getDefaultFontConfig();

      const fontIds = config.allFonts.map((f) => f.id);
      expect(fontIds).toContain(config.defaultFontId);
    });

    it('each FontMeta has required properties', () => {
      const config = getDefaultFontConfig();

      config.allFonts.forEach((font: FontMeta) => {
        expect(font).toHaveProperty('id');
        expect(font).toHaveProperty('label');
        expect(font).toHaveProperty('cssStack');
        expect(typeof font.id).toBe('string');
        expect(typeof font.label).toBe('string');
        expect(typeof font.cssStack).toBe('string');
        expect(font.id.length).toBeGreaterThan(0);
        expect(font.label.length).toBeGreaterThan(0);
        expect(font.cssStack.length).toBeGreaterThan(0);
      });
    });

    it('CSS stacks include proper fallback fonts', () => {
      const config = getDefaultFontConfig();

      // Each font should have fallbacks (comma-separated values)
      config.allFonts.forEach((font: FontMeta) => {
        expect(font.cssStack).toContain(',');
      });
    });

    it('contains expected curated fonts', () => {
      const config = getDefaultFontConfig();
      const fontIds = config.allFonts.map((f) => f.id);

      // Verify some expected fonts are present
      expect(fontIds).toContain('inter');
      expect(fontIds).toContain('roboto');
      expect(fontIds).toContain('lora');
      expect(fontIds).toContain('roboto-mono');
      expect(fontIds).toContain('playfair-display');
    });

    it('default font is "inter"', () => {
      const config = getDefaultFontConfig();

      expect(config.defaultFontId).toBe('inter');
    });

    it('returns consistent config on multiple calls', () => {
      const config1 = getDefaultFontConfig();
      const config2 = getDefaultFontConfig();

      expect(config1).toEqual(config2);
    });
  });

  describe('normalizeFontConfig', () => {
    const mockFonts: FontMeta[] = [
      { id: 'inter', label: 'Inter', cssStack: 'Inter, sans-serif' },
      { id: 'roboto', label: 'Roboto', cssStack: 'Roboto, sans-serif' },
      { id: 'lora', label: 'Lora', cssStack: 'Lora, serif' },
    ];

    it('returns config unchanged when allowedFonts is undefined', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        defaultFontId: 'inter',
      };

      const result = normalizeFontConfig(config);

      expect(result).toEqual(config);
      expect(result.defaultFontId).toBe('inter');
    });

    it('returns config unchanged when allowedFonts is empty array', () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      const config: FontConfig = {
        allFonts: mockFonts,
        allowedFonts: [],
        defaultFontId: 'inter',
      };

      const result = normalizeFontConfig(config);

      expect(result).toEqual(config);
      expect(result.defaultFontId).toBe('inter');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'FontConfig has empty allowedFonts array. No font restrictions will be applied.',
      );

      consoleWarnSpy.mockRestore();
    });

    it('returns config unchanged when defaultFontId is in allowedFonts', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        allowedFonts: ['inter', 'roboto'],
        defaultFontId: 'inter',
      };

      const result = normalizeFontConfig(config);

      expect(result).toEqual(config);
      expect(result.defaultFontId).toBe('inter');
    });

    it('maps defaultFontId to first allowed font when defaultFontId is not in allowedFonts', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        allowedFonts: ['inter', 'roboto'],
        defaultFontId: 'lora', // not in allowedFonts
      };

      const result = normalizeFontConfig(config);

      expect(result.defaultFontId).toBe('inter'); // first in allowedFonts
      expect(result.allFonts).toEqual(mockFonts);
      expect(result.allowedFonts).toEqual(['inter', 'roboto']);
    });

    it('does not mutate the original config object', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        allowedFonts: ['inter', 'roboto'],
        defaultFontId: 'lora',
      };

      const originalDefaultFontId = config.defaultFontId;
      normalizeFontConfig(config);

      expect(config.defaultFontId).toBe(originalDefaultFontId);
    });

    it('handles case where defaultFontId is second in allowedFonts', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        allowedFonts: ['inter', 'roboto'],
        defaultFontId: 'roboto',
      };

      const result = normalizeFontConfig(config);

      expect(result.defaultFontId).toBe('roboto'); // unchanged
    });

    it('normalizes to first allowed font when multiple fonts are not allowed', () => {
      const config: FontConfig = {
        allFonts: mockFonts,
        allowedFonts: ['roboto'], // only one allowed
        defaultFontId: 'lora',
      };

      const result = normalizeFontConfig(config);

      expect(result.defaultFontId).toBe('roboto');
    });
  });
});
