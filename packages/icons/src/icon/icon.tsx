import type { SVGProps } from 'react';
import { getIcon } from '../registry';
import { SPRITE_ICONS, type SpriteIconName } from '../sprite/types';
import type { IconColor } from './colorUtils';
import { resolveColor } from './colorUtils';
import type { IconSize } from './sizeUtils';
import { resolveSize } from './sizeUtils';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'color'> {
  /** Icon name from registry (sprite or SVGR) */
  name: string;
  /** Size preset or custom pixel value */
  size?: IconSize;
  /** Color preset or custom CSS value */
  color?: IconColor;
  /** Accessible title for screen readers */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Checks if the icon name is available in the sprite
 */
function isSpriteIcon(name: string): name is SpriteIconName {
  return (SPRITE_ICONS as readonly string[]).includes(name);
}

/**
 * Unified Icon component that abstracts sprite vs SVGR component rendering.
 *
 * - Automatically uses SVG sprite for hot-path icons (better performance)
 * - Falls back to SVGR components from the icon registry
 * - Applies consistent size and color styling
 *
 * @example
 * ```tsx
 * // Using size preset and color preset
 * <Icon name="info" size="lg" color="primary" />
 *
 * // Using custom size and custom color
 * <Icon name="check" size={20} color="#ff5500" />
 *
 * // With accessible title
 * <Icon name="alert" title="Warning" />
 * ```
 */
export function Icon({
  name,
  size = 'md',
  color = 'default',
  title,
  className,
  ...props
}: IconProps) {
  const resolvedSize = resolveSize(size);
  const { className: colorClassName, style: colorStyle } = resolveColor(color);

  // Merge classNames
  const mergedClassName = [colorClassName, className].filter(Boolean).join(' ');

  // Common props for both rendering paths
  const commonProps: SVGProps<SVGSVGElement> = {
    width: resolvedSize,
    height: resolvedSize,
    className: mergedClassName || undefined,
    style: colorStyle,
    'aria-hidden': title ? undefined : true,
    'aria-labelledby': title ? `icon-title-${name}` : undefined,
    role: title ? 'img' : undefined,
    focusable: title ? undefined : 'false',
    ...props,
  };

  // Render using sprite for hot-path icons
  if (isSpriteIcon(name)) {
    return (
      <svg {...commonProps}>
        {title && <title id={`icon-title-${name}`}>{title}</title>}
        <use href={`#icon-${name}`} />
      </svg>
    );
  }

  // Fall back to SVGR component from registry
  const IconComponent = getIcon(name);

  if (!IconComponent) {
    return null;
  }

  // For SVGR components, we wrap with accessibility if title is provided
  if (title) {
    return (
      <svg {...commonProps} viewBox="0 0 24 24">
        <title id={`icon-title-${name}`}>{title}</title>
        <IconComponent
          width="100%"
          height="100%"
          aria-hidden
          style={{ display: 'block' }}
        />
      </svg>
    );
  }

  return <IconComponent {...commonProps} />;
}
