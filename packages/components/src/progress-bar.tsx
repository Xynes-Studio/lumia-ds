import type { HTMLAttributes } from 'react';
import { forwardRef, useMemo } from 'react';
import { cn } from './utils';

export type ProgressBarProps = Omit<HTMLAttributes<HTMLDivElement>, 'value'> & {
  value: number;
  indeterminate?: boolean;
};

const clampValue = (value: number) => Math.min(100, Math.max(0, value));

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    { value, indeterminate = false, className, ...props },
    ref,
  ) {
    const clampedValue = useMemo(() => clampValue(value), [value]);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : clampedValue}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-muted',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full bg-primary transition-[width] duration-300 ease-out',
            indeterminate && 'w-1/2 animate-pulse',
          )}
          style={{
            width: indeterminate ? undefined : `${clampedValue}%`,
          }}
        />
      </div>
    );
  },
);
