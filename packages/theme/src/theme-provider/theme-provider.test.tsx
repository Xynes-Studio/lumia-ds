import { act, useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { createRoot } from 'react-dom/client';
import { defaultTheme, themeToCSSVars } from '@lumia/tokens';
import { ThemeProvider } from '../index';
import {
  applyCssVarsToTarget,
  getIsomorphicLayoutEffect,
} from './theme-provider';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const createTestRoot = () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return { root, host };
};

describe('ThemeProvider', () => {
  it('defaults to light theme and applies data-theme attribute', async () => {
    const { root, host } = createTestRoot();

    await act(async () => {
      root.render(
        <ThemeProvider>
          <div>child</div>
        </ThemeProvider>,
      );
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('toggles theme attribute based on prop', async () => {
    const { root, host } = createTestRoot();
    const target = document.createElement('div');

    await act(async () => {
      root.render(
        <ThemeProvider theme="dark" target={target}>
          <div>child</div>
        </ThemeProvider>,
      );
    });

    expect(target.getAttribute('data-theme')).toBe('dark');

    await act(async () => {
      root.render(
        <ThemeProvider theme="blue" target={target}>
          <div>child</div>
        </ThemeProvider>,
      );
    });

    expect(target.getAttribute('data-theme')).toBe('blue');

    await act(async () => root.unmount());
    expect(target.hasAttribute('data-theme')).toBe(false);
    document.body.removeChild(host);
  });

  it('supports legacy theme object', async () => {
    const { root, host } = createTestRoot();
    const legacyTheme = {
      ...defaultTheme,
      colors: { ...defaultTheme.colors, primary: 'legacy-color' },
    };

    await act(async () => {
      root.render(
        <ThemeProvider theme={legacyTheme}>
          <div>child</div>
        </ThemeProvider>,
      );
    });

    const cssVars = themeToCSSVars(legacyTheme);
    Object.entries(cssVars).forEach(([name, value]) => {
      expect(document.documentElement.style.getPropertyValue(name)).toBe(value);
    });

    await act(async () => root.unmount());
    document.body.removeChild(host);
  });

  it('falls back to useEffect when window is undefined', () => {
    const originalWindow = (globalThis as Record<string, unknown>).window;
    delete (globalThis as Record<string, unknown>).window;

    expect(getIsomorphicLayoutEffect()).toBe(useEffect);

    (globalThis as Record<string, unknown>).window = originalWindow;
  });

  it('no-ops when document is unavailable', () => {
    const cssVars = themeToCSSVars(defaultTheme);
    const originalDocument = (globalThis as Record<string, unknown>).document;
    delete (globalThis as Record<string, unknown>).document;

    expect(applyCssVarsToTarget(undefined, cssVars)).toBeUndefined();

    (globalThis as Record<string, unknown>).document = originalDocument;
  });
});
