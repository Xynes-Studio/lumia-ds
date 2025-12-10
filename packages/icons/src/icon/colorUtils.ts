import type { CSSProperties } from 'react';

/**
 * Color mapping utilities for the unified Icon component
 */

export const COLOR_MAP = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
  danger: 'text-destructive',
} as const;

export type IconColorPreset = keyof typeof COLOR_MAP;
export type IconColor = IconColorPreset | string;

export interface ResolvedColor {
  className?: string;
  style?: CSSProperties;
}

/**
 * Checks if a color value is a preset color name
 */
export function isColorPreset(color: string): color is IconColorPreset {
  return color in COLOR_MAP;
}

/**
 * Resolves a color preset or custom string to className/style
 * - Preset colors return a className
 * - Custom strings (hex, rgb, etc.) return an inline style
 */
export function resolveColor(color: IconColor): ResolvedColor {
  if (isColorPreset(color)) {
    return { className: COLOR_MAP[color] };
  }
  // Custom color - apply as inline style
  return { style: { color } };
}
