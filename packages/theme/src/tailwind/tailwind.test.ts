import { describe, it, expect } from 'vitest';
import { defaultTheme, themeToCSSVars } from '@lumia-ui/tokens';
import * as Tokens from '@lumia-ui/tokens';
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
      `var(--colors-primary-500, ${Tokens.ColorPrimary500})`, // Manual fallback check
    );
    expect((colors.primary as Record<string, string>).DEFAULT).toBe(
      `var(--colors-primary, ${cssVars['--colors-primary']})`,
    );
    expect(colors.secondary).toBe(
      `var(--colors-secondary, ${cssVars['--colors-secondary']})`,
    );
    expect(colors.background).toBe(
      `var(--colors-background, ${cssVars['--colors-background']})`,
    );
    expect(colors.foreground).toBe(
      `var(--colors-foreground, ${cssVars['--colors-foreground']})`,
    );
    expect(colors.border).toBe(
      `var(--colors-border, ${cssVars['--colors-border']})`,
    );

    // Muted is strictly an object now in our implementation
    const muted = colors.muted as { DEFAULT: string; foreground: string };
    expect(muted.DEFAULT).toBe(
      `var(--colors-muted, ${cssVars['--colors-muted']})`,
    );
    expect(muted.foreground).toBe(
      `var(--colors-mutedForeground, ${cssVars['--colors-mutedForeground']})`,
    );

    expect(colors.ring).toBe(`var(--colors-ring, ${cssVars['--colors-ring']})`);

    // Destructive is strictly an object now
    const destructive = colors.destructive as {
      DEFAULT: string;
      foreground: string;
    };
    expect(destructive.DEFAULT).toBe(
      `var(--colors-destructive, ${cssVars['--colors-destructive']})`,
    );
    expect(destructive.foreground).toBe(
      `var(--colors-destructiveForeground, ${cssVars['--colors-destructiveForeground']})`,
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
      `var(--radii-md, ${defaultTheme.radii.md})`,
    );
    expect(borderRadius.sm).toBe(`var(--radii-sm, ${defaultTheme.radii.sm})`);
    expect(borderRadius.pill).toBe(
      `var(--radii-pill, ${defaultTheme.radii.pill})`,
    );

    expect(fontFamily.sans[0]).toBe(
      `var(--typography-families-sans, ${defaultTheme.typography.families.sans})`,
    );
    expect(fontFamily.mono[0]).toBe(
      `var(--typography-families-mono, ${defaultTheme.typography.families.mono})`,
    );
    expect(fontFamily.display[0]).toBe(
      `var(--typography-families-display, ${defaultTheme.typography.families.display})`,
    );
  });
});
