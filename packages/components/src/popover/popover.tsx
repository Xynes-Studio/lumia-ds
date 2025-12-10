import type { ElementRef, MutableRefObject } from 'react';
import { createContext, forwardRef, useContext, useRef, useState } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../lib/utils';

type PopoverInternalContextValue = {
  open: boolean;
  triggerRef: MutableRefObject<HTMLElement | null>;
};

const PopoverInternalContext =
  createContext<PopoverInternalContextValue | null>(null);

const usePopoverInternalContext = (component: string) => {
  const context = useContext(PopoverInternalContext);
  if (!context) {
    throw new Error(`${component} must be used within Popover`);
  }
  return context;
};

export type PopoverProps = PopoverPrimitive.PopoverProps;

export const Popover = ({
  children,
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: PopoverProps) => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    defaultOpen ?? false,
  );
  const isControlled = openProp !== undefined;
  const open = (isControlled ? openProp : uncontrolledOpen) ?? false;

  return (
    <PopoverInternalContext.Provider value={{ open, triggerRef }}>
      <PopoverPrimitive.Root
        {...props}
        open={openProp}
        defaultOpen={defaultOpen}
        onOpenChange={(nextOpen) => {
          if (!isControlled) {
            setUncontrolledOpen(nextOpen);
          }

          if (!nextOpen) {
            triggerRef.current?.focus();
          }

          onOpenChange?.(nextOpen);
        }}
      >
        {children}
      </PopoverPrimitive.Root>
    </PopoverInternalContext.Provider>
  );
};

export type PopoverTriggerProps = PopoverPrimitive.PopoverTriggerProps;

export const PopoverTrigger = forwardRef<
  ElementRef<typeof PopoverPrimitive.Trigger>,
  PopoverTriggerProps
>(function PopoverTrigger(
  { asChild = true, 'aria-haspopup': ariaHasPopup, ...props },
  ref,
) {
  const { open, triggerRef } = usePopoverInternalContext('PopoverTrigger');

  return (
    <PopoverPrimitive.Trigger
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      asChild={asChild}
      aria-haspopup={ariaHasPopup ?? 'dialog'}
      aria-expanded={open}
      aria-controls={undefined}
      {...props}
    />
  );
});

export type PopoverContentProps = PopoverPrimitive.PopoverContentProps;

export const PopoverContent = forwardRef<
  ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(function PopoverContent({ className, sideOffset = 8, ...props }, ref) {
  usePopoverInternalContext('PopoverContent');

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        data-lumia-popover-content
        className={cn(
          'z-50 w-72 rounded-lg border border-border bg-background p-4 text-foreground shadow-lg outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=right]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2',
          'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
