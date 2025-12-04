import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';

export type BadgeVariant = 'default' | 'outline' | 'subtle';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const baseClasses =
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'border-primary-700 bg-primary text-secondary shadow-sm hover:bg-primary-700/90',
  outline: 'border-border bg-background text-foreground hover:bg-muted',
  subtle: 'border-transparent bg-muted text-foreground',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = 'default', children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-lumia-badge
      data-variant={variant}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
});

export const badgeStyles = {
  base: baseClasses,
  variants: variantClasses,
};
