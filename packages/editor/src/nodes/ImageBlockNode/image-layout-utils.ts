import { CSSProperties } from 'react';

export function getImageLayoutClass(
  layout: 'inline' | 'breakout' | 'fullWidth' | undefined,
): string {
  if (!layout) return '';
  return `layout-${layout}`;
}

export function getImageContainerStyle(
  layout: 'inline' | 'breakout' | 'fullWidth' | undefined,
  width: number | undefined,
): CSSProperties {
  if (layout === 'fullWidth') return { width: '100%' };
  if (width) return { width: `${width}%` };
  return {};
}
