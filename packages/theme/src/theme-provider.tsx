import { useEffect, useLayoutEffect, useMemo, type PropsWithChildren } from 'react';
import { themeToCSSVars, type ThemeTokens } from '@lumia/tokens';

type ThemeTarget = HTMLElement | null | undefined;

export type ThemeProviderProps = PropsWithChildren<{
    theme: ThemeTokens;
    /**
     * Optional element to scope CSS variables to. Defaults to document.documentElement.
     */
    target?: ThemeTarget;
}>;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const resolveTarget = (target?: ThemeTarget) => {
    if (target) return target;
    if (typeof document === 'undefined') return null;
    return document.documentElement;
};

export const ThemeProvider = ({ theme, target, children }: ThemeProviderProps) => {
    const cssVars = useMemo(() => themeToCSSVars(theme), [theme]);

    useIsomorphicLayoutEffect(() => {
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
    }, [cssVars, target]);

    return <>{children}</>;
};
