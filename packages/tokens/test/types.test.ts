import { describe, it, expectTypeOf } from 'vitest';
import { tokens, type ThemeTokens } from '../src/index';

describe('Token Type Checks', () => {
  it('matches ThemeTokens interface', () => {
    expectTypeOf(tokens).toMatchTypeOf<ThemeTokens>();
  });

  it('has correct color keys', () => {
    expectTypeOf(tokens.colors).toHaveProperty('primary');
    expectTypeOf(tokens.colors).toHaveProperty('secondary');
    expectTypeOf(tokens.colors).toHaveProperty('destructive');
    expectTypeOf(tokens.colors).toHaveProperty('background');
    expectTypeOf(tokens.colors).toHaveProperty('foreground');
  });

  it('has correct spacing keys', () => {
    expectTypeOf(tokens.spacing).toHaveProperty('md');
    expectTypeOf(tokens.spacing).toHaveProperty('xl');
  });

  it('values are strings', () => {
    expectTypeOf(tokens.colors.primary).toBeString();
    expectTypeOf(tokens.spacing.md).toBeString();
  });
});
