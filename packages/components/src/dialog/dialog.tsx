import type {
  ComponentPropsWithoutRef,
  ElementRef,
  MutableRefObject,
} from 'react';
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../lib/utils';
import {
  getDialogOverlayBackdrop,
  resolveDialogTheme,
  type DialogTheme,
} from './dialog-theme';

export type DialogProps = DialogPrimitive.DialogProps;
export type DialogTriggerProps = DialogPrimitive.DialogTriggerProps;

const DIALOG_OVERLAY_Z_CLASS = 'z-[200]';
const DIALOG_CONTENT_Z_CLASS = 'z-[210]';

const DialogInternalContext =
  createContext<MutableRefObject<HTMLElement | null> | null>(null);

const useDialogInternalContext = (component: string) => {
  const context = useContext(DialogInternalContext);
  if (!context) {
    throw new Error(`${component} must be used within Dialog`);
  }
  return context;
};

export const Dialog = ({ children, ...props }: DialogProps) => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const { onOpenChange, ...rest } = props;

  return (
    <DialogInternalContext.Provider value={triggerRef}>
      <DialogPrimitive.Root
        {...rest}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            triggerRef.current?.focus();
          }
          onOpenChange?.(nextOpen);
        }}
      >
        {children}
      </DialogPrimitive.Root>
    </DialogInternalContext.Provider>
  );
};
export const DialogTrigger = forwardRef<
  ElementRef<typeof DialogPrimitive.Trigger>,
  DialogTriggerProps
>(function DialogTrigger(props, ref) {
  const triggerRef = useDialogInternalContext('DialogTrigger');

  return (
    <DialogPrimitive.Trigger
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      aria-controls={undefined}
      {...props}
    />
  );
});

type DialogOverlayProps = DialogPrimitive.DialogOverlayProps;

const useDialogOverlayBackdrop = () => {
  const [theme, setTheme] = useState<DialogTheme>(() =>
    resolveDialogTheme(
      typeof document === 'undefined' ? null : document.documentElement,
    ),
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const target = document.documentElement;
    const updateTheme = () => {
      setTheme(resolveDialogTheme(target));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(target, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return getDialogOverlayBackdrop(theme);
};

const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(function DialogOverlay({ className, ...props }, ref) {
  const overlayBackdrop = useDialogOverlayBackdrop();

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-lumia-dialog-overlay
      style={{ backgroundColor: overlayBackdrop }}
      className={cn(
        'fixed inset-0 backdrop-blur-sm',
        DIALOG_OVERLAY_Z_CLASS,
        className,
      )}
      {...props}
    />
  );
});

export type DialogContentProps = DialogPrimitive.DialogContentProps;

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent({ className, children, ...props }, ref) {
  useDialogInternalContext('DialogContent');

  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-lumia-dialog-content
        className={cn(
          'fixed left-1/2 top-1/2 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-5 rounded-lg border border-border bg-background p-6 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          DIALOG_CONTENT_Z_CLASS,
          className,
        )}
        aria-modal="true"
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Close dialog"
        >
          <span aria-hidden>X</span>
          <span className="sr-only">Close dialog</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export type DialogHeaderProps = ComponentPropsWithoutRef<'div'>;

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-2 text-left', className)}
        {...props}
      />
    );
  },
);

export type DialogTitleProps = DialogPrimitive.DialogTitleProps;

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-lg font-semibold leading-6', className)}
      {...props}
    />
  );
});

export type DialogDescriptionProps = DialogPrimitive.DialogDescriptionProps;

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm leading-5 text-muted-foreground', className)}
      {...props}
    />
  );
});

export type DialogFooterProps = ComponentPropsWithoutRef<'div'>;

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3',
          className,
        )}
        {...props}
      />
    );
  },
);
