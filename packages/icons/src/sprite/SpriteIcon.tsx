import type { SVGProps } from 'react';
import type { SpriteIconName } from './types';

export interface SpriteIconProps extends SVGProps<SVGSVGElement> {
  /** The name of the icon from the sprite */
  name: SpriteIconName;
  /** Icon size in pixels (applies to both width and height) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SpriteIcon renders an icon using SVG `<use>` element referencing a symbol
 * from the sprite. This is more efficient than inline SVGs for hot-path icons.
 *
 * @example
 * ```tsx
 * <SpriteIcon name="chevron-down" size={24} className="text-primary" />
 * ```
 */
export function SpriteIcon({
  name,
  size = 24,
  className,
  ...props
}: SpriteIconProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <use href={`#icon-${name}`} />
    </svg>
  );
}
