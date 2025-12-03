import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from './utils';

export type ToastVariant = 'default' | 'success' | 'warning' | 'error';

export type ToastAction = {
  label: string;
  onClick?: () => void;
  altText?: string;
};

export type ToastOptions = {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  action?: ToastAction;
  duration?: number;
};

type ToastRecord = ToastOptions & { id: string; variant: ToastVariant };

const ToastContext = createContext<{
  show: (toast: ToastOptions) => string;
  dismiss: (id: string) => void;
} | null>(null);

const generateToastId = () =>
  (globalThis.crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2, 10)) +
  Math.random().toString(36).slice(2, 6);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export type ToastProviderProps = ToastPrimitive.ToastProviderProps & {
  children: ReactNode;
  maxVisible?: number;
};

const variantStyles: Record<ToastVariant, string> = {
  default: 'border-border bg-background text-foreground',
  success: 'border-green-200 bg-green-50 text-green-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-destructive/60 bg-destructive/10 text-destructive',
};

const variantAccent: Record<ToastVariant, string> = {
  default: 'before:bg-primary-500',
  success: 'before:bg-green-500',
  warning: 'before:bg-amber-500',
  error: 'before:bg-destructive',
};

const toastRole: Record<ToastVariant, 'status' | 'alert'> = {
  default: 'status',
  success: 'status',
  warning: 'alert',
  error: 'alert',
};

export const ToastViewport = ({
  className,
  ...props
}: ToastPrimitive.ToastViewportProps) => (
  <ToastPrimitive.Viewport
    className={cn(
      'fixed right-0 top-0 z-[100] flex w-full max-w-[440px] flex-col gap-3 p-4 sm:right-4 sm:top-4',
      className,
    )}
    {...props}
  />
);

export const ToastProvider = ({
  children,
  duration = 5000,
  maxVisible = 3,
  label = 'Notifications',
  ...providerProps
}: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((existing) => existing.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    ({ id: incomingId, variant = 'default', ...toast }: ToastOptions) => {
      const id = incomingId ?? generateToastId();
      setToasts((existing) => {
        const next = [...existing, { ...toast, id, variant }];
        return next.slice(-maxVisible);
      });
      return id;
    },
    [maxVisible],
  );

  const contextValue = useMemo(
    () => ({
      show,
      dismiss,
    }),
    [show, dismiss],
  );

  const renderAction = (toast: ToastRecord) => {
    if (!toast.action) return null;

    return (
      <ToastPrimitive.Action
        asChild
        altText={toast.action.altText ?? toast.action.label}
      >
        <button
          type="button"
          className="inline-flex h-8 items-center rounded-md bg-transparent px-3 text-sm font-medium text-primary transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => toast.action?.onClick?.()}
        >
          {toast.action.label}
        </button>
      </ToastPrimitive.Action>
    );
  };

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastPrimitive.Provider
        duration={duration}
        label={label}
        swipeDirection="right"
        {...providerProps}
      >
        {children}
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            data-lumia-toast
            key={toast.id}
            className={cn(
              'group relative grid w-full max-w-[440px] gap-2 overflow-hidden rounded-lg border px-4 py-3 shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-[""]',
              variantStyles[toast.variant],
              variantAccent[toast.variant],
            )}
            duration={toast.duration ?? duration}
            onOpenChange={(open) => {
              if (!open) {
                dismiss(toast.id);
              }
            }}
            role={toastRole[toast.variant]}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1">
                <ToastPrimitive.Title className="text-sm font-semibold leading-5">
                  {toast.title}
                </ToastPrimitive.Title>
                {toast.description ? (
                  <ToastPrimitive.Description className="text-sm leading-5 text-foreground/80">
                    {toast.description}
                  </ToastPrimitive.Description>
                ) : null}
              </div>
              <ToastPrimitive.Close
                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/60 transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Dismiss notification"
              >
                <span aria-hidden>X</span>
              </ToastPrimitive.Close>
            </div>
            {toast.action ? (
              <div className="flex gap-2">
                {renderAction(toast)}
                <div className="flex-1" />
              </div>
            ) : null}
          </ToastPrimitive.Root>
        ))}
        <ToastViewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};

export type ToastRootProps = ComponentPropsWithoutRef<
  typeof ToastPrimitive.Root
>;
