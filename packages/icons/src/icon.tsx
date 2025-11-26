import type { SVGProps } from 'react';
import { getIcon } from './registry';
import type { IconId } from './types';

export type IconProps = Omit<SVGProps<SVGSVGElement>, 'id'> & {
  id: IconId;
  size?: number;
  className?: string;
};

export function Icon({ id, size = 24, className, ...props }: IconProps) {
  const IconFromRegistry = getIcon(id);

  if (!IconFromRegistry) {
    return null;
  }

  const mergedClassName = className
    ? `fill-current ${className}`.trim()
    : 'fill-current';

  const dimensions = { width: size, height: size };

  return (
    <IconFromRegistry {...dimensions} className={mergedClassName} {...props} />
  );
}
