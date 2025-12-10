import { describe, it, expect } from 'vitest';
import {
  defaultTheme,
  tokens,
  type ThemeTokens,
  themeToCSSVars,
} from './index';

describe('@lumia-ui/tokens', () => {
  it('exports tokens in ThemeTokens shape', () => {
    const theme: ThemeTokens = defaultTheme;

    expect(theme).toBeDefined();
    expect(typeof theme).toBe('object');
  });

  it('exposes defaultTheme as the primary theme export', () => {
    expect(defaultTheme).toEqual(tokens);
  });

  it('includes required color slots', () => {
    expect(defaultTheme.colors).toMatchObject({
      primary: expect.any(String),
      secondary: expect.any(String),
      background: expect.any(String),
      foreground: expect.any(String),
      border: expect.any(String),
      muted: expect.any(String),
      mutedForeground: expect.any(String),
      ring: expect.any(String),
      destructive: expect.any(String),
    });
    expect(defaultTheme.colors).toMatchObject({
      primary: '#18181b',
      secondary: '#f4f4f5',
      background: '#ffffff',
      foreground: '#09090b',
      border: '#e4e4e7',
      muted: '#f4f4f5',
      mutedForeground: '#71717a',
      ring: '#18181b',
      destructive: '#ef4444',
    });
  });

  it('exposes typography families, sizes, and weights', () => {
    expect(defaultTheme.typography.families).toMatchObject({
      sans: expect.any(String),
      mono: expect.any(String),
      display: expect.any(String),
    });
    expect(defaultTheme.typography.sizes).toMatchObject({
      xs: expect.any(String),
      sm: expect.any(String),
      md: expect.any(String),
      lg: expect.any(String),
      xl: expect.any(String),
      '2xl': expect.any(String),
    });
    expect(defaultTheme.typography.weights).toMatchObject({
      regular: expect.any(Number),
      medium: expect.any(Number),
      semibold: expect.any(Number),
      bold: expect.any(Number),
    });
  });

  it('covers spacing, radii, and shadows', () => {
    expect(defaultTheme.spacing).toMatchObject({
      xxs: expect.any(String),
      xs: expect.any(String),
      sm: expect.any(String),
      md: expect.any(String),
      lg: expect.any(String),
      xl: expect.any(String),
      '2xl': expect.any(String),
    });
    expect(defaultTheme.radii).toMatchObject({
      xs: expect.any(String),
      sm: expect.any(String),
      md: expect.any(String),
      lg: expect.any(String),
      pill: expect.any(String),
    });
    expect(defaultTheme.shadows).toMatchObject({
      xs: expect.any(String),
      sm: expect.any(String),
      md: expect.any(String),
      lg: expect.any(String),
      inset: expect.any(String),
    });
  });
});

describe('themeToCSSVars', () => {
  it('flattens theme object into CSS variables', () => {
    const vars = themeToCSSVars(
      {
        colors: {
          primary: '#000',
          background: '#fff',
        },
        spacing: {
          sm: '4px',
        },
      } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      '-',
    );

    expect(vars).toEqual({
      '--colors-primary': '#000',
      '--colors-background': '#fff',
      '--spacing-sm': '4px',
    });
  });

  it('handles nested objects correctly', () => {
    const vars = themeToCSSVars({
      typography: {
        h1: {
          fontSize: '2rem',
          fontWeight: 'bold',
        },
      },
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    expect(vars).toEqual({
      '--typography-h1-fontSize': '2rem',
      '--typography-h1-fontWeight': 'bold',
    });
  });
});
