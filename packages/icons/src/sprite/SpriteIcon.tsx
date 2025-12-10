import type { SVGProps } from 'react';
import type { SpriteIconName } from './types';

export interface SpriteIconProps extends SVGProps<SVGSVGElement> {
  /** The name of the icon from the sprite */
  name: SpriteIconName;
  /** Icon size in pixels (applies to both width and height) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Accessible title for informative icons (omit for decorative icons) */
  title?: string;
}

/**
 * SpriteIcon renders an icon using SVG `<use>` element referencing a symbol
 * from the sprite. This is more efficient than inline SVGs for hot-path icons.
 *
 * @example
 * ```tsx
 * // Decorative icon (default)
 * <SpriteIcon name="chevron-down" size={24} className="text-primary" />
 *
 * // Informative icon with accessible title
 * <SpriteIcon name="alert" size={24} title="Warning" />
 * ```
 */
export function SpriteIcon({
  name,
  size = 24,
  className,
  title,
  ...props
}: SpriteIconProps) {
  const titleId = title ? `sprite-icon-title-${name}` : undefined;

  return (
    <svg
      width={size}
      height={size}
      className={className}
      aria-hidden={title ? undefined : true}
      aria-labelledby={titleId}
      role={title ? 'img' : undefined}
      focusable={title ? undefined : 'false'}
      {...props}
    >
      {title && <title id={titleId}>{title}</title>}
      <use href={`#icon-${name}`} />
    </svg>
  );
}
