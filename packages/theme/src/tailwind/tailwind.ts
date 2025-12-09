import { defaultTheme } from '@lumia/tokens';
import * as Tokens from '@lumia/tokens';

const PRIMARY_SCALE_STOPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
] as const;
type PrimaryScaleStop = (typeof PRIMARY_SCALE_STOPS)[number];

const withFallback = (variableName: string, fallback: string) =>
  `var(${variableName}, ${fallback})`;

// Helper to get primary color fallback from the full Tokens object
// since defaultTheme might not expose the flat scale directly in the same way
const getPrimaryColorFallback = (stop: PrimaryScaleStop) => {
  const tokenKey = `ColorPrimary${stop}`;
  // @ts-expect-error - Tokens are exported as PascalCase (e.g. ColorPrimary50)
  if (Tokens && typeof Tokens[tokenKey] !== 'undefined') {
    // @ts-expect-error - Dynamic access to Tokens object
    return Tokens[tokenKey] as string;
  }
  return '#000000';
};

const createPrimaryScale = () =>
  PRIMARY_SCALE_STOPS.reduce<Record<PrimaryScaleStop, string>>(
    (scale, stop) => {
      scale[stop] = withFallback(
        `--colors-primary-${stop}`, // Updated variable name
        getPrimaryColorFallback(stop),
      );
      return scale;
    },
    {} as Record<PrimaryScaleStop, string>,
  );

const buildTailwindPreset = () => {
  const primaryScale = createPrimaryScale();

  return {
    theme: {
      extend: {
        colors: {
          primary: {
            ...primaryScale,
            DEFAULT: withFallback(
              '--colors-primary', // Updated from --color-primary
              defaultTheme.colors.primary,
            ),
          },
          secondary: withFallback(
            '--colors-secondary', // Updated from --color-secondary
            defaultTheme.colors.secondary,
          ),
          background: withFallback(
            '--colors-background', // Updated from --color-bg
            defaultTheme.colors.background,
          ),
          foreground: withFallback(
            '--colors-foreground', // Updated from --color-fg
            defaultTheme.colors.foreground,
          ),
          border: withFallback(
            '--colors-border', // Updated from --color-border
            defaultTheme.colors.border,
          ),
          muted: {
            DEFAULT: withFallback('--colors-muted', defaultTheme.colors.muted),
            foreground: withFallback(
              '--colors-mutedForeground',
              defaultTheme.colors.mutedForeground,
            ),
          },
          ring: withFallback('--colors-ring', defaultTheme.colors.ring),
          destructive: {
            DEFAULT: withFallback(
              '--colors-destructive',
              defaultTheme.colors.destructive,
            ),
            foreground: withFallback(
              '--colors-destructiveForeground',
              defaultTheme.colors.destructiveForeground,
            ),
          },
        },
        borderRadius: {
          DEFAULT: withFallback('--radii-md', defaultTheme.radii.md),
          xs: withFallback('--radii-xs', defaultTheme.radii.xs),
          sm: withFallback('--radii-sm', defaultTheme.radii.sm),
          md: withFallback('--radii-md', defaultTheme.radii.md),
          lg: withFallback('--radii-lg', defaultTheme.radii.lg),
          pill: withFallback('--radii-pill', defaultTheme.radii.pill),
          full: withFallback('--radii-pill', defaultTheme.radii.pill),
        },
        fontFamily: {
          sans: [
            withFallback(
              '--typography-families-sans',
              defaultTheme.typography.families.sans,
            ),
          ],
          mono: [
            withFallback(
              '--typography-families-mono',
              defaultTheme.typography.families.mono,
            ),
          ],
          display: [
            withFallback(
              '--typography-families-display',
              defaultTheme.typography.families.display,
            ),
          ],
        },
      },
    },
  };
};

export type LumiaTailwindPreset = ReturnType<typeof buildTailwindPreset>;

export const lumiaTailwindPreset: LumiaTailwindPreset = buildTailwindPreset();

export const createLumiaTailwindConfig = (): LumiaTailwindPreset =>
  buildTailwindPreset();
