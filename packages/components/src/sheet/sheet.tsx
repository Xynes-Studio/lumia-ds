import type {
  ComponentPropsWithoutRef,
  ElementRef,
  MutableRefObject,
} from 'react';
import { createContext, forwardRef, useContext, useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../lib/utils';

type SheetInternalContextValue = {
  triggerRef: MutableRefObject<HTMLElement | null>;
  closeOnOverlayClick: boolean;
};

const SheetInternalContext = createContext<SheetInternalContextValue | null>(
  null,
);

const useSheetInternalContext = (component: string) => {
  const context = useContext(SheetInternalContext);
  if (!context) {
    throw new Error(`${component} must be used within Sheet`);
  }
  return context;
};

export type SheetProps = DialogPrimitive.DialogProps & {
  closeOnOverlayClick?: boolean;
};

export type SheetTriggerProps = DialogPrimitive.DialogTriggerProps;

export const Sheet = ({
  children,
  onOpenChange,
  closeOnOverlayClick = true,
  ...props
}: SheetProps) => {
  const triggerRef = useRef<HTMLElement | null>(null);

  return (
    <SheetInternalContext.Provider value={{ triggerRef, closeOnOverlayClick }}>
      <DialogPrimitive.Root
        {...props}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            triggerRef.current?.focus();
          }
          onOpenChange?.(nextOpen);
        }}
      >
        {children}
      </DialogPrimitive.Root>
    </SheetInternalContext.Provider>
  );
};

export const SheetTrigger = forwardRef<
  ElementRef<typeof DialogPrimitive.Trigger>,
  SheetTriggerProps
>(function SheetTrigger(props, ref) {
  const { triggerRef } = useSheetInternalContext('SheetTrigger');

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

type SheetOverlayProps = DialogPrimitive.DialogOverlayProps;

const SheetOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  SheetOverlayProps
>(function SheetOverlay({ className, ...props }, ref) {
  const { closeOnOverlayClick } = useSheetInternalContext('SheetOverlay');

  const overlay = (
    <DialogPrimitive.Overlay
      ref={ref}
      data-lumia-sheet-overlay
      className={cn(
        'fixed inset-0 z-40 bg-foreground/60 backdrop-blur-sm transition-opacity data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
        className,
      )}
      {...props}
    />
  );

  if (!closeOnOverlayClick) {
    return overlay;
  }

  return <DialogPrimitive.Close asChild>{overlay}</DialogPrimitive.Close>;
});

type SheetSide = 'top' | 'right' | 'bottom' | 'left';

export type SheetContentProps = DialogPrimitive.DialogContentProps & {
  side?: SheetSide;
};

const sideClasses: Record<SheetSide, string> = {
  right:
    'right-0 top-0 h-full w-[min(90vw,26rem)] translate-x-full data-[state=open]:translate-x-0 rounded-l-lg',
  left: 'left-0 top-0 h-full w-[min(90vw,26rem)] -translate-x-full data-[state=open]:translate-x-0 rounded-r-lg',
  top: 'left-1/2 top-0 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-full data-[state=open]:translate-y-0 rounded-b-lg',
  bottom:
    'left-1/2 bottom-0 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 translate-y-full data-[state=open]:translate-y-0 rounded-t-lg',
};

export const SheetContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(function SheetContent(
  { className, children, side = 'right', ...props },
  ref,
) {
  useSheetInternalContext('SheetContent');

  return (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-lumia-sheet-content
        data-lumia-sheet-side={side}
        className={cn(
          'fixed z-50 grid gap-5 border border-border bg-background p-6 shadow-lg transition-transform duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          sideClasses[side],
          className,
        )}
        aria-modal="true"
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Close sheet"
        >
          <span aria-hidden>X</span>
          <span className="sr-only">Close sheet</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export type SheetHeaderProps = ComponentPropsWithoutRef<'div'>;

export const SheetHeader = forwardRef<HTMLDivElement, SheetHeaderProps>(
  function SheetHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-2 text-left', className)}
        {...props}
      />
    );
  },
);

export type SheetTitleProps = DialogPrimitive.DialogTitleProps;

export const SheetTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  SheetTitleProps
>(function SheetTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-lg font-semibold leading-6', className)}
      {...props}
    />
  );
});

export type SheetDescriptionProps = DialogPrimitive.DialogDescriptionProps;

export const SheetDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  SheetDescriptionProps
>(function SheetDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm leading-5 text-muted-foreground ', className)}
      {...props}
    />
  );
});

export type SheetFooterProps = ComponentPropsWithoutRef<'div'>;

export const SheetFooter = forwardRef<HTMLDivElement, SheetFooterProps>(
  function SheetFooter({ className, ...props }, ref) {
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
