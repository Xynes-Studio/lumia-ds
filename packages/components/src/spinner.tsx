import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from './utils';

type SpinnerSize = 'sm' | 'md' | 'lg' | number;

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  size?: SpinnerSize;
};

const spinnerSizes: Record<Exclude<SpinnerSize, number>, number> = {
  sm: 16,
  md: 20,
  lg: 28,
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(
    { size = 'md', className, 'aria-label': ariaLabel = 'Loading', ...props },
    ref,
  ) {
    const resolvedSize = typeof size === 'number' ? size : spinnerSizes[size];
    const strokeWidth = Math.max(2, Math.round(resolvedSize / 7));

    return (
      <span
        ref={ref}
        role="status"
        aria-label={ariaLabel}
        aria-live="polite"
        className={cn(
          'inline-flex shrink-0 items-center justify-center text-primary',
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className="block animate-spin rounded-full border-solid border-transparent border-t-current"
          style={{
            width: resolvedSize,
            height: resolvedSize,
            borderWidth: strokeWidth,
          }}
        />
        <span className="sr-only">{ariaLabel}</span>
      </span>
    );
  },
);
