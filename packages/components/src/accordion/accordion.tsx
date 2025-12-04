import type { ComponentPropsWithoutRef, ElementRef } from 'react';
import { forwardRef } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '../lib/utils';

export type AccordionProps = Omit<
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>,
  'type'
> & {
  type?: 'single' | 'multiple';
};

export const Accordion = ({
  className,
  type = 'single',
  ...props
}: AccordionProps) => (
  <AccordionPrimitive.Root
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type={type as any}
    className={cn(
      'w-full divide-y divide-border rounded-lg border border-border bg-background',
      className,
    )}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {...(props as any)}
  />
);

export type AccordionItemProps = AccordionPrimitive.AccordionItemProps;

export const AccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(function AccordionItem({ className, ...props }, ref) {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn('group outline-none focus-within:relative', className)}
      {...props}
    />
  );
});

export type AccordionTriggerProps = AccordionPrimitive.AccordionTriggerProps &
  ComponentPropsWithoutRef<'button'>;

export const AccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(function AccordionTrigger({ className, children, onKeyDown, ...props }, ref) {
  const handleKeyDown: AccordionTriggerProps['onKeyDown'] = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        data-lumia-accordion-trigger
        className={cn(
          'group flex flex-1 items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors',
          'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'data-[state=open]:text-foreground data-[state=closed]:text-muted-foreground ',
          className,
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span className="flex-1 text-left">{children}</span>
        <Chevron
          className="text-muted-foreground  transition-transform duration-200 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

export type AccordionContentProps = AccordionPrimitive.AccordionContentProps;

export const AccordionContent = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      data-lumia-accordion-content
      className={cn(
        'grid overflow-hidden px-4 text-sm text-muted-foreground  transition-[grid-template-rows,opacity] duration-200 ease-out',
        'data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100',
        'data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0',
        className,
      )}
      {...props}
    >
      <div className="overflow-hidden py-2 leading-6">{children}</div>
    </AccordionPrimitive.Content>
  );
});

type ChevronProps = ComponentPropsWithoutRef<'svg'>;

const Chevron = ({ className, ...props }: ChevronProps) => (
  <svg
    viewBox="0 0 24 24"
    role="presentation"
    className={cn('h-4 w-4 shrink-0', className)}
    {...props}
  >
    <path
      d="M6 9.5 12 15l6-5.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
