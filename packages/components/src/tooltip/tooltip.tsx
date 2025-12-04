import type { ElementRef } from 'react';
import { forwardRef } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../lib/utils';

export type TooltipProviderProps = TooltipPrimitive.TooltipProviderProps;

export const TooltipProvider = ({
  delayDuration = 150,
  disableHoverableContent = true,
  ...props
}: TooltipProviderProps) => (
  <TooltipPrimitive.Provider
    delayDuration={delayDuration}
    disableHoverableContent={disableHoverableContent}
    {...props}
  />
);

export const Tooltip = TooltipPrimitive.Root;

export type TooltipTriggerProps = TooltipPrimitive.TooltipTriggerProps;

export const TooltipTrigger = forwardRef<
  ElementRef<typeof TooltipPrimitive.Trigger>,
  TooltipTriggerProps
>(function TooltipTrigger({ asChild = true, ...props }, ref) {
  return <TooltipPrimitive.Trigger ref={ref} asChild={asChild} {...props} />;
});

export type TooltipContentProps = TooltipPrimitive.TooltipContentProps;

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(function TooltipContent(
  { className, sideOffset = 8, children, ...props },
  ref,
) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        data-lumia-tooltip-content
        role="tooltip"
        className={cn(
          'z-50 max-w-xs rounded-md bg-foreground px-3 py-2 text-xs font-medium leading-4 text-background shadow-lg outline-none transition-[opacity,transform] duration-150',
          'data-[state=delayed-open]:opacity-100 data-[state=delayed-open]:scale-100 data-[state=closed]:pointer-events-none data-[state=closed]:scale-95 data-[state=closed]:opacity-0',
          'data-[side=top]:-translate-y-1 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1',
          'data-[state=delayed-open]:translate-x-0 data-[state=delayed-open]:translate-y-0',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className="fill-foreground"
          width={10}
          height={5}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});
