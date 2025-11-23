import { describe, it, expect } from 'vitest';
import { tokens, type ThemeTokens } from './index';

describe('@lumia/tokens', () => {
    it('exports tokens in ThemeTokens shape', () => {
        const theme: ThemeTokens = tokens;

        expect(theme).toBeDefined();
        expect(typeof theme).toBe('object');
    });

    it('includes required color slots', () => {
        expect(tokens.colors).toMatchObject({
            primary: expect.any(String),
            secondary: expect.any(String),
            background: expect.any(String),
            foreground: expect.any(String),
            border: expect.any(String),
            muted: expect.any(String),
            destructive: expect.any(String),
        });
        expect(tokens.colors.primary).toBe('#0070f3');
    });

    it('exposes typography families, sizes, and weights', () => {
        expect(tokens.typography.families).toMatchObject({
            sans: expect.any(String),
            mono: expect.any(String),
            display: expect.any(String),
        });
        expect(tokens.typography.sizes).toMatchObject({
            xs: expect.any(String),
            sm: expect.any(String),
            md: expect.any(String),
            lg: expect.any(String),
            xl: expect.any(String),
            '2xl': expect.any(String),
        });
        expect(tokens.typography.weights).toMatchObject({
            regular: expect.any(Number),
            medium: expect.any(Number),
            semibold: expect.any(Number),
            bold: expect.any(Number),
        });
    });

    it('covers spacing, radii, and shadows', () => {
        expect(tokens.spacing).toMatchObject({
            xxs: expect.any(String),
            xs: expect.any(String),
            sm: expect.any(String),
            md: expect.any(String),
            lg: expect.any(String),
            xl: expect.any(String),
            '2xl': expect.any(String),
        });
        expect(tokens.radii).toMatchObject({
            xs: expect.any(String),
            sm: expect.any(String),
            md: expect.any(String),
            lg: expect.any(String),
            pill: expect.any(String),
        });
        expect(tokens.shadows).toMatchObject({
            xs: expect.any(String),
            sm: expect.any(String),
            md: expect.any(String),
            lg: expect.any(String),
            inset: expect.any(String),
        });
    });
});
