import { describe, it, expect } from 'vitest';
import { tokens as theme } from '../src/index';
import * as AllExports from '../src/index';

describe('Token Generation', () => {
  it('should generate color tokens', () => {
    expect(theme.colors.primary).toBeDefined();
    // theme.colors.primary is ColorPrimaryBase (#18181b)
    expect(theme.colors.primary).toBe('#18181b');

    // Iterate all generated tokens to ensure they are strings (improves coverage)
    // We filter for keys starting with 'Color', 'Spacing', etc. or just check everything that looks like a token
    Object.keys(AllExports).forEach((key) => {
      if (key === 'defaultTheme' || key === 'tokens') return;
      const val = (AllExports as Record<string, unknown>)[key];
      expect(typeof val).toBe('string');
    });

    expect(AllExports.ColorBackground).toBeDefined();
    expect(AllExports.ColorBackground).toBe('#ffffff');
  });

  it('should export all generated tokens', () => {
    Object.values(AllExports).forEach((value) => {
      expect(value).toBeDefined();
    });
  });

  it('should generate spacing tokens', () => {
    expect(AllExports.SpacingMd).toBe('16px');
  });

  it('should generate typography tokens', () => {
    // Note: Style Dictionary might escape quotes differently or keep them as is.
    // The generated file has single quotes wrapping the string which contains double quotes.
    expect(AllExports.FontFamilySans).toContain('Inter');
  });
});
