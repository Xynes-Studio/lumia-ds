import { act } from 'react';
import { describe, it, expect } from 'vitest';
import { createRoot } from 'react-dom/client';
import { defaultTheme, themeToCSSVars } from '@lumia/tokens';
import { ThemeProvider } from './theme-provider';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);

    return { root, host };
};

describe('ThemeProvider', () => {
    it('applies CSS variables to document.documentElement by default', async () => {
        const { root, host } = createTestRoot();

        await act(async () => {
            root.render(
                <ThemeProvider theme={defaultTheme}>
                    <div>child</div>
                </ThemeProvider>,
            );
        });

        const cssVars = themeToCSSVars(defaultTheme);
        Object.entries(cssVars).forEach(([name, value]) => {
            expect(document.documentElement.style.getPropertyValue(name)).toBe(value);
        });

        await act(async () => root.unmount());
        document.body.removeChild(host);
    });

    it('applies CSS variables to a provided element and restores previous values on unmount', async () => {
        const target = document.createElement('section');
        target.style.setProperty('--color-primary', 'hotpink');

        const { root, host } = createTestRoot();

        await act(async () => {
            root.render(
                <ThemeProvider theme={defaultTheme} target={target}>
                    <div>scoped</div>
                </ThemeProvider>,
            );
        });

        expect(target.style.getPropertyValue('--color-primary')).toBe(defaultTheme.colors.primary);
        expect(target.style.getPropertyValue('--color-bg')).toBe(defaultTheme.colors.background);

        await act(async () => root.unmount());

        expect(target.style.getPropertyValue('--color-primary')).toBe('hotpink');
        expect(target.style.getPropertyValue('--color-bg')).toBe('');
        document.body.removeChild(host);
    });
});
