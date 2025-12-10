import {
  useEffect,
  useLayoutEffect,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { themeToCSSVars, type ThemeTokens } from '@lumia-ui/tokens';
import '@lumia-ui/tokens/dist/css/variables.css';

type ThemeTarget = HTMLElement | null | undefined;

export type ThemeProviderProps = PropsWithChildren<{
  theme?: string | ThemeTokens;
  /**
   * Optional element to scope CSS variables to. Defaults to document.documentElement.
   */
  target?: ThemeTarget;
}>;

export const getIsomorphicLayoutEffect = () =>
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const resolveTarget = (target?: ThemeTarget) => {
  if (target) return target;
  if (typeof document === 'undefined') return null;
  return document.documentElement;
};

export const applyCssVarsToTarget = (
  target: ThemeTarget,
  cssVars: Record<string, string>,
) => {
  const element = resolveTarget(target);
  if (!element) return;

  const previousValues = new Map<string, string>();

  Object.entries(cssVars).forEach(([name, value]) => {
    previousValues.set(name, element.style.getPropertyValue(name));
    element.style.setProperty(name, value);
  });

  return () => {
    previousValues.forEach((existingValue, name) => {
      if (existingValue) {
        element.style.setProperty(name, existingValue);
      } else {
        element.style.removeProperty(name);
      }
    });
  };
};

export const applyThemeToTarget = (target: ThemeTarget, theme: string) => {
  const element = resolveTarget(target);
  if (!element) return;

  const previousTheme = element.getAttribute('data-theme');
  element.setAttribute('data-theme', theme);

  return () => {
    if (previousTheme) {
      element.setAttribute('data-theme', previousTheme);
    } else {
      element.removeAttribute('data-theme');
    }
  };
};

export const ThemeProvider = ({
  theme = 'light',
  target,
  children,
}: ThemeProviderProps) => {
  const isLegacyTheme = typeof theme === 'object';
  // Legacy support: calculate CSS vars if theme is an object
  const cssVars = useMemo(() => {
    return isLegacyTheme ? themeToCSSVars(theme) : {};
  }, [theme, isLegacyTheme]);

  const useIsomorphicLayoutEffect = getIsomorphicLayoutEffect();

  useIsomorphicLayoutEffect(() => {
    if (isLegacyTheme) {
      return applyCssVarsToTarget(target, cssVars);
    }
    // New support: set data-theme attribute
    return applyThemeToTarget(target, theme as string);
  }, [theme, cssVars, target, isLegacyTheme]);

  return <>{children}</>;
};
