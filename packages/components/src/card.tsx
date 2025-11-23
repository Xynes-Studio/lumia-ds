import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from './utils';

export type CardProps = HTMLAttributes<HTMLDivElement>;
export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;
export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
export type CardContentProps = HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

const cardBaseClasses =
  'rounded-lg border border-border bg-background text-foreground shadow-sm overflow-hidden';
const sectionBaseClasses = 'px-6 py-4';

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(cardBaseClasses, className)}
      {...props}
    />
  );
});

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-2 border-b border-border/80 pb-3',
          sectionBaseClasses,
          className,
        )}
        {...props}
      />
    );
  },
);

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cn(
          'text-lg font-semibold leading-6 tracking-tight',
          className,
        )}
        {...props}
      />
    );
  },
);

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cn('text-sm leading-5 text-muted', className)}
      {...props}
    />
  );
});

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(sectionBaseClasses, className)}
        {...props}
      />
    );
  },
);

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 border-t border-border/80',
          sectionBaseClasses,
          className,
        )}
        {...props}
      />
    );
  },
);
