import { describe, it, expect } from 'vitest';
import {
  generatePrimaryScale,
  hexToRgba,
  contrast,
  // @ts-ignore
} from '../../sd-transforms.mjs';

describe('Color Transforms', () => {
  describe('generatePrimaryScale', () => {
    // Test case taken from existing runtime logic behavior to ensure parity
    it('should generate a full scale for a given base color', () => {
      // Example base color (Zinc-900ish from current tokens)
      const baseColor = '#18181b';
      const scale = generatePrimaryScale(baseColor);

      // Check keys
      const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      stops.forEach((stop) => {
        expect(scale[stop]).toBeDefined();
        expect(scale[stop]).toMatch(/^#[0-9a-f]{6}$/);
      });

      // Check specifically for 500 mapping to start (weight 0) or base logic
      // In the old logic:
      // 500 weight is 0.
      // If weight is 0, scale[stop] = rgbToHex(rgb). So 500 should be the base color.
      expect(scale[500]).toBe(baseColor);
    });

    it('should handle invalid hex by returning base color for all stops', () => {
      const baseColor = 'invalid-hex';
      const scale = generatePrimaryScale(baseColor);
      const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
      stops.forEach((stop) => {
        expect(scale[stop]).toBe(baseColor);
      });
    });
  });

  describe('hexToRgba', () => {
    it('should convert hex to rgba string', () => {
      expect(hexToRgba('#ffffff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
      expect(hexToRgba('#000000', 1)).toBe('rgba(0, 0, 0, 1)');
    });

    it('should return null for invalid hex', () => {
      expect(hexToRgba('foo', 0.5)).toBeNull();
    });
  });

  // Placeholder for contrast if we implement it now, or we can add it later.
  // Plan mentioned "Contrast-friendly variants".
  describe('contrast', () => {
    it('should calculate contrast ratio or return on-color', () => {
      // Simple check: dark bg -> white text, light bg -> black text
      expect(contrast('#000000')).toBe('#ffffff');
      expect(contrast('#ffffff')).toBe('#000000');
    });
  });
});
