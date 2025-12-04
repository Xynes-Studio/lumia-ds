import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '../lib/utils';

export type CardProps = HTMLAttributes<HTMLDivElement>;
export type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  actions?: ReactNode;
  icon?: ReactNode;
};
export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type CardSubtitleProps = HTMLAttributes<HTMLParagraphElement>;
export type CardDescriptionProps = CardSubtitleProps;
export type CardContentProps = HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = HTMLAttributes<HTMLDivElement> & {
  actions?: ReactNode;
};

const cardBaseClasses =
  'rounded-lg border border-border bg-background text-foreground shadow-sm overflow-hidden';
const sectionBaseClasses = 'px-6 py-4';

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn(cardBaseClasses, className)} {...props} />
  );
});

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  function CardHeader({ className, actions, icon, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start gap-4 border-b border-border/80',
          sectionBaseClasses,
          className,
        )}
        {...props}
      >
        {icon && (
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground/80">
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">{children}</div>
        {actions && (
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {actions}
          </div>
        )}
      </div>
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

export const CardSubtitle = forwardRef<HTMLParagraphElement, CardSubtitleProps>(
  function CardSubtitle({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={cn('text-sm leading-5 text-muted-foreground ', className)}
        {...props}
      />
    );
  },
);

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(function CardDescription(props, ref) {
  return <CardSubtitle ref={ref} {...props} />;
});

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  function CardContent({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cn(sectionBaseClasses, className)} {...props} />
    );
  },
);

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  function CardFooter({ className, actions, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 border-t border-border/80',
          sectionBaseClasses,
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
        {actions && (
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    );
  },
);
