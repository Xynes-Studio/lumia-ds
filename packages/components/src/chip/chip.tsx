import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';

export type ChipVariant = 'neutral' | 'accent' | 'warning';
export type ChipSize = 'sm' | 'md';

export type ChipProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'size'
> & {
  variant?: ChipVariant;
  size?: ChipSize;
  active?: boolean;
  toggle?: boolean;
  leadingIcon?: ReactNode;
  trailingContent?: ReactNode;
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';

const variantClasses: Record<ChipVariant, string> = {
  neutral:
    'border-border bg-background text-foreground hover:bg-muted data-[active=true]:border-primary data-[active=true]:text-primary',
  accent:
    'border-primary/60 bg-background text-primary hover:bg-primary/10 data-[active=true]:border-primary data-[active=true]:bg-primary/10',
  warning:
    'border-amber-400 bg-background text-amber-900 hover:bg-amber-50 data-[active=true]:border-amber-500 data-[active=true]:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-500/10 dark:data-[active=true]:bg-amber-500/20',
};

const sizeClasses: Record<ChipSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-11 px-4 text-base',
};

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  {
    className,
    children,
    variant = 'neutral',
    size = 'md',
    active = false,
    toggle = false,
    leadingIcon,
    trailingContent,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      data-lumia-chip
      data-active={active ? 'true' : 'false'}
      aria-pressed={toggle ? active : undefined}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {leadingIcon ? (
        <span
          className="inline-flex items-center justify-center"
          aria-hidden="true"
        >
          {leadingIcon}
        </span>
      ) : null}
      <span className="truncate">{children}</span>
      {trailingContent ? (
        <span className="inline-flex items-center justify-center">
          {trailingContent}
        </span>
      ) : null}
    </button>
  );
});

Chip.displayName = 'Chip';

export const chipStyles = {
  base: baseClasses,
  variants: variantClasses,
  sizes: sizeClasses,
};
