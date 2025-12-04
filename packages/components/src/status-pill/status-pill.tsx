import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';

export type StatusPillVariant = 'success' | 'warning' | 'error' | 'info';

export type StatusPillProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: StatusPillVariant;
};

const baseClasses =
  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const variantClasses: Record<StatusPillVariant, string> = {
  success:
    'border-emerald-200 bg-emerald-100 text-foreground dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-foreground',
  warning:
    'border-amber-200 bg-amber-100 text-foreground dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-foreground',
  error:
    'border-red-200 bg-red-100 text-foreground dark:border-red-500/40 dark:bg-red-500/10 dark:text-foreground',
  info: 'border-blue-200 bg-blue-100 text-foreground dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-foreground',
};

export const StatusPill = forwardRef<HTMLSpanElement, StatusPillProps>(
  function StatusPill(
    { className, variant = 'info', children, ...props },
    ref,
  ) {
    return (
      <span
        ref={ref}
        data-lumia-status-pill
        data-variant={variant}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  },
);

export const statusPillStyles = {
  base: baseClasses,
  variants: variantClasses,
};
