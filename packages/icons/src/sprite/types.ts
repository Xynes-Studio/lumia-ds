/**
 * Core sprite icons configuration
 * These are the hot-path icons included in the SVG sprite
 */
export const SPRITE_ICONS = [
  'chevron-down',
  'chevron-up',
  'check',
  'add',
  'edit',
  'delete',
  'info',
  'alert',
  'search',
] as const;

export type SpriteIconName = (typeof SPRITE_ICONS)[number];
