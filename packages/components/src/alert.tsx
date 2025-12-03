import type { HTMLAttributes } from 'react';
import { forwardRef, useMemo, useState } from 'react';
import { Icon, type IconId } from '@lumia/icons';
import { cn } from './utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

type VariantStyles = {
  container: string;
  iconWrapper: string;
  icon: string;
  title: string;
  description: string;
};

const baseClasses =
  'relative w-full rounded-lg border px-4 py-3 text-sm shadow-sm flex items-start gap-3';

const variantStyles: Record<AlertVariant, VariantStyles> = {
  info: {
    container: 'border-blue-200/80 bg-blue-50 text-blue-900',
    iconWrapper: 'bg-blue-100 text-blue-700',
    icon: 'text-blue-700',
    title: 'text-blue-900',
    description: 'text-blue-800',
  },
  success: {
    container: 'border-emerald-200/80 bg-emerald-50 text-emerald-900',
    iconWrapper: 'bg-emerald-100 text-emerald-700',
    icon: 'text-emerald-700',
    title: 'text-emerald-900',
    description: 'text-emerald-800',
  },
  warning: {
    container: 'border-amber-200/80 bg-amber-50 text-amber-900',
    iconWrapper: 'bg-amber-100 text-amber-700',
    icon: 'text-amber-700',
    title: 'text-amber-900',
    description: 'text-amber-800',
  },
  error: {
    container: 'border-red-200/80 bg-red-50 text-red-900',
    iconWrapper: 'bg-red-100 text-red-700',
    icon: 'text-red-700',
    title: 'text-red-900',
    description: 'text-red-800',
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
    icon: iconClass,
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
            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/70',
            iconWrapper,
          )}
        >
          <Icon
            id={resolvedIcon}
            size={20}
            aria-hidden="true"
            className={cn('fill-none', iconClass)}
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
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-current/80 transition-colors hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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
