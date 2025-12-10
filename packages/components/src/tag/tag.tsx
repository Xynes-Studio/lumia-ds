import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';

export type TagVariant = 'default' | 'success' | 'warning' | 'error';

export type TagProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  label: string;
  onRemove?: () => void;
  variant?: TagVariant;
};

const baseClasses =
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium leading-5';

const variantClasses: Record<TagVariant, string> = {
  default: 'bg-muted text-foreground border-border',
  success:
    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:border-emerald-500/40',
  warning:
    'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-500/10 dark:text-amber-50 dark:border-amber-500/40',
  error:
    'bg-red-50 text-red-900 border-red-200 dark:bg-red-500/10 dark:text-red-50 dark:border-red-500/40',
};

const removeButtonClasses =
  'ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-current opacity-80 transition hover:bg-black/5 dark:hover:bg-white/15 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const labelClasses = 'max-w-[160px] truncate';

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { label, onRemove, variant = 'default', className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-lumia-tag
      data-variant={variant}
      className={cn(
        baseClasses,
        variantClasses[variant],
        onRemove && 'pr-1',
        className,
      )}
      {...props}
    >
      <span className={labelClasses} title={label}>
        {label}
      </span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove tag ${label}`}
          className={removeButtonClasses}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M4 4l8 8M12 4l-8 8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ) : null}
    </span>
  );
});

export const tagStyles = {
  base: baseClasses,
  variants: variantClasses,
  label: labelClasses,
  removeButton: removeButtonClasses,
};
