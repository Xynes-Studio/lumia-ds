import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';

type SkeletonRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  width?: number | string;
  height?: number | string;
  rounded?: SkeletonRounded;
};

const roundedClasses: Record<SkeletonRounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

const resolveSize = (value?: number | string) => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  function Skeleton(
    { width, height, rounded = 'md', className, style, ...props },
    ref,
  ) {
    const resolvedWidth = resolveSize(width) ?? style?.width ?? '100%';
    const resolvedHeight = resolveSize(height) ?? style?.height ?? '16px';

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-muted',
          roundedClasses[rounded],
          className,
        )}
        style={{
          ...style,
          width: resolvedWidth,
          height: resolvedHeight,
        }}
        aria-hidden={
          props['aria-label'] ? undefined : (props['aria-hidden'] ?? true)
        }
        {...props}
      />
    );
  },
);
