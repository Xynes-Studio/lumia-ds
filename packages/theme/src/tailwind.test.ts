import { describe, it, expect } from 'vitest';
import { defaultTheme, themeToCSSVars } from '@lumia/tokens';
import { createLumiaTailwindConfig, lumiaTailwindPreset } from './tailwind';

const cssVars = themeToCSSVars(defaultTheme);

describe('Tailwind preset', () => {
  it('exposes a reusable preset and factory', () => {
    const freshConfig = createLumiaTailwindConfig();

    expect(lumiaTailwindPreset).toBeDefined();
    expect(freshConfig).toEqual(lumiaTailwindPreset);
    expect(freshConfig).not.toBe(lumiaTailwindPreset);
  });

  it('maps color tokens to CSS variables with fallbacks', () => {
    const preset = createLumiaTailwindConfig();
    const colors = (
      preset.theme as { extend: { colors: Record<string, unknown> } }
    ).extend.colors;

    expect((colors.primary as Record<string, string>)['500']).toBe(
      `var(--color-primary-500, ${cssVars['--color-primary-500']})`,
    );
    expect((colors.primary as Record<string, string>).DEFAULT).toBe(
      `var(--color-primary, ${cssVars['--color-primary']})`,
    );
    expect(colors.secondary).toBe(
      `var(--color-secondary, ${cssVars['--color-secondary']})`,
    );
    expect(colors.background).toBe(`var(--color-bg, ${cssVars['--color-bg']})`);
    expect(colors.foreground).toBe(`var(--color-fg, ${cssVars['--color-fg']})`);
    expect(colors.border).toBe(
      `var(--color-border, ${cssVars['--color-border']})`,
    );
    expect(colors.muted).toBe(
      `var(--color-muted, ${cssVars['--color-muted']})`,
    );
    expect(colors['muted-foreground']).toBe(
      `var(--color-muted-foreground, ${cssVars['--color-muted-foreground']})`,
    );
    expect(colors.ring).toBe(`var(--color-ring, ${cssVars['--color-ring']})`);
    expect(colors.destructive).toBe(
      `var(--color-destructive, ${cssVars['--color-destructive']})`,
    );
  });

  it('maps radii and typography to CSS variables', () => {
    const preset = createLumiaTailwindConfig();
    const { borderRadius, fontFamily } = (
      preset.theme as {
        extend: {
          borderRadius: Record<string, string>;
          fontFamily: Record<string, string[]>;
        };
      }
    ).extend;

    expect(borderRadius.DEFAULT).toBe(
      `var(--radius-md, ${defaultTheme.radii.md})`,
    );
    expect(borderRadius.sm).toBe(`var(--radius-sm, ${defaultTheme.radii.sm})`);
    expect(borderRadius.pill).toBe(
      `var(--radius-pill, ${defaultTheme.radii.pill})`,
    );

    expect(fontFamily.sans[0]).toBe(
      `var(--font-sans, ${defaultTheme.typography.families.sans})`,
    );
    expect(fontFamily.mono[0]).toBe(
      `var(--font-mono, ${defaultTheme.typography.families.mono})`,
    );
    expect(fontFamily.display[0]).toBe(
      `var(--font-display, ${defaultTheme.typography.families.display})`,
    );
  });
});
