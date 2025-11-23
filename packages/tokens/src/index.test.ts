import { describe, it, expect } from 'vitest';
import { defaultTheme, tokens, type ThemeTokens } from './index';
import { themeToCSSVars } from './theme-to-css-vars';

describe('@lumia/tokens', () => {
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
            destructive: expect.any(String),
        });
        expect(defaultTheme.colors).toMatchObject({
            primary: '#0f172a',
            secondary: '#f1f5f9',
            background: '#ffffff',
            foreground: '#020817',
            border: '#e2e8f0',
            muted: '#f1f5f9',
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

    it('maps theme tokens to CSS variables', () => {
        const cssVars = themeToCSSVars(defaultTheme);
        const primaryStops = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];

        primaryStops.forEach((stop) => {
            expect(cssVars[`--color-primary-${stop}`]).toEqual(expect.any(String));
        });
        expect(cssVars['--color-primary']).toBe(defaultTheme.colors.primary);
        expect(cssVars['--color-secondary']).toBe(defaultTheme.colors.secondary);
        expect(cssVars['--color-bg']).toBe(defaultTheme.colors.background);
        expect(cssVars['--color-fg']).toBe(defaultTheme.colors.foreground);
        expect(cssVars['--color-border']).toBe(defaultTheme.colors.border);
        expect(cssVars['--color-muted']).toBe(defaultTheme.colors.muted);
        expect(cssVars['--color-destructive']).toBe(defaultTheme.colors.destructive);
        expect(cssVars['--font-sans']).toBe(defaultTheme.typography.families.sans);
        expect(cssVars['--font-mono']).toBe(defaultTheme.typography.families.mono);
        expect(cssVars['--font-display']).toBe(defaultTheme.typography.families.display);
        expect(cssVars['--radius-md']).toBe(defaultTheme.radii.md);
        expect(cssVars['--radius-pill']).toBe(defaultTheme.radii.pill);
    });

    it('normalizes shorthand hex codes for the primary scale', () => {
        const themeWithShortHex: ThemeTokens = {
            ...defaultTheme,
            colors: {
                ...defaultTheme.colors,
                primary: '#abc',
            },
        };

        const cssVars = themeToCSSVars(themeWithShortHex);
        expect(cssVars['--color-primary']).toBe('#aabbcc');
        expect(cssVars['--color-primary-50']).toEqual(expect.stringMatching(/^#/));
    });

    it('falls back gracefully when the primary color is not hex-like', () => {
        const themedWithCustomVar: ThemeTokens = {
            ...defaultTheme,
            colors: {
                ...defaultTheme.colors,
                primary: 'var(--brand-primary)',
            },
        };

        const cssVars = themeToCSSVars(themedWithCustomVar);
        expect(cssVars['--color-primary-500']).toBe('var(--brand-primary)');
        expect(cssVars['--color-primary-900']).toBe('var(--brand-primary)');
    });
});
