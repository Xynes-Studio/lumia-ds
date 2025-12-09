import { describe, it, expect } from 'vitest';
import * as Tokens from '../src/generated/tokens';
import { tokens as themeTokens } from '../src/index';

describe('Token Regression Tests', () => {
  it('matches the full token snapshot', () => {
    // Snapshot the raw generated tokens
    expect(Tokens).toMatchSnapshot();
  });

  it('matches the theme token structure snapshot', () => {
    // Snapshot the structural theme object
    expect(themeTokens).toMatchSnapshot();
  });

  it('contains expected color tokens', () => {
    expect(Object.keys(Tokens)).toEqual(
      expect.arrayContaining([
        'ColorNeutral50',
        'ColorNeutral950',
        'ColorPrimaryBase',
        'ColorDestructive',
      ])
    );
  });

  it('contains expected spacing tokens', () => {
    expect(Object.keys(Tokens)).toEqual(
      expect.arrayContaining([
        'SpacingXs',
        'SpacingXl',
      ])
    );
  });
});
