/**
 * Size mapping utilities for the unified Icon component
 */

export const SIZE_MAP = {
  sm: 16,
  md: 24,
  lg: 32,
} as const;

export type IconSizePreset = keyof typeof SIZE_MAP;
export type IconSize = IconSizePreset | number;

/**
 * Resolves a size preset or custom number to pixel value
 */
export function resolveSize(size: IconSize): number {
  if (typeof size === 'number') {
    return size;
  }
  return SIZE_MAP[size];
}
