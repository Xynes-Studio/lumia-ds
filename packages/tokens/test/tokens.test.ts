import { describe, it, expect } from 'vitest';
import * as tokens from '../dist/ts/tokens';

describe('Token Generation', () => {
  it('should generate color tokens', () => {
    expect(tokens.ColorPrimary).toBeDefined();
    expect(tokens.ColorPrimary).toBe('#18181b');

    expect(tokens.ColorBackground).toBeDefined();
    expect(tokens.ColorBackground).toBe('#ffffff');
  });

  it('should generate spacing tokens', () => {
    expect(tokens.SpacingMd).toBe('16px');
  });

  it('should generate typography tokens', () => {
    // Note: Style Dictionary might escape quotes differently or keep them as is.
    // The generated file has single quotes wrapping the string which contains double quotes.
    expect(tokens.FontFamilySans).toContain('Inter');
  });
});
