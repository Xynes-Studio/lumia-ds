import { describe, expect, it } from 'vitest';
import { getDefaultFontConfig, type FontMeta } from './font-config';

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
});
