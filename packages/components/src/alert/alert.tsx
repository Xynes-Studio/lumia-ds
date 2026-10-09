import type { HTMLAttributes } from 'react';
import { forwardRef, useMemo, useState } from 'react';
import { Icon, type IconId } from '@lumia-ui/icons';
import { cn } from '../lib/utils';
import { interactiveCursor } from '../lib/interactive-styles';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

type VariantStyles = {
  container: string;
  iconWrapper: string;
  title: string;
  description: string;
};

const baseClasses =
  'relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3';

const variantStyles: Record<AlertVariant, VariantStyles> = {
  info: {
    container:
      'border-[color:var(--colors-status-info-border,#93c5fd)] bg-[color:var(--colors-status-info-surface,#eff6ff)] text-[color:var(--colors-status-info-foreground,#1e40af)]',
    iconWrapper: 'text-current',
    title: 'text-current',
    description: 'text-current',
  },
  success: {
    container:
      'border-[color:var(--colors-status-success-border,#6ee7b7)] bg-[color:var(--colors-status-success-surface,#ecfdf5)] text-[color:var(--colors-status-success-foreground,#065f46)]',
    iconWrapper: 'text-current',
    title: 'text-current',
    description: 'text-current',
  },
  warning: {
    container:
      'border-[color:var(--colors-status-warning-border,#fcd34d)] bg-[color:var(--colors-status-warning-surface,#fffbeb)] text-[color:var(--colors-status-warning-foreground,#92400e)]',
    iconWrapper: 'text-current',
    title: 'text-current',
    description: 'text-current',
  },
  error: {
    container:
      'border-[color:var(--colors-status-error-border,#fca5a5)] bg-[color:var(--colors-status-error-surface,#fef2f2)] text-[color:var(--colors-status-error-foreground,#991b1b)]',
    iconWrapper: 'text-current',
    title: 'text-current',
    description: 'text-current',
  },
};

const variantIcons: Record<AlertVariant, IconId> = {
  info: 'info',
  success: 'check',
  warning: 'alert',
  error: 'alert',
};

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  icon?: IconId;
  closable?: boolean;
  /**
   * Controlled visibility. When provided, pair with `onOpenChange`.
   */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  closeButtonLabel?: string;
  showIcon?: boolean;
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    variant = 'info',
    title,
    description,
    icon,
    className,
    closable = false,
    open: openProp,
    defaultOpen = true,
    onOpenChange,
    onClose,
    closeButtonLabel = 'Dismiss alert',
    showIcon = true,
    role: roleProp,
    children,
    ...props
  },
  ref,
) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;

  const resolvedRole = useMemo(
    () =>
      roleProp ??
      (variant === 'warning' || variant === 'error' ? 'alert' : 'status'),
    [roleProp, variant],
  );

  const ariaLive = resolvedRole === 'alert' ? 'assertive' : 'polite';

  const handleClose = () => {
    if (!open) return;

    onClose?.();
    if (!isControlled) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
  };

  if (!open) {
    return null;
  }

  const {
    container,
    iconWrapper,
    title: titleClass,
    description: descriptionClass,
  } = variantStyles[variant];
  const resolvedIcon = icon ?? variantIcons[variant];

  return (
    <div
      ref={ref}
      role={resolvedRole}
      aria-live={ariaLive}
      data-lumia-alert
      data-variant={variant}
      className={cn(baseClasses, container, closable && 'pr-12', className)}
      {...props}
    >
      {showIcon && resolvedIcon ? (
        <span
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center',
            iconWrapper,
          )}
        >
          <Icon
            name={resolvedIcon}
            size={20}
            aria-hidden="true"
            color="currentColor"
            className="fill-none"
          />
        </span>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title ? (
          <p className={cn('text-sm font-semibold leading-6', titleClass)}>
            {title}
          </p>
        ) : null}
        {description ? (
          <p className={cn('text-sm leading-6', descriptionClass)}>
            {description}
          </p>
        ) : null}
        {children}
      </div>

      {closable ? (
        <button
          type="button"
          onClick={handleClose}
          aria-label={closeButtonLabel}
          className={`absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-current transition-colors hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${interactiveCursor}`}
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
        </button>
      ) : null}
    </div>
  );
});

export const InlineAlert = Alert;
