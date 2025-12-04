import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const baseButtonClasses =
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-secondary hover:bg-primary-700 active:bg-primary-800',
  secondary:
    'bg-secondary text-foreground border border-border hover:bg-secondary/80 active:bg-secondary',
  outline: 'bg-background border border-border text-foreground hover:bg-muted',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive',
  link: 'bg-transparent text-primary underline underline-offset-4 hover:text-primary-700 focus-visible:underline',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
  icon: 'h-10 w-10 p-0',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      type = 'button',
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseButtonClasses,
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

export const buttonStyles = {
  base: baseButtonClasses,
  variants: variantClasses,
  sizes: sizeClasses,
};
