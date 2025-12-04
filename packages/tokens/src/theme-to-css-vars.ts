import type { ThemeTokens } from './index';

const PRIMARY_SCALE_STOPS = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
] as const;
type PrimaryScaleStop = (typeof PRIMARY_SCALE_STOPS)[number];

const PRIMARY_SCALE_WEIGHTS: Record<PrimaryScaleStop, number> = {
  50: 0.85,
  100: 0.75,
  200: 0.6,
  300: 0.45,
  400: 0.3,
  500: 0,
  600: -0.18,
  700: -0.32,
  800: -0.45,
  900: -0.6,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalizeHex = (color: string): string | null => {
  const stripped = color.trim().replace('#', '');

  if (/^[0-9a-fA-F]{3}$/.test(stripped)) {
    return `#${stripped
      .split('')
      .map((char) => char.repeat(2))
      .join('')}`.toLowerCase();
  }

  if (/^[0-9a-fA-F]{6}$/.test(stripped)) {
    return `#${stripped.toLowerCase()}`;
  }

  return null;
};

const hexToRgb = (hex: string): [number, number, number] | null => {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;

  const value = normalized.slice(1);
  const r = parseInt(value.substring(0, 2), 16);
  const g = parseInt(value.substring(2, 4), 16);
  const b = parseInt(value.substring(4, 6), 16);

  return [r, g, b];
};

const rgbToHex = ([r, g, b]: [number, number, number]): string => {
  const toHex = (channel: number) =>
    clamp(channel, 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const blendChannel = (channel: number, target: number, ratio: number) =>
  clamp(Math.round(channel + (target - channel) * ratio), 0, 255);

const generatePrimaryScale = (
  primary: string,
): Record<PrimaryScaleStop, string> => {
  const rgb = hexToRgb(primary);
  if (!rgb) {
    return PRIMARY_SCALE_STOPS.reduce(
      (scale, stop) => ({ ...scale, [stop]: primary }),
      {} as Record<PrimaryScaleStop, string>,
    );
  }

  return PRIMARY_SCALE_STOPS.reduce(
    (scale, stop) => {
      const weight = PRIMARY_SCALE_WEIGHTS[stop];
      if (weight === 0) {
        scale[stop] = rgbToHex(rgb);
        return scale;
      }

      const ratio = clamp(Math.abs(weight), 0, 1);
      const target = weight > 0 ? 255 : 0;
      const [r, g, b] = rgb;

      scale[stop] = rgbToHex([
        blendChannel(r, target, ratio),
        blendChannel(g, target, ratio),
        blendChannel(b, target, ratio),
      ]);

      return scale;
    },
    {} as Record<PrimaryScaleStop, string>,
  );
};

export const themeToCSSVars = (theme: ThemeTokens): Record<string, string> => {
  const cssVars: Record<string, string> = {};
  const primaryScale = generatePrimaryScale(theme.colors.primary);

  PRIMARY_SCALE_STOPS.forEach((stop) => {
    cssVars[`--color-primary-${stop}`] = primaryScale[stop];
  });

  cssVars['--color-primary'] = primaryScale[500];
  cssVars['--color-secondary'] = theme.colors.secondary;
  cssVars['--color-bg'] = theme.colors.background;
  cssVars['--color-fg'] = theme.colors.foreground;
  cssVars['--color-border'] = theme.colors.border;
  cssVars['--color-muted'] = theme.colors.muted;
  cssVars['--color-muted-foreground'] = theme.colors.mutedForeground;
  cssVars['--color-ring'] = theme.colors.ring;
  cssVars['--color-destructive'] = theme.colors.destructive;
  cssVars['--font-sans'] = theme.typography.families.sans;
  cssVars['--font-mono'] = theme.typography.families.mono;
  cssVars['--font-display'] = theme.typography.families.display;
  cssVars['--radius-xs'] = theme.radii.xs;
  cssVars['--radius-sm'] = theme.radii.sm;
  cssVars['--radius-md'] = theme.radii.md;
  cssVars['--radius-lg'] = theme.radii.lg;
  cssVars['--radius-pill'] = theme.radii.pill;

  return cssVars;
};
