import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from './utils';

export type StatusPillVariant = 'success' | 'warning' | 'error' | 'info';

export type StatusPillProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: StatusPillVariant;
};

const baseClasses =
  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const variantClasses: Record<StatusPillVariant, string> = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100',
  warning:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-50',
  error:
    'border-red-200 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-50',
  info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-50',
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
